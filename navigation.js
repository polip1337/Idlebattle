import {battleStatistics, team1} from './initialize.js';
import {updateProgressBar} from './Render.js';

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

    // Activate the clicked tab link
    evt.currentTarget.classList.add('active');
    if (tabName == 'battlefield') {
        battlePopup[0].style.display = 'block';
    }
    if (tabName == 'battle-statistics') {
        battleStatistics.updateBattleStatistics();
    }
    if (tabName == 'heroContent') {
        team1.members[0].skills.forEach(skill => {
            updateProgressBar(skill);
        })
    }
}

