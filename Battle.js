import Member from './Member.js';
import {battleLog, evolutionService,renderTeamMembers, hero, isPaused,
 team1, team2, battleStatistics, mobsClasses, loadStage} from './initialize.js'; // MODIFIED: Removed loadNextStage, reLoadStage, Added mobClasses
import Hero from './Hero.js';
import Area from './Area.js';
import { questSystem } from './questSystem.js';
import { openTab } from './navigation.js';
import { renderMember } from './Render.js'; // MODIFIED: Added renderMember for team2 setup

let battleStarted = false;
let battleInterval = null;
let isFleeOnCooldown = false;
const FLEE_COOLDOWN_SECONDS = 10;
let currentPoiName = null;
let currentBattleDialogueOptions = null;
let isBattlePausedForDialogue = false;

let currentBattleArea = null; // MODIFIED: Store the Area instance for the current battle
let currentBattleStageNumber = 1; // MODIFIED: Store the current stage number for the battle

function resetFleeButtonState() {
    const fleeButton = document.getElementById('flee-battle');
    if (fleeButton) {
        fleeButton.disabled = false;
        fleeButton.textContent = "Flee";
    }
    isFleeOnCooldown = false;
}

function initializeBattle(poiName = null) {
    currentPoiName = poiName;
    resetFleeButtonState();
    isBattlePausedForDialogue = false;
}

async function gameTick() {
    if (isPaused || !battleStarted || isBattlePausedForDialogue) return;

    team1.members.forEach(member => member.handleRegeneration());
    team2.members.forEach(member => member.handleRegeneration());

    await checkBattleOutcome();
}

async function checkBattleOutcome() {
    const team1Alive = team1.members.some(member => member.currentHealth > 0);
    const team2Alive = team2.members.some(member => member.currentHealth > 0);

    if (!team1Alive || !team2Alive) {
        if (battleInterval) clearInterval(battleInterval);
        battleInterval = null;

        const wasBattleStarted = battleStarted;
        battleStarted = false; // Prevent further gameTicks during post-battle

        if (!team1Alive) {
            await handleBattleLoss();
        } else {
            await handleBattleWin();
        }

        stopAllSkills(team1, team2);
        evolutionService.checkClassAvailability();

        const popup = document.getElementById('popup');
        if (wasBattleStarted && (!popup || popup.classList.contains('hidden'))) {
             checkAndHandleRepeatStage();
        }
    }
}

function calculateGoldDrop() {
    let totalGoldDropped = 0;
    team2.members.forEach(mob => {
        if (mob.currentHealth <= 0 && mob.goldDrop > 0) {
            totalGoldDropped += mob.goldDrop;
        }
    });
    return totalGoldDropped;
}

async function handleBattleWin() {
    const totalGoldDropped = calculateGoldDrop();
    if (totalGoldDropped > 0) {
        hero.addGold(totalGoldDropped);
        battleLog.log(`Collected ${totalGoldDropped} gold!`);
        battleStatistics.addGoldCollected(totalGoldDropped);
    }
    questSystem.updateQuestProgress('combatComplete', { poiName: currentPoiName });

    if (currentBattleDialogueOptions && currentBattleDialogueOptions.npcId && currentBattleDialogueOptions.endWinDialogueId) {
        isBattlePausedForDialogue = true;
        battleLog.log(`Starting post-battle (win) dialogue: ${currentBattleDialogueOptions.endWinDialogueId}`);
        await window.startDialogue(currentBattleDialogueOptions.npcId, currentBattleDialogueOptions.endWinDialogueId);
        battleLog.log("Post-battle (win) dialogue finished.");
        isBattlePausedForDialogue = false;
    }
    showPopup("Victory!", "Your team has defeated the opposing team.");
}

async function handleBattleLoss() {
    if (currentBattleDialogueOptions && currentBattleDialogueOptions.npcId && currentBattleDialogueOptions.endLossDialogueId) {
        isBattlePausedForDialogue = true;
        battleLog.log(`Starting post-battle (loss) dialogue: ${currentBattleDialogueOptions.endLossDialogueId}`);
        await window.startDialogue(currentBattleDialogueOptions.npcId, currentBattleDialogueOptions.endLossDialogueId);
        battleLog.log("Post-battle (loss) dialogue finished.");
        isBattlePausedForDialogue = false;
    }
    showPopup("Loss!", "Your team has been defeated.");
}

function checkAndHandleRepeatStage() {
    const repeatCheckbox = document.getElementById('repeat');
    const popup = document.getElementById('popup');
    if (repeatCheckbox && repeatCheckbox.checked && popup && !popup.classList.contains('hidden')) {
        setTimeout(async () => {
            await repeatStage();
        }, 1000);
    }
}

