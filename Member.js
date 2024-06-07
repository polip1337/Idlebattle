import { startBattle, createRandomMembers } from './Battle.js';


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
        this.buffs = []; // Array to store active buffs
        this.debuffs = []; // Array to store active debuffs
        this.dragStartHandler = this.dragStartHandler.bind(this);
        this.dragOverHandler = this.dragOverHandler.bind(this);
        this.dropHandler = this.dropHandler.bind(this);


    }

    initializeDOMElements() {
        this.healthBar = document.querySelector(`#${this.memberId} .health-bar`);
        this.manaBar = document.querySelector(`#${this.memberId} .mana-bar`);
        this.attackBar = document.querySelector(`#${this.memberId} .attack-bar`);
        this.status = document.querySelector(`#${this.memberId} .status`);
        this.statsDisplay = document.querySelector(`#${this.memberId} .stats`);
        this.element = document.querySelector(`#${this.memberId}`);
        this.updateHealth();
        this.updateMana();
        this.updateAttackBar();
         this.updateStatsDisplay();
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
    updateHealth() {
        const percentage = (this.currentHealth / (this.stats.vitality * 10)) * 100;
        this.healthBar.style.width = `${percentage}%`;
        this.healthBar.textContent = `HP: ${this.currentHealth}/${this.stats.vitality * 10}`;
    }

    updateMana() {
        const percentage = (this.currentMana / this.stats.mana) * 100;
        this.manaBar.style.width = `${percentage}%`;
        this.manaBar.textContent = `Mana: ${this.currentMana}/${this.stats.mana}`;
    }

    updateAttackBar() {
        this.attackBar.style.width = `${this.attackCharge}%`;
        this.attackBar.textContent = `Charging...`;
    }

    updateStatus(message) {
        this.status.textContent = `Status: ${message}`;
        if(message == "Defeated"){
            clearInterval(this.chargeInterval);
       }
    }

    updateStatsDisplay() {
        this.statsDisplay.innerHTML = `
            Class: ${this.classType}<br>
            Level: ${this.level}<br>
            Strength: ${this.stats.strength}<br>
            Speed: ${this.stats.speed}<br>
            Dexterity: ${this.stats.dexterity}<br>
            Vitality: ${this.stats.vitality}<br>
            Magic Power: ${this.stats.magicPower}<br>
            Mana: ${this.currentMana}/${this.stats.mana}<br>
            Mana Regen: ${this.stats.manaRegen}<br>
            Magic Control: ${this.stats.magicControl}
        `;
    }

    chargeAttack() {
            if(this.currentHealth >0)
            this.chargeInterval = setInterval(() => {
                this.attackCharge += this.stats.speed / 10;
                if (this.attackCharge >= 100) {
                    clearInterval(this.chargeInterval);
                    this.attackCharge = 0;
                    this.updateAttackBar();
                    this.performAttack(this.opposingTeam.getFirstAliveMember());
                }
                this.updateAttackBar();
            }, 50);

    }


    performAttack(target) {
            // Choose a random skill
            const skillIndex = Math.floor(Math.random() * this.skills.length);
            const skill = this.skills[skillIndex];
            var damage = 0;
            // If the skill has a mana cost, check if there's enough mana to use it
            if (this.currentMana >= skill.manaCost) {





                    // Apply buffs and debuffs
                    if (skill.buff) {
                        this.applyBuff(skill.buff);
                    }
                    if (skill.debuff) {
                        target.applyDebuff(skill.debuff);
                    }

                    // Deduct mana cost
                    this.currentMana -= skill.manaCost;
                    this.updateMana();
                    this.updateStatus(`Used ${skill.name} on ${target.name}`);
                    damage = skill.damage;
            } else {
                this.updateStatus('Not enough mana to use this skill');
                damage = this.stats.strength * 2;
            }
            // Apply damage to the target
            target.currentHealth -= damage;
            target.updateHealth();
            // Start charging next attack
            this.chargeAttack();

    }

    useSkill(opponent) {
        const damage = this.stats.magicPower * 3;
        opponent.currentHealth = Math.max(0, opponent.currentHealth - damage);
        opponent.updateHealth();
        this.currentMana -= 10;
        this.updateMana();
        this.updateStatus('Using Skill');
        opponent.updateStatus('Defending');
    }

    regenMana() {
        this.currentMana = Math.min(this.stats.mana, this.currentMana + this.stats.manaRegen);
        this.updateMana();
        this.updateStatsDisplay();
    }

    gainExperience(exp) {
        this.experience += exp;
        if (this.experience >= this.level * 100) {
            this.levelUp();
        }
        this.updateStatsDisplay();
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
        this.updateHealth();
        this.updateMana();
        this.updateStatus(`Leveled Up to ${this.level}`);
        this.updateStatsDisplay();
    }
    applyBuff(buff) {
        this.buffs.push(buff);
    }

    applyDebuff(debuff) {
        this.debuffs.push(debuff);
    }

    updateBuffsAndDebuffs() {
        // Update buffs
        for (const buff of this.buffs) {
            this.applyEffect(buff);
            buff.duration--;
        }
        this.buffs = this.buffs.filter(buff => buff.duration > 0);

        // Update debuffs
        for (const debuff of this.debuffs) {
            this.applyEffect(debuff);
            debuff.duration--;
        }
        this.debuffs = this.debuffs.filter(debuff => debuff.duration > 0);
    }

    applyEffect(effect) {
        for (const [stat, value] of Object.entries(effect.stats)) {
            this.stats[stat] += value;
        }
    }
}

export default Member;
