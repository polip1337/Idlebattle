
import { openTab } from './navigation.js';
import { hero } from './initialize.js';
import { questSystem } from './questSystem.js';

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
    let currentNPC = null;
    let resolveDialoguePromise = null; // For making startDialogue awaitable

    // Load NPC and dialogue data
    async function loadDialogue(npcId, dialogueId) {
        try {
            const npcModule = await import(`./Data/NPCs/${npcId}/${npcId}.js`);
            const dialogueModule = await import(`./Data/NPCs/${npcId}/${dialogueId}.js`);
            currentNPC = npcModule.default;
            return {
                name: npcModule.default.name,
                portrait: npcModule.default.portrait,
                nodes: dialogueModule.default.nodes,
                tradeInventory: npcModule.default.tradeInventory
            };
        } catch (error) {
            console.error('Error loading dialogue:', error);
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
                hideDialogue(); // This will resolve the promise if one is active
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
            // If no options, clicking the modal closes it (unless it's already being closed)
            // Ensure this doesn't interfere with hypertext clicks
            const clickListener = (event) => {
                if (event.target === dialogueModal || event.target.closest('.dialogue-content') && !event.target.closest('.dialogue-options button, .hypertext, .action-button')) {
                    if (!dialogueModal.classList.contains('hidden')) { // Only hide if visible
                        hideDialogue();
                    }
                    dialogueModal.removeEventListener('click', clickListener); // Clean up listener
                }
            };
            // Add listener only if no options are present
            dialogueModal.addEventListener('click', clickListener);
        }


        if (currentDialogue.tradeInventory && currentDialogue.tradeInventory.length > 0) {
            tradeButton.style.display = 'block';
            tradeButton.onclick = () => handleTrade();
        } else {
            tradeButton.style.display = 'none';
        }

        questSystem.updateQuestProgress('dialogue', { npc: currentDialogue.name, dialogueId: node.id });
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
                    console.log(`Checking for item: ${condition.itemId}`);
                    result = hero.inventory.hasItem(condition.itemId, condition.quantity || 1); // Assuming hero.inventory.hasItem exists
                    break;
                case 'questActive':
                    result = questSystem.activeQuests.has(condition.questId);
                    break;
                case 'questCompleted':
                    const quest = questSystem.quests.get(condition.questId);
                    result = quest && quest.completed;
                    break;
                default:
                    console.warn('Unknown condition type:', condition.type);
                    result = false;
            }
            return condition.negate ? !result : result;
        });
    }

    function handleOption(option) {
        if (option.action) {
            const actions = Array.isArray(option.action) ? option.action : [option.action];
            actions.forEach(act => {
                switch (act.type) {
                    case 'startQuest':
                        questSystem.startQuest(act.questId);
                        break;
                    case 'addItem': // Changed from giveItem to addItem to match renn_base
                        console.log(`Adding item: ${act.itemId}`);
                        if (hero && typeof hero.inventoryAddItem === 'function') { // Assuming hero.inventoryAddItem exists
                            hero.inventoryAddItem(act.itemId, act.quantity || 1);
                        } else {
                             console.warn('hero.inventoryAddItem function not found, or hero object not available.');
                        }
                        break;
                    case 'completeQuest':
                        const questToComplete = questSystem.quests.get(act.questId);
                        if (questToComplete && !questToComplete.completed) {
                            questToComplete.currentStep = questToComplete.steps.length;
                            questToComplete.completed = true;
                            questSystem.activeQuests.delete(act.questId);
                            questSystem.applyRewards(questToComplete);
                            console.log(`Completed quest: ${act.questId}`);
                            if (window.updateQuestLog) {
                                window.updateQuestLog();
                            }
                        }
                        break;
                    case 'unlockPOI': // MODIFIED to use poiId
                        if (window.unlockMapPOI) {
                            window.unlockMapPOI(act.mapId, act.poiId); // Pass poiId
                            console.log(`Action: Unlocked POI ID '${act.poiId}' on map '${act.mapId}'`);
                        } else {
                            console.error('unlockMapPOI function is not available on window object.');
                        }
                        break;
                    default:
                        console.log('Unknown action:', act);
                }
            });
        }

        if (option.nextId) {
            const nextNode = currentDialogue.nodes.find(node => node.id === option.nextId);
            if (nextNode) {
                displayNode(nextNode);
            } else {
                console.error('Next node not found:', option.nextId);
                hideDialogue(); // This will resolve the promise
            }
        } else {
            hideDialogue(); // This will resolve the promise
        }
    }

    function handleTrade() {
        console.log('Opening trade with NPC:', currentNPC.name, 'Inventory:', currentDialogue.tradeInventory);
        alert(`Trade with ${currentNPC.name} (Items: ${currentDialogue.tradeInventory.join(', ')})`);
        // Future: openTab('trade', { npc: currentNPC, inventory: currentDialogue.tradeInventory });
    }

    async function selectDialogue(npcId) {
        const npcModule = await import(`./Data/NPCs/${npcId}/${npcId}.js`);
        const npc = npcModule.default;

        for (const questId of questSystem.activeQuests) {
            const quest = questSystem.quests.get(questId);
            if (quest.currentStep < quest.steps.length) {
                const nextStep = quest.steps[quest.currentStep];
                const condition = nextStep.condition;
                const conditionString = condition.toString();
                if (conditionString.includes(`data.npc === '${npc.name}'`) ||
                    conditionString.includes(`data.npcId === '${npcId}'`)) {

                    if (quest.currentStep === quest.steps.length - 1) {
                        const dialogueId = npc.dialogues.find(d => d.includes('questComplete') || d.includes(questId + '_complete')) ||
                                           npc.dialogues.find(d => d.includes('questActive') || d.includes(questId + '_active')) ||
                                           npc.dialogues[0];
                        return dialogueId;
                    } else {
                        const dialogueId = npc.dialogues.find(d => d.includes('questActive') || d.includes(questId + '_active')) ||
                                           npc.dialogues[0];
                        return dialogueId;
                    }
                }
            }
        }
        return npc.dialogues[0];
    }

    async function startDialogue(npcId, dialogueId = null) {
        return new Promise(async (resolve) => { // MODIFIED: Return a promise
            resolveDialoguePromise = resolve;

            const selectedDialogueId = dialogueId || await selectDialogue(npcId);
            currentDialogue = await loadDialogue(npcId, selectedDialogueId);
            if (currentDialogue) {
                const startNode = currentDialogue.nodes.find(node => node.id === 'start');
                if (startNode) {
                    showDialogue();
                    displayNode(startNode);
                } else {
                    console.error('Start node not found in dialogue:', selectedDialogueId);
                    hideDialogue(); // This will call resolveDialoguePromise
                }
            } else {
                 console.error(`Could not load dialogue for NPC: ${npcId}, Dialogue: ${selectedDialogueId}`);
                hideDialogue(); // This will call resolveDialoguePromise
            }
        });
    }

    window.startDialogue = startDialogue;

    console.log('Dialogue system initialized. Use startDialogue("npcId", "dialogueFileId") in console to test.');
}