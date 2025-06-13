// Skill.js
import {renderLevelUp, updateMana, updateStamina} from './Render.js';
import {selectTarget} from './Targeting.js';
import {battleController, battleStatistics, hero as globalHero} from './initialize.js';
import EffectClass from './EffectClass.js';

// Helper function for structured logging (duplicated for self-containment, but ideally shared)
function logCombatEvent(type, data) {
    const timestamp = new Date().toISOString();
    console.log(`[COMBAT_LOG] [${timestamp}] [${type}]`, data);
}

class Skill {
    constructor(skillData, effects, element = null) {
        this.name = skillData.name;
        this.icon = skillData.icon;
        this.type = skillData.type;
        this.id = skillData.id;
        this.description = skillData.description;
        this.damage = skillData.damage;
        this.heal = skillData.heal;
        this.manaCost = skillData.manaCost;
        this.staminaCost = skillData.staminaCost;
        this.cooldown = skillData.cooldown;
        this.remainingDuration = 0;
        this.cooldownStartTime = null;
        this.onCooldown = false;
        this.damageType = skillData.damageType;
        this.targetingModes = skillData.targetingModes;
        this.extraTargets = skillData.extraTargets;
        this.targetCount = skillData.targetCount || 1;
        this.effects = effects || skillData.effects || skillData.effect; // Handle both effects array and single effect
        this.div = element;
        this.repeat = true;
        this.level = 1;
        this.experience = 0;
        this.experienceToNextLevel = 100;
        this.baseDamage = 1;
        this.overlay = null;
        this.boundAnimationEndCallback = null;
        this.needsInitialCooldownKickoff;
        this.tags = skillData.tags;
        this.isPassive = skillData.type === "passive";

        logCombatEvent('SKILL_INITIALIZED', {
            skillName: this.name,
            skillId: this.id,
            skillType: this.type,
            isPassive: this.isPassive,
        });
    }

    setElement(element) {
        this.div = element;
    }

    calculateDamage(member, target) {
        let damage = this.damage * this.baseDamage * member.getEffectiveStat('damage');
        
        logCombatEvent('SKILL_DAMAGE_CALC_START', {
            skillName: this.name,
            member: member.name,
            target: target.name,
            baseSkillDamage: this.damage,
            skillBaseDamageMultiplier: this.baseDamage,
            memberDamageStat: member.getEffectiveStat('damage'),
            initialCalculatedDamage: damage,
        });

        // Scale damage based on tags
        if (this.tags.includes('Physical')) {
            const oldDamage = damage;
            damage *= (1 + member.getEffectiveStat('strength') / 100); // Scale with strength
            logCombatEvent('SKILL_DAMAGE_SCALED', {
                skillName: this.name,
                member: member.name,
                scalingStat: 'strength',
                statValue: member.getEffectiveStat('strength'),
                oldDamage: oldDamage,
                newDamage: damage,
                tag: 'Physical',
            });
        } else if (this.tags.includes('Magical')) {
            const oldDamage = damage;
            damage *= (1 + member.getEffectiveStat('magicPower') / 100); // Scale with magic power
            logCombatEvent('SKILL_DAMAGE_SCALED', {
                skillName: this.name,
                member: member.name,
                scalingStat: 'magicPower',
                statValue: member.getEffectiveStat('magicPower'),
                oldDamage: oldDamage,
                newDamage: damage,
                tag: 'Magical',
            });
        }

        // Check for damage modifiers from effects
        const damageModifiers = member.getEffects().filter(effect => 
            (effect.effect.subType === 'damageBonusConditional' ));

        if (damageModifiers.length > 0) {
            logCombatEvent('SKILL_DAMAGE_BONUS_CHECK', {
                skillName: this.name,
                member: member.name,
                numModifiers: damageModifiers.length,
            });

            damageModifiers.forEach(effectInstance => {
 
                // Handle damageBonusConditional effects
                if (effectInstance.effect.subType === 'damageBonusConditional') {
                    const oldDamage = damage;
                    let modifierApplied = false;

                    try {
                        // Handle string conditions (like "target.hasDebuff()")
                        if (typeof effectInstance.effect.condition === 'string') {
                            const conditionFunc = new Function('member', 'target', 'skill', `return ${effectInstance.effect.condition}`);
                            if (conditionFunc(member,target,this)) {
                                damage *= (1 + effectInstance.effect.value / 100);
                                modifierApplied = true;
                            }
                        }
                        // Handle function conditions
                        else if (typeof effectInstance.effect.condition === 'function') {
                            if (effectInstance.effect.condition(target)) {
                                damage *= (1 + effectInstance.effect.value / 100);
                                modifierApplied = true;
                            }
                        }
                        // Handle boolean conditions (always true)
                        else if (effectInstance.effect.condition === true) {
                            damage *= (1 + effectInstance.effect.value / 100);
                            modifierApplied = true;
                        }

                        if (modifierApplied) {
                            logCombatEvent('SKILL_DAMAGE_CONDITIONAL_APPLIED', {
                                skillName: this.name,
                                member: member.name,
                                effectName: effectInstance.name,
                                effectId: effectInstance.id,
                                bonusValue: effectInstance.effect.value,
                                oldDamage: oldDamage,
                                newDamage: damage,
                                condition: effectInstance.effect.condition.toString(),
                            });
                        }
                    } catch (e) {
                        console.error('Error evaluating damageBonusConditional condition:', e);
                        logCombatEvent('SKILL_DAMAGE_CONDITIONAL_ERROR', {
                            skillName: this.name,
                            member: member.name,
                            effectName: effectInstance.name,
                            error: e.message,
                        });
                    }
                }
            });
        }
        logCombatEvent('SKILL_DAMAGE_CALC_END', {
            skillName: this.name,
            member: member.name,
            finalCalculatedDamage: damage,
        });
        return damage;
    }

