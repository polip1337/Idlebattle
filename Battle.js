import Member from './Member.js';
import {battleLog, evolutionService, renderTeamMembers, hero, isPaused,
 team1, team2, battleStatistics, mobsClasses, allCompanionsData, globalAutosaveSettings } from './initialize.js';
import { triggerAutosave as slTriggerAutosave } from './saveLoad.js';
import Hero from './Hero.js';
import Area from './Area.js';
import { questSystem } from './questSystem.js';
import { openTab } from './navigation.js';
import { updateHealth, updateMana, updateStamina } from './Render.js';
import EffectClass from './EffectClass.js';
import { handleActions } from './actionHandler.js';

import { BattleState } from './battleState.js';
import { BattleUI } from './battleUI.js';
import { TeamManager } from './battleTeam.js';
import { DialogueManager } from './battleDialogue.js';
import { RewardCalculator } from './battleRewards.js';
import { AutoRepeatManager } from './battleAutoRepeat.js';
import { SkillManager } from './battleSkills.js';

// Main battle state instance
const battleState = new BattleState();

// Core battle functions
async function gameTick() {
    if (!battleState.isActive()) return;
    TeamManager.handleRegeneration(team1, team2);
    await checkBattleOutcome();
}

async function checkBattleOutcome() {
    const team1Alive = team1.members.some(member => member.currentHealth > 0);
    const team2Alive = team2.members.some(member => member.currentHealth > 0);

    if (team1Alive && team2Alive) return;

    const wasBattleStarted = battleState.started;
    battleState.stop();

    TeamManager.removeAllEffects(team1);
    TeamManager.removeAllEffects(team2);

    if (!team1Alive) {
        await handleBattleLoss();
    } else {
        await handleBattleWin();
    }

    TeamManager.stopAllSkills(team1, team2);
    
    if (hero) evolutionService.checkClassAvailability();

    if (globalAutosaveSettings.enabled && globalAutosaveSettings.saveOnBattleEnd) {
        slTriggerAutosave("battle_end");
    }

    const popup = document.getElementById('popup');
    if (wasBattleStarted && (!popup || popup.classList.contains('hidden'))) {
        AutoRepeatManager.checkAndHandle(battleState, repeatStage);
    }
}

async function handleBattleWin() {
    RewardCalculator.distributeRewards(battleState, hero, battleStatistics);
    
    battleState.completedStages.add(battleState.currentBattleStageNumber);
    BattleUI.updateStageDisplay(battleState);

    questSystem.updateQuestProgress('combatComplete', { 
        poiName: battleState.currentPoiName, 
        stage: battleState.currentBattleStageNumber 
    });

    const dialogueShown = await DialogueManager.handlePostWinDialogue(battleState);
    if (dialogueShown) return;

    // Show popup only if no dialogue
    const isLastStage = battleState.currentBattleStageNumber >= battleState.currentBattleArea.stages.length;
    const title = isLastStage ? "Victory!" : "Stage Cleared!";
    const message = isLastStage ? 
        `Your team has defeated all enemies in ${battleState.currentPoiName}.` :
        `Your team has cleared stage ${battleState.currentBattleStageNumber}.`;
    
    BattleUI.showPopup(title, message, battleState);
}

async function handleBattleLoss() {
    const dialogueShown = await DialogueManager.handlePostLossDialogue(battleState);
    if (!dialogueShown) {
        BattleUI.showPopup("Defeat!", "Your team has been defeated.", battleState);
    }
}

// Exported functions
export async function attemptFlee() {
    const success = battleState.flee.attempt();
    if (!success) return;

    const dialogueShown = await DialogueManager.handleFleeDialogue(battleState);
    if (dialogueShown && battleState.currentBattleDialogueOptions?.escapeActions) {
        handleActions(battleState.currentBattleDialogueOptions.escapeActions);
    }
    
    battleState.stop(true);
    BattleUI.hidePopup();
    openTab({ currentTarget: document.getElementById('mapNavButton') }, 'map');
}

export function returnToMap() {
    BattleUI.hidePopup();
    battleState.stop(false);
    openTab({ currentTarget: document.getElementById('mapNavButton') }, 'map');
}

