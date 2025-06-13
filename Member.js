// Member.js
import {deepCopy, updateExp, updateExpBarText, updateHealth, updateMana, updateStamina} from './Render.js';
import {battleLog, battleStatistics, evolutionService, hero, allSkillsCache} from './initialize.js';
import EffectClass from './EffectClass.js';
import Skill from './Skill.js';

// Helper function for structured logging
function logCombatEvent(type, data) {
    const timestamp = new Date().toISOString();
    console.log(`[COMBAT_LOG] [${timestamp}] [${type}]`, data);
}

class Member {
    constructor(name, classInfo, skillsSource, level = 1, team = null, opposingTeam = null, isHero = false) {
        this.name = name;
        this.classType = classInfo.name;
        this.classId = classInfo.combina;
        this.class = classInfo; // This should be the raw class definition object
        this.team = team;
        this.opposingTeam = opposingTeam;
        this.level = level;
        this.isHero = isHero;
        this.stats = deepCopy(classInfo.stats);
        this.statsPerLevel = classInfo.statsPerLevel;
        this.summons = 0;
        this.positions = classInfo.positions;
        this.position = this.positions ? this.positions[0] : "Front";
        this.dead = false;
        this.goldDrop = classInfo.goldDrop || 0;
        this.isSummon = false; // New field to track if this member is a summon
        this.forcedTarget = null; // Add forced target property
        this.damageBonuses = [];
        // Initialize critical hit stats if not present
        if (!this.stats.critChance) this.stats.critChance = 5; // Base 5% crit chance
        if (!this.stats.critDamageMultiplier) this.stats.critDamageMultiplier = 2.0; // 200% damage on crit
        if (!this.stats.blockChance) this.stats.blockChance = 5; // Base 5% block chance
        if (!this.stats.manaCostReduction) this.stats.manaCostReduction = 0; // Base 0% mana cost reduction
        this.stats.toHit = 0;
        this.stats.toDodge = 0;
        this.currentHealth = this.stats.vitality * 10;
        this.maxHealth = this.stats.vitality * 10;
        this.currentMana = this.stats.mana;
        this.currentStamina = this.stats.stamina;

        // Single source of truth for effects
        this.effectsMap = new Map(); // Maps effectId -> { effect: EffectClass, type: 'active'|'passive'|'item', source: skill|item }

        // Skill instantiation logic
        if (Array.isArray(skillsSource) && skillsSource.length > 0) {
            if (typeof skillsSource[0] === 'string' && allSkillsCache) { // Check if it's array of IDs and cache exists
                this.skills = this.createSkillsFromIDs(skillsSource);
            } else if (skillsSource[0] instanceof Skill) { // Check if it's already array of Skill instances
                this.skills = skillsSource;
            } else if (typeof skillsSource[0] === 'object' && skillsSource[0].name && skillsSource[0].icon) { // Assume array of skill data objects
                this.skills = this.createSkills(skillsSource);
            } else {
                console.warn(`Unsupported skillsSource format for member ${this.name}:`, skillsSource);
                this.skills = [];
            }
        } else {
            this.skills = [];
        }

        this.dragStartHandler = this.dragStartHandler.bind(this);
        this.dragOverHandler = this.dragOverHandler.bind(this);
        this.dropHandler = this.dropHandler.bind(this);

        this.experience = 0;
        this.experienceToLevel = 100; // Base for level 1
        // Apply level-ups if initial level > 1
        const initialLevel = this.level; // Store initial level
        this.level = 0; // Reset level to 0 before leveling up
        for (let i = 0; i < initialLevel; i++) { // Loop up to the original desired level
            this.levelUp(false); // Pass false to prevent UI updates during initial setup for non-hero
        }

        this.onSkillUseTriggers = []; // Add this line after other initializations
        this.onGettingHitTriggers = []; // Initialize onGettingHitTriggers

        logCombatEvent('MEMBER_CREATED', {
            memberName: this.name,
            classType: this.classType,
            initialLevel: initialLevel,
            isHero: this.isHero,
        });
    }

    initialize(team1, team2, memberId) {
        this.memberId = `team2-member` + memberId;
        this.team = team2;
        this.opposingTeam = team1;
    }

    initializeDOMElements() {
        this.element = document.querySelector(`#${this.memberId}`);
    }

    makeDraggable() {
        this.element.setAttribute('draggable', 'true');
        this.element.addEventListener('dragstart', this.dragStartHandler);
        this.element.addEventListener('dragover', this.dragOverHandler);
        this.element.addEventListener('drop', this.dropHandler);
    }

    dragStartHandler(event) {
        event.dataTransfer.setData('text/plain', this.memberId);
    }

    dragOverHandler(event) {
        event.preventDefault();
    }

    dropHandler(event) {
        event.preventDefault();
        const memberId = event.dataTransfer.getData('text/plain');
        const member = document.getElementById(memberId);
        const target = event.currentTarget;

        if (!this.isSameTeam(member, target)) {
            alert('No swapping teams!');
            return;
        }
        const memberIndex = Array.from(target.parentNode.children).indexOf(member);
        const targetIndex = Array.from(target.parentNode.children).indexOf(target);

        const parent = target.parentNode;
        if (targetIndex > memberIndex) {
            parent.insertBefore(member, parent.children[targetIndex]);
            parent.insertBefore(target, parent.children[memberIndex]);
        } else {
            if (memberIndex === parent.children.length - 1) {
                parent.appendChild(target);
            } else {
                parent.insertBefore(target, parent.children[memberIndex]);
            }
            parent.insertBefore(member, parent.children[targetIndex]);
        }
    }

    isSameTeam(member, target) {
        const parentOfMember = member.parentNode;
        const parentOfTarget = target.parentNode;
        return parentOfMember === parentOfTarget;
    }

    createSkills(skillsDataArray) { // Assumes skillsDataArray contains full skill definition objects
            return skillsDataArray.map(skillData => {
                if (!skillData) return null;
                return new Skill(skillData, skillData.effects, null);
            }).filter(s => s !== null);
        }

    createSkillsFromIDs(skillIDs) { // Assumes skillIDs are strings
        if (!allSkillsCache) {
            console.error("allSkillsCache not available in Member to create skills from IDs");
            return [];
        }
        return skillIDs.map(id => {
            const skillData = allSkillsCache[id];
            if (!skillData) {
                console.warn(`Skill ID ${id} not found in allSkillsCache for member ${this.name}.`);
                return null;
            }
            // skillData from allSkillsCache is an object: { name, icon, ..., effects: { ... } }
            return new Skill(skillData, skillData.effects); // Pass the whole skillData and its effects part
        }).filter(s => s !== null);
    }

