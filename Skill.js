// Skill.js
import {renderLevelUp, updateMana, updateStamina} from './Render.js';
import {selectTarget} from './Targeting.js';
import {battleStarted} from './Battle.js';
import {battleStatistics, hero as globalHero} from './initialize.js';

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
        this.effects = effects;
        this.div = element;
        this.repeat = true;
        this.level = 1;
        this.experience = 0;
        this.experienceToNextLevel = 100;
        this.baseDamage = 1;
        this.overlay = null;
        this.boundAnimationEndCallback = null;
        this.needsInitialCooldownKickoff;
    }

    setElement(element) {
        this.div = element;
    }

    calculateDamage(member) {
        let damage = this.damage * this.baseDamage * member.stats.damage;
        if (this.damageType === 'physical') {
            damage += member.stats.strength;
        } else if (this.damageType === 'magical') {
            damage += member.stats.magicPower;
        }
        return damage;
    }

    gainExperience(amount) {
        // Only allow hero team skills to gain experience
        if (this.div && this.div.closest('#team1')) {
            this.experience += amount;
            while (this.experience >= this.experienceToNextLevel) {
                this.levelUp();
                renderLevelUp(this);
            }
        }
    }

    levelUp() {
        this.experience -= this.experienceToNextLevel;
        this.level += 1;
        this.experienceToNextLevel = Math.floor(this.experienceToNextLevel * 1.5);
        this.baseDamage = Math.floor(this.baseDamage * 1.05);
        if (this.effects && typeof this.effects.value === 'number') {
            this.effects.value = Math.floor(this.effects.value * 1.05);
        }
    }

    handleSkillCost(member) {
        member.currentMana -= this.manaCost;
        member.currentStamina -= this.staminaCost;
        updateMana(member);
        updateStamina(member);
    }

    handleExpGain(member) {
        battleStatistics.addSkillUsage(this.name);
        battleStatistics.addManaSpent(this.manaCost);
        battleStatistics.addStaminaSpent(this.staminaCost);
    }

    useSkill(member) {
        if (this.type === "active" && !member.isHero && this.needsInitialCooldownKickoff) {
            this.div = null;
            this.overlay = null;
            if (this.div == null && member.element) {
                const skillDivId = member.memberId + "Skill" + this.name.replace(/\s/g, '');
                this.setElement(member.element.querySelector("#" + skillDivId)); // Use setElement
            }

            if (this.div) {
                this.startCooldown(member);
                this.updateCooldownAnimation;
                this.needsInitialCooldownKickoff = false;
                return true;
            }
        }

        if (this.type == "active" && battleStarted) {
            if (this.manaCost <= member.currentMana && this.staminaCost <= member.currentStamina) {
                this.startCooldown(member);
                this.handleSkillCost(member);
                if (member.isHero) {
                    this.handleExpGain(member);
                }

                var targets = selectTarget(member, this.targetingModes[0]);
                if (this.extraTargets != undefined) {
                    this.extraTargets.forEach(mode => {
                        targets = targets.concat(selectTarget(member, mode));
                    })
                }

                targets.forEach(target => {
                    member.performAttack(member, target, this);
                });
                return true;

            } else {
                if (this.repeat && member.isHero) { // Only hero skills retry on insufficient resources currently
                    setTimeout(() => {
                        if (battleStarted && member.currentHealth > 0 && !this.onCooldown && this.repeat) {
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
        }
    }

    unpause() {
        if (this.type == "active" && this.div && this.overlay && this.overlay.classList.contains('paused')) {
            this.overlay.classList.remove('paused');
        }
    }

    heroStopSkill() {
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
        if (this.div) {
            this.updateCooldownAnimation(member);
        } else if (this.cooldown === 0) { // Handle non-visual 0 CD skills immediately
            this.finishCooldown(member, this.repeat);
        }
    }

    reduceCooldown(amount, member) {
        // Only reduce if actually on cooldown and has a remaining duration.
        if (!this.onCooldown || this.remainingDuration <= 0) {
            return;
        }

        const wasOnCooldownState = this.onCooldown; // Should be true here

        // Calculate how much time has "conceptually" passed due to the reduction
        const effectiveElapsedTimeReduction = amount;
        this.remainingDuration -= effectiveElapsedTimeReduction;

        // Adjust cooldownStartTime as if 'amount' seconds just passed instantly
        if (this.cooldownStartTime) {
            this.cooldownStartTime += amount * 1000;
        }


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

        if (this.overlay == null) {
            this.overlay = this.div.querySelector(".cooldown-overlay");
            if (!this.overlay) return;
        }

        // Clear previous listener and animation
        if (this.boundAnimationEndCallback) {
            this.overlay.removeEventListener('animationend', this.boundAnimationEndCallback);
        }
        this.overlay.style.animation = '';

        // If not on cooldown or duration is zero, finish (handles cleanup)
        if (!this.onCooldown || this.remainingDuration <= 0) {
            this.finishCooldown(member, false); // Don't attempt repeat if called in this state
            return;
        }

        this.boundAnimationEndCallback = () => {
            // When animation ends, repeat if this.repeat is true AND it was genuinely on cooldown
            this.finishCooldown(member, this.repeat && this.onCooldown);
        };
        this.overlay.addEventListener('animationend', this.boundAnimationEndCallback, { once: true });

        this.div.classList.add('disabled');
        this.overlay.classList.remove('hidden', 'paused');
        this.overlay.offsetHeight; // Reflow

        const remainingPercentage = Math.max(0, (this.remainingDuration / this.cooldown) * 100);
        this.overlay.style.height = `${remainingPercentage}%`;

        // Only apply animation if there's a duration.
        // A remainingDuration of 0 should have been caught by the check above.
        if (this.remainingDuration > 0) {
             this.overlay.style.animation = `fill ${this.remainingDuration}s linear forwards`;
        } else {
            // Fallback: if somehow duration is 0 here, ensure cleanup
            this.finishCooldown(member, false);
        }
    }

    finishCooldown(member, shouldAttemptRepeat = false) {
        const wasTrulyOnCooldown = this.onCooldown; // Capture state before modification

        if (this.overlay && this.boundAnimationEndCallback) {
            this.overlay.removeEventListener('animationend', this.boundAnimationEndCallback);
            this.boundAnimationEndCallback = null;
        }

        // Reset cooldown state variables
        this.remainingDuration = 0;
        this.cooldownStartTime = null;
        this.onCooldown = false; // OFFICIALLY OFF COOLDOWN

        // Visual cleanup
        if (this.overlay) {
           this.overlay.classList.add('hidden');
           this.overlay.style.animation = '';
           this.overlay.style.height = '0%';
           this.overlay.classList.remove('paused');
        }
        if (this.div) {
            this.div.classList.remove('disabled');
        }

        // Attempt repeat if:
        // 1. The context of calling finishCooldown suggests a repeat (shouldAttemptRepeat is true).
        // 2. The skill was *actually* on cooldown when this process started (wasTrulyOnCooldown).
        // 3. Battle conditions are met.
        if (shouldAttemptRepeat && wasTrulyOnCooldown &&
            battleStarted && member && member.currentHealth > 0) {

            let canUse = false;
            if (member.isHero) {
                const heroInstance = globalHero;
                if (heroInstance && heroInstance.selectedSkills.some(s => s && s.id === this.id)) {
                    canUse = true;
                }
            } else {
                canUse = true;
            }

            if (canUse) {
                this.useSkill(member);
            }
        }
    }

    applySavedState(data) {
        this.level = data.level || 1;
        this.experience = data.experience || 0;
        this.experienceToNextLevel = data.experienceToNextLevel || 100;
        this.baseDamage = data.baseDamage || this.baseDamage;
        if (data.hasOwnProperty('repeat')) {
            this.repeat = data.repeat;
        }
    }
}

export default Skill;