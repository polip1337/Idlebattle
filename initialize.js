import {nextStage, repeatStage, startBattle, returnToMap, attemptFlee} from './Battle.js';
import Team from './Team.js';
import Hero from './Hero.js';
import Member from './Member.js';
import Area from './Area.js';
import EvolutionService from './EvolutionService.js';
import Skill from './Skill.js';
import BattleLog from './BattleLog.js';
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
    updateHealth,
    updateMana,
    updateStamina
} from './Render.js';
import BattleStatistics from './BattleStatistics.js';
import {openTab} from './navigation.js';
import {initializeMap} from './map.js';
import {initializeHomeScreen} from './home.js';
import {initializeDialogue} from './dialogue.js';
import {questSystem} from './questSystem.js';
import {initializeQuestLog} from './questLog.js';

export let battleStatistics = new BattleStatistics();
export let evolutionService = new EvolutionService();
export let isPaused = false;
export let team1 = new Team('Team1', 'team1-members');
export let team2 = new Team('Team2', 'team2-members');
export let hero;
export let battleLog;
export let classTiers;
export let heroClasses;

export let currentArea; // Declared here, assigned in loadGameData
export let mobsClasses = null;
let currentStage = 1;
let clickTimeout;
export const NPC_MEDIA_PATH = "Media/NPC/";

battleStatistics.updateBattleStatistics();

async function loadJSON(url) {
    const response = await fetch(url);
    return response.json();
}

async function loadEffects() {
    const data = await loadJSON('Data/effects.json');
    return data;
}

async function loadSkills(effects, path) {
    const data = await loadJSON(path);
    const skills = {};

    Object.keys(data).forEach(skillKey => {
        const skill = data[skillKey];

        if (skill.effects && skill.effects.length > 0 && skill.effects[0].id) { // Ensure effects array and id exist
            const effectTemplate = effects[skill.effects[0].id];
            if (effectTemplate) {
                // Merge template with specific overrides from skill data
                skill.effects = Object.assign(deepCopy(effectTemplate), deepCopy(skill.effects[0]));
            } else {
                 // if no template, just use the effect object as is, assuming it's complete
                 skill.effects = deepCopy(skill.effects[0]);
            }
        } else if (skill.effects && typeof skill.effects === 'object' && !Array.isArray(skill.effects) && skill.effects.id) {
            // Handle case where skill.effects is a single object with an id
            const effectTemplate = effects[skill.effects.id];
            if (effectTemplate) {
                 skill.effects = Object.assign(deepCopy(effectTemplate), deepCopy(skill.effects));
            } else {
                skill.effects = deepCopy(skill.effects);
            }
        }

        skills[skillKey] = new Skill(skill, skill.effects);
    });

    return skills;
}

async function loadMobs(skills) {
    const mobsData = await loadJSON('Data/mobs.json');
    const classes = {};
    for (const key in mobsData) {
        const mob = mobsData[key];
        const classSkills = mob.skills.map(skillId => skills[skillId]).filter(s => s); // Filter out undefined if skillId not found
        classes[mob.id] = new Member(mob.name, mob, classSkills); // Pass mob data as classInfo
    }
    return classes;
}

async function loadClasses(skills) {
    var classesData = await loadJSON('Data/classes.json');
    const classes = {};
    classTiers = classesData['tiers'];
    const heroClassData = classesData['classes']; // Rename to avoid conflict
    for (const key in heroClassData) {
        const heroClass = heroClassData[key];
        const classSkills = heroClass.skills.map(skillId => skills[skillId]).filter(s => s); // Filter out undefined
        classes[heroClass.id] = {...heroClass, skills: classSkills};
    }
    return classes;
}

// Helper function to ensure Area data is loaded and awaited
async function loadAreaInstance(jsonPath) {
    const area = new Area(jsonPath); // Original constructor call (still fires its own fetch)
    try {
        const response = await fetch(jsonPath);
        const data = await response.json();
        area.stages = data.stages; // Manually set properties after awaiting
        area.stageNumber = area.stageNumber || 1; // Keep existing or default to 1
    } catch (error) {
        console.error(`Failed to load area data from ${jsonPath}:`, error);
        area.stages = []; // Ensure stages is an empty array on failure
    }
    return area;
}

export async function loadGameData() {
    const effects = await loadEffects();
    let skills = await loadSkills(effects, 'Data/skills.json');
    const passiveSkills = await loadSkills(effects, 'Data/passives.json');
    skills = {...skills, ...passiveSkills};
    mobsClasses = await loadMobs(skills);
    heroClasses = await loadClasses(skills);

    // Load currentArea and wait for its data
    currentArea = await loadAreaInstance("Data/Areas/goblinPlains.JSON");

    initiateBattleLog();
    createAndInitHero(heroClasses, team1, team2);
    loadStage(currentStage, mobsClasses); // Now currentArea.stages should be populated
    initiateEventListeners();
    await questSystem.loadQuests();
    initializeQuestLog();
    initializeMap();
    // This openTab is for initial setup; actual navigation might be triggered by home screen actions
    openTab({ currentTarget: document.getElementById('mapNavButton') }, 'map');
}