    calculateHitChance(defender, skillModifier) {
        if (this == defender) {
            console.log("Self targeted");
            return true;
        }

        // Check for guaranteed dodge using effectsMap
        if (defender.getEffects().some(effect => effect.effect.subType === 'GuaranteedDodge')) {
            battleLog.log(`${defender.name} dodged the attack with Phased!`);
            battleStatistics.addSuccessfulDodge();
            // Find and remove the GuaranteedDodge effect
            const dodgeEffect = defender.getEffects().find(effect => effect.effect.subType === 'GuaranteedDodge');
            if (dodgeEffect) {
                logCombatEvent('EFFECT_CONSUMED', {
                    effectId: dodgeEffect.id,
                    effectName: dodgeEffect.name,
                    target: defender.name,
                    reason: 'GuaranteedDodge used'
                });
                dodgeEffect.remove();
            }
            logCombatEvent('HIT_CHANCE_EVALUATION', {
                attacker: this.name,
                defender: defender.name,
                skillModifier: skillModifier,
                outcome: 'Dodged',
                reason: 'GuaranteedDodge active'
            });
            return false;
        }

        const accuracy = this.getEffectiveStat('accuracy');
        const defenderDodge = defender.getEffectiveStat('dodge');
        const toHit = this.getEffectiveStat('toHit') || 0;
        const toDodge = defender.getEffectiveStat('toDodge') || 0;

        var hitChance = 80 + Math.floor(this.getEffectiveStat('dexterity') * 0.1) -
                       Math.floor(defender.getEffectiveStat('dexterity') * 0.1) +
                       accuracy - defenderDodge + toHit + toDodge;

        if (skillModifier != undefined) {
            hitChance += skillModifier;
        }

        const randomNumber = Math.floor(Math.random() * 101);
        const hitResult = randomNumber <= hitChance;

        logCombatEvent('HIT_CHANCE_EVALUATION', {
            attacker: this.name,
            defender: defender.name,
            skillModifier: skillModifier,
            accuracyStat: accuracy,
            defenderDodgeStat: defenderDodge,
            toHitStat: toHit,
            toDodgeStat: toDodge,
            calculatedHitChance: hitChance,
            randomNumber: randomNumber,
            outcome: hitResult ? 'Hit' : 'Miss',
        });

        if (hitResult) {
            return true;
        }
        battleLog.log(this.name + " Missed " + defender.name + "! Hit chance was: " + hitChance + '%');
        battleStatistics.addMiss();
        return false;
    }

    _processOnSkillUseTriggers(skill, actualTarget) {
        const onSkillUseTriggers = this.getEffects().filter(effect =>
            effect.effect.subType === 'onSkillUseTrigger' || effect.effect.subType === 'stealth'
        );

        if (onSkillUseTriggers && onSkillUseTriggers.length > 0) {
            onSkillUseTriggers.forEach(effectInstance => {
                const trigger = effectInstance.effect; // The value property holds the trigger data
                // Check if the trigger condition is met
                let shouldTrigger = true;
                if (trigger.condition) {
                    if(trigger.condition == true) {
                        shouldTrigger = true;
                    } else {
                        try {
                            const conditionFunc = typeof trigger.condition === 'string'
                                ? new Function('skill', `return ${trigger.condition}`)
                                : trigger.condition;
                            shouldTrigger = conditionFunc(skill);
                        } catch (e) {
                            console.error('Error evaluating trigger condition:', e);
                            shouldTrigger = false;
                        }
                    }
                }

                // Only proceed if condition is met and random chance succeeds
                if (shouldTrigger && Math.random() < trigger.chance) {
                    // Create the effect based on the trigger data
                    const effectData = {
                        id: trigger.effectId,
                        ...trigger.effectData,
                        caster: this
                    };
                    new EffectClass(actualTarget, effectData, this);
                    // If this trigger is for removal, remove the original trigger effect after use
                    if (trigger.remove) {
                        effectInstance.remove();
                    }
                }
            });
        }
    }

    performAttack(member, target, skill, isHero = false) {
        // Handle forced target if set
        const actualTarget = this.forcedTarget || target;

        // Process onSkillUse triggers BEFORE the attack
        const skillUseEffectsToRemove = this._processOnSkillUseTriggers(skill, actualTarget);

        // Check if target is on the same team
        if (actualTarget.team === this.team) {
            // Always apply healing to allies
             // Handle effects that apply to both allies and enemies
            if (skill.effects) {
                new EffectClass(actualTarget, skill.effects, this);
                skill.gainExperience(10); // Award experience for effect application
            }
            if (skill.heal) {
                const healAmount = skill.heal;
                actualTarget.healDamage(healAmount);
                skill.gainExperience(healAmount);
                battleLog.log(`${this.name} used ${skill.name} to heal ${actualTarget.name} for ${healAmount} health.`);
            }
        } else {
            // For enemies, check hit chance before applying damage
            if (this.calculateHitChance(actualTarget, skill.toHit)) {
                 // Handle effects that apply to both allies and enemies
                if (skill.effects) {
                    new EffectClass(actualTarget, skill.effects, this);
                    skill.gainExperience(10); // Award experience for effect application
                }
                if (skill.damageType && skill.damage != 0) {
                    const damage = skill.calculateDamage(this,actualTarget);
                    const finalDamage = actualTarget.calculateFinalDamage(damage, skill.damageType,this);

                    // Track simultaneous hits for multi-target skills
                    if (skill.targetCount && skill.targetCount > 1) {
                        battleStatistics.addEnemiesHitSimultaneously(skill.targetCount);
                    }

                    // Track minion damage
                    if (this.isSummon) {
                        if (this.caster && this.caster.isHero) {
                            battleStatistics.addDamageBySummons(finalDamage);
                        }
                    }

                    actualTarget.takeDamage(finalDamage);
                    if (this.isHero) { // Check if the attacker is the hero
                        skill.gainExperience(finalDamage);
                        battleStatistics.addDamageDealt(skill.damageType, finalDamage, skill.tags || []);
                    }
                    if (actualTarget.isHero) { // Check if the target is the hero
                        battleStatistics.addDamageReceived(skill.damageType, finalDamage);
                    }

                    battleLog.log(this.name + ` used ${skill.name} on ${actualTarget.name} dealing ` + finalDamage + ' damage.');
                }
            }
        }
        if(skillUseEffectsToRemove && skillUseEffectsToRemove.length > 0) { 
            skillUseEffectsToRemove.forEach(effect => effect.remove());
        }
    }

