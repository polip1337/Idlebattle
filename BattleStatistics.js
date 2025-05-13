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
    reset() {
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
 getSerializableData() {
        // Return a plain object copy of all properties
        return {
            damageDealt: { ...this.damageDealt },
            damageReceived: { ...this.damageReceived },
            enemiesDefeated: { ...this.enemiesDefeated },
            successfulDodges: this.successfulDodges,
            successfulBlocks: this.successfulBlocks,
            healingDone: this.healingDone,
            manaUsed: this.manaUsed,
            staminaUsed: this.staminaUsed,
            criticalHits: this.criticalHits,
            criticalDamage: this.criticalDamage,
            misses: this.misses,
            skillUsage: { ...this.skillUsage },
            totalDamageBySkill: { ...this.totalDamageBySkill },
            multiHits: this.multiHits,
            dotDamage: this.dotDamage,
            manaRegenerated: this.manaRegenerated,
            staminaRegenerated: this.staminaRegenerated,
            manaSpent: this.manaSpent,
            staminaSpent: this.staminaSpent,
            totalHealingReceived: this.totalHealingReceived,
            totalBuffsApplied: this.totalBuffsApplied,
            totalDebuffsApplied: this.totalDebuffsApplied,
            successfulFlees: this.successfulFlees,
            goldCollected: this.goldCollected,
        };
    }

    restoreFromData(data) {
        if (!data) return;
        this.reset(); // Clear current stats before restoring

        Object.keys(data).forEach(key => {
            if (this.hasOwnProperty(key)) {
                // For objects like damageDealt, ensure they are deep copied if necessary,
                // but simple spread should be fine if they contain primitive values.
                if (typeof data[key] === 'object' && data[key] !== null && !Array.isArray(data[key])) {
                    this[key] = { ...data[key] };
                } else {
                    this[key] = data[key];
                }
            }
        });
        this.updateBattleStatistics(); // Update UI after restoring
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


        const elTotalDamageDealt = document.getElementById('total-damage-dealt');
        if (elTotalDamageDealt) elTotalDamageDealt.innerHTML = damageDealtString;

        const elTotalDamageReceived = document.getElementById('total-damage-received');
        if (elTotalDamageReceived) elTotalDamageReceived.innerHTML = damageReceivedString;

        const elTotalHealingReceived = document.getElementById('total-healing-received');
        if (elTotalHealingReceived) elTotalHealingReceived.innerText = Math.round(this.totalHealingReceived || 0);

        const elTotalBuffsApplied = document.getElementById('total-buffs-applied');
        if (elTotalBuffsApplied) elTotalBuffsApplied.innerText = this.totalBuffsApplied || 0;

        const elTotalDebuffsApplied = document.getElementById('total-debuffs-applied');
        if (elTotalDebuffsApplied) elTotalDebuffsApplied.innerText = this.totalDebuffsApplied || 0;

        const elManaRegenerated = document.getElementById('mana-regenerated');
        if (elManaRegenerated) elManaRegenerated.innerText = Math.round(this.manaRegenerated || 0);

        const elStaminaRegenerated = document.getElementById('stamina-regenerated');
        if (elStaminaRegenerated) elStaminaRegenerated.innerText = Math.round(this.staminaRegenerated || 0);

        const elStaminaSpent = document.getElementById('stamina-spent');
        if (elStaminaSpent) elStaminaSpent.innerText = this.staminaSpent || 0;

        const elManaSpent = document.getElementById('mana-spent');
        if (elManaSpent) elManaSpent.innerText = this.manaSpent || 0;

        const elMultiKills = document.getElementById('multi-kills');
        if (elMultiKills) elMultiKills.innerText = this.multiHits || 0;

        const elCriticalHits = document.getElementById('critical-hits');
        if (elCriticalHits) elCriticalHits.innerText = this.criticalHits || 0;

        const elCriticalDamage = document.getElementById('critical-damage');
        if (elCriticalDamage) elCriticalDamage.innerText = Math.round(this.criticalDamage || 0);

        const elMisses = document.getElementById('misses');
        if (elMisses) elMisses.innerText = this.misses || 0;

        const elSkillUsage = document.getElementById('skill-usage');
        if (elSkillUsage) elSkillUsage.innerHTML = skillUsageString;

        const elSuccessfulFlees = document.getElementById('successful-flees');
        if (elSuccessfulFlees) elSuccessfulFlees.innerText = this.successfulFlees || 0;

        const elGoldCollected = document.getElementById('gold-collected');
        if (elGoldCollected) elGoldCollected.innerText = this.goldCollected || 0;
    }

}

export default BattleStatistics;