import {mobsClasses, renderTeamMembers, hero, battleStatistics} from './initialize.js';
import Member from './Member.js'
import {deepCopy} from './Render.js';

class EffectClass {
    constructor(target, effect) {
        this.effect = deepCopy(effect);
        this.target = target;
        this.originalValue = 0;
        this.timer = null;
        this.startTime = null;
        this.remainingTime = null;
        this.render = true;
        this.isPassive = effect.duration === -1;
        this.isPaused = false;
        this.pauseStartTime = null;

        // Add this effect to the target's effects array
        this.target.effects.push(this);

        if (this.isPassive) {
            // For passive effects, just apply and don't set up timers
            this.applyEffect(effect);
            if (this.render) {
                this.renderBuff();
                this.updateTooltip();
            }
        } else if (effect.stackMode == "duration" && this.isAlreadyApplied(effect, target)) {
            this.extendTimer(effect.duration);
        } else if (effect.stackMode == "refresh" && this.isAlreadyApplied(effect, target)) {
            this.refreshTimer();
        } else {
            this.applyEffect(effect);
            if (this.render) {
                this.renderBuff();
                this.startTimer();
                this.startTooltipTimer();
            }
        }
    }

    renderBuff() {
        this.element = document.createElement('div');
        var icon = document.createElement('img');
        icon.src = this.effect.icon;
        this.element.classList.add(this.effect.type);
        this.tooltip = document.createElement('div'); // Create tooltip element
        this.tooltip.classList.add('effectTooltip'); // Add tooltip class

        this.element.appendChild(icon);
        this.element.appendChild(this.tooltip);
        document.querySelector(`#${this.target.memberId} .effects`).appendChild(this.element);

    }

    startTimer() {
        if (this.isPassive || this.isPaused) return;
        
        this.startTime = Date.now();
        this.timer = setTimeout(() => {
            this.remove();
        }, this.effect.duration * 1000);

        this.updateTooltip();
    }

    getTimeLeft() {
        if (this.timer === null || this.isPassive) {
            return 0;
        }
        const elapsed = (Date.now() - this.startTime) / 1000;
        const timeLeft = this.effect.duration - elapsed;
        return timeLeft > 0 ? timeLeft : 0;
    }

    extendTimer(additionalTime) {
        var otherEffect = this.getAlreadyApplied(this.effect, this.target);
        const timeLeft = otherEffect.getTimeLeft();

        otherEffect.effect.duration = timeLeft + additionalTime; // Add the additional time
        otherEffect.startTime = Date.now(); // Reset the start time
        otherEffect.setTimer(otherEffect.effect.duration); // Restart the timer with the new duration
        otherEffect.updateTooltip(); // Update the tooltip
    }

    refreshTimer() {
        var otherEffect = this.getAlreadyApplied(this.effect, this.target);
        otherEffect.startTime = Date.now(); // Reset the start time
        otherEffect.setTimer(otherEffect.effect.duration); // Restart the timer with the new duration
        otherEffect.updateTooltip(); // Update the tooltip
    }

    setTimer(duration) {
        if (this.timer !== null) {
            clearTimeout(this.timer);
        }

        this.timer = setTimeout(() => {
            this.remove();
        }, duration * 1000); // Convert duration to milliseconds
    }

    isAlreadyApplied(effect, target) {
        const existingEffect = target.effects.find(e => e.effect.name === effect.name);
        return existingEffect !== undefined;
    }

    getAlreadyApplied(effect, target) {
        const existingEffect = target.effects.find(e => e.effect.name === effect.name);
        return existingEffect;
    }

    startTooltipTimer() {
        if (this.isPassive || this.isPaused) return;
        
        this.timerInterval = setInterval(() => {
            this.updateTooltip();
        }, 1000);
    }

