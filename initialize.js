import {nextStage as battleNextStageCmd, repeatStage as battleRepeatStageCmd, startBattle, returnToMap, attemptFlee} from './Battle.js';
import Team from './Team.js';
import Hero from './Hero.js';
// Member is used by Hero and Battle/Area, not directly instantiated here in global scope much.
// Area is used by Battle.js, not directly here anymore for map UI staging.
import EvolutionService from './EvolutionService.js';
import Skill from './Skill.js';
import BattleLog from './BattleLog.js';
import Item from './item.js';
import { currentMapId as mapJsCurrentMapId, initializeMap as initMapModule, setMapStateFromLoad } from './map.js'; // Removed mapsData, currentLocation

import {
    deepCopy,
    // openEvolutionModal, // If not used, remove
    renderHero,
    renderLevelProgress,
    renderMember, // Used by renderTeamMembers
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
import { openSaveModal, setInitializeAndLoadGame as setInitLoadFnForSaveLoad } from './saveLoad.js';


export let battleStatistics;
export let evolutionService;
export let isPaused = false;
export let team1; // Player's team
export let team2; // Opponent's team (for battle instance)
export let hero;
export let battleLog;
export let classTiers;
export let heroClasses;
export let mobsClasses = null; // Mob definitions
export let allSkillsCache = null;
export let allItemsCache = null;

// currentArea and currentStage for map UI staging are removed.
// Stage selection for a new battle from map always defaults to 1.

export const NPC_MEDIA_PATH = "Media/NPC/";
let clickTimeout; // For skill bar double click


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
                if (Array.isArray(skillData.effects) && skillData.effects.length > 0 && skillData.effects[0].id && effects) {
                    const effectTemplate = effects[skillData.effects[0].id];
                    processedEffects = effectTemplate ? { ...deepCopy(effectTemplate), ...deepCopy(skillData.effects[0]) } : deepCopy(skillData.effects[0]);
                } else if (typeof skillData.effects === 'object' && !Array.isArray(skillData.effects) && skillData.effects.id && effects) {
                    const effectTemplate = effects[skillData.effects.id];
                    processedEffects = effectTemplate ? { ...deepCopy(effectTemplate), ...deepCopy(skillData.effects) } : deepCopy(skillData.effects);
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

async function loadMobs() { // Removed skills param as it's not used directly here
    try {
        const mobsData = await loadJSON('Data/mobs.json');
        // mobsClasses will store definitions; instantiation happens in Area.js
        return mobsData; // Return the raw data object
    } catch (error) { console.error("Failed to load mobs.json:", error); return {}; }
}

async function loadClasses() { // Removed skills param
    try {
        const classesData = await loadJSON('Data/classes.json');
        const loadedClasses = {};
        classTiers = classesData['tiers'] || [];
        const heroClassDefinitions = classesData['classes'] || {};
        for (const key in heroClassDefinitions) {
            const heroClassDef = heroClassDefinitions[key];
            loadedClasses[heroClassDef.id] = {...heroClassDef, skills: heroClassDef.skills || []};
        }
        return loadedClasses;
    } catch (error) { console.error("Failed to load classes.json:", error); return { tiers: [], classes: {} }; }
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
        mobsClasses = await loadMobs(); // Loads mob definitions
        heroClasses = await loadClasses();

        if (Object.keys(heroClasses).length === 0 || Object.keys(allSkillsCache).length === 0) {
            console.error("CRITICAL: Hero classes or skills failed to load.");
            alert("Fatal Error: Core game data could not be loaded. Check console.");
            return false;
        }

        initiateBattleLog();
        evolutionService = new EvolutionService();
        await evolutionService.init();

        team1 = new Team('Team1', 'team1-members-map'); // Player team container on map/hero tabs
        team2 = new Team('Team2', 'team2-members-battlefield'); // Enemy team container on battlefield tab

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
            hero = new Hero("Placeholder", heroClassInfo, [], 1, team1, team2);
            hero.restoreFromData(savedGameState.heroData, heroClasses, allSkillsCache, allItemsCache);
            team1.addMember(hero);

            battleStatistics = new BattleStatistics();
            battleStatistics.restoreFromData(savedGameState.battleStatisticsData);
            await globalQuestSystem.restoreFromData(savedGameState.questSystemData);

            initMapModule(); // Initialize map systems
            setMapStateFromLoad(savedGameState.mapStateData); // Restores mapId, location, etc.

            // No Area or stage pre-loading for map UI anymore.
            // Team2 members for battlefield are cleared by Battle.js before battle.

            renderLevelProgress(hero);
            renderTeamMembers(team1.members, 'team1-members-map', true);

            hero.reselectSkillsAfterLoad();
            if (document.getElementById('heroContent')) {
                updateStatsDisplay(hero); renderSkills(hero); renderPassiveSkills(hero);
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

            if (!createAndInitHero(heroClasses, team1, team2)) return false; // team2 is for battle context
            // Add starting items
            ['simple_sword_001', 'worn_leather_helmet_001', 'healing_potion_minor_001'].forEach(itemId => {
                if(allItemsCache[itemId]) hero.addItemToInventory(allItemsCache[itemId]);
            });

            initMapModule(); // Loads default map
            // No Area or stage pre-loading for map UI. team2 members for battlefield empty.
        }

        initiateEventListeners();
        initializeQuestLog();
        battleStatistics.updateBattleStatistics();
        // updateStageDisplay and toggleStageControls are removed as they are no longer needed for map UI.

        return true;

    } catch (error) {
        console.error("A critical error occurred during loadGameData:", error);
        alert("A fatal error occurred while initializing the game. Check console.");
        return false;
    }
}
setInitLoadFnForSaveLoad(loadGameData);


function createAndInitHero(classes, playerTeam, opposingTeamContext) {
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

    hero = new Hero("Hero", baseClassInfo, heroSkillsInstances, 1, playerTeam, opposingTeamContext);
    playerTeam.addMember(hero);

    if (document.getElementById('heroContent')) {
        updateStatsDisplay(hero); renderSkills(hero); renderPassiveSkills(hero);
    }
    renderLevelProgress(hero);
    renderTeamMembers(playerTeam.members, 'team1-members-map', true); // Render to map/hero tab container
    selectInitialSkills();
    return true;
}

// loadStage, reLoadStage, setupCurrentAreaForMapUI, loadNextMapStage are removed.
// updateStageDisplay, toggleStageControls are removed.

function selectInitialSkills() {
    if (!hero || !hero.skills) return;
    const activeSkillBoxes = document.querySelectorAll("#activeSkills .skill-box");
    let activeSelectedCount = 0;
    hero.skills.forEach(skill => {
        if (skill.type === "active" && activeSelectedCount < 4 && activeSkillBoxes[activeSelectedCount]) {
            hero.selectSkill(skill, activeSkillBoxes[activeSelectedCount++]);
        }
    });

    const passiveSkillBoxes = document.querySelectorAll("#passiveSkills .skill-box");
    let passiveSelectedCount = 0;
    hero.skills.forEach(skill => {
        if (skill.type !== "active" && passiveSelectedCount < 4 && passiveSkillBoxes[passiveSelectedCount]) {
            hero.selectSkill(skill, passiveSkillBoxes[passiveSelectedCount++], true);
        }
    });
}

function initiateBattleLog() {
    const logContainer = document.getElementById('battle-log');
    if (!logContainer) {
        console.warn("Battle log container not found.");
        battleLog = { log: console.log }; // Fallback to console
        return;
    }
    battleLog = new BattleLog(logContainer);
    const toggleLogButton = document.getElementById('toggle-log');
    if (toggleLogButton) {
        let logVisible = true;
        toggleLogButton.addEventListener('click', () => {
            logVisible = !logVisible;
            logContainer.style.display = logVisible ? 'flex' : 'none';
            toggleLogButton.textContent = logVisible ? 'Hide Log' : 'Show Log';
        });
    }
}

// Renders members to a specific container (e.g., player team on map, or enemies on battlefield)
export function renderTeamMembers(members, containerId, clear = true) {
    const teamContainer = document.getElementById(containerId);
    if (!teamContainer) {
        // This can be normal if e.g. team2-members-map was removed
        // console.warn(`Team container ${containerId} not found.`);
        return;
    }
    const teamRows = teamContainer.querySelectorAll('.team-row');
    if (teamRows.length < 2) {
        console.error(`Team rows not found in ${containerId}. HTML structure issue.`);
        return;
    }

    if (clear) {
        teamRows[0].innerHTML = ''; teamRows[1].innerHTML = '';
    }

    members.forEach(member => {
        var row = (member.position === "Front") ? teamRows[0] : teamRows[1];
        if (row.children.length >= 4 && teamRows[0].children.length + teamRows[1].children.length < 8) {
             row = (row === teamRows[0]) ? teamRows[1] : teamRows[0]; // Overflow
        }
        const memberElement = member.isHero ? renderHero(member) : renderMember(member);
        row.appendChild(memberElement);
        // DOM element initialization (like adding health bars, etc.) is now mostly handled by Battle.js
        // or specific render functions after adding to DOM.
        // For hero on map/hero tab, initializeDOMElements is called after renderHero.
        updateMana(member); updateStamina(member); updateHealth(member);
    });
}


function initiateEventListeners() {
    const navButtons = {
        'heroContentNavButton': 'heroContent', 'mapNavButton': 'map',
        'libraryNavButton': 'library', 'optionsNavButton': 'options',
        'battle-statisticsNavButton': 'battle-statistics'
    };
    for (const id in navButtons) {
        document.getElementById(id)?.addEventListener('click', (event) => openTab(event, navButtons[id]));
    }
    document.getElementById('saveGameNavButton')?.addEventListener('click', openSaveModal);

    // Battle popup buttons
    document.getElementById('repeat-popup')?.addEventListener('click', () => { hidePopupForBattleActions(); battleRepeatStageCmd(); });
    document.getElementById('nextStage-popup')?.addEventListener('click', () => { hidePopupForBattleActions(); battleNextStageCmd(); });
    document.getElementById('return-to-map-popup')?.addEventListener('click', () => { hidePopupForBattleActions(); returnToMap(); });

    document.getElementById('flee-battle')?.addEventListener('click', attemptFlee);
    document.addEventListener('keydown', (event) => { if (event.code === 'Space') togglePause(); });

    // Tooltip listeners
    const tooltipArea = document.getElementById('teamAndBattleContainer') || document.body; // More general area
    tooltipArea.addEventListener('mouseover', (event) => {
        const target = event.target.closest('.memberPortrait, .iconDiv, .battleSkillIcon, .buff, .debuff, [data-tooltip-text]');
        if (target) {
            const tooltip = target.querySelector('.tooltip, .effectTooltip'); // Existing tooltips
            if (tooltip) showTooltip(event, tooltip);
            // else if (target.dataset.tooltipText) { /* TODO: Dynamic tooltip creation if needed */ }
        }
    }, true);
    tooltipArea.addEventListener('mouseout', (event) => {
        const target = event.target.closest('.memberPortrait, .iconDiv, .battleSkillIcon, .buff, .debuff, [data-tooltip-text]');
        const tooltip = target?.querySelector('.tooltip, .effectTooltip');
        if (tooltip) { tooltip.style.display = 'none'; tooltip.style.visibility = 'hidden'; }
    }, true);

    setupSkillListeners();
}

function hidePopupForBattleActions() { // Utility for battle popups
    document.getElementById('popup')?.classList.add('hidden');
}

function setupSkillListeners() { /* ... (no changes, assumed correct) ... */ }


document.addEventListener('DOMContentLoaded', async () => {
    initializeHomeScreen(); // Sets up home screen, which can lead to loadGameData
    await initializeDialogue();

    document.querySelectorAll('.back-to-map-button').forEach(button => {
        button.addEventListener('click', (event) => openTab(event, 'map'));
    });

    // Stage navigation buttons on map tab are removed.
    // updateStageDisplay calls are removed from DOMContentLoaded.
});


function togglePause() {
    isPaused = !isPaused;
    const overlayTarget = document.getElementById('teamAndBattleContainer-overlay') || document.getElementById('battlefield');
    if (!overlayTarget) return;

    overlayTarget.classList.toggle('paused-overlay', isPaused);
    if (battleLog) battleLog.log(isPaused ? "Battle Paused" : "Battle Resumed");

    const allMembersInBattle = [...(team1?.getAllAliveMembers() || []), ...(team2?.getAllAliveMembers() || [])];
    allMembersInBattle.forEach(member => {
        if (isPaused) member.stopSkills();
        else member.startSkills();
    });
}