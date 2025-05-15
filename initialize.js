
import {nextStage, repeatStage, startBattle, returnToMap, attemptFlee} from './Battle.js';
import Team from './Team.js';
import Hero from './Hero.js';
import Member from './Member.js';
import Area from './Area.js'; // Make sure Area.js defines the Area class
import EvolutionService from './EvolutionService.js';
import Skill from './Skill.js';
import BattleLog from './BattleLog.js';
import Item from './item.js';
import {
    deepCopy,
    openEvolutionModal,
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
    updatePassiveSkillTooltip // Added missing import
} from './Render.js';
import BattleStatistics from './BattleStatistics.js';
import {openTab} from './navigation.js';
import {initializeMap as initMapModule} from './map.js';
import {initializeHomeScreen} from './home.js';
import {initializeDialogue} from './dialogue.js';
import {questSystem as globalQuestSystem} from './questSystem.js';
import {initializeQuestLog} from './questLog.js';
import { openSaveModal } from './saveLoad.js';

export let battleStatistics;
export let evolutionService;
export let isPaused = false;
export let team1;
export let team2;
export let hero;
export let battleLog;
export let classTiers;
export let heroClasses;
export let currentArea;
export let mobsClasses = null;
let currentStage = 1;
let clickTimeout;
export const NPC_MEDIA_PATH = "Media/NPC/";
export let allSkillsCache = null;
export let allItemsCache = null;

async function loadJSON(url) {
    const response = await fetch(url);
    if (!response.ok) { // Check for HTTP errors immediately
        throw new Error(`HTTP error ${response.status} for URL: ${url}`);
    }
    return response.json(); // This can also throw if not valid JSON
}

async function loadEffects() {
    try {
        const data = await loadJSON('Data/effects.json');
        return data;
    } catch (error) {
        console.error("Failed to load effects.json:", error);
        return {}; // Return empty object to prevent further crashes
    }
}

async function loadSkills(effects, path) {
    try {
        const data = await loadJSON(path);
        const skills = {};
        Object.keys(data).forEach(skillKey => {
            const skillData = data[skillKey];
            // Ensure skillData has an ID, if not, use the key
            if (!skillData.id) {
                skillData.id = skillKey;
            }
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
            skills[skillKey] = { ...skillData, effects: processedEffects, id: skillKey };
        });
        return skills;
    } catch (error) {
        console.error(`Failed to load skills from ${path}:`, error);
        return {};
    }
}

async function loadItems() {
    try {
        const manifestResponse = await fetch('Data/items_manifest.json');
        if (!manifestResponse.ok) {
            throw new Error(`HTTP error ${manifestResponse.status} for items_manifest.json`);
        }
        const itemFiles = await manifestResponse.json();
        const loadedItems = {};

        for (const fileName of itemFiles) {
            const itemResponse = await fetch(`Data/Items/${fileName}`);
            if (!itemResponse.ok) {
                console.warn(`Failed to load item file ${fileName}. Status: ${itemResponse.status}`);
                continue;
            }
            const itemData = await itemResponse.json();
            if (itemData.id) {
                loadedItems[itemData.id] = new Item(itemData); // Item constructor handles skill instantiation
            } else {
                console.warn(`Item in ${fileName} is missing an 'id'. Skipping.`);
            }
        }
        return loadedItems;
    } catch (error) {
        console.error("Failed to load items:", error);
        return {};
    }
}

async function loadMobs(skills) {
    try {
        const mobsData = await loadJSON('Data/mobs.json');
        const loadedMobs = {};
        for (const key in mobsData) {
            const mobDef = mobsData[key];
            const mobSkills = (mobDef.skills || []).map(id => {
                const skillData = skills[id];
                if (!skillData) {
                    console.warn(`Skill ID '${id}' not found in allSkillsCache for mob '${mobDef.name}'. Skipping skill.`);
                    return null;
                }
                return new Skill(skillData, skillData.effects);
            }).filter(Boolean);
            loadedMobs[mobDef.id] = new Member(mobDef.name, mobDef, mobSkills, mobDef.level || 1);
        }
        return loadedMobs;
    } catch (error) {
        console.error("Failed to load mobs.json:", error);
        return {};
    }
}

