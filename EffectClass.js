import { mobsClasses, renderTeamMembers, hero, battleStatistics } from './initialize.js';
import Member from './Member.js'
import { deepCopy } from './Render.js';

class EffectClass {
    constructor(target, effect, caster = null) { // Caster can be passed for effects like Taunt
        this.effect = deepCopy(effect);
        this.target = target;
        this.caster = caster; // Store the caster
        this.originalValue = 0;
        this.originalStats = {};
        this.timer = null;
        this.startTime = null;
        this.remainingTime = null;
        this.render = true; // Most effects should be rendered unless they are instant one-offs
        this.isPassive = effect.duration === -1;
        this.isPaused = false;
        this.pauseStartTime = null;

        // One-shot effects that don't need timers or rendering
        if (['CooldownReduction', 'RestoreResource', 'Steal', 'Teleport', 'Summon'].includes(this.effect.subType)) {
            this.render = false;
        }

        if (this.isPassive) {
            // For passive effects, just apply and don't set up timers
            this.applyEffect(effect);
            if (this.render && this.effect.icon) {
                this.renderBuff();
                this.updateTooltip();
            }
        } else if (effect.stackMode === "duration" && this.isAlreadyApplied(effect, target)) {
            this.extendTimer(effect.duration);
        } else if (effect.stackMode === "refresh" && this.isAlreadyApplied(effect, target)) {
            this.refreshTimer();
        } else {
            this.applyEffect(effect);
            if (this.render && this.effect.icon) {
                this.renderBuff();
            }
            if (this.effect.duration > 0) { // Only start timers for effects with a positive duration
                this.startTimer();
                this.startTooltipTimer();
            } else { // Handle instant (duration: 0) effects
                if (!this.render) this.remove(); // If not rendered, remove immediately after applying.
            }
        }
        this.target.effects.push(this);
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
        if (this.isPassive || this.isPaused || this.effect.duration <= 0) return;

        this.startTime = Date.now();
        this.timer = setTimeout(() => {
            this.remove();
        }, this.effect.duration * 1000);

        this.updateTooltip();
    }

    getTimeLeft() {
        if (this.timer === null || this.isPassive) {
            return Infinity; // Passives don't have a time limit
        }
        if (this.effect.duration === 0) {
            return 0;
        }
        const elapsed = (Date.now() - this.startTime) / 1000;
        const timeLeft = this.effect.duration - elapsed;
        return timeLeft > 0 ? timeLeft : 0;
    }

    extendTimer(additionalTime) {
        var otherEffect = this.getAlreadyApplied(this.effect, this.target);
        if (!otherEffect) return;

        const timeLeft = otherEffect.getTimeLeft();
        otherEffect.effect.duration = timeLeft + additionalTime;
        otherEffect.startTime = Date.now();
        otherEffect.setTimer(otherEffect.effect.duration);
        otherEffect.updateTooltip();
    }

    refreshTimer() {
        var otherEffect = this.getAlreadyApplied(this.effect, this.target);
        if (!otherEffect) return;

        otherEffect.startTime = Date.now();
        otherEffect.setTimer(otherEffect.effect.duration);
        otherEffect.updateTooltip();
    }

    setTimer(duration) {
        if (this.timer !== null) {
            clearTimeout(this.timer);
        }
        if (duration <= 0) {
            this.remove();
            return;
        }
        this.timer = setTimeout(() => {
            this.remove();
        }, duration * 1000);
    }

    isAlreadyApplied(effect, target) {
        return target.effects.some(e => e.effect.id === effect.id);
    }

    getAlreadyApplied(effect, target) {
        return target.effects.find(e => e.effect.id === effect.id);
    }

    startTooltipTimer() {
        if (this.isPassive || this.isPaused || this.effect.duration <= 0) return;

        this.tooltipInterval = setInterval(() => {
            this.updateTooltip();
        }, 1000);
    }