    calculateFinalDamage(damage, damageType, attacker = null) {
        let currentDamage = damage;
        logCombatEvent('FINAL_DAMAGE_CALC_START', {
            target: this.name,
            initialDamage: damage,
            damageType: damageType,
            attacker: attacker ? attacker.name : 'Unknown',
        });

        // Check for critical hit first
        const isCrit = this.checkCriticalHit(attacker);
        if (isCrit) {
            currentDamage *= this.getEffectiveStat('critDamageMultiplier');
            battleLog.log(`${this.name} landed a critical hit!`);
            if (this.isHero) {
                battleStatistics.addCriticalHit(currentDamage);
            }
            logCombatEvent('FINAL_CRITICAL_HIT_APPLIED', {
                target: this.name,
                attacker: attacker ? attacker.name : 'Unknown',
                critMultiplier: this.getEffectiveStat('critDamageMultiplier'),
                damageAfterCrit: currentDamage,
            });

            // Handle onCritTrigger effects
            const onCritEffect = this.getEffects().find(effect => effect.effect.subType === 'onCritTrigger');
            if (onCritEffect) {
                const trigger = onCritEffect.effect.value;
                if (trigger) {
                    const effectData = {
                        id: trigger.effectId,
                        ...trigger.buffData,
                        caster: trigger.caster
                    };
                    logCombatEvent('FINAL_EFFECT_TRIGGERED_ON_CRIT', {
                        triggerEffectId: onCritEffect.id,
                        triggerEffectName: onCritEffect.name,
                        target: this.name,
                        appliedEffectId: effectData.id,
                        appliedEffectName: effectData.name || 'Unnamed Triggered Effect',
                    });
                    new EffectClass(this, effectData, trigger.caster, skill);
                }
            }
        }

        // Handle mana shield damage first if active
        const manaShieldEffect = this.getEffects().find(effect => effect.effect.subType === 'ManaShield');
        if (manaShieldEffect) {
            const manaShieldRatio = manaShieldEffect.effect.ratio || 0;
            const manaDamage = parseFloat(Number(currentDamage).toFixed(2));;
            const manaCost = Math.ceil(manaDamage * manaShieldRatio);

            if (this.currentMana >= manaCost) {
                this.currentMana -= manaCost;
                if (this.isHero) {
                    battleStatistics.addManaUsed(manaCost);
                }
                updateMana(this);
                battleLog.log(`${this.name}'s mana shield absorbed ${manaDamage} damage, costing ${manaCost} mana.`);
                logCombatEvent('FINAL_MANA_SHIELD_ABSORBED', {
                    target: this.name,
                    manaShieldEffectId: manaShieldEffect.id,
                    damageAbsorbed: manaDamage,
                    manaCost: manaCost,
                    remainingMana: this.currentMana,
                });
                return 0;
            } else {
                const manaAbsorbedPartial = this.currentMana / manaShieldRatio;
                const remainingDamage = Math.ceil(currentDamage - manaAbsorbedPartial);
                const manaConsumed = this.currentMana;
                this.currentMana = 0;
                if (this.isHero) {
                    battleStatistics.addManaUsed(manaConsumed);
                }
                updateMana(this);
                battleLog.log(`${this.name}'s mana shield was depleted, taking ${remainingDamage} damage.`);
                logCombatEvent('MANA_SHIELD_DEPLETED', {
                    target: this.name,
                    manaShieldEffectId: manaShieldEffect.id,
                    damageAbsorbed: manaAbsorbedPartial,
                    manaConsumed: manaConsumed,
                    remainingDamageToHealth: remainingDamage,
                });
                currentDamage = remainingDamage;
            }
        }

        if (damageType != 'Bleed') {
            const damageBeforeBlock = currentDamage;
            currentDamage = this.applyBlock(currentDamage);
            if (currentDamage !== damageBeforeBlock) {
                 logCombatEvent('FINAL_DAMAGE_BLOCKED', {
                    target: this.name,
                    damageBeforeBlock: damageBeforeBlock,
                    damageAfterBlock: currentDamage,
                });
            }
            const damageBeforeArmor = currentDamage;
            currentDamage = this.applyArmor(currentDamage);
             if (currentDamage !== damageBeforeArmor) {
                 logCombatEvent('FINAL_DAMAGE_ARMOR_REDUCED', {
                    target: this.name,
                    damageBeforeArmor: damageBeforeArmor,
                    damageAfterArmor: currentDamage,
                    armorStat: this.getEffectiveStat('armor')
                });
            }
        }
        const damageBeforeResistance = currentDamage;
        currentDamage = this.applyResistance(currentDamage, damageType);
        if (currentDamage !== damageBeforeResistance) {
            logCombatEvent('FINAL_DAMAGE_RESISTED', {
                target: this.name,
                damageType: damageType,
                damageBeforeResistance: damageBeforeResistance,
                damageAfterResistance: currentDamage,
                resistanceStat: this.getEffectiveStat(`${damageType.toLowerCase()}Resistance`),
            });
        }

        logCombatEvent('FINAL_DAMAGE_CALC_FINAL', {
            target: this.name,
            finalDamage: Math.floor(currentDamage),
        });
        return Math.floor(currentDamage);
    }

    applyBlock(damage) {
        const blockChance = this.getEffectiveStat('blockChance');
        if (Math.random() * 100 < blockChance) {
            battleStatistics.addSuccessfulBlock();
            battleLog.log(`${this.name} blocked part of the attack!`);
            return damage * 0.5;
        }
        return damage;
    }

    applyArmor(damage) {
        const armor = this.getEffectiveStat('armor');
        return Math.max(0, damage - armor);
    }

    applyResistance(damage, damageType) {
        const resistance = this.getEffectiveStat(`${damageType.toLowerCase()}Resistance`) || 0;
        const reducedDamage = damage * (1 - resistance / 100);
        return reducedDamage;
    }

    healDamage(heal) {
        const actualHeal = Math.min(heal, this.maxHealth - this.currentHealth);
        const healthBefore = this.currentHealth;
        this.currentHealth += actualHeal;
        if (this.isHero) {
            battleStatistics.addTotalHealingReceived(actualHeal);
        }
        updateHealth(this);
        logCombatEvent('HEALTH_HEALED', {
            target: this.name,
            amount: heal,
            actualHeal: actualHeal,
            healthBefore: healthBefore,
            healthAfter: this.currentHealth,
            maxHealth: this.maxHealth,
        });
    }