async function loadClasses(skills) {
    try {
        const classesData = await loadJSON('Data/classes.json');
        const loadedClasses = {};
        classTiers = classesData['tiers'] || []; // Ensure classTiers is an array
        const heroClassDefinitions = classesData['classes'] || {};
        for (const key in heroClassDefinitions) {
            const heroClassDef = heroClassDefinitions[key];
            loadedClasses[heroClassDef.id] = {...heroClassDef, skills: heroClassDef.skills || []};
        }
        return loadedClasses;
    } catch (error) {
        console.error("Failed to load classes.json:", error);
        return { tiers: [], classes: {} }; // Return default structure
    }
}

async function loadAreaInstance(jsonPath) {
    const area = new Area(jsonPath);

    if (!jsonPath) {
        console.error("loadAreaInstance called with undefined or null jsonPath. Creating a default error area.");
        area.name = "Error: No Area Path";
        area.jsonPath = "error/no_path_provided.json";
        area.stages = [];
        area.description = "The path to the area's data file was missing or invalid.";
        area.stageNumber = 1;
        return area;
    }

    try {
        const response = await fetch(jsonPath);
        if (!response.ok) {
            console.error(`Failed to fetch area data from ${jsonPath}. Status: ${response.status} ${response.statusText}`);
            area.name = `Error Loading: ${jsonPath.split('/').pop()}`;
            area.description = `HTTP error ${response.status} when fetching.`;
            area.stages = [];
            return area;
        }
        const data = await response.json();

        area.name = data.name || `Unnamed Area (${jsonPath.split('/').pop()})`;
        area.stages = data.stages || [];
        area.description = data.description || "No description provided.";
        area.stageNumber = data.stageNumber || area.stageNumber || 1;
    } catch (error) {
        console.error(`Failed to load or parse area data from ${jsonPath}:`, error);
        area.name = `Error Parsing: ${jsonPath.split('/').pop()}`;
        area.description = `Error during area data processing: ${error.message}. File might not be valid JSON.`;
        area.stages = [];
    }
    return area;
}
export async function loadGameData(savedGameState = null) {
    try {
        console.log(savedGameState ? "Loading game from saved state." : "Starting new game.");

        const effects = await loadEffects();
        let skillsFromFile = await loadSkills(effects, 'Data/skills.json');
        const passiveSkillsFromFile = await loadSkills(effects, 'Data/passives.json');
        allSkillsCache = {...skillsFromFile, ...passiveSkillsFromFile};

        allItemsCache = await loadItems();

        mobsClasses = await loadMobs(allSkillsCache);
        heroClasses = await loadClasses(allSkillsCache);

        if (Object.keys(heroClasses).length === 0 || Object.keys(allSkillsCache).length === 0) {
            console.error("CRITICAL: Hero classes or skills failed to load. Cannot proceed.");
            alert("Fatal Error: Core game data (classes or skills) could not be loaded. Check console.");
            return false;
        }

        initiateBattleLog();
        evolutionService = new EvolutionService();
        await evolutionService.init();

        if (savedGameState) {
            if (!savedGameState.heroData || !savedGameState.currentAreaIdentifier || !savedGameState.currentAreaIdentifier.jsonPath) {
                console.error("CRITICAL: Saved game state is missing heroData or currentAreaIdentifier.jsonPath.", savedGameState);
                alert("Error: Save data is corrupted (missing hero or area path). Cannot load game.");
                return false;
            }

            team1 = new Team('Team1', 'team1-members');
            team2 = new Team('Team2', 'team2-members');

            const classIdentifierForTempHero = savedGameState.heroData.classId || savedGameState.heroData.classType;
            let tempClassInfo = heroClasses[classIdentifierForTempHero];

            if (!tempClassInfo) {
                console.warn(`Class for temp hero creation not found with identifier '${classIdentifierForTempHero}'. Trying '${savedGameState.heroData.classType}' if different, then 'novice'.`);
                if (savedGameState.heroData.classId && classIdentifierForTempHero !== savedGameState.heroData.classType) {
                    tempClassInfo = heroClasses[savedGameState.heroData.classType];
                }
                if (!tempClassInfo) tempClassInfo = heroClasses['novice'];
                if (!tempClassInfo) {
                    const firstClassKey = Object.keys(heroClasses)[0];
                    if (firstClassKey) {
                        tempClassInfo = heroClasses[firstClassKey];
                        console.warn(`'novice' class also not found. Using first available: '${firstClassKey}'`);
                    } else {
                        alert("Critical error: No hero classes loaded. Cannot create hero.");
                        return false;
                    }
                }
            }

            const tempHeroSkills = (tempClassInfo.skills || []).map(id => {
                const skillData = allSkillsCache[id];
                if (!skillData) {
                    console.error(`Skill ID ${id} not found in allSkillsCache for temp hero class ${tempClassInfo.name}.`);
                    return null;
                }
                return new Skill(skillData, skillData.effects);
            }).filter(Boolean);

            hero = new Hero("Placeholder", tempClassInfo, tempHeroSkills , 1, team1, team2);
            hero.restoreFromData(savedGameState.heroData, heroClasses, allSkillsCache, allItemsCache);
            team1.addMember(hero);

            battleStatistics = new BattleStatistics();
            battleStatistics.restoreFromData(savedGameState.battleStatisticsData);

            await globalQuestSystem.restoreFromData(savedGameState.questSystemData);

            currentArea = await loadAreaInstance(savedGameState.currentAreaIdentifier.jsonPath);
            if (!currentArea || currentArea.jsonPath === "error/no_path_provided.json" || (currentArea.stages.length === 0 && currentArea.jsonPath !== "Data/Areas/emptyPlaceholder.json")) {
                 console.warn(`Current area '${savedGameState.currentAreaIdentifier.jsonPath}' loaded with issues or is empty. Game might not function correctly for this area.`);
            }
            currentStage = savedGameState.currentAreaIdentifier.stageNumber || 1;

            renderLevelProgress(hero);
            renderTeamMembers(team1.members, 'team1', true);

            hero.reselectSkillsAfterLoad();
            if (document.getElementById('heroContent')) {
                updateStatsDisplay(hero);
                 renderSkills(hero);
                 renderPassiveSkills(hero);
            }
            const homeScreen = document.getElementById('home-screen');
            if (homeScreen && homeScreen.classList.contains('active')) {
                homeScreen.classList.remove('active');
                homeScreen.classList.add('hidden');
                const footer = document.getElementById('footer');
                if (footer) footer.classList.remove('hidden');
            }
            openTab(null, 'map');

        } else {
            // New Game
            battleStatistics = new BattleStatistics();
            await globalQuestSystem.loadQuests();

            currentArea = await loadAreaInstance("Data/Areas/goblinPlains.JSON");
            if (!currentArea || currentArea.stages.length === 0) {
                 console.error("CRITICAL: Initial area 'goblinPlains.JSON' failed to load or is empty. Cannot start new game.");
                 alert("Fatal Error: Could not load initial game area. Check console.");
                 return false;
            }
           currentStage = 1;
            team1 = new Team('Team1', 'team1-members');
            team2 = new Team('Team2', 'team2-members');
            createAndInitHero(heroClasses, team1, team2); // This might return false if it fails
            if (!hero) { // If createAndInitHero failed to set hero
                console.error("Hero creation failed. Cannot proceed with new game.");
                return false;
            }
             if (allItemsCache['simple_sword_001']) hero.addItemToInventory(allItemsCache['simple_sword_001']);
            if (allItemsCache['worn_leather_helmet_001']) hero.addItemToInventory(allItemsCache['worn_leather_helmet_001']);
            if (allItemsCache['healing_potion_minor_001']) hero.addItemToInventory(allItemsCache['healing_potion_minor_001']);

            loadStage(currentStage, mobsClasses);
        }

        initiateEventListeners(); // General listeners not dependent on specific stage elements
        initializeQuestLog();
        initMapModule(); // Initializes map DOM elements and base map logic

        battleStatistics.updateBattleStatistics();
        updateStageDisplay(); // Update stage display after everything is loaded
        return true;

    } catch (error) {
        console.error("A critical error occurred during loadGameData:", error);
        alert("A fatal error occurred while initializing the game. Please check the console for details and try refreshing. If the problem persists, the game data might be corrupted.");
        return false;
    }
}