    applyEffect(effect) {
        switch (this.effect.subType) {
            case 'modifiers':
                // Store original stats for later reversion
                this.originalStats = {};
                this.effect.modifiers.forEach(modifier => {
                    // Store original value
                    this.originalStats[modifier.stat] = this.target.stats[modifier.stat];
                    
                    // Apply modifier
                    if (modifier.flat) {
                        this.target.stats[modifier.stat] += modifier.flat;
                    }
                    if (modifier.percentage) {
                        this.target.stats[modifier.stat] *= (1 + modifier.percentage / 100);
                    }
                });
                break;
            case 'Barrier':
                this.target.barrier = this.value;
                break;
            case 'Blind':
                // Logic for Blind effect
                break;
            case 'Blight':
                this.createBlightInterval(this.value);
                break;
            case 'DoT':
                // Track max bleed stacks if applicable
                if (this.effect.subType === 'Bleed') {
                    const currentBleedStacks = this.target.effects.filter(e => e.effect.subType === 'Bleed').length;
                    battleStatistics.updateMaxBleedStacks(currentBleedStacks);
                }
                this.createDamageOverTimeInterval(this.effect.value, this.effect.damageType, this.target);
                break;
            case 'stealth':
                // Store original stats for later reversion
                this.originalStats = {
                    damage: this.target.stats.damage,
                    critChance: this.target.stats.critChance
                };
                // Apply stealth bonuses
                this.target.stats.damage *= 1.25; // 25% damage increase
                this.target.stats.critChance += 10; // 10% crit chance increase
                break;
            case 'distracted':
                // Store original stats for later reversion
                this.originalStats = {
                    accuracy: this.target.stats.accuracy,
                    critResistance: this.target.stats.critResistance
                };
                break;
            case 'Charm':
                // Logic for Charm effect
                break;
            case 'Clone':
                // Logic for Clone effect
                break;
            case 'Confusion':
                // Logic for Confusion effect
                break;
            case 'Corrupt':
                this.corruptInterval = setInterval(() => {
                    this.target.stats.strength -= 1;
                    this.target.stats.speed -= 1;
                    this.target.stats.dexterity -= 1;
                    this.target.stats.health -= 1;
                }, 1000);
                break;
            case 'Curse':
                // Logic for Curse effect
                break;
            case 'Disarm':
                this.target.disarmed = true;
                break;
            case 'Enrage':
                this.target.stats.strength += this.value;
                this.target.stats.dodge -= this.value;
                break;
            case 'Entrap':
                this.target.entrap = true;
                break;
            case 'Fear':
                if (Math.random() < this.effect.chance) {
                    this.target.stopSkills();
                }
                break;
            case 'flatChange':
                this.target.stats[this.effect.stat] += this.effect.value;
                console.log("Applied flat change on " + this.effect.stat + ". New value: " + this.target.stats[this.effect.stat]);
                break;
            case 'heal':
                this.target.healDamage(this.effect.value);
                break;
            case 'Hex':
                // Logic for Hex effect
                break;
            case 'Hexproof':
                this.target.hexproof = true;
                break;
            case 'decreaseCooldown':
                this.render = false;
                this.target.skills.forEach(skill => {
                    if (skill.onCooldown) {
                        if (skill.effects != undefined && skill.effects.subType == 'decreaseCooldown') {
                        } else {
                            console.log("Decreasing cooldown on skill: " + skill.name);
                            skill.reduceCooldown(this.effect.value, this.target);
                        }
                    } else {
                        console.log(skill.name + " is not on cooldown");
                    }
                });
                break;
            case 'Invisibility':
                this.target.invisible = true;
                break;
            case 'Life Drain':
                this.createLifeDrainInterval(this.value);
                break;
            case 'Lifesteal':
                this.target.lifesteal = this.value;
                break;
            case 'Mana Burn':
                // Logic for Mana Burn effect
                break;
            case 'Mana Drain':
                this.createManaDrainInterval(this.value);
                break;
            case 'Mark':
                this.target.marked = true;
                break;
            case 'Paralyze':
                // Logic for Paralyze effect
                break;
            case 'Petrify':
                // Logic for Petrif effect
                break;
            case 'percentChange':
                this.target.stats[this.effect.stat] += this.effect.value * this.target.stats[this.effect.stat] / 100;
                console.log("applied percentage change on " + this.effect.stat + ". New value: " + this.target.stats[this.effect.stat]);
                break;
            case 'Purify':
                this.removeNegativeEffects();
                break;
            case 'Regen':
                this.createHealOverTimeInterval(this.effect.value, this.target);
                break;
            case 'Reflect':
                this.target.reflect = this.value;
                break;
            case 'Silence':
                // Logic for Silence effect
                break;
            case 'Sleep':
                // Logic for Sleep effect
                break;
            case 'summon':
                this.summon(this.target, this.effect.who, this.effect.limit);
                break;
            case 'Stun':
                this.target.stopSkills();
                break;
            case 'Taunt':
                // Logic for Taunt effect
                if (this.effect.forceTarget) {
                    this.target.forcedTarget = this.effect.forceTarget;
                }
                break;
            case 'delayedDamage':
                this.originalValue = this.effect.value;
                if (hero.equipment.amuletSlot && hero.equipment.amuletSlot.id === 'mistwalkerAmulet') {
                    console.log(`${this.target.name} is protected by the Mistwalker Amulet`);
                    this.render = false;
                    return;
                }
                break;

            // New effect types from filtered_effects.json
            case 'increaseDamageFlat':
                this.target.stats.damage += this.effect.value;
                break;

            case 'applyBuff':
                if (this.effect.buffId) {
                    // Store original stats for later reversion
                    this.originalStats = {};
                    if (this.effect.modifiers) {
                        this.effect.modifiers.forEach(modifier => {
                            this.originalStats[modifier.stat] = this.target.stats[modifier.stat];
                            if (modifier.flat) {
                                this.target.stats[modifier.stat] += modifier.flat;
                            }
                            if (modifier.percentage) {
                                this.target.stats[modifier.stat] *= (1 + modifier.percentage / 100);
                            }
                        });
                    }
                }
                break;

            case 'increaseAccuracy':
                this.target.stats.accuracy += this.effect.value;
                break;

            case 'increaseDodgePercentage':
                this.target.stats.dodge += this.effect.value;
                break;

            case 'reduceAccuracyFlat':
                this.target.stats.accuracy += this.effect.value;
                break;

            case 'lightningDoT':
                this.createDamageOverTimeInterval(this.effect.damagePerTurn, 'Lightning', this.target);
                break;

            case 'increaseDamageTakenType':
                // Store original resistance for later reversion
                this.originalStats = {
                    resistance: this.target.stats[`${this.effect.damageType.toLowerCase()}Resistance`]
                };
                this.target.stats[`${this.effect.damageType.toLowerCase()}Resistance`] -= this.effect.value;
                break;

            case 'areaStun':
                if (Math.random() < this.effect.chance) {
                    this.target.stopSkills();
                }
                break;

            case 'applyShockedAccuracyDebuff':
                this.target.stats.accuracy += this.effect.value;
                break;

            case 'empowerNextSpellCritDamage':
                this.target.nextSpellCritChance = 1.0;
                this.target.nextSpellDamageMultiplier = 1 + (this.effect.damageBonusPercentage / 100);
                this.target.nextSpellManaCostMultiplier = 1 + (this.effect.manaCostIncreasePercentage / 100);
                break;

            case 'increaseManaRegenFlat':
                this.target.stats.manaRegen += this.effect.value;
                break;

            case 'increaseDamageTakenPercentage':
                this.target.stats.damageTakenMultiplier = (this.target.stats.damageTakenMultiplier || 1) * (1 + this.effect.value / 100);
                break;

            case 'scaldAccuracyDebuff':
                this.target.stats.accuracy += this.effect.debuffValue;
                this.createDamageOverTimeInterval(this.effect.damagePerTurn, 'Fire', this.target);
                break;

            case 'createAreaEffect':
                console.log(`createAreaEffect not implemented - requires zone system`);
                break;

            case 'knockUp':
                console.log(`knockUp not implemented - requires positioning system`);
                break;

            case 'applyStrongScaldDoT':
                this.createDamageOverTimeInterval(this.effect.damagePerTurn, 'Fire', this.target);
                break;

            case 'disorientAccuracyDebuff':
                this.target.stats.accuracy += this.effect.value;
                break;

            case 'delayedBlastOnFireHit':
                console.log(`delayedBlastOnFireHit not implemented - requires damage system`);
                break;

            case 'increaseResistance':
                this.target.stats[`${this.effect.damageType.toLowerCase()}Resistance`] += this.effect.value;
                break;

            case 'areaPull':
                console.log(`areaPull not implemented - requires positioning system`);
                break;

            case 'placeTrapRune':
                console.log(`placeTrapRune not implemented - requires trap system`);
                break;

            case 'applyDelayedDamageDebuff':
                console.log(`applyDelayedDamageDebuff not implemented - requires damage system`);
                break;

            case 'placeTrapRuneField':
                console.log(`placeTrapRuneField not implemented - requires trap system`);
                break;

            case 'increaseEffectChance':
                console.log(`increaseEffectChance not implemented - requires effect system`);
                break;

            case 'createWallEffect':
                console.log(`createWallEffect not implemented - requires wall system`);
                break;

            case 'chainEffect':
                console.log(`chainEffect not implemented - requires chain system`);
                break;

            case 'pulsingAoeSelf':
                console.log(`pulsingAoeSelf not implemented - requires AoE system`);
                break;

            case 'increaseMagicPowerPercentage':
                this.target.stats.magicPower *= (1 + this.effect.value / 100);
                break;

            case 'reduceManaCostPercentage':
                this.target.stats.manaCostMultiplier = (this.target.stats.manaCostMultiplier || 1) * (1 - this.effect.value / 100);
                break;

            case 'empowerPlacedRunes':
                console.log(`empowerPlacedRunes not implemented - requires rune system`);
                break;

            case 'bloodCurseDoT':
                this.createDamageOverTimeInterval(this.effect.damagePerTurn, 'Shadow', this.target);
                break;

            case 'aoeDamageHealthScaled':
                console.log(`aoeDamageHealthScaled not implemented - requires AoE system`);
                break;

            case 'empowerNextFireSpellLifesteal':
                this.target.nextFireSpellLifesteal = this.effect.lifestealPercentage / 100;
                this.target.nextFireSpellDamageMultiplier = 1 + (this.effect.damageBonusPercentage / 100);
                break;

            case 'explodeOnDeathHealCaster':
                console.log(`explodeOnDeathHealCaster not implemented - requires death system`);
                break;

            case 'rampingFireDoTExplodeOnDeath':
                this.createDamageOverTimeInterval(this.effect.initialDamagePerTurn, 'Fire', this.target);
                // Implementation for ramping damage and explosion
                break;

            case 'temporaryInvulnerability':
                this.target.invulnerable = true;
                break;

            case 'lifestealAura':
                this.target.lifesteal = this.effect.lifestealPercentage / 100;
                break;

            case 'secondaryDamage':
                this.target.takeDamage(this.effect.damage, this.effect.damageType);
                break;

            case 'manaSteal':
                if (Math.random() < this.effect.chance) {
                    this.target.stats.mana -= this.effect.value;
                }
                break;

            case 'summonMinion':
                this.summon(this.target, this.effect.minionId, this.effect.count);
                break;

            case 'secondaryDamagePerTick':
                this.createDamageOverTimeInterval(this.effect.damage, this.effect.damageType, this.target);
                break;

            case 'reduceHealingReceived':
                this.target.stats.healingReceivedMultiplier = (this.target.stats.healingReceivedMultiplier || 1) * (1 - this.effect.value / 100);
                break;

            case 'buffOnKill':
                console.log(`buffOnKill not implemented - requires kill system`);
                break;

            case 'summonMinionFromCorpse':
                console.log(`summonMinionFromCorpse not implemented - requires corpse system`);
                break;

            case 'reduceResistanceType':
                this.target.stats[`${this.effect.damageType.toLowerCase()}Resistance`] += this.effect.value;
                break;

            case 'secondaryPulsingAoeSelf':
                console.log(`secondaryPulsingAoeSelf not implemented - requires AoE system`);
                break;

            case 'healOverTimeSelf':
                this.createHealOverTimeInterval(this.effect.healPerTick, this.target);
                break;

            case 'buffMinionsInAura':
                console.log(`buffMinionsInAura not implemented - requires minion system`);
                break;

            case 'applyDebuff':
                if (this.effect.forceTarget) {
                    this.target.forcedTarget = this.effect.forceTarget;
                }
                break;

            case 'increaseThreat':
                this.target.threat += this.effect.value;
                break;

            case 'restoreResource':
                if (this.effect.resourceType === 'mana') {
                    this.target.stats.mana += this.effect.value;
                }
                break;

            case 'dispelDebuff':
                console.log(`dispelDebuff not implemented - requires debuff system`);
                break;

            case 'applyDebuffToType':
                console.log(`applyDebuffToType not implemented - requires type system`);
                break;

            case 'bonusDamageVsType':
                console.log(`bonusDamageVsType not implemented - requires type system`);
                break;

            case 'increaseCritChanceSelf':
                this.target.stats.critChance += this.effect.value;
                break;

            case 'areaDamageOnHit':
                console.log(`areaDamageOnHit not implemented - requires AoE system`);
                break;

            case 'knockback':
                console.log(`knockback not implemented - requires positioning system`);
                break;

            case 'restoreResourcesOnMarkedTargetDeath':
                console.log(`restoreResourcesOnMarkedTargetDeath not implemented - requires death system`);
                break;

            case 'createGroundEffect':
                console.log(`createGroundEffect not implemented - requires ground effect system`);
                break;

            case 'areaDamage':
                console.log(`areaDamage not implemented - requires AoE system`);
                break;

            case 'applyBuffToTarget':
                if (this.effect.modifiers) {
                    this.originalStats = {};
                    this.effect.modifiers.forEach(modifier => {
                        this.originalStats[modifier.stat] = this.target.stats[modifier.stat];
                        if (modifier.flat) {
                            this.target.stats[modifier.stat] += modifier.flat;
                        }
                        if (modifier.percentage) {
                            this.target.stats[modifier.stat] *= (1 + modifier.percentage / 100);
                        }
                    });
                }
                break;

            case 'applyBuffToAreaAllies':
                console.log(`applyBuffToAreaAllies not implemented - requires ally system`);
                break;

            case 'healOverTime':
                this.createHealOverTimeInterval(this.effect.healPerTick, this.target);
                break;

            case 'applyAura':
                console.log(`applyAura not implemented - requires aura system`);
                break;

            case 'revealStealth':
                console.log(`revealStealth not implemented - requires stealth system`);
                break;

            case 'cleaveOnKill':
                console.log(`cleaveOnKill not implemented - requires kill system`);
                break;

            case 'applyBuffOnParry':
                if (this.effect.modifiers) {
                    this.originalStats = {};
                    this.effect.modifiers.forEach(modifier => {
                        this.originalStats[modifier.stat] = this.target.stats[modifier.stat];
                        if (modifier.flat) {
                            this.target.stats[modifier.stat] += modifier.flat;
                        }
                        if (modifier.percentage) {
                            this.target.stats[modifier.stat] *= (1 + modifier.percentage / 100);
                        }
                    });
                }
                break;

            case 'allyTeamUpAttack':
                console.log(`allyTeamUpAttack not implemented - requires ally system`);
                break;

            case 'counterAttack':
                console.log(`counterAttack not implemented - requires attack system`);
                break;

            case 'increaseDodgeFlatOnHit':
                this.target.stats.dodge += this.effect.value;
                break;

            case 'applyBuffToSelfVsTarget':
                if (this.effect.modifiers) {
                    this.originalStats = {};
                    this.effect.modifiers.forEach(modifier => {
                        this.originalStats[modifier.stat] = this.target.stats[modifier.stat];
                        if (modifier.flat) {
                            this.target.stats[modifier.stat] += modifier.flat;
                        }
                        if (modifier.percentage) {
                            this.target.stats[modifier.stat] *= (1 + modifier.percentage / 100);
                        }
                    });
                }
                break;

            case 'damageSelf':
                console.log(`damageSelf not implemented - requires damage system`);
                break;

            case 'ignoreBlockParry':
                this.target.ignoreBlockParry = true;
                break;

            case 'armorPenetration':
                this.target.stats.armorPenetration = (this.target.stats.armorPenetration || 0) + this.effect.percentage;
                break;

            case 'consumeDebuffForBonus':
                console.log(`consumeDebuffForBonus not implemented - requires debuff system`);
                break;

            case 'applyShield':
                this.target.shield = this.effect.shieldHealth;
                break;

            case 'revealStealthArea':
                console.log(`revealStealthArea not implemented - requires stealth system`);
                break;

            case 'freeze':
                if (Math.random() < this.effect.chance) {
                    this.target.stopSkills();
                }
                break;

            case 'knockbackArea':
                console.log(`knockbackArea not implemented - requires positioning system`);
                break;

            case 'knockbackLine':
                console.log(`knockbackLine not implemented - requires positioning system`);
                break;

            case 'applyBuffToMinion':
                console.log(`applyBuffToMinion not implemented - requires minion system`);
                break;

            case 'dismissMinion':
                console.log(`dismissMinion not implemented - requires minion system`);
                break;

            case 'summonMinionConditional':
                console.log(`summonMinionConditional not implemented - requires minion system`);
                break;

            case 'directMinionTarget':
                console.log(`directMinionTarget not implemented - requires minion system`);
                break;

            case 'sacrificeMinion':
                console.log(`sacrificeMinion not implemented - requires minion system`);
                break;

            case 'swapPositionRandom':
                console.log(`swapPositionRandom not implemented - requires positioning system`);
                break;

            case 'stealBuff':
                console.log(`stealBuff not implemented - requires buff system`);
                break;

            case 'dispelMagicTargeted':
                console.log(`dispelMagicTargeted not implemented - requires magic system`);
                break;

            case 'silence':
                this.target.silenced = true;
                break;

            case 'teleportAndAttack':
                console.log(`teleportAndAttack not implemented - requires positioning system`);
                break;

            case 'consumeBleedForDamageAndRefresh':
                console.log(`consumeBleedForDamageAndRefresh not implemented - requires bleed system`);
                break;

            case 'triggerAllBleedDamageInstantly':
                console.log(`triggerAllBleedDamageInstantly not implemented - requires bleed system`);
                break;

            case 'splashEffect':
                console.log(`splashEffect not implemented - requires splash system`);
                break;

            case 'teleportToGroundTarget':
                console.log(`teleportToGroundTarget not implemented - requires positioning system`);
                break;

            case 'applyDebuffToAreaEnemiesAtOrigin':
                console.log(`applyDebuffToAreaEnemiesAtOrigin not implemented - requires debuff system`);
                break;

            case 'moveSelf':
                console.log(`moveSelf not implemented - requires positioning system`);
                break;

            case 'bleedConditional':
                this.createDamageOverTimeInterval(this.effect.baseDamagePerTurn, 'Physical', this.target);
                break;

            case 'maintainStealth':
                console.log(`maintainStealth not implemented - requires stealth system`);
                break;

            case 'applyBuffSelfOnHit':
                if (this.effect.modifiers) {
                    this.originalStats = {};
                    this.effect.modifiers.forEach(modifier => {
                        this.originalStats[modifier.stat] = this.target.stats[modifier.stat];
                        if (modifier.flat) {
                            this.target.stats[modifier.stat] += modifier.flat;
                        }
                        if (modifier.percentage) {
                            this.target.stats[modifier.stat] *= (1 + modifier.percentage / 100);
                        }
                    });
                }
                break;

            case 'areaDamageAtOrigin':
                console.log(`areaDamageAtOrigin not implemented - requires AoE system`);
                break;

            case 'increaseCritChanceOnCrit':
                this.target.stats.critChance += this.effect.value;
                break;

            case 'guaranteedCrit':
                this.target.stats.critChance = 100;
                break;

            case 'increaseMovementSpeed':
                this.target.stats.speed *= (1 + this.effect.percentage / 100);
                break;

            case 'summonPet':
                console.log(`summonPet not implemented - requires pet system`);
                break;

            case 'summonTemporaryPets':
                console.log(`summonTemporaryPets not implemented - requires pet system`);
                break;

            case 'damagePerDotStack':
                console.log(`damagePerDotStack not implemented - requires DoT system`);
                break;

            case 'consolidateBleeds':
                console.log(`consolidateBleeds not implemented - requires bleed system`);
                break;

            case 'rampingPoisonDoT':
                this.createDamageOverTimeInterval(this.effect.initialDamagePerTurn, 'Poison', this.target);
                break;

            case 'applyDebuffToTarget':
                if (this.effect.modifiers) {
                    this.originalStats = {};
                    this.effect.modifiers.forEach(modifier => {
                        this.originalStats[modifier.stat] = this.target.stats[modifier.stat];
                        if (modifier.flat) {
                            this.target.stats[modifier.stat] += modifier.flat;
                        }
                        if (modifier.percentage) {
                            this.target.stats[modifier.stat] *= (1 + modifier.percentage / 100);
                        }
                    });
                }
                break;

            case 'applyBuffSelf':
                if (this.effect.guaranteedDodgeNextAttack) {
                    this.target.guaranteedDodge = true;
                }
                break;

            case 'summonPetAtLocation':
                console.log(`summonPetAtLocation not implemented - requires pet system`);
                break;

            case 'damageBonusBasedOnMissingHealth':
                console.log(`damageBonusBasedOnMissingHealth not implemented - requires damage system`);
                break;

            case 'increaseAttackSpeedOnHit':
                this.target.stats.attackSpeed *= (1 + this.effect.percentage / 100);
                break;

            case 'recoilDamage':
                console.log(`recoilDamage not implemented - requires damage system`);
                break;

            case 'healOnKill':
                console.log(`healOnKill not implemented - requires kill system`);
                break;

            case 'fearArea':
                console.log(`fearArea not implemented - requires fear system`);
                break;

            case 'increaseDamagePercentageSelf':
                this.target.stats.damage *= (1 + this.effect.value / 100);
                break;

            case 'applyShieldToSelf':
                this.target.shield = this.effect.shieldHealth;
                break;

            case 'dispelAllDebuffs':
                console.log(`dispelAllDebuffs not implemented - requires debuff system`);
                break;

            case 'increaseMaxHealthPercentageTemp':
                this.target.stats.maxHealth *= (1 + this.effect.value / 100);
                break;

            case 'instantKill':
                console.log(`instantKill not implemented - requires kill system`);
                break;

            case 'resetAllCooldownsOnMarkedTargetDeath':
                console.log(`resetAllCooldownsOnMarkedTargetDeath not implemented - requires cooldown system`);
                break;

            case 'ignoreDodgeParry':
                this.target.ignoreDodgeParry = true;
                break;

            case 'applyDebuffToSelf':
                if (this.effect.modifiers) {
                    this.originalStats = {};
                    this.effect.modifiers.forEach(modifier => {
                        this.originalStats[modifier.stat] = this.target.stats[modifier.stat];
                        if (modifier.flat) {
                            this.target.stats[modifier.stat] += modifier.flat;
                        }
                        if (modifier.percentage) {
                            this.target.stats[modifier.stat] *= (1 + modifier.percentage / 100);
                        }
                    });
                }
                break;

            case 'cleaveDamage':
                console.log(`cleaveDamage not implemented - requires damage system`);
                break;

            case 'stackingDamageBuffOnConsecutiveUse':
                console.log(`stackingDamageBuffOnConsecutiveUse not implemented - requires buff system`);
                break;

            case 'applyBuffSelfOnUse':
                if (this.effect.modifiers) {
                    this.originalStats = {};
                    this.effect.modifiers.forEach(modifier => {
                        this.originalStats[modifier.stat] = this.target.stats[modifier.stat];
                        if (modifier.flat) {
                            this.target.stats[modifier.stat] += modifier.flat;
                        }
                        if (modifier.percentage) {
                            this.target.stats[modifier.stat] *= (1 + modifier.percentage / 100);
                        }
                    });
                }
                break;

            case 'applyBuffToAllies':
                console.log(`applyBuffToAllies not implemented - requires ally system`);
                break;

            case 'grantTempHealthToAllies':
                console.log(`grantTempHealthToAllies not implemented - requires ally system`);
                break;

            case 'triggerAllyBasicAttack':
                console.log(`triggerAllyBasicAttack not implemented - requires ally system`);
                break;

            case 'interceptNextAttack':
                console.log(`interceptNextAttack not implemented - requires attack system`);
                break;

            case 'increaseBlockChanceSelf':
                this.target.stats.blockChance += this.effect.value;
                break;

            case 'interrupt':
                console.log(`interrupt not implemented - requires interrupt system`);
                break;

            case 'knockdown':
                if (Math.random() < this.effect.chance) {
                    this.target.stopSkills();
                }
                break;

            case 'applyBuffToAlly':
                console.log(`applyBuffToAlly not implemented - requires ally system`);
                break;

            case 'unstoppableDuringCharge':
                this.target.unstoppable = true;
                break;

            case 'triggerAllyAttackWithBuff':
                console.log(`triggerAllyAttackWithBuff not implemented - requires ally system`);
                break;

            case 'grantChoiceBuff':
                console.log(`grantChoiceBuff not implemented - requires buff system`);
                break;

            case 'tauntAllEnemies':
                console.log(`tauntAllEnemies not implemented - requires taunt system`);
                break;

            case 'damageBonusPerTargetHit':
                console.log(`damageBonusPerTargetHit not implemented - requires damage system`);
                break;

            case 'root':
                this.target.rooted = true;
                break;

            case 'increaseBlockChancePerTargetHit':
                this.target.stats.blockChance += this.effect.value;
                break;

            case 'damageBonusBasedOnTargetMaxHealth':
                console.log(`damageBonusBasedOnTargetMaxHealth not implemented - requires damage system`);
                break;

            case 'restoreResourceOnKill':
                console.log(`restoreResourceOnKill not implemented - requires resource system`);
                break;

            case 'applyBuffOnKill':
                console.log(`applyBuffOnKill not implemented - requires buff system`);
                break;

            case 'extendDurationOnKill':
                console.log(`extendDurationOnKill not implemented - requires duration system`);
                break;

            case 'healAndBuffOnKill':
                console.log(`healAndBuffOnKill not implemented - requires heal and buff system`);
                break;

            case 'fear':
                if (Math.random() < this.effect.chance) {
                    // Implementation depends on your fear system
                }
                break;

            case 'areaStunOnHit':
                console.log(`areaStunOnHit not implemented - requires stun system`);
                break;

            case 'auraEffect':
                console.log(`auraEffect not implemented - requires aura system`);
                break;

            case 'applyBuffToAreaAlliesAtDestination':
                console.log(`applyBuffToAreaAlliesAtDestination not implemented - requires ally system`);
                break;

            case 'applyBuffToRow':
                console.log(`applyBuffToRow not implemented - requires row system`);
                break;

            case 'areaDebuffOnHit':
                console.log(`areaDebuffOnHit not implemented - requires debuff system`);
                break;

            case 'secondaryAreaDamage':
                console.log(`secondaryAreaDamage not implemented - requires AoE system`);
                break;

            case 'dispelDebuffOnHit':
                console.log(`dispelDebuffOnHit not implemented - requires debuff system`);
                break;

            case 'createAura':
                console.log(`createAura not implemented - requires aura system`);
                break;

            case 'createSpreadingZone':
                console.log(`createSpreadingZone not implemented - requires zone system`);
                break;

            case 'chainToAllyAndHeal':
                console.log(`chainToAllyAndHeal not implemented - requires ally system`);
                break;

            case 'smartTargetDamage':
                console.log(`smartTargetDamage not implemented - requires targeting system`);
                break;

            case 'smartTargetHeal':
                console.log(`smartTargetHeal not implemented - requires targeting system`);
                break;

            case 'healthTransfer':
                console.log(`healthTransfer not implemented - requires health system`);
                break;

            case 'areaDamageOnTarget':
                console.log(`areaDamageOnTarget not implemented - requires AoE system`);
                break;

            case 'commandMinionToUseSpecialAbility':
                console.log(`commandMinionToUseSpecialAbility not implemented - requires minion system`);
                break;

            case 'healAllMinions':
                console.log(`healAllMinions not implemented - requires minion system`);
                break;

            case 'applyBuffToAllMinions':
                console.log(`applyBuffToAllMinions not implemented - requires minion system`);
                break;

            case 'fuseTwoMinions':
                console.log(`fuseTwoMinions not implemented - requires minion system`);
                break;

            case 'healCasterPerTargetHit':
                console.log(`healCasterPerTargetHit not implemented - requires heal system`);
                break;

            case 'healthCostCurrentPercentage':
                console.log(`healthCostCurrentPercentage not implemented - requires health system`);
                break;

            case 'resetSkillCooldownsByTag':
                console.log(`resetSkillCooldownsByTag not implemented - requires cooldown system`);
                break;

            case 'shatterFrozenTarget':
                console.log(`shatterFrozenTarget not implemented - requires freeze system`);
                break;

            case 'DoT':
                this.createDamageOverTimeInterval(this.effect.damagePerTurn, this.effect.damageType, this.target);
                break;

            case 'summonMinionOnKill':
                console.log(`summonMinionOnKill not implemented - requires minion system`);
                break;

            case 'summonMinionPerTargetHit':
                console.log(`summonMinionPerTargetHit not implemented - requires minion system`);
                break;

            case 'manaOverTime':
                console.log(`manaOverTime not implemented - requires mana system`);
                break;

            case 'applyShieldToAreaAllies':
                console.log(`applyShieldToAreaAllies not implemented - requires shield system`);
                break;

            case 'healBasedOnTargetMissingHealth':
                console.log(`healBasedOnTargetMissingHealth not implemented - requires heal system`);
                break;

            case 'healOverTimeAreaAlly':
                console.log(`healOverTimeAreaAlly not implemented - requires heal system`);
                break;

            case 'pullAlongLine':
                console.log(`pullAlongLine not implemented - requires positioning system`);
                break;

            case 'chainLightningInArea':
                console.log(`chainLightningInArea not implemented - requires chain system`);
                break;

            case 'pullTarget':
                console.log(`pullTarget not implemented - requires positioning system`);
                break;

            case 'healAllies':
                console.log(`healAllies not implemented - requires heal system`);
                break;

            case 'applyBuffToMinions':
                console.log(`applyBuffToMinions not implemented - requires minion system`);
                break;

            case 'damageToAllyHeal':
                console.log(`damageToAllyHeal not implemented - requires heal system`);
                break;

            case 'restoreResourceToTarget':
                console.log(`restoreResourceToTarget not implemented - requires resource system`);
                break;

            case 'createMovingZone':
                console.log(`createMovingZone not implemented - requires zone system`);
                break;

            case 'periodicDamageArea':
                console.log(`periodicDamageArea not implemented - requires AoE system`);
                break;

            case 'damageInLineToTarget':
                console.log(`damageInLineToTarget not implemented - requires damage system`);
                break;

            case 'choiceBuffDebuff':
                console.log(`choiceBuffDebuff not implemented - requires buff/debuff system`);
                break;

            case 'delayedAreaDamage':
                console.log(`delayedAreaDamage not implemented - requires AoE system`);
                break;

            case 'damageAllEnemies':
                console.log(`damageAllEnemies not implemented - requires damage system`);
                break;

            case 'secondaryDamageAllEnemies':
                console.log(`secondaryDamageAllEnemies not implemented - requires damage system`);
                break;

            case 'heal':
                this.target.healDamage(this.effect.amount);
                break;

            case 'healOverTimeAllMinions':
                console.log(`healOverTimeAllMinions not implemented - requires minion system`);
                break;

            case 'directAllMinionsTarget':
                console.log(`directAllMinionsTarget not implemented - requires minion system`);
                break;

            case 'sacrificeMinionForHeal':
                console.log(`sacrificeMinionForHeal not implemented - requires minion system`);
                break;

            case 'sacrificeMinionForBuff':
                console.log(`sacrificeMinionForBuff not implemented - requires minion system`);
                break;

            case 'summonMinionFromEnvironment':
                console.log(`summonMinionFromEnvironment not implemented - requires minion system`);
                break;

            case 'rootArea':
                console.log(`rootArea not implemented - requires root system`);
                break;

            case 'healTargetToFull':
                this.target.healDamage(this.target.stats.maxHealth - this.target.stats.health);
                break;

            case 'healAreaAllies':
                console.log(`healAreaAllies not implemented - requires heal system`);
                break;

            case 'healthSwap':
                console.log(`healthSwap not implemented - requires health system`);
                break;

            case 'resetRandomSkillCooldownByTag':
                console.log(`resetRandomSkillCooldownByTag not implemented - requires cooldown system`);
                break;

            case 'burnResource':
                console.log(`burnResource not implemented - requires resource system`);
                break;

            case 'teleportTargetRandomly':
                console.log(`teleportTargetRandomly not implemented - requires positioning system`);
                break;

            case 'stasis':
                this.target.stasis = true;
                break;

            case 'dispelBuffAndDamage':
                console.log(`dispelBuffAndDamage not implemented - requires buff system`);
                break;

            case 'knockbackFromPoint':
                console.log(`knockbackFromPoint not implemented - requires positioning system`);
                break;

            case 'applyRandomDebuffFromList':
                console.log(`applyRandomDebuffFromList not implemented - requires debuff system`);
                break;

            case 'applyShieldToMinion':
                console.log(`applyShieldToMinion not implemented - requires minion system`);
                break;

            case 'manaTransfer':
                console.log(`manaTransfer not implemented - requires mana system`);
                break;

            case 'healCaster':
                this.target.healDamage(this.effect.healAmount);
                break;

            case 'damageOverTimeToTarget':
                this.createDamageOverTimeInterval(this.effect.damagePerTurn, this.effect.tickDamageType, this.target);
                break;

            case 'healOverTimeOnTarget':
                this.createHealOverTimeInterval(this.effect.healPerTick, this.target);
                break;

            case 'stealRandomStat':
                console.log(`stealRandomStat not implemented - requires stat system`);
                break;

            case 'createGroundEffectAtTarget':
                console.log(`createGroundEffectAtTarget not implemented - requires ground effect system`);
                break;

            case 'auraEffectDuringChannel':
                console.log(`auraEffectDuringChannel not implemented - requires aura system`);
                break;

            case 'delayedDamage':
                console.log(`delayedDamage not implemented - requires damage system`);
                break;

            case 'dispelBuff':
                console.log(`dispelBuff not implemented - requires buff system`);
                break;

            case 'dispelDebuffInArea':
                // Implementation depends on your debuff system
                break;

            case 'banish':
                console.log(`banish not implemented - requires banish system`);
                break;

            case 'customSpellEffect':
                console.log(`customSpellEffect not implemented - requires spell system`);
                break;

            case 'chainHeal':
                console.log(`chainHeal not implemented - requires heal system`);
                break;

            case 'rampingAuraHealDuringChannel':
                console.log(`rampingAuraHealDuringChannel not implemented - requires aura system`);
                break;

            case 'massDispel':
                console.log(`massDispel not implemented - requires dispel system`);
                break;

            case 'dispelAndHeal':
                console.log(`dispelAndHeal not implemented - requires dispel system`);
                break;

            case 'applyBuffToTargets':
                console.log(`applyBuffToTargets not implemented - requires buff system`);
                break;

            case 'applyHoTToTarget':
                this.createHealOverTimeInterval(this.effect.healPerTick, this.target);
                break;

            case 'delayedHeal':
                console.log(`delayedHeal not implemented - requires heal system`);
                break;

            case 'applyRandomBuffFromList':
                console.log(`applyRandomBuffFromList not implemented - requires buff system`);
                break;

            case 'averageHealthPercentage':
                console.log(`averageHealthPercentage not implemented - requires health system`);
                break;

            case 'applyRandomStatBuffToAllies':
                console.log(`applyRandomStatBuffToAllies not implemented - requires buff system`);
                break;

            case 'silenceAllEnemies':
                console.log(`silenceAllEnemies not implemented - requires silence system`);
                break;

            case 'applyShieldToAllies':
                console.log(`applyShieldToAllies not implemented - requires shield system`);
                break;

            case 'dispelDoTAndConvertToHeal':
                console.log(`dispelDoTAndConvertToHeal not implemented - requires DoT system`);
                break;

            case 'dispelBuffAndChainHeal':
                console.log(`dispelBuffAndChainHeal not implemented - requires buff system`);
                break;

            case 'preventSkillTagUse':
                console.log(`preventSkillTagUse not implemented - requires skill system`);
                break;

            default:
                console.log(`${this.effect.type},${this.effect.subType} effect not implemented yet.`);
        }
    }

