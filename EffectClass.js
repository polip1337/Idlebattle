// EffectClass.js
import { mobsClasses, renderTeamMembers, hero, battleStatistics } from './initialize.js';
import Member from './Member.js'
import { deepCopy } from './Render.js';
import {updateHealth,updateMana,updateStamina} from './Render.js';
import { selectTarget } from './Targeting.js';
class EffectClass {
    constructor(target, effect, caster = null, skill = null) {
        this.effect = deepCopy(effect); // Stores the original effect data
        this.name = effect.name;
        this.type = effect.type;
        this.subType = effect.subType;
        this.stat = effect.stat;
        this.value = effect.value;
        this.duration = effect.duration;
        this.icon = effect.icon;
        this.stackMode = effect.stackMode;
        this.id = effect.id || Math.random().toString(36).substring(2, 9); // Ensure unique ID
        this.condition = effect.condition;
        this.target = target;
        this.caster = caster;
        this.skill = skill;
        this.timer = null;
        this.startTime = null;
        this.remainingTime = null;
        this.render = true;
        if(skill && skill.type === "passive") {
            this.isPassive = true;
        } else {
            this.isPassive = false;
        }
        this.isPaused = false;
        this.pauseStartTime = null;

        if(!this.effect.icon) {
            this.effect.icon = this.effect.type === "buff" ? "Media/UI/buff.svg" : "Media/UI/debuff.svg";
        }

        // One-shot effects that don't need timers or rendering
        if (['CooldownReduction', 'RestoreResource', 'Steal', 'Summon', 'Dispel'].includes(this.effect.subType)) {
            this.render = false;
            this.applyEffectLogic(skill); // Changed from applyEffect to avoid confusion with the method below
            return; // Don't store in memory, just apply and return
        }

        // Handle passive effects
        if (this.isPassive) {
            // For passive effects, we want to apply them immediately and keep them active
            this.effect.type ="buff";
            this.effect.name = this.skill.name;
            this.effect.description = this.skill.description;
            this.effect.icon = this.skill.icon;

            this.applyEffectLogic(skill);
            if (this.render && this.effect.icon) {
                this.renderBuff();
                this.updateTooltip();
            }
            this.target.addEffect(this, 'passive', this.skill); // Add to effectsMap
            return;
        }

        // Handle non-passive effects
        if (effect.stackMode === "duration" && this.target.hasEffect(this.id)) { // Use target.hasEffect
            this.extendTimer(effect.duration);
            this.target.addEffect(this, 'active', this.skill); // Still add it if it's new
        } else if (effect.stackMode === "refresh" && this.target.hasEffect(this.id)) { // Use target.hasEffect
            this.refreshTimer();
            this.target.addEffect(this, 'active', this.skill); // Still add it if it's new
        } else {
            this.applyEffectLogic(skill); // Changed from applyEffect
            if (this.render) {
                this.renderBuff();
            }
            if (this.effect.duration > 0) {
                this.startTimer();
                this.startTooltipTimer();
            } else if (!this.render) {
                this.remove();
            }
            this.target.addEffect(this, 'active', this.skill); // Add to effectsMap
        }
    }

    renderBuff() {
        // Create effects container if it doesn't exist
        let effectsContainer = document.querySelector(`#${this.target.memberId} .effects`);
        if (!effectsContainer) {
            effectsContainer = document.createElement('div');
            effectsContainer.classList.add('effects');
            document.querySelector(`#${this.target.memberId}`).appendChild(effectsContainer);
        }

        this.element = document.createElement('div');
        var icon = document.createElement('img');
        icon.src = this.effect.icon;
        this.element.classList.add(this.effect.type);
        this.tooltip = document.createElement('div');
        this.tooltip.classList.add('effectTooltip');

        this.element.appendChild(icon);
        this.element.appendChild(this.tooltip);
        effectsContainer.appendChild(this.element);

        // Update tooltip immediately
        this.updateTooltip();
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
        // Find the existing effect instance in the target's effectsMap
        const existingEffectEntry = this.target.effectsMap.get(this.id);
        if (!existingEffectEntry) return;

        const otherEffect = existingEffectEntry.effect; // Get the EffectClass instance
        const timeLeft = otherEffect.getTimeLeft();
        otherEffect.effect.duration = timeLeft + additionalTime;
        otherEffect.startTime = Date.now();
        otherEffect.setTimer(otherEffect.effect.duration);
        otherEffect.updateTooltip();
    }