function createAndInitHero(classes, team, opposingTeam) {
    const baseClassId = 'novice';
    let baseClassInfo;

    if (!classes || Object.keys(classes).length === 0) {
        console.error("Cannot create hero: No classes loaded.");
        alert("Fatal: No classes available to create hero.");
        hero = null; // Ensure hero is null if creation fails
        return false; // Indicate failure
    }

    baseClassInfo = classes[baseClassId];
    if (!baseClassInfo) {
        console.warn(`'novice' class not found. Using first available class.`);
        const fallbackClassId = Object.keys(classes)[0];
        baseClassInfo = classes[fallbackClassId];
        if (!baseClassInfo) { // Should not happen if previous check passed, but defensive
            alert("Fatal: Could not find any suitable class for the hero.");
            hero = null;
            return false;
        }
         hero = new Hero("Hero (Default)", baseClassInfo, (baseClassInfo.skills || []).map(skillId => new Skill(allSkillsCache[skillId], allSkillsCache[skillId].effects)), 1, team, opposingTeam);
    } else {
        const heroSkillsInstances = (baseClassInfo.skills || []).map(skillId => {
            const skillData = allSkillsCache[skillId];
             if (!skillData) {
                console.warn(`Skill ID ${skillId} not found for novice class.`); return null;
            }
            return new Skill(skillData, skillData.effects);
        }).filter(Boolean);
        hero = new Hero("Hero", baseClassInfo, heroSkillsInstances, 1, team, opposingTeam);
    }

    if (!hero) { // Should be caught by earlier returns, but as a final check
        console.error("Failed to instantiate Hero object.");
        return false;
    }

    team1.addMember(hero);
    if (document.getElementById('heroContent')) { // Check if hero tab elements are ready
        updateStatsDisplay(hero); // Initial render of inventory/equipment
        renderSkills(hero);
        renderPassiveSkills(hero);
    }
    renderLevelProgress(hero);
    renderTeamMembers(team1.members, 'team1', true);
    if (document.getElementById('heroContent')) {
        renderSkills(hero);
        renderPassiveSkills(hero);
    }
    selectInitialSkills();
    return true; // Indicate success
}

