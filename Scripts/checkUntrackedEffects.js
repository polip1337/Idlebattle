import EffectClass from '../EffectClass.js';

function getAllHandledEffectTypes() {
    // Get all effect types handled in EffectClass.js
    const handledTypes = new Set();
    
    // Extract all case statements from the switch statement in applyEffect
    const switchCases = [
        'Barrier', 'Blind', 'Blight', 'Bleed', 'Burn', 'Charm', 'Clone',
        'Confusion', 'Corrupt', 'Curse', 'Disarm', 'Enrage', 'Entrap',
        'Fear', 'flatChange', 'heal', 'Hex', 'Hexproof', 'decreaseCooldown',
        'Invisibility', 'Life Drain', 'Lifesteal', 'Mana Burn', 'Mana Drain',
        'Mark', 'Paralyze', 'Petrify', 'percentChange', 'Purify', 'Regen',
        'Reflect', 'Silence', 'Sleep', 'summon', 'Stun', 'Taunt', 'DoT',
        'delayedDamage'
    ];

    switchCases.forEach(type => handledTypes.add(type));
    return handledTypes;
}

function getAllHandledEffectSubTypes() {
    // Get all effect subtypes handled in EffectClass.js
    const handledSubTypes = new Set();
    
    // Extract all case statements from the switch statement in applyEffect
    const switchCases = [
        'Barrier', 'Blind', 'Blight', 'Bleed', 'Burn', 'Charm', 'Clone',
        'Confusion', 'Corrupt', 'Curse', 'Disarm', 'Enrage', 'Entrap',
        'Fear', 'flatChange', 'heal', 'Hex', 'Hexproof', 'decreaseCooldown',
        'Invisibility', 'Life Drain', 'Lifesteal', 'Mana Burn', 'Mana Drain',
        'Mark', 'Paralyze', 'Petrify', 'percentChange', 'Purify', 'Regen',
        'Reflect', 'Silence', 'Sleep', 'summon', 'Stun', 'Taunt', 'DoT',
        'delayedDamage', 'stealth', 'steal', 'dodge', 'blind', 'teleport',
        'speed', 'utility', 'criticalChance', 'armor'
    ];

    switchCases.forEach(type => handledSubTypes.add(type));
    return handledSubTypes;
}

export async function checkUntrackedEffects() {
    try {
        // Fetch effects and skills data
        const [effectsResponse, skillsResponse] = await Promise.all([
            fetch('../Data/effects.json'),
            fetch('../Data/skills.json')
        ]);

        if (!effectsResponse.ok || !skillsResponse.ok) {
            throw new Error(`HTTP error! status: ${effectsResponse.status || skillsResponse.status}`);
        }

        const effectsData = await effectsResponse.json();
        const skillsData = await skillsResponse.json();

        // Get all handled effect types and subtypes
        const handledTypes = getAllHandledEffectTypes();
        const handledSubTypes = getAllHandledEffectSubTypes();

        // Track problematic skills and effects
        const untrackedEffects = new Set();
        const skillsWithUntrackedEffects = new Map(); // Map of skill name to array of untracked effects
        let skillCount = 0;

        // Process each skill
        Object.values(skillsData).forEach(skill => {
            skillCount++;
            if (skill.effects) {
                const untrackedEffectsInSkill = [];
                
                // Handle both single effect and effects array
                const effectsToCheck = Array.isArray(skill.effects) ? skill.effects : [skill.effects];
                
                effectsToCheck.forEach(effect => {
                    if (!effect) return;

                    // Check effect type
                    if (effect.type && !handledTypes.has(effect.type)) {
                        untrackedEffects.add(`Type: ${effect.type}`);
                        untrackedEffectsInSkill.push(`Type: ${effect.type}`);
                    }

                    // Check effect subtype
                    if (effect.subType && !handledSubTypes.has(effect.subType)) {
                        untrackedEffects.add(`SubType: ${effect.subType}`);
                        untrackedEffectsInSkill.push(`SubType: ${effect.subType}`);
                    }

                    // Check effect ID against effects.json
                    if (effect.id && !effectsData[effect.id]) {
                        untrackedEffects.add(`ID: ${effect.id}`);
                        untrackedEffectsInSkill.push(`ID: ${effect.id}`);
                    }
                });

                if (untrackedEffectsInSkill.length > 0) {
                    skillsWithUntrackedEffects.set(skill.name, untrackedEffectsInSkill);
                }
            }
        });

        // Print results
        console.log("Total skills checked:", skillCount);
        console.log('\nUntracked effects found:');
        console.log('----------------------------------------');
        Array.from(untrackedEffects).sort().forEach(effect => {
            console.log(effect);
        });
        console.log('----------------------------------------');
        console.log(`Total untracked effect types/subtypes: ${untrackedEffects.size}`);

        console.log('\nSkills with untracked effects:');
        console.log('----------------------------------------');
        skillsWithUntrackedEffects.forEach((effects, skillName) => {
            console.log(`${skillName}:`);
            effects.forEach(effect => {
                console.log(`  - ${effect}`);
            });
        });
        console.log('----------------------------------------');
        console.log(`Total skills with untracked effects: ${skillsWithUntrackedEffects.size}`);

    } catch (error) {
        console.error('Error checking untracked effects:', error);
    }
}

// Make the function available globally
window.checkUntrackedEffects = checkUntrackedEffects; 