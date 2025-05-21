export class BattleState {
    constructor() {
        this.isStarted = false;
        this.battleInterval = null;
        this.currentPoiName = null;
        this.currentStageNumber = 1;
        this.currentDialogueOptions = null;
        this.isPausedForDialogue = false;
        this.hasShownPreCombatDialogue = false;
        this.completedStages = new Set();
    }

    initialize(poiName, stageNum, dialogueOptions) {
        this.currentPoiName = poiName;
        this.currentStageNumber = stageNum;
        this.currentDialogueOptions = dialogueOptions;
        this.hasShownPreCombatDialogue = false;
        this.isPausedForDialogue = false;
        this.completedStages = new Set();
    }

    startBattle() {
        this.isStarted = true;
        window.battleStarted = true;
        this.isPausedForDialogue = true;
        window.isBattlePausedForDialogue = true;
    }

    stopBattle() {
        this.isStarted = false;
        window.battleStarted = false;
        this.isPausedForDialogue = false;
        window.isBattlePausedForDialogue = false;
    }

    pauseForDialogue() {
        this.isPausedForDialogue = true;
        window.isBattlePausedForDialogue = true;
    }

    resumeFromDialogue() {
        this.isPausedForDialogue = false;
        window.isBattlePausedForDialogue = false;
    }

    markStageCompleted(stageNumber) {
        this.completedStages.add(stageNumber);
    }

    isStageCompleted(stageNumber) {
        return this.completedStages.has(stageNumber);
    }
} 