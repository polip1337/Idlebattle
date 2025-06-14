import {deepCopy, updateExp, updateExpBarText, updateHealth, updateMana, updateStamina} from './Render.js';
import {battleLog, battleStatistics, evolutionService, hero, allSkillsCache} from './initialize.js';
import EffectClass from './EffectClass.js';
import Skill from './Skill.js';

class Member {
    constructor(name, classInfo, skillsSource, level = 1, team = null, opposingTeam = null, isHero = false) {

        this.name = name;
        this.classType = classInfo.name;
        this.classId = classInfo.combina;
        this.class = classInfo; // This should be the raw class definition object
        this.team = team;
        this.opposingTeam = opposingTeam;
        this.level = level;
        this.isHero = isHero;
        this.stats = deepCopy(classInfo.stats);
        this.statsPerLevel = classInfo.statsPerLevel;
        this.summons = 0;
        this.positions = classInfo.positions;
        this.position = this.positions ? this.positions[0] : "Front";
        this.dead = false;
        this.goldDrop = classInfo.goldDrop || 0;
        this.isSummon = false; // New field to track if this member is a summon
        this.forcedTarget = null; // Add forced target property
        this.damageBonuses = [];
        // Initialize critical hit stats if not present
        if (!this.stats.critChance) this.stats.critChance = 5; // Base 5% crit chance
        if (!this.stats.critDamageMultiplier) this.stats.critDamageMultiplier = 2.0; // 200% damage on crit
        if (!this.stats.blockChance) this.stats.blockChance = 5; // Base 5% block chance
        this.stats.toHit = 0;
        this.stats.toDodge = 0;
        this.currentHealth = this.stats.vitality * 10;
        this.maxHealth = this.stats.vitality * 10;
        this.currentMana = this.stats.mana;
        this.currentStamina = this.stats.stamina;

        this.effects = [];

        // Skill instantiation logic
        if (Array.isArray(skillsSource) && skillsSource.length > 0) {
            if (typeof skillsSource[0] === 'string' && allSkillsCache) { // Check if it's array of IDs and cache exists
                this.skills = this.createSkillsFromIDs(skillsSource);
            } else if (skillsSource[0] instanceof Skill) { // Check if it's already array of Skill instances
                this.skills = skillsSource;
            } else if (typeof skillsSource[0] === 'object' && skillsSource[0].name && skillsSource[0].icon) { // Assume array of skill data objects
                this.skills = this.createSkills(skillsSource);
            } else {
                console.warn(`Unsupported skillsSource format for member ${this.name}:`, skillsSource);
                this.skills = [];
            }
        } else {
            this.skills = [];
        }

        this.dragStartHandler = this.dragStartHandler.bind(this);
        this.dragOverHandler = this.dragOverHandler.bind(this);
        this.dropHandler = this.dropHandler.bind(this);

        this.experience = 0;
        this.experienceToLevel = 100; // Base for level 1
        // Apply level-ups if initial level > 1
        const initialLevel = this.level; // Store initial level
        this.level = 0; // Reset level to 0 before leveling up
        for (let i = 0; i < initialLevel; i++) { // Loop up to the original desired level
            this.levelUp(false); // Pass false to prevent UI updates during initial setup for non-hero
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

        if (!this.isSameTeam(member, target)) {
            alert('No swapping teams!');
            return;
        }
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
        const parentOfMember = member.parentNode;
        const parentOfTarget = target.parentNode;
        return parentOfMember === parentOfTarget;
    }

    createSkills(skillsDataArray) { // Assumes skillsDataArray contains full skill definition objects
            return skillsDataArray.map(skillData => {
                if (!skillData) return null;
                return new Skill(skillData, skillData.effects, null);
            }).filter(s => s !== null);
        }

    createSkillsFromIDs(skillIDs) { // Assumes skillIDs are strings
        if (!allSkillsCache) {
            console.error("allSkillsCache not available in Member to create skills from IDs");
            return [];
        }
        return skillIDs.map(id => {
            const skillData = allSkillsCache[id];
            if (!skillData) {
                console.warn(`Skill ID ${id} not found in allSkillsCache for member ${this.name}.`);
                return null;
            }
            // skillData from allSkillsCache is an object: { name, icon, ..., effects: { ... } }
            return new Skill(skillData, skillData.effects); // Pass the whole skillData and its effects part
        }).filter(s => s !== null);
    }

    calculateHitChance(defender, skillModifier) {
        if (this == defender) {
            console.log("Self targeted");
            return true;
        }

        // Check for guaranteed dodge
        if (defender.hasGuaranteedDodge) {
            battleLog.log(`${defender.name} dodged the attack with Phased!`);
            battleStatistics.addSuccessfulDodge();
            defender.hasGuaranteedDodge = false; // Remove the dodge after use
            
            // Remove the GuaranteedDodge effect
            const dodgeEffect = defender.effects.find(effect => effect.effect.subType === 'GuaranteedDodge');
            if (dodgeEffect) {
                dodgeEffect.remove();
            }
            
            return false;
        }

        var hitChance = 80 + Math.floor(this.stats.dexterity * 0.1) - Math.floor(defender.stats.dexterity * 0.1) + this.stats.accuracy - defender.stats.dodge;
        
        // Add source's toHit modifiers from effects
        if (this.stats.toHit != undefined) {
                hitChance += this.stats.toHit;
            }

        // Subtract defender's toHit modifiers from effects
        if (defender.stats.toDodge != undefined) {
            hitChance += defender.stats.toDodge;
        }

        if (skillModifier != undefined) {
            hitChance += skillModifier;
        }

        const randomNumber = Math.floor(Math.random() * 101);
        if (randomNumber <= hitChance) {
            return true;
        }
        battleLog.log(this.name + " Missed " + defender.name + "! Hit chance was: " + hitChance + '%');
        battleStatistics.addMiss();
        return false;
    }

    performAttack(member, target, skill, isHero = false) {
        // Handle forced target if set
        const actualTarget = this.forcedTarget || target;

       

        // Check if target is on the same team
        if (actualTarget.team === this.team) {
            // Always apply healing to allies
             // Handle effects that apply to both allies and enemies
            if (skill.effects) {
                new EffectClass(actualTarget, skill.effects, this);
                skill.gainExperience(10); // Award experience for effect application
            }
            if (skill.heal) {
                const healAmount = skill.heal;
                actualTarget.healDamage(healAmount);
                skill.gainExperience(healAmount);
                battleLog.log(`${this.name} used ${skill.name} to heal ${actualTarget.name} for ${healAmount} health.`);
            }
        } else {
            // For enemies, check hit chance before applying damage
            if (this.calculateHitChance(actualTarget, skill.toHit)) {
                 // Handle effects that apply to both allies and enemies
                if (skill.effects) {
                    new EffectClass(actualTarget, skill.effects, this);
                    skill.gainExperience(10); // Award experience for effect application
                }
                if (skill.damageType && skill.damage != 0) {
                    const damage = skill.calculateDamage(this,actualTarget);
                    const finalDamage = actualTarget.calculateFinalDamage(damage, skill.damageType,this);

                    // Track simultaneous hits for multi-target skills
                    if (skill.targetCount && skill.targetCount > 1) {
                        battleStatistics.addEnemiesHitSimultaneously(skill.targetCount);
                    }

                    // Track minion damage
                    if (this.isSummon) {
                        battleStatistics.addDamageBySummons(finalDamage);
                    }
                    this.effects
                        .filter(effect => effect.effect.id === 'stealth')
                        .forEach(effect => effect.handleStealthAttack());

                    actualTarget.takeDamage(finalDamage);
                    if (this.isHero) { // Check if the attacker is the hero
                        skill.gainExperience(finalDamage);
                        battleStatistics.addDamageDealt(skill.damageType, finalDamage, skill.tags || []);
                    }
                    if (actualTarget.isHero) { // Check if the target is the hero
                        battleStatistics.addDamageReceived(skill.damageType, finalDamage);
                    }

                    battleLog.log(this.name + ` used ${skill.name} on ${actualTarget.name} dealing ` + finalDamage + ' damage.');
                }
            }
        }
    }

    calculateFinalDamage(damage, damageType,attacker = null) {
        // Check for critical hit first
        const isCrit = this.checkCriticalHit(attacker);
        if (isCrit) {
            damage *= this.stats.critDamageMultiplier;
            battleLog.log(`${this.name} landed a critical hit!`);
            if (this.isHero) {
                battleStatistics.addCriticalHit(damage);
            }

            // Handle onCritTrigger effects
            if (this.onCritTriggers && this.onCritTriggers.length > 0) {
                this.onCritTriggers.forEach(trigger => {
                    // Create the effect based on the trigger data
                    const effectData = {
                        id: trigger.effectId,
                        ...trigger.buffData,
                        caster: trigger.caster
                    };
                    new EffectClass(this, effectData, trigger.caster);
                });
            }

            // Trigger OnCriticalHit effects
            if (this.onCriticalHitEffects && this.onCriticalHitEffects.length > 0) {
                this.onCriticalHitEffects.forEach(trigger => {
                    // Apply each effect in the trigger's effects array
                    if (Array.isArray(trigger.effects)) {
                        trigger.effects.forEach(effect => {
                            new EffectClass(this, effect, trigger.caster);
                        });
                    } else {
                        new EffectClass(this, trigger.effects, trigger.caster);
                    }
                });
            }
        }

        // Handle mana shield damage first if active
        if (this.manaShieldActive) {
            const manaDamage = damage; // Full damage to mana
            const manaCost = Math.ceil(manaDamage * (this.manaShieldRatio)); // Convert damage to mana cost
            
            if (this.currentMana >= manaCost) {
                this.currentMana -= manaCost;
                if (this.isHero) {
                    battleStatistics.addManaUsed(manaCost);
                }
                updateMana(this);
                battleLog.log(`${this.name}'s mana shield absorbed ${manaDamage} damage, costing ${manaCost} mana.`);
                return 0; // No health damage taken
            } else {
                // Not enough mana to fully absorb
                const remainingDamage = Math.ceil(damage * (1 - (this.currentMana / manaCost)));
                this.currentMana = 0;
                if (this.isHero) {
                    battleStatistics.addManaUsed(this.currentMana);
                }
                updateMana(this);
                battleLog.log(`${this.name}'s mana shield was depleted, taking ${remainingDamage} damage.`);
                damage = remainingDamage;
            }
        }

        if (damageType != 'Bleed') {
            damage = this.applyBlock(damage);
            damage = this.applyArmor(damage);
        }
        damage = this.applyResistance(damage, damageType);
        return Math.floor(damage);
    }

    applyBlock(damage) {
        if (Math.random() * 100 < this.stats.blockChance) {
            battleStatistics.addSuccessfulBlock();
            battleLog.log(`${this.name} blocked part of the attack!`);
            return damage * 0.5;
        }
        return damage;
    }

    applyArmor(damage) {
        return Math.max(0, damage - this.stats.armor);
    }

    applyResistance(damage, damageType) {
        const resistance = this.stats.resistances[damageType] || 0;
        const reducedDamage = damage * (1 - resistance / 100);
        return reducedDamage;
    }

    healDamage(heal) {
        const actualHeal = Math.min(heal, this.maxHealth - this.currentHealth);
        this.currentHealth += actualHeal;
        if (this.isHero) {
            battleStatistics.addTotalHealingReceived(actualHeal);
        }
        updateHealth(this);
    }

    takeDamage(damage) {
        if (!this.dead) {
            // Track overkill damage
            if (this.currentHealth < damage && !this.isHero) {
                const overkillAmount = damage - this.currentHealth;
                battleStatistics.addOverkillDamage(overkillAmount);
            }

            // Track lifesteal
            if (this.lifesteal && !this.isHero) {
                const healthStolen = Math.floor(damage * (this.lifesteal / 100));
                battleStatistics.addHealthStolen(healthStolen);
                this.healDamage(healthStolen);
            }

            this.currentHealth -= damage;
            if (this.currentHealth < 0) {
                this.currentHealth = 0; // Ensure health doesn't go negative before death check
            }
            if (this.currentHealth <= 0) {
                this.handleDeath();
            }
            updateHealth(this);
        }
    }

    handleDeath() {
        this.currentHealth = 0;
        if (this.element) {
            this.element.querySelector(".memberPortrait img").src = "Media/UI/dead.jpg";
        }
        this.dead = true;
        this.stopSkills();
        if (!this.isHero) { // Only hero gains exp from mob deaths
            hero.gainExperience(this.class.experience || 0); // Ensure experience exists
            battleStatistics.addEnemyDefeated(this.classType);
        } else {
            battleLog.log("Hero has been defeated!");
            // Game over logic or revival logic could go here
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

    levelUp(updateHeroUI = true) { // Added updateHeroUI flag
        this.level++;
        if (this.statsPerLevel) {
            for (const stat in this.statsPerLevel) {
                if (this.stats.hasOwnProperty(stat) && this.statsPerLevel.hasOwnProperty(stat)) {
                    this.stats[stat] += this.statsPerLevel[stat];
                }
            }
        }
        this.maxHealth = this.stats.vitality * 10;
        this.currentHealth = this.maxHealth;

        // Recalculate max mana/stamina based on base from class and per level stats
        if (this.class && this.class.stats) { // Ensure this.class.stats exists
            this.stats.mana = (this.class.stats.mana || 0) + ((this.statsPerLevel?.mana || 0) * (this.level -1));
            this.stats.stamina = (this.class.stats.stamina || 0) + ((this.statsPerLevel?.stamina || 0) * (this.level -1));
        }
        this.currentMana = this.stats.mana;
        this.currentStamina = this.stats.stamina;


        if (this.isHero && updateHeroUI) { // Only update UI if it's the hero and flag is true
            updateExpBarText(this.classType + " Level: " + this.level);
             if (evolutionService && [2, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096].includes(this.level)) {
                //evolutionService.levelThresholdReached();
            }
            updateHealth(this);
            updateMana(this);
            updateStamina(this);
        }

        // Experience handling (relevant even if not hero, for internal consistency if needed)
        if (this.experience >= this.experienceToLevel) {
             this.experience -= this.experienceToLevel;
        } else if (this.level > 1 && this.experience < 0) { // If XP was already used by prior level up in multi-level
            // This case should be rare if experience is correctly deducted.
        }
        this.experienceToLevel = Math.floor(this.experienceToLevel * 1.1);

        if (this.experience >= this.experienceToLevel && this.level < 9999) { // Cap level for sanity
            this.levelUp(updateHeroUI); // Recurse for multi-level up
        }
    }

    gainExperience(exp) {
        if (!this.isHero) return; // Only hero gains experience this way
        this.experience += exp;
        if (this.experience >= this.experienceToLevel) {
            this.levelUp(); // Hero always updates UI on level up
        }
        updateExp(this);
    }

    handleRegeneration() {
        if (this.currentHealth <= 0) return;

        const manaRegenAmount = this.stats.manaRegen || 1;
        if (this.currentMana < this.stats.mana) {
            this.currentMana = Math.min(this.stats.mana, this.currentMana + manaRegenAmount);
            if (this.isHero && manaRegenAmount > 0) battleStatistics.addManaRegenerated(manaRegenAmount);
            updateMana(this);
        }

        const staminaRegenAmount = Math.floor(0.1 * this.stats.vitality) || 1;
        if (this.currentStamina < this.stats.stamina) {
            this.currentStamina = Math.min(this.stats.stamina, this.currentStamina + staminaRegenAmount);
            if (this.isHero && staminaRegenAmount > 0) battleStatistics.addStaminaRegenerated(staminaRegenAmount);
            updateStamina(this);
        }

        // Health regen (if any, e.g. 1% of vitality)
        const healthRegenAmount = parseFloat((0.01 * this.stats.vitality).toFixed(2)) || 0;
        if (this.currentHealth < this.maxHealth && healthRegenAmount > 0) {
             this.currentHealth = Math.min(this.maxHealth, this.currentHealth + healthRegenAmount);
             this.currentHealth = parseFloat(this.currentHealth.toFixed(2));
             updateHealth(this);
        }
    }
        // --- SERIALIZATION (IF NEEDED FOR NON-HERO MEMBERS) ---
        getSerializableData() {
            // If you need to save non-hero members, it would be similar to Hero's,
            // but likely simpler as they might not have multiple classes, detailed skill selections etc.
            return {
                name: this.name,
                classType: this.classType, // Used to find base definition on load
                combination: this.combination,
                level: this.level,
                currentHealth: this.currentHealth,
                currentMana: this.currentMana,
                currentStamina: this.currentStamina,
                // Store only what deviates from the base definition or is dynamic
                // For enemies, usually only currentHealth/Mana/Stamina and active effects might matter mid-battle.
                // For persistent NPC allies, it would be more like the Hero.
                experience: this.experience, // If they gain XP
                experienceToLevel: this.experienceToLevel,
                stats: deepCopy(this.stats), // If their stats can change independently of level ups
                skillProgression: this.isHero ? this.skills.map(s => ({ // Only save skill progression for hero
                    name: s.name,
                    level: s.level,
                    experience: s.experience,
                    experienceToNextLevel: s.experienceToNextLevel,
                    baseDamage: s.baseDamage,
                })) : [], // Non-heroes typically don't have skill progression saved this way
                // No selected skills for non-heroes usually
            };
        }

        restoreFromData(data, allMobClasses, allSkillsLookup) { // `allMobClasses` would be like `heroClasses`
            // This would be called if you were restoring, for example, a specific enemy's state.
            this.name = data.name;
            // this.classType = data.classType; // Already set by constructor based on definition
            // this.class = deepCopy(allMobClasses[this.classType]); // Base class info
            this.level = data.level;

            this.stats = deepCopy(data.stats); // Restore modified stats
            this.maxHealth = this.stats.vitality * 10; // Recalculate based on restored vitality
            this.currentHealth = Math.min(data.currentHealth, this.maxHealth);
            this.currentMana = Math.min(data.currentMana, this.stats.mana);
            this.currentStamina = Math.min(data.currentStamina, this.stats.stamina);

            this.experience = data.experience || 0;
            this.experienceToLevel = data.experienceToLevel || 100;
             if (this.constructor.name === 'Companion') {
                            return;
            }
            // Skip skill progression for companions
            if (this.constructor.name === 'Companion') {
                return;
            }

            // If non-heroes have skill progression (uncommon for standard mobs)
            if (data.skillProgression && data.skillProgression.length > 0 && allSkillsLookup) {
                const baseSkillsFromClass = allMobClasses[this.combination].skills.map(skillId => deepCopy(allSkillsLookup[skillId]));
                this.skills = baseSkillsFromClass.map(baseSkillData => {
                     const skillInstance = new Skill(baseSkillData, baseSkillData.effects);
                     const savedProg = data.skillProgression.find(sp => sp.name === skillInstance.name);
                     if (savedProg) {
                         skillInstance.applySavedState(savedProg);
                     }
                     return skillInstance;
                });
            } else if (allSkillsLookup) {
                // If no saved progression, just ensure skills are instantiated from base class definition
                const classDef = allMobClasses[this.classType];
                if (classDef && classDef.skills) {
                     this.skills = classDef.skills.map(skillId => {
                         const skillData = allSkillsLookup[skillId];
                         return new Skill(skillData, skillData.effects);
                     });
                }
            }

            // Note: For most enemy members, their `memberId`, `team`, `opposingTeam`, `element`
            // would be re-initialized when they are added to a battle/stage.
            // This `restoreFromData` would primarily be for stats and health if saved mid-combat.
        }

    checkCriticalHit(attacker) {
        // Base crit chance is 5% + 0.1% per point of dexterity
        let critChance = this.stats.critChance;

        // Check for target-specific crit bonus
        if (this.critChanceBonusNextAttackVsTarget) {
            const bonus = this.critChanceBonusNextAttackVsTarget;
            // Only apply the bonus if this is the original caster
            if (bonus.caster == attacker) {
                critChance += bonus.bonus;
                // Remove the effect after use
                const effect = this.effects.find(e =>
                    e.effect.modifiers && 
                    e.effect.modifiers.some(m => m.stat === 'critChanceBonusNextAttackVsTarget')
                );
                if (effect) {
                    effect.remove();
                }
            }
        }

        return Math.random() * 100 < critChance;
    }

    hasDebuffName(debuffNames) {
        if (!Array.isArray(debuffNames)) {
            debuffNames = [debuffNames];
        }
        return this.effects.some(effect => 
            effect.effect.type === 'debuff' &&
            debuffNames.includes(effect.effect.name)
        );
    }

    hasDebuff() {
        return this.effects.some(effect => effect.effect.type === 'debuff');
    }
}

export default Member;