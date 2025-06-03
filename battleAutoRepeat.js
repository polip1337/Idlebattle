// Auto-repeat functionality
export class AutoRepeatManager {
    static shouldAutoRepeat() {
        const checkbox = document.getElementById('repeat');
        const popup = document.getElementById('popup');
        
        return checkbox?.checked && popup && !popup.classList.contains('hidden');
    }

    static checkAndHandle(battleState, repeatStage) {
        if (!this.shouldAutoRepeat()) return;
        
        const canAdvance = battleState.currentBattleArea && 
                          battleState.currentBattleStageNumber < battleState.currentBattleArea.stages.length;
        const popup = document.getElementById('popup');
        const isVictory = popup?.querySelector('#popupTitle')?.textContent.includes("Victory!");
        
        if (!canAdvance || isVictory) {
            setTimeout(async () => {
                if (!battleState.started) {
                    await repeatStage();
                }
            }, 1000);
        }
    }
} 