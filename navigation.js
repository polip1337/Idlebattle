import {battleStatistics, team1} from './initialize.js';
import {updateProgressBar} from './Render.js';
import {updateQuestLog} from './questLog.js';

export function openTab(evt, tabName) {
    // Hide all tab contents
    const tabContents = document.getElementsByClassName('tabcontent');
    for (let content of tabContents) {
        content.classList.remove('active');
    }
    const battlePopup = document.getElementsByClassName('startBattlePopup');
    battlePopup[0].style.display = 'none';

    // Deactivate all tab links
    const tabLinks = document.getElementsByClassName('tablinks');
    for (let link of tabLinks) {
        link.classList.remove('active');
    }

    // Show the selected tab content
    document.getElementById(tabName).classList.add('active');

    // Activate the tab link (if evt is provided)
    if (evt && evt.currentTarget) {
        evt.currentTarget.classList.add('active');
    } else {
        // Activate the map tab link by default
        const mapNavButton = document.getElementById('mapNavButton');
        if (mapNavButton) {
            mapNavButton.classList.add('active');
        }
    }

    if (tabName === 'battlefield') {
        battlePopup[0].style.display = 'block';
        document.getElementById('team2-overlay').classList.remove('hidden');
        document.getElementById('teamAndBattleContainer').classList.add('opaque');

    }
    if (tabName === 'battle-statistics') {
        battleStatistics.updateBattleStatistics();
    }
    if (tabName === 'heroContent') {
        team1.members[0].skills.forEach(skill => {
            updateProgressBar(skill);
        });
    }
    if (tabName === 'quests') {
        updateQuestLog();
    }
}