import { isPaused } from './Main.js';
import { updateHealth, updateMana, updateAttackBar,updateStatus,updateStatsDisplay } from './RenderMember.js';

class EffectClass {
  constructor(target, effect) {
    this.effect = effect;
    this.target = target;
    this.element = document.createElement('div');
    this.element.classList.add(effect.type);
    this.tooltip = document.createElement('div'); // Create tooltip element
    this.tooltip.classList.add('tooltip'); // Add tooltip class
    this.element.appendChild(this.tooltip);
    target.effectsElement.appendChild(this.element);
    this.applyEffect(); // Apply the effect immediately
    updateStatus(target);
    this.startTimer();
  }

  startTimer() {
    this.timer = setTimeout(() => {
      this.remove();
    }, this.effect.duration * 1000); // Convert duration to milliseconds
   this.updateTooltip(); // Update tooltip initially
  }
  applyEffect() {
    this.target.stats[this.effect.stat] += this.effect.value; // Apply the effect on the member's stat
    // Update member display or perform other actions as needed
  }

  revertEffect() {
    this.target.stats[this.effect.stat] -= this.effect.value; // Revert the effect on the member's stat
    // Update member display or perform other actions as needed
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
