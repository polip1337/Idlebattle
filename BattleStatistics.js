class BattleStatistics {
    constructor() {
        this.damageDealt = {};
        this.damageReceived = {};
        this.enemiesDefeated = {};
        this.successfulDodges = 0;
        this.successfulBlocks = 0;
        this.healingDone = 0; // Healing done by the player to others
        this.manaUsed = 0; // Generic mana used, more specific below
        this.staminaUsed = 0; // Generic stamina used, more specific below
        this.criticalHits = 0;
        this.criticalDamage = 0;
        this.misses = 0;
        this.skillUsage = {};
        this.totalDamageBySkill = {}; // Could be implemented if needed
        this.multiHits = 0; // Renamed from multiKills for clarity if it means multi-hit attacks
        this.dotDamage = 0;
        this.manaRegenerated = 0;
        this.staminaRegenerated = 0;
        this.manaSpent = 0; // Specifically mana spent by hero on skills
        this.staminaSpent = 0; // Specifically stamina spent by hero on skills
        this.totalHealingReceived = 0; // Healing received by the player
        this.totalBuffsApplied = 0; // Buffs applied by the player
        this.totalDebuffsApplied = 0; // Debuffs applied by the player
        this.successfulFlees = 0; // New: Track successful flees
        this.goldCollected = 0; // New: Track gold collected
    }

    addDamageDealt(type, amount) {
        if (this.damageDealt[type] !== undefined) {
            this.damageDealt[type] += amount;
        } else {
            this.damageDealt[type] = amount;
        }
        this.damageDealt['Total'] = (this.damageDealt['Total'] || 0) + amount;
    }

    addDamageReceived(type, amount) {
        if (this.damageReceived[type] !== undefined) {
            this.damageReceived[type] += amount;
        } else {
            this.damageReceived[type] = amount;
        }
        this.damageReceived['Total'] = (this.damageReceived['Total'] || 0) + amount;
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

    addManaUsed(amount) { // Potentially deprecated by addManaSpent
        this.manaUsed += amount;
    }

    addCriticalHit(damageAmount) { // Pass the extra damage from crit, or total crit damage
        this.criticalHits++;
        this.criticalDamage += damageAmount; // Assuming damageAmount is the full critical hit damage
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
        this.manaRegenerated += Math.round(amount);
    }

    addStaminaRegenerated(amount) {
        this.staminaRegenerated += Math.round(amount);
    }

    addStaminaSpent(amount) {
        if (amount > 0) {
            this.staminaSpent += amount;
        }
    }

    addManaSpent(amount) {
        if (amount > 0) {
            this.manaSpent += amount;
        }
    }

    addMultiHit() { // If this refers to multi-target skills or rapid hits
        this.multiHits++;
    }

    addMiss() {
        this.misses++;
    }

    addSuccessfulFlee() {
        this.successfulFlees++;
    }

    addGoldCollected(amount) {
        this.goldCollected += amount;
    }

    updateBattleStatistics() {
        let damageDealtString = Object.entries(this.damageDealt)
            .map(([key, value]) => `${key}: ${Math.round(value)}`)
            .join('<br>');
        if (!this.damageDealt || Object.keys(this.damageDealt).length === 0) damageDealtString = "0";


        let damageReceivedString = Object.entries(this.damageReceived)
            .map(([key, value]) => `${key}: ${Math.round(value)}`)
            .join('<br>');
        if (!this.damageReceived || Object.keys(this.damageReceived).length === 0) damageReceivedString = "0";

        let skillUsageString = Object.entries(this.skillUsage)
            .map(([key, value]) => `${key}: ${value}`)
            .join('<br>');
        if (!this.skillUsage || Object.keys(this.skillUsage).length === 0) skillUsageString = "None";


        document.getElementById('total-damage-dealt').innerHTML = damageDealtString;
        document.getElementById('total-damage-received').innerHTML = damageReceivedString;
        document.getElementById('total-healing-received').innerText = Math.round(this.totalHealingReceived);
        document.getElementById('total-buffs-applied').innerText = this.totalBuffsApplied;
        document.getElementById('total-debuffs-applied').innerText = this.totalDebuffsApplied;
        document.getElementById('mana-regenerated').innerText = Math.round(this.manaRegenerated);
        document.getElementById('stamina-regenerated').innerText = Math.round(this.staminaRegenerated);
        document.getElementById('stamina-spent').innerText = this.staminaSpent;
        document.getElementById('mana-spent').innerText = this.manaSpent;
        document.getElementById('multi-kills').innerText = this.multiHits; // Assuming multi-kills was meant as multi-hits
        document.getElementById('critical-hits').innerText = this.criticalHits;
        document.getElementById('critical-damage').innerText = Math.round(this.criticalDamage);
        document.getElementById('misses').innerText = this.misses;
        document.getElementById('skill-usage').innerHTML = skillUsageString;
        document.getElementById('successful-flees').innerText = this.successfulFlees;
        document.getElementById('gold-collected').innerText = this.goldCollected;
    }
}

export default BattleStatistics;