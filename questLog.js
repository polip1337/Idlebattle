
import { questSystem } from './questSystem.js';
import { reputationUI } from './reputationUI.js';

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

    // Group quests by mapId
    const questsByMap = {};
    quests.forEach(quest => {
        const mapId = quest.mapId;
        if (!questsByMap[mapId]) {
            questsByMap[mapId] = [];
        }
        questsByMap[mapId].push(quest);
    });

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
            
            // Calculate progress percentage
            const progressPercent = (quest.currentStep / quest.totalSteps) * 100;
            
            questElement.innerHTML = `
                <div class="quest-header">
                    <h3>${quest.name}${quest.completed ? ' (Completed)' : ''}</h3>
                    <button class="toggle-details">${quest.completed ? '-' : '+'}</button>
                </div>
                <div class="quest-details" style="display: ${quest.completed ? 'block' : 'none'};">
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
                details.style.display = details.style.display === 'none' ? 'block' : 'none';
                toggleButton.textContent = details.style.display === 'none' ? '+' : '-';
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