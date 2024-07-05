import {deepCopy, updateExp, updateExpBarText, updateHealth, updateMana, updateStamina} from './Render.js';
import {battleLog, battleStatistics, evolutionService, hero} from './initialize.js';
import EffectClass from './EffectClass.js';
import Skill from './Skill.js';


class Member {
    constructor(name, classInfo, skills, level = 1, team = null, opposingTeam = null, isHero = false) {
        this.name = name;
        this.classType = classInfo.name;
        this.class = classInfo;
        this.team = team;
        this.opposingTeam = opposingTeam;
        this.level = level;
        this.isHero = isHero;
        this.stats = deepCopy(classInfo.stats);
        this.statsPerLevel = classInfo.statsPerLevel;
        this.summons = 0;
        this.positions = classInfo.positions;
        if (this.positions == undefined) {
            this.position = "Front";

        } else {
            this.position = classInfo.positions[0];
        }
        this.dead = false;

        this.currentHealth = this.stats.vitality * 10;
        this.maxHealth = this.stats.vitality * 10;
        this.currentMana = this.stats.mana;
        this.currentStamina = this.stats.stamina;

        this.effects = [];
        this.skills = this.createSkills(skills);
        this.dragStartHandler = this.dragStartHandler.bind(this);
        this.dragOverHandler = this.dragOverHandler.bind(this);
        this.dropHandler = this.dropHandler.bind(this);

        this.experience = 0;
        this.experienceToLevel = 100;
        for (var i = 1; i < level; i++) {
            this.levelUp();
        }
    }

    initialize(team1, team2, memberId) {
        this.memberId = `team2-member` + memberId;
        this.team = team2;
        this.opposingTeam = team1;

    }

    initializeDOMElements() {
        this.element = document.querySelector(`#${this.memberId}`);
    }

    makeDraggable() {
        this.element.setAttribute('draggable', 'true');
        this.element.addEventListener('dragstart', this.dragStartHandler);
        this.element.addEventListener('dragover', this.dragOverHandler);
        this.element.addEventListener('drop', this.dropHandler);
    }

    dragStartHandler(event) {
        event.dataTransfer.setData('text/plain', this.memberId);
    }

    dragOverHandler(event) {
        event.preventDefault();
    }

    dropHandler(event) {
        event.preventDefault();
        const memberId = event.dataTransfer.getData('text/plain');
        const member = document.getElementById(memberId);
        const target = event.currentTarget;

        // Ensure the member and target are valid nodes before inserting
        if (!this.isSameTeam(member, target)) {
            alert('No swapping teams!');
            return; // Abort the drop operation
        }
        // Determine the index of the dragged element and the target element
        const memberIndex = Array.from(target.parentNode.children).indexOf(member);
        const targetIndex = Array.from(target.parentNode.children).indexOf(target);

        const parent = target.parentNode;
        if (targetIndex > memberIndex) {
            parent.insertBefore(member, parent.children[targetIndex]);
            parent.insertBefore(target, parent.children[memberIndex]);
        } else {
            if (memberIndex === parent.children.length - 1) {
                parent.appendChild(target);
            } else {
                parent.insertBefore(target, parent.children[memberIndex]);
            }
            parent.insertBefore(member, parent.children[targetIndex]);
        }

    }

    isSameTeam(member, target) {
        // Get the team (parent element) of both member and target
        const parentOfMember = member.parentNode;
        const parentOfTarget = target.parentNode;

        // Check if both member and target belong to the same team
        return parentOfMember === parentOfTarget;
    }

    createSkills(skills) {
        var allSkills = [];
        skills.forEach(skill => {
            var skill = new Skill(skill, skill.effects, null);
            if (!this.isHero) {
                skill.repeat = true;
            }
            allSkills.push(skill);
        });
        return allSkills;
    }

    calculateHitChance(defender, skillModifier) {
        if (this == defender) {
            console.log("Self targeted");
            return true;
        }
        var hitChance = 80 + Math.floor(this.stats.dexterity * 0.1) - Math.floor(defender.stats.dexterity * 0.1) + this.stats.accuracy - defender.stats.dodge;
        if (skillModifier != undefined) {
            hitChance += skillModifier;
        }


        const randomNumber = Math.floor(Math.random() * 101);
        if (randomNumber <= hitChance) {
            return true;
        }
        battleLog.log(this.name + " Missed " + defender.name + "! Hit chance was: " + hitChance + '%');
        return false;
    }

