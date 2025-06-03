// UI Management
export class BattleUI {
    static updateStageDisplay(battleState) {
        const display = document.getElementById('battle-stage-display');
        const button = document.getElementById('increase-stage');
        
        if (display && battleState.currentBattleArea) {
            display.textContent = `Stage ${battleState.currentBattleStageNumber} of ${battleState.currentBattleArea.stages.length}`;
        }
        
        if (button) {
            const canAdvance = battleState.currentBattleArea && 
                              battleState.currentBattleStageNumber < battleState.currentBattleArea.stages.length && 
                              battleState.completedStages.has(battleState.currentBattleStageNumber);
            button.disabled = !canAdvance;
            button.style.opacity = canAdvance ? '1' : '0.5';
        }
    }

    static showPopup(title, message, battleState) {
        if (battleState.pausedForDialogue) return;

        const popup = document.getElementById('popup');
        const titleDiv = document.getElementById('popupTitle');
        const messageDiv = document.getElementById('popupText');
        const nextStageButton = document.getElementById('nextStage-popup');

        if (popup && titleDiv && messageDiv) {
            titleDiv.textContent = title;
            messageDiv.textContent = message;

            if (nextStageButton) {
                const canAdvance = battleState.currentBattleArea?.isLoaded && 
                                  battleState.currentBattleStageNumber < battleState.currentBattleArea.stages.length;
                nextStageButton.style.display = title.includes("Stage Cleared!") && canAdvance ? 'inline-block' : 'none';
            }
            popup.classList.remove('hidden');
        }
    }

    static hidePopup() {
        const popup = document.getElementById('popup');
        if (popup) popup.classList.add('hidden');
    }

    static updateMemberUI(member) {
        if (member.element) {
            const portraitImg = member.element.querySelector(".memberPortrait img");
            if (portraitImg && member.class.portrait) {
                portraitImg.src = member.class.portrait;
            }
        }
    }
} 