    takeDamage(damage) {
        if (!this.dead) {
            const healthBefore = this.currentHealth;
            // Track overkill damage
            if (this.currentHealth < damage && !this.isHero) {
                const overkillAmount = damage - this.currentHealth;
                battleStatistics.addOverkillDamage(overkillAmount);
                logCombatEvent('OVERKILL_DAMAGE', {
                    target: this.name,
                    damageReceived: damage,
                    currentHealth: healthBefore,
                    overkillAmount: overkillAmount,
                });
            }

            // Track lifesteal
            if (this.lifesteal && !this.isHero) {
                const healthStolen = Math.floor(damage * (this.lifesteal / 100));
                battleStatistics.addHealthStolen(healthStolen);
                this.healDamage(healthStolen);
                logCombatEvent('LIFESTEAL_OCCURRED', {
                    source: this.name,
                    damageDealt: damage,
                    lifestealPercentage: this.lifesteal,
                    healthStolen: healthStolen,
                });
            }

            this.currentHealth -= damage;
            if (this.currentHealth < 0) {
                this.currentHealth = 0; // Ensure health doesn't go negative before death check
            }

            logCombatEvent('DAMAGE_TAKEN', {
                target: this.name,
                damageAmount: damage,
                healthBefore: healthBefore,
                healthAfter: this.currentHealth,
            });

            if (this.currentHealth <= 0) {
                this.handleDeath();
            }

            // Handle onGettingHitTrigger effects
            const onGettingHitTriggers = this.getEffects().filter(effect => effect.effect.subType === 'onGettingHitTrigger');
            if (onGettingHitTriggers && onGettingHitTriggers.length > 0) {
                logCombatEvent('EFFECT_TRIGGER_CHECK', {
                    triggerType: 'onGettingHitTrigger',
                    target: this.name,
                    damageTaken: damage,
                    numTriggers: onGettingHitTriggers.length,
                });
                onGettingHitTriggers.forEach(effectInstance => {
                    const trigger = effectInstance.effect;
                    let chanceSucceeded = true;
                    let randomRoll = null;

                    if(trigger.chance != undefined) {
                        randomRoll = Math.random();
                        chanceSucceeded = randomRoll < trigger.chance;
                    } 

                    logCombatEvent('EFFECT_TRIGGER_CHANCE_EVALUATED', {
                        effectId: effectInstance.id,
                        effectName: effectInstance.name,
                        target: this.name,
                        triggerChance: trigger.chance,
                        randomRoll: randomRoll,
                        chanceSucceeded: chanceSucceeded,
                        hasChanceCheck: trigger.chance != undefined
                    });

                    if (chanceSucceeded) {
                        const effectData = {
                            id: trigger.effectId,
                            ...trigger.effectData,
                            caster: trigger.caster
                        };
                        logCombatEvent('EFFECT_TRIGGERED_AND_APPLIED', {
                            triggerEffectId: effectInstance.id,
                            triggerEffectName: effectInstance.name,
                            caster: trigger.caster ? trigger.caster.name : 'Unknown',
                            target: this.name,
                            appliedEffectId: effectData.id,
                            appliedEffectName: effectData.name || 'Unnamed Effect',
                            removeOriginalTrigger: trigger.remove || false,
                        });
                        if (trigger.remove) {
                            effectInstance.remove();
                        }
                    } else {
                        logCombatEvent('EFFECT_TRIGGER_FAILED', {
                            triggerEffectId: effectInstance.id,
                            triggerEffectName: effectInstance.name,
                            target: this.name,
                            reason: `ChanceSucceeded: ${chanceSucceeded}`,
                        });
                    }
                });
            }

            updateHealth(this);
        }
    }

    handleDeath() {
        logCombatEvent('MEMBER_DEATH', {
            memberName: this.name,
            isHero: this.isHero,
            currentHealth: this.currentHealth, // Should be 0
        });

        this.currentHealth = 0;
        if (this.element) {
            this.element.querySelector(".memberPortrait img").src = "Media/UI/dead.jpg";
        }
        this.dead = true;
        this.stopSkills();
        // Remove all active effects upon death
        Array.from(this.effectsMap.values()).forEach(entry => {
            if (entry.type === 'active') { // Only remove active effects, keep passives for now
                entry.effect.remove();
            }
        });

        if (!this.isHero) { // Only hero gains exp from mob deaths
            hero.gainExperience(this.class.experience || 0); // Ensure experience exists
            battleStatistics.addEnemyDefeated(this.classType);
        } else {
            battleLog.log("Hero has been defeated!");
            // Game over logic or revival logic could go here
        }
    }

    stopSkills() {
        logCombatEvent('SKILLS_PAUSED', { memberName: this.name });
        this.skills.forEach(skill => {
            skill.pause(this);
        });
        // Pause all active effects
        this.effectsMap.forEach(entry => {
            if (entry.type === 'active') {
                entry.effect.pause();
            }
        });
    }

    startSkills() {
        logCombatEvent('SKILLS_UNPAUSED', { memberName: this.name });
        this.skills.forEach(skill => {
            skill.unpause(this);
        });
        // Unpause all active effects
        this.effectsMap.forEach(entry => {
            if (entry.type === 'active') {
                entry.effect.unpause();
            }
        });
    }

    levelUp(updateHeroUI = true) { // Added updateHeroUI flag
        const oldLevel = this.level;
        this.level++;
        logCombatEvent('MEMBER_LEVEL_UP', {
            memberName: this.name,
            oldLevel: oldLevel,
            newLevel: this.level,
            isHero: this.isHero,
        });

        if (this.statsPerLevel) {
            for (const stat in this.statsPerLevel) {
                if (this.stats.hasOwnProperty(stat) && this.statsPerLevel.hasOwnProperty(stat)) {
                    const oldValue = this.stats[stat];
                    this.stats[stat] += this.statsPerLevel[stat];
                    logCombatEvent('STAT_GAINED_ON_LEVEL_UP', {
                        memberName: this.name,
                        level: this.level,
                        statName: stat,
                        oldValue: oldValue,
                        newValue: this.stats[stat],
                        gainPerLevel: this.statsPerLevel[stat],
                    });
                }
            }
        }
        this.maxHealth = this.stats.vitality * 10;
        this.currentHealth = this.maxHealth;

        // Recalculate max mana/stamina based on base from class and per level stats
        if (this.class && this.class.stats) { // Ensure this.class.stats exists
            const oldMana = this.stats.mana;
            const oldStamina = this.stats.stamina;

            this.stats.mana = (this.class.stats.mana || 0) + ((this.statsPerLevel?.mana || 0) * (this.level -1));
            this.stats.stamina = (this.class.stats.stamina || 0) + ((this.statsPerLevel?.stamina || 0) * (this.level -1));

            logCombatEvent('MAX_RESOURCES_UPDATED', {
                memberName: this.name,
                level: this.level,
                statName: 'mana',
                oldValue: oldMana,
                newValue: this.stats.mana,
            });
            logCombatEvent('MAX_RESOURCES_UPDATED', {
                memberName: this.name,
                level: this.level,
                statName: 'stamina',
                oldValue: oldStamina,
                newValue: this.stats.stamina,
            });
        }
        this.currentMana = this.stats.mana;
        this.currentStamina = this.stats.stamina;


        if (this.isHero && updateHeroUI) { // Only update UI if it's the hero and flag is true
            updateExpBarText(this.classType + " Level: " + this.level);
             if (evolutionService && [2, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096].includes(this.level)) {
                //evolutionService.levelThresholdReached();
            }
            updateHealth(this);
            updateMana(this);
            updateStamina(this);
        }

        // Experience handling (relevant even if not hero, for internal consistency if needed)
        if (this.experience >= this.experienceToLevel) {
             this.experience -= this.experienceToLevel;
        } else if (this.level > 1 && this.experience < 0) { // If XP was already used by prior level up in multi-level
            // This case should be rare if experience is correctly deducted.
        }
        this.experienceToLevel = Math.floor(this.experienceToLevel * 1.1);

        if (this.experience >= this.experienceToLevel && this.level < 9999) { // Cap level for sanity
            this.levelUp(updateHeroUI); // Recurse for multi-level up
        }
    }

