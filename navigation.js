import {battleStatistics, hero} from './initialize.js'; // Removed currentArea, currentStage
import {updateProgressBar, updateHeroMapStats,renderBattleConsumableBar,renderSkills,renderPassiveSkills, updateStatsDisplay} from './Render.js';
import {updateQuestLog} from './questLog.js';
import { refreshMapElements } from './map.js';

export function openTab(evt, tabName) {
    const tabContents = document.getElementsByClassName('tabcontent');
    for (let content of tabContents) {
        content.classList.remove('active');
    }
    const tabLinks = document.getElementsByClassName('tablinks');
    for (let link of tabLinks) {
        link.classList.remove('active');
    }

    const currentTab = document.getElementById(tabName);
    if (currentTab) {
        currentTab.classList.add('active');
    } else {
        console.error(`Tab with ID "${tabName}" not found.`);
        return;
    }

    if (evt && evt.currentTarget) {
        evt.currentTarget.classList.add('active');
    } else {
        const correspondingNavLink = document.getElementById(`${tabName}NavButton`) ||
                                  document.querySelector(`.tablinks[onclick*="'${tabName}'"]`) ||
                                  (tabName === 'map' && document.getElementById('mapNavButton'));
        if (correspondingNavLink) correspondingNavLink.classList.add('active');
    }

    document.getElementById('footer')?.classList.toggle('hidden', tabName !== 'battlefield');
    if (tabName === 'battlefield' && hero) renderBattleConsumableBar(hero);

    // Tab-specific updates
    if (tabName === 'battle-statistics' && battleStatistics) battleStatistics.updateBattleStatistics();

    if (tabName === 'heroContent' && hero) {
        hero.skills.forEach(skill => updateProgressBar(skill));
        updateStatsDisplay(hero);
        renderSkills(hero);
        renderPassiveSkills(hero);
    }
    if (tabName === 'quests') updateQuestLog();

    if (tabName === 'map') {
        if (hero) updateHeroMapStats(hero);
        if (typeof refreshMapElements === 'function') refreshMapElements();
        // Removed direct update of stage/area display here, refreshMapElements should handle it if necessary
        // or these elements are removed from map tab.
    }
}