import { battleLog, battleStatistics, questSystem } from '../initialize.js';
import { handleActions } from '../actionHandler.js';

export class BattleFlee {
    constructor() {
        this.FLEE_COOLDOWN_SECONDS = 10;
        this.isOnCooldown = false;
    }

    resetState() {
        this.isOnCooldown = false;
    }

    calculateFleeChance(hero, team1, team2) {
        const heroDex = hero.stats.dexterity || 0;
        const avgPlayerPartyDex = team1.members.reduce((sum, pMember) => 
            sum + (pMember.stats.dexterity || 0), 0) / team1.members.length || heroDex;

        const aliveEnemies = team2.getAllAliveMembers();
        const avgEnemyDex = aliveEnemies.length > 0 
            ? aliveEnemies.reduce((sum, enemy) => sum + (enemy.stats.dexterity || 0), 0) / aliveEnemies.length
            : 0;

        let fleeChance = 70 + Math.floor(avgPlayerPartyDex / 5) - Math.floor(avgEnemyDex / 5);
        return Math.max(10, Math.min(90, fleeChance));
    }

    async attemptFlee(hero, team1, team2, dialogueOptions, currentPoiName) {
        if (this.isOnCooldown) {
            battleLog.log("Flee is on cooldown.");
            return false;
        }

        this.isOnCooldown = true;
        const fleeChance = this.calculateFleeChance(hero, team1, team2);
        const randomRoll = Math.random() * 100;

        if (randomRoll < fleeChance) {
            await this.handleSuccessfulFlee(fleeChance, randomRoll, dialogueOptions, currentPoiName);
            return true;
        } else {
            this.handleFailedFlee(fleeChance, randomRoll);
            return false;
        }
    }

    async handleSuccessfulFlee(fleeChance, randomRoll, dialogueOptions, currentPoiName) {
        battleLog.log(`Successfully fled from battle! (Chance: ${fleeChance.toFixed(0)}%, Rolled: ${randomRoll.toFixed(0)})`);
        battleStatistics.addSuccessfulFlee();

        if (dialogueOptions?.npcId && dialogueOptions?.fleeDialogueId) {
            battleLog.log(`Starting flee dialogue: ${dialogueOptions.fleeDialogueId}`);
            await window.startDialogue(dialogueOptions.npcId, dialogueOptions.fleeDialogueId);
            battleLog.log("Flee dialogue finished.");
        }

        if (dialogueOptions?.escapeActions) {
            await handleActions(dialogueOptions.escapeActions);
        }

        questSystem.updateQuestProgress('escape', { poiName: currentPoiName });
    }

    handleFailedFlee(fleeChance, randomRoll) {
        battleLog.log(`Failed to flee! (Chance: ${fleeChance.toFixed(0)}%, Rolled: ${randomRoll.toFixed(0)})`);
    }
} 