export function loadStage(stageNumToLoad, mobs) {
    if (!currentArea || !currentArea.stages || currentArea.stages.length === 0) {
        console.error("Area data, stages not loaded, or no stages defined. Cannot load stage.", currentArea);
        const stageDisplay = document.getElementById('current-stage');
        if (stageDisplay) stageDisplay.textContent = "Error: Area not loaded";
        return;
    }
    if (stageNumToLoad < 1 || stageNumToLoad > currentArea.stages.length) {
        console.warn(`Attempted to load invalid stage number: ${stageNumToLoad}. Max stages: ${currentArea.stages.length}. Defaulting to 1 or max.`);
        stageNumToLoad = Math.max(1, Math.min(stageNumToLoad, currentArea.stages.length));
        if (currentArea.stages.length === 0) stageNumToLoad = 1;
    }

    currentArea.stageNumber = stageNumToLoad;
    currentStage = stageNumToLoad;
    updateStageDisplay(); // Update display whenever stage changes

    team2.clearMembers();
    let memberIndex = 0;
    var team2Members = [];

    if (typeof currentArea.spawnMobs !== 'function') {
        console.error("currentArea.spawnMobs is not a function. Cannot spawn mobs for stage.");
        renderTeamMembers([], 'team2', true);
        return;
    }

    try {
        const spawnedMobs = currentArea.spawnMobs(mobs, team2, stageNumToLoad);
        (spawnedMobs || []).forEach(member => {
            if (member instanceof Member) {
                member.initialize(team1, team2, memberIndex);
                memberIndex++;
                team2Members.push(member);
            } else {
                console.warn("spawnMobs returned a non-Member object:", member);
            }
        });
    } catch (e) {
        console.error("Error during currentArea.spawnMobs:", e);
    }

    renderTeamMembers(team2Members, 'team2', true);
    team2.addMembers(team2Members);
}

export function reLoadStage() {
    loadStage(currentStage, mobsClasses);
}

function selectInitialSkills() {
    if (!hero || !hero.skills) return; // Guard against hero not being initialized
    const activeSkillBoxes = document.querySelectorAll("#activeSkills .skill-box");
    let activeSelectedCount = 0;
    for (let i = 0; i < hero.skills.length && activeSelectedCount < 4; i++) {
        if (hero.skills[i] && hero.skills[i].type === "active" && activeSkillBoxes[activeSelectedCount]) {
            hero.selectSkill(hero.skills[i], activeSkillBoxes[activeSelectedCount]);
            activeSelectedCount++;
        }
    }

    const passiveSkillBoxes = document.querySelectorAll("#passiveSkills .skill-box");
    let passiveSelectedCount = 0;
    for (let i = 0; i < hero.skills.length && passiveSelectedCount < 4; i++) {
        if (hero.skills[i] && hero.skills[i].type !== "active" && passiveSkillBoxes[passiveSelectedCount]) {
             hero.selectSkill(hero.skills[i], passiveSkillBoxes[passiveSelectedCount], true);
             passiveSelectedCount++;
        }
    }
}

