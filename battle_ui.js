// BattleUI.js - Handles all battle UI interactions and DOM updates
import { openTab } from './navigation.js';

export class BattleUI {
    constructor(battleState) {
        this.battleState = battleState;
        this.onReturnToMapCallback = null;
        this.onRepeatStageCallback = null;
        this.onNextStageCallback = null;
    }
    
    setCallbacks(onReturnToMap, onRepeatStage, onNextStage) {
        this.onReturnToMapCallback = onReturnToMap;
        this.onRepeatStageCallback = onRepeatStage;
        this.onNextStageCallback = onNextStage;
    }
    
    updateStageDisplay() {
        const stageDisplay = document.getElementById('battle-stage-display');
        const increaseStageButton = document.getElementById('increase-stage');

        if (stageDisplay && this.battleState.currentBattleArea) {
            stageDisplay.textContent = `Stage ${this.battleState.currentBattleStageNumber} of ${this.battleState.currentBattleArea.stages.length}`;
        }

        if (increaseStageButton) {
            const canAdvance = this.battleState.canAdvanceToNextStage();
            increaseStageButton.disabled = !canAdvance;
            increaseStageButton.style.opacity = canAdvance ? '1' : '0.5';
        }
    }
    
    showPopup(title, message) {
        if (this.battleState.isBattlePausedForDialogue) return;

        const popup = document.getElementById('popup');
        const titleDiv = document.getElementById('popupTitle');
        const messageDiv = document.getElementById('popupText');
        const nextStageButton = document.getElementById('nextStage-popup');

        if (popup && titleDiv && messageDiv) {
            titleDiv.textContent = title;
            messageDiv.textContent = message;

            if (nextStageButton) {
                const canAdvance = this.battleState.currentBattleArea?.isLoaded && 
                                  this.battleState.currentBattleStageNumber < this.battleState.currentBattleArea.stages.length;
                                  
                if (title.includes("Stage Cleared!") && canAdvance) {
                    nextStageButton.style.display = 'inline-block';
                } else {
                    nextStageButton.style.display = 'none';
                }
            }
            popup.classList.remove('hidden');
        }
    }
    
    hidePopup() {
        const popup = document.getElementById('popup');
        if (popup) {
            popup.classList.add('hidden');
        }
    }
    
    returnToMap() {
        this.hidePopup();
        if (this.onReturnToMapCallback) {
            this.onReturnToMapCallback();
        }
        openTab({ currentTarget: document.getElementById('mapNavButton') }, 'map');
    }
    
    async repeatStage() {
        this.hidePopup();
        if (this.onRepeatStageCallback) {
            await this.onRepeatStageCallback();
        }
    }
    
    async nextStage() {
        this.hidePopup();
        if (this.onNextStageCallback) {
            await this.onNextStageCallback();
        }
    }
    
    updateFleeButton(isOnCooldown, timeLeft = 0) {
        const fleeButton = document.getElementById('flee-battle');
        if (!fleeButton) return;

        if (isOnCooldown) {
            fleeButton.disabled = true;
            if (timeLeft > 0) {
                fleeButton.textContent = `Flee (${timeLeft}s)`;
            }
        } else {
            fleeButton.disabled = !this.battleState.battleStarted;
            fleeButton.textContent = "Flee";
        }
    }
    
    startFleeCooldownVisuals() {
        let cooldownTimeLeft = this.battleState.FLEE_COOLDOWN_SECONDS;
        this.updateFleeButton(true, cooldownTimeLeft);

        const cooldownInterval = setInterval(() => {
            cooldownTimeLeft--;
            this.updateFleeButton(true, cooldownTimeLeft);

            if (cooldownTimeLeft <= 0) {
                clearInterval(cooldownInterval);
                this.updateFleeButton(false);
            }
        }, 1000);
    }
    
    checkAndHandleRepeatStage() {
        const repeatCheckbox = document.getElementById('repeat');
        const popup = document.getElementById('popup');
        
        if (repeatCheckbox?.checked && popup && !popup.classList.contains('hidden')) {
            const canAdvance = this.battleState.canAdvanceToNextStage();
            const isVictory = popup.querySelector('#popupTitle')?.textContent.includes("Victory!");
            
            if (!canAdvance || isVictory) {
                setTimeout(async () => {
                    if (!this.battleState.battleStarted) {
                        await this.repeatStage();
                    }
                }, 1000);
            }
        }
    }
    
    showWinPopup() {
        if (this.battleState.currentBattleArea && 
            this.battleState.currentBattleStageNumber < this.battleState.currentBattleArea.stages.length) {
            this.showPopup("Stage Cleared!", `Your team has cleared stage ${this.battleState.currentBattleStageNumber}.`);
        } else {
            this.showPopup("Victory!", `Your team has defeated all enemies in ${this.battleState.currentPoiName}.`);
        }
        this.checkAndHandleRepeatStage();
    }
    
    showLossPopup() {
        this.showPopup("Defeat!", "Your team has been defeated.");
    }
}