import {battleStatistics, team1, hero} from './initialize.js';
import {updateProgressBar, updateHeroMapStats,renderBattleConsumableBar,renderSkills, updateStatsDisplay} from './Render.js';
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

    // Show the selected tab content
    const currentTab = document.getElementById(tabName);
    if (currentTab) {
        currentTab.classList.add('active');
    } else {
        console.error(`Tab with ID "${tabName}" not found.`);
        return; // Exit if tab not found
    }

    // Activate the tab link
    if (evt && evt.currentTarget) {
        evt.currentTarget.classList.add('active');
    } else {
        // If called programmatically (e.g., by back buttons), try to find a corresponding nav button
        const correspondingNavLink = document.getElementById(`${tabName}NavButton`) || // e.g. mapNavButton
                                  document.querySelector(`.tablinks[onclick*="'${tabName}'"]`); // Fallback
        if (correspondingNavLink) {
            correspondingNavLink.classList.add('active');
        } else if (tabName === 'map') { // Default to mapNavButton if opening map specifically
             const mapNavButton = document.getElementById('mapNavButton');
             if (mapNavButton) mapNavButton.classList.add('active');
        }
    }

    // Footer visibility
    const footer = document.getElementById('footer');
    if (tabName === 'battlefield') {
        footer.classList.remove('hidden'); // Show footer for battlefield
         if (hero) renderBattleConsumableBar(hero);
    } else {
        footer.classList.add('hidden'); // Hide footer for ALL other tabs
    }

    // Tab-specific updates
    if (tabName === 'battle-statistics') {
        battleStatistics.updateBattleStatistics();
    }
    if (tabName === 'heroContent' && team1 && team1.members[0]) {
        team1.members[0].skills.forEach(skill => {
            updateProgressBar(skill);
        });
        updateStatsDisplay(hero); // This will call item rendering functions
        renderSkills(hero);
        renderPassiveSkills(hero);
    }
    if (tabName === 'quests') {
        updateQuestLog();
    }
    if (tabName === 'map') {
        if (hero) { // Ensure hero is initialized
            updateHeroMapStats(hero);
        }
    }
}