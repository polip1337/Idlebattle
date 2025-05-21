import Area from '../Area.js';
import { battleLog } from '../initialize.js';
import EffectClass from '../EffectClass.js';
import { handleActions } from '../actionHandler.js';

export class BattleStages {
    constructor() {
        this.currentArea = null;
        this.isLoaded = false;
        this.totalStages = 0;
    }

    setArea(areaName) {
        this.currentArea = new Area(areaName);
    }

    async loadData() {
        if (!this.currentArea) return false;

        battleLog.log(`Attempting to load area: ${this.currentArea.name} for battle.`);
        await this.currentArea.loadData();
        
        this.isLoaded = this.currentArea.isLoaded;
        if (this.isLoaded) {
            this.totalStages = this.currentArea.stages.length;
        }
        
        return this.isLoaded;
    }

    isValid() {
        return this.currentArea && this.currentArea.isLoaded;
    }

    canAdvance() {
        return this.isValid() && this.currentStageNumber < this.totalStages;
    }

    updateDisplay() {
        const stageDisplay = document.getElementById('battle-stage-display');
        const increaseStageButton = document.getElementById('increase-stage');
        
        if (stageDisplay && this.currentArea) {
            stageDisplay.textContent = `Stage ${this.currentStageNumber} of ${this.totalStages}`;
        }
        
        if (increaseStageButton) {
            const canAdvance = this.canAdvance() && this.isStageCompleted(this.currentStageNumber);
            increaseStageButton.disabled = !canAdvance;
            increaseStageButton.style.opacity = canAdvance ? '1' : '0.5';
        }
    }

    markStageCompleted(stageNumber) {
        if (this.currentArea) {
            this.currentArea.completedStages.add(stageNumber);
        }
    }

    isStageCompleted(stageNumber) {
        return this.currentArea?.completedStages.has(stageNumber) || false;
    }

    async handleStageEffects(team) {
        const currentStage = this.currentArea?.stages[this.currentStageNumber - 1];
        if (!currentStage) return;

        if (currentStage.onEnterEffect) {
            team.members.forEach(member => {
                new EffectClass(member, currentStage.onEnterEffect);
            });
        }

        if (currentStage.onEnterActions) {
            await handleActions(currentStage.onEnterActions);
        }
    }

    async handleAreaEffects() {
        if (this.currentArea?.onEnterActions?.length > 0) {
            battleLog.log("Executing area onEnterActions");
            await handleActions(this.currentArea.onEnterActions);
        }
    }
} 