    gainExperience(exp) {
        if (!this.isHero) return; // Only hero gains experience this way
        const oldExp = this.experience;
        this.experience += exp;
        logCombatEvent('EXPERIENCE_GAINED', {
            memberName: this.name,
            amount: exp,
            expBefore: oldExp,
            expAfter: this.experience,
            expToNextLevel: this.experienceToLevel,
        });

        if (this.experience >= this.experienceToLevel) {
            this.levelUp(); // Hero always updates UI on level up
        }
        updateExp(this);
    }

    handleRegeneration() {
        if (this.currentHealth <= 0) return;

        const manaRegenAmount = this.getEffectiveStat('manaRegen',false) || 1;
        if (this.currentMana < this.getEffectiveStat('mana',false)) {
            const manaBefore = this.currentMana;
            this.currentMana = Math.min(this.getEffectiveStat('mana',false), this.currentMana + manaRegenAmount);
            if (this.isHero && manaRegenAmount > 0) battleStatistics.addManaRegenerated(manaRegenAmount);
            updateMana(this);
            logCombatEvent('MANA_REGENERATED', {
                memberName: this.name,
                amount: manaRegenAmount,
                manaBefore: manaBefore,
                manaAfter: this.currentMana,
                maxMana: this.getEffectiveStat('mana'),
            });
        }

        const staminaRegenAmount = Math.floor(0.1 * this.getEffectiveStat('vitality',false)) || 1;
        if (this.currentStamina < this.getEffectiveStat('stamina',false)) {
            const staminaBefore = this.currentStamina;
            this.currentStamina = Math.min(this.getEffectiveStat('stamina',false), this.currentStamina + staminaRegenAmount);
            if (this.isHero && staminaRegenAmount > 0) battleStatistics.addStaminaRegenerated(staminaRegenAmount);
            updateStamina(this);

        }

        // Health regen (if any, e.g. 1% of vitality)
        const healthRegenAmount = parseFloat((0.01 * this.getEffectiveStat('vitality',false)).toFixed(2)) || 0;
        if (this.currentHealth < this.maxHealth && healthRegenAmount > 0) {
             const healthBefore = this.currentHealth;
             this.currentHealth = Math.min(this.maxHealth, this.currentHealth + healthRegenAmount);
             this.currentHealth = parseFloat(this.currentHealth.toFixed(2));
             updateHealth(this);

        }
    }
        // --- SERIALIZATION (IF NEEDED FOR NON-HERO MEMBERS) ---
        getSerializableData() {
            // If you need to save non-hero members, it would be similar to Hero's,
            // but likely simpler as they might not have multiple classes, detailed skill selections etc.
            return {
                name: this.name,
                classType: this.classType, // Used to find base definition on load
                combination: this.combination,
                level: this.level,
                currentHealth: this.currentHealth,
                currentMana: this.currentMana,
                currentStamina: this.currentStamina,
                // Store only what deviates from the base definition or is dynamic
                // For enemies, usually only currentHealth/Mana/Stamina and active effects might matter mid-battle.
                // For persistent NPC allies, it would be more like the Hero.
                experience: this.experience, // If they gain XP
                experienceToLevel: this.experienceToLevel,
                stats: deepCopy(this.stats), // If their stats can change independently of level ups
                skillProgression: this.isHero ? this.skills.map(s => ({ // Only save skill progression for hero
                    name: s.name,
                    level: s.level,
                    experience: s.experience,
                    experienceToNextLevel: s.experienceToNextLevel,
                    baseDamage: s.baseDamage,
                    repeat: s.repeat // Add repeat property
                })) : [], // Non-heroes typically don't have skill progression saved this way
                // No selected skills for non-heroes usually
                // Effects should also be serialized if they need to persist across saves
                effects: Array.from(this.effectsMap.values()).map(entry => ({
                    id: entry.effect.id,
                    name: entry.effect.name,
                    subType: entry.effect.subType,
                    stat: entry.effect.stat,
                    value: entry.effect.value,
                    duration: entry.effect.duration,
                    icon: entry.effect.icon,
                    stackMode: entry.effect.stackMode,
                    type: entry.type,
                    isPassive: entry.effect.isPassive,
                    // Include any other properties of EffectClass that are essential for recreation
                })),
            };
        }

        restoreFromData(data, allMobClasses, allSkillsLookup) { // `allMobClasses` would be like `heroClasses`
            // This would be called if you were restoring, for example, a specific enemy's state.
            this.name = data.name;
            // this.classType = data.classType; // Already set by constructor based on definition
            // this.class = deepCopy(allMobClasses[this.classType]); // Base class info
            this.level = data.level;

            this.stats = deepCopy(data.stats); // Restore modified stats
            this.maxHealth = this.stats.vitality * 10; // Recalculate based on restored vitality
            this.currentHealth = Math.min(data.currentHealth, this.maxHealth);
            this.currentMana = Math.min(data.currentMana, this.stats.mana);
            this.currentStamina = Math.min(data.currentStamina, this.stats.stamina);

            this.experience = data.experience || 0;
            this.experienceToLevel = data.experienceToLevel || 100;
             if (this.constructor.name === 'Companion') {
                            return;
            }
            // Skip skill progression for companions
            if (this.constructor.name === 'Companion') {
                return;
            }

            // If non-heroes have skill progression (uncommon for standard mobs)
            if (data.skillProgression && data.skillProgression.length > 0 && allSkillsLookup) {
                const baseSkillsFromClass = allMobClasses[this.combination].skills.map(skillId => deepCopy(allSkillsLookup[skillId]));
                this.skills = baseSkillsFromClass.map(baseSkillData => {
                     const skillInstance = new Skill(baseSkillData, baseSkillData.effects);
                     const savedProg = data.skillProgression.find(sp => sp.name === skillInstance.name);
                     if (savedProg) {
                         skillInstance.applySavedState(savedProg);
                         // Explicitly set repeat from saved data if it exists, otherwise keep default
                         if (savedProg.hasOwnProperty('repeat')) {
                             skillInstance.repeat = savedProg.repeat;
                         }
                     }
                     return skillInstance;
                });
            } else if (allSkillsLookup) {
                // If no saved progression, just ensure skills are instantiated from base class definition
                const classDef = allMobClasses[this.classType];
                if (classDef && classDef.skills) {
                     this.skills = classDef.skills.map(skillId => {
                         const skillData = allSkillsLookup[skillId];
                         return new Skill(skillData, skillData.effects);
                     });
                }
            }

         

            // Note: For most enemy members, their `memberId`, `team`, `opposingTeam`, `element`
            // would be re-initialized when they are added to a battle/stage.
            // This `restoreFromData` would primarily be for stats and health if saved mid-combat.
        }

