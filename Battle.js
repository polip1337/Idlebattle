import Member from './Member.js';
import {battleLog, evolutionService,renderTeamMembers, hero, isPaused,
 team1, team2, battleStatistics, mobsClasses, allCompanionsData, globalAutosaveSettings } from './initialize.js'; // Added globalAutosaveSettings, allCompanionsData
import { triggerAutosave as slTriggerAutosave } from './saveLoad.js'; // Import autosave trigger
import Hero from './Hero.js';
import Area from './Area.js';
import { questSystem } from './questSystem.js';
import { openTab } from './navigation.js';
import { updateHealth, updateMana, updateStamina } from './Render.js';
import EffectClass from './EffectClass.js';
import { handleActions } from './actionHandler.js';
import { refreshMapElements } from './map.js'; // Add import for map refresh


let battleStarted = false;
let battleInterval = null;
let isFleeOnCooldown = false;
const FLEE_COOLDOWN_SECONDS = 10;
let currentPoiName = null;
let currentBattleDialogueOptions = null;
let isBattlePausedForDialogue = false;
let hasShownPreCombatDialogue = false;

// Expose battle state variables to window object
window.battleStarted = battleStarted;
window.isBattlePausedForDialogue = isBattlePausedForDialogue;

let currentBattleArea = null;
let currentBattleStageNumber = 1;
const xpPerStageBase = 50; // Base XP for clearing a stage
let completedStages = new Set(); // Track completed stages
document.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'x' && battleStarted) {
        // Defeat all enemies instantly
        team2.members.forEach(member => {
            member.currentHealth = 0;
        });
        checkBattleOutcome();
    }
});
function resetFleeButtonState() {
    const fleeButton = document.getElementById('flee-battle');
    if (fleeButton) {
        fleeButton.disabled = false;
        fleeButton.textContent = "Flee";
    }
    isFleeOnCooldown = false;
}

function updateStageDisplay() {
    const stageDisplay = document.getElementById('battle-stage-display');
    const increaseStageButton = document.getElementById('increase-stage');

    if (stageDisplay && currentBattleArea) {
        stageDisplay.textContent = `Stage ${currentBattleStageNumber} of ${currentBattleArea.stages.length}`;
    }

    // Update next stage button state
    if (increaseStageButton) {
        const canAdvance = currentBattleArea &&
                          currentBattleStageNumber < currentBattleArea.stages.length &&
                          completedStages.has(currentBattleStageNumber);
        increaseStageButton.disabled = !canAdvance;
        increaseStageButton.style.opacity = canAdvance ? '1' : '0.5';
    }
}

function initializeBattleState(poiName = null, stageNum = 1) {
    currentPoiName = poiName;
    currentBattleStageNumber = stageNum;
    currentBattleArea = null;
    hasShownPreCombatDialogue = false;
    resetFleeButtonState();
    isBattlePausedForDialogue = false;
    completedStages = new Set(); // Reset completed stages when starting a new area
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

        // Remove all effects from both teams
        removeAllEffects(team1);
        removeAllEffects(team2);

        if (!team1Alive) {
            await handleBattleLoss();
        } else { // team1 won (team2 defeated)
            await handleBattleWin();
        }

        // Stop skills for all members involved in the just-ended battle
        stopAllSkills(team1, team2);

        if (hero) evolutionService.checkClassAvailability(); // Check hero evolution

        // AUTOSAVE TRIGGER (moved here to ensure it happens after all state updates from win/loss)
        if (globalAutosaveSettings.enabled && globalAutosaveSettings.saveOnBattleEnd) {
            slTriggerAutosave("battle_end");
        }

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
    let xpFromBattle = xpPerStageBase * currentBattleStageNumber;
    return Math.max(10, Math.floor(xpFromBattle));
}