    createDamageOverTimeInterval(damage, damageType, target) {
        this.interval = setInterval(() => {
            const finalDamage = target.calculateFinalDamage(damage, damageType);
            target.takeDamage(finalDamage);
            if (target.isHero) {
                battleStatistics.addDamageReceived(damageType, finalDamage);
                battleStatistics.dotDamage += finalDamage;
            } else {
                // Track DoT damage dealt by player
                battleStatistics.addDamageDealt(damageType, finalDamage);
                battleStatistics.dotDamage += finalDamage;
                
                // Track enemies defeated by specific DoT types
                if (target.currentHealth <= 0) {
                    if (damageType === 'Bleed') {
                        battleStatistics.addEnemyDefeatedByBleed();
                    } else if (damageType === 'Poison') {
                        battleStatistics.addEnemyDefeatedByPoison();
                    }
                }
            }
            this.updateTooltip();
        }, 1000);
    }

    createHealOverTimeInterval(heal, target) {
        this.interval = setInterval(() => {
            target.healDamage(heal);
            this.updateTooltip();
        }, 1000);
    }


    summon(target, who, limit) {
        if (target.summons < limit) {
            var member = new Member(this.deepCopy(mobsClasses[who].name),
                this.deepCopy(mobsClasses[who].class),
                this.deepCopy(mobsClasses[who].skills),
                target.level);
            member.initialize(target.opposingTeam, target.team, target.team.length + 1);
            member.isSummon = true; // Set the isSummon flag
            renderTeamMembers([member], 'team2', false);
            member.skills.forEach(skill => {
                skill.useSkill(member);
            });

            target.team.addMembers([member]);
            target.summons += 1;

            // Track minion summons by type
            if (who.toLowerCase().includes('undead')) {
                battleStatistics.addMinionSummoned('undead');
            } else if (who.toLowerCase().includes('elemental')) {
                battleStatistics.addMinionSummoned('elemental');
            } else if (who.toLowerCase().includes('nature')) {
                battleStatistics.addMinionSummoned('nature');
            }
        } else {

        }

    }

