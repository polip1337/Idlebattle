import { battleLog } from '../initialize.js';

export class BattleUI {
    constructor() {
        this.popup = document.getElementById('popup');
        this.titleDiv = document.getElementById('popupTitle');
        this.messageDiv = document.getElementById('popupText');
        this.nextStageButton = document.getElementById('nextStage-popup');
        this.repeatCheckbox = document.getElementById('repeat');
    }

    showPopup(title, message) {
        if (!this.popup || !this.titleDiv || !this.messageDiv) return;

        this.titleDiv.textContent = title;
        this.messageDiv.textContent = message;

        if (this.nextStageButton) {
            const canAdvance = title.includes("Stage Cleared!");
            this.nextStageButton.style.display = canAdvance ? 'inline-block' : 'none';
        }

        this.popup.classList.remove('hidden');
    }

    hidePopup() {
        if (this.popup) {
            this.popup.classList.add('hidden');
        }
    }

    showVictoryPopup() {
        const message = `Your team has defeated all enemies in ${this.currentPoiName}.`;
        this.showPopup("Victory!", message);
    }

    showDefeatPopup() {
        this.showPopup("Defeat!", "Your team has been defeated.");
    }

    showStageClearedPopup(stageNumber) {
        this.showPopup("Stage Cleared!", `Your team has cleared stage ${stageNumber}.`);
    }

    showAreaClearedPopup() {
        const message = `You have completed all stages in ${this.currentPoiName}.`;
        this.showPopup("Area Cleared!", message);
    }

    shouldAutoRepeat() {
        return this.repeatCheckbox?.checked && 
               this.popup && 
               !this.popup.classList.contains('hidden');
    }

    updateFleeButton(text, disabled = false) {
        const fleeButton = document.getElementById('flee-battle');
        if (fleeButton) {
            fleeButton.textContent = text;
            fleeButton.disabled = disabled;
        }
    }

    startFleeCooldown(cooldownSeconds) {
        let timeLeft = cooldownSeconds;
        this.updateFleeButton(`Flee (${timeLeft}s)`, true);

        const cooldownInterval = setInterval(() => {
            timeLeft--;
            this.updateFleeButton(`Flee (${timeLeft}s)`, true);

            if (timeLeft <= 0) {
                clearInterval(cooldownInterval);
                this.updateFleeButton("Flee", false);
            }
        }, 1000);
    }
} 