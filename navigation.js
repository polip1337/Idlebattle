// navigation.js
import { battleStatistics, hero } from './initialize.js';
import { updateProgressBar, renderBattleConsumableBar, renderSkills, renderPassiveSkills, updateStatsDisplay, updateHealth, updateMana, updateStamina } from './Render.js'; // Added missing Render functions
import { updateQuestLog } from './questLog.js';
import { refreshMapElements } from './map.js'; // Removed updateHeroMapStats as it's handled in map.js
import tutorialOverlay from './tutorialOverlay.js';

export function openTab(evt, tabName) {
    const tabContents = document.getElementsByClassName('tabcontent');
    for (let content of tabContents) {
        content.style.display = 'none'; // Explicitly hide all tabs first
        content.classList.remove('active');
    }

    const tabLinks = document.getElementsByClassName('tablinks');
    for (let link of tabLinks) {
        link.classList.remove('active');
    }

    const currentTab = document.getElementById(tabName);
    if (currentTab) {
        let displayStyle = 'block'; // Default
        if (tabName === 'map' || tabName === 'heroContent') {
            displayStyle = 'flex'; // These tabs need to be flex containers
        }
        // Add other specific display styles for other tabs if necessary
        // e.g., else if (tabName === 'someGridTab') displayStyle = 'grid';

        currentTab.style.display = displayStyle;
        currentTab.classList.add('active');
    } else {
        console.error(`Tab with ID "${tabName}" not found.`);
        return;
    }

    // Activate the corresponding navigation link
    if (evt && evt.currentTarget) {
        evt.currentTarget.classList.add('active');
    } else {
        const mainNavLinkId = `${tabName}NavButton`;
        const mainNavLink = document.getElementById(mainNavLinkId);
        if (mainNavLink) {
            mainNavLink.classList.add('active');
        } else {
            let parentNavButton = null;
            if (tabName.startsWith('hero')) { // Covers heroContent and its sub-tabs
                parentNavButton = document.getElementById('heroContentNavButton');
            }
            // Add more parent tab heuristics if needed for other sub-tabs
            if (parentNavButton) {
                parentNavButton.classList.add('active');
            } else {
                const fallbackLink = document.querySelector(`.tablinks[onclick*="'${tabName}'"]`);
                if (fallbackLink) fallbackLink.classList.add('active');
            }
        }
    }

    document.getElementById('footer')?.classList.toggle('hidden', tabName !== 'battlefield' && tabName !== 'heroContent');

    if (tabName === 'battlefield' && typeof renderBattleConsumableBar === 'function' && hero) {
        renderBattleConsumableBar(hero);
    }
    if (tabName === 'heroContent' && typeof renderBattleConsumableBar === 'function' && hero) { // ADDED THIS
        renderBattleConsumableBar(hero);
    }


    if (tabName === 'battle-statistics' && battleStatistics) battleStatistics.updateBattleStatistics();

    if (tabName === 'heroContent' && hero) {
        // Ensure hero data is fresh when this tab is opened
        if (typeof updateStatsDisplay === 'function') updateStatsDisplay(hero);
        if (typeof renderSkills === 'function') renderSkills(hero);
        if (typeof renderPassiveSkills === 'function') renderPassiveSkills(hero);
        hero.skills.forEach(skill => {
            if (typeof updateProgressBar === 'function') updateProgressBar(skill);
        });
        // Automatically open the main hero sub-tab if not already handled by its own logic
        if (typeof window.openHeroSubTab === 'function') {
            const heroSubTabs = document.getElementById('hero-sub-tabs');
            const activeSubTab = heroSubTabs ? heroSubTabs.querySelector('.hero-sub-tab-button.active') : null;
            if (!activeSubTab) { // If no sub-tab is active, open the first one
                const firstSubTabButton = heroSubTabs ? heroSubTabs.querySelector('.hero-sub-tab-button') : null;
                if (firstSubTabButton) {
                    const subTabName = firstSubTabButton.getAttribute('onclick').match(/'([^']*)'/g)[1].replace(/'/g, '');
                    window.openHeroSubTab({ currentTarget: firstSubTabButton }, subTabName);
                }
            }
        }
         if (typeof initializeCompanionUI === 'function') initializeCompanionUI(); // Ensure companion UI is also up-to-date
    }
    if (tabName === 'quests' && typeof updateQuestLog === 'function') updateQuestLog();

    if (tabName === 'map') {
        // updateHeroMapStats is handled within map.js's refreshMapElements or its internal _updateHeroMapSidebar
        if (typeof refreshMapElements === 'function') refreshMapElements();
        tutorialOverlay.checkAndShowTutorial('map');
    } else if (tabName === 'heroContent') {
        tutorialOverlay.checkAndShowTutorial('party');
    } else if (tabName === 'battlefield') {
        tutorialOverlay.checkAndShowTutorial('battle');
    }
}

// Function to handle battle statistics tab switching
export function openStatsTab(evt, tabName) {
    // Hide all tab content
    const tabContents = document.getElementsByClassName('stats-tab-content');
    for (let content of tabContents) {
        content.classList.remove('active');
    }

    // Remove active class from all tab buttons
    const tabButtons = document.getElementsByClassName('stats-tab-button');
    for (let button of tabButtons) {
        button.classList.remove('active');
    }

    // Show the selected tab content and mark its button as active
    document.getElementById(tabName).classList.add('active');
    evt.currentTarget.classList.add('active');
}

// Function to handle hero sub-tab switching
export function openHeroSubTab(evt, tabName) {
    // Hide all tab content
    const tabContents = document.getElementsByClassName('hero-sub-tab-content');
    for (let content of tabContents) {
        content.classList.remove('active');
    }

    // Remove active class from all tab buttons
    const tabButtons = document.getElementsByClassName('hero-sub-tab-button');
    for (let button of tabButtons) {
        button.classList.remove('active');
    }

    // Show the selected tab content and mark its button as active
    document.getElementById(tabName).classList.add('active');
    evt.currentTarget.classList.add('active');

    // Show tutorial for companions tab
    if (tabName === 'heroCompanions') {
        tutorialOverlay.checkAndShowTutorial('companions');
    }
}

// Make openStatsTab available globally for onclick handlers
window.openStatsTab = openStatsTab;