function initiateBattleLog() {
    const logContainer = document.getElementById('battle-log');
    if (!logContainer) {
        console.warn("Battle log container not found.");
        battleLog = { log: () => {} }; // Dummy log if no container
        return;
    }
    battleLog = new BattleLog(logContainer);

    const toggleLogButton = document.getElementById('toggle-log');
    let logVisible = true;

    if (toggleLogButton && logContainer) {
        toggleLogButton.addEventListener('click', () => {
            logVisible = !logVisible;
            logContainer.style.display = logVisible ? 'flex' : 'none';
            toggleLogButton.textContent = logVisible ? 'Hide Log' : 'Show Log';
        });
    }
}

export function renderTeamMembers(members, containerId, clear = true) {
    const teamContainer = document.getElementById(containerId);
    if (!teamContainer) {
        console.error(`Team container ${containerId} not found.`);
        return;
    }
    const teamRows = teamContainer.querySelectorAll('.team-row');
    if (teamRows.length < 2) {
        console.error(`Team rows not found in ${containerId}. Ensure HTML has two .team-row children.`);
        return;
    }

    if (clear) {
        teamRows[0].innerHTML = '';
        teamRows[1].innerHTML = '';
    }

    members.forEach(member => {
        var row = (member.position === "Front") ? teamRows[0] : teamRows[1];
        if (row.children.length >= 4) {
            row = (row === teamRows[0]) ? teamRows[1] : teamRows[0];
        }

        let memberElement;
        if (member.isHero) {
            memberElement = renderHero(member);
        } else {
            memberElement = renderMember(member);
        }
        row.appendChild(memberElement);

        member.initializeDOMElements();
        updateMana(member);
        updateStamina(member);
        updateHealth(member);
    });
}

function initiateEventListeners() {
    // Ensure elements exist before adding listeners
    const heroNav = document.getElementById('heroContentNavButton');
    const mapNav = document.getElementById('mapNavButton');
    const libraryNav = document.getElementById('libraryNavButton');
    const optionsNav = document.getElementById('optionsNavButton');
    const statsNav = document.getElementById('battle-statisticsNavButton');
    const saveNav = document.getElementById('saveGameNavButton');

    if (heroNav) heroNav.addEventListener('click', (event) => openTab(event, 'heroContent'));
    if (mapNav) mapNav.addEventListener('click', (event) => openTab(event, 'map'));
    if (libraryNav) libraryNav.addEventListener('click', (event) => openTab(event, 'library'));
    if (optionsNav) optionsNav.addEventListener('click', (event) => openTab(event, 'options'));
    if (statsNav) statsNav.addEventListener('click', (event) => openTab(event, 'battle-statistics'));
    if (saveNav) saveNav.addEventListener('click', openSaveModal);


    const repeatPopup = document.getElementById('repeat-popup');
    const nextStagePopup = document.getElementById('nextStage-popup');
    const returnToMapPopup = document.getElementById('return-to-map-popup');

    if (repeatPopup) repeatPopup.addEventListener('click', () => { hidePopupForBattleActions(); repeatStage(); });
    if (nextStagePopup) nextStagePopup.addEventListener('click', () => { hidePopupForBattleActions(); nextStage();});
    if (returnToMapPopup) returnToMapPopup.addEventListener('click', () => { hidePopupForBattleActions(); returnToMap();});

    const fleeButton = document.getElementById('flee-battle');
    if (fleeButton) {
        fleeButton.addEventListener('click', () => attemptFlee());
    }

    document.addEventListener('keydown', (event) => {
        if (event.code === 'Space') {
            togglePause();
        }
    });

    const teamAndBattleContainer = document.getElementById('teamAndBattleContainer');
    if (teamAndBattleContainer) {
        teamAndBattleContainer.addEventListener('mouseover', (event) => {
            const target = event.target.closest('.memberPortrait, .iconDiv, .battleSkillIcon, .buff, .debuff');
            if (target) {
                const tooltip = target.querySelector('.tooltip, .effectTooltip');
                if (tooltip) {
                    showTooltip(event, tooltip);
                }
            }
        }, true);

        teamAndBattleContainer.addEventListener('mouseout', (event) => {
            const target = event.target.closest('.memberPortrait, .iconDiv, .battleSkillIcon, .buff, .debuff');
            if (target) {
                const tooltip = target.querySelector('.tooltip, .effectTooltip');
                if (tooltip) {
                    tooltip.style.display = 'none';
                    tooltip.style.visibility = 'hidden';
                }
            }
        }, true);
    }
    setupSkillListeners();
}

