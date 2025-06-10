// Skill.js
import {renderLevelUp, updateMana, updateStamina} from './Render.js';
import {selectTarget} from './Targeting.js';
import {battleController, battleStatistics, hero as globalHero} from './initialize.js';
import EffectClass from './EffectClass.js';


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
        this.targetCount = skillData.targetCount || 1;
        this.effects = effects;
        this.div = element;
        this.repeat = false;
        this.level = 1;
        this.experience = 0;
        this.experienceToNextLevel = 100;
        this.baseDamage = 1;
        this.overlay = null;
        this.boundAnimationEndCallback = null;
        this.needsInitialCooldownKickoff;
        this.tags = skillData.tags;
        this.isPassive = skillData.type === "passive";
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
        if (this.div && (this.div.closest('#team1')||this.div.closest('#bottomContainer'))) {
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
        console.log(member.name + " MANA before:" +member.currentMana +" COST:" +this.manaCost)
        member.currentMana -= this.manaCost;
        member.currentStamina -= this.staminaCost;
        console.log(member.name + " MANA After:" +member.currentMana )

        updateMana(member);
        updateStamina(member);
        console.log(member.name + " MANA render:" +member.currentMana )
    }

    handleExpGain(member) {
        battleStatistics.addSkillUsage(this.name);
        battleStatistics.addManaSpent(this.manaCost);
        battleStatistics.addStaminaSpent(this.staminaCost);
    }

    applyPassiveEffect(member) {
        if (!this.isPassive) return;

        console.log(`[Skill ${this.name}] Applying passive effect for ${member.name}`);
        
        // Handle both single effect and effects array
        const effectsToApply = Array.isArray(this.effects) ? this.effects : [this.effects];
        
        effectsToApply.forEach(effect => {
            if (!effect) return;

            // Create a proper effect object for EffectClass
            const effectObject = {
                name: this.name,
                type: effect.type || 'buff',
                subType: effect.subtype || 'flatChange',
                stat: effect.stat,
                value: effect.value,
                duration: -1, // Unlimited duration for passives
                icon: this.icon,
                stackMode: "refresh" // Passives should refresh rather than stack
            };

            // Apply the effect using EffectClass
            new EffectClass(member, effectObject);
        });
    }

    useSkill(member) {
        // For passive skills, just apply the effect and return
        if (this.isPassive) {
            this.applyPassiveEffect(member);
            return true;
        }

        console.log(`[Skill ${this.name}] useSkill called for ${member.name}`, {
            isHero: member.isHero,
            needsInitialCooldownKickoff: this.needsInitialCooldownKickoff,
            hasDiv: !!this.div,
            hasElement: !!member.element,
            battleStarted: battleController.battleState.battleStarted
        });

        // Handle initial cooldown setup for non-hero skills
        if (this.type === "active" && !member.isHero && this.needsInitialCooldownKickoff) {
            // Initialize skill element if not already set
            if (!this.div && member.element) {
                const skillDivId = member.memberId + "Skill" + this.name.replace(/\s/g, '');
                const skillElement = member.element.querySelector("#" + skillDivId);
                if (skillElement) {
                    this.setElement(skillElement);
                }
            }

            // Start initial cooldown for non-hero skills
            if (this.div) {
                console.log(`[Skill ${this.name}] Starting initial cooldown for ${member.name}`);
                this.startCooldown(member);
                this.updateCooldownAnimation(member);
                this.needsInitialCooldownKickoff = false;
                return true;
            }
        }

        if (this.type == "active" && battleController.battleState.battleStarted) {
            console.log(`[Skill ${this.name}] Checking resources for ${member.name}`, {
                currentMana: member.currentMana,
                manaCost: this.manaCost,
                currentStamina: member.currentStamina,
                staminaCost: this.staminaCost
            });

            if (this.manaCost <= member.currentMana && this.staminaCost <= member.currentStamina) {
                console.log(`[Skill ${this.name}] Resources sufficient, executing skill for ${member.name}`);
                this.startCooldown(member);
                this.handleSkillCost(member);
                if (member.isHero) {
                    this.handleExpGain(member);
                }

                var targets = selectTarget(member, this.targetingModes[0]);
                
                // Handle multiple targets for the same effect
                if (this.targetCount > 1) {
                    // If we have fewer targets than targetCount, we'll hit the same targets multiple times
                    const originalTargets = [...targets];
                    for (let i = 1; i < this.targetCount; i++) {
                        targets = targets.concat(originalTargets);
                    }
                }

                // Handle extra targets with different effects (existing functionality)
                if (this.extraTargets != undefined) {
                    this.extraTargets.forEach(mode => {
                        targets = targets.concat(selectTarget(member, mode));
                    })
                }

                console.log(`[Skill ${this.name}] Selected targets:`, targets.map(t => t.name));
                targets.forEach(target => {
                    member.performAttack(member, target, this);
                });
                console.log(member.name + " MANA End:" +member.currentMana )
                return true;

            } else {
                console.log(`[Skill ${this.name}] Insufficient resources for ${member.name}`);
                if (this.repeat && member.isHero) {
                    setTimeout(() => {
                        if (battleController.battleState.battleStarted && member.currentHealth > 0 && !this.onCooldown && this.repeat) {
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

        // Always try to get a fresh reference to the overlay
        this.overlay = this.div.querySelector(".cooldown-overlay");
        if (!this.overlay) {
            console.warn(`[Skill ${this.name}] No cooldown overlay found for ${member.name}`);
            return;
        }

        // Clear previous listener and animation
        if (this.boundAnimationEndCallback) {
            this.overlay.removeEventListener('animationend', this.boundAnimationEndCallback);
            this.boundAnimationEndCallback = null;
        }

        // Reset overlay state
        this.overlay.style.animation = '';
        this.overlay.classList.remove('hidden', 'paused');
        this.overlay.offsetHeight; // Force reflow

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
        
        // Set initial height based on remaining duration
        const remainingPercentage = Math.max(0, (this.remainingDuration / this.cooldown) * 100);
        this.overlay.style.height = `${remainingPercentage}%`;

        // Force another reflow to ensure height is applied before animation
        this.overlay.offsetHeight;

        // Only apply animation if there's a duration
        if (this.remainingDuration > 0) {
            this.overlay.style.animation = `fill ${this.remainingDuration}s linear forwards`;
        } else {
            // Fallback: if somehow duration is 0 here, ensure cleanup
            this.finishCooldown(member, false);
        }
    }

    finishCooldown(member, shouldAttemptRepeat = false) {
        console.log(`[Skill ${this.name}] finishCooldown called for ${member.name}`, {
            wasOnCooldown: this.onCooldown,
            shouldAttemptRepeat,
            battleStarted: battleController.battleState.battleStarted,
            memberHealth: member.currentHealth
        });

        const wasTrulyOnCooldown = this.onCooldown;

        if (this.overlay && this.boundAnimationEndCallback) {
            this.overlay.removeEventListener('animationend', this.boundAnimationEndCallback);
            this.boundAnimationEndCallback = null;
        }

        // Reset cooldown state variables
        this.remainingDuration = 0;
        this.cooldownStartTime = null;
        this.onCooldown = false;

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

        if (shouldAttemptRepeat && wasTrulyOnCooldown &&
            battleController.battleState.battleStarted && member && member.currentHealth > 0) {

            let canUse = false;
            if (member.isHero) {
                const heroInstance = globalHero;
                if (heroInstance && heroInstance.selectedSkills) {
                    canUse = heroInstance.selectedSkills.some(s => s && s.id === this.id);
                }
            } else {
                canUse = this.manaCost <= member.currentMana && this.staminaCost <= member.currentStamina;
            }

            console.log(`[Skill ${this.name}] Attempting repeat for ${member.name}`, {
                canUse,
                isHero: member.isHero,
                hasResources: this.manaCost <= member.currentMana && this.staminaCost <= member.currentStamina
            });

            if (canUse) {
                // For non-hero skills, we need to check if this is the first use after initial cooldown
                if (!member.isHero && this.needsInitialCooldownKickoff) {
                    this.needsInitialCooldownKickoff = false;
                    this.useSkill(member); // This will trigger the initial cooldown
                } else {
                    this.useSkill(member);
                }
            } else if (this.repeat) {
                // Add retry mechanism for both hero and non-hero skills when resources are insufficient
                const retrySkill = (retryCount = 0) => {
                    if (battleController.battleState.battleStarted && member.currentHealth > 0 && !this.onCooldown && this.repeat) {
                        let canUse = false;
                        if (member.isHero) {
                            const heroInstance = globalHero;
                            if (heroInstance && heroInstance.selectedSkills) {
                                canUse = heroInstance.selectedSkills.some(s => s && s.id === this.id);
                            }
                        } else {
                            canUse = this.manaCost <= member.currentMana && this.staminaCost <= member.currentStamina;
                        }

                        if (canUse) {
                            this.useSkill(member);
                        } else if (retryCount < 5) { // Limit retries to prevent infinite loops
                            // If still can't use, retry with increasing delay
                            const delay = Math.min(1000 * (retryCount + 1), 5000); // Cap at 5 seconds
                            setTimeout(() => retrySkill(retryCount + 1), delay);
                        }
                    }
                };

                // Start the retry chain
                setTimeout(() => retrySkill(0), 1000);
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