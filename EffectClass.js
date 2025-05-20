import {mobsClasses, renderTeamMembers} from './initialize.js';
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
        if (effect.stackMode == "duration" && this.isAlreadyApplied(effect, target)) {
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
        this.startTime = Date.now(); // Record the start time
        this.timer = setTimeout(() => {
            this.remove();
        }, this.effect.duration * 1000); // Convert duration to milliseconds

        this.updateTooltip(); // Update tooltip initially
    }

    getTimeLeft() {
        if (this.timer === null) {
            return 0; // No timer set, return 0
        }
        const elapsed = (Date.now() - this.startTime) / 1000; // Time elapsed in seconds
        const timeLeft = this.effect.duration - elapsed; // Calculate remaining time
        return timeLeft > 0 ? timeLeft : 0; // Ensure time left is non-negative
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
            case 'Bleed':
            case 'Burn':
            case 'Poison':
            case 'WildfireBurn':
                this.createDamageOverTimeInterval(this.effect.value, this.effect.damageType, this.target);
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
            case 'DoT':
            case 'Bleed':
            case 'Burn':
            case 'Poison':
            case 'WildfireBurn':
                this.createDamageOverTimeInterval(this.effect.value, this.effect.damageType, this.target);
                break;
            case 'delayedDamage':
                // Store the damage value for later use in revertEffect
                this.originalValue = this.effect.value;
                // Check if target has immunity to this effect type
                if (this.target.effects.some(e => e.effect.subType === 'immunity' && e.effect.immunityType === this.effect.name)) {
                    console.log(`${this.target.name} is immune to ${this.effect.name}`);
                    this.render = false;
                    return;
                }
                // If not immune, apply the delayed damage
                this.createDamageOverTimeInterval(this.effect.value, this.effect.damageType, this.target);
                break;
            case 'immunity':
                // Add immunity to target's effects list
                this.target.effects.push(this);
                // If this is a party aura, apply to all party members
                if (this.effect.partyAura && this.target.team) {
                    this.target.team.members.forEach(member => {
                        if (member !== this.target && !member.effects.some(e => e.effect.name === this.effect.name)) { // Don't apply twice to the source or to members who already have it
                            new EffectClass(member, this.effect);
                        }
                    });
                }
                break;
            default:
                console.log(`${this.effect.type},${this.effect.subType} effect not implemented yet.`);
        }
        this.target.effects.push(this);
    }

    createDamageOverTimeInterval(damage, damageType, target) {
        this.interval = setInterval(() => {
            const finalDamage = target.calculateFinalDamage(damage, damageType);
            target.takeDamage(finalDamage);
            this.updateTooltip();
        }, 1000);
        //console.log("This Interval id:" + this.interval + damageType);
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
            renderTeamMembers([member], 'team2', false);
            member.skills.forEach(skill => {
                skill.useSkill(member);
            });

            target.team.addMembers([member]);
            target.summons += 1;
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
                //  console.log("Clearing:" + this.interval + this.effect.damageType);
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
                const finalDamage = this.target.calculateFinalDamage(this.originalValue, this.effect.damageType);
                this.target.takeDamage(finalDamage);
                break;
            // Revert logic for other effects as necessary
            default:
                console.log(`${this.effect.type}, ${this.effect.subType} effect revert not implemented yet.`);
        }

    }

    updateTooltip() {
        const timeLeft = Math.floor(this.getTimeLeft());
        this.tooltip.textContent = `${this.effect.name}: ${timeLeft} seconds left`; // Update tooltip content
    }

    remove() {
        clearTimeout(this.timer);
        clearInterval(this.timerInterval);
        this.revertEffect();
        const index = this.target.effects.indexOf(this);
        if (index !== -1) {
            this.target.effects.splice(index, 1);
        }// Revert the effect when the buff expires
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
}

export default EffectClass;