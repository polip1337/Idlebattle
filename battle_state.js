// BattleState.js - Manages core battle state and configuration
export class BattleState {
    constructor() {
        this.battleStarted= false;
        this.battleEnded= false;
        this.battleTime= 0;
        this.lastExpTick= 0;
        this.battleInterval = null;
        this.isFleeOnCooldown = false;
        this.isBattlePausedForDialogue = false;
        this.hasShownPreCombatDialogue = false;
        this.currentPoiName = null;
        this.currentBattleDialogueOptions = null;
        this.currentBattleArea = null;
        this.currentBattleStageNumber = 1;
        this.completedStages = new Set();
        
        // Constants
        this.FLEE_COOLDOWN_SECONDS = 10;
        this.XP_PER_STAGE_BASE = 50;
        
        // Expose to window for compatibility
        this.exposeToWindow();
    }
    
    exposeToWindow() {
        window.battleStarted = this.battleStarted;
        window.isBattlePausedForDialogue = this.isBattlePausedForDialogue;
    }
    
    initializeBattle(poiName = null, stageNum = 1) {
        this.currentPoiName = poiName;
        this.currentBattleStageNumber = stageNum;
        this.currentBattleArea = null;
        this.hasShownPreCombatDialogue = false;
        this.isFleeOnCooldown = false;
        this.isBattlePausedForDialogue = false;
        this.completedStages = new Set();
        this.exposeToWindow();
    }
    
    startBattle() {
        this.battleStarted = true;
        this.exposeToWindow();
    }
    
    stopBattle() {
        this.battleStarted = false;
        this.isBattlePausedForDialogue = false;
        this.isFleeOnCooldown = false;
        
        if (this.battleInterval) {
            clearInterval(this.battleInterval);
            this.battleInterval = null;
        }
        
        this.exposeToWindow();
    }
    
    setBattleInterval(interval) {
        if (this.battleInterval) {
            clearInterval(this.battleInterval);
        }
        this.battleInterval = interval;
    }
    
    pauseForDialogue() {
        this.isBattlePausedForDialogue = true;
        this.exposeToWindow();
    }
    
    resumeFromDialogue() {
        this.isBattlePausedForDialogue = false;
        this.exposeToWindow();
    }
    
    markStageCompleted(stageNumber) {
        this.completedStages.add(stageNumber);
    }
    
    isStageCompleted(stageNumber) {
        return this.completedStages.has(stageNumber);
    }
    
    canAdvanceToNextStage() {
        return this.currentBattleArea && 
               this.currentBattleStageNumber < this.currentBattleArea.stages.length &&
               this.isStageCompleted(this.currentBattleStageNumber);
    }
    
    calculateStageXP() {
        const xpFromBattle = this.XP_PER_STAGE_BASE * this.currentBattleStageNumber;
        return Math.max(10, Math.floor(xpFromBattle));
    }
}