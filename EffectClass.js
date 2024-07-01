import {
    isPaused
} from './Main.js';
import {
    updateHealth,
    updateMana,
    updateStamina,
    deepCopy
} from './Render.js';

class EffectClass {
    constructor(target, effect) {
        this.effect = deepCopy(effect);
        this.target = target;
        this.originalValue = 0;
        this.timer = null;
        this.startTime = null;
        this.remainingTime = null;
        if(effect.stackMode == "duration" && this.isAlreadyApplied(effect, target)){
            this.extendTimer(effect.duration);
        }else if(effect.stackMode == "refresh"){
            refreshTimer();
        }
        else{
            this.applyEffect(effect);
            this.renderBuff();
            this.startTimer();
            this.startTooltipTimer();
        }
    }

    renderBuff(){
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
        var otherEffect = this.getAlreadyApplied(this.effect,this.target);
        const timeLeft = otherEffect.getTimeLeft();

        otherEffect.effect.duration = timeLeft + additionalTime; // Add the additional time
        otherEffect.startTime = Date.now(); // Reset the start time
        otherEffect.setTimer(otherEffect.effect.duration); // Restart the timer with the new duration
        otherEffect.updateTooltip(); // Update the tooltip
    }
    refreshTimer() {
            var otherEffect = this.getAlreadyApplied(this.effect,this.target);
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
        return existingEffect ;
    }
    startTooltipTimer() {
            this.interval = setInterval(() => {

                this.updateTooltip();
            }, 1000);
        }
    applyEffect(effect) {
        switch (this.effect.subType) {
            case 'Armor':
                this.target.armor += effect.value; // Custom property to handle barrier status
            break;
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
                this.createDamageOverTimeInterval(this.effect.value, this.effect.damageType, this.target);
                break;
            case 'Burn':
                this.createDamageOverTimeInterval(this.value);
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
            case 'Freeze':
                this.target.stats.speed = 0; // Freeze effect
                break;
            case 'Haste':
                this.target.stats.speed += this.target.stats.speed * this.value / 100;
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
            case 'Invisibility':
                this.target.invisible = true; // Custom property to handle invisibility status
                break;
            case 'increaseArmor':
                changeBaseStatsByPercentage('armor', this.effect.value);
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
            case 'Poison':
                this.createDamageOverTimeInterval(this.effect.value, this.effect.damageType, this.target);
                break;
            case 'Purify':
                this.removeNegativeEffects(); // Method to remove negative effects
                break;
            case 'Regen':
                this.createHealOverTimeInterval(this.effect.value,this.effect.duration);
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
            case 'Slow':
                this.target.stats.speed -= this.target.stats.speed * this.value / 100;
                break;
            case 'Stun':
                this.target.stopSkills();
                break;
            case 'Strength Increase':
                this.target.stats.strength += this.value;
                break;
            case 'Strengthen':
                changeStatsByPercentage('strength', this.effect.value);
                break;
            case 'Taunt':
                // Logic for Taunt effect
                break;
            case 'Vitality Increase':
                this.target.stats.vitality += this.value;
                break;
            case 'Weaken':
                changeStatsByPercentage(effect.stat, effect.value);
                break;
            default:
                console.log(`${this.effect.type} effect not implemented yet.`);
        }
        this.target.effects.push(this);
    }

    createDamageOverTimeInterval(damage, damageType, target) {
        this.interval = setInterval(() => {
            const finalDamage = target.calculateFinalDamage(damage, damageType);
            target.takeDamage(finalDamage);
            this.updateTooltip();
        }, 1000);
    }
    createHealOverTimeInterval(heal, target) {
            this.interval = setInterval(() => {
                target.healDamage(heal);
                this.updateTooltip();
            }, 1000);
        }
    changeStatsByPercentage(stat, value) {
        this.originalValue = this.target.stats[stat];
        this.target.stats[stat] += Math.floor(this.target.stats[stat] * (value / 100));

        this.updateTooltip();
    }
    changeBaseStatsByPercentage(baseStat, value) {
       this.originalValue = this.target.baseStat;
       this.target.baseStat += Math.floor(this.target.baseStat * (value / 100));

       this.updateTooltip();
   }
    reduceStatsByFlatValue(stat, value) {
        this.target.stats[stat] -= this.value;
    }
    increaseStatsByFlatValue(stat, value) {
        this.target.stats[stat] -= this.value;
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
                clearInterval(this.interval);
                break;
            case 'Weaken':
                this.target.stats.strength += this.target.stats.strength * this.value / 100;
                break;
            case 'Disarm':
                this.target.disarmed = false;
                break;
            case 'Enrage':
                this.target.stats.strength -= this.value;
                this.target.stats.defense += this.value;
                break;
            case 'Slow':
                this.target.stats.speed += this.target.stats.speed * this.value / 100;
                break;
            case 'Freeze':
                this.target.stats.speed = this.originalSpeed;
                break;
            case 'Haste':
                this.target.stats.speed -= this.target.stats.speed * this.value / 100;
                break;
            case 'Strength Increase':
                this.target.stats.strength -= this.value;
                break;
            case 'Stun':
                this.target.startSkills();
            break;
            case 'Vitality Increase':
                this.target.stats.vitality -= this.value;
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
                // Revert logic for other effects as necessary
            default:
                console.log(`${this.effect.name} effect not implemented yet.`);
        }

    }
    updateTooltip() {
        const timeLeft = Math.floor(this.getTimeLeft());
        this.tooltip.textContent = `${this.effect.name}: ${timeLeft} seconds left`; // Update tooltip content
    }

    remove() {
        clearTimeout(this.timer);
        this.revertEffect();
         const index = this.target.effects.indexOf(this);
         if (index !== -1) {
             this.target.effects.splice(index, 1);
         }// Revert the effect when the buff expires
        this.element.remove();
    }
}
export default EffectClass;