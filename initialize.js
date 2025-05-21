import {nextStage as battleNextStageCmd, repeatStage as battleRepeatStageCmd, startBattle, returnToMap, attemptFlee} from './Battle.js';
import Team from './Team.js';
import Hero from './Hero.js';
import Companion from './companion.js';

import EvolutionService from './EvolutionService.js';
import Skill from './Skill.js';
import BattleLog from './BattleLog.js';
import Item from './item.js';
import { currentMapId as mapJsCurrentMapId, initializeMap as initMapModule, setMapStateFromLoad } from './map.js';

import {
    deepCopy,
    renderHero,
    renderLevelProgress,
    renderMember,
    renderPassiveSkills,
    renderSkills,
    showTooltip,
    updateSkillTooltip,
    updateStatsDisplay,
    updateHealth,
    updateMana,
    updateStamina,
    updatePassiveSkillTooltip
} from './Render.js';
import BattleStatistics from './BattleStatistics.js';
import {openTab} from './navigation.js';
import {initializeHomeScreen} from './home.js';
import {initializeDialogue} from './dialogue.js';
import {questSystem as globalQuestSystem} from './questSystem.js';
import {initializeQuestLog} from './questLog.js';
import { openSaveModal,openLoadModal, setInitializeAndLoadGame as setInitLoadFnForSaveLoad, configureAutosave as slConfigureAutosave } from './saveLoad.js'; // Added slConfigureAutosave
import { initializeCompanionUI } from './companionUIManager.js';
import { handleEarlyGameInit } from './slideshow.js';
import { openClassChangeModal, initializeClassChange } from './classChange.js';


export let battleStatistics;
export let evolutionService;
export let isPaused = false;
export let team1;
export let team2;
export let hero;
export let battleLog;
export let classTiers;
export let heroClasses;
export let mobsClasses = null;
export let allSkillsCache = null;
export let allItemsCache = null;
export let allCompanionsData = {};
let allHeroClasses = {};


export const NPC_MEDIA_PATH = "Media/NPC/";
let clickTimeout;

// --- AUTOSAVE SETTINGS ---
// These are the default settings. They can be overridden by user preferences later.
export const globalAutosaveSettings = {
    enabled: true,
    intervalMinutes: 5, // Set to 0 or negative to disable interval-based autosave
    saveOnBattleEnd: true
};
// --- END AUTOSAVE SETTINGS ---


