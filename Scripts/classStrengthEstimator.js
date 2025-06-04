// Class Strength Estimator
// This module provides functionality to estimate the relative strength of classes
// based on their stats, skills, and other attributes

class ClassStrengthEstimator {
    constructor() {
        // Weights for different stat categories
        this.statWeights = {
            offensive: {
                strength: 1.2,
                magicPower: 1.2,
                dexterity: 1.0,
                accuracy: 0.8,
                damage: 1.5
            },
            defensive: {
                vitality: 1.2,
                armor: 1.0,
                dodge: 0.8,
                blockChance: 0.8
            },
            resource: {
                mana: 0.6,
                stamina: 0.6,
                manaRegen: 0.4
            }
        };

        // Resource tier thresholds based on existing class data
        this.resourceTiers = {
            mana: {
                tier1: 100,    // Very low mana pool (Novice baseline)
                tier2: 150,    // Low mana pool
                tier3: 200,    // Average mana pool
                tier4: 250,    // High mana pool
                tier5: 350     // Very high mana pool
            },
            stamina: {
                tier1: 50,     // Very low stamina (Novice baseline)
                tier2: 70,     // Low stamina
                tier3: 90,     // Average stamina
                tier4: 120,    // High stamina
                tier5: 150     // Very high stamina
            },
            manaRegen: {
                tier1: 3,      // Very low mana regen (Novice baseline)
                tier2: 4,      // Low mana regen
                tier3: 5,      // Average mana regen
                tier4: 6,      // High mana regen
                tier5: 8       // Very high mana regen
            },
            vitality: {
                tier1: 25,     // Very low health pool (Novice baseline)
                tier2: 35,     // Low health pool
                tier3: 45,     // Average health pool
                tier4: 60,     // High health pool
                tier5: 80      // Very high health pool
            }
        };

        // Weights for different skill attributes
        this.skillWeights = {
            damage: 1.5,
            cooldown: 0.3, // Higher score for lower cooldown
            manaCost: 0.2, // Higher score for lower cost
            staminaCost: 0.2, // Higher score for lower cost
            utility: 0.8
        };

        // Stat tier thresholds based on existing class data
        this.statTiers = {
            strength: {
                tier1: { low: 8, high: 15 },
                tier2: { low: 15, high: 25 },
                tier3: { low: 25, high: 35 },
                tier4: { low: 35, high: 45 },
                tier5: { low: 45, high: 60 }
            },
            magicPower: {
                tier1: { low: 8, high: 15 },
                tier2: { low: 15, high: 25 },
                tier3: { low: 25, high: 35 },
                tier4: { low: 35, high: 45 },
                tier5: { low: 45, high: 60 }
            },
            dexterity: {
                tier1: { low: 8, high: 15 },
                tier2: { low: 15, high: 25 },
                tier3: { low: 25, high: 35 },
                tier4: { low: 35, high: 45 },
                tier5: { low: 45, high: 60 }
            },
            accuracy: {
                tier1: { low: 5, high: 10 },
                tier2: { low: 10, high: 15 },
                tier3: { low: 15, high: 20 },
                tier4: { low: 20, high: 25 },
                tier5: { low: 25, high: 35 }
            },
            armor: {
                tier1: { low: 0, high: 5 },
                tier2: { low: 5, high: 15 },
                tier3: { low: 15, high: 25 },
                tier4: { low: 25, high: 40 },
                tier5: { low: 40, high: 60 }
            },
            dodge: {
                tier1: { low: 5, high: 10 },
                tier2: { low: 10, high: 15 },
                tier3: { low: 15, high: 20 },
                tier4: { low: 20, high: 25 },
                tier5: { low: 25, high: 35 }
            },
            blockChance: {
                tier1: { low: 0, high: 5 },
                tier2: { low: 5, high: 10 },
                tier3: { low: 10, high: 15 },
                tier4: { low: 15, high: 20 },
                tier5: { low: 20, high: 25 }
            }
        };
    }