    gainExperience(amount) {
        // Only allow hero team skills to gain experience
        if (this.div && (this.div.closest('#team1')||this.div.closest('#bottomContainer'))) {
            // For passive skills, only gain exp if they are selected
            if (this.isPassive) {
                const isSelected = globalHero && globalHero.selectedSkills.some(s => s && s.id === this.id);
                if (!isSelected) {
                    logCombatEvent('SKILL_EXP_GAIN_SKIPPED', {
                        skillName: this.name,
                        reason: 'Passive skill not selected',
                        amount: amount,
                    });
                    return;
                }
            }
            
            const oldExperience = this.experience;
            this.experience += amount;
            logCombatEvent('SKILL_EXPERIENCE_GAINED', {
                skillName: this.name,
                amount: amount,
                expBefore: oldExperience,
                expAfter: this.experience,
                expToNextLevel: this.experienceToNextLevel,
            });

            while (this.experience >= this.experienceToNextLevel) {
                this.levelUp();
                renderLevelUp(this);
            }
        } else {
            logCombatEvent('SKILL_EXP_GAIN_SKIPPED', {
                skillName: this.name,
                reason: 'Not a hero skill or associated with UI element',
                amount: amount,
            });
        }
    }

    levelUp() {
        const oldLevel = this.level;
        const oldExpToNextLevel = this.experienceToNextLevel;
        const oldBaseDamage = this.baseDamage;
        const oldEffectValue = this.effects && typeof this.effects.value === 'number' ? this.effects.value : null;

        this.experience -= this.experienceToNextLevel;
        this.level += 1;
        this.experienceToNextLevel = Math.floor(this.experienceToNextLevel * 1.5);
        this.baseDamage = Math.floor(this.baseDamage * 1.05);
        if (this.effects && typeof this.effects.value === 'number') {
            this.effects.value = Math.floor(this.effects.value * 1.05);
        }

        logCombatEvent('SKILL_LEVEL_UP', {
            skillName: this.name,
            oldLevel: oldLevel,
            newLevel: this.level,
            expRemaining: this.experience,
            oldExpToNextLevel: oldExpToNextLevel,
            newExpToNextLevel: this.experienceToNextLevel,
            oldBaseDamage: oldBaseDamage,
            newBaseDamage: this.baseDamage,
            oldEffectValue: oldEffectValue,
            newEffectValue: this.effects && typeof this.effects.value === 'number' ? this.effects.value : 'N/A',
        });
    }

