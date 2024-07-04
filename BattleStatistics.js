class BattleStatistics {
    constructor() {
            this.damageDealt = {  };
            this.damageReceived = { };
            this.enemiesDefeated = {};
            this.successfulDodges = 0;
            this.successfulBlocks = 0;
            this.healingDone = 0;
            this.manaUsed = 0;
            this.staminaUsed = 0;
            this.criticalHits = 0;
            this.criticalDamage = 0;
            this.misses = 0;
            this.skillUsage = {};
            this.totalDamageBySkill = {};
            this.multiHits = 0;
            this.dotDamage = 0;
            this.manaRegenerated = 0;
            this.staminaRegenerated = 0;
            this.manaSpent = 0;
            this.staminaSpent = 0;
            this.totalHealingReceived = 0;
            this.totalBuffsApplied = 0;
            this.totalDebuffsApplied = 0;

    }

    addDamageDealt(type, amount) {
        if (this.damageDealt[type] !== undefined) {
            this.damageDealt[type] += amount;
        } else {
            this.damageDealt[type] = amount;
        }
    }

    addDamageReceived(type, amount) {
        if (this.damageReceived[type] !== undefined) {
            this.damageReceived[type] += amount;
        } else {
            this.damageReceived[type] = amount;
        }
    }

    addEnemyDefeated(enemyType) {
        if (this.enemiesDefeated[enemyType] !== undefined) {
            this.enemiesDefeated[enemyType]++;
        } else {
            this.enemiesDefeated[enemyType] = 1;
        }
    }

    addSuccessfulDodge() {
        this.successfulDodges++;
    }

    addSuccessfulBlock() {
        this.successfulBlocks++;
    }

    addHealingDone(amount) {
        this.healingDone += amount;
    }

    addManaUsed(amount) {
        this.manaUsed += amount;
    }
    addCriticalHit(damage) {
        this.criticalHits++;
        this.criticalDamage += damage;
    }

    addSkillUsage(skillName) {
        if (this.skillUsage[skillName]) {
            this.skillUsage[skillName]++;
        } else {
            this.skillUsage[skillName] = 1;
        }
    }
    addTotalHealingReceived(amount) {
        this.totalHealingReceived += amount;
    }

    addTotalBuffsApplied() {
        this.totalBuffsApplied++;
    }

    addTotalDebuffsApplied() {
        this.totalDebuffsApplied++;
    }

    addManaRegenerated(amount) {
        this.manaRegenerated += amount;
    }

    addStaminaRegenerated(amount) {
        this.staminaRegenerated += amount;
    }

    addStaminaSpent(amount) {
        if (this.staminaSpent) {
            this.staminaSpent += amount;
        } else {
            this.staminaSpent = amount;
        }
    }
    addManaSpent(amount) {
        if (this.manaSpent) {
            this.manaSpent += amount;
        } else {
            this.manaSpent = amount;
        }
    }
    addMultiHit() {
        this.multiHit++;
    }

    addCriticalHit(damage) {
        this.criticalHits++;
        this.criticalDamage += damage;
    }

    addMiss() {
        this.misses++;
    }

    addSkillUsage(skillName) {
        if (this.skillUsage[skillName]) {
            this.skillUsage[skillName]++;
        } else {
            this.skillUsage[skillName] = 1;
        }
    }
     updateBattleStatistics() {
        let damageDataString = Object.keys(this.damageDealt)
         .map(key => `${key}: ${this.damageDealt[key]}`)
         .join('<br>');

         let damageReceivedDataString = Object.keys(this.damageReceived)
          .map(key => `${key}: ${this.damageReceived[key]}`)
          .join(', ');

        document.getElementById('total-damage-dealt').innerHTML = damageDataString;
;
        document.getElementById('total-damage-received').innerHTML = damageReceivedDataString;
        document.getElementById('total-healing-received').innerText = this.totalHealingReceived;
        document.getElementById('total-buffs-applied').innerText = this.totalBuffsApplied;
        document.getElementById('total-debuffs-applied').innerText = this.totalDebuffsApplied;
        document.getElementById('mana-regenerated').innerText = this.manaRegenerated;
        document.getElementById('stamina-regenerated').innerText = this.staminaRegenerated;
        document.getElementById('stamina-spent').innerText = this.staminaSpent;
        document.getElementById('mana-spent').innerText = this.manaSpent;
        document.getElementById('multi-kills').innerText = this.multiKills;
        document.getElementById('critical-hits').innerText = this.criticalHits;
        document.getElementById('critical-damage').innerText = this.criticalDamage;
        document.getElementById('misses').innerText = this.misses;
        document.getElementById('skill-usage').innerText = this.skillUsage;
    }
}
export default BattleStatistics;