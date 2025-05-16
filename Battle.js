import Member from './Member.js';
import {battleLog, evolutionService,renderTeamMembers, hero, isPaused,
 team1, team2, battleStatistics, mobsClasses, allCompanionsData } from './initialize.js'; // Added allCompanionsData
import Hero from './Hero.js';
import Area from './Area.js';
import { questSystem } from './questSystem.js';
import { openTab } from './navigation.js';
import { updateHealth, updateMana, updateStamina } from './Render.js';


let battleStarted = false;
let battleInterval = null;
let isFleeOnCooldown = false;
const FLEE_COOLDOWN_SECONDS = 10;
let currentPoiName = null;
let currentBattleDialogueOptions = null;
let isBattlePausedForDialogue = false;

let currentBattleArea = null;
let currentBattleStageNumber = 1;
const xpPerStageBase = 50; // Base XP for clearing a stage

function resetFleeButtonState() {
    const fleeButton = document.getElementById('flee-battle');
    if (fleeButton) {
        fleeButton.disabled = false;
        fleeButton.textContent = "Flee";
    }
    isFleeOnCooldown = false;
}

function initializeBattleState(poiName = null, stageNum = 1) {
    currentPoiName = poiName;
    currentBattleStageNumber = stageNum;
    currentBattleArea = null;
    resetFleeButtonState();
    isBattlePausedForDialogue = false;
}

async function gameTick() {
    if (isPaused || !battleStarted || isBattlePausedForDialogue) return;

    // Player team (hero + companions) regeneration
    team1.members.forEach(member => {
        if (member.currentHealth > 0) member.handleRegeneration();
    });
    // Enemy team regeneration
    team2.members.forEach(member => {
        if (member.currentHealth > 0) member.handleRegeneration();
    });

    await checkBattleOutcome();
}

