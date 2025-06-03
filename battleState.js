// Battle State Management
export class BattleState {
    constructor() {
        this.started = false;
        this.interval = null;
        this.pausedForDialogue = false;
        this.hasShownPreCombatDialogue = false;
        this.currentPoiName = null;
        this.currentBattleDialogueOptions = null;
        this.currentBattleArea = null;
        this.currentBattleStageNumber = 1;
        this.completedStages = new Set();
        this.flee = new FleeManager();
    }

    reset(poiName = null, stageNum = 1) {
        this.currentPoiName = poiName;
        this.currentBattleStageNumber = stageNum;
        this.currentBattleArea = null;
        this.hasShownPreCombatDialogue = false;
        this.pausedForDialogue = false;
        this.completedStages = new Set();
        this.flee.reset();
    }

    start() {
        this.started = true;
        if (this.interval) clearInterval(this.interval);
        this.interval = setInterval(() => this.gameTick(), 1000);
    }

    stop(fled = false) {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.started = false;
        this.pausedForDialogue = false;
        this.flee.reset();
        return fled;
    }

    pauseForDialogue() {
        this.pausedForDialogue = true;
    }

    resumeFromDialogue() {
        this.pausedForDialogue = false;
    }

    isActive() {
        return this.started && !this.pausedForDialogue;
    }

    gameTick() {
        if (!this.isActive()) return;
        // This will be implemented in Battle.js
        window.dispatchEvent(new CustomEvent('battleTick'));
    }
}

// Flee Management
class FleeManager {
    constructor() {
        this.isOnCooldown = false;
        this.cooldownSeconds = 10;
    }

    reset() {
        this.isOnCooldown = false;
        this.updateUI();
    }

    startCooldown() {
        this.isOnCooldown = true;
        this.updateUI();
        this.startCooldownTimer();
    }

    startCooldownTimer() {
        let timeLeft = this.cooldownSeconds;
        const timer = setInterval(() => {
            timeLeft--;
            this.updateUI(timeLeft);
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                this.isOnCooldown = false;
                this.updateUI();
            }
        }, 1000);
    }

    updateUI(timeLeft = null) {
        const button = document.getElementById('flee-battle');
        if (!button) return;

        if (this.isOnCooldown && timeLeft !== null) {
            button.disabled = true;
            button.textContent = `Flee (${timeLeft}s)`;
        } else if (this.isOnCooldown) {
            button.disabled = true;
            button.textContent = `Flee (${this.cooldownSeconds}s)`;
        } else {
            button.disabled = !this.battleState.started;
            button.textContent = "Flee";
        }
    }

    calculateChance() {
        const avgPlayerDex = window.team1.members.reduce((sum, member) => 
            sum + (member.stats.dexterity || 0), 0) / window.team1.members.length;
        
        const aliveEnemies = window.team2.getAllAliveMembers();
        const avgEnemyDex = aliveEnemies.length > 0 ? 
            aliveEnemies.reduce((sum, enemy) => sum + (enemy.stats.dexterity || 0), 0) / aliveEnemies.length : 0;

        const fleeChance = 70 + Math.floor(avgPlayerDex / 5) - Math.floor(avgEnemyDex / 5);
        return Math.max(10, Math.min(90, fleeChance));
    }

    attempt() {
        if (!this.battleState.started || this.isOnCooldown) {
            window.battleLog.log(this.isOnCooldown ? "Flee is on cooldown." : "Cannot flee, battle not active.");
            return false;
        }

        const chance = this.calculateChance();
        const roll = Math.random() * 100;
        const success = roll < chance;

        window.battleLog.log(`${success ? 'Successfully' : 'Failed to'} flee! (Chance: ${chance.toFixed(0)}%, Rolled: ${roll.toFixed(0)})`);
        
        if (success) {
            window.battleStatistics.addSuccessfulFlee();
            window.questSystem.updateQuestProgress('escape', { poiName: this.battleState.currentPoiName });
            return true;
        } else {
            this.startCooldown();
            return false;
        }
    }
} 