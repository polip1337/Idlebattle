import { battleStatistics } from '../initialize.js';

function extractStatsFromRequirement(requirementString) {
    // Extract all stats references from the requirement string
    const statsMatches = requirementString.match(/stats\.([a-zA-Z0-9_]+)/g) || [];
    return statsMatches.map(match => match.replace('stats.', ''));
}

function getAllTrackedStats() {
    // Get all properties from BattleStatistics instance
    const trackedStats = new Set();
    
    // Add all direct properties
    Object.keys(battleStatistics).forEach(key => {
        trackedStats.add(key);
    });

    // Add nested properties from objects
    if (battleStatistics.damageDealt) {
        Object.keys(battleStatistics.damageDealt).forEach(key => {
            trackedStats.add(`damageDealt.${key}`);
        });
    }
    if (battleStatistics.damageReceived) {
        Object.keys(battleStatistics.damageReceived).forEach(key => {
            trackedStats.add(`damageReceived.${key}`);
        });
    }
    if (battleStatistics.enemiesDefeated) {
        Object.keys(battleStatistics.enemiesDefeated).forEach(key => {
            trackedStats.add(`enemiesDefeated.${key}`);
        });
    }
    if (battleStatistics.skillUsage) {
        Object.keys(battleStatistics.skillUsage).forEach(key => {
            trackedStats.add(`skillUsage.${key}`);
        });
    }
    if (battleStatistics.skillTagsUsed) {
        Object.keys(battleStatistics.skillTagsUsed).forEach(key => {
            trackedStats.add(`skillTagsUsed.${key}`);
        });
    }

    return trackedStats;
}

export async function checkUntrackedStats() {
    try {
        // Fetch evolution data
        const response = await fetch('../Data/evolutions.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const evolutionData = await response.json();

        // Get all tracked stats
        const trackedStats = getAllTrackedStats();
        const untrackedStats = new Set();

        // Process each class in each tier
        Object.values(evolutionData).forEach(tier => {
            tier.classes.forEach(classDef => {
                // Check each rarity requirement
                Object.values(classDef.requirements).forEach(requirementString => {
                    const statsInRequirement = extractStatsFromRequirement(requirementString);
                    
                    statsInRequirement.forEach(stat => {
                        // Check if the stat is tracked
                        if (!trackedStats.has(stat)) {
                            untrackedStats.add(stat);
                        }
                    });
                });
            });
        });

        // Print results
        console.log('Untracked stats found in evolution requirements:');
        console.log('----------------------------------------');
        Array.from(untrackedStats).sort().forEach(stat => {
            console.log(stat);
        });
        console.log('----------------------------------------');
        console.log(`Total untracked stats: ${untrackedStats.size}`);

    } catch (error) {
        console.error('Error checking untracked stats:', error);
    }
}

// Make the function available globally
window.checkUntrackedStats = checkUntrackedStats;