    applyEffect() {
        // Shared logic for modifier-based effects
        if (this.effect.modifiers) {
            this.effect.modifiers.forEach(modifier => {
                const stat = modifier.stat;
                if (typeof this.target.stats[stat] !== 'undefined') {
                    // Store original value only if it hasn't been stored yet for this effect instance
                    if (typeof this.originalStats[stat] === 'undefined') {
                        this.originalStats[stat] = this.target.stats[stat];
                    }
                    if (modifier.flat) {
                        this.target.stats[stat] += modifier.flat;
                    }
                    if (modifier.percentage) {
                        // Apply percentage modifier based on the original value to prevent compounding on itself
                        const baseValue = this.originalStats[stat];
                        this.target.stats[stat] += baseValue * (modifier.percentage / 100);
                    }
                } else {
                    console.warn(`Stat '${stat}' not found on target '${this.target.name}' for effect '${this.effect.name}'.`);
                }
            });
        }

        switch (this.effect.subType) {
            case 'Modifiers':
                // Handled by the shared logic above
                break;

            case 'AreaEffect':
                console.log(`'${this.effect.name}' (AreaEffect) triggered. Zone placement logic is handled by the game engine.`);
                break;

            case 'DoT':
                // Also handles the DoT part of composite effects like 'scaldedDebuff'
                if (this.effect.value > 0) {
                    this.createDamageOverTimeInterval(this.effect.value, this.effect.damageType, this.target);
                }
                break;

            case 'flatChange':
                const stat = this.effect.stat;
                if (typeof this.target.stats[stat] !== 'undefined') {
                    this.originalStats[stat] = this.target.stats[stat];
                    this.target.stats[stat] += this.effect.value;
                }
                break;

            case 'AreaDebuff':
                // This effect applies another effect. Assumes the parent skill/ability handles targeting the area.
               /* const effectToApply = allEffects[this.effect.effectToApply];
                if (effectToApply) {
                    new EffectClass(this.target, effectToApply, this.caster);
                } else {
                    console.warn(`Effect to apply '${this.effect.effectToApply}' not found.`);
                }
                this.render = false; // The main effect doesn't render, the sub-effect does.*/
                break;

            case 'DelayedDamage':
                // The damage is dealt upon removal/expiration in revertEffect. Nothing to do here.
                break;

            case 'CooldownReduction':
                this.target.skills.forEach(skill => {
                    if (skill.onCooldown) {
                        skill.reduceCooldown(this.effect.value, this.target);
                    }
                });
                break;

            case 'Fear':
                if (Math.random() < this.effect.chance) {
                    this.target.stopSkills(); // Pauses skill cooldowns
                    console.log(`${this.target.name} is feared and skips their turn.`);
                }
                break;

            case 'percentChange':
                const percStat = this.effect.stat;
                if (typeof this.target.stats[percStat] !== 'undefined') {
                    this.originalStats[percStat] = this.target.stats[percStat];
                    this.target.stats[percStat] *= (1 + this.effect.value / 100);
                }
                break;

            case 'Vulnerability':
                const resStat = `${this.effect.damageType.toLowerCase()}Resistance`;
                this.originalStats[resStat] = this.target.stats[resStat] || 0;
                this.target.stats[resStat] = (this.target.stats[resStat] || 0) - this.effect.value;
                break;

            case 'Invisibility':
                this.target.invisible = true;
                break;

            case 'ManaShield':
                // The damage calculation logic in Member.js would need to check for this effect.
                this.target.manaShieldActive = true;
                this.target.manaShieldRatio = this.effect.absorbPercentage;
                break;

            case 'GuaranteedDodge':
                this.target.hasGuaranteedDodge = true;
                break;

            case 'Regen':
                this.createHealOverTimeInterval(this.effect.value, this.target);
                break;

            case 'RestoreResource':
                if (this.effect.resourceType === 'mana') {
                    const oldMana = this.target.currentMana;
                    this.target.currentMana = Math.min(this.target.stats.mana, this.target.currentMana + this.effect.value);
                    const actualManaRestored = this.target.currentMana - oldMana;
                    if (this.target.isHero && actualManaRestored > 0) {
                        battleStatistics.addManaRegenerated(actualManaRestored);
                    }
                    updateMana(this.target);
                } else if (this.effect.resourceType === 'stamina') {
                    const oldStamina = this.target.currentStamina;
                    this.target.currentStamina = Math.min(this.target.stats.stamina, this.target.currentStamina + this.effect.value);
                    const actualStaminaRestored = this.target.currentStamina - oldStamina;
                    if (this.target.isHero && actualStaminaRestored > 0) {
                        battleStatistics.addStaminaRegenerated(actualStaminaRestored);
                    }
                    updateStamina(this.target);
                } else if (this.effect.resourceType === 'health') {
                    const oldHealth = this.target.currentHealth;
                    this.target.currentHealth = Math.min(this.target.maxHealth, this.target.currentHealth + this.effect.value);
                    const actualHealthRestored = this.target.currentHealth - oldHealth;
                    if (this.target.isHero && actualHealthRestored > 0) {
                        battleStatistics.addTotalHealingReceived(actualHealthRestored);
                    }
                    updateHealth(this.target);
                }
                break;

            case 'Steal':
                if (this.caster && this.caster.isHero) {
                    this.caster.addGold(this.effect.value);
                    console.log(`${this.caster.name} steals ${this.effect.value} gold from ${this.target.name}.`);
                }
                break;

            case 'stealth':
                this.target.invisible = true;
                // Modifier logic is handled by shared code at the top.
                break;

            case 'Stun':
                this.target.stopSkills();
                break;

            case 'Summon':
                this.summon(this.target, this.effect.who, this.effect.limit);
                break;



            case 'Taunt':
                if (this.caster) {
                    this.target.forcedTarget = this.caster;
                } else {
                    // Fallback for when caster isn't passed, though it should be.
                    this.target.forcedTarget = this.effect.forceTarget; // "Caster"
                    console.warn(`Taunt applied to ${this.target.name} without a specific caster reference.`);
                }
                break;

            case 'Teleport':
                console.log(`'${this.effect.name}' (Teleport) triggered. Position change is handled by game engine.`);
                break;

            case 'Trap':
                console.log(`'${this.effect.name}' (Trap) triggered. Trap placement is handled by game engine.`);
                break;

            case 'EmpowerNextSpell':
                this.target.empoweredSpell = {
                    spellTypes: this.effect.spellTypes,
                    critChanceBonus: this.effect.critChanceBonus,
                    damageBonusPercentage: this.effect.damageBonusPercentage,
                    manaCostIncreasePercentage: this.effect.manaCostIncreasePercentage,
                };
                break;

            default:
                console.warn(`Effect subType '${this.effect.subType}' from '${this.effect.name}' is not implemented.`);
        }
    }

