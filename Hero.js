// Hero.js
import Member from './Member.js';
import {updatePassiveSkillBar, updateSkillBar,deepCopy, updateStatsDisplay, renderSkills, renderPassiveSkills, renderHeroInventory, renderEquippedItems, renderWeaponSkills, updateHealth, updateMana, updateStamina} from './Render.js';
import Skill from './Skill.js';
import Item from './Item.js'; // Add this
import EffectClass from './EffectClass.js'; // Add this

class Hero extends Member {
    constructor(name, classInfo, skills, level = 1, team, opposingTeam) {
        super(name, classInfo, skills, level, team, opposingTeam, true); // Member constructor handles this.stats

        this.class2 = null;
        this.skills2 = null; // Should probably be array of skill IDs or instances
        this.class3 = null;
        this.skills3 = null; // Should probably be array of skill IDs or instances

        this.selectedSkills = []; // Array of Skill instances
        this.selectedPassiveSkills = []; // Array of Skill instances

        this.position = 'Front'; // Or load from classInfo if available
        this.repeat = false; // For individual skills, not hero-wide

        this.availableClasses = []; // For evolutions
        this.class1Evolve = false;
        this.class2Evolve = false;
        this.class3Evolve = false;
        this.gold = 0;

        this.equipment = {
            weaponSlot: null,
            shieldSlot: null,
            helmetSlot: null,
            chestArmorSlot: null,
            legArmorSlot: null,
            glovesSlot: null,
            bootsSlot: null,
            amuletSlot: null,
            ringSlot: null,
            cloakSlot: null
        };
        this.inventory = []; // Array of Item instances

        // --- ENSURE THESE ARE INITIALIZED ---
        this.itemStatBonuses = {}; // Stores cumulative stat bonuses from items
        this.itemEffects = [];     // Stores active EffectClass instances from items (not directly used in recalculateHeroStats for stats.mana)
        // ------------------------------------

        // baseStats should be a deep copy of the stats derived from class + level ups, *before* item effects.
        // The Member constructor already sets this.stats based on classInfo and initial level ups.

        this.baseStats = deepCopy(this.stats);

    }

    addItemToInventory(itemInstance) {
        if (itemInstance instanceof Item) {
            this.inventory.push(itemInstance);
            if (typeof renderHeroInventory === "function") renderHeroInventory(this); // Update UI
        } else {
            console.error("Attempted to add non-Item to inventory:", itemInstance);
        }
    }

    removeItemFromInventory(itemInstance) {
        const index = this.inventory.indexOf(itemInstance);
        if (index > -1) {
            this.inventory.splice(index, 1);
            if (typeof renderHeroInventory === "function") renderHeroInventory(this); // Update UI
            return true;
        }
        return false;
    }

    _applyItemStats(item) {
        if (!item || !item.stats) return;
        for (const stat in item.stats) {
            this.stats[stat] = (this.stats[stat] || 0) + item.stats[stat];
            this.itemStatBonuses[stat] = (this.itemStatBonuses[stat] || 0) + item.stats[stat];
        }
    }

    _unapplyItemStats(item) {
        if (!item || !item.stats) return;
        for (const stat in item.stats) {
            this.stats[stat] = (this.stats[stat] || 0) - item.stats[stat];
            this.itemStatBonuses[stat] = (this.itemStatBonuses[stat] || 0) - item.stats[stat];
            if (this.itemStatBonuses[stat] === 0) {
                delete this.itemStatBonuses[stat];
            }
        }
    }

    _applyItemEffects(item) {
        if (!item || !item.effects || item.effects.length === 0) return;
        item.effects.forEach(effectData => {
            // Assuming item effects are persistent buffs/debuffs applied to the hero
            const effectInstance = new EffectClass(this, effectData);
            this.itemEffects.push({itemOriginId: item.id, effect: effectInstance});
        });
    }

    _unapplyItemEffects(item) {
        if (!item || !item.effects || item.effects.length === 0) return;
        this.itemEffects = this.itemEffects.filter(trackedEffect => {
            if (trackedEffect.itemOriginId === item.id) {
                trackedEffect.effect.remove(); // EffectClass should handle its removal
                return false; // Remove from tracked list
            }
            return true;
        });
    }