    performAttack(member, target, skill, isHero = false) {
        if (this.calculateHitChance(target, skill.toHit)) {


            if (skill.effects) {
                new EffectClass(target, skill.effects);
            }
            this.currentMana -= skill.manaCost;
            updateMana(this);
            if (skill.damageType && skill.damage != 0) {
                const damage = skill.calculateDamage(this);
                const finalDamage = target.calculateFinalDamage(damage, skill.damageType);

                target.takeDamage(finalDamage);
                if (isHero) {
                    skill.gainExperience(finalDamage);
                    battleStatistics.addDamageDealt(skill.damageType, finalDamage);
                }
                if (target.name == 'Hero') {
                    battleStatistics.addDamageReceived(skill.damageType, finalDamage);
                }

                battleLog.log(this.name + ` used ${skill.name} on ${target.name} dealing ` + finalDamage + ' damage.');

            }
            if (skill.heal) {
                skill.gainExperience(skill.heal);
                target.healDamage(skill.heal);
                battleLog.log(target.name + 'Healed for' + skill.heal);
            }
        }
    }

    calculateFinalDamage(damage, damageType) {
        if (damageType != 'Bleed') {
            damage = this.applyBlock(damage);
            damage = this.applyArmor(damage);
        }
        damage = this.applyResistance(damage, damageType);
        return Math.floor(damage);
    }

    applyBlock(damage) {
        if (Math.random() * 100 < this.stats.blockChance) {
            return damage * 0.5; // Reduce damage by 50% if block succeeds
        }
        return damage;
    }

    applyArmor(damage) {
        return Math.max(0, damage - this.stats.armor); // Reduce damage by armor amount
    }

    applyResistance(damage, damageType) {
        const resistance = this.stats.resistances[damageType] || 0;
        const reducedDamage = damage * (1 - resistance / 100);
        return reducedDamage;
    }

    healDamage(heal) {
        this.currentHealth += heal;
        if (this.currentHealth > this.maxHealth) {
            this.currentHealth = this.maxHealth;
        }
        updateHealth(this); // Update the overlay to reflect new health
    }

    takeDamage(damage) {
        if (!this.dead) {
            this.currentHealth -= damage;
            if (this.currentHealth < 0) {
                this.handleDeath();
            }
            updateHealth(this); // Update the overlay to reflect new health
        }
    }

    handleDeath() {
        this.currentHealth = 0;
        this.element.querySelector(".memberPortrait img").src = "Media/UI/dead.jpg";
        this.dead = true;
        this.stopSkills();
        if (this.name != 'Hero') {
            hero.gainExperience(this.class.experience);

        }
    }

    stopSkills() {
        this.skills.forEach(skill => {
            skill.pause(this);
        });
    }

    startSkills() {
        this.skills.forEach(skill => {
            skill.unpause(this);
        });
    }

    gainExperience(exp) {
        this.experience += exp;
        if (this.experience >= this.experienceToLevel) {
            this.levelUp();
        }
        updateExp(this);

    }

    levelUp() {
        this.level++;
        for (const stat in this.statsPerLevel) {
            this.stats[stat] += this.statsPerLevel[stat];
        }
        this.currentHealth = this.stats.vitality * 10;
        this.maxHealth = this.stats.vitality * 10;
        this.maxMana = this.stats.mana;
        this.currentMana = this.stats.mana;
        if (this.name == 'Hero') {
            updateExpBarText(this.classType + " Level: " + this.level);
            if ([2, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096].includes(this.level)) {
                evolutionService.levelThresholdReached(1);
                return true;
            }
        }
        this.experience = 0;
        this.experienceToLevel = Math.floor(this.experienceToLevel * 1.1);


    }

    handleRegeneration() {
        if (this.currentHealth <= 0) return; // Do not regenerate if the member is defeated

        // Regenerate mana
        this.currentMana = Math.min(this.stats.mana, this.currentMana + this.stats.manaRegen);
        updateMana(this);

        // Regenerate stamina
        this.currentStamina = Math.min(this.stats.stamina, this.currentStamina + Math.floor(0.1 * this.stats.vitality));
        updateStamina(this);

        // Regenerate health
        this.currentHealth = Math.min(this.maxHealth, parseFloat(this.currentHealth) + parseFloat((0.01 * this.stats.vitality)));
        this.currentHealth = this.currentHealth.toFixed(2);
        this.currentHealth = parseFloat(this.currentHealth.toString());
        updateHealth(this);
    }


}

export default Member;