    checkCriticalHit(attacker) {
        // Start with base crit chance from attacker's stats
        let critChance = attacker.stats.critChance;
        logCombatEvent('CRIT_CHANCE_EVALUATION', {
            target: this.name,
            baseCritChance: critChance,
            attacker: attacker ? attacker.name : 'Unknown',
        });

        // Apply crit chance modifiers from attacker's active effects
        attacker.getEffects().forEach(effectInstance => {
            if (effectInstance.effect.modifiers) {
                effectInstance.effect.modifiers.forEach(modifier => {
                    if (modifier.stat === 'critChance') {
                        const oldCritChance = critChance;
                        if (modifier.flat) {
                            critChance += modifier.flat;
                        }
                        if (modifier.percentage) {
                            critChance *= (1 + modifier.percentage / 100);
                        }
                        logCombatEvent('STAT_MODIFIED_BY_EFFECT', {
                            memberName: attacker.name,
                            statName: 'critChance',
                            effectName: effectInstance.name,
                            modifierType: modifier.flat ? 'flat' : (modifier.percentage ? 'percentage' : 'unknown'),
                            modifierValue: modifier.flat || modifier.percentage,
                            oldValue: oldCritChance,
                            newValue: critChance,
                        });
                    }
                });
            }
        });

        // Apply crit resistance from target's effects
        let critResistance = 0;
        this.getEffects().forEach(effectInstance => {
            if (effectInstance.effect.modifiers) {
                effectInstance.effect.modifiers.forEach(modifier => {
                    if (modifier.stat === 'critResistance') {
                        if (modifier.flat) {
                            critResistance += modifier.flat;
                        }
                        if (modifier.percentage) {
                            critResistance += critChance * (modifier.percentage / 100);
                        }
                        logCombatEvent('CRIT_RESISTANCE_APPLIED', {
                            memberName: this.name,
                            effectName: effectInstance.name,
                            modifierType: modifier.flat ? 'flat' : 'percentage',
                            modifierValue: modifier.flat || modifier.percentage,
                            totalResistance: critResistance,
                        });
                    }
                });
            }
        });

        // Apply resistance to final crit chance
        critChance = Math.max(0, critChance - critResistance);

        const randomRoll = Math.random() * 100;
        const isCritResult = randomRoll < critChance;
        logCombatEvent('CRIT_CHANCE_OUTCOME', {
            target: this.name,
            attacker: attacker.name,
            finalCritChance: critChance,
            critResistance: critResistance,
            randomRoll: randomRoll,
            isCriticalHit: isCritResult,
        });
        return isCritResult;
    }

    hasDebuffName(debuffNames) {
        if (!Array.isArray(debuffNames)) {
            debuffNames = [debuffNames];
        }
        return Array.from(this.effectsMap.values()).some(entry =>
            entry.effect.type === 'debuff' &&
            debuffNames.includes(entry.effect.name)
        );
    }

    hasDebuff() {
        return Array.from(this.effectsMap.values()).some(entry => entry.effect.type === 'debuff');
    }

    applyPassiveEffect(skill) {
        if (!skill.isPassive) {
            logCombatEvent('PASSIVE_APPLY_SKIPPED', {
                memberName: this.name,
                skillName: skill.name,
                reason: 'Skill is not marked as passive'
            });
            return;
        }

        // Check if this specific passive effect is already applied
        const existingPassive = Array.from(this.effectsMap.values())
            .find(entry => entry.type === 'passive' && entry.source?.id === skill.id);

        if (existingPassive) {
            logCombatEvent('PASSIVE_ALREADY_ACTIVE', {
                memberName: this.name,
                skillName: skill.name,
                effectId: existingPassive.effect.id,
                effectName: existingPassive.effect.name,
            });
            return;
        }

        logCombatEvent('PASSIVE_EFFECT_TRIGGERED', {
            memberName: this.name,
            skillName: skill.name,
            skillId: skill.id,
            description: skill.description,
        });

        // Create and store the effect instance in effectsMap
        // The EffectClass constructor will call addEffect internally
        new EffectClass(this, skill.effects, this, skill); // Caster is 'this' for self-applied passives

        logCombatEvent('PASSIVE_EFFECT_APPLIED', {
            memberName: this.name,
            skillName: skill.name,
            skillId: skill.id,
            appliedEffectName: skill.effects?.name || skill.name, // Use skill name as effect name if not specified
            appliedEffectId: skill.effects?.id,
            sourceType: 'passive_skill',
        });
    }

    removePassiveSkill(skillId) {
        const skillIndex = this.skills.findIndex(skill => skill.id === skillId);
        if (skillIndex !== -1) {
            // Get and remove the effect instance from effectsMap
            const effectEntry = Array.from(this.effectsMap.values()).find(entry => entry.type === 'passive' && entry.source?.id === skillId);
            if (effectEntry) {
                logCombatEvent('PASSIVE_EFFECT_REMOVED', {
                    memberName: this.name,
                    skillId: skillId,
                    effectId: effectEntry.effect.id,
                    effectName: effectEntry.effect.name,
                    reason: 'Skill removed from member'
                });
                effectEntry.effect.remove(); // This will handle all cleanup including damage bonuses
            } else {
                logCombatEvent('PASSIVE_EFFECT_NOT_FOUND_FOR_REMOVAL', {
                    memberName: this.name,
                    skillId: skillId,
                    reason: 'No matching effect entry found in effectsMap for skill ID.'
                });
            }
            this.skills.splice(skillIndex, 1);
        } else {
            logCombatEvent('PASSIVE_SKILL_NOT_FOUND_FOR_REMOVAL', {
                memberName: this.name,
                skillId: skillId,
                reason: 'Skill not found in member\'s skill list.'
            });
        }
    }