function createAndInitHero(classes, team, opposingTeam) {
    hero = new Hero("Hero", classes['novice'], classes['novice'].skills, 1, team, opposingTeam);
    team1.addMember(hero);
    renderLevelProgress(hero);
    renderTeamMembers(team1.members, 'team1');
    renderSkills(team1.members[0]);
    renderPassiveSkills(team1.members[0]);
    selectInitialSkills();
    return hero;
}

function loadStage(stageNumber, mobs) {
    if (!currentArea || !currentArea.stages) {
        console.error("Area data or stages not loaded. Cannot load stage.");
        return;
    }
    currentArea.stageNumber = stageNumber;
    team2.clearMembers();
    let memberIndex = 0;
    var team2Members = [];
    // Ensure spawnMobs returns an array even if stage is invalid internally
    (currentArea.spawnMobs(mobs, team2) || []).forEach(member => {
        member.initialize(team1, team2, memberIndex); // Pass correct memberId prefix or full ID
        memberIndex++;
        team2Members.push(member);
    });
    renderTeamMembers(team2Members, 'team2');
    team2.addMembers(team2Members);
}

export function reLoadStage() {
    loadStage(currentArea.stageNumber, mobsClasses);
}

function selectInitialSkills() {
    // Select first 4 active skills
    const activeSkillBoxes = document.querySelectorAll("#activeSkills .skill-box");
    for (let i = 0; i < 4 && i < team1.members[0].skills.length && i < activeSkillBoxes.length; i++) {
        // Ensure the skill is active type before selecting for active bar
        if (team1.members[0].skills[i] && team1.members[0].skills[i].type === "active") {
            hero.selectSkill(team1.members[0].skills[i], activeSkillBoxes[i]);
        }
    }

    // Select first 4 passive skills (adjust indices if skills array mixes types)
    const passiveSkillBoxes = document.querySelectorAll("#passiveSkills .skill-box");
    let passiveSkillsCount = 0;
    for (let i = 0; i < team1.members[0].skills.length && passiveSkillsCount < 4 && passiveSkillsCount < passiveSkillBoxes.length; i++) {
        if (team1.members[0].skills[i] && team1.members[0].skills[i].type !== "active") { // Assuming "passive" or other non-active types
             hero.selectSkill(team1.members[0].skills[i], passiveSkillBoxes[passiveSkillsCount], true);
             passiveSkillsCount++;
        }
    }
}

function initiateBattleLog() {
    const logContainer = document.getElementById('battle-log');
    battleLog = new BattleLog(logContainer);

    const toggleLogButton = document.getElementById('toggle-log');
    let logVisible = true; // Default to visible

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
        console.error(`Team rows not found in ${containerId}.`);
        return;
    }

    if (clear) {
        teamRows[0].innerHTML = '';
        teamRows[1].innerHTML = '';
    }

    members.forEach(member => {
        var row = (member.position === "Front") ? teamRows[0] : teamRows[1];
        
        // Basic check to prevent overflow, might need better distribution logic
        if (row.children.length >= 4) { 
            row = (row === teamRows[0]) ? teamRows[1] : teamRows[0]; 
        }

        let memberElement;
        if (member.isHero) { // Check if it's the hero instance
            memberElement = renderHero(member);
        } else {
            memberElement = renderMember(member);
        }
        row.appendChild(memberElement);

        member.initializeDOMElements(); // Crucial for Member.element to be set
        updateMana(member);
        updateStamina(member);
        updateHealth(member);
    });
}

function initiateEventListeners() {
    document.getElementById('heroContentNavButton').addEventListener('click', (event) => openTab(event, 'heroContent'));
    document.getElementById('mapNavButton').addEventListener('click', (event) => openTab(event, 'map'));
    document.getElementById('libraryNavButton').addEventListener('click', (event) => openTab(event, 'library'));
    document.getElementById('optionsNavButton').addEventListener('click', (event) => openTab(event, 'options')); // Assuming 'options' tab exists
    document.getElementById('battle-statisticsNavButton').addEventListener('click', (event) => openTab(event, 'battle-statistics'));
    // questsNavButton is handled in questLog.js initialization

    document.getElementById('repeat-popup').addEventListener('click', () => { hidePopupForBattleActions(); repeatStage(); });
    document.getElementById('nextStage-popup').addEventListener('click', () => { hidePopupForBattleActions(); nextStage();});
    document.getElementById('return-to-map-popup').addEventListener('click', () => { hidePopupForBattleActions(); returnToMap();});

    const fleeButton = document.getElementById('flee-battle');
    if (fleeButton) {
        fleeButton.addEventListener('click', () => attemptFlee());
    }

    document.addEventListener('keydown', (event) => {
        if (event.code === 'Space') {
            // Prevent default space action (like scrolling) if in a context where it matters
            // event.preventDefault(); 
            togglePause();
        }
    });

    // Use event delegation for tooltips on teamAndBattleContainer
    const teamAndBattleContainer = document.getElementById('teamAndBattleContainer');
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

    setupSkillListeners();
}

