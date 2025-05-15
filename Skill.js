// Skill.js
import {renderLevelUp, updateMana, updateStamina} from './Render.js';
import {selectTarget} from './Targeting.js';
import {battleStarted} from './Battle.js'; // battleStarted from Battle.js
import {battleStatistics, hero as globalHero} from './initialize.js'; // For hero check in finishCooldown

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
        this.onCooldown = false; // Initialized
        this.damageType = skillData.damageType;
        this.targetingModes = skillData.targetingModes;
        this.extraTargets = skillData.extraTargets;
        this.effects = effects;
        this.div = element;
        this.repeat = true; // Default repeat state
        this.level = 1;
        this.experience = 0;
        this.experienceToNextLevel = 100;
        this.baseDamage = 1;
        this.overlay = null; // Initialized
        this.boundAnimationEndCallback = null; // For storing the specific animationend listener
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
        this.experience += amount;
        while (this.experience >= this.experienceToNextLevel) {
            this.levelUp();
            renderLevelUp(this);
        }
    }

    levelUp() {
        this.experience -= this.experienceToNextLevel;
        this.level += 1;
        this.experienceToNextLevel = Math.floor(this.experienceToNextLevel * 1.5);
        this.baseDamage = Math.floor(this.baseDamage * 1.05);
        if (this.effects && typeof this.effects.value === 'number') { // Check if effects.value is a number
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
        if (this.type === "active" && this.div == null && !member.isHero) {
            const skillDivId = member.memberId + "Skill" + this.name.replace(/\s/g, '');
            this.div = member.element ? member.element.querySelector("#" + skillDivId) : null;
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

            } else {
                if (this.repeat && member.isHero) {
                    setTimeout(() => {
                        if (battleStarted && member.currentHealth > 0 && !this.onCooldown && this.repeat) {
                            const isSelected = globalHero && globalHero.selectedSkills.some(s => s && s.id === this.id);
                            if (isSelected) {
                                this.useSkill(member);
                            }
                        }
                    }, 1000);
                }
            }
        }
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
        this.onCooldown = false;
        this.remainingDuration = 0;
        this.cooldownStartTime = null;
        if (this.overlay) {
            if (this.boundAnimationEndCallback) {
                this.overlay.removeEventListener('animationend', this.boundAnimationEndCallback);
                this.boundAnimationEndCallback = null;
            }
            this.overlay.classList.add('hidden');
            this.overlay.style.animation = '';
            this.overlay.style.height = '0%';
            this.overlay.classList.remove('paused');
        }
        if (this.div) {
            this.div.classList.remove('disabled');
        }
    }

    startCooldown(member) {
        this.cooldownStartTime = Date.now();
        this.remainingDuration = this.cooldown;
        this.onCooldown = true;
        if (this.div) {
            this.updateCooldownAnimation(member);
        }
    }

    reduceCooldown(amount, member) {
        const elapsedTime = this.cooldownStartTime ? (Date.now() - this.cooldownStartTime) / 1000 : 0;
        this.remainingDuration = Math.max(0, this.cooldown - elapsedTime - amount);

        if (this.remainingDuration > 0) {
            this.cooldownStartTime = Date.now() - ((this.cooldown - this.remainingDuration) * 1000);
            if (this.div) this.updateCooldownAnimation(member);
        } else {
            // Ensure onCooldown is false before finishCooldown in case of direct call leading to repeat
            const wasOnCooldown = this.onCooldown;
            this.onCooldown = false;
            if (this.div) {
                this.finishCooldown(member, this.repeat && wasOnCooldown); // Pass wasOnCooldown state for repeat logic
            } else {
                 this.remainingDuration = 0;
                 this.cooldownStartTime = null;
                 if (this.repeat && wasOnCooldown && battleStarted && member && member.currentHealth > 0) {
                     this.useSkill(member);
                 }
            }
        }
    }

    updateCooldownAnimation(member) {
        if (this.div) {
            if (this.overlay == null) {
                this.overlay = this.div.querySelector(".cooldown-overlay");
                if (!this.overlay) {
                    console.error("Cooldown overlay not found for skill:", this.name, "in div:", this.div);
                    return;
                }
            }

            if (this.boundAnimationEndCallback) {
                this.overlay.removeEventListener('animationend', this.boundAnimationEndCallback);
            }

            this.boundAnimationEndCallback = () => {
                this.finishCooldown(member, this.repeat); // 'this.repeat' is the current state
            };
            // Use { once: true } for safety, though explicit removal is also done.
            this.overlay.addEventListener('animationend', this.boundAnimationEndCallback, { once: true });

            this.div.classList.add('disabled');
            this.overlay.classList.remove('hidden');
            this.overlay.classList.remove('paused');
            this.overlay.style.animation = '';
            this.overlay.offsetHeight;

            const remainingPercentage = (this.remainingDuration / this.cooldown) * 100;
            this.overlay.style.height = `${remainingPercentage}%`;

            if (this.remainingDuration > 0) {
                this.overlay.style.animation = `fill ${this.remainingDuration}s linear forwards`;
            } else {
                // If duration is already 0, finishCooldown might have been called by reduceCooldown,
                // or this is an edge case. Call it to ensure clean state.
                this.finishCooldown(member, false); // Don't repeat if duration was already 0 here.
            }
        }
    }

    finishCooldown(member, repeat = false) {
        // Remove the listener if it was set and this function is called
        if (this.overlay && this.boundAnimationEndCallback) {
            this.overlay.removeEventListener('animationend', this.boundAnimationEndCallback);
            this.boundAnimationEndCallback = null; // Clear stored ref
        }

        this.remainingDuration = 0;
        this.cooldownStartTime = null;

        if (this.overlay) {
           this.overlay.classList.add('hidden');
           this.overlay.style.animation = '';
           this.overlay.style.height = '0%';
           this.overlay.classList.remove('paused');
        }
        if (this.div) {
            this.div.classList.remove('disabled');
        }

        const wasOnCooldown = this.onCooldown; // Capture state before changing
        this.onCooldown = false; // Set this state BEFORE attempting to use skill again

        // 'repeat' param indicates if the call to finishCooldown was from a context where repeat is desired
        // 'this.repeat' is the skill's current repeat toggle state.
        // 'wasOnCooldown' ensures we only auto-repeat if it *was actually* on cooldown.
        if (repeat && this.repeat && wasOnCooldown && battleStarted && member && member.currentHealth > 0) {
            if (member.isHero) {
                const heroInstance = globalHero;
                if (!heroInstance || !heroInstance.selectedSkills.some(s => s && s.id === this.id)) {
                    return;
                }
                this.useSkill(heroInstance);
            } else {
                this.useSkill(member);
            }
        }
    }

    applySavedState(data) {
        this.level = data.level || 1;
        this.experience = data.experience || 0;
        this.experienceToNextLevel = data.experienceToNextLevel || 100;
        this.baseDamage = data.baseDamage || this.baseDamage;
        if (data.hasOwnProperty('repeat')) { // Restore repeat state if saved
            this.repeat = data.repeat;
        }
    }
}

export default Skill;