    // New getEffectiveStat implementation to iterate through effectsMap
    getEffectiveStat(statName, log = true) {
        let baseValue = this.stats[statName] || 0;
        let currentValue = baseValue;

        if (log) {
            logCombatEvent('STAT_CALC_START', {
                memberName: this.name,
                statName: statName,
                baseValue: baseValue,
            });
        }

        this.effectsMap.forEach(entry => {
            const effect = entry.effect.effect;
            if (effect.modifiers) {
                effect.modifiers.forEach(modifier => {
                    if (modifier.stat === statName) {
                        const valueBeforeModifier = currentValue;
                        if (modifier.flat) {
                            currentValue += modifier.flat;
                        }
                        if (modifier.percentage) {
                            currentValue *= (1 + modifier.percentage / 100);
                        }
                        if (log) {
                            logCombatEvent('STAT_MODIFIED_BY_EFFECT', {
                                memberName: this.name,
                                statName: statName,
                                effectName: entry.effect.name,
                                effectId: entry.effect.id,
                                modifierType: modifier.flat ? 'flat' : (modifier.percentage ? 'percentage' : 'unknown'),
                                modifierValue: modifier.flat || modifier.percentage,
                                valueBeforeModifier: valueBeforeModifier,
                                valueAfterModifier: currentValue,
                                sourceEffectType: entry.type,
                                sourceSkillId: entry.source ? entry.source.id : 'N/A',
                            });
                        }
                    }
                });
            }
            // Handle specific effect types that might modify stats (e.g., Vulnerability)
            if (effect.subType === 'Vulnerability' && `${effect.damageType.toLowerCase()}Resistance` === statName) {
                const valueBeforeModifier = currentValue;
                currentValue -= effect.value;
                if (log) {
                    logCombatEvent('STAT_MODIFIED_BY_EFFECT', {
                        memberName: this.name,
                        statName: statName,
                        effectName: entry.effect.name,
                        effectId: entry.effect.id,
                        modifierType: 'vulnerability_debuff',
                        modifierValue: effect.value,
                        valueBeforeModifier: valueBeforeModifier,
                        valueAfterModifier: currentValue,
                        sourceEffectType: entry.type,
                        sourceSkillId: entry.source ? entry.source.id : 'N/A',
                        damageType: effect.damageType,
                    });
                }
            }
             // Handle 'flatChange' and 'percentChange' which directly modify a stat
            if (effect.subType === 'flatChange' && effect.stat === statName) {
                const valueBeforeModifier = currentValue;
                currentValue += effect.value;
                if (log) {
                    logCombatEvent('STAT_MODIFIED_BY_EFFECT', {
                        memberName: this.name,
                        statName: statName,
                        effectName: entry.effect.name,
                        effectId: entry.effect.id,
                        modifierType: 'flatChange',
                        modifierValue: effect.value,
                        valueBeforeModifier: valueBeforeModifier,
                        valueAfterModifier: currentValue,
                        sourceEffectType: entry.type,
                        sourceSkillId: entry.source ? entry.source.id : 'N/A',
                    });
                }
            }
            if (effect.subType === 'percentChange' && effect.stat === statName) {
                const valueBeforeModifier = currentValue;
                currentValue *= (1 + effect.value / 100);
                if (log) {
                    logCombatEvent('STAT_MODIFIED_BY_EFFECT', {
                        memberName: this.name,
                        statName: statName,
                        effectName: entry.effect.name,
                        effectId: entry.effect.id,
                        modifierType: 'percentChange',
                        modifierValue: effect.value,
                        valueBeforeModifier: valueBeforeModifier,
                        valueAfterModifier: currentValue,
                        sourceEffectType: entry.type,
                        sourceSkillId: entry.source ? entry.source.id : 'N/A',
                    });
                }
            }
        });
        if (log) {
            logCombatEvent('STAT_CALC_END', {
                memberName: this.name,
                statName: statName,
                finalValue: currentValue,
            });
        }
        return currentValue;
    }

    getEffectiveResistance(damageType) {
        // Start with base resistance from stats
        let baseResistance = this.stats[`${damageType.toLowerCase()}Resistance`] || 0;
        let totalResistance = baseResistance;

        logCombatEvent('RESISTANCE_CALC_START', {
            memberName: this.name,
            damageType: damageType,
            baseResistance: baseResistance
        });

        this.effectsMap.forEach(entry => {
            const effect = entry.effect.effect;
            
            // Handle buffResistanceFlat effects (like Battle Hardened)
            if (effect.subType === 'buffResistanceFlat' && Array.isArray(effect.damageType)) {
                const damageTypeIndex = effect.damageType.indexOf(damageType);
                if (damageTypeIndex !== -1 && Array.isArray(effect.value)) {
                    const resistanceValue = effect.value[damageTypeIndex];
                    const valueBeforeModifier = totalResistance;
                    totalResistance += resistanceValue;
                    
                    logCombatEvent('RESISTANCE_MODIFIED_BY_EFFECT', {
                        memberName: this.name,
                        damageType: damageType,
                        effectName: entry.effect.name,
                        effectId: entry.effect.id,
                        modifierType: 'flat',
                        modifierValue: resistanceValue,
                        valueBeforeModifier: valueBeforeModifier,
                        valueAfterModifier: totalResistance,
                        sourceEffectType: entry.type,
                        sourceSkillId: entry.source ? entry.source.id : 'N/A'
                    });
                }
            }
            
            // Handle vulnerability effects
            if (effect.subType === 'Vulnerability' && effect.damageType === damageType) {
                const valueBeforeModifier = totalResistance;
                totalResistance -= effect.value;
                
                logCombatEvent('RESISTANCE_MODIFIED_BY_EFFECT', {
                    memberName: this.name,
                    damageType: damageType,
                    effectName: entry.effect.name,
                    effectId: entry.effect.id,
                    modifierType: 'vulnerability',
                    modifierValue: -effect.value,
                    valueBeforeModifier: valueBeforeModifier,
                    valueAfterModifier: totalResistance,
                    sourceEffectType: entry.type,
                    sourceSkillId: entry.source ? entry.source.id : 'N/A'
                });
            }

            // Handle general resistance modifiers from effect.modifiers
            if (effect.modifiers) {
                effect.modifiers.forEach(modifier => {
                    if (modifier.stat === `${damageType.toLowerCase()}Resistance`) {
                        const valueBeforeModifier = totalResistance;
                        if (modifier.flat) {
                            totalResistance += modifier.flat;
                        }
                        if (modifier.percentage) {
                            totalResistance *= (1 + modifier.percentage / 100);
                        }
                        
                        logCombatEvent('RESISTANCE_MODIFIED_BY_EFFECT', {
                            memberName: this.name,
                            damageType: damageType,
                            effectName: entry.effect.name,
                            effectId: entry.effect.id,
                            modifierType: modifier.flat ? 'flat' : 'percentage',
                            modifierValue: modifier.flat || modifier.percentage,
                            valueBeforeModifier: valueBeforeModifier,
                            valueAfterModifier: totalResistance,
                            sourceEffectType: entry.type,
                            sourceSkillId: entry.source ? entry.source.id : 'N/A'
                        });
                    }
                });
            }
        });

        logCombatEvent('RESISTANCE_CALC_END', {
            memberName: this.name,
            damageType: damageType,
            finalResistance: totalResistance
        });

        return totalResistance;
    }