    refreshTimer() {
        // Find the existing effect instance in the target's effectsMap
        const existingEffectEntry = this.target.effectsMap.get(this.id);
        if (!existingEffectEntry) return;

        const otherEffect = existingEffectEntry.effect; // Get the EffectClass instance
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
        return target.hasEffect(effect.id);
    }

    getAlreadyApplied(effect, target) {
        return target.getEffect(effect.id);
    }

    startTooltipTimer() {
        if (this.isPassive || this.isPaused || this.effect.duration <= 0) return;

        this.tooltipInterval = setInterval(() => {
            this.updateTooltip();
        }, 1000);
    }

    // This method contains the actual logic for applying the effect's impact
    applyEffectLogic(skill = null) {


        // Handle effect-specific logic that directly modifies member properties or triggers intervals
        switch (this.effect.subType) {
            case 'DoT':
            case 'Bleed':
                if (this.effect.value > 0) {
                    this.createDamageOverTimeInterval(this.effect.value, this.effect.damageType || 'Physical', this.target);
                }
                break;

            case 'RestoreResource':
                this.handleResourceRestore();
                break;

            case 'Steal':
                if (this.caster && this.caster.isHero) {
                    this.caster.addGold(this.effect.value);
                }
                break;

            case 'Stun':
                this.target.stopSkills();
                // The 'stunned' state is now implicitly handled by `target.stopSkills()` and `target.startSkills()`
                // and the presence of a 'Stun' effect in the effectsMap.
                break;

            case 'Taunt':
                if (this.caster) {
                    // The 'forcedTarget' property on the target member is set by this effect.
                    this.target.forcedTarget = this.caster;
                }
                break;

            case 'CooldownReduction':
                if (this.target.isHero) {
                    // For hero, only reduce cooldowns of selected skills
                    this.target.selectedSkills.forEach(selectedSkill => {
                        if (selectedSkill && selectedSkill.onCooldown && selectedSkill !== this.skill) {
                            selectedSkill.reduceCooldown(this.effect.value, this.target);
                        }
                    });
                } else {
                    // For non-hero targets, reduce all cooldowns except the source skill
                    this.target.skills.forEach(skill => {
                        if (skill.onCooldown && skill !== this.skill) {
                            skill.reduceCooldown(this.effect.value, this.target);
                        }
                    });
                }
                break;

            case 'aura':
                this.startAuraEffect();
                break;

            case 'Summon':
                this.summon(this.caster, this.effect.who, this.effect.limit);
                break;

            case 'Dispel':
                this.handleDispel();
                break;

            case 'Regen':
                this.createHealOverTimeInterval(this.effect.value, this.target);
                break;

            default:
                 console.warn(`Effect subType '${this.effect.subType}' from '${this.effect.name}' is not directly applied here.`);
        }
    }

    createDamageOverTimeInterval(damage, damageType, target) {
        this.interval = setInterval(() => {
            target.takeDamage(damage);

        }, 1000);
    }

