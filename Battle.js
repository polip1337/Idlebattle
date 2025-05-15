import Member from './Member.js';
import {battleLog, evolutionService,renderTeamMembers, hero, isPaused,
 team1, team2, battleStatistics, mobsClasses } from './initialize.js';
import Hero from './Hero.js';
import Area from './Area.js';
import { questSystem } from './questSystem.js';
import { openTab } from './navigation.js';
// renderMember is not explicitly used here anymore as renderTeamMembers from initialize handles it.
// If Battle.js were to add individual members, it might need it.

let battleStarted = false;
let battleInterval = null;
let isFleeOnCooldown = false;
const FLEE_COOLDOWN_SECONDS = 10;
let currentPoiName = null; // The name of the Area (e.g., "Goblin Cave")
let currentBattleDialogueOptions = null;
let isBattlePausedForDialogue = false;

let currentBattleArea = null; // Stores the Area instance for the current battle
let currentBattleStageNumber = 1; // Stores the current stage number for the battle

function resetFleeButtonState() {
    const fleeButton = document.getElementById('flee-battle');
    if (fleeButton) {
        fleeButton.disabled = false;
        fleeButton.textContent = "Flee";
    }
    isFleeOnCooldown = false;
}

function initializeBattleState(poiName = null, stageNum = 1) { // Renamed and takes stageNum
    currentPoiName = poiName;
    currentBattleStageNumber = stageNum;
    currentBattleArea = null; // Reset area, will be loaded in startBattle
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
        battleStarted = false;

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
    questSystem.updateQuestProgress('combatComplete', { poiName: currentPoiName, stage: currentBattleStageNumber });

    if (currentBattleDialogueOptions && currentBattleDialogueOptions.npcId && currentBattleDialogueOptions.endWinDialogueId) {
        isBattlePausedForDialogue = true;
        battleLog.log(`Starting post-battle (win) dialogue: ${currentBattleDialogueOptions.endWinDialogueId}`);
        await window.startDialogue(currentBattleDialogueOptions.npcId, currentBattleDialogueOptions.endWinDialogueId);
        battleLog.log("Post-battle (win) dialogue finished.");
        isBattlePausedForDialogue = false;
    }
    // Check if there's a next stage before showing generic victory
    if (currentBattleArea && currentBattleStageNumber < currentBattleArea.stages.length) {
        showPopup("Stage Cleared!", `Your team has cleared stage ${currentBattleStageNumber}.`);
    } else {
        showPopup("Victory!", `Your team has defeated all enemies in ${currentPoiName}.`);
    }
}

async function handleBattleLoss() {
    if (currentBattleDialogueOptions && currentBattleDialogueOptions.npcId && currentBattleDialogueOptions.endLossDialogueId) {
        isBattlePausedForDialogue = true;
        battleLog.log(`Starting post-battle (loss) dialogue: ${currentBattleDialogueOptions.endLossDialogueId}`);
        await window.startDialogue(currentBattleDialogueOptions.npcId, currentBattleDialogueOptions.endLossDialogueId);
        battleLog.log("Post-battle (loss) dialogue finished.");
        isBattlePausedForDialogue = false;
    }
    showPopup("Defeat!", "Your team has been defeated.");
}

function checkAndHandleRepeatStage() {
    const repeatCheckbox = document.getElementById('repeat');
    const popup = document.getElementById('popup');
    if (repeatCheckbox && repeatCheckbox.checked && popup && !popup.classList.contains('hidden')) {
        // Only repeat if not advancing to a next stage automatically or something similar
        const canAdvance = currentBattleArea && currentBattleStageNumber < currentBattleArea.stages.length;
        if (!canAdvance || (popup && popup.querySelector('#popupTitle').textContent.includes("Victory!"))) { // Only repeat on final victory or if explicitly chosen
            setTimeout(async () => {
                await repeatStage();
            }, 1000);
        }
    }
}