    recalculateHeroStats(updateDisplay = true) { // Added updateDisplay parameter
        // Ensure baseStats is available
        if (!this.baseStats && this.stats) {
            this.baseStats = deepCopy(this.stats);
        } else if (!this.baseStats) {
            console.error("Hero.recalculateHeroStats: baseStats is undefined and cannot be derived from this.stats.");
            this.baseStats = {}; // Prevent crash with deepCopy(undefined)
        }
        this.stats = deepCopy(this.baseStats);

        // Apply stats from all equipped items
        if (this.equipment) { // Guard against this.equipment being undefined
            for (const slot in this.equipment) {
                const item = this.equipment[slot];
                if (item && item.stats) {
                    for (const statKey in item.stats) {
                        this.stats[statKey] = (this.stats[statKey] || 0) + item.stats[statKey];
                    }
                }
            }
        }

        const oldMaxHealth = this.maxHealth;
        this.maxHealth = (this.stats.vitality || 0) * 10;
        if (this.maxHealth !== oldMaxHealth && oldMaxHealth > 0) {
             this.currentHealth = Math.round((this.currentHealth || 0) * (this.maxHealth / oldMaxHealth));
        } else if ((typeof this.currentHealth === 'undefined' || oldMaxHealth <=0) && this.maxHealth > 0) {
            this.currentHealth = this.maxHealth;
        }
        this.currentHealth = Math.min(this.currentHealth || 0, this.maxHealth);
        if (this.currentHealth <= 0 && this.maxHealth > 0) this.currentHealth = 1;

        // Safely access itemStatBonuses
        const itemManaBonus = (this.itemStatBonuses && this.itemStatBonuses.mana) || 0;
        const itemStaminaBonus = (this.itemStatBonuses && this.itemStatBonuses.stamina) || 0;

        this.stats.mana = (this.class.stats.mana || 0) +
                          ((this.statsPerLevel?.mana || 0) * (this.level - 1)) +
                          itemManaBonus;
        this.stats.stamina = (this.class.stats.stamina || 0) +
                             ((this.statsPerLevel?.stamina || 0) * (this.level - 1)) +
                             itemStaminaBonus;

        this.currentMana = Math.min(this.currentMana || 0, this.stats.mana);
        if(typeof this.currentMana === 'undefined' && this.stats.mana > 0) this.currentMana = this.stats.mana;

        this.currentStamina = Math.min(this.currentStamina || 0, this.stats.stamina);
        if(typeof this.currentStamina === 'undefined' && this.stats.stamina > 0) this.currentStamina = this.stats.stamina;


        if (updateDisplay) { // Conditionally update UI
            if (typeof updateStatsDisplay === "function") updateStatsDisplay(this);
            if (typeof updateHealth === "function") updateHealth(this);
            if (typeof updateMana === "function") updateMana(this);
            if (typeof updateStamina === "function") updateStamina(this);
        }
    }

    levelUp(updateHeroUI = true) { // updateHeroUI is true by default, but false from Member constructor
        // const oldStats = deepCopy(this.stats); // Not strictly needed if recalculating fully
        super.levelUp(updateHeroUI); // Parent handles base stat increases

        this.baseStats = deepCopy(this.stats); // this.stats now holds the new base from Member.levelUp

        // Ensure itemStatBonuses is an object, then clear it for recalculation
        this.itemStatBonuses = this.itemStatBonuses || {};
        Object.keys(this.itemStatBonuses).forEach(key => delete this.itemStatBonuses[key]);

        // Re-populate itemStatBonuses from equipment, if equipment is initialized
        if (this.equipment) {
            for (const slot in this.equipment) {
                const item = this.equipment[slot];
                if (item && item.stats) {
                    for (const statKey in item.stats) {
                        // Note: this.stats will be fully set in recalculateHeroStats.
                        // Here, we only accumulate itemStatBonuses.
                        this.itemStatBonuses[statKey] = (this.itemStatBonuses[statKey] || 0) + item.stats[statKey];
                    }
                }
            }
        }

        this.recalculateHeroStats(updateHeroUI); // Pass the flag to control UI updates
    }


