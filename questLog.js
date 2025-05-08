import { questSystem } from './questSystem.js';

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

function updateQuestLog() {
    const questList = document.getElementById('quest-list');
    questList.innerHTML = ''; // Clear existing quests

    const quests = questSystem.getQuestData();
    if (quests.length === 0) {
        questList.innerHTML = '<p class="no-quests">No active quests.</p>';
        return;
    }

    quests.forEach(quest => {
        const questElement = document.createElement('div');
        questElement.classList.add('quest-item');
        questElement.innerHTML = `
            <h3>${quest.name}${quest.completed ? ' (Completed)' : ''}</h3>
            <p><strong>Giver:</strong> ${quest.giver}</p>
            <p><strong>Description:</strong> ${quest.description}</p>
            <p><strong>Progress:</strong> Step ${quest.currentStep}/${quest.totalSteps}</p>
            <p><strong>Next Step:</strong> ${quest.nextHint}</p>
        `;
        questList.appendChild(questElement);
    });
}