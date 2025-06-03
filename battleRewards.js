// Rewards and XP Management
export class RewardCalculator {
    static calculateGold(team2) {
        return team2.members.reduce((total, mob) => 
            mob.currentHealth <= 0 && mob.goldDrop > 0 ? total + mob.goldDrop : total, 0);
    }

    static calculateStageXP(battleState) {
        const baseXP = 50;
        const xpFromBattle = baseXP * battleState.currentBattleStageNumber;
        return Math.max(10, Math.floor(xpFromBattle));
    }

    static distributeRewards(battleState, hero, battleStatistics) {
        const gold = this.calculateGold(window.team2);
        const xp = this.calculateStageXP(battleState);

        if (gold > 0) {
            hero.addGold(gold);
            window.battleLog.log(`Collected ${gold} gold!`);
            battleStatistics.addGoldCollected(gold);
        }

        if (xp > 0 && hero) {
            window.battleLog.log(`Party gained ${xp} XP!`);
            hero.distributeBattleXP(xp);
        }
    }
} 