    /**
     * Calculate the base stat score for a class
     * @param {Object} stats - The class's base stats
     * @returns {number} The calculated stat score
     */
    calculateStatScore(stats) {
        let score = 0;

        // Calculate offensive score
        for (const [stat, weight] of Object.entries(this.statWeights.offensive)) {
            if (stats[stat]) {
                score += stats[stat] * weight;
            }
        }

        // Calculate defensive score
        for (const [stat, weight] of Object.entries(this.statWeights.defensive)) {
            if (stats[stat]) {
                score += stats[stat] * weight;
            }
        }

        // Calculate resource score
        for (const [stat, weight] of Object.entries(this.statWeights.resource)) {
            if (stats[stat]) {
                score += stats[stat] * weight;
            }
        }

        return score;
    }

    /**
     * Calculate the skill score for a class
     * @param {Array} skills - Array of skill objects
     * @returns {number} The calculated skill score
     */
    calculateSkillScore(skills) {
        let score = 0;
        
        for (const skill of skills) {
            // Base skill value
            let skillValue = 0;

            // Add damage contribution
            if (skill.damage) {
                skillValue += skill.damage * this.skillWeights.damage;
            }

            // Consider cooldown (lower is better)
            if (skill.cooldown) {
                // Convert cooldown to a score where lower cooldown = higher score
                const cooldownScore = Math.max(0, 10 - skill.cooldown);
                skillValue += cooldownScore * this.skillWeights.cooldown;
            }

            // Consider resource costs (lower is better)
            if (skill.manaCost) {
                // Convert mana cost to a score where lower cost = higher score
                const manaScore = Math.max(0, 50 - skill.manaCost);
                skillValue += manaScore * this.skillWeights.manaCost;
            }
            if (skill.staminaCost) {
                // Convert stamina cost to a score where lower cost = higher score
                const staminaScore = Math.max(0, 50 - skill.staminaCost);
                skillValue += staminaScore * this.skillWeights.staminaCost;
            }

            // Add utility value based on skill tags
            if (skill.tags) {
                const utilityTags = ['Utility', 'Buff', 'Debuff', 'Heal', 'Shield'];
                const utilityCount = skill.tags.filter(tag => utilityTags.includes(tag)).length;
                skillValue += utilityCount * this.skillWeights.utility;
            }

            score += skillValue;
        }

        return score;
    }

    /**
     * Calculate the growth potential score based on stats per level
     * @param {Object} statsPerLevel - The class's stats gained per level
     * @returns {number} The calculated growth potential score
     */
    calculateGrowthScore(statsPerLevel) {
        let score = 0;
        
        // Combine all stat weights
        const allWeights = {
            ...this.statWeights.offensive,
            ...this.statWeights.defensive,
            ...this.statWeights.resource
        };

        for (const [stat, weight] of Object.entries(allWeights)) {
            if (statsPerLevel[stat]) {
                score += statsPerLevel[stat] * weight;
            }
        }

        return score;
    }

    /**
     * Estimate the overall strength of a class
     * @param {Object} classData - The complete class data object
     * @param {string} tier - The tier of the class (e.g., "tier1", "tier2", etc.)
     * @returns {Object} An object containing various strength metrics
     */
    estimateClassStrength(classData, tier) {
        const baseStatScore = this.calculateStatScore(classData.stats);
        const skillScore = this.calculateSkillScore(classData.skills);
        const growthScore = this.calculateGrowthScore(classData.statsPerLevel);

        // Adjust scores based on tier
        const tierMultiplier = this.getTierMultiplier(tier);
        const adjustedBaseStatScore = baseStatScore * tierMultiplier;
        const adjustedSkillScore = skillScore * tierMultiplier;
        const adjustedGrowthScore = growthScore * tierMultiplier;

        const totalScore = (adjustedBaseStatScore * 0.2) + (adjustedSkillScore * 0.4) + (adjustedGrowthScore * 0.4);

        // Get resistance tiers
        const resistances = this.getAllResistanceTiers(classData.stats.resistances || {});

        return {
            totalScore: Math.round(totalScore * 100) / 100,
            baseStatScore: Math.round(adjustedBaseStatScore * 100) / 100,
            skillScore: Math.round(adjustedSkillScore * 100) / 100,
            growthScore: Math.round(adjustedGrowthScore * 100) / 100,
            strengths: this.identifyStrengths(classData, tier),
            weaknesses: this.identifyWeaknesses(classData, tier),
            tier: tier || 'unknown',
            resistances: resistances
        };
    }