    createHealOverTimeInterval(heal, target) {
        this.interval = setInterval(() => {
            target.healDamage(heal);

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

        // Add modifier information
        if (this.effect.modifiers) {
            tooltipText += '<br><br>Effects:';
            this.effect.modifiers.forEach(modifier => {
                const stat = modifier.stat;
                let modifierText = '';

                if (modifier.flat) {
                    const sign = modifier.flat > 0 ? '+' : '';
                    modifierText += `${sign}${modifier.flat} ${stat}`;
                }

                if (modifier.percentage) {
                    if (modifierText) modifierText += ', ';
                    const sign = modifier.percentage > 0 ? '+' : '';
                    modifierText += `${sign}${modifier.percentage}% ${stat}`;
                }

                if (modifierText) {
                    tooltipText += `<br>${modifierText}`;
                }
            });
        }
        // Add specific effect types that act like modifiers
        if (this.effect.subType === 'Vulnerability') {
            tooltipText += `<br>Vulnerability to ${this.effect.damageType}: ${this.effect.value}%`;
        }
        if (this.effect.subType === 'ManaShield') {
            tooltipText += `<br>Mana Shield: Absorbs ${this.effect.value * 100}% of incoming damage as mana cost.`;
        }
        if (this.effect.subType === 'GuaranteedDodge') {
            tooltipText += `<br>Guaranteed Dodge on next attack.`;
        }
        if (this.effect.subType === 'EmpowerNextSpell') {
            tooltipText += `<br>Next spell has +${this.effect.critChanceBonus}% Crit Chance, +${this.effect.damageBonusPercentage}% Damage, +${this.effect.manaCostIncreasePercentage}% Mana Cost.`;
        }
        if (this.effect.subType === 'damageBonusConditional') {
            tooltipText += `<br>Conditional Damage Bonus: ${this.effect.value}%`;
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
            if (this.auraInterval) clearInterval(this.auraInterval);
        }

        // Handle effect-specific cleanup that needs to reverse changes
        switch (this.effect.subType) {
            case 'Stun':
                // Only start skills if no other stun effects are active
                const remainingStunEffects = this.target.getEffects().filter(e => e.effect.subType === 'Stun' && e.id !== this.id);
                if (remainingStunEffects.length === 0) {
                    this.target.startSkills();
                }
                break;
            case 'Taunt':
                // Only clear forcedTarget if this was the active taunt
                if (this.target.forcedTarget === this.caster) {
                    this.target.forcedTarget = null;
                }
                break;
            case 'ManaShield':
                // No specific cleanup needed, as `calculateFinalDamage` checks for presence
                break;
            case 'GuaranteedDodge':
                 // No specific cleanup needed, as `calculateHitChance` checks for presence
                break;
            case 'EmpowerNextSpell':
                // No specific cleanup needed, consumed on use
                break;
             case 'stealth':
                // No specific cleanup needed, consumed on use
                break;
             case 'onSkillUseTrigger':
                // No specific cleanup needed, removed when triggered or duration expires
                break;
             case 'onGettingHitTrigger':
                // No specific cleanup needed, removed when triggered or duration expires
                break;
        }

        // Remove from effects map on the target
        this.target.removeEffect(this.id);

        // Remove from DOM
        if (this.element) this.element.remove();
    }

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
        } else if (['DoT', 'Bleed'].includes(this.effect.subType)) {
            this.createDamageOverTimeInterval(this.effect.value, this.effect.damageType, this.target);
        }
    }

    handleResourceRestore() {
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
    }

    handleDispel() {
        if (this.effect.debuffType) {
            // Get all debuffs from the target's effectsMap that match the dispel type
            const debuffsToRemove = Array.from(this.target.effectsMap.values()).filter(entry =>
                entry.effect.type === 'debuff' && this.effect.debuffType.includes(entry.effect.name)
            );
            debuffsToRemove.forEach(entry => entry.effect.remove()); // Call remove on the EffectClass instance
        } else if (this.effect.buffType) {
            // Similarly for buffs
            const buffsToRemove = Array.from(this.target.effectsMap.values()).filter(entry =>
                entry.effect.type === 'buff' && this.effect.buffType.includes(entry.effect.name)
            );
            buffsToRemove.forEach(entry => entry.effect.remove());
        }
    }

    startAuraEffect() {
        this.auraInterval = setInterval(() => {
            let targets = [];
            if (this.effect.targetingMode) {
                targets = selectTarget(this.target, this.effect.targetingMode);
            } else {
                // If no specific targeting mode, assume it affects allies or enemies based on aura type
                // For auras, typically it affects own team members if not specified
                targets = this.target.team.getAllAliveMembers();
            }

            targets.forEach(member => {
                if (!member.dead) {
                    if (this.effect.value && this.effect.targetResource === 'health') {
                        member.healDamage(this.effect.value);
                    }
                    if (this.effect.effectToApply) {
                        new EffectClass(member, this.effect.effectToApply, this.target, this.skill);
                    }
                }
            });
        }, 1000);
    }
}

export default EffectClass;