function useTeamSkills(team) {
    team.members.forEach(member => {
        // Only use skills if member is alive
        if (member.currentHealth > 0) {
            member.skills.forEach(skill => {
                // Consider adding logic here if not all skills should be auto-used
                // e.g., if skill.autoCastAtStart or similar flag
                skill.useSkill(member);
            });
        }
    });
}

function stopHeroActiveSkills() {
    if (hero && hero.skills) {
        const activeSkills = hero.skills.filter(skill => skill.type === "active");
        activeSkills.forEach(skill => {
            if (typeof skill.heroStopSkill === 'function') {
                skill.heroStopSkill();
            }
        });
    }
}

function stopTeamMemberSkills(team) {
    team.members.forEach(member => {
        if (typeof member.stopSkills === 'function') {
            member.stopSkills();
        }
    });
}

function stopAllSkills(playerTeam, enemyTeam) {
    stopHeroActiveSkills();
    stopTeamMemberSkills(enemyTeam); // Only stop enemy team skills, player skills might persist if designed so
    // If player team members also have skills that need stopping:
    // stopTeamMemberSkills(playerTeam);
}

function calculateFleeChance() {
    let heroDex = hero.stats.dexterity || 0;
    let avgEnemyDex = 0;
    const aliveEnemies = team2.getAllAliveMembers();

    if (aliveEnemies.length > 0) {
        avgEnemyDex = aliveEnemies.reduce((sum, enemy) => sum + (enemy.stats.dexterity || 0), 0) / aliveEnemies.length;
    }

    let fleeChance = 50 + Math.floor(heroDex / 5) - Math.floor(avgEnemyDex / 5);
    return Math.max(10, Math.min(90, fleeChance));
}

function handleSuccessfulFlee(fleeChance, randomRoll) {
    battleLog.log(`Successfully fled from battle! (Chance: ${fleeChance.toFixed(0)}%, Rolled: ${randomRoll.toFixed(0)})`);
    battleStatistics.addSuccessfulFlee();
    stopBattle(team1, team2, true);
    questSystem.updateQuestProgress('escape', { poiName: currentPoiName});
}

function handleFailedFlee(fleeChance, randomRoll) {
    battleLog.log(`Failed to flee! (Chance: ${fleeChance.toFixed(0)}%, Rolled: ${randomRoll.toFixed(0)})`);
}

function startFleeCooldownVisuals() {
    const fleeButton = document.getElementById('flee-battle');
    if (!fleeButton) return;

    let cooldownTimeLeft = FLEE_COOLDOWN_SECONDS;
    fleeButton.textContent = `Flee (${cooldownTimeLeft}s)`;

    const cooldownInterval = setInterval(() => {
        cooldownTimeLeft--;
        const currentFleeButton = document.getElementById('flee-battle');
        if (currentFleeButton) {
            currentFleeButton.textContent = `Flee (${cooldownTimeLeft}s)`;
        }

        if (cooldownTimeLeft <= 0) {
            clearInterval(cooldownInterval);
            isFleeOnCooldown = false;
            if (currentFleeButton && battleStarted) {
                currentFleeButton.disabled = false;
                currentFleeButton.textContent = "Flee";
            } else if (currentFleeButton) {
                 currentFleeButton.textContent = "Flee";
            }
        }
    }, 1000);
}

export function attemptFlee() {
    if (!battleStarted) {
        battleLog.log("Cannot flee, battle not active.");
        return;
    }
    if (isFleeOnCooldown) {
        battleLog.log("Flee is on cooldown.");
        return;
    }

    const fleeButton = document.getElementById('flee-battle');
    if (fleeButton) {
        fleeButton.disabled = true;
    }
    isFleeOnCooldown = true;

    const fleeChance = calculateFleeChance();
    const randomRoll = Math.random() * 100;

    if (randomRoll < fleeChance) {
        handleSuccessfulFlee(fleeChance, randomRoll);
    } else {
        handleFailedFlee(fleeChance, randomRoll);
    }
    startFleeCooldownVisuals();
}

function showPopup(title, message) {
    if (isBattlePausedForDialogue) return;

    const popup = document.getElementById('popup');
    const titleDiv = document.getElementById('popupTitle');
    const messageDiv = document.getElementById('popupText');
    if (popup && titleDiv && messageDiv) {
        titleDiv.textContent = title;
        messageDiv.textContent = message;
        popup.classList.remove('hidden');
    }
}

function hidePopup() {
    const popup = document.getElementById('popup');
    if (popup) {
        popup.classList.add('hidden');
    }
}

export function returnToMap() {
    hidePopup();
    openTab({ currentTarget: document.getElementById('mapNavButton') }, 'map');
}