    /**
     * Get the multiplier for a given tier
     * @param {string} tier - The tier of the class
     * @returns {number} The multiplier for that tier
     */
    getTierMultiplier(tier) {
        const tierMultipliers = {
            'tier1': 1.0,    // Base tier
            'tier2': 1.5,    // 50% stronger than tier 1
            'tier3': 2.0,    // 100% stronger than tier 1
            'tier4': 2.5,    // 150% stronger than tier 1
            'tier5': 3.0     // 200% stronger than tier 1
        };

        return tierMultipliers[tier] || 1.0; // Default to 1.0 if tier is unknown
    }

    /**
     * Calculate the mean and standard deviation for a set of stats
     * @param {Object} stats - The stats to analyze
     * @returns {Object} Object containing mean and standard deviation for each stat category
     */
    calculateStatMetrics(stats) {
        const categories = {
            offensive: ['strength', 'magicPower', 'dexterity', 'accuracy'],
            defensive: ['armor', 'dodge'],
            resource: ['mana', 'stamina', 'manaRegen', 'vitality'],
            resistance: [] // Will be populated from resistances object
        };

        // Define weights for stats that should have less impact on their category average
        const statWeights = {
            armor: 3.0     // Armor will count as 3x its value since it's naturally lower than dodge
        };

        // Add resistance types to the resistance category
        if (stats.resistances) {
            categories.resistance = Object.keys(stats.resistances);
        }

        const metrics = {};

        // First pass: calculate category averages with weights
        const categoryAverages = {};
        for (const [category, statNames] of Object.entries(categories)) {
            if (category === 'resistance') {
                // For resistances, we'll use a different calculation method
                continue;
            }
            const values = statNames.map(stat => {
                const value = stats[stat] || 0;
                // Apply weight if defined, otherwise use full value
                return value * (statWeights[stat] || 1);
            });
            categoryAverages[category] = values.reduce((a, b) => a + b, 0) / values.length;
        }

        // Second pass: calculate normalized values and metrics
        for (const [category, statNames] of Object.entries(categories)) {
            if (category === 'resistance') {
                // Skip resistance category as it uses a different evaluation method
                continue;
            }
            const categoryAvg = categoryAverages[category];
            
            // Normalize values relative to their category average
            const normalizedValues = statNames.map(stat => {
                const value = stats[stat] || 0;
                // Normalize to a 0-1 scale where 1 is the category average
                return value / categoryAvg;
            });

            const mean = normalizedValues.reduce((a, b) => a + b, 0) / normalizedValues.length;
            const variance = normalizedValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / normalizedValues.length;
            const stdDev = Math.sqrt(variance);

            metrics[category] = { 
                mean, 
                stdDev,
                categoryAverage: categoryAvg
            };
        }

        return metrics;
    }

    /**
     * Get the tier for a resource stat
     * @param {string} stat - The resource stat name
     * @param {number} value - The stat value
     * @returns {number} The tier (1-5)
     */
    getResourceTier(stat, value) {
        const tiers = this.resourceTiers[stat];
        if (!tiers) return 3; // Default to middle tier if stat not found

        if (value >= tiers.tier5) return 5;
        if (value >= tiers.tier4) return 4;
        if (value >= tiers.tier3) return 3;
        if (value >= tiers.tier2) return 2;
        return 1;
    }

