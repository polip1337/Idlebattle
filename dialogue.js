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
        document.getElementById('option-4')
    ];
    const tradeButton = document.getElementById('trade-button');

    let currentDialogue = null;
    let currentNode = null;
    let currentNPC = null;

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
        });

        // Display new options
        if (node.options) {
            node.options.forEach((option, index) => {
                if (index < optionButtons.length) {
                    const isEnabled = checkOptionConditions(option);
                    optionButtons[index].style.display = 'block';
                    optionButtons[index].textContent = option.text;
                    if (isEnabled) {
                        optionButtons[index].onclick = () => handleOption(option);
                    } else {
                        optionButtons[index].classList.add('disabled');
                    }
                }
            });
        } else {
            // If no options, clicking the modal closes it
            dialogueModal.onclick = (event) => {
                if (event.target === dialogueModal) {
                    hideDialogue();
                    dialogueModal.onclick = null;
                }
            };
        }

        // Show trade button if NPC has trade inventory
        if (currentDialogue.tradeInventory && currentDialogue.tradeInventory.length > 0) {
            tradeButton.style.display = 'block';
            tradeButton.onclick = () => handleTrade();
        } else {
            tradeButton.style.display = 'none';
        }

        // Trigger quest progress for reaching this node
        questSystem.updateQuestProgress('dialogue', { npc: currentDialogue.name, dialogueId: node.id });
    }

    // Check conditions for dialogue options
    function checkOptionConditions(option) {
        if (!option.conditions) return true;
        return option.conditions.every(condition => {
            switch (condition.type) {
                case 'skill':
                    const heroStat = hero[condition.stat] || 0; // Access hero stats dynamically
                    return heroStat >= condition.value;
                case 'item':
                    console.log(`Checking for item: ${condition.itemId}`);
                    return false; // Placeholder: Implement inventory check
                case 'questActive':
                    return questSystem.activeQuests.has(condition.questId);
                case 'questCompleted':
                    const quest = questSystem.quests.get(condition.questId);
                    return quest && quest.completed;
                default:
                    console.warn('Unknown condition type:', condition.type);
                    return false;
            }
        });
    }

    // Handle option selection
    function handleOption(option) {
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

        // Handle actions
        if (option.action) {
            switch (option.action.type) {
                case 'startQuest':
                    questSystem.startQuest(option.action.questId);
                    break;
                case 'giveItem':
                    console.log(`Giving item: ${option.action.itemId}`);
                    break;
                default:
                    console.log('Unknown action:', option.action);
            }
        }
    }

    // Handle trade action
    function handleTrade() {
        console.log('Opening trade with NPC:', currentNPC.name, 'Inventory:', currentDialogue.tradeInventory);
        alert(`Trade with ${currentNPC.name} (Items: ${currentDialogue.tradeInventory.join(', ')})`);
    }

    // Start dialogue with an NPC
    async function startDialogue(npcId, dialogueId = null) {
        const npcModule = await import(`./Data/NPCs/${npcId}/${npcId}.js`);
        const selectedDialogueId = dialogueId || npcModule.default.dialogues[0];
        currentDialogue = await loadDialogue(npcId, selectedDialogueId);
        if (currentDialogue) {
            const startNode = currentDialogue.nodes.find(node => node.id === 'start');
            if (startNode) {
                showDialogue();
                displayNode(startNode);
            } else {
                console.error('Start node not found in dialogue:', selectedDialogueId);
            }
        }
    }

    // Expose startDialogue globally for testing and map integration
    window.startDialogue = startDialogue;

    console.log('Dialogue system initialized. Use startDialogue("sampleNPC", "sampleDialogue") in console to test.');
}