    revertEffect() {
        // Shared logic for reverting modifiers
        if (this.effect.modifiers) {
            this.effect.modifiers.forEach(modifier => {
                const stat = modifier.stat;
                if (typeof this.originalStats[stat] !== 'undefined') {
                    this.target.stats[stat] = this.originalStats[stat];
                }
            });
        }

        switch (this.effect.subType) {
            case 'Modifiers':
                // Handled by shared logic above
                break;

            case 'AreaEffect':
                // No state to revert
                break;

            case 'DoT':
                if (this.interval) clearInterval(this.interval);
                break;

            case 'flatChange':
                const stat = this.effect.stat;
                if (typeof this.originalStats[stat] !== 'undefined') {
                    this.target.stats[stat] = this.originalStats[stat];
                }
                break;

            case 'AreaDebuff':
                // No state on this effect to revert; the applied sub-effect will revert on its own.
                break;

            case 'DelayedDamage':
                const finalDamage = this.target.calculateFinalDamage(this.effect.value, this.effect.damageType);
                this.target.takeDamage(finalDamage);
                battleLog.log(`${this.target.name} takes ${finalDamage} delayed damage from ${this.effect.name}.`);
                break;

            case 'CooldownReduction':
                // One-shot effect, no revert needed
                break;

            case 'Fear':
                this.target.startSkills();
                break;

            case 'percentChange':
                const percStat = this.effect.stat;
                if (typeof this.originalStats[percStat] !== 'undefined') {
                    this.target.stats[percStat] = this.originalStats[percStat];
                }
                break;

            case 'Vulnerability':
                const resStat = `${this.effect.damageType.toLowerCase()}Resistance`;
                if (typeof this.originalStats[resStat] !== 'undefined') {
                    this.target.stats[resStat] = this.originalStats[resStat];
                }
                break;

            case 'Invisibility':
                this.target.invisible = false;
                break;

            case 'ManaShield':
                this.target.manaShieldActive = false;
                this.target.manaShieldRatio = 0;
                break;

            case 'GuaranteedDodge':
                this.target.hasGuaranteedDodge = false;
                break;

            case 'Regen':
                if (this.interval) clearInterval(this.interval);
                break;

            case 'RestoreResource':
            case 'Steal':
                // One-shot effects, no revert needed
                break;

            case 'stealth':
                this.target.invisible = false;
                // Modifier reversion is handled by shared logic above.
                break;

            case 'Stun':
                this.target.startSkills();
                break;

            case 'Summon':
            case 'Teleport':
            case 'Trap':
                // One-shot or engine-handled effects, no state to revert on the member
                break;

            case 'Taunt':
                if (this.target.forcedTarget === this.caster || this.target.forcedTarget === "Caster") {
                    this.target.forcedTarget = null;
                }
                break;

            case 'EmpowerNextSpell':
                // This effect is typically consumed by a spell, which would call .remove().
                // If it expires by duration, clear the empowerment flag.
                if (this.target.empoweredSpell) {
                    this.target.empoweredSpell = null;
                }
                break;

            default:
                // No warning needed here as it would have been caught in applyEffect
        }
    }


