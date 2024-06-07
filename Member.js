import { startBattle, createRandomMembers } from './Battle.js';
import { updateHealth, updateMana, updateAttackBar,updateStatus,updateStatsDisplay } from './RenderMember.js';
import { isPaused } from './Main.js';
import EffectClass from './EffectClass.js';


class Member {
constructor(name, classType, stats,skills, memberId, team,opposingTeam) {
        this.name = name;
        this.classType = classType;
        this.team = team;
        this.opposingTeam = opposingTeam;
        this.level = 1;
        this.experience = 0;
        this.stats = stats;
        this.skills = skills;
        this.currentHealth = this.stats.vitality * 10;
        this.currentMana = this.stats.mana;
        this.memberId = memberId;
        this.attackCharge = 0;
        this.chargeInterval = null;
        this.healthBar = null;  // Initialize healthBar to null
        this.manaBar = null;
        this.attackBar = null;
        this.status = null;
        this.statsDisplay = null;
        this.effects = []; // Array to store active effects
        this.dragStartHandler = this.dragStartHandler.bind(this);
        this.dragOverHandler = this.dragOverHandler.bind(this);
        this.dropHandler = this.dropHandler.bind(this);
        this.effectsElement = document.createElement('div');
        this.effectsElement.className = 'effects';


    }

    initializeDOMElements() {
        this.statsDisplay = document.querySelector(`#${this.memberId} .stats`);
        this.status = document.querySelector(`#${this.memberId} .status`);
        this.element = document.querySelector(`#${this.memberId}`);
        this.element.appendChild(this.effectsElement);

        updateHealth(this);
        updateMana(this);
        updateAttackBar(this);
        updateStatsDisplay(this);
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

    chargeAttack() {
            if(this.currentHealth >0)
            this.chargeInterval = setInterval(() => {
                if (isPaused) return;

                this.attackCharge += this.stats.speed / 10;
                if (this.attackCharge >= 100) {
                    clearInterval(this.chargeInterval);
                    this.attackCharge = 0;
                    updateAttackBar(this);
                    this.performAttack(this.opposingTeam.getFirstAliveMember());
                }
                updateAttackBar(this);
            }, 50);

    }


    performAttack(target) {
            // Choose a random skill
            const skillIndex = Math.floor(Math.random() * this.skills.length);
            const skill = this.skills[skillIndex];
            var damage = 0;
            // If the skill has a mana cost, check if there's enough mana to use it
            if (this.currentMana >= skill.manaCost) {

                    if (skill.effect) {
                        new EffectClass(target ,skill.effect);
                    }
                    // Deduct mana cost
                    this.currentMana -= skill.manaCost;
                    updateMana(this);
                    updateStatus(this, `Used ${skill.name} on ${target.name}`);
                    damage = skill.damage;
            } else {
                updateStatus(this,'Not enough mana to use this skill');
                damage = this.stats.strength * 2;
            }
            // Apply damage to the target
            target.currentHealth -= damage;
            updateHealth(target);
            // Start charging next attack
            this.chargeAttack();

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
        updateStatsDisplay(this);
    }

    gainExperience(exp) {
        this.experience += exp;
        if (this.experience >= this.level * 100) {
            this.levelUp();
        }
        updateStatsDisplay(this);
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
        updateStatsDisplay(this.element);

    }



}

export default Member;