    equipItem(itemInstance, targetSlotId) {
        if (!(itemInstance instanceof Item)) {
            console.error("Attempted to equip non-Item:", itemInstance);
            return false;
        }
        if (itemInstance.slot !== targetSlotId && itemInstance.type !== "consumable") { // Consumables don't use paper doll slots
            console.warn(`Item ${itemInstance.name} cannot be equipped in ${targetSlotId}. Expected slot: ${itemInstance.slot}`);
            return false;
        }
        if (!this.equipment.hasOwnProperty(targetSlotId)) {
            console.error(`Invalid equipment slot: ${targetSlotId}`);
            return false;
        }

        // Unequip current item in slot, if any
        if (this.equipment[targetSlotId]) {
            this.unequipItem(targetSlotId, false); // Don't rerender yet
        }

        // Remove from inventory
        this.removeItemFromInventory(itemInstance); // This will call renderHeroInventory

        // Equip new item
        this.equipment[targetSlotId] = itemInstance;
        this._applyItemStats(itemInstance);
        this._applyItemEffects(itemInstance);

        // Handle weapon skills
        if (itemInstance.type === "weapon" && itemInstance.weaponSkills.length > 0) {
            itemInstance.weaponSkills.forEach(skill => {
                if (!this.skills.find(s => s.id === skill.id)) { // Add if not already present (e.g. from class)
                    this.skills.push(skill);
                }
            });
        }

        this.recalculateHeroStats();
        if (typeof renderEquippedItems === "function") renderEquippedItems(this);
        if (typeof renderSkills === "function") renderSkills(this); // To show new weapon skills
        if (typeof renderPassiveSkills === "function") renderPassiveSkills(this);
        if (typeof renderWeaponSkills === "function") renderWeaponSkills(this);

        return true;
    }

    unequipItem(sourceSlotId, moveToInventory = true) {
        const itemToUnequip = this.equipment[sourceSlotId];
        if (!itemToUnequip) return false;

        this._unapplyItemStats(itemToUnequip);
        this._unapplyItemEffects(itemToUnequip);
        this.equipment[sourceSlotId] = null;

        // Remove weapon skills
        if (itemToUnequip.type === "weapon" && itemToUnequip.weaponSkills.length > 0) {
            itemToUnequip.weaponSkills.forEach(weaponSkill => {
                // Only remove if this skill was purely from the weapon and not a base class skill
                const isBaseSkill = this.class.skills.includes(weaponSkill.id) ||
                                  (this.class2 && this.class2.skills.includes(weaponSkill.id)) ||
                                  (this.class3 && this.class3.skills.includes(weaponSkill.id));
                if (!isBaseSkill) {
                    this.skills = this.skills.filter(s => s.id !== weaponSkill.id);
                }
                // Also remove from selected skills if it was selected
                this.selectedSkills = this.selectedSkills.filter(s => s.id !== weaponSkill.id);
                this.selectedPassiveSkills = this.selectedPassiveSkills.filter(s => s.id !== weaponSkill.id);

            });
            updateSkillBar(this.selectedSkills);
            updatePassiveSkillBar(this.selectedPassiveSkills);
        }

        if (moveToInventory) {
            this.addItemToInventory(itemToUnequip); // This will call renderHeroInventory
        }

        this.recalculateHeroStats();
        if (typeof renderEquippedItems === "function") renderEquippedItems(this);
        if (typeof renderSkills === "function") renderSkills(this); // To remove weapon skills
        if (typeof renderPassiveSkills === "function") renderPassiveSkills(this);
        if (typeof renderWeaponSkills === "function") renderWeaponSkills(this);


        return itemToUnequip;
    }

    // SERIALIZATION
    getSerializableData() {
        const data = super.getSerializableData(); // Gets Member's data
        data.gold = this.gold;
        data.inventory = this.inventory.map(item => item.id);
        data.equipment = {};
        for (const slot in this.equipment) {
            data.equipment[slot] = this.equipment[slot] ? this.equipment[slot].id : null;
        }
        // No need to save itemStatBonuses or itemEffects directly, they are derived
        data.baseStats = deepCopy(this.baseStats);
        return data;
    }