    handleSkillCost(member) {
        logCombatEvent('SKILL_COST_BEFORE', {
            skillName: this.name,
            member: member.name,
            manaBefore: member.currentMana,
            staminaBefore: member.currentStamina,
            manaCost: this.manaCost,
            staminaCost: this.staminaCost,
        });

        member.currentMana -= this.manaCost;
        member.currentStamina -= this.staminaCost;

        logCombatEvent('SKILL_COST_AFTER', {
            skillName: this.name,
            member: member.name,
            manaAfter: member.currentMana,
            staminaAfter: member.currentStamina,
        });

        updateMana(member);
        updateStamina(member);
    }

    handleExpGain(member) {
        battleStatistics.addSkillUsage(this.name);
        battleStatistics.addManaSpent(this.manaCost);
        battleStatistics.addStaminaSpent(this.staminaCost);
        logCombatEvent('SKILL_STATS_UPDATE', {
            skillName: this.name,
            member: member.name,
            manaSpent: this.manaCost,
            staminaSpent: this.staminaCost,
        });
    }

    applyPassiveEffect(member) {
        if (!this.isPassive) {
            logCombatEvent('PASSIVE_APPLY_SKIPPED', {
                skillName: this.name,
                member: member.name,
                reason: 'Skill is not marked as passive'
            });
            return;
        }

        // Check if this specific passive effect is already applied
        const existingPassive = Array.from(member.effectsMap.values())
            .find(entry => entry.type === 'passive' && entry.source?.id === this.id);

        if (existingPassive) {
            logCombatEvent('PASSIVE_ALREADY_ACTIVE', {
                skillName: this.name,
                member: member.name,
                effectId: existingPassive.effect.id,
                effectName: existingPassive.effect.name,
            });
            return;
        }

        logCombatEvent('PASSIVE_EFFECT_TRIGGERED', {
            skillName: this.name,
            skillId: this.id,
            member: member.name,
            description: this.description,
        });
        
        // Handle both single effect and effects array
        const effectsToApply = Array.isArray(this.effects) ? this.effects : [this.effects];
        
        effectsToApply.forEach(effect => {
            if (!effect) {
                logCombatEvent('PASSIVE_EFFECT_SKIPPED', {
                    skillName: this.name,
                    member: member.name,
                    reason: 'Effect data is null/undefined',
                });
                return;
            }

            // Ensure properties are set on the effect data before passing to EffectClass
            effect.name = effect.name || this.name;
            effect.icon = effect.icon || this.icon;
            effect.description = effect.description || this.description;
            effect.duration = effect.duration !== undefined ? effect.duration : -1; // Default to -1 for passive
            effect.type = effect.type || "buff"; // Default to buff for passive effects

            logCombatEvent('PASSIVE_EFFECT_APPLIED_DETAIL', {
                skillName: this.name,
                member: member.name,
                effectName: effect.name,
                effectId: effect.id,
                effectDuration: effect.duration,
                effectType: effect.type,
                // Include specific modifiers if they exist
                modifiers: effect.modifiers ? JSON.stringify(effect.modifiers) : 'None',
            });
            // Apply the effect using EffectClass
            new EffectClass(member, effect, member, this); // Caster is member, source is skill
        });
    }

