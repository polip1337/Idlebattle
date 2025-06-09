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
            case 'Barrier':
                this.target.barrier = this.value; // Custom property to handle barrier status
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
                    this.target.stats.strength -= 1; // Decrease strength over time
                    this.target.stats.speed -= 1; // Decrease strength over time
                    this.target.stats.dexterity -= 1; // Decrease strength over time
                    this.target.stats.health -= 1; // Decrease strength over time
                }, 1000);
                break;
            case 'Curse':
                // Logic for Curse effect
                break;
            case 'Disarm':
                this.target.disarmed = true; // Custom property to handle disarm status
                break;
            case 'Enrage':
                this.target.stats.strength += this.value; // Increase strength
                this.target.stats.dodge -= this.value; // Decrease defense
                break;
            case 'Entrap':
                this.target.entrap = true; // Custom property to handle entrap status
                break;
            case 'Fear':
                // Logic for Fear effect
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
                this.target.hexproof = true; // Custom property to handle hexproof status
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
                    }
                    {
                        console.log(skill.name + " is not on cooldown");

                    }
                });
                break;
            case 'Invisibility':
                this.target.invisible = true; // Custom property to handle invisibility status
                break;
            case 'Life Drain':
                this.createLifeDrainInterval(this.value);
                break;
            case 'Lifesteal':
                this.target.lifesteal = this.value; // Custom property to handle lifesteal status
                break;
            case 'Mana Burn':
                // Logic for Mana Burn effect
                break;
            case 'Mana Drain':
                this.createManaDrainInterval(this.value);
                break;
            case 'Mark':
                this.target.marked = true; // Custom property to handle mark status
                break;
            case 'Paralyze':
                // Logic for Paralyze effect
                break;
            case 'Petrify':
                // Logic for Petrify effect
                break;
            case 'percentChange':
                this.target.stats[this.effect.stat] += this.effect.value * this.target.stats[this.effect.stat] / 100;
                console.log("applied percentage change on " + this.effect.stat + ". New value: " + this.target.stats[this.effect.stat]);
                break;

            case 'Purify':
                this.removeNegativeEffects(); // Method to remove negative effects
                break;
            case 'Regen':
                this.createHealOverTimeInterval(this.effect.value, this.target);
                break;
            case 'Reflect':
                this.target.reflect = this.value; // Custom property to handle reflect status
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
                break;
            case 'delayedDamage':
                // Store the damage value for later use in revertEffect
                this.originalValue = this.effect.value;
                // Check if hero has the Mistwalker Amulet equipped
                if (hero.equipment.amuletSlot && hero.equipment.amuletSlot.id === 'mistwalkerAmulet') {
                    console.log(`${this.target.name} is protected by the Mistwalker Amulet`);
                    this.render = false;
                    return;
                }
                // Don't apply damage immediately - it will be applied in revertEffect if the target stays in combat
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
                console.log("Applied flat change on " + this.effect.stat + ". New value: " + this.target.stats[this.effect.stat]);
                break;
            case 'percentChange':
                this.target.stats[this.effect.stat] = this.target.stats[this.effect.stat] / (1 + (this.effect.value / 100));
                console.log("applied percentage change on " + this.effect.stat + ". New value: " + this.target.stats[this.effect.stat]);
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
            // Revert logic for other effects as necessary
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