async function handleBattleWin() {
    const totalGoldDropped = calculateGoldDrop();
    if (totalGoldDropped > 0) {
        hero.addGold(totalGoldDropped);
        battleLog.log(`Collected ${totalGoldDropped} gold!`);
        battleStatistics.addGoldCollected(totalGoldDropped);
    }

    const xpFromBattle = calculateStageXP();
    if (xpFromBattle > 0 && hero) {
        battleLog.log(`Party gained ${xpFromBattle} XP!`);
        hero.distributeBattleXP(xpFromBattle);
    }

    // Mark current stage as completed
    completedStages.add(currentBattleStageNumber);
    updateStageDisplay(); // Update display to reflect stage completion

    questSystem.updateQuestProgress('combatComplete', { poiName: currentPoiName, stage: currentBattleStageNumber });

    // Show post-combat dialogue only after completing the highest stage
    if (currentBattleDialogueOptions && currentBattleDialogueOptions.npcId &&
        currentBattleDialogueOptions.endWinDialogueId &&
        currentBattleStageNumber === currentBattleArea.stages.length) {
        isBattlePausedForDialogue = true;
        battleLog.log(`Starting post-battle (win) dialogue: ${currentBattleDialogueOptions.endWinDialogueId}`);
        await window.startDialogue(currentBattleDialogueOptions.npcId, currentBattleDialogueOptions.endWinDialogueId);
        battleLog.log("Post-battle (win) dialogue finished.");
        isBattlePausedForDialogue = false;
        return; // Skip popup if dialogue was shown
    }

    // Only show popup if no dialogue was shown
    if (currentBattleArea && currentBattleStageNumber < currentBattleArea.stages.length) {
        showPopup("Stage Cleared!", `Your team has cleared stage ${currentBattleStageNumber}.`);
    } else {
        showPopup("Victory!", `Your team has defeated all enemies in ${currentPoiName}.`);
    }
}

async function handleBattleLoss() {
    // Note: Quest progress for loss (e.g. 'defeatInAreaX') could be added here if needed
    if (currentBattleDialogueOptions && currentBattleDialogueOptions.npcId && currentBattleDialogueOptions.endLossDialogueId) {
        isBattlePausedForDialogue = true;
        battleLog.log(`Starting post-battle (loss) dialogue: ${currentBattleDialogueOptions.endLossDialogueId}`);
        await window.startDialogue(currentBattleDialogueOptions.npcId, currentBattleDialogueOptions.endLossDialogueId);
        battleLog.log("Post-battle (loss) dialogue finished.");
        isBattlePausedForDialogue = false;
        return; // Skip popup if dialogue was shown
    }

    // Only show popup if no dialogue was shown
    showPopup("Defeat!", "Your team has been defeated.");
}

function checkAndHandleRepeatStage() {
    const repeatCheckbox = document.getElementById('repeat');
    const popup = document.getElementById('popup');
    // Ensure popup is visible before attempting to auto-repeat based on its content
    if (repeatCheckbox && repeatCheckbox.checked && popup && !popup.classList.contains('hidden')) {
        const canAdvance = currentBattleArea && currentBattleStageNumber < currentBattleArea.stages.length;
        // If cannot advance (last stage) OR if the popup explicitly says "Victory!" (implying area clear)
        if (!canAdvance || (popup.querySelector('#popupTitle')?.textContent.includes("Victory!"))) {
            setTimeout(async () => {
                if (!battleStarted) { // Only repeat if a new battle hasn't started somehow else
                    await repeatStage();
                }
            }, 1000); // Delay to allow player to see popup
        }
    }
}

function useTeamSkills(teamInstance) {
    teamInstance.members.forEach(member => {
        if (member.currentHealth > 0) {
            member.skills.forEach(skill => {
                if (skill.type === "active") {
                    // Initialize skill element if not already set
                    if (!skill.div && member.element) {
                        const skillDivId = member.memberId + "Skill" + skill.name.replace(/\s/g, '');
                        const skillElement = member.element.querySelector("#" + skillDivId);
                        if (skillElement) {
                            skill.setElement(skillElement);
                        }
                    }
                    if (!member.isHero) {
                        skill.needsInitialCooldownKickoff = true;
                        skill.useSkill(member);
                    }
                } else if (skill.type === "passive") {
                    // Passive effects are usually applied at skill acquisition or start of battle
                }
            });
        }
    });
}

function stopAllSkills(playerTeamInstance, enemyTeamInstance) {
    if (playerTeamInstance && playerTeamInstance.members) {
        playerTeamInstance.members.forEach(member => {
            if (member && typeof member.stopSkills === 'function') {
                member.stopSkills();
            }
        });
    }
    if (enemyTeamInstance && enemyTeamInstance.members) {
        enemyTeamInstance.members.forEach(member => {
            if (member && typeof member.stopSkills === 'function') {
                member.stopSkills();
            }
        });
    }
}