    useSkill(member) {
        // For passive skills, just apply the effect and return
        if (this.isPassive) {
            logCombatEvent('SKILL_USE_PASSIVE_TRIGGERED', {
                skillName: this.name,
                member: member.name,
            });
            this.applyPassiveEffect(member);
            return true;
        }

        logCombatEvent('SKILL_USE_ATTEMPTED', {
            skillName: this.name,
            member: member.name,
            isHero: member.isHero,
            onCooldown: this.onCooldown,
            battleStarted: battleController.battleState.battleStarted,
        });

        // Handle initial cooldown setup for non-hero skills
        if (this.type === "active" && !member.isHero && this.needsInitialCooldownKickoff) {
            if (!this.div && member.element) {
                const skillDivId = member.memberId + "Skill" + this.name.replace(/\s/g, '');
                const skillElement = member.element.querySelector("#" + skillDivId);
                if (skillElement) {
                    this.setElement(skillElement);
                }
            }

            if (this.div) {
                logCombatEvent('SKILL_INITIAL_COOLDOWN_START', {
                    skillName: this.name,
                    member: member.name,
                });
                this.startCooldown(member);
                this.updateCooldownAnimation(member);
                this.needsInitialCooldownKickoff = false;
                return true;
            }
        }

        if (this.type == "active" && battleController.battleState.battleStarted) {
            logCombatEvent('SKILL_RESOURCE_CHECK', {
                skillName: this.name,
                member: member.name,
                currentMana: member.currentMana,
                manaCost: this.manaCost,
                currentStamina: member.currentStamina,
                staminaCost: this.staminaCost,
            });

            if (this.manaCost <= member.currentMana && this.staminaCost <= member.currentStamina) {
                logCombatEvent('SKILL_CAST_SUCCESS', {
                    skillName: this.name,
                    member: member.name,
                });
                this.startCooldown(member);
                this.handleSkillCost(member);
                if (member.isHero) {
                    this.handleExpGain(member);
                }

                // Handle effect-based targeting
                let targetingCondition = null;
                if (this.effects) {
                    const dispelEffect = Array.isArray(this.effects) 
                        ? this.effects.find(e => e.id === 'dispelDebuff')
                        : (this.effects.id === 'dispelDebuff' ? this.effects : null);
                    
                    if (dispelEffect && dispelEffect.debuffType) {
                        targetingCondition = (ally) => ally.hasDebuffName(dispelEffect.debuffType);
                    }
                }

                var targets = selectTarget(member, this.targetingModes[0], targetingCondition);
                
                // Handle multiple targets for the same effect
                if (this.targetCount > 1) {
                    // If we have fewer targets than targetCount, we'll hit the same targets multiple times
                    const originalTargets = [...targets];
                    for (let i = 1; i < this.targetCount; i++) {
                        targets = targets.concat(originalTargets);
                    }
                }

                // Handle extra targets with different effects (existing functionality)
                if (this.extraTargets != undefined) {
                    this.extraTargets.forEach(mode => {
                        targets = targets.concat(selectTarget(member, mode));
                    })
                }

                logCombatEvent('SKILL_TARGETS_SELECTED', {
                    skillName: this.name,
                    member: member.name,
                    targets: targets.map(t => t.name),
                    targetCount: this.targetCount,
                    extraTargetsModes: this.extraTargets,
                });

                targets.forEach(target => {
                    member.performAttack(member, target, this);
                });
                return true;

            } else {
                logCombatEvent('SKILL_CAST_FAILED', {
                    skillName: this.name,
                    member: member.name,
                    reason: 'Insufficient Resources',
                    currentMana: member.currentMana,
                    manaCost: this.manaCost,
                    currentStamina: member.currentStamina,
                    staminaCost: this.staminaCost,
                });
                if (this.repeat && member.isHero) {
                    setTimeout(() => {
                        if (battleController.battleState.battleStarted && member.currentHealth > 0 && !this.onCooldown && this.repeat) {
                            const isSelected = globalHero && globalHero.selectedSkills.some(s => s && s.id === this.id);
                            if (isSelected) {
                                this.useSkill(member);
                            }
                        }
                    }, 1000);
                }
                return false;
            }
        }
        return false;
    }

    pause() {
        if (this.type == "active" && this.div && this.overlay && !this.overlay.classList.contains('hidden')) {
            this.overlay.classList.add('paused');
            logCombatEvent('SKILL_PAUSED', { skillName: this.name });
        }
    }

    unpause() {
        if (this.type == "active" && this.div && this.overlay && this.overlay.classList.contains('paused')) {
            this.overlay.classList.remove('paused');
            logCombatEvent('SKILL_UNPAUSED', { skillName: this.name });
        }
    }

    heroStopSkill() {
        logCombatEvent('SKILL_STOPPED_BY_HERO', { skillName: this.name });
        if (this.overlay && this.boundAnimationEndCallback) {
            this.overlay.removeEventListener('animationend', this.boundAnimationEndCallback);
            this.boundAnimationEndCallback = null;
        }
        if (this.overlay) {
            this.overlay.classList.add('hidden');
            this.overlay.style.animation = '';
            this.overlay.style.height = '0%';
            this.overlay.classList.remove('paused');
        }
        if (this.div) {
            this.div.classList.remove('disabled');
        }
        this.onCooldown = false;
        this.remainingDuration = 0;
        this.cooldownStartTime = null;
    }