    createDamageOverTimeInterval(damage, damageType, target) {
        this.interval = setInterval(() => {
            const finalDamage = target.calculateFinalDamage(damage, damageType);
            target.takeDamage(finalDamage);
            battleLog.log(`${target.name} takes ${finalDamage} ${damageType} damage from ${this.effect.name}.`);
        }, 1000);
    }

    createHealOverTimeInterval(heal, target) {
        this.interval = setInterval(() => {
            target.healDamage(heal);
            battleLog.log(`${target.name} regenerates ${heal} health from ${this.effect.name}.`);
        }, 1000);
    }

    summon(caster, who, limit) {
        const currentSummons = caster.team.members.filter(m => m.isSummon && m.summoner === caster).length;
        if (currentSummons < limit) {
            const mobData = mobsClasses[who];
            if (!mobData) {
                console.error(`Summon failed: Mob data for '${who}' not found.`);
                return;
            }
            var member = new Member(mobData.name, mobData, mobData.skills, caster.level);
            member.initialize(caster.opposingTeam, caster.team, caster.team.members.length + 1);
            member.isSummon = true;
            member.summoner = caster; // Link summon to its caster
            renderTeamMembers([member], caster.team.id, false);
            member.startSkills();

            caster.team.addMembers([member]);
        } else {
            console.log(`${caster.name} cannot summon more ${who}, limit of ${limit} reached.`);
        }
    }

    updateTooltip() {
        if (!this.tooltip) return;
        let tooltipText = `<b>${this.effect.name}</b>`;
        if (this.effect.description) {
            tooltipText += `<br>${this.effect.description}`;
        }
        if (!this.isPassive && this.effect.duration > 0) {
            const timeLeft = Math.ceil(this.getTimeLeft());
            tooltipText += `<br><i>${timeLeft}s remaining</i>`;
        }
        this.tooltip.innerHTML = tooltipText;
    }

    remove() {
        if (!this.isPassive) {
            clearTimeout(this.timer);
            if (this.tooltipInterval) clearInterval(this.tooltipInterval);
            if (this.interval) clearInterval(this.interval);
        }
        this.revertEffect();
        const index = this.target.effects.indexOf(this);
        if (index !== -1) {
            this.target.effects.splice(index, 1);
        }
        if (this.element) this.element.remove();
    }

    // Pause/Unpause logic remains the same as it's generic timer management
    pause() {
        if (this.isPassive || this.isPaused) return;

        this.isPaused = true;
        this.pauseStartTime = Date.now();

        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        if (this.tooltipInterval) {
            clearInterval(this.tooltipInterval);
            this.tooltipInterval = null;
        }
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    unpause() {
        if (this.isPassive || !this.isPaused) return;

        const pauseDurationMs = Date.now() - this.pauseStartTime;
        if (this.startTime) {
            this.startTime += pauseDurationMs;
        }

        this.isPaused = false;

        if (!this.isPassive && this.effect.duration > 0) {
            const timeLeft = this.getTimeLeft();
            this.setTimer(timeLeft);
            this.startTooltipTimer();
        }

        if (this.effect.subType === 'Regen') {
            this.createHealOverTimeInterval(this.effect.value, this.target);
        } else if (['DoT'].includes(this.effect.subType)) {
            this.createDamageOverTimeInterval(this.effect.value, this.effect.damageType, this.target);
        }
    }

    // This is called by the Member's attack logic
    handleStealthAttack() {
            this.remove();

    }
}

export default EffectClass;