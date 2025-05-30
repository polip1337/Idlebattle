// dialogue.js
import { openTab } from './navigation.js';
import { hero,allItemsCache } from './initialize.js';
import { questSystem } from './questSystem.js';
import { openTradeModal } from './tradeModal.js';
import { setCurrentMap, currentMapId } from './map.js';
import Item from './item.js';
import { handleActions } from './actionHandler.js';

// Debug configuration
const DEBUG = {
    enabled: true,
    log: function(...args) {
        if (this.enabled) {
            console.log('[Dialogue Debug]', ...args);
        }
    }
};

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
    let currentBranch = null; // Track the current dialogue branch

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
        // Resume battle if it was paused for dialogue
        if (window.battleStarted) {
            window.isBattlePausedForDialogue = false;
        }
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
            button.title = ''; // Clear any existing tooltips
        });

        // Display new options
        if (node.options) {
            let visibleOptionIndex = 0;
            node.options.forEach((option) => {
                if (visibleOptionIndex >= optionButtons.length) return;

                const isEnabled = checkOptionConditions(option);
                const missingRequirements = !isEnabled ? getMissingRequirements(option) : [];

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
                    // Add tooltip with missing requirements
                    if (missingRequirements.length > 0) {
                        button.title = `Missing requirements:\n${missingRequirements.join('\n')}`;
                    }
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
                    const itemId = condition.itemId;
                    const quantity = condition.quantity || 1;

                    DEBUG.log(`Checking for item: ${itemId}, quantity: ${quantity}`);
                    

                        let eqResult = Object.values(hero.equipment).some(slot =>
                            slot && slot.id === itemId
                        );
                        DEBUG.log(`Item equipped check: ${eqResult}`);

                        let invResult = hero.hasItem(itemId, quantity);
                        DEBUG.log(`Item inventory check: ${invResult}`);
                        result = eqResult || invResult;
                    break;
                case 'questActive':
                    result = questSystem.activeQuests.has(condition.questId);
                    break;
                case 'questCompleted':
                    const quest = questSystem.quests.get(condition.questId);
                    result = quest && quest.completed;
                    break;
                case 'questStep':
                    const stepQuest = questSystem.quests.get(condition.questId);
                    if (!stepQuest) {
                        DEBUG.log(`Quest ${condition.questId} not found for step check`);
                        result = false;
                        break;
                    }
                    
                    if (condition.branch) {
                        const currentBranch = stepQuest.currentBranch;
                        if (!currentBranch || currentBranch !== condition.branch) {
                            DEBUG.log(`Quest branch check failed: current=${currentBranch}, required=${condition.branch}`);
                            result = false;
                            break;
                        }
                    }
                    
                    result = stepQuest.currentStep === condition.stepIndex;
                    DEBUG.log(`Quest step check: ${stepQuest.currentStep} === ${condition.stepIndex}: ${result}`);
                    break;
                case 'location':
                    const currentLocation = currentMapId || 'unknown';
                    result = currentLocation === condition.locationId;
                    DEBUG.log(`Location check: ${currentLocation} === ${condition.locationId}: ${result}`);
                    break;
                // Add more condition types like 'globalFlag', etc.
                default:
                    console.warn('Unknown condition type:', condition.type);
                    result = false;
            }
            return condition.negate ? !result : result;
        });
    }

    function handleOption(option) {
        handleActions(option.action);

        // Store the branch information if this option has a branch
        if (option.branch) {
            currentBranch = option.branch;
        }

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
        try {
            DEBUG.log(`Selecting dialogue file for NPC: ${npcId}`);
            const npcModule = await import(`./Data/NPCs/${npcId}/${npcId}.js`);
            const npcDefinition = npcModule.default;

            // If dialogues is an array of strings (old format), convert to new format
            if (Array.isArray(npcDefinition.dialogues) && typeof npcDefinition.dialogues[0] === 'string') {
                DEBUG.log('Converting old dialogue format to new format');
                npcDefinition.dialogues = npcDefinition.dialogues.map(id => ({
                    id,
                    conditions: [],
                    priority: 0
                }));
            }

            // Get current location from the map system
            const currentLocation = currentMapId || 'unknown';
            DEBUG.log(`Current location: ${currentLocation}`);

            // Get dialogues for current location, fallback to default if not found
            let locationDialogues = npcDefinition.dialogues[currentLocation] || npcDefinition.dialogues.default;
            if (!locationDialogues) {
                console.warn(`No dialogues found for location ${currentLocation} or default for NPC ${npcId}`);
                return null;
            }

            // Sort dialogues by priority (highest first)
            const sortedDialogues = [...locationDialogues].sort((a, b) => (b.priority || 0) - (a.priority || 0));
            DEBUG.log(`Found ${sortedDialogues.length} dialogue options for location ${currentLocation}, sorted by priority`);

            // Check conditions for each dialogue
            for (const dialogue of sortedDialogues) {
                DEBUG.log(`Checking dialogue: ${dialogue.id}`);
                
                if (!dialogue.conditions || dialogue.conditions.length === 0) {
                    DEBUG.log(`Dialogue ${dialogue.id} has no conditions, using as fallback`);
                    return dialogue.id;
                }

                let allConditionsMet = true;
                for (const condition of dialogue.conditions) {
                    let conditionMet = false;
                    DEBUG.log(`Checking condition:`, condition);

                    switch (condition.type) {
                        case 'quest':
                            const quest = questSystem.quests.get(condition.questId);
                            if (!quest) {
                                DEBUG.log(`Quest ${condition.questId} not found`);
                                conditionMet = false;
                                break;
                            }

                            switch (condition.status) {
                                case 'not_started':
                                    conditionMet = !questSystem.activeQuests.has(condition.questId) && !quest.completed;
                                    DEBUG.log(`Quest ${condition.questId} not_started check: ${conditionMet}`);
                                    break;
                                case 'active':
                                    conditionMet = questSystem.activeQuests.has(condition.questId);
                                    DEBUG.log(`Quest ${condition.questId} active check: ${conditionMet}`);
                                    break;
                                case 'completed':
                                    conditionMet = quest.completed;
                                    DEBUG.log(`Quest ${condition.questId} completed check: ${conditionMet}`);
                                    break;
                                default:
                                    console.warn(`Unknown quest status condition: ${condition.status}`);
                                    conditionMet = false;
                            }
                            break;

                        case 'questStep':
                            const stepQuest = questSystem.quests.get(condition.questId);
                            if (!stepQuest) {
                                DEBUG.log(`Quest ${condition.questId} not found for step check`);
                                conditionMet = false;
                                break;
                            }
                            
                            if (condition.branch) {
                                const currentBranch = stepQuest.currentBranch;
                                if (!currentBranch || currentBranch !== condition.branch) {
                                    DEBUG.log(`Quest branch check failed: current=${currentBranch}, required=${condition.branch}`);
                                    conditionMet = false;
                                    break;
                                }
                            }
                            
                            conditionMet = stepQuest.currentStep === condition.stepIndex;
                            DEBUG.log(`Quest step check: ${stepQuest.currentStep} === ${condition.stepIndex}: ${conditionMet}`);
                            break;

                        case 'item':
                            const itemId = condition.itemId;
                            const quantity = condition.quantity || 1;

                            DEBUG.log(`Checking for item: ${itemId}, quantity: ${quantity}`);


                                let eqResult = Object.values(hero.equipment).some(slot =>
                                    slot && slot.id === itemId
                                );
                                DEBUG.log(`Item equipped check: ${eqResult}`);

                                let invResult = hero.hasItem(itemId, quantity);
                                DEBUG.log(`Item inventory check: ${invResult}`);
                                conditionMet = eqResult || invResult;
                            break;

                        default:
                            console.warn(`Unknown condition type: ${condition.type}`);
                            conditionMet = false;
                    }
                    allConditionsMet = allConditionsMet && conditionMet;
                }
                if (allConditionsMet) {
                    DEBUG.log(`All conditions met for dialogue: ${dialogue.id}`);
                    return dialogue.id;
                }
            }
            console.warn('No dialogue found that meets all conditions');
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

            // Ensure battle is paused during dialogue
            if (window.battleStarted) {
                window.isBattlePausedForDialogue = true;
            }

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

// Helper function to get missing requirements for an option
function getMissingRequirements(option) {
    if (!option.conditions) return [];
    
    const requirements = option.conditions.map(condition => {
        switch (condition.type) {
            case 'skill':
                const heroStat = hero.baseStats[condition.stat] || 0;
                return heroStat < condition.value ? 
                    `{${condition.stat} ${condition.value} (current: ${heroStat})}` : null;
            
            case 'skillCheck':
                const skillValue = hero.baseStats[condition.stat] || 0;
                return `{${condition.stat} check vs DC ${condition.difficulty || 10}}`;
            
            case 'item':
                const itemId = condition.itemId;
                const quantity = condition.quantity || 1;
                const hasItem = hero.hasItem(itemId, quantity);
                return !hasItem ? 
                    `{${quantity}x ${allItemsCache[itemId]?.name || itemId}}` : null;
            
            case 'questActive':
                return !questSystem.activeQuests.has(condition.questId) ? 
                    `{Active quest: ${condition.questId}}` : null;
            
            case 'questCompleted':
                const quest = questSystem.quests.get(condition.questId);
                return !quest?.completed ? 
                    `{Completed quest: ${condition.questId}}` : null;
            
            case 'questStep':
                const stepQuest = questSystem.quests.get(condition.questId);
                if (!stepQuest) return `{Quest ${condition.questId} not found}`;
                if (condition.branch && stepQuest.currentBranch !== condition.branch) {
                    return `{Quest branch: ${condition.branch}}`;
                }
                return stepQuest.currentStep !== condition.stepIndex ? 
                    `{Quest step ${condition.stepIndex} (current: ${stepQuest.currentStep})}` : null;
            
            case 'location':
                return currentMapId !== condition.locationId ? 
                    `{Location: ${condition.locationId}}` : null;
            
            default:
                return `{Unknown requirement: ${condition.type}}`;
        }
    }).filter(req => req !== null); // Remove null entries

    // Add the option text if it exists
    if (option.text) {
        requirements.unshift(`{${option.text}}`);
    }

    return requirements;
}