export async function startBattle(poiData, dialogueOptions = null, stageNum = 1) {
    if (!poiData?.name) {
        console.error("startBattle called without valid POI data or POI name.");
        battleLog.log("Error: Battle cannot start without area information.");
        return;
    }

    battleState.reset(poiData.name, stageNum);
    battleState.currentBattleDialogueOptions = dialogueOptions;
    battleState.currentBattleArea = new Area(poiData.name);

    battleLog.log(`Attempting to load area: ${poiData.name} for battle.`);
    await battleState.currentBattleArea.loadData();

    if (!battleState.currentBattleArea.isLoaded) {
        console.error(`Failed to load data for area: ${poiData.name}. Cannot start battle.`);
        battleLog.log(`Error: Could not load enemy team for ${poiData.name}.`);
        BattleUI.showPopup("Battle Error", `Could not load battle area: ${poiData.name}.`, battleState);
        setTimeout(returnToMap, 2000);
        return;
    }

    // Execute pre-battle sequence
    if (poiData.preBattleSequence?.length > 0) {
        battleLog.log("Executing pre-battle sequence");
        for (const action of poiData.preBattleSequence) {
            await handleActions(action);
        }
    }

    // Setup teams
    TeamManager.setupPlayerTeam(team1, team2, hero);
    const enemiesSpawned = TeamManager.setupEnemyTeam(team2, battleState, mobsClasses);

    if (!enemiesSpawned || team1.members.length === 0) {
        battleLog.log("Battle cannot start, one team is empty.");
        await checkBattleOutcome();
        return;
    }

    battleState.start();
    battleState.pauseForDialogue();

    // Execute area onEnterActions
    if (battleState.currentBattleArea.onEnterActions?.length > 0) {
        battleLog.log("Executing area onEnterActions");
        await handleActions(battleState.currentBattleArea.onEnterActions);
    }

    // Show pre-combat dialogue
    await DialogueManager.handlePreBattleDialogue(battleState);
    if (isPaused) return;

    // Handle stage-specific effects
    const currentStage = battleState.currentBattleArea.stages[battleState.currentBattleStageNumber - 1];
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

    // Initialize skills
    SkillManager.useTeamSkills(team2);
    SkillManager.useTeamSkills(team1);
    if (hero) hero.triggerRepeatSkills();

    BattleUI.updateStageDisplay(battleState);
    battleState.resumeFromDialogue();
}

export function stopBattle(fled = false) {
    return battleState.stop(fled);
}

export function hidePopup() {
    BattleUI.hidePopup();
}

export async function repeatStage() {
    BattleUI.hidePopup();
    if (!battleState.currentBattleArea?.isLoaded || !battleState.currentPoiName) {
        console.error("Cannot repeat stage: Battle area context not valid.");
        battleLog.log("Error: No valid area context to repeat the stage.");
        returnToMap();
        return;
    }

    if (battleState.started) battleState.stop(false);
    const pseudoPoiData = { name: battleState.currentPoiName };
    await startBattle(pseudoPoiData, battleState.currentBattleDialogueOptions, battleState.currentBattleStageNumber);
}

export async function nextStage() {
    BattleUI.hidePopup();
    if (!battleState.currentBattleArea?.isLoaded || !battleState.currentPoiName) {
        console.error("Cannot advance to next stage: Battle area context not valid.");
        battleLog.log("Error: No valid area context for next stage.");
        returnToMap();
        return;
    }

    if (battleState.started) battleState.stop(false);
    const nextStageNum = battleState.currentBattleStageNumber + 1;

    if (nextStageNum > battleState.currentBattleArea.stages.length) {
        battleLog.log(`All stages in ${battleState.currentPoiName} cleared!`);
        BattleUI.showPopup("Area Cleared!", `You have completed all stages in ${battleState.currentPoiName}.`, battleState);
        return;
    }

    const pseudoPoiData = { name: battleState.currentPoiName };
    await startBattle(pseudoPoiData, battleState.currentBattleDialogueOptions, nextStageNum);
}

// Legacy interface compatibility - maintains exact same interface as original
export let battleStarted = false;
export let isBattlePausedForDialogue = false;

// Proxy the original variables to internal state
Object.defineProperty(window, 'battleStarted', {
    get: () => battleState.started,
    set: (value) => { 
        if (value) battleState.start(); 
        else battleState.stop(); 
    }
});

Object.defineProperty(window, 'isBattlePausedForDialogue', {
    get: () => battleState.pausedForDialogue,
    set: (value) => { 
        if (value) battleState.pauseForDialogue(); 
        else battleState.resumeFromDialogue(); 
    }
});

// Debug shortcut
document.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'x' && battleState.started) {
        team2.members.forEach(member => member.currentHealth = 0);
        checkBattleOutcome();
    }
});