async function checkBattleOutcome() {
    const team1Alive = team1.members.some(member => member.currentHealth > 0);
    const team2Alive = team2.members.some(member => member.currentHealth > 0);

    if (!team1Alive || !team2Alive) {
        if (battleInterval) clearInterval(battleInterval);
        battleInterval = null;

        const wasBattleStarted = battleStarted; // Store before changing
        battleStarted = false; // Stop battle logic

        if (!team1Alive) {
            await handleBattleLoss();
        } else { // team1 won (team2 defeated)
            await handleBattleWin();
        }

        // Stop skills for all members involved in the just-ended battle
        // This uses the current members in team1 and team2 at the point of battle end.
        stopAllSkills(team1, team2);

        if (hero) evolutionService.checkClassAvailability(); // Check hero evolution

        const popup = document.getElementById('popup');
        if (wasBattleStarted && (!popup || popup.classList.contains('hidden'))) {
             checkAndHandleRepeatStage(); // Auto-repeat if enabled and appropriate
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

function calculateStageXP() {
    // Example: XP scales with stage number and maybe POI difficulty
    let xpFromBattle = xpPerStageBase * currentBattleStageNumber;
    // Could add more complex calculation based on enemies defeated, their levels, etc.
    return Math.max(10, Math.floor(xpFromBattle)); // Ensure at least some XP
}


async function handleBattleWin() {
    const totalGoldDropped = calculateGoldDrop();
    if (totalGoldDropped > 0) {
        hero.addGold(totalGoldDropped); // addGold now updates hero sheet UI
        battleLog.log(`Collected ${totalGoldDropped} gold!`);
        battleStatistics.addGoldCollected(totalGoldDropped);
    }

    const xpFromBattle = calculateStageXP();
    if (xpFromBattle > 0 && hero) {
        battleLog.log(`Party gained ${xpFromBattle} XP!`);
        hero.distributeBattleXP(xpFromBattle); // Distributes to hero and active companions
    }

    questSystem.updateQuestProgress('combatComplete', { poiName: currentPoiName, stage: currentBattleStageNumber });

    if (currentBattleDialogueOptions && currentBattleDialogueOptions.npcId && currentBattleDialogueOptions.endWinDialogueId) {
        isBattlePausedForDialogue = true;
        battleLog.log(`Starting post-battle (win) dialogue: ${currentBattleDialogueOptions.endWinDialogueId}`);
        await window.startDialogue(currentBattleDialogueOptions.npcId, currentBattleDialogueOptions.endWinDialogueId);
        battleLog.log("Post-battle (win) dialogue finished.");
        isBattlePausedForDialogue = false;
    }

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
        const canAdvance = currentBattleArea && currentBattleStageNumber < currentBattleArea.stages.length;
        if (!canAdvance || (popup && popup.querySelector('#popupTitle').textContent.includes("Victory!"))) {
            setTimeout(async () => {
                await repeatStage();
            }, 1000);
        }
    }
}

function useTeamSkills(teamInstance) { // Renamed param for clarity
    teamInstance.members.forEach(member => {
        if (member.currentHealth > 0) {
            // Companions and Mobs use their skills automatically based on their AI (if any) or simple loop
            // For now, loop through all skills and use if not on cooldown and resources permit
            member.skills.forEach(skill => {
                 if (skill.type === "active" && !skill.onCooldown &&
                    skill.manaCost <= member.currentMana &&
                    skill.staminaCost <= member.currentStamina) {
                    skill.useSkill(member); // Member uses its own skill
                } else if (skill.type === "passive") {
                    // Passive skills usually apply their effects on init or under certain conditions handled by EffectClass
                }
            });
        }
    });
}

function stopAllSkills(playerTeamInstance, enemyTeamInstance) {
    if (playerTeamInstance && playerTeamInstance.members) {
        playerTeamInstance.members.forEach(member => {
            if (member && typeof member.stopSkills === 'function') { // Check member exists
                member.stopSkills();
            }
        });
    }
    if (enemyTeamInstance && enemyTeamInstance.members) {
        enemyTeamInstance.members.forEach(member => {
            if (member && typeof member.stopSkills === 'function') { // Check member exists
                member.stopSkills();
            }
        });
    }
}


function calculateFleeChance() {
    let heroDex = hero.stats.dexterity || 0;
    // Consider average dexterity of the entire player party for flee chance
    const avgPlayerPartyDex = team1.members.reduce((sum, pMember) => sum + (pMember.stats.dexterity || 0), 0) / team1.members.length || heroDex;

    let avgEnemyDex = 0;
    const aliveEnemies = team2.getAllAliveMembers();

    if (aliveEnemies.length > 0) {
        avgEnemyDex = aliveEnemies.reduce((sum, enemy) => sum + (enemy.stats.dexterity || 0), 0) / aliveEnemies.length;
    }

    let fleeChance = 50 + Math.floor(avgPlayerPartyDex / 5) - Math.floor(avgEnemyDex / 5);
    return Math.max(10, Math.min(90, fleeChance));
}

function handleSuccessfulFlee(fleeChance, randomRoll) {
    battleLog.log(`Successfully fled from battle! (Chance: ${fleeChance.toFixed(0)}%, Rolled: ${randomRoll.toFixed(0)})`);
    battleStatistics.addSuccessfulFlee();
    stopBattle(true);
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
        const currentFleeButton = document.getElementById('flee-battle'); // Re-fetch in case DOM changed
        if (currentFleeButton) {
            currentFleeButton.textContent = `Flee (${cooldownTimeLeft}s)`;
        }

        if (cooldownTimeLeft <= 0) {
            clearInterval(cooldownInterval);
            isFleeOnCooldown = false;
            if (currentFleeButton && battleStarted) { // Only enable if battle is still ongoing
                currentFleeButton.disabled = false;
                currentFleeButton.textContent = "Flee";
            } else if (currentFleeButton) { // If battle ended during cooldown, just reset text
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
    const nextStageButton = document.getElementById('nextStage-popup');

    if (popup && titleDiv && messageDiv) {
        titleDiv.textContent = title;
        messageDiv.textContent = message;

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

export function returnToMap() {
    hidePopup();
    stopBattle(false);
    openTab({ currentTarget: document.getElementById('mapNavButton') }, 'map');
}

async function startBattle(poiData, dialogueOptions = null, stageNum = 1) {
    if (!poiData || !poiData.name) {
        console.error("startBattle called without valid POI data or POI name.");
        battleLog.log("Error: Battle cannot start without area information.");
        return;
    }
    const areaNameString = poiData.name;
    initializeBattleState(areaNameString, stageNum);

    currentBattleDialogueOptions = dialogueOptions;
    currentBattleArea = new Area(areaNameString);

    battleLog.log(`Attempting to load area: ${areaNameString} for battle.`);
    await currentBattleArea.loadData();

    if (!currentBattleArea.isLoaded) {
        console.error(`Failed to load data for area: ${areaNameString}. Cannot start battle.`);
        battleLog.log(`Error: Could not load enemy team for ${areaNameString}.`);
        showPopup("Battle Error", `Could not load battle area: ${areaNameString}.`);
        setTimeout(returnToMap, 2000);
        return;
    }
    battleLog.log(`Area ${areaNameString} loaded. Spawning mobs for stage ${currentBattleStageNumber}.`);

    // Populate Player Team (team1)
    team1.clearMembers();
    const activePlayerParty = hero.getActivePartyMembers(); // Gets hero + companions from formation

    activePlayerParty.forEach((member, index) => {
        member.team = team1; // Assign to battle team instance
        member.opposingTeam = team2;
        // member.memberId is set in renderTeamMembers or should be persistent on hero/companion

        // Reset states for battle
        member.dead = false;
        member.currentHealth = member.maxHealth;
        member.currentMana = member.stats.mana;
        member.currentStamina = member.stats.stamina;
        member.effects = []; // Clear effects from previous battles/states
        // Visual reset will be handled by renderTeamMembers and subsequent updates

        team1.addMember(member);
    });
    renderTeamMembers(team1.members, 'team1', true); // Render to BATTLEFIELD container
    team1.members.forEach(member => { // Initialize DOM elements after rendering
      if (typeof member.initializeDOMElements === 'function') member.initializeDOMElements();
      updateHealth(member); updateMana(member); updateStamina(member); // Ensure bars are correct
       if (member.element) { // Clear visual effects from previous battle
            const effectsContainer = member.element.querySelector('.effects');
            if (effectsContainer) effectsContainer.innerHTML = '';
            const portraitImg = member.element.querySelector(".memberPortrait img");
            if (portraitImg && member.class.portrait) portraitImg.src = member.class.portrait; // Reset portrait from dead.jpg
        }
    });


    // Populate Enemy Team (team2)
    team2.clearMembers();
    const mobs = currentBattleArea.spawnMobs(mobsClasses, team2, currentBattleStageNumber);

    if (!mobs || mobs.length === 0) {
        console.warn(`No mobs spawned for ${areaNameString}, stage ${currentBattleStageNumber}.`);
        battleLog.log(`Warning: No enemies for ${areaNameString} - Stage ${currentBattleStageNumber}.`);
    }

    mobs.forEach((mob, index) => {
        mob.team = team2;
        mob.opposingTeam = team1;
        // mob.memberId is set in renderTeamMembers
        team2.addMember(mob);
    });
    renderTeamMembers(team2.members, 'team2', true);
    team2.members.forEach(mob => {
        if (typeof mob.initializeDOMElements === 'function') mob.initializeDOMElements();
    });


    if (dialogueOptions && dialogueOptions.npcId && dialogueOptions.startDialogueId) {
        isBattlePausedForDialogue = true;
        battleLog.log(`Starting pre-battle dialogue: ${dialogueOptions.startDialogueId}`);
        await window.startDialogue(dialogueOptions.npcId, dialogueOptions.startDialogueId);
        battleLog.log("Pre-battle dialogue finished.");
        isBattlePausedForDialogue = false;
    }

    // Check if battle should even start if one team is empty (e.g. no mobs spawned)
    if (team1.members.length === 0 || team2.members.length === 0) {
        battleLog.log("Battle cannot start, one team is empty.");
        await checkBattleOutcome(); // This will resolve the empty battle immediately
        return;
    }


    battleLog.log(`Battle started at ${currentPoiName}, Stage ${currentBattleStageNumber}`);
    battleStarted = true;

    useTeamSkills(team2); // Mobs use their skills
    if (hero) hero.triggerRepeatSkills(); // Hero's auto-repeat skills

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
    isBattlePausedForDialogue = false; // Ensure dialogue pause is lifted

    // Skills are stopped by checkBattleOutcome -> handleWin/Loss -> stopAllSkills
    // or here directly if fleeing.
    if (fled) {
        battleStarted = false;
        stopAllSkills(team1, team2); // Explicitly stop skills if fleeing before outcome check
        hidePopup();
        openTab({ currentTarget: document.getElementById('mapNavButton') }, 'map');
    }
}

async function repeatStage() {
    hidePopup();
    if (!currentBattleArea || !currentBattleArea.isLoaded || !currentPoiName) {
        console.error("Cannot repeat stage: Battle area context not valid.");
        battleLog.log("Error: No valid area context to repeat the stage.");
        returnToMap();
        return;
    }
    const pseudoPoiData = { name: currentPoiName };
    await startBattle(pseudoPoiData, currentBattleDialogueOptions, currentBattleStageNumber);
}

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
        return;
    }

    const pseudoPoiData = { name: currentPoiName };
    await startBattle(pseudoPoiData, currentBattleDialogueOptions, nextStageNum);
}

export {startBattle, stopBattle, hidePopup, battleStarted, repeatStage, nextStage};