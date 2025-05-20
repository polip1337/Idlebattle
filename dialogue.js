// dialogue.js
import { openTab } from './navigation.js';
import { hero,allItemsCache } from './initialize.js';
import { questSystem } from './questSystem.js';
import { openTradeModal } from './tradeModal.js';
import { setCurrentMap } from './map.js';
import  Item from './item.js';

export async function initializeDialogue() {
    const dialogueModal = document.getElementById('dialogue-modal');
    const npcPortrait = document.getElementById('npc-portrait-img');
    const npcName = document.getElementById('npc-name');
    const dialogueText = document.getElementById('dialogue-text');
    const optionButtons = [
        document.getElementById('option-1'),
        document.getElementById('option-2'),
        document.getElementById('option-3'),
        document.getElementById('option-4'),
        document.getElementById('option-5'),
        document.getElementById('option-6'),
        document.getElementById('option-7'),
        document.getElementById('option-8')
    ];
    const tradeButton = document.getElementById('trade-button');

    let currentDialogue = null;
    let currentNode = null;
    let currentNPCData = null; // Store the NPC's own data from their .js file
    let resolveDialoguePromise = null; // For making startDialogue awaitable

    // Load NPC and dialogue data
    async function loadDialogueData(npcId, dialogueFileId) {
        try {
            const npcModule = await import(`./Data/NPCs/${npcId}/${npcId}.js`);
            const dialogueModule = await import(`./Data/NPCs/${npcId}/${dialogueFileId}.js`);

            currentNPCData = npcModule.default; // Store the NPC's own data

            return { // This object is what `currentDialogue` will hold
                name: currentNPCData.name,
                portrait: currentNPCData.portrait,
                nodes: dialogueModule.default.nodes, // Dialogue structure from the specific dialogue file
                // Keep tradeInventory accessible via currentNPCData
            };
        } catch (error) {
            console.error(`Error loading dialogue for NPC ${npcId}, dialogue file ${dialogueFileId}:`, error);
            return null;
        }
    }

    // Show dialogue modal
    function showDialogue() {
        dialogueModal.classList.remove('hidden');
    }

    // Hide dialogue modal
    function hideDialogue() {
        dialogueModal.classList.add('hidden');
        if (resolveDialoguePromise) {
            resolveDialoguePromise();
            resolveDialoguePromise = null;
        }
    }

    // Parse hypertext in dialogue text
    function parseHypertext(text) {
        const hypertextRegex = /\[([^|]+)\|([^|]+)\|([^|]+)\]/g;
        return text.replace(hypertextRegex, (match, word, topicId, description) => {
            return `<span class="hypertext" data-topic="${topicId}">
                        ${word}
                        <span class="hypertext-tooltip">${description}</span>
                    </span>`;
        });
    }

    // Unified action handler
    function handleActions(actions) {
        if (!actions) return;
        const actionArray = Array.isArray(actions) ? actions : [actions];
        actionArray.forEach(act => {
            switch (act.type) {
                case 'startQuest':
                    questSystem.startQuest(act.questId);
                    break;
                case 'addItem':
                    const itemData = allItemsCache ? allItemsCache[act.itemId] : null;
                    if (itemData && hero && typeof hero.addItemToInventory === 'function') {
                        for (let i = 0; i < (act.quantity || 1); i++) {
                            hero.addItemToInventory(new Item(itemData));
                        }
                    } else {
                        console.warn(`Could not add item ${act.itemId}: item data not found or hero.addItemToInventory missing.`);
                    }
                    break;
                case 'completeQuest':
                    questSystem.completeQuest(act.questId);
                    break;
                case 'unlockPOI':
                    if (window.unlockMapPOI) {
                        window.unlockMapPOI(act.mapId, act.poiId);
                    } else {
                        console.error('unlockMapPOI function is not available.');
                    }
                    break;
                case 'travelToMap':

                    openTab({ currentTarget: document.getElementById('mapNavButton') }, 'map');
                    setCurrentMap(act.mapId);


                    break;
                default:
                    console.log('Unknown action type:', act.type);
            }
        });
    }

    // Display current dialogue node
    function displayNode(node) {
        currentNode = node;
        npcPortrait.src = currentDialogue.portrait;
        npcName.textContent = currentDialogue.name;
        dialogueText.innerHTML = parseHypertext(node.text);

        // Add click event listeners for hypertext
        const hypertextElements = dialogueText.querySelectorAll('.hypertext');
        hypertextElements.forEach(element => {
            element.addEventListener('click', () => {
                const topicId = element.dataset.topic;
                hideDialogue();
                openTab({ currentTarget: document.getElementById('libraryNavButton') }, 'library');
                const topicElement = document.querySelector(`#topics li[data-topic="${topicId}"]`);
                if (topicElement) {
                    topicElement.click();
                } else {
                    document.getElementById('content').innerHTML = `
                        <h2>Unknown Topic</h2>
                        <p>No information available.</p>
                    `;
                }
            });
        });

        // Clear previous options
        optionButtons.forEach(button => {
            button.style.display = 'none';
            button.textContent = '';
            button.classList.remove('disabled');
            button.onclick = null;
        });

        // Display new options
        if (node.options) {
            let visibleOptionIndex = 0;
            node.options.forEach((option) => {
                if (visibleOptionIndex >= optionButtons.length) return;

                const isEnabled = checkOptionConditions(option);

                if (!isEnabled && option.hideWhenUnavailable === true) {
                    return;
                }

                const button = optionButtons[visibleOptionIndex];
                button.style.display = 'block';
                button.textContent = option.text;

                if (isEnabled) {
                    button.classList.remove('disabled');
                    button.onclick = () => handleOption(option);
                } else {
                    button.classList.add('disabled');
                    button.onclick = null;
                }
                visibleOptionIndex++;
            });
        } else {
            // If no options, handle any actions first
            handleActions(node.action);
            
            // Then set up click listener to close the dialogue
            const clickListener = (event) => {
                if (event.target === dialogueModal || (event.target.closest('.dialogue-content') && !event.target.closest('.dialogue-options button, .hypertext, .action-button'))) {
                    if (!dialogueModal.classList.contains('hidden')) {
                        hideDialogue();
                    }
                    dialogueModal.removeEventListener('click', clickListener);
                }
            };
            dialogueModal.addEventListener('click', clickListener);
        }

        // Trade button logic
        if (currentNPCData && currentNPCData.canTrade === true) {
            tradeButton.style.display = 'block';
            tradeButton.onclick = () => handleTrade();
        } else {
            tradeButton.style.display = 'none';
        }

        questSystem.updateQuestProgress('dialogue', { npcName: currentDialogue.name, dialogueNodeId: node.id });
    }

    function checkOptionConditions(option) {
        if (!option.conditions) return true;
        return option.conditions.every(condition => {
            let result;
            switch (condition.type) {
                case 'skill':
                    const heroStat = hero.baseStats[condition.stat] || 0;
                    result = heroStat >= condition.value;
                    break;
                case 'item':
                    console.log(`Checking for item: ${condition.item}`);
                    result = hero.hasItem(condition.item, condition.quantity || 1); // Assuming hero.inventory.hasItem exists
                    break;
                case 'questActive':
                    result = questSystem.activeQuests.has(condition.questId);
                    break;
                case 'questCompleted':
                    const quest = questSystem.quests.get(condition.questId);
                    result = quest && quest.completed;
                    break;
                // Add more condition types like 'questStepCompleted', 'globalFlag', etc.
                default:
                    console.warn('Unknown condition type:', condition.type);
                    result = false;
            }
            return condition.negate ? !result : result;
        });
    }

    function handleOption(option) {
        handleActions(option.action);

        if (option.nextId) {
            const nextNode = currentDialogue.nodes.find(node => node.id === option.nextId);
            if (nextNode) {
                displayNode(nextNode);
            } else {
                console.error('Next node not found:', option.nextId);
                hideDialogue();
            }
        } else {
            hideDialogue();
        }
    }

    function handleTrade() {
        if (currentNPCData && currentNPCData.canTrade) {
            // The trade modal needs the full NPC data object, which currentNPCData is
            openTradeModal(currentNPCData);
        } else {
            console.warn("Attempted to trade, but NPC data or trade capability is missing.");
        }
    }

    async function selectDialogueFile(npcId) {
        // This logic needs to be adapted to how your NPC .js files structure their available dialogues.
        // For example, npcFile.default.dialogues might be an array or object.
        // Let's assume it's an array of dialogue file IDs, and we pick the first one.
        try {
            const npcModule = await import(`./Data/NPCs/${npcId}/${npcId}.js`);
            const npcDefinition = npcModule.default;

            // Prioritize quest-related dialogues
            // This is a simplified example; you'll need more robust logic
            // to check quest steps and conditions against the NPC.
            for (const quest of questSystem.getActiveQuests()) {
                if (quest.steps) { // Ensure steps array exists
                    const currentStepDetails = quest.steps[quest.currentStepIndex || 0];
                    if (currentStepDetails && currentStepDetails.npcId === npcId && currentStepDetails.dialogueFileId) {
                        // Check if this dialogue file exists in the NPC's list of dialogues
                        if (npcDefinition.dialogues && npcDefinition.dialogues.includes(currentStepDetails.dialogueFileId)) {
                            return currentStepDetails.dialogueFileId;
                        }
                    }
                }
            }

            // Fallback to a default or first dialogue file
            if (npcDefinition.dialogues && npcDefinition.dialogues.length > 0) {
                return npcDefinition.dialogues[0]; // e.g., "default_dialogue"
            }
            console.warn(`NPC ${npcId} has no dialogue files listed.`);
            return null;
        } catch (error) {
            console.error(`Error selecting dialogue file for NPC ${npcId}:`, error);
            return null;
        }
    }

    // Public function to start a dialogue
    async function startDialogue(npcId, dialogueFileId = null) { // dialogueFileId is now optional
        return new Promise(async (resolve) => {
            resolveDialoguePromise = resolve;

            const effectiveDialogueFileId = dialogueFileId || await selectDialogueFile(npcId);
            if (!effectiveDialogueFileId) {
                console.error(`No dialogue file could be determined for NPC ${npcId}.`);
                hideDialogue();
                return;
            }

            currentDialogue = await loadDialogueData(npcId, effectiveDialogueFileId);
            if (currentDialogue) {
                const startNode = currentDialogue.nodes.find(node => node.id === 'start');
                if (startNode) {
                    showDialogue();
                    displayNode(startNode);
                } else {
                    console.error(`Start node not found in dialogue file: ${effectiveDialogueFileId} for NPC: ${npcId}`);
                    hideDialogue();
                }
            } else {
                 console.error(`Could not load dialogue data for NPC: ${npcId}, File: ${effectiveDialogueFileId}`);
                hideDialogue();
            }
        });
    }

    // Expose startDialogue globally if not using module imports from non-module scripts
    window.startDialogue = startDialogue;

    console.log('Dialogue system initialized.');
}