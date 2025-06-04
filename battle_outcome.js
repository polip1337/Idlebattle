// BattleOutcome.js - Handles battle win/loss logic and rewards
import { battleLog, battleStatistics, hero, globalAutosaveSettings } from './initialize.js';
import { triggerAutosave as slTriggerAutosave } from './saveLoad.js';
import { questSystem } from './questSystem.js';

export class BattleOutcome {
    constructor(battleState, team1, team2) {
        this.battleState = battleState;
        this.team1 = team1;
        this.team2 = team2;
        this.onBattleEndCallback = null;
        this.onWinCallback = null;
        this.onLossCallback = null;
    }
    
    setCallbacks(onBattleEnd, onWin, onLoss) {
        this.onBattleEndCallback = onBattleEnd;
        this.onWinCallback = onWin;
        this.onLossCallback = onLoss;
    }
    
    async checkBattleOutcome() {
        const team1Alive = this.team1.members.some(member => member.currentHealth > 0);
        const team2Alive = this.team2.members.some(member => member.currentHealth > 0);

        if (!team1Alive || !team2Alive) {
            const wasPlayerVictorious = team1Alive && !team2Alive;
            
            this.battleState.stopBattle();
            
            // Remove all effects from both teams
            this.removeAllEffects(this.team1);
            this.removeAllEffects(this.team2);

            if (wasPlayerVictorious) {
                await this.handleBattleWin();
            } else {
                await this.handleBattleLoss();
            }

            // Trigger autosave
            if (globalAutosaveSettings.enabled && globalAutosaveSettings.saveOnBattleEnd) {
                slTriggerAutosave("battle_end");
            }

            // Trigger callback
            if (this.onBattleEndCallback) {
                this.onBattleEndCallback(wasPlayerVictorious);
            }
            
            return true; // Battle ended
        }
        
        return false; // Battle continues
    }
    
    calculateGoldDrop() {
        let totalGoldDropped = 0;
        this.team2.members.forEach(mob => {
            if (mob.currentHealth <= 0 && mob.goldDrop > 0) {
                totalGoldDropped += mob.goldDrop;
            }
        });
        return totalGoldDropped;
    }
    
    async handleBattleWin() {
        // Calculate and award gold
        const totalGoldDropped = this.calculateGoldDrop();
        if (totalGoldDropped > 0) {
            hero.addGold(totalGoldDropped);
            battleLog.log(`Collected ${totalGoldDropped} gold!`);
            battleStatistics.addGoldCollected(totalGoldDropped);
        }

        // Track critical hit defeats
        this.team2.members.forEach(mob => {
            if (mob.currentHealth <= 0 && mob.wasDefeatedByCrit) {
                battleStatistics.addEnemyDefeatedWithCrit();
            }
        });

        // Award XP
        const xpFromBattle = this.battleState.calculateStageXP();
        if (xpFromBattle > 0 && hero) {
            battleLog.log(`Party gained ${xpFromBattle} XP!`);
            hero.distributeBattleXP(xpFromBattle);
        }

        // Mark stage as completed
        this.battleState.markStageCompleted(this.battleState.currentBattleStageNumber);

        // Update quest progress
        questSystem.updateQuestProgress('combatComplete', { 
            poiName: this.battleState.currentPoiName, 
            stage: this.battleState.currentBattleStageNumber 
        });

        // Handle dialogue if exists and is final stage
        const dialogueOptions = this.battleState.currentBattleDialogueOptions;
        const isFinalStage = this.battleState.currentBattleStageNumber === 
                            this.battleState.currentBattleArea.stages.length;
                            
        if (dialogueOptions?.npcId && dialogueOptions?.endWinDialogueId && isFinalStage) {
            this.battleState.pauseForDialogue();
            battleLog.log(`Starting post-battle (win) dialogue: ${dialogueOptions.endWinDialogueId}`);
            
            try {
                await window.startDialogue(dialogueOptions.npcId, dialogueOptions.endWinDialogueId);
                battleLog.log("Post-battle (win) dialogue finished.");
            } catch (error) {
                console.error("Error during win dialogue:", error);
            } finally {
                this.battleState.resumeFromDialogue();
            }
            
            return; // Skip popup if dialogue was shown
        }

        // Trigger win callback
        if (this.onWinCallback) {
            this.onWinCallback();
        }
    }
    
    async handleBattleLoss() {
        const dialogueOptions = this.battleState.currentBattleDialogueOptions;
        
        if (dialogueOptions?.npcId && dialogueOptions?.endLossDialogueId) {
            this.battleState.pauseForDialogue();
            battleLog.log(`Starting post-battle (loss) dialogue: ${dialogueOptions.endLossDialogueId}`);
            
            try {
                await window.startDialogue(dialogueOptions.npcId, dialogueOptions.endLossDialogueId);
                battleLog.log("Post-battle (loss) dialogue finished.");
            } catch (error) {
                console.error("Error during loss dialogue:", error);
            } finally {
                this.battleState.resumeFromDialogue();
            }
            
            return; // Skip popup if dialogue was shown
        }

        // Trigger loss callback
        if (this.onLossCallback) {
            this.onLossCallback();
        }
    }
    
    removeAllEffects(teamInstance) {
        if (teamInstance?.members) {
            teamInstance.members.forEach(member => {
                if (member?.effects) {
                    const effectsCopy = [...member.effects];
                    effectsCopy.forEach(effect => {
                        effect.remove();
                    });
                }
            });
        }
    }
}