function hidePopupForBattleActions() {
    const popup = document.getElementById('popup');
    if (popup) popup.classList.add('hidden');
}

function setupSkillListeners() {
    for (let i = 1; i <= 12; i++) {
        const skillElement = document.getElementById("skill" + i);
        if (!skillElement) continue;

        const skillImg = skillElement.querySelector('img');
        const tooltip = skillElement.nextSibling; // Ensure tooltip exists
        if (!skillImg || !tooltip) continue;

        // Update rainbow class and tooltip content
        if (hero && hero.selectedSkills[i - 1]) {
            const skill = hero.selectedSkills[i - 1];
            if (skill.repeat && skill.type === "active") {
                skillElement.classList.add("rainbow");
            } else {
                skillElement.classList.remove("rainbow");
            }
            // Update tooltip content
            if (skill.type === "passive") {
                updatePassiveSkillTooltip(tooltip, skill);
            } else {
                updateSkillTooltip(tooltip, skill);
            }
        } else {
            skillElement.classList.remove("rainbow");
            tooltip.innerHTML = "";
            skillImg.src = "Media/UI/defaultSkill.jpeg";
        }

        skillImg.addEventListener('click', (event) => {
            if (!hero || !hero.selectedSkills[i - 1]) return;

            const currentSkill = hero.selectedSkills[i - 1];

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
        });

        // Add hover event to show tooltip
        skillElement.addEventListener('mouseenter', (event) => {
            if (tooltip.innerHTML) {
                showTooltip(event, tooltip);
            }
        });
        skillElement.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
        });
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const maxStage = 10; // This could be loaded from area data
    const minStage = 1;

    const currentStageSpan = document.getElementById('current-stage');
    const decreaseStageButton = document.getElementById('decrease-stage');
    const increaseStageButton = document.getElementById('increase-stage');

    function updateStageDisplay() {
        if(currentStageSpan) currentStageSpan.textContent = `Stage ${currentStage}`;
    }

    if (decreaseStageButton) {
        decreaseStageButton.addEventListener('click', () => {
            if (currentStage > minStage) {
                currentStage--;
                updateStageDisplay();
                loadStage(currentStage, mobsClasses);
            }
        });
    }

    if (increaseStageButton) {
        increaseStageButton.addEventListener('click', () => {
            // Assuming loadNextStage handles max stage internally or we check here
            loadNextStage(); // loadNextStage will update currentStage and display
        });
    }
    updateStageDisplay(); // Initial display

    initializeHomeScreen();
    await initializeDialogue(); // Await dialogue system setup
    await loadGameData(); // Main game data loading function
});

export function loadNextStage() {
    // Define maxStage based on currentArea or a constant
    const maxStageForArea = (currentArea && currentArea.stages) ? currentArea.stages.length : 1; // Default to 1 if not loaded
    if (currentStage < maxStageForArea) {
        currentStage++;
        // currentArea.stageNumber is set within loadStage
        document.getElementById('current-stage').textContent = `Stage ${currentStage}`;
        loadStage(currentStage, mobsClasses);
    } else {
        console.log("Already at the last stage for this area or area not loaded.");
        // Optionally, log to battleLog or display a message to the user
        if (battleLog) battleLog.log("No more stages in this area.");
    }
}

function togglePause() {
    isPaused = !isPaused;
    const overlayTarget = document.getElementById('teamAndBattleContainer-overlay') || document.getElementById('battlefield');

    if (isPaused) {
        overlayTarget.classList.add('paused-overlay'); // Add class for visual feedback
        if(battleLog) battleLog.log("Battle Paused");
        // Pause skills for all members
        team1.getAllAliveMembers().forEach(member => member.stopSkills());
        team2.getAllAliveMembers().forEach(member => member.stopSkills());

    } else {
        overlayTarget.classList.remove('paused-overlay'); // Remove visual feedback
        if(battleLog) battleLog.log("Battle Resumed");
        // Resume skills
        team1.getAllAliveMembers().forEach(member => member.startSkills());
        team2.getAllAliveMembers().forEach(member => member.startSkills());
    }
}