    /**
     * Check if a resource stat is significantly high compared to its tier baseline
     * @param {string} stat - The resource stat name
     * @param {number} value - The stat value
     * @param {string} classTier - The tier of the class (e.g., "tier1", "tier2")
     * @returns {boolean} Whether the stat is significantly high
     */
    isResourceStatHigh(stat, value, classTier) {
        const tiers = this.resourceTiers[stat];
        if (!tiers) return false;

        // Get the baseline tier for this class
        const baselineTier = classTier || 'tier1';
        const baselineValue = tiers[baselineTier];

        // A stat is considered high if it's at least 20% above its tier baseline
        return value >= baselineValue * 1.2;
    }

    /**
     * Check if a resource stat is significantly low compared to its tier baseline
     * @param {string} stat - The resource stat name
     * @param {number} value - The stat value
     * @param {string} classTier - The tier of the class (e.g., "tier1", "tier2")
     * @returns {boolean} Whether the stat is significantly low
     */
    isResourceStatLow(stat, value, classTier) {
        const tiers = this.resourceTiers[stat];
        if (!tiers) return false;

        // Get the baseline tier for this class
        const baselineTier = classTier || 'tier1';
        const baselineValue = tiers[baselineTier];

        // A stat is considered low if it's at least 20% below its tier baseline
        return value <= baselineValue * 0.8;
    }

    /**
     * Get all resistance tiers for a class
     * @param {Object} resistances - The class's resistances object
     * @returns {Object} Object containing resistance tiers by type
     */
    getAllResistanceTiers(resistances) {
        if (!resistances) return {};
        
        const tiers = {};
        for (const [type, value] of Object.entries(resistances)) {
            tiers[type] = this.getResistanceTier(value);
        }
        return tiers;
    }

    /**
     * Get the tier for a resistance value
     * @param {number} value - The resistance value
     * @returns {string} The tier ('low', 'medium', 'high')
     */
    getResistanceTier(value) {
        if (value >= 26) return 'high';
        if (value >= 11) return 'medium';
        if (value >= 1) return 'low';
        return 'none';
    }

    /**
     * Check if a stat is significantly high for its tier
     * @param {string} stat - The stat name
     * @param {number} value - The stat value
     * @param {number} tier - The tier number
     * @returns {boolean} Whether the stat is significantly high
     */
    isStatHigh(stat, value, tier) {
        const tiers = this.statTiers[stat];
        if (!tiers) return false;

        const tierKey = `tier${tier}`;
        const thresholds = tiers[tierKey];
        if (!thresholds) return false;

        return value >= thresholds.high;
    }

    /**
     * Check if a stat is significantly low for its tier
     * @param {string} stat - The stat name
     * @param {number} value - The stat value
     * @param {number} tier - The tier number
     * @returns {boolean} Whether the stat is significantly low
     */
    isStatLow(stat, value, tier) {
        const tiers = this.statTiers[stat];
        if (!tiers) return false;

        const tierKey = `tier${tier}`;
        const thresholds = tiers[tierKey];
        if (!thresholds) return false;

        return value <= thresholds.low;
    }