// MODIFIED: Added areaInstance, stageNum. Removed poiName as it's derived from areaInstance.
async function startBattle(currentTeam1, currentTeam2, areaName = null, dialogueOptions = null, stageNum = 1) {
    const battlePoiName = areaName ? areaName.name : 'Unknown Area';
    initializeBattle(battlePoiName); // Sets currentPoiName internally

    currentBattleDialogueOptions = dialogueOptions;
    currentBattleArea = new Area(areaName);
    currentBattleStageNumber = stageNum;



    if (currentBattleArea) {
        if (!currentBattleArea.isLoaded) {
            battleLog.log(`Area ${currentBattleArea.name} data is not loaded. Attempting to load...`);
            await currentBattleArea.loadData(); // Ensure area data is loaded
            if (!currentBattleArea.isLoaded) {
                console.error(`Failed to load data for area: ${currentBattleArea.name}. Cannot start battle.`);
                battleLog.log(`Error: Could not load enemy team for ${currentBattleArea.name}.`);
                return; // Exit if area data failed to load
            }
        }

        // Populate team2 with mobs from the area and stage
        currentTeam2.members = []; // Clear existing members
        const mobs = currentBattleArea.spawnMobs(mobsClasses, currentTeam2, currentBattleStageNumber);

        mobs.forEach((mob, index) => {
            mob.team = currentTeam2;
            mob.opposingTeam = currentTeam1;
            mob.memberId = `team2-member-${index}`; // Assign a unique ID for DOM element
        });
        currentTeam2.members = mobs;

        renderTeamMembers(currentTeam2.members, 'team2', true);

    } else {
        battleLog.log("Battle started without a specific area. Assuming team2 is pre-populated.");
    }

    if (dialogueOptions && dialogueOptions.npcId && dialogueOptions.startDialogueId) {
        isBattlePausedForDialogue = true;
        battleLog.log(`Starting pre-battle dialogue: ${dialogueOptions.startDialogueId}`);
        await window.startDialogue(dialogueOptions.npcId, dialogueOptions.startDialogueId);
        battleLog.log("Pre-battle dialogue finished.");
        isBattlePausedForDialogue = false;
    }

    battleLog.log(`Battle started at ${currentPoiName}`); // currentPoiName is now set by initializeBattle

    battleStarted = true; // MODIFIED: Set battleStarted to true BEFORE triggering initial skills

    useTeamSkills(currentTeam2);
    if (hero) hero.triggerRepeatSkills();

    if (battleInterval) {
        clearInterval(battleInterval);
    }
    battleInterval = setInterval(gameTick, 1000);
}

function stopBattle(currentTeam1, currentTeam2, fled = false) {
    if (battleInterval) {
        clearInterval(battleInterval);
        battleInterval = null;
    }
    battleStarted = false;
    isBattlePausedForDialogue = false;

    stopAllSkills(currentTeam1, currentTeam2);

    if (fled) {
        hidePopup();
        returnToMap();
    }
    // currentBattleArea = null; // Clear area context if battle fully stops and isn't just paused/reloaded
    // currentBattleStageNumber = 1;
}

// MODIFIED: Uses currentBattleArea and currentBattleStageNumber
async function repeatStage() {
    hidePopup();
    if (!currentBattleArea) {
        console.error("Cannot repeat stage: currentBattleArea not set.");
        battleLog.log("Error: No area context to repeat the stage.");
        return;
    }
    // Dialogue options typically remain the same for a POI/Area unless specifically changed
    await startBattle(team1, team2, currentBattleDialogueOptions, currentBattleArea, currentBattleStageNumber);
}

// MODIFIED: Uses currentBattleArea to advance stage
async function nextStage() {
    hidePopup();
    if (!currentBattleArea) {
        console.error("Cannot advance to next stage: currentBattleArea not set.");
        battleLog.log("Error: No area context for next stage.");
        // Potentially fall back to a global "next stage" system if needed,
        // for now, it's an error if no battle-specific area is set.
        return;
    }
    if (!currentBattleArea.isLoaded) {
        console.error(`Cannot advance to next stage: currentBattleArea ${currentBattleArea.name} is not loaded.`);
        battleLog.log(`Error: Area data not loaded for ${currentBattleArea.name}.`);
        return;
    }

    const nextStageNum = currentBattleStageNumber + 1;

    if (nextStageNum > currentBattleArea.stages.length) {
        battleLog.log(`All stages in ${currentBattleArea.name} cleared!`);
        showPopup("Area Cleared!", `You have completed all stages in ${currentBattleArea.name}.`);
        // Consider calling stopBattle() or specific logic for area completion.
        // Example: returnToMap();
        return;
    }

    // Assuming dialogue options and POI name (area name) remain consistent for stages within an area.
    // If per-stage dialogue/details are needed, Area class or a new system would provide them.
    await startBattle(team1, team2, currentBattleArea, currentBattleDialogueOptions, nextStageNum);

}

export {startBattle, stopBattle, hidePopup, battleStarted, repeatStage, nextStage};