async function loadJSON(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error ${response.status} for URL: ${url}`);
    return response.json();
}

async function loadEffects() {
    try { return await loadJSON('Data/effects.json'); }
    catch (error) { console.error("Failed to load effects.json:", error); return {}; }
}

async function loadSkills(effects, path) {
    try {
        const data = await loadJSON(path);
        const skills = {};
        Object.keys(data).forEach(skillKey => {
            const skillData = data[skillKey];
            skillData.id = skillData.id || skillKey;
            let processedEffects = null;
            if (skillData.effects) {
                if (Array.isArray(skillData.effects) && skillData.effects.length > 0 && skillData.effects[0].id && effects && effects[skillData.effects[0].id]) {
                    const effectTemplate = effects[skillData.effects[0].id];
                    processedEffects = { ...deepCopy(effectTemplate), ...deepCopy(skillData.effects[0]) };
                } else if (typeof skillData.effects === 'object' && !Array.isArray(skillData.effects) && skillData.effects.id && effects && effects[skillData.effects.id]) {
                    const effectTemplate = effects[skillData.effects.id];
                    processedEffects = { ...deepCopy(effectTemplate), ...deepCopy(skillData.effects) };
                } else {
                     processedEffects = deepCopy(skillData.effects);
                }
            }
            skills[skillKey] = { ...skillData, effects: processedEffects };
        });
        return skills;
    } catch (error) { console.error(`Failed to load skills from ${path}:`, error); return {};}
}

async function loadItems() {
    try {
        const itemFiles = await loadJSON('Data/items_manifest.json');
        const loadedItems = {};
        for (const fileName of itemFiles) {
            try {
                const itemData = await loadJSON(`Data/Items/${fileName}`);
                if (itemData.id) loadedItems[itemData.id] = new Item(itemData);
                else console.warn(`Item in ${fileName} missing 'id'.`);
            } catch (fileError) {
                console.warn(`Failed to load item file ${fileName}. Status: ${fileError}`);
            }
        }
        return loadedItems;
    } catch (error) { console.error("Failed to load items manifest:", error); return {};}
}

async function loadMobs() {
    try {
        const mobsData = await loadJSON('Data/mobs.json');
        return mobsData;
    } catch (error) { console.error("Failed to load mobs.json:", error); return {}; }
}

async function loadClasses() {
    try {
        const response = await fetch('data/classes.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const classes = await response.json();
        allHeroClasses = classes; // Store the classes data
        classTiers = classes['tiers'] || [];
        const heroClassDefinitions = classes['classes'] || {};
        heroClasses = {};
        for (const key in heroClassDefinitions) {
            const heroClassDef = heroClassDefinitions[key];
            heroClasses[heroClassDef.id] = {...heroClassDef, skills: heroClassDef.skills || []};
        }
        return classes;
    } catch (error) {
        console.error('Error loading classes:', error);
        return {};
    }
}

async function loadCompanionDefinitions() {
    try {
        allCompanionsData = await loadJSON('Data/Companions/companions.json');
        console.log("Companions definitions loaded:", allCompanionsData);
    } catch (error) {
        console.error("Failed to load companions.json:", error);
        allCompanionsData = {};
    }
}


export async function loadGameData(savedGameState = null) {
    try {
        console.log(savedGameState ? "Loading game from saved state." : "Starting new game.");

        const effects = await loadEffects();
        allSkillsCache = {
            ...(await loadSkills(effects, 'Data/skills.json')),
            ...(await loadSkills(effects, 'Data/passives.json'))
        };
        allItemsCache = await loadItems();
        mobsClasses = await loadMobs();
        await loadCompanionDefinitions();

        if (Object.keys(heroClasses).length === 0 || Object.keys(allSkillsCache).length === 0) {
            console.error("CRITICAL: Hero classes or skills failed to load.");
            alert("Fatal Error: Core game data could not be loaded. Check console.");
            return false;
        }

        initiateBattleLog();
        evolutionService = new EvolutionService();
        await evolutionService.init();

        team1 = new Team('Team1', 'team1-battle-container');
        team2 = new Team('Team2', 'team2-battle-container');

        if (savedGameState) {
            if (!savedGameState.heroData || !savedGameState.mapStateData || !savedGameState.mapStateData.currentMapId) {
                console.error("CRITICAL: Saved game state missing heroData or essential mapStateData.", savedGameState);
                alert("Error: Save data is corrupted. Cannot load game.");
                return false;
            }

            const classIdForHero = savedGameState.heroData.classId || 'novice';
            let heroClassInfo = heroClasses[classIdForHero] || heroClasses['novice'] || Object.values(heroClasses)[0];
            if (!heroClassInfo) {
                alert("Critical error: No hero classes available to load hero."); return false;
            }
            hero = new Hero("Placeholder", heroClassInfo, [], 1, null, null);
            hero.restoreFromData(savedGameState.heroData, heroClasses, allSkillsCache, allItemsCache);

            battleStatistics = new BattleStatistics();
            battleStatistics.restoreFromData(savedGameState.battleStatisticsData);
            await globalQuestSystem.restoreFromData(savedGameState.questSystemData);

            initMapModule();
            setMapStateFromLoad(savedGameState.mapStateData);

            renderLevelProgress(hero);

            hero.reselectSkillsAfterLoad();
            if (document.getElementById('heroContent')) {
                updateStatsDisplay(hero); renderSkills(hero); renderPassiveSkills(hero);
                initializeCompanionUI();
            }
            const homeScreen = document.getElementById('home-screen');
            if (homeScreen?.classList.contains('active')) {
                homeScreen.classList.remove('active'); homeScreen.classList.add('hidden');
                document.getElementById('footer')?.classList.remove('hidden');
            }
            openTab(null, 'map');

        } else { // New Game
            battleStatistics = new BattleStatistics();
            await globalQuestSystem.loadQuests();

            if (!createAndInitHero(heroClasses, null, null)) return false;

            initMapModule();
            if (document.getElementById('heroContent')) {
                 initializeCompanionUI();
            }
            await window.startDialogue('old_maris', 'base');
        }

        // Configure and start autosave AFTER hero and other core systems are initialized
        slConfigureAutosave(globalAutosaveSettings);

        initiateEventListeners();
        initializeQuestLog();
        battleStatistics.updateBattleStatistics();

        // If this is a new game (no saved state), notify slideshow of early completion
        if (!savedGameState) {
            handleEarlyGameInit();
        }

        return true;

    } catch (error) {
        console.error("A critical error occurred during loadGameData:", error);
        alert("A fatal error occurred while initializing the game. Check console.");
        return false;
    }
}
setInitLoadFnForSaveLoad(loadGameData);


function createAndInitHero(classes, playerTeamContext, opposingTeamContext) {
    const baseClassId = 'novice';
    let baseClassInfo = classes[baseClassId] || Object.values(classes)[0];
    if (!baseClassInfo) {
        console.error("Cannot create hero: No classes loaded or 'novice' not found.");
        alert("Fatal: No classes available to create hero.");
        return false;
    }

    const heroSkillsInstances = (baseClassInfo.skills || []).map(skillId => {
        const skillData = allSkillsCache[skillId];
        return skillData ? new Skill(skillData, skillData.effects) : null;
    }).filter(Boolean);

    hero = new Hero("Hero", baseClassInfo, heroSkillsInstances, 1, playerTeamContext, opposingTeamContext);
    hero.placeHeroInFirstAvailableSlot();


    if (document.getElementById('heroContent')) {
        updateStatsDisplay(hero); renderSkills(hero); renderPassiveSkills(hero);
    }
    renderLevelProgress(hero);
    selectInitialSkills();
    return true;
}


function selectInitialSkills() {
    if (!hero || !hero.skills) return;
    const activeSkillBoxes = document.querySelectorAll("#activeSkills .skill-box");
    let activeSelectedCount = 0;
    hero.skills.forEach(skill => {
        if (skill.type === "active" && activeSelectedCount < 4 && activeSkillBoxes[activeSelectedCount]) {
            const skillBox = Array.from(activeSkillBoxes).find(sb => sb.id === 'skill-box-' + skill.name.replace(/\s/g, ''));
            if(skillBox) hero.selectSkill(skill, skillBox, false);
            activeSelectedCount++;
        }
    });

    const passiveSkillBoxes = document.querySelectorAll("#passiveSkills .skill-box");
    let passiveSelectedCount = 0;
    hero.skills.forEach(skill => {
        if (skill.type !== "active" && passiveSelectedCount < 4 && passiveSkillBoxes[passiveSelectedCount]) {
             const skillBox = Array.from(passiveSkillBoxes).find(sb => sb.id === 'skill-box-' + skill.name.replace(/\s/g, ''));
            if(skillBox) hero.selectSkill(skill, skillBox, true);
            passiveSelectedCount++;
        }
    });
}

function initiateBattleLog() {
    const logContainer = document.getElementById('battle-log');
    if (!logContainer) {
        console.warn("Battle log container not found.");
        battleLog = { log: console.log }; // Fallback logger
        return;
    }
    battleLog = new BattleLog(logContainer);
    const toggleLogButton = document.getElementById('toggle-log');
    if (toggleLogButton) {
        let logVisible = true;
        logContainer.style.display = 'block'; // Ensure it's visible by default if button exists
        toggleLogButton.addEventListener('click', () => {
            logVisible = !logVisible;
            logContainer.style.display = logVisible ? 'flex' : 'none';
            toggleLogButton.textContent = logVisible ? 'Hide Log' : 'Show Log';
        });
    }
}

export function renderTeamMembers(membersToRender, containerId, clearExisting = true) {
    const teamContainerElement = document.getElementById(containerId);
    if (!teamContainerElement) {
        return;
    }
    const teamRows = teamContainerElement.querySelectorAll('.team-row');
    if (teamRows.length < 2) {
        console.error(`Team rows not found in ${containerId}. HTML structure issue.`);
        return;
    }

    if (clearExisting) {
        teamRows[0].innerHTML = ''; teamRows[1].innerHTML = '';
    }

    membersToRender.forEach((member, index) => {
        if (!member.isHero) {
            member.memberId = `${containerId}-member-${member.companionId || member.classId || 'unknown'}-${index}`;
        } else {
            member.memberId = `hero-${containerId}`;
        }
    });


    membersToRender.forEach(member => {
        const targetRowIndex = (member.position === "Back") ? 1 : 0;
        let rowElement = teamRows[targetRowIndex];

        if (rowElement.children.length >= 4) {
            const otherRowIndex = (targetRowIndex === 0) ? 1 : 0;
            if (teamRows[otherRowIndex].children.length < 4) {
                rowElement = teamRows[otherRowIndex];
            } else {
                console.warn(`Cannot place ${member.name} in ${containerId}, both rows are full.`);
                return;
            }
        }

        const memberElement = member.isHero ? renderHero(member) : renderMember(member);
        rowElement.appendChild(memberElement);

        if (typeof member.initializeDOMElements === 'function') {
             member.initializeDOMElements();
        }
        updateHealth(member); updateMana(member); updateStamina(member);
    });
}


function initiateEventListeners() {
    const navButtonMappings = {
        'heroContentNavButton': 'heroContent', 'mapNavButton': 'map',
        'libraryNavButton': 'library',
        'battle-statisticsNavButton': 'battle-statistics',
        'questsNavButton': 'quests',
    };
    for (const id in navButtonMappings) {
        const button = document.getElementById(id);
        if (button) {
            const newButton = button.cloneNode(true); // Clone to remove old listeners
            button.parentNode.replaceChild(newButton, button);
            newButton.addEventListener('click', (event) => openTab(event, navButtonMappings[id]));
        }
    }

    const saveGameButton = document.getElementById('saveGameNavButton');
    if (saveGameButton) {
        const newSaveButton = saveGameButton.cloneNode(true);
        saveGameButton.parentNode.replaceChild(newSaveButton, saveGameButton);
        newSaveButton.addEventListener('click', openSaveModal);
    }
    document.getElementById('loadNavButton').addEventListener('click', openLoadModal);

    document.getElementById('repeat-popup')?.addEventListener('click', () => { hidePopupForBattleActions(); battleRepeatStageCmd(); });
    document.getElementById('nextStage-popup')?.addEventListener('click', () => { hidePopupForBattleActions(); battleNextStageCmd(); });
    document.getElementById('return-to-map-popup')?.addEventListener('click', () => { hidePopupForBattleActions(); returnToMap(); });

    const fleeButton = document.getElementById('flee-battle');
    if (fleeButton) { // Re-bind flee if it was cloned or to ensure single listener
        const newFleeButton = fleeButton.cloneNode(true);
        fleeButton.parentNode.replaceChild(newFleeButton, fleeButton);
        newFleeButton.addEventListener('click', attemptFlee);
    }


    document.removeEventListener('keydown', handleGlobalKeyDown);
    document.addEventListener('keydown', handleGlobalKeyDown);


    const tooltipArea = document.getElementById('battlefield') || document.body;
    tooltipArea.addEventListener('mouseover', (event) => {
        const target = event.target.closest('.memberPortrait, .iconDiv, .battleSkillIcon, .buff, .debuff, [data-tooltip-text]');
        if (target) {
            const tooltip = target.querySelector('.tooltip, .effectTooltip');
            if (tooltip && tooltip.innerHTML.trim()) showTooltip(event, tooltip);
        }
    }, true);
    tooltipArea.addEventListener('mouseout', (event) => {
        const target = event.target.closest('.memberPortrait, .iconDiv, .battleSkillIcon, .buff, .debuff, [data-tooltip-text]');
        const tooltip = target?.querySelector('.tooltip, .effectTooltip');
        if (tooltip) { tooltip.style.display = 'none'; tooltip.style.visibility = 'hidden'; }
    }, true);

}

function handleGlobalKeyDown(event) {
    if (event.code === 'Space') {
        const activeTab = document.querySelector('.tabcontent.active');
        if (activeTab && activeTab.id === 'battlefield') {
            togglePause();
        }
    }
}


function hidePopupForBattleActions() {
    document.getElementById('popup')?.classList.add('hidden');
}


document.addEventListener('DOMContentLoaded', async () => {
    initializeHomeScreen();
    await initializeDialogue();
    initializeQuestLog();
    initializeClassChange();

    document.querySelectorAll('.back-to-map-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const mapNavButton = document.getElementById('mapNavButton') || document.querySelector('.tablinks[onclick*="\'map\'"]');
            if (mapNavButton) openTab({ currentTarget: mapNavButton }, 'map');
        });
    });

    // Add event listener for change class button
    document.getElementById('changeClassButton').addEventListener('click', openClassChangeModal);
});


function togglePause() {
    isPaused = !isPaused;
    const overlayTarget = document.getElementById('teamAndBattleContainer-overlay') || document.getElementById('battlefield');
    if (!overlayTarget) return;

    overlayTarget.classList.toggle('paused-overlay', isPaused);
    if (battleLog) battleLog.log(isPaused ? "Battle Paused" : "Battle Resumed");

    const activeBattleParty = hero ? hero.getActivePartyMembers() : [];
    const enemyParty = team2 ? team2.members : [];

    [...activeBattleParty, ...enemyParty].forEach(member => {
        if (member && member.currentHealth > 0) {
            if (isPaused) member.stopSkills();
            else member.startSkills();
        }
    });
}

export { hero, battleLog, battleStatistics, evolutionService, allSkillsCache, allHeroClasses };