function hidePopupForBattleActions() {
    const popup = document.getElementById('popup');
    if (popup) popup.classList.add('hidden');
}

function setupSkillListeners() {
    if (!hero) return; // Don't setup if hero isn't loaded
    for (let i = 1; i <= 12; i++) { // Assuming max 12 skill slots for hero bar (adjust if different)
        const skillElement = document.getElementById("skill" + i);
        if (!skillElement) continue;

        const skillImg = skillElement.querySelector('img');
        // Tooltip is often nextElementSibling if it's a direct sibling div/span
        const tooltip = skillElement.querySelector('.tooltip') || skillElement.nextElementSibling;
        
        if (!skillImg) {
            console.warn(`Skill image not found for #skill${i}`);
            continue;
        }
        if (!tooltip || !tooltip.classList || (!tooltip.classList.contains('tooltip') && !tooltip.classList.contains('skill-tooltip'))) {
             // console.warn(`Tooltip not found or invalid for #skill${i}. Expected sibling or child with class 'tooltip' or 'skill-tooltip'. Current nextSibling:`, skillElement.nextSibling);
             // For now, we'll just skip tooltip logic if not found correctly
        }


        const skillInSlot = hero.selectedSkills[i - 1]; // Get skill from hero's selected skills array

        if (skillInSlot) {
            skillImg.src = skillInSlot.icon || "Media/UI/defaultSkill.jpeg"; // Set icon
            skillElement.classList.remove("empty-skill-slot"); // Or similar class for empty
            if (skillInSlot.repeat && skillInSlot.type === "active") {
                skillElement.classList.add("rainbow");
            } else {
                skillElement.classList.remove("rainbow");
            }
            if (tooltip) { // Only update if tooltip element is valid
                if (skillInSlot.type === "passive") {
                    updatePassiveSkillTooltip(tooltip, skillInSlot);
                } else {
                    updateSkillTooltip(tooltip, skillInSlot);
                }
            }
        } else {
            skillElement.classList.remove("rainbow");
            skillElement.classList.add("empty-skill-slot"); // Mark as empty
            skillImg.src = "Media/UI/defaultSkill.jpeg"; // Default empty icon
            if (tooltip) tooltip.innerHTML = "Empty Slot";
        }

        // Remove old listeners before adding new ones to prevent accumulation if this function is called multiple times
        // A more robust way is to use a named function and remove it, or AbortController
        // For simplicity here, we'll rely on this function being called once after hero is ready,
        // or hero.reselectSkillsAfterLoad handling updates to the skill bar items.
        // If skills are dynamically re-assigned to slots, a more complex update logic is needed.

        skillImg.onclick = (event) => { // Use onclick for simplicity to replace existing, or manage listeners carefully
            if (!hero || !skillInSlot) return; // Check skillInSlot directly

            const currentSkill = skillInSlot; // Use the skill from the slot

            if (clickTimeout) {
                clearTimeout(clickTimeout);
                clickTimeout = null;
                if (!skillElement.classList.contains("disabled")) {
                    if (currentSkill.type === "active") {
                        currentSkill.repeat = !currentSkill.repeat;
                        skillElement.classList.toggle("rainbow", currentSkill.repeat);
                    }
                }
            } else {
                clickTimeout = setTimeout(() => {
                    if (!skillElement.classList.contains("disabled")) {
                        currentSkill.useSkill(hero);
                    }
                    clickTimeout = null;
                }, 300);
            }
        };
        
        skillElement.onmouseenter = (event) => { // Use onmouseenter
            if (tooltip && tooltip.innerHTML && tooltip.innerHTML !== "Empty Slot") {
                 showTooltip(event, tooltip);
            }
        };
        skillElement.onmouseleave = () => { // Use onmouseleave
            if (tooltip) {
                tooltip.style.display = 'none';
                tooltip.style.visibility = 'hidden';
            }
        };
    }
}


