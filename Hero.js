// Hero.js
import Member from './Member.js';
import {updatePassiveSkillBar,renderHeroConsumableToolbar, renderBattleConsumableBar, updateSkillBar,deepCopy, updateStatsDisplay, renderSkills, renderPassiveSkills, renderHeroInventory, renderEquippedItems, renderWeaponSkills, updateHealth, updateMana, updateStamina} from './Render.js';
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
        this.consumableToolbar = [null, null, null];
        this.itemStatBonuses = {}; // Stores cumulative stat bonuses from items
        this.itemEffects = [];     // Stores active EffectClass instances from items (not directly used in recalculateHeroStats for stats.mana)

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
    equipConsumable(itemInstance, slotIndex) {
            if (!(itemInstance instanceof Item) || itemInstance.type !== "consumable") {
                console.error("Cannot equip non-consumable or invalid item to consumable toolbar:", itemInstance);
                return false;
            }
            if (slotIndex < 0 || slotIndex >= this.consumableToolbar.length) {
                console.error("Invalid consumable toolbar slot index:", slotIndex);
                return false;
            }

            // If an item is already in the slot, unequip it first (move to inventory)
            if (this.consumableToolbar[slotIndex]) {
                this.unequipConsumable(slotIndex, true); // true to move to inventory
            }

            // Remove from inventory (if it's there)
            this.removeItemFromInventory(itemInstance);

            this.consumableToolbar[slotIndex] = itemInstance;

            if (typeof renderHeroConsumableToolbar === "function") renderHeroConsumableToolbar(this);
            if (typeof renderBattleConsumableBar === "function") renderBattleConsumableBar(this);
            return true;
        }

        unequipConsumable(slotIndex, moveToInventory = true) {
            if (slotIndex < 0 || slotIndex >= this.consumableToolbar.length) {
                console.error("Invalid consumable toolbar slot index for unequip:", slotIndex);
                return false;
            }

            const itemToUnequip = this.consumableToolbar[slotIndex];
            if (!itemToUnequip) return false;

            this.consumableToolbar[slotIndex] = null;

            if (moveToInventory) {
                this.addItemToInventory(itemToUnequip); // addItemToInventory handles its own UI update
            }

            if (typeof renderHeroConsumableToolbar === "function") renderHeroConsumableToolbar(this);
            if (typeof renderBattleConsumableBar === "function") renderBattleConsumableBar(this);
            return itemToUnequip;
        }

        useConsumableFromToolbar(slotIndex, target) {
            if (slotIndex < 0 || slotIndex >= this.consumableToolbar.length) {
                console.error("Invalid consumable toolbar slot index for use:", slotIndex);
                return false;
            }
            const item = this.consumableToolbar[slotIndex];
            if (!item || item.type !== "consumable") {
                console.error("No consumable item in slot or item is not a consumable:", slotIndex, item);
                return false;
            }
            if (!target || !(target instanceof Member)) { // Ensure target is a Member instance
                console.error("Invalid target for consumable:", target);
                return false;
            }

            const success = item.use(target); // Item.use will apply effects

            if (success) {
                console.log(`${this.name} used ${item.name} on ${target.name}.`);
                this.consumableToolbar[slotIndex] = null; // Remove from toolbar after use

                // Update UIs
                if (typeof renderHeroConsumableToolbar === "function") renderHeroConsumableToolbar(this);
                if (typeof renderBattleConsumableBar === "function") renderBattleConsumableBar(this);

                // Effects applied by item.use() should ideally trigger their own UI updates on the target.
                // For example, EffectClass for 'heal' calls target.healDamage(), which calls updateHealth().
                // If an effect directly modifies stats of the hero, a stats recalculation might be needed.
                if (target === this) { // If hero used on self and stats might have changed
                    // Check if any effect modified a base stat directly that requires full recalc
                    // For now, assume effects handle their direct consequences (like currentHealth)
                    // If a consumable directly changes maxHP/Mana via stats, then:
                    // this.recalculateHeroStats();
                }
                return true;
            }
            return false;
        }
    _applyItemStats(item) {
        if (!item || !item.stats || item.type === "consumable") return;
        for (const stat in item.stats) {
            this.stats[stat] = (this.stats[stat] || 0) + item.stats[stat];
            this.itemStatBonuses[stat] = (this.itemStatBonuses[stat] || 0) + item.stats[stat];
        }
    }

    _unapplyItemStats(item) {
        if (!item || !item.stats || item.type === "consumable") return;
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
        const data = super.getSerializableData();
        data.gold = this.gold;
        data.inventory = this.inventory.map(item => item.id);
        data.equipment = {};
        for (const slot in this.equipment) {
            data.equipment[slot] = this.equipment[slot] ? this.equipment[slot].id : null;
        }
        data.baseStats = deepCopy(this.baseStats);
        data.consumableToolbar = this.consumableToolbar.map(item => item ? item.id : null); // Serialize
        return data;
    }

    restoreFromData(data, allHeroClasses, allSkillsLookup, allItemsCacheInstance) {
        super.restoreFromData(data, allHeroClasses, allSkillsLookup);
        this.gold = data.gold || 0;
        this.baseStats = data.baseStats ? deepCopy(data.baseStats) : deepCopy(this.stats);

        this.inventory = [];
        if (data.inventory && allItemsCacheInstance) {
            data.inventory.forEach(itemId => {
                const itemData = allItemsCacheInstance[itemId]; // Get raw item data
                if (itemData) {
                    this.inventory.push(new Item(itemData)); // Create Item instance
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
                    const itemData = allItemsCacheInstance[itemId];
                    if (itemData) {
                        const itemInstance = new Item(itemData);
                        this.equipment[slot] = itemInstance;
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
                        console.warn(`Item ID ${itemId} for slot ${slot} not found in allItemsCache for equipment.`);
                    }
                } else {
                    this.equipment[slot] = null;
                }
            }
        }

        this.consumableToolbar = [null, null, null]; // Deserialize
        if (data.consumableToolbar && allItemsCacheInstance) {
            data.consumableToolbar.forEach((itemId, index) => {
                if (itemId) {
                    const itemData = allItemsCacheInstance[itemId];
                    if (itemData && itemData.type === "consumable") {
                        this.consumableToolbar[index] = new Item(itemData);
                    } else if (itemData) {
                        console.warn(`Item ID ${itemId} for consumable slot ${index} is not a consumable.`);
                        // Optional: Add to inventory if it's not a consumable but was in a consumable slot
                        // this.inventory.push(new Item(itemData));
                    } else {
                         console.warn(`Item ID ${itemId} for consumable slot ${index} not found.`);
                    }
                }
            });
        }

        this.recalculateHeroStats(false); // false: don't update UI immediately if part of larger load sequence
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