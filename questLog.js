import { questSystem } from './questSystem.js';
import { reputationUI } from './reputationUI.js';

// Store quest expansion state
const questExpansionState = new Map();

export function initializeQuestLog() {
    // Expose updateQuestLog globally for questSystem to call
    window.updateQuestLog = updateQuestLog;

    // Initial render
    updateQuestLog();

    // Add navigation listener
    document.getElementById('questsNavButton').addEventListener('click', () => {
        import('./navigation.js').then(module => {
            module.openTab({ currentTarget: document.getElementById('questsNavButton') }, 'quests');
        });
    });
}

export function updateQuestLog() {
    const questList = document.getElementById('quest-list');
    questList.innerHTML = ''; // Clear existing quests

    const quests = questSystem.getQuestData();
    if (quests.length === 0) {
        questList.innerHTML = '<p class="no-quests">No active or completed quests.</p>';
        return;
    }

    // Separate active and completed quests
    const activeQuests = quests.filter(quest => !quest.completed);
    const completedQuests = quests.filter(quest => quest.completed);

    // Group quests by mapId
    const questsByMap = {};
    
    // Process active quests first
    activeQuests.forEach(quest => {
        const mapId = quest.mapId;
        if (!questsByMap[mapId]) {
            questsByMap[mapId] = [];
        }
        questsByMap[mapId].push(quest);
    });

    // Add completed quests section at the end
    if (completedQuests.length > 0) {
        questsByMap['Completed'] = completedQuests;
    }

    // Render each map group
    Object.entries(questsByMap).forEach(([mapId, mapQuests]) => {
        const mapGroup = document.createElement('div');
        mapGroup.classList.add('map-group');
        mapGroup.innerHTML = `<h2 class="map-title">${mapId === 'Completed' ? 'Completed Quests' : mapId.replace('_', ' ')}</h2>`;
        const questContainer = document.createElement('div');
        questContainer.classList.add('quest-container');

        mapQuests.forEach(quest => {
            const questElement = document.createElement('div');
            questElement.classList.add('quest-item');
            if (quest.completed) {
                questElement.classList.add('completed');
            }
            
            // Calculate progress percentage
            const progressPercent = (quest.currentStep / quest.totalSteps) * 100;
            
            // Get stored expansion state or default to false
            const isExpanded = questExpansionState.get(quest.id) || false;
            
            questElement.innerHTML = `
                <div class="quest-header">
                    <h3>${quest.name}${quest.completed ? ' (Completed)' : ''}</h3>
                    <button class="toggle-details">${isExpanded ? '-' : '+'}</button>
                </div>
                <div class="quest-details" style="display: ${isExpanded ? 'block' : 'none'};">
                    <p><strong>Giver:</strong> ${quest.giver}</p>
                    <p><strong>Description:</strong> ${quest.description}</p>
                    <div class="quest-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progressPercent}%"></div>
                        </div>
                        <span class="progress-text">${quest.currentStep}/${quest.totalSteps}</span>
                    </div>
                    ${!quest.completed ? `
                        <div class="quest-next-step">
                            <p><strong>Next Step:</strong> ${quest.nextHint}</p>
                        </div>
                    ` : ''}
                </div>
            `;
            questContainer.appendChild(questElement);

            // Add toggle event listener
            const toggleButton = questElement.querySelector('.toggle-details');
            const details = questElement.querySelector('.quest-details');
            toggleButton.addEventListener('click', () => {
                const newState = details.style.display === 'none';
                details.style.display = newState ? 'block' : 'none';
                toggleButton.textContent = newState ? '-' : '+';
                // Store the expansion state
                questExpansionState.set(quest.id, newState);
            });
        });

        mapGroup.appendChild(questContainer);
        questList.appendChild(mapGroup);
    });
}

export function openQuestSubTab(evt, tabName) {
    // Hide all tab content
    const tabContents = document.getElementsByClassName("quest-sub-tab-content");
    for (let content of tabContents) {
        content.classList.remove("active");
    }
    // Remove active class from all tab buttons
    const tabButtons = document.getElementsByClassName("quest-sub-tab-button");
    for (let button of tabButtons) {
        button.classList.remove("active");
    }

    // Show the selected tab content and mark its button as active
    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");

    // If switching to reputation tab, update the UI
    if (tabName === 'reputation') {
        reputationUI.updateUI();
    }
}

if (!window.openQuestSubTab) { // Ensure it's globally available for HTML onclick
    window.openQuestSubTab = openQuestSubTab;
}