import { startBattle, createRandomMembers } from './Battle.js';
import { updateHealth, updateMana,updateStamina } from './Render.js';
import { isPaused } from './Main.js';
import { selectTarget } from './Targeting.js';
import EffectClass from './EffectClass.js';
import Skill from './Skill.js';
import {battleLog} from './Main.js';


class Member {
constructor(name, classType,classInfo, memberId, team,opposingTeam, position) {
        this.name = name;
        this.classType = classType;
        this.class = classInfo;
        this.team = team;
        this.opposingTeam = opposingTeam;
        this.level = 1;
        this.experience = 0;
        this.stats = classInfo.stats;
        this.skills = this.createSkills(classInfo.skills);
        this.positions = classInfo.positions;
        this.position = position;
        this.resistances = classInfo.resistances;
        this.armor = classInfo.armor;
        this.blockChance = classInfo.blockChance;

        this.currentHealth = this.stats.vitality * 10;
        this.maxHealth = this.stats.vitality * 10;
        this.currentMana = this.stats.mana;
        this.currentStamina = this.stats.vitality * 10;
        this.memberId = memberId;
        this.attackCharge = 0;

        this.chargeInterval = null;
        this.healthBar = null;  // Initialize healthBar to null
        this.manaBar = null;
        this.attackBar = null;
        this.status = null;
        this.statsDisplay = null;
        this.blind = null;
        this.charm = null;
        this.clone = null;
        this.confused = null;
        //Cursed?
        this.disarmed = null;
        this.entrap = null;
        this.fear = null;
        this.hexproof = null;
        this.invisible = null;
        this.lifesteal = null;
        this.marked = null;
        this.reflect = null;
        this.silence = null;
        this.sleep = null;
        this.effects = []; // Array to store active effects
        this.dragStartHandler = this.dragStartHandler.bind(this);
        this.dragOverHandler = this.dragOverHandler.bind(this);
        this.dropHandler = this.dropHandler.bind(this);
    }

    initializeDOMElements() {
        this.element = document.querySelector(`#${this.memberId}`);

         this.makeDraggable();
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
        if(targetIndex > memberIndex){
            parent.insertBefore(member, parent.children[targetIndex]);
            parent.insertBefore(target, parent.children[memberIndex]);
        }
        else{
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
        return skills.map(skillData => {
            const skill = new Skill(skillData.name,skillData.type, skillData.icon, skillData.description, skillData.damage,
             skillData.manaCost, skillData.staminaCost, skillData.cooldown, skillData.damageType, skillData.targetingModes, skillData.effect);
            return skill;
        });
    }
    chargeAttack() {
            if(this.currentHealth >0)
            this.chargeInterval = setInterval(() => {
                if (isPaused) return;

                this.attackCharge += this.stats.speed / 10;
                if (this.attackCharge >= 100) {
                    clearInterval(this.chargeInterval);
                    this.attackCharge = 0;
                    const skill = this.selectSkill();
                    const target = this.selectTarget(skill);
                    this.performAttack(target,skill);
                }
            }, 50);

    }
    calculateHitChance(defender) {
    const hitChance = this.calculateAccuracy() - defender.calculateDodge();
    return true;
    }

    calculateAccuracy() {
        return (this.stats.dexterity * 0.5) + (this.stats.speed * 0.3) + this.stats.accuracy;
      }

      calculateDodge() {
        return (this.stats.dexterity * 0.4) + (this.stats.speed * 0.6) + this.stats.dodge;
      }

    performAttack(target, skill) {
        if (this.calculateHitChance(target)) {


            if (skill.effect) {
                new EffectClass(target ,skill.effect);
            }
            this.currentMana -= skill.manaCost;
            updateMana(this);
            battleLog.log(this.name + ` Used ${skill.name} on ${target.name}`);
            const damage = skill.calculateDamage(this);
            const finalDamage = target.calculateFinalDamage(damage, skill.damageType);
            skill.gainExperience(finalDamage);

            // Apply damage to the target
            target.takeDamage(finalDamage);
        }
    }
    calculateFinalDamage(damage, damageType){
        damage = this.applyBlock(damage);
        damage = this.applyArmor(damage);
        damage = this.applyResistance(damage, damageType);
        return Math.floor(damage);
    }
    applyBlock(damage) {
        if (Math.random() * 100 < this.blockChance) {
          return damage * 0.5; // Reduce damage by 50% if block succeeds
        }
        return damage;
      }

      applyArmor(damage) {
        return Math.max(0, damage - this.armor); // Reduce damage by armor amount
      }
    applyResistance(damage, damageType) {
        const resistance = this.resistances[damageType] || 0;
        const reducedDamage = damage * (1 - resistance / 100);
        return reducedDamage;
    }
    takeDamage(damage) {
        this.currentHealth -= damage;
        if (this.currentHealth < 0) this.currentHealth = 0;
        updateHealth(this); // Update the overlay to reflect new health
    }
    useSkill(opponent) {
        const damage = this.stats.magicPower * 3;
        opponent.currentHealth = Math.max(0, opponent.currentHealth - damage);
        updateHealth(opponent);
        this.currentMana -= 10;
        updateMana(this);
        updateStatus(this,'Using Skill');
        opponent.updateStatus(this,'Defending');
    }

    regenMana() {
        this.currentMana = Math.min(this.stats.mana, this.currentMana + this.stats.manaRegen);
        updateMana(this);
    }

    gainExperience(exp) {
        this.experience += exp;
        if (this.experience >= this.level * 100) {
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.experience = 0;
        this.stats.strength += 2;
        this.stats.speed += 2;
        this.stats.dexterity += 2;
        this.stats.vitality += 5;
        this.stats.magicPower += 2;
        this.stats.mana += 5;
        this.stats.manaRegen += 1;
        this.stats.magicControl += 2;
        this.currentHealth = this.stats.vitality * 10;
        this.currentMana = this.stats.mana;
        updateHealth(this);
        updateMana(this);
        updateStatus(this,`Leveled Up to ${this.level}`);

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
        this.currentHealth = Math.min(this.maxHealth, this.currentHealth + (0.01 * this.stats.vitality).toFixed(2));
        updateHealth(this);
    }


}

export default Member;