    /**
     * Identify the main strengths of a class
     * @param {Object} classData - The class data
     * @param {number} tier - The tier of the class
     * @returns {Array} Array of identified strengths
     */
    identifyStrengths(classData, tier) {
        const strengths = [];
        const stats = classData.stats;

        // Check offensive stats
        const offensiveStats = ['strength', 'magicPower', 'dexterity', 'accuracy'];
        const highOffensiveStats = offensiveStats.filter(stat => 
            this.isStatHigh(stat, stats[stat] || 0, tier)
        );

        if (highOffensiveStats.length > 0) {
            if (highOffensiveStats.includes('strength')) {
                strengths.push("High base physical damage");
            }
            if (highOffensiveStats.includes('magicPower')) {
                strengths.push("High base magical damage");
            }
            if (highOffensiveStats.includes('dexterity') || highOffensiveStats.includes('accuracy')) {
                strengths.push("High precision and critical hit chance");
            }
        }

        // Check defensive stats
        const defensiveStats = ['armor', 'dodge', 'blockChance'];
        const highDefensiveStats = defensiveStats.filter(stat => 
            this.isStatHigh(stat, stats[stat] || 0, tier)
        );

        if (highDefensiveStats.length > 0) {
            if (highDefensiveStats.includes('armor')) {
                strengths.push("Strong physical defense");
            }
            if (highDefensiveStats.includes('dodge')) {
                strengths.push("High evasion");
            }
            if (highDefensiveStats.includes('blockChance')) {
                strengths.push("High block chance");
            }
        }

        // Check resource stats using tier baselines
        const resourceStats = ['mana', 'stamina', 'manaRegen', 'vitality'];
        const highResourceStats = resourceStats.filter(stat => 
            this.isResourceStatHigh(stat, stats[stat] || 0, tier)
        );

        if (highResourceStats.length > 0) {
            if (highResourceStats.includes('mana')) {
                strengths.push("Large mana pool");
            }
            if (highResourceStats.includes('stamina')) {
                strengths.push("High stamina capacity");
            }
            if (highResourceStats.includes('manaRegen')) {
                strengths.push("Good mana regeneration");
            }
            if (highResourceStats.includes('vitality')) {
                strengths.push("High health pool");
            }
        }

        return strengths;
    }

    /**
     * Identify the main weaknesses of a class
     * @param {Object} classData - The class data
     * @param {number} tier - The tier of the class
     * @returns {Array} Array of identified weaknesses
     */
    identifyWeaknesses(classData, tier) {
        const weaknesses = [];
        const stats = classData.stats;

        // Check offensive stats
        const offensiveStats = ['strength', 'magicPower', 'dexterity', 'accuracy'];
        const lowOffensiveStats = offensiveStats.filter(stat => 
            this.isStatLow(stat, stats[stat] || 0, tier)
        );

        if (lowOffensiveStats.length > 0) {
            if (lowOffensiveStats.includes('strength')) {
                weaknesses.push("Low base physical damage");
            }
            if (lowOffensiveStats.includes('magicPower')) {
                weaknesses.push("Low base magical damage");
            }
            if (lowOffensiveStats.includes('dexterity') || lowOffensiveStats.includes('accuracy')) {
                weaknesses.push("Low precision and critical hit chance");
            }
        }

        // Check defensive stats
        const defensiveStats = ['armor', 'dodge', 'blockChance'];
        const lowDefensiveStats = defensiveStats.filter(stat => 
            this.isStatLow(stat, stats[stat] || 0, tier)
        );

        if (lowDefensiveStats.length > 0) {
            if (lowDefensiveStats.includes('armor')) {
                weaknesses.push("Poor physical defense");
            }
            if (lowDefensiveStats.includes('dodge')) {
                weaknesses.push("Low evasion");
            }
            if (lowDefensiveStats.includes('blockChance')) {
                weaknesses.push("Low block chance");
            }
        }

        // Check resource stats using tier baselines
        const resourceStats = ['mana', 'stamina', 'manaRegen', 'vitality'];
        const lowResourceStats = resourceStats.filter(stat => 
            this.isResourceStatLow(stat, stats[stat] || 0, tier)
        );

        if (lowResourceStats.length > 0) {
            if (lowResourceStats.includes('mana')) {
                weaknesses.push("Limited mana pool");
            }
            if (lowResourceStats.includes('stamina')) {
                weaknesses.push("Limited stamina");
            }
            if (lowResourceStats.includes('manaRegen')) {
                weaknesses.push("Poor mana regeneration");
            }
            if (lowResourceStats.includes('vitality')) {
                weaknesses.push("Low health pool");
            }
        }

        return weaknesses;
    }
}

// Export the class
export default ClassStrengthEstimator; 