    restoreFromData(data, allHeroClasses, allSkillsLookup, allItemsCacheInstance) { // Added allItemsCacheInstance
        super.restoreFromData(data, allHeroClasses, allSkillsLookup); // Member's restoration
        this.gold = data.gold || 0;

        this.baseStats = data.baseStats ? deepCopy(data.baseStats) : deepCopy(this.stats); // Fallback for older saves

        this.inventory = [];
        if (data.inventory && allItemsCacheInstance) {
            data.inventory.forEach(itemId => {
                const itemInstance = allItemsCacheInstance[itemId];
                if (itemInstance) {
                    this.inventory.push(itemInstance);
                } else {
                    console.warn(`Item ID ${itemId} not found in allItemsCache during hero inventory restoration.`);
                }
            });
        }

        this.equipment = {}; // Reset equipment
        if (data.equipment && allItemsCacheInstance) {
            for (const slot in data.equipment) {
                const itemId = data.equipment[slot];
                if (itemId) {
                    const itemInstance = allItemsCacheInstance[itemId];
                    if (itemInstance) {
                        // Directly place item, stats/effects will be recalculated
                        this.equipment[slot] = itemInstance;
                         // Apply stats and effects (without moving from inventory, as it's being restored directly)
                        this._applyItemStats(itemInstance);
                        this._applyItemEffects(itemInstance);
                        if (itemInstance.type === "weapon" && itemInstance.weaponSkills.length > 0) {
                            itemInstance.weaponSkills.forEach(skill => {
                                if (!this.skills.find(s => s.id === skill.id)) {
                                    this.skills.push(skill);
                                }
                            });
                        }
                    } else {
                        this.equipment[slot] = null;
                        console.warn(`Item ID ${itemId} for slot ${slot} not found in allItemsCache during hero equipment restoration.`);
                    }
                } else {
                    this.equipment[slot] = null;
                }
            }
        }
        this.recalculateHeroStats(); // Crucial to apply all bonuses correctly
        // reselectSkillsAfterLoad should be called after this to handle skills potentially added by weapons
    }
    selectSkill(skillInstance, slotIndex, isPassive = false) {
            if (!skillInstance || !(skillInstance instanceof Skill)) {
                console.error("Invalid skill instance provided to selectSkill", skillInstance);
                return false;
            }

            const targetArray = isPassive ? this.selectedPassiveSkills : this.selectedSkills;
            const maxSlots = targetArray.length;

            if (slotIndex < 0 || slotIndex >= maxSlots) {
                console.error(`Invalid slotIndex ${slotIndex} for ${isPassive ? 'passive' : 'active'} skills. Max slots: ${maxSlots}`);
                return false;
            }

            targetArray[slotIndex] = skillInstance;

            if (isPassive) {
                if (typeof updatePassiveSkillBar === "function") updatePassiveSkillBar(this.selectedPassiveSkills);
            } else {
                if (typeof updateSkillBar === "function") updateSkillBar(this.selectedSkills);
            }
            return true;
        }

        unselectSkill(slotIndex, isPassive = false) {
            const targetArray = isPassive ? this.selectedPassiveSkills : this.selectedSkills;
            const maxSlots = targetArray.length;

            if (slotIndex < 0 || slotIndex >= maxSlots) {
                console.error(`Invalid slotIndex ${slotIndex} to unselect for ${isPassive ? 'passive' : 'active'} skills.`);
                return false;
            }

            if (targetArray[slotIndex]) {
                targetArray[slotIndex] = null;

                if (isPassive) {
                    if (typeof updatePassiveSkillBar === "function") updatePassiveSkillBar(this.selectedPassiveSkills);
                } else {
                    if (typeof updateSkillBar === "function") updateSkillBar(this.selectedSkills);
                }
                return true;
            }
            return false;
        }

        reselectSkillsAfterLoad() {
            // Initialize/clear selected skills arrays (assuming 4 slots each)
            this.selectedSkills = [null, null, null, null];
            this.selectedPassiveSkills = [null, null, null, null];

            let activeSelectedCount = 0;
            let passiveSelectedCount = 0;
            const maxActive = this.selectedSkills.length;
            const maxPassive = this.selectedPassiveSkills.length;

            if (!this.skills || this.skills.length === 0) {
                console.warn("Hero has no skills available to select.");
                // Update bars with empty selections
                if (typeof updateSkillBar === "function") updateSkillBar(this.selectedSkills);
                if (typeof updatePassiveSkillBar === "function") updatePassiveSkillBar(this.selectedPassiveSkills);
                return;
            }
        }
}

export default Hero;