// This function should be defined once in a scope accessible by DOMContentLoaded and loadStage
function updateStageDisplay() {
    const currentStageSpan = document.getElementById('current-stage');
    if (currentStageSpan) {
        if (currentArea && currentArea.name && !currentArea.name.toLowerCase().includes("error")) {
            currentStageSpan.textContent = `Stage ${currentStage}`;
        } else {
            currentStageSpan.textContent = "Area Error";
        }
    }
}


document.addEventListener('DOMContentLoaded', async () => {
    // Initialize core UI elements first
    initializeHomeScreen(); // This should set up home screen buttons and potentially call loadGameData
    await initializeDialogue();
    const backToMapButtons = document.querySelectorAll('.back-to-map-button');
        backToMapButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                // Assuming your openTab function can be called like this:
                // If openTab is part of a module, you'd import and call it.
                if (typeof openTab === 'function') {
                    openTab(event, 'map');
                } else {
                    console.error('openTab function is not available for back buttons.');
                }
            });
        });
    // Stage navigation controls - ensure they are set up after DOM is ready
    const decreaseStageButton = document.getElementById('decrease-stage');
    const increaseStageButton = document.getElementById('increase-stage');

    if (decreaseStageButton) {
        decreaseStageButton.addEventListener('click', () => {
            if (currentArea && currentArea.stages && currentArea.stages.length > 0) {
                const minStage = 1;
                if (currentStage > minStage) {
                    currentStage--;
                    // updateStageDisplay(); // loadStage will call this
                    loadStage(currentStage, mobsClasses);
                }
            } else {
                console.warn("Cannot decrease stage: Current area not loaded correctly.");
                if(battleLog) battleLog.log("Area not loaded. Cannot change stage.");
            }
        });
    }

    if (increaseStageButton) {
        increaseStageButton.addEventListener('click', () => {
             if (currentArea && currentArea.stages && currentArea.stages.length > 0) {
                loadNextStage();
            } else {
                console.warn("Cannot increase stage: Current area not loaded correctly.");
                if(battleLog) battleLog.log("Area not loaded. Cannot change stage.");
            }
        });
    }

    // Initial call to update stage display, assuming loadGameData might have been called by home.js
    // If home.js guarantees loadGameData completes and calls updateStageDisplay, this might be redundant.
    // However, it's safer to call it here once after all DOM is ready.
    updateStageDisplay();

    // NOTE: The main `await loadGameData();` call is crucial.
    // If `initializeHomeScreen()` doesn't trigger it (e.g. on 'New Game' or 'Load Game' button press),
    // then it needs to happen here or as the very first step for a default game start.
    // Example: if starting a new game by default without home screen interaction:
    // const gameReady = await loadGameData();
    // if (!gameReady) {
    //    document.body.innerHTML = "<div style='color:red; text-align:center; padding:20px;'><h1>Initialization Failed</h1><p>The game could not start. Please check the console for errors.</p></div>";
    //    return;
    // }
    // If home.js IS handling it, this direct call here should be removed or conditional.
    // For this version, I'm assuming home.js triggers loadGameData.
});


export function loadNextStage() {
    if (!currentArea || !currentArea.stages || currentArea.stages.length === 0) {
        if(battleLog) battleLog.log("Cannot load next stage: Area not properly loaded or has no stages.");
        return;
    }
    const maxStageForArea = currentArea.stages.length;
    if (currentStage < maxStageForArea) {
        currentStage++;
        // updateStageDisplay(); // loadStage will call this
        loadStage(currentStage, mobsClasses);
    } else {
        if (battleLog) battleLog.log("No more stages in this area.");
    }
}

function togglePause() {
    isPaused = !isPaused;
    const overlayTarget = document.getElementById('teamAndBattleContainer-overlay') || document.getElementById('battlefield');
    if (!overlayTarget) return; // Guard if element not found

    if (isPaused) {
        overlayTarget.classList.add('paused-overlay');
        if(battleLog) battleLog.log("Battle Paused");
        if (team1) team1.getAllAliveMembers().forEach(member => member.stopSkills());
        if (team2) team2.getAllAliveMembers().forEach(member => member.stopSkills());

    } else {
        overlayTarget.classList.remove('paused-overlay');
        if(battleLog) battleLog.log("Battle Resumed");
        if (team1) team1.getAllAliveMembers().forEach(member => member.startSkills());
        if (team2) team2.getAllAliveMembers().forEach(member => member.startSkills());
    }
}
