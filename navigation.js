import {battleStatistics, team1, hero} from './initialize.js';
import {updateProgressBar, updateHeroMapStats} from './Render.js';
import {updateQuestLog} from './questLog.js';

export function openTab(evt, tabName) {
    // Hide all tab contents
    const tabContents = document.getElementsByClassName('tabcontent');
    for (let content of tabContents) {
        content.classList.remove('active');
    }


    // Deactivate all tab links
    const tabLinks = document.getElementsByClassName('tablinks');
    for (let link of tabLinks) {
        link.classList.remove('active');
    }
    const footer = document.getElementById('footer');

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
        footer.classList.remove('hidden'); // Show footer for other views

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
    if (tabName === 'map') {
        if (hero) { // Ensure hero is initialized
            updateHeroMapStats(hero);
        }
        footer.classList.add('hidden'); // Hide footer for map view

    }
}