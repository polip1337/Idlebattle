import {renderLevelUp, updateMana, updateStamina} from './Render.js';
import {selectTarget} from './Targeting.js';
import {battleStarted} from './Battle.js';
import {battleStatistics} from './initialize.js';

class Skill {
    constructor(skillData, effects, element = null) {
        this.name = skillData.name;
        this.icon = skillData.icon;
        this.type = skillData.type;
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
        this.repeat = false;
        this.level = 1;
        this.experience = 0;
        this.experienceToNextLevel = 100; // Example value for level 1
        this.baseDamage = 1;
        this.overlay = null;
    }

    setElement(element) {
        this.div = element;
    }

    // Calculate damage based on the member's stats and skill level
    calculateDamage(member) {
        let damage = this.damage * this.baseDamage * member.stats.damage;
        if (this.damageType === 'physical') {
            damage += member.stats.strength;
        } else if (this.damageType === 'magical') {
            damage += member.stats.magicPower;
        }
        return damage;
    }

    // Gain experience for the skill
    gainExperience(amount) {

        this.experience += amount;
        while (this.experience >= this.experienceToNextLevel) {
            this.levelUp();
            renderLevelUp(this);
        }
    }

    // Level up the skill, increasing its potency
    levelUp() {
        this.experience -= this.experienceToNextLevel;
        this.level += 1;
        this.experienceToNextLevel = Math.floor(this.experienceToNextLevel * 1.5); // Increase experience needed for next level
        this.baseDamage = Math.floor(this.baseDamage * 1.05); // Increase base damage by 10% per level
        if (this.effectValue) {
            this.effectValue = Math.floor(this.effectValue * 1.05); // Increase effect value by 10% per level
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
        if (this.div == null) {
            this.div = member.element.querySelector("#" + member.memberId + "Skill" + this.name.replace(/\s/g, ''));
            this.startCooldown(member);
            return true;
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
                this.retry = setTimeout(() => {
                    this.useSkill(member);
                }, 1000);
            }
        }
    }

    pause() {
        if (this.type == "active" && this.div) {
            var overlay = this.div.querySelector(" .cooldown-overlay");
            overlay.classList.add('paused');
        }
    }

    unpause() {
        if (this.type == "active" && this.div) {
            var overlay = this.div.querySelector(" .cooldown-overlay");
            overlay.classList.remove('paused');
        }
    }

    heroStopSkill() {
        this.finishCooldown(this);
    }

    startCooldown(member) {
        this.cooldownStartTime = Date.now();
        this.remainingDuration = this.cooldown;
        this.onCooldown = true;
        this.updateCooldownAnimation(member);
    }

    reduceCooldown(amount, member) {
        const elapsedTime = (Date.now() - this.cooldownStartTime) / 1000;
        console.log("Elapsed time: " + elapsedTime);
        console.log("Total cooldown: " + this.cooldown);
        console.log("Amount to change: " + amount);

        this.remainingDuration = Math.max(0, this.cooldown - elapsedTime - amount);
        console.log("remainingDuration: " + this.remainingDuration);

        if (this.remainingDuration > 0) {
            this.updateCooldownAnimation(member);
        } else {
            console.log("Finishing early for skill " + this.name);
            this.finishCooldown(member, this.repeat);
        }
    }

    updateCooldownAnimation(member) {
        if( this.div){
            if (this.overlay == null) {
                this.overlay = this.div.querySelector(" .cooldown-overlay");
                this.overlay.addEventListener('animationend', () => {
                    this.finishCooldown(member, this.repeat);
                });
            }
            this.div.classList.add('disabled');
            this.overlay.classList.remove('hidden');
            this.overlay.style.animation = '';
            this.overlay.offsetHeight;

            const remainingPercentage = (this.remainingDuration / this.cooldown) * 100;
            this.overlay.style.height = `${remainingPercentage}%`;
            this.overlay.style.animation = `fill ${this.remainingDuration}s ease-in-out forwards`;
        }
    }

    finishCooldown(member, repeat = false) {
        if( this.div){
            if (this.overlay == null && this.div) {
                this.overlay = this.div.querySelector(" .cooldown-overlay");
            }
            this.remainingDuration = 0;
            this.cooldownStartTime = null;
            this.overlay.classList.add('hidden');  /* Hide the square */
            this.div.classList.remove('disabled');  /* Enable pointer events */
            this.onCooldown = false;
            if (repeat != false) {
                this.useSkill(member);
            }
        }
    }
}

export default Skill;