    startCooldown(member) {
        this.cooldownStartTime = Date.now();
        this.remainingDuration = this.cooldown;
        this.onCooldown = true; // Mark as on cooldown
        logCombatEvent('SKILL_COOLDOWN_STARTED', {
            skillName: this.name,
            member: member.name,
            cooldownDuration: this.cooldown,
        });
        if (this.div) {
            this.updateCooldownAnimation(member);
        } else if (this.cooldown === 0) { // Handle non-visual 0 CD skills immediately
            this.finishCooldown(member, this.repeat);
        }
    }

    reduceCooldown(amount, member) {
        // Only reduce if actually on cooldown and has a remaining duration.
        if (!this.onCooldown || this.remainingDuration <= 0) {
            logCombatEvent('COOLDOWN_REDUCTION_SKIPPED', {
                skillName: this.name,
                member: member.name,
                reason: 'Not on cooldown or no remaining duration',
                currentCooldown: this.remainingDuration,
            });
            return;
        }

        const wasOnCooldownState = this.onCooldown; // Should be true here
        const oldRemainingDuration = this.remainingDuration;

        // Calculate how much time has "conceptually" passed due to the reduction
        const effectiveElapsedTimeReduction = amount;
        this.remainingDuration -= effectiveElapsedTimeReduction;

        // Adjust cooldownStartTime as if 'amount' seconds just passed instantly
        if (this.cooldownStartTime) {
            this.cooldownStartTime += amount * 1000;
        }

        logCombatEvent('SKILL_COOLDOWN_REDUCED', {
            skillName: this.name,
            member: member.name,
            reductionAmount: amount,
            oldRemainingDuration: oldRemainingDuration,
            newRemainingDuration: this.remainingDuration,
        });

        if (this.remainingDuration <= 0) {
            this.remainingDuration = 0;
            // Let finishCooldown handle setting onCooldown to false
            this.finishCooldown(member, this.repeat && wasOnCooldownState);
        } else {
            // If still on cooldown, update visuals
            if (this.div) {
                this.updateCooldownAnimation(member);
            }
        }
    }

    updateCooldownAnimation(member) {
        if (!this.div) return;

        this.overlay = this.div.querySelector(".cooldown-overlay");
        if (!this.overlay) {
            console.warn(`[Skill ${this.name}] No cooldown overlay found for ${member.name}`);
            return;
        }

        if (this.boundAnimationEndCallback) {
            this.overlay.removeEventListener('animationend', this.boundAnimationEndCallback);
            this.boundAnimationEndCallback = null;
        }

        this.overlay.style.animation = '';
        this.overlay.classList.remove('hidden', 'paused');
        this.overlay.offsetHeight; // Force reflow

        if (!this.onCooldown || this.remainingDuration <= 0) {
            logCombatEvent('COOLDOWN_ANIMATION_SKIPPED', {
                skillName: this.name,
                member: member.name,
                reason: 'Not on cooldown or duration <= 0',
                onCooldown: this.onCooldown,
                remainingDuration: this.remainingDuration,
            });
            this.finishCooldown(member, false);
            return;
        }

        this.boundAnimationEndCallback = () => {
            this.finishCooldown(member, this.repeat && this.onCooldown);
        };
        this.overlay.addEventListener('animationend', this.boundAnimationEndCallback, { once: true });

        this.div.classList.add('disabled');
        
        const remainingPercentage = Math.max(0, (this.remainingDuration / this.cooldown) * 100);
        this.overlay.style.height = `${remainingPercentage}%`;

        this.overlay.offsetHeight;

        if (this.remainingDuration > 0) {
            this.overlay.style.animation = `fill ${this.remainingDuration}s linear forwards`;
            logCombatEvent('COOLDOWN_ANIMATION_STARTED', {
                skillName: this.name,
                member: member.name,
                duration: this.remainingDuration,
                initialPercentage: remainingPercentage,
            });
        } else {
            this.finishCooldown(member, false);
        }
    }

