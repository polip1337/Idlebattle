// FleeSystem.js - Handles all flee-related logic
import { battleLog, battleStatistics, battleController } from './initialize.js';
import { questSystem } from './questSystem.js';
import { handleActions } from './actionHandler.js';

export class FleeSystem {
    constructor(battleState, team1, team2) {
        this.battleState = battleState;
        this.team1 = team1;
        this.team2 = team2;
        this.onFleeCallback = null;
    }
    
    setFleeCallback(callback) {
        this.onFleeCallback = callback;
    }
    
    calculateFleeChance() {
        const avgPlayerPartyDex = this.team1.members.reduce(
            (sum, member) => sum + (member.getEffectiveStat('dexterity') || 0), 0
        ) / this.team1.members.length || 0;

        const aliveEnemies = this.team2.getAllAliveMembers();
        let avgEnemyDex = 0;
        
        if (aliveEnemies.length > 0) {
            avgEnemyDex = aliveEnemies.reduce(
                (sum, enemy) => sum + (enemy.stats.dexterity || 0), 0
            ) / aliveEnemies.length;
        }

        const fleeChance = 70 + Math.floor(avgPlayerPartyDex / 5) - Math.floor(avgEnemyDex / 5);
        return Math.max(10, Math.min(90, fleeChance));
    }
    
    async attemptFlee() {
        if (!this.battleState.battleStarted) {
            battleLog.log("Cannot flee, battle not active.");
            return { success: false, reason: "Battle not active" };
        }
        
        if (this.battleState.isFleeOnCooldown) {
            battleLog.log("Flee is on cooldown.");
            return { success: false, reason: "On cooldown" };
        }

        this.battleState.isFleeOnCooldown = true;
        // Start the UI cooldown timer
        if (battleController?.ui) {
            battleController.ui.startFleeCooldownVisuals();
        }
        
        const fleeChance = this.calculateFleeChance();
        const randomRoll = Math.random() * 100;
        const success = randomRoll < fleeChance;
        
        if (success) {
            await this.handleSuccessfulFlee(fleeChance, randomRoll);
            return { success: true, fleeChance, randomRoll };
        } else {
            this.handleFailedFlee(fleeChance, randomRoll);
            return { success: false, fleeChance, randomRoll, reason: "Failed roll" };
        }
    }
    
    async handleSuccessfulFlee(fleeChance, randomRoll) {
        battleLog.log(`Successfully fled from battle! (Chance: ${fleeChance.toFixed(0)}%, Rolled: ${randomRoll.toFixed(0)})`);
        battleStatistics.addSuccessfulFlee();

        // Handle dialogue if exists
        const dialogueOptions = this.battleState.currentBattleDialogueOptions;
        if (dialogueOptions?.npcId && dialogueOptions?.fleeDialogueId) {
            this.battleState.pauseForDialogue();
            battleLog.log(`Starting flee dialogue: ${dialogueOptions.fleeDialogueId}`);
            
            try {
                await window.startDialogue(dialogueOptions.npcId, dialogueOptions.fleeDialogueId);
                battleLog.log("Flee dialogue finished.");
            } catch (error) {
                console.error("Error during flee dialogue:", error);
            } finally {
                this.battleState.resumeFromDialogue();
            }
        }

        // Handle escape actions
        if (dialogueOptions?.escapeActions) {
            handleActions(dialogueOptions.escapeActions);
        }

        // Update quest progress
        questSystem.updateQuestProgress('escape', { 
            poiName: this.battleState.currentPoiName 
        });

        // Trigger callback
        if (this.onFleeCallback) {
            this.onFleeCallback();
        }
    }
    
    handleFailedFlee(fleeChance, randomRoll) {
        battleLog.log(`Failed to flee! (Chance: ${fleeChance.toFixed(0)}%, Rolled: ${randomRoll.toFixed(0)})`);
        // Cooldown will be handled by UI layer
    }
    
    resetCooldown() {
        this.battleState.isFleeOnCooldown = false;
    }
}