function useTeamSkills(team) {
    team.members.forEach(member => {
        if (member.currentHealth > 0) {
            member.skills.forEach(skill => {
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
    stopTeamMemberSkills(enemyTeam);
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
    stopBattle(true); // fled = true
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
    const nextStageButton = document.getElementById('nextStage-popup'); // Battle's next stage button

    if (popup && titleDiv && messageDiv) {
        titleDiv.textContent = title;
        messageDiv.textContent = message;

        // Show/hide battle's "Next Stage" button based on context
        if (nextStageButton) {
            const canAdvance = currentBattleArea && currentBattleArea.isLoaded && currentBattleStageNumber < currentBattleArea.stages.length;
            if (title.includes("Stage Cleared!") && canAdvance) {
                nextStageButton.style.display = 'inline-block';
            } else {
                nextStageButton.style.display = 'none';
            }
        }
        popup.classList.remove('hidden');
    }
}

function hidePopup() {
    const popup = document.getElementById('popup');
    if (popup) {
        popup.classList.add('hidden');
    }
}

export function returnToMap() { // This is called by the "Return to Map" button on the popup
    hidePopup();
    stopBattle(false); // fled = false, just ending the battle sequence
    openTab({ currentTarget: document.getElementById('mapNavButton') }, 'map');
}

// poiData is the POI object from maps.json, stageNum is the stage to fight.
async function startBattle(poiData, dialogueOptions = null, stageNum = 1) {
    if (!poiData || !poiData.name) {
        console.error("startBattle called without valid POI data or POI name.");
        battleLog.log("Error: Battle cannot start without area information.");
        return;
    }
    const areaNameString = poiData.name;
    initializeBattleState(areaNameString, stageNum); // Sets currentPoiName and currentBattleStageNumber

    currentBattleDialogueOptions = dialogueOptions;
    currentBattleArea = new Area(areaNameString); // Area instance for this battle

    battleLog.log(`Attempting to load area: ${areaNameString} for battle.`);
    await currentBattleArea.loadData();

    if (!currentBattleArea.isLoaded) {
        console.error(`Failed to load data for area: ${areaNameString}. Cannot start battle.`);
        battleLog.log(`Error: Could not load enemy team for ${areaNameString}.`);
        showPopup("Battle Error", `Could not load battle area: ${areaNameString}.`);
        setTimeout(returnToMap, 2000); // Go back to map after showing error
        return;
    }
    battleLog.log(`Area ${areaNameString} loaded. Spawning mobs for stage ${currentBattleStageNumber}.`);

    team2.clearMembers(); // Clear battle team2 members
    const mobs = currentBattleArea.spawnMobs(mobsClasses, team2, currentBattleStageNumber);

    if (!mobs || mobs.length === 0) {
        console.warn(`No mobs spawned for ${areaNameString}, stage ${currentBattleStageNumber}.`);
        battleLog.log(`Warning: No enemies for ${areaNameString} - Stage ${currentBattleStageNumber}.`);
        // Auto-win or proceed to next stage if possible? For now, checkBattleOutcome will handle.
    }

    mobs.forEach((mob, index) => {
        mob.team = team2;
        mob.opposingTeam = team1;
        mob.memberId = `team2-member-${index}`;
    });
    team2.addMembers(mobs);

    renderTeamMembers(team2.members, 'team2', true); // Use dedicated battlefield container
    renderTeamMembers(team1.members, 'team1', true); // Use dedicated battlefield container
    team2.members.forEach(mob => mob.initializeDOMElements());


    if (dialogueOptions && dialogueOptions.npcId && dialogueOptions.startDialogueId) {
        isBattlePausedForDialogue = true;
        battleLog.log(`Starting pre-battle dialogue: ${dialogueOptions.startDialogueId}`);
        await window.startDialogue(dialogueOptions.npcId, dialogueOptions.startDialogueId);
        battleLog.log("Pre-battle dialogue finished.");
        isBattlePausedForDialogue = false;
    }

    battleLog.log(`Battle started at ${currentPoiName}, Stage ${currentBattleStageNumber}`);
    battleStarted = true;

    useTeamSkills(team2); // Use team2 skills (mobs)
    if (hero) hero.triggerRepeatSkills();

    if (battleInterval) {
        clearInterval(battleInterval);
    }
    battleInterval = setInterval(gameTick, 1000);
}

function stopBattle(fled = false) {
    if (battleInterval) {
        clearInterval(battleInterval);
        battleInterval = null;
    }
    // battleStarted is set by checkBattleOutcome or here if fleeing
    isBattlePausedForDialogue = false;

    stopAllSkills(team1, team2); // Stop skills for player and enemy teams

    if (fled) {
        battleStarted = false; // Ensure battle is marked as stopped
        hidePopup();
        openTab({ currentTarget: document.getElementById('mapNavButton') }, 'map');
    }
    // If not fled, checkBattleOutcome handles setting battleStarted = false and showing popups.
    // currentBattleArea and currentBattleStageNumber persist for repeat/next stage logic from popup.
}

// Repeats the current stage (e.g. "Repeat Stage" button on popup)
async function repeatStage() {
    hidePopup();
    if (!currentBattleArea || !currentBattleArea.isLoaded || !currentPoiName) {
        console.error("Cannot repeat stage: Battle area context not valid.");
        battleLog.log("Error: No valid area context to repeat the stage.");
        returnToMap();
        return;
    }
    const pseudoPoiData = { name: currentPoiName }; // Reconstruct minimal POI data needed
    // currentBattleStageNumber is already set for the current battle.
    await startBattle(pseudoPoiData, currentBattleDialogueOptions, currentBattleStageNumber);
}

// Advances to the next stage within the same area (e.g. "Next Stage" button on popup)
async function nextStage() {
    hidePopup();
    if (!currentBattleArea || !currentBattleArea.isLoaded || !currentPoiName) {
        console.error("Cannot advance to next stage: Battle area context not valid.");
        battleLog.log("Error: No valid area context for next stage.");
        returnToMap();
        return;
    }

    const nextStageNum = currentBattleStageNumber + 1;

    if (nextStageNum > currentBattleArea.stages.length) {
        battleLog.log(`All stages in ${currentPoiName} cleared! This should have been caught by handleBattleWin.`);
        showPopup("Area Cleared!", `You have completed all stages in ${currentPoiName}.`);
        return; // Should not happen if button logic is correct in showPopup
    }

    const pseudoPoiData = { name: currentPoiName };
    await startBattle(pseudoPoiData, currentBattleDialogueOptions, nextStageNum);
}

export {startBattle, stopBattle, hidePopup, battleStarted, repeatStage, nextStage};