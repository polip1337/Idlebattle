import { BattleState } from './battle/BattleState.js';
import { BattleUI } from './battle/BattleUI.js';
import { BattleTeams } from './battle/BattleTeams.js';
import { BattleStages } from './battle/BattleStages.js';
import { BattleFlee } from './battle/BattleFlee.js';
import { battleLog, evolutionService, renderTeamMembers, hero, isPaused,
         team1, team2, battleStatistics, mobsClasses, allCompanionsData, 
         globalAutosaveSettings } from './initialize.js';
import { triggerAutosave as slTriggerAutosave } from './saveLoad.js';
import { questSystem } from './questSystem.js';
import { openTab } from './navigation.js';
import { updateHealth, updateMana, updateStamina } from './Render.js';
import EffectClass from './EffectClass.js';
import { handleActions } from './actionHandler.js';

class Battle {
    constructor() {
        this.state = new BattleState();
        this.ui = new BattleUI();
        this.teams = new BattleTeams(team1, team2);
        this.stages = new BattleStages();
        this.flee = new BattleFlee();
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (event) => {
            if (event.key.toLowerCase() === 'x' && this.state.isStarted) {
                this.teams.defeatAllEnemies();
                this.checkBattleOutcome();
            }
        });
    }

    async startBattle(poiData, dialogueOptions = null, stageNum = 1) {
        if (!this.validateBattleStart(poiData)) return;

        this.state.initialize(poiData.name, stageNum, dialogueOptions);
        await this.loadBattleArea(poiData);
        await this.setupTeams();
        await this.handlePreBattleActions(poiData);
        await this.handlePreBattleDialogue();
        this.startBattleLoop();
    }

    validateBattleStart(poiData) {
        if (!poiData?.name) {
            console.error("startBattle called without valid POI data or POI name.");
            battleLog.log("Error: Battle cannot start without area information.");
            return false;
        }
        return true;
    }

    async loadBattleArea(poiData) {
        this.stages.setArea(poiData.name);
        await this.stages.loadData();
        
        if (!this.stages.isLoaded) {
            this.handleBattleLoadError(poiData.name);
            return false;
        }
        return true;
    }

    handleBattleLoadError(areaName) {
        console.error(`Failed to load data for area: ${areaName}. Cannot start battle.`);
        battleLog.log(`Error: Could not load enemy team for ${areaName}.`);
        this.ui.showPopup("Battle Error", `Could not load battle area: ${areaName}.`);
        setTimeout(() => this.returnToMap(), 2000);
    }

    async setupTeams() {
        this.teams.setupPlayerTeam(hero);
        this.teams.setupEnemyTeam(this.stages.currentArea, mobsClasses);
        this.teams.renderTeams();
    }

    async handlePreBattleActions(poiData) {
        if (poiData.preBattleActions?.length > 0) {
            battleLog.log("Executing pre-battle actions");
            await handleActions(poiData.preBattleActions);
        }
    }

    async handlePreBattleDialogue() {
        const dialogueOptions = this.state.currentDialogueOptions;
        if (dialogueOptions?.npcId && dialogueOptions?.startDialogueId && 
            !this.state.hasShownPreCombatDialogue && this.state.currentStageNumber === 1) {
            await this.startDialogue(dialogueOptions.npcId, dialogueOptions.startDialogueId);
            this.state.hasShownPreCombatDialogue = true;
        }
    }

    startBattleLoop() {
        this.state.startBattle();
        this.teams.initializeSkills();
        this.stages.updateDisplay();
        this.flee.resetState();
        
        if (this.state.battleInterval) {
            clearInterval(this.state.battleInterval);
        }
        this.state.battleInterval = setInterval(() => this.gameTick(), 1000);
    }

    async gameTick() {
        if (isPaused || !this.state.isStarted || this.state.isPausedForDialogue) return;

        this.teams.handleRegeneration();
        await this.checkBattleOutcome();
    }

    async checkBattleOutcome() {
        if (!this.teams.hasActiveMembers()) {
            this.endBattle();
            await this.handleBattleEnd();
        }
    }

    endBattle() {
        if (this.state.battleInterval) {
            clearInterval(this.state.battleInterval);
            this.state.battleInterval = null;
        }
        this.state.stopBattle();
        this.teams.stopAllSkills();
        this.teams.removeAllEffects();
    }

    async handleBattleEnd() {
        const team1Won = this.teams.isTeam1Victorious();
        
        if (team1Won) {
            await this.handleBattleWin();
        } else {
            await this.handleBattleLoss();
        }

        if (hero) evolutionService.checkClassAvailability();
        
        if (globalAutosaveSettings.enabled && globalAutosaveSettings.saveOnBattleEnd) {
            slTriggerAutosave("battle_end");
        }

        this.checkAndHandleRepeatStage();
    }

    async handleBattleWin() {
        const rewards = this.teams.calculateRewards();
        this.teams.distributeRewards(rewards);
        this.stages.markStageCompleted();
        this.stages.updateDisplay();
        
        questSystem.updateQuestProgress('combatComplete', { 
            poiName: this.state.currentPoiName, 
            stage: this.state.currentStageNumber 
        });

        await this.handlePostBattleDialogue('win');
        this.ui.showVictoryPopup();
    }

    async handleBattleLoss() {
        await this.handlePostBattleDialogue('loss');
        this.ui.showDefeatPopup();
    }

    async handlePostBattleDialogue(outcome) {
        const dialogueOptions = this.state.currentDialogueOptions;
        if (dialogueOptions?.npcId && dialogueOptions[`end${outcome}DialogueId`]) {
            this.state.pauseForDialogue();
            await this.startDialogue(dialogueOptions.npcId, dialogueOptions[`end${outcome}DialogueId`]);
            this.state.resumeFromDialogue();
        }
    }

    checkAndHandleRepeatStage() {
        if (this.ui.shouldAutoRepeat() && this.stages.canAdvance()) {
            setTimeout(() => this.repeatStage(), 1000);
        }
    }

    async repeatStage() {
        this.ui.hidePopup();
        if (!this.stages.isValid()) {
            this.returnToMap();
            return;
        }
        
        if (this.state.isStarted) this.endBattle();
        await this.startBattle(
            { name: this.state.currentPoiName },
            this.state.currentDialogueOptions,
            this.state.currentStageNumber
        );
    }

    async nextStage() {
        this.ui.hidePopup();
        if (!this.stages.isValid()) {
            this.returnToMap();
            return;
        }

        if (this.state.isStarted) this.endBattle();
        
        const nextStageNum = this.state.currentStageNumber + 1;
        if (nextStageNum > this.stages.totalStages) {
            this.ui.showAreaClearedPopup();
            return;
        }

        await this.startBattle(
            { name: this.state.currentPoiName },
            this.state.currentDialogueOptions,
            nextStageNum
        );
    }

    returnToMap() {
        this.ui.hidePopup();
        this.endBattle();
        openTab({ currentTarget: document.getElementById('mapNavButton') }, 'map');
    }
}

export const battle = new Battle();
export const { startBattle, stopBattle, hidePopup, repeatStage, nextStage } = battle;