    finishCooldown(member, shouldAttemptRepeat = false) {
        logCombatEvent('SKILL_COOLDOWN_FINISHED', {
            skillName: this.name,
            member: member.name,
            wasOnCooldown: this.onCooldown,
            shouldAttemptRepeat: shouldAttemptRepeat,
            battleStarted: battleController.battleState.battleStarted,
            memberHealth: member.currentHealth,
        });

        const wasTrulyOnCooldown = this.onCooldown;

        if (this.overlay && this.boundAnimationEndCallback) {
            this.overlay.removeEventListener('animationend', this.boundAnimationEndCallback);
            this.boundAnimationEndCallback = null;
        }

        this.remainingDuration = 0;
        this.cooldownStartTime = null;
        this.onCooldown = false;

        if (this.overlay) {
           this.overlay.classList.add('hidden');
           this.overlay.style.animation = '';
           this.overlay.style.height = '0%';
           this.overlay.classList.remove('paused');
        }
        if (this.div) {
            this.div.classList.remove('disabled');
        }

        if (shouldAttemptRepeat && wasTrulyOnCooldown &&
            battleController.battleState.battleStarted && member && member.currentHealth > 0) {

            let canUse = false;
            if (member.isHero) {
                const heroInstance = globalHero;
                if (heroInstance && heroInstance.selectedSkills) {
                    canUse = heroInstance.selectedSkills.some(s => s && s.id === this.id);
                }
            } else {
                canUse = this.manaCost <= member.currentMana && this.staminaCost <= member.currentStamina;
            }

            logCombatEvent('SKILL_REPEAT_ATTEMPT', {
                skillName: this.name,
                member: member.name,
                canUseImmediately: canUse,
                isHero: member.isHero,
                hasResources: this.manaCost <= member.currentMana && this.staminaCost <= member.currentStamina,
            });

            if (canUse) {
                if (!member.isHero && this.needsInitialCooldownKickoff) {
                    this.needsInitialCooldownKickoff = false;
                    this.useSkill(member);
                } else {
                    this.useSkill(member);
                }
            } else if (this.repeat) {
                const retrySkill = (retryCount = 0) => {
                    if (battleController.battleState.battleStarted && member.currentHealth > 0 && !this.onCooldown && this.repeat) {
                        let canUseRetry = false;
                        if (member.isHero) {
                            const heroInstance = globalHero;
                            if (heroInstance && heroInstance.selectedSkills) {
                                canUseRetry = heroInstance.selectedSkills.some(s => s && s.id === this.id);
                            }
                        } else {
                            canUseRetry = this.manaCost <= member.currentMana && this.staminaCost <= member.currentStamina;
                        }

                        if (canUseRetry) {
                            logCombatEvent('SKILL_RETRY_SUCCESS', {
                                skillName: this.name,
                                member: member.name,
                                retryCount: retryCount,
                            });
                            this.useSkill(member);
                        } else if (retryCount < 5) {
                            logCombatEvent('SKILL_RETRY_FAILED', {
                                skillName: this.name,
                                member: member.name,
                                retryCount: retryCount,
                                reason: 'Resources still insufficient',
                            });
                            const delay = Math.min(1000 * (retryCount + 1), 5000);
                            setTimeout(() => retrySkill(retryCount + 1), delay);
                        } else {
                             logCombatEvent('SKILL_RETRY_ABORTED', {
                                skillName: this.name,
                                member: member.name,
                                retryCount: retryCount,
                                reason: 'Max retries reached',
                            });
                        }
                    } else {
                        logCombatEvent('SKILL_RETRY_ABORTED', {
                            skillName: this.name,
                            member: member.name,
                            reason: 'Battle ended, member dead, or skill no longer repeatable/on cooldown',
                        });
                    }
                };

                setTimeout(() => retrySkill(0), 1000);
            }
        } else {
            logCombatEvent('SKILL_REPEAT_SKIPPED', {
                skillName: this.name,
                member: member.name,
                reason: 'Conditions not met for repeat attempt',
                shouldAttemptRepeat: shouldAttemptRepeat,
                wasTrulyOnCooldown: wasTrulyOnCooldown,
                battleStarted: battleController.battleState.battleStarted,
                memberHealth: member.currentHealth,
            });
        }
    }

    applySavedState(data) {
        this.level = data.level || 1;
        this.experience = data.experience || 0;
        this.experienceToNextLevel = data.experienceToNextLevel || 100;
        this.baseDamage = data.baseDamage || this.baseDamage;
        // Only set repeat if it exists in the data, otherwise keep the default value
        if (data.hasOwnProperty('repeat')) {
            this.repeat = data.repeat;
        }
        logCombatEvent('SKILL_STATE_RESTORED', {
            skillName: this.name,
            level: this.level,
            experience: this.experience,
            repeat: this.repeat
        });
    }
}

export default Skill;