    revertEffect() {
        switch (this.effect.subType) {
            case 'modifiers':
                // Revert all modifiers
                if (this.originalStats) {
                    this.effect.modifiers.forEach(modifier => {
                        this.target.stats[modifier.stat] = this.originalStats[modifier.stat];
                    });
                }
                break;
            case 'Barrier':
                this.target.barrier = 0;
                break;
            case 'Blight':
            case 'Bleed':
            case 'Burn':
            case 'Corrupt':
            case 'Life Drain':
            case 'Mana Drain':
            case 'Poison':
            case 'Regen':
            case 'WildfireBurn':
                clearInterval(this.interval);
                break;
            case 'Disarm':
                this.target.disarmed = false;
                break;
            case 'Enrage':
                this.target.stats.strength -= this.value;
                this.target.stats.defense += this.value;
                break;
            case 'flatChange':
                this.target.stats[this.effect.stat] -= this.effect.value;
                console.log("Reverted flat change on " + this.effect.stat + ". New value: " + this.target.stats[this.effect.stat]);
                break;
            case 'percentChange':
                this.target.stats[this.effect.stat] = this.target.stats[this.effect.stat] / (1 + (this.effect.value / 100));
                console.log("Reverted percentage change on " + this.effect.stat + ". New value: " + this.target.stats[this.effect.stat]);
                break;
            case 'Stun':
                this.target.startSkills();
                break;
            case 'Invisibility':
                this.target.invisible = false;
                break;
            case 'Hexproof':
                this.target.hexproof = false;
                break;
            case 'Entrap':
                this.target.entrap = false;
                break;
            case 'delayedDamage':
                // Only deal damage if the target stayed in combat for the full duration
                const effectsDiv = document.querySelectorAll('#team1 .effects .debuff div');
                const hasDeadlyFog = Array.from(effectsDiv).some(effect =>
                                    effect.textContent.includes('Deadly Fog:'));
                if(hasDeadlyFog){
                    const finalDamage = this.target.calculateFinalDamage(this.originalValue, this.effect.damageType);
                    this.target.takeDamage(finalDamage);
                }
                break;
            case 'stealth':
                // Revert stealth bonuses
                if (this.originalStats) {
                    this.target.stats.damage = this.originalStats.damage;
                    this.target.stats.critChance = this.originalStats.critChance;
                }
                break;
            case 'distracted':
                // Revert distracted penalties
                if (this.originalStats) {
                    this.target.stats.accuracy = this.originalStats.accuracy;
                    this.target.stats.critResistance = this.originalStats.critResistance;
                }
                break;
            case 'Fear':
                // No need to revert fear as it's a one-time effect
                break;
            case 'RestoreResource':
                // No need to revert resource restoration
                break;
            case 'Steal':
                // No need to revert gold stealing
                break;
            case 'Teleport':
                // Reset position
                this.target.position = 'normal';
                break;
            case 'AreaDebuff':
                // No need to revert area debuff as it's applied to other targets
                break;
            case 'ManaShield':
                this.target.manaShield = false;
                this.target.manaShieldAbsorbPercentage = 0;
                break;
            case 'EmpowerNextSpell':
                // Reset next spell modifiers
                this.target.nextSpellTypes = null;
                this.target.nextSpellCritChance = 0;
                this.target.nextSpellDamageMultiplier = 1;
                this.target.nextSpellManaCostMultiplier = 1;
                break;
            case 'Vulnerability':
                // Revert vulnerability
                if (this.effect.damageType && this.originalStats) {
                    this.target.stats[`${this.effect.damageType.toLowerCase()}Resistance`] = this.originalStats.resistance;
                }
                break;
            case 'AreaEffect':
                console.log(`AreaEffect revert not implemented - requires zone system`);
                break;
            case 'Trap':
                console.log(`Trap revert not implemented - requires trap system`);
                break;
            case 'Taunt':
                // Remove forced target
                this.target.forcedTarget = null;
                break;
            default:
                console.log(`${this.effect.type}, ${this.effect.subType} effect revert not implemented yet.`);
        }
    }

