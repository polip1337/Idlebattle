import {
    isPaused
} from './Main.js';
import {
    updateHealth,
    updateMana,
    updateAttackBar,
    updateStatus,
} from './Render.js';

class EffectClass {
    constructor(target, effect) {
        this.effect = effect;
        this.target = target;
        this.originalValue = 0;
        this.applyEffect(); // Apply the effect immediately
        updateStatus(target);
        this.startTimer();
    }

    renderBuff(){
        this.element = document.createElement('div');
        this.element.classList.add(effect.type);
        this.tooltip = document.createElement('div'); // Create tooltip element
        this.tooltip.classList.add('tooltip'); // Add tooltip class
        this.element.appendChild(this.tooltip);
        target.effectsElement.appendChild(this.element);
    }

    startTimer() {
        this.timer = setTimeout(() => {
            this.remove();
        }, this.effect.duration * 1000); // Convert duration to milliseconds
        this.updateTooltip(); // Update tooltip initially
    }

    applyEffect() {
        switch (this.effect.type) {
            case 'Barrier':
                this.member.barrier = this.value; // Custom property to handle barrier status
                break;
            case 'Blind':
                // Logic for Blind effect
                break;
            case 'Blight':
                this.createBlightInterval(this.value);
                break;
            case 'Bleed':
                this.createDamageOverTimeInterval(this.value);
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
                    this.member.stats.strength -= 1; // Decrease strength over time
                    this.member.stats.speed -= 1; // Decrease strength over time
                    this.member.stats.dexterity -= 1; // Decrease strength over time
                    this.member.stats.health -= 1; // Decrease strength over time
                }, 1000);
                break;
            case 'Curse':
                // Logic for Curse effect
                break;
            case 'Disarm':
                this.member.disarmed = true; // Custom property to handle disarm status
                break;
            case 'Enrage':
                this.member.stats.strength += this.value; // Increase strength
                this.member.stats.dodge -= this.value; // Decrease defense
                break;
            case 'Entrap':
                this.member.entrap = true; // Custom property to handle entrap status
                break;
            case 'Fear':
                // Logic for Fear effect
                break;
            case 'Freeze':
                this.member.stats.speed = 0; // Freeze effect
                break;
            case 'Haste':
                this.member.stats.speed += this.member.stats.speed * this.value / 100;
                break;
            case 'Hex':
                // Logic for Hex effect
                break;
            case 'Hexproof':
                this.member.hexproof = true; // Custom property to handle hexproof status
                break;
            case 'Invisibility':
                this.member.invisible = true; // Custom property to handle invisibility status
                break;
            case 'Life Drain':
                this.createLifeDrainInterval(this.value);
                break;
            case 'Lifesteal':
                this.member.lifesteal = this.value; // Custom property to handle lifesteal status
                break;
            case 'Mana Burn':
                // Logic for Mana Burn effect
                break;
            case 'Mana Drain':
                this.createManaDrainInterval(this.value);
                break;
            case 'Mark':
                this.member.marked = true; // Custom property to handle mark status
                break;
            case 'Paralyze':
                // Logic for Paralyze effect
                break;
            case 'Petrify':
                // Logic for Petrify effect
                break;
            case 'Poison':
                this.createDamageOverTimeInterval(this.value);
                break;
            case 'Purify':
                this.removeNegativeEffects(); // Method to remove negative effects
                break;
            case 'Regen':
                this.createRegenInterval(this.value);
                break;
            case 'Reflect':
                this.member.reflect = this.value; // Custom property to handle reflect status
                break;
            case 'Silence':
                // Logic for Silence effect
                break;
            case 'Sleep':
                // Logic for Sleep effect
                break;
            case 'Slow':
                this.member.stats.speed -= this.member.stats.speed * this.value / 100;
                break;
            case 'Strength Increase':
                this.member.stats.strength += this.value;
                break;
            case 'Taunt':
                // Logic for Taunt effect
                break;
            case 'Vitality Increase':
                this.member.stats.vitality += this.value;
                break;
            case 'Weaken':
                reduceStatsByPercentage(effect.stat, effect.value);
                break;
            default:
                console.log(`${this.effectType} effect not implemented yet.`);
        }
        this.member.updateHealth();
        this.updateTooltip();
    }

    createDamageOverTimeInterval(value) {
        this.interval = setInterval(() => {
            this.member.currentHealth -= value;
            this.member.updateHealth();
            this.updateTooltip();
        }, 1000);
    }
    reduceStatsByPercentage(stat, value) {
        this.originalValue = this.member.stats[stat];
        this.member.stats[stat] -= this.member.stats[stat] * (value / 100);

        this.updateTooltip();
    }
    reduceStatsByFlatValue(stat, value) {
        this.member.stats[stat] -= this.value;

    }
    revertEffect() {
        switch (this.effectType) {
            case 'Barrier':
                this.member.barrier = 0;
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
                this.member.stats.strength += this.member.stats.strength * this.value / 100;
                break;
            case 'Disarm':
                this.member.disarmed = false;
                break;
            case 'Enrage':
                this.member.stats.strength -= this.value;
                this.member.stats.defense += this.value;
                break;
            case 'Slow':
                this.member.stats.speed += this.member.stats.speed * this.value / 100;
                break;
            case 'Freeze':
                this.member.stats.speed = this.originalSpeed;
                break;
            case 'Haste':
                this.member.stats.speed -= this.member.stats.speed * this.value / 100;
                break;
            case 'Strength Increase':
                this.member.stats.strength -= this.value;
                break;
            case 'Vitality Increase':
                this.member.stats.vitality -= this.value;
                break;
            case 'Invisibility':
                this.member.invisible = false;
                break;
            case 'Hexproof':
                this.member.hexproof = false;
                break;
            case 'Entrap':
                this.member.entrap = false;
                break;
                // Revert logic for other effects as necessary
            default:
                console.log(`${this.effectType} effect not implemented yet.`);
        }
    }
    updateTooltip() {
        const timeLeft = Math.ceil((1000 - this.timer) / 1000);
        this.tooltip.textContent = `${this.effect.name}: ${timeLeft} seconds left`; // Update tooltip content
    }

    remove() {
        clearTimeout(this.timer);
        this.revertEffect(); // Revert the effect when the buff expires

        this.element.remove();
    }
}
export default EffectClass;