    checkEffectResistance(effectType, caster = null) {
        // Get the resistance for this effect type
        const resistance = this.getEffectiveResistance(effectType);
        
        logCombatEvent('EFFECT_RESISTANCE_CHECK', {
            target: this.name,
            effectType: effectType,
            resistance: resistance,
            caster: caster ? caster.name : 'Unknown'
        });

        // Base chance to resist is the resistance value
        let resistChance = resistance;

        // If there's a caster, we can factor in their effect penetration if they have any
        if (caster) {
            const penetration = caster.getEffectiveStat('effectPenetration') || 0;
            resistChance = Math.max(0, resistChance - penetration);
            
            logCombatEvent('EFFECT_PENETRATION_APPLIED', {
                target: this.name,
                caster: caster.name,
                penetration: penetration,
                adjustedResistChance: resistChance
            });
        }

        // Roll for resistance
        const roll = Math.random() * 100;
        const resisted = roll < resistChance;

        logCombatEvent('EFFECT_RESISTANCE_OUTCOME', {
            target: this.name,
            effectType: effectType,
            resistChance: resistChance,
            roll: roll,
            resisted: resisted
        });

        return resisted;
    }

    // `hasEffectState` and `getEffectState` now check specific effect properties
    hasEffectState(stateName) {
        // This method will now check if an effect with a certain 'state' or 'subType' is present
        // You'll need to define how 'states' map to effect properties
        switch (stateName) {
            case 'hasGuaranteedDodge':
                return Array.from(this.effectsMap.values()).some(entry => entry.effect.effect.subType === 'GuaranteedDodge');
            case 'manaShieldActive':
                return Array.from(this.effectsMap.values()).some(entry => entry.effect.effect.subType === 'ManaShield');
            case 'onCritTrigger':
                return Array.from(this.effectsMap.values()).some(entry => entry.effect.effect.subType === 'onCritTrigger');
            case 'hasStealth': // New state for stealth
                return Array.from(this.effectsMap.values()).some(entry => entry.effect.effect.subType === 'stealth');
            default:
                return false;
        }
    }

    getEffectState(stateName) {
        // This method will retrieve the value of a specific 'state' from an effect
        switch (stateName) {
            case 'hasGuaranteedDodge':
                const dodgeEffect = Array.from(this.effectsMap.values()).find(entry => entry.effect.effect.subType === 'GuaranteedDodge');
                return dodgeEffect ? dodgeEffect.effect.effect.value : null;
            case 'manaShieldActive':
                const manaShield = Array.from(this.effectsMap.values()).find(entry => entry.effect.effect.subType === 'ManaShield');
                return manaShield ? manaShield.effect.effect.value : null; // Return the ratio
            case 'onCritTrigger':
                const onCrit = Array.from(this.effectsMap.values()).find(entry => entry.effect.effect.subType === 'onCritTrigger');
                return onCrit ? onCrit.effect.effect.value : null;
            case 'hasStealth':
                const stealth = Array.from(this.effectsMap.values()).find(entry => entry.effect.effect.subType === 'stealth');
                return stealth ? stealth.effect.effect.value : null;
            default:
                return null;
        }
    }

    // These methods are no longer directly setting states or modifiers.
    // EffectClass instances handle their own state and modifier application upon creation/removal.
    // They are kept as stubs for now, but their usage context should be revisited in EffectClass.
    setEffectState(stateName, value, effectId) {
        // This method's logic is largely handled by the EffectClass constructor and its applyEffect method.
        // For 'GuaranteedDodge', the EffectClass itself needs to manage its presence in effectsMap.
        console.warn(`Member.setEffectState(${stateName}, ${value}, ${effectId}) is deprecated. Manage states via EffectClass instances.`);
    }

    removeEffectState(stateName, effectId) {
        // This method's logic is largely handled by the EffectClass's remove method.
        console.warn(`Member.removeEffectState(${stateName}, ${effectId}) is deprecated. Manage states via EffectClass instances.`);
    }

    // handleOnCritTrigger is now integrated into calculateFinalDamage
    // applyPassiveSkill is now integrated into applyPassiveEffect

    getEffects() {
        return Array.from(this.effectsMap.values()).map(entry => entry.effect);
    }

    hasEffect(effectId) {
        return this.effectsMap.has(effectId);
    }

    getEffect(effectId) {
        return this.effectsMap.get(effectId)?.effect;
    }

    addEffect(effectInstance, type = 'active', source = null) {
        // Handle multiple effects from a skill
        if (Array.isArray(effectInstance)) {
            effectInstance.forEach(effect => {
                this.addEffect(effect, type, source);
            });
            return;
        }

        // Check if this is an effect that can be resisted
        if (effectInstance.effect.type === 'debuff') {
            // Check resistance before adding the effect
            if (this.checkEffectResistance(effectInstance.effect.subType || effectInstance.effect.type, source)) {
                battleLog.log(`${this.name} resisted the ${effectInstance.name || effectInstance.effect.subType || effectInstance.effect.type} effect!`);
                logCombatEvent('EFFECT_RESISTED', {
                    target: this.name,
                    effectId: effectInstance.id,
                    effectName: effectInstance.name || effectInstance.effect.subType || effectInstance.effect.type,
                    source: source ? source.name : 'Unknown'
                });
                return; // Don't add the effect if resisted
            }
        }

        this.effectsMap.set(effectInstance.id, { effect: effectInstance, type, source });
        logCombatEvent('EFFECT_ADDED', {
            memberName: this.name,
            effectId: effectInstance.id,
            effectName: effectInstance.name,
            effectType: type,
            source: source ? (source.name || source.id) : 'N/A',
            duration: effectInstance.effect.duration,
        });
    }

    removeEffect(effectId) {
        const effectEntry = this.effectsMap.get(effectId);
        if (effectEntry) {
            this.effectsMap.delete(effectId);
            logCombatEvent('EFFECT_REMOVED', {
                memberName: this.name,
                effectId: effectId,
                effectName: effectEntry.effect.name,
                effectType: effectEntry.type,
                source: effectEntry.source ? (effectEntry.source.name || effectEntry.source.id) : 'N/A',
                reason: 'Direct removal call',
            });
        } else {
            logCombatEvent('EFFECT_REMOVAL_FAILED', {
                memberName: this.name,
                effectId: effectId,
                reason: 'Effect not found in effectsMap',
            });
        }
    }

    getEffectsByType(type) {
        return Array.from(this.effectsMap.values())
            .filter(entry => entry.type === type)
            .map(entry => entry.effect);
    }

    getEffectsBySource(source) {
        return Array.from(this.effectsMap.values())
            .filter(entry => entry.source === source)
            .map(entry => entry.effect);
    }
}

export default Member;