    updateTooltip() {
        if (this.isPassive) {
            let tooltipText = `${this.effect.name}`;
            if (this.effect.subType) {
                tooltipText += ` (${this.effect.subType})`;
            }
            if (this.effect.stat) {
                tooltipText += `\nStat: ${this.effect.stat}`;
            }
            if (this.effect.value !== undefined && this.effect.value !== 0) {
                tooltipText += `\nValue: ${this.effect.value}`;
            }
            this.tooltip.textContent = tooltipText;
        } else {
            const timeLeft = Math.floor(this.getTimeLeft());
            this.tooltip.textContent = `${this.effect.name}: ${timeLeft} seconds left`;
        }
    }

    remove() {
        if (!this.isPassive) {
            clearTimeout(this.timer);
            clearInterval(this.timerInterval);
        }
        this.revertEffect();
        // Remove this effect from the target's effects array
        const index = this.target.effects.indexOf(this);
        if (index !== -1) {
            this.target.effects.splice(index, 1);
        }
        if(this.element) this.element.remove();
    }

    deepCopy(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        if (Array.isArray(obj)) {
            return obj.map(item => this.deepCopy(item));
        }
        const copy = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                copy[key] = this.deepCopy(obj[key]);
            }
        }
        return copy;
    }

    pause() {
        if (this.isPassive || this.isPaused) return;
        
        this.isPaused = true;
        this.pauseStartTime = Date.now();
        
        // Clear existing timers
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    unpause() {
        if (this.isPassive || !this.isPaused) return;
        
        this.isPaused = false;
        const pauseDuration = (Date.now() - this.pauseStartTime) / 1000;
        
        // Adjust start time to account for pause duration
        if (this.startTime) {
            this.startTime += pauseDuration * 1000;
        }
        
        // Restart timers
        if (!this.isPassive) {
            this.startTimer();
            this.startTooltipTimer();
        }
        
        // Restart effect intervals if they exist
        if (this.effect.subType === 'Regen') {
            this.createHealOverTimeInterval(this.effect.value, this.target);
        } else if (['Bleed', 'Burn', 'Poison', 'WildfireBurn', 'DoT'].includes(this.effect.subType)) {
            this.createDamageOverTimeInterval(this.effect.value, this.effect.damageType, this.target);
        } else if (this.effect.subType === 'Corrupt') {
            this.corruptInterval = setInterval(() => {
                this.target.stats.strength -= 1;
                this.target.stats.speed -= 1;
                this.target.stats.dexterity -= 1;
                this.target.stats.health -= 1;
            }, 1000);
        }
    }

    // Add this new method to handle stealth on attack
    handleStealthAttack() {
        if (this.effect.subType === 'stealth') {
            // Remove the stealth effect after the attack
            this.remove();
        }
    }

}

export default EffectClass;