function removeAllEffects(teamInstance) {
    if (teamInstance && teamInstance.members) {
        teamInstance.members.forEach(member => {
            if (member && member.effects) {
                // Create a copy of the effects array since we'll be modifying it during iteration
                const effectsCopy = [...member.effects];
                effectsCopy.forEach(effect => {
                    effect.remove();
                });
            }
        });
    }
}

function calculateFleeChance() {
    let heroDex = hero.stats.dexterity || 0;
    const avgPlayerPartyDex = team1.members.reduce((sum, pMember) => sum + (pMember.stats.dexterity || 0), 0) / team1.members.length || heroDex;

    let avgEnemyDex = 0;
    const aliveEnemies = team2.getAllAliveMembers();

    if (aliveEnemies.length > 0) {
        avgEnemyDex = aliveEnemies.reduce((sum, enemy) => sum + (enemy.stats.dexterity || 0), 0) / aliveEnemies.length;
    }

    let fleeChance = 70 + Math.floor(avgPlayerPartyDex / 5) - Math.floor(avgEnemyDex / 5);
    return Math.max(10, Math.min(90, fleeChance));
}

function handleSuccessfulFlee(fleeChance, randomRoll) {
    battleLog.log(`Successfully fled from battle! (Chance: ${fleeChance.toFixed(0)}%, Rolled: ${randomRoll.toFixed(0)})`);
    battleStatistics.addSuccessfulFlee();

    // Check for flee dialogue before stopping battle
    if (currentBattleDialogueOptions && currentBattleDialogueOptions.npcId && currentBattleDialogueOptions.fleeDialogueId) {
        isBattlePausedForDialogue = true;
        battleLog.log(`Starting flee dialogue: ${currentBattleDialogueOptions.fleeDialogueId}`);
        window.startDialogue(currentBattleDialogueOptions.npcId, currentBattleDialogueOptions.fleeDialogueId)
            .then(() => {
                battleLog.log("Flee dialogue finished.");
                isBattlePausedForDialogue = false;
                handleEscapeActions();
                stopBattle(true); // Pass true to indicate fled
            })
            .catch(error => {
                console.error("Error during flee dialogue:", error);
                handleEscapeActions();
                stopBattle(true); // Still stop battle even if dialogue fails
            });
    } else {
        handleEscapeActions();
        stopBattle(true); // Pass true to indicate fled
    }

    questSystem.updateQuestProgress('escape', { poiName: currentPoiName});
}

function handleEscapeActions() {
    if (!currentBattleDialogueOptions || !currentBattleDialogueOptions.escapeActions) return;
    handleActions(currentBattleDialogueOptions.escapeActions);
}

function handleFailedFlee(fleeChance, randomRoll) {
    battleLog.log(`Failed to flee! (Chance: ${fleeChance.toFixed(0)}%, Rolled: ${randomRoll.toFixed(0)})`);
    // Flee cooldown visual will start regardless
}

function startFleeCooldownVisuals() {
    const fleeButton = document.getElementById('flee-battle');
    if (!fleeButton) return;

    fleeButton.disabled = true; // Ensure it's disabled at the start of cooldown
    let cooldownTimeLeft = FLEE_COOLDOWN_SECONDS;
    fleeButton.textContent = `Flee (${cooldownTimeLeft}s)`;

    const cooldownInterval = setInterval(() => {
        cooldownTimeLeft--;
        const currentFleeButton = document.getElementById('flee-battle');
        if (currentFleeButton) { // Check if button still exists
            currentFleeButton.textContent = `Flee (${cooldownTimeLeft}s)`;
        }

        if (cooldownTimeLeft <= 0) {
            clearInterval(cooldownInterval);
            isFleeOnCooldown = false; // Reset cooldown state
            if (currentFleeButton) {
                currentFleeButton.textContent = "Flee";
                if (battleStarted) { // Only re-enable if battle is still ongoing
                    currentFleeButton.disabled = false;
                }
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

    isFleeOnCooldown = true; // Set cooldown state immediately
    // Visuals (button text, disabled state) handled by startFleeCooldownVisuals

    const fleeChance = calculateFleeChance();
    const randomRoll = Math.random() * 100;

    if (randomRoll < fleeChance) {
        handleSuccessfulFlee(fleeChance, randomRoll);
        // stopBattle(true) is called in handleSuccessfulFlee, which will also hide popup.
        // No need to start cooldown visuals if flee is successful, as battle ends.
        // However, the flee button itself should be reset for next battle (handled by initializeBattleState or stopBattle).
        // For consistency, let resetFleeButtonState handle resetting it when battle ends or new one starts.
    } else {
        handleFailedFlee(fleeChance, randomRoll);
        startFleeCooldownVisuals(); // Start cooldown visuals only on fail
    }
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
    stopBattle(false); // Pass false, not fled, just returning
    openTab({ currentTarget: document.getElementById('mapNavButton') }, 'map');
}

async function startBattle(poiData, dialogueOptions = null, stageNum = 1) {
    if (!poiData || !poiData.name) {
        console.error("startBattle called without valid POI data or POI name.");
        battleLog.log("Error: Battle cannot start without area information.");
        return;
    }

    // Clear map regeneration interval when entering battle
    if (window.regenerationInterval) {
        clearInterval(window.regenerationInterval);
        window.regenerationInterval = null;
    }

    const areaNameString = poiData.name;
    initializeBattleState(areaNameString, stageNum); // Resets flee button, dialogue pause

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

    // Handle pre-battle sequence if it exists
    if (poiData.preBattleSequence && poiData.preBattleSequence.length > 0) {
        battleLog.log("Executing pre-battle sequence");
        for (const action of poiData.preBattleSequence) {
            await handleActions(action);
        }
    }

    // Set up teams first
    team1.clearMembers();
    const activePlayerParty = hero.getActivePartyMembers();

    activePlayerParty.forEach((member) => {
        member.team = team1;
        member.opposingTeam = team2;
        member.dead = false;
        member.effects = [];
        team1.addMember(member);
    });
    renderTeamMembers(team1.members, 'team1', true);
    team1.members.forEach(member => {
      if (typeof member.initializeDOMElements === 'function') member.initializeDOMElements();
      updateHealth(member); updateMana(member); updateStamina(member);
       if (member.element) {
            const effectsContainer = member.element.querySelector('.effects');
            if (effectsContainer) effectsContainer.innerHTML = '';
            const portraitImg = member.element.querySelector(".memberPortrait img");
            if (portraitImg && member.class.portrait) portraitImg.src = member.class.portrait;
        }
        // Reset skill states for companions
        if (!member.isHero && member.skills) {
            member.skills.forEach(skill => {
                // Reset all cooldown-related properties
                skill.needsInitialCooldownKickoff = true;
                skill.onCooldown = false;
                skill.remainingDuration = 0;
                skill.cooldownStartTime = null;
                // Reset overlay if it exists
                if (skill.overlay) {
                    skill.overlay.classList.add('hidden');
                    skill.overlay.style.animation = '';
                    skill.overlay.style.height = '0%';
                    skill.overlay.classList.remove('paused');
                }
                // Reset div state if it exists
                if (skill.div) {
                    skill.div.classList.remove('disabled');
                }
            });
        }
    });

    team2.clearMembers();
    const mobs = currentBattleArea.spawnMobs(mobsClasses, team2, currentBattleStageNumber);

    if (!mobs || mobs.length === 0) {
        console.warn(`No mobs spawned for ${areaNameString}, stage ${currentBattleStageNumber}.`);
        battleLog.log(`Warning: No enemies for ${areaNameString} - Stage ${currentBattleStageNumber}.`);
        // Battle will end immediately due to no enemies, handled by checkBattleOutcome
    }

    mobs.forEach((mob) => {
        mob.team = team2;
        mob.opposingTeam = team1;
        team2.addMember(mob);
    });
    renderTeamMembers(team2.members, 'team2', true);
    team2.members.forEach(mob => {
        if (typeof mob.initializeDOMElements === 'function') mob.initializeDOMElements();
    });

    if (team1.members.length === 0 || team2.members.length === 0) {
        battleLog.log("Battle cannot start or continue, one team is empty.");
        await checkBattleOutcome();
        return;
    }

    // Set battle as started but paused
    battleStarted = true;
    window.battleStarted = true;
    isBattlePausedForDialogue = true;
    window.isBattlePausedForDialogue = true;
    resetFleeButtonState();

    // Handle area-level onEnterActions
    if (currentBattleArea.onEnterActions && currentBattleArea.onEnterActions.length > 0) {
        battleLog.log("Executing area onEnterActions");
        await handleActions(currentBattleArea.onEnterActions);
    }

    // Show pre-combat dialogue only at the start of the first stage
    if (dialogueOptions && dialogueOptions.npcId && dialogueOptions.startDialogueId &&
        !hasShownPreCombatDialogue && currentBattleStageNumber === 1) {
        battleLog.log(`Starting pre-battle dialogue: ${dialogueOptions.startDialogueId}`);
        await window.startDialogue(dialogueOptions.npcId, dialogueOptions.startDialogueId);
        battleLog.log("Pre-battle dialogue finished.");
        hasShownPreCombatDialogue = true;
        if (isPaused) return; // If game was paused externally during dialogue
    }

    // Then handle stage-specific onEnterEffect and onEnterActions
    const currentStage = currentBattleArea.stages[currentBattleStageNumber - 1];
    if (currentStage) {
        if (currentStage.onEnterEffect) {
            team1.members.forEach(member => {
                new EffectClass(member, currentStage.onEnterEffect);
            });
        }
        if (currentStage.onEnterActions) {
            await handleActions(currentStage.onEnterActions);
        }
    }

    useTeamSkills(team2);
    useTeamSkills(team1);
    if (hero) hero.triggerRepeatSkills();

    if (battleInterval) {
        clearInterval(battleInterval);
    }
    battleInterval = setInterval(gameTick, 1000);

    // Update stage display
    updateStageDisplay();

    // Only unpause the battle after everything is set up and ready
    isBattlePausedForDialogue = false;
    window.isBattlePausedForDialogue = false;
}

function stopBattle(fled = false) {
    if (battleInterval) {
        clearInterval(battleInterval);
        battleInterval = null;
    }
    battleStarted = false; // Ensure battle is marked as not started
    window.battleStarted = false; // Update window object
    isBattlePausedForDialogue = false;
    window.isBattlePausedForDialogue = false; // Update window object
    resetFleeButtonState(); // Reset flee button, e.g. if battle stopped externally

    // Finish all hero cooldowns
    if (hero && hero.skills) {
        hero.skills.forEach(skill => {
            if (skill && typeof skill.finishCooldown === 'function') {
                skill.finishCooldown(hero, false); // Pass false to prevent auto-repeat
            }
        });
    }

    // Skills are typically stopped by checkBattleOutcome.
    // If fleeing or stopping externally, ensure skills are stopped.
    if (fled || !team1.members.some(m => m.currentHealth > 0) || !team2.members.some(m => m.currentHealth > 0)) {
        stopAllSkills(team1, team2);
    }

    // Restart map regeneration interval when leaving battle
    if (!window.regenerationInterval) {
        window.regenerationInterval = setInterval(() => {
            if (document.getElementById('map').classList.contains('active')) {
                refreshMapElements(); // Update map UI including hero portrait
            }
        }, 2000);
    }

    if (fled) { // Only if explicitly fled
        hidePopup();
        openTab({ currentTarget: document.getElementById('mapNavButton') }, 'map');
    }
    // If not fled, popup display is handled by win/loss logic or external calls.
}

async function repeatStage() {
    hidePopup();
    if (!currentBattleArea || !currentBattleArea.isLoaded || !currentPoiName) {
        console.error("Cannot repeat stage: Battle area context not valid.");
        battleLog.log("Error: No valid area context to repeat the stage.");
        returnToMap();
        return;
    }
    // Ensure battle is properly stopped before starting a new one
    if (battleStarted) stopBattle(false);

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
    // Ensure battle is properly stopped before starting a new one
    if (battleStarted) stopBattle(false);

    const nextStageNum = currentBattleStageNumber + 1;

    if (nextStageNum > currentBattleArea.stages.length) {
        battleLog.log(`All stages in ${currentPoiName} cleared! This should have been caught by handleBattleWin.`);
        showPopup("Area Cleared!", `You have completed all stages in ${currentPoiName}.`);
        // No autosave here, as it's covered by the battle win that led to this.
        return; // No next stage to go to
    }

    const pseudoPoiData = { name: currentPoiName };
    await startBattle(pseudoPoiData, currentBattleDialogueOptions, nextStageNum);
}

export {startBattle, stopBattle, hidePopup, battleStarted, repeatStage, nextStage};