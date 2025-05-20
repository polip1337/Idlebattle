import Member from './Member.js';
import {updatePassiveSkillBar, renderBattleConsumableBar, updateSkillBar,deepCopy, updateStatsDisplay, renderSkills, renderPassiveSkills, renderHeroInventory, renderEquippedItems, renderWeaponSkills, updateHealth, updateMana, updateStamina} from './Render.js';
import Skill from './Skill.js';
import Item from './item.js'; // Add this
import EffectClass from './EffectClass.js'; // Add this
import Companion from './companion.js'; // NEW
import { allCompanionsData } from './initialize.js';

class Hero extends Member {
    constructor(name, classInfo, skills, level = 1, team, opposingTeam) {
        super(name, classInfo, skills, level, team, opposingTeam, true); // Member constructor handles this.stats

        this.class2 = null;
        this.skills2 = null;
        this.class3 = null;
        this.skills3 = null;

        this.selectedSkills = [];
        this.selectedPassiveSkills = [];

        this.position = 'Front';
        this.repeat = false;

        this.availableClasses = [];
        this.class1Evolve = false;
        this.class2Evolve = false;
        this.class3Evolve = false;
        this.gold = 0;

        this.equipment = {
            weaponSlot: null, shieldSlot: null, helmetSlot: null, chestArmorSlot: null,
            legArmorSlot: null, glovesSlot: null, bootsSlot: null, amuletSlot: null,
            ringSlot: null, cloakSlot: null
        };
        this.inventory = [];
        this.consumableToolbar = [null, null, null]; // This is the single source of truth for equipped consumables
        this.itemStatBonuses = {};
        this.itemEffects = [];

        this.baseStats = deepCopy(this.stats);

        // Companion System NEW
        this.allCompanions = []; // Stores all recruited Companion instances
        this.partyFormation = [ // 2 rows, 4 slots each. Hero must be placed here by logic.
            [null, null, null, null], // Front row (index 0)
            [null, null, null, null]  // Back row (index 1)
        ];
        this.maxPartySize = 8; // Including hero
    }

    // --- COMPANION METHODS --- NEW
    recruitCompanion(companionId) {
        if (!allCompanionsData[companionId]) {
            console.warn(`Companion with ID ${companionId} not found in definitions.`);
            return null;
        }
        if (this.allCompanions.some(c => c.companionId === companionId)) {
            console.log(`Companion ${companionId} already recruited.`);
            return this.allCompanions.find(c => c.companionId === companionId);
        }
        // Pass Hero's team and opposingTeam context for companion constructor
        const companion = new Companion(companionId, allCompanionsData[companionId], this.team, this.opposingTeam);
        this.allCompanions.push(companion);
        console.log(`Recruited companion: ${companion.name}`);
        this.addCompanionToFirstAvailableSlot(companion); // Attempt to add to active party
        if (typeof window.initializeCompanionUI === 'function') { // Refresh UI
            window.initializeCompanionUI();
        }
        return companion;
    }

    getActivePartyMembers() { // Includes hero if hero is in formation
        const active = [];
        this.partyFormation.flat().forEach(member => {
            if (member) { // Filters out null slots
                active.push(member);
            }
        });
        return active;
    }

    isHeroInFormation() {
        return this.partyFormation.flat().includes(this);
    }

    addCompanionToFirstAvailableSlot(companion) {
        if (this.getActivePartyMembers().length >= this.maxPartySize) {
            console.log("Active party is full.");
            return false;
        }
        if (this.partyFormation.flat().includes(companion)) {
            console.log(`${companion.name} is already in the party formation.`);
            return false; // Already in formation
        }

        for (let i = 0; i < this.partyFormation.length; i++) {
            for (let j = 0; j < this.partyFormation[i].length; j++) {
                if (!this.partyFormation[i][j]) {
                    this.partyFormation[i][j] = companion;
                    companion.position = (i === 0) ? 'Front' : 'Back';
                    console.log(`Added ${companion.name} to party formation at [${i},${j}]`);
                    if (typeof window.renderCompanionPartyFormation === 'function') {
                        window.renderCompanionPartyFormation(this);
                    }
                    if (typeof window.renderCompanionRoster === 'function') { // To update in-party status
                        window.renderCompanionRoster(this);
                    }
                    return true;
                }
            }
        }
        console.log("No available slot in party formation for companion.");
        return false;
    }

    placeHeroInFirstAvailableSlot() {
        if (this.isHeroInFormation()) return; // Already placed

        for (let i = 0; i < this.partyFormation.length; i++) {
            for (let j = 0; j < this.partyFormation[i].length; j++) {
                if (!this.partyFormation[i][j]) {
                    this.partyFormation[i][j] = this;
                    this.position = (i === 0) ? 'Front' : 'Back';
                    console.log(`Placed Hero in party formation at [${i},${j}]`);
                    if (typeof window.renderCompanionPartyFormation === 'function') {
                        window.renderCompanionPartyFormation(this);
                    }
                    return true;
                }
            }
        }
        console.warn("Could not place hero in formation, party might be unexpectedly full.");
        return false;
    }


    removeMemberFromFormation(memberInstance) {
        let found = false;
        for (let i = 0; i < this.partyFormation.length; i++) {
            for (let j = 0; j < this.partyFormation[i].length; j++) {
                if (this.partyFormation[i][j] === memberInstance) {
                    this.partyFormation[i][j] = null;
                    found = true;
                    break;
                }
            }
            if (found) break;
        }
        if (found) {
            console.log(`Removed ${memberInstance.name} from party formation.`);
            if (typeof window.renderCompanionPartyFormation === 'function') {
                window.renderCompanionPartyFormation(this);
            }
            if (!memberInstance.isHero && typeof window.renderCompanionRoster === 'function') {
                window.renderCompanionRoster(this); // Update roster for "in-party" status
            }
        }
        return found;
    }

    setMemberPositionInFormation(memberInstance, targetRow, targetCol) {
        if (targetRow < 0 || targetRow >= this.partyFormation.length || targetCol < 0 || targetCol >= this.partyFormation[0].length) {
            console.error("Invalid position for member in formation.");
            return false;
        }

        const currentOccupant = this.partyFormation[targetRow][targetCol];

        // Find current position of memberInstance if it's already in formation
        let sourceRow = -1, sourceCol = -1;
        for (let r = 0; r < this.partyFormation.length; r++) {
            for (let c = 0; c < this.partyFormation[r].length; c++) {
                if (this.partyFormation[r][c] === memberInstance) {
                    sourceRow = r;
                    sourceCol = c;
                    break;
                }
            }
            if (sourceRow !== -1) break;
        }

        if (currentOccupant === memberInstance) { // Dragged onto its own slot
            return false; // No change
        }

        // Clear memberInstance's old slot if it was in formation
        if (sourceRow !== -1 && sourceCol !== -1) {
            this.partyFormation[sourceRow][sourceCol] = null;
        }

        // If target slot is occupied, move the occupant to memberInstance's old slot (if available) or first empty
        if (currentOccupant) {
            if (sourceRow !== -1 && sourceCol !== -1) { // memberInstance was in formation, so its old slot is now empty
                this.partyFormation[sourceRow][sourceCol] = currentOccupant;
                currentOccupant.position = (sourceRow === 0) ? 'Front' : 'Back';
            } else { // memberInstance was not in formation (e.g., dragged from roster to occupied slot)
                   // This scenario should ideally be prevented by UI or handled by adding occupant back to roster
                console.warn("Cannot directly swap from roster to an occupied slot. Please free the slot or use an empty one.");
                 // Put memberInstance back if it was from roster by not placing it, and if it had a source, restore that source.
                // For now, just abort the operation.
                if (sourceRow !== -1 && sourceCol !== -1) this.partyFormation[sourceRow][sourceCol] = memberInstance; // Put it back
                return false;
            }
        }

        // Place memberInstance in the new slot
        this.partyFormation[targetRow][targetCol] = memberInstance;
        memberInstance.position = (targetRow === 0) ? 'Front' : 'Back';

        console.log(`Moved ${memberInstance.name} to [${targetRow},${targetCol}]`);
        if (typeof window.renderCompanionPartyFormation === 'function') {
            window.renderCompanionPartyFormation(this);
        }
        return true;
    }

    distributeBattleXP(totalXP) {
        const activeMembers = this.getActivePartyMembers();
        if (activeMembers.length === 0) return;

        const xpPerMember = Math.floor(totalXP / activeMembers.length);
        if (xpPerMember <= 0) return;

        activeMembers.forEach(member => {
            if (typeof member.gainExperience === 'function') {
                member.gainExperience(xpPerMember);
            }
        });
        console.log(`Distributed ${xpPerMember} XP to ${activeMembers.length} active party members.`);
        // Individual gainExperience methods will handle level ups.
        // UI updates for XP bars are handled by those gainExperience methods or companionUI refreshes.
    }


    // --- EXISTING METHODS ---
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

            if (this.consumableToolbar[slotIndex]) {
                this.unequipConsumable(slotIndex, true);
            }

            this.removeItemFromInventory(itemInstance);

            this.consumableToolbar[slotIndex] = itemInstance;

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
                this.addItemToInventory(itemToUnequip);
            }

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
            if (!target || !(target instanceof Member)) {
                console.error("Invalid target for consumable:", target);
                return false;
            }

            const success = item.use(target);

            if (success) {
                console.log(`${this.name} used ${item.name} on ${target.name}.`);
                this.consumableToolbar[slotIndex] = null;

                if (typeof renderBattleConsumableBar === "function") renderBattleConsumableBar(this);
                
                if (target === this) { 
                   // this.recalculateHeroStats(); // If consumable has stat-altering effects that are permanent
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
            const effectInstance = new EffectClass(this, effectData);
            this.itemEffects.push({itemOriginId: item.id, effect: effectInstance});
        });
    }

    _unapplyItemEffects(item) {
        if (!item || !item.effects || item.effects.length === 0) return;
        this.itemEffects = this.itemEffects.filter(trackedEffect => {
            if (trackedEffect.itemOriginId === item.id) {
                trackedEffect.effect.remove(); 
                return false; 
            }
            return true;
        });
    }


    recalculateHeroStats(updateDisplay = true) { 
        if (!this.baseStats && this.stats) {
            this.baseStats = deepCopy(this.stats);
        } else if (!this.baseStats) {
            console.error("Hero.recalculateHeroStats: baseStats is undefined and cannot be derived from this.stats.");
            this.baseStats = {}; 
        }
        this.stats = deepCopy(this.baseStats);

        if (this.equipment) { 
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


        if (updateDisplay) { 
            if (typeof updateStatsDisplay === "function") updateStatsDisplay(this);
            if (typeof updateHealth === "function") updateHealth(this);
            if (typeof updateMana === "function") updateMana(this);
            if (typeof updateStamina === "function") updateStamina(this);
        }
    }

    levelUp(updateHeroUI = true) { 
        super.levelUp(updateHeroUI); 

        this.baseStats = deepCopy(this.stats); 

        this.itemStatBonuses = this.itemStatBonuses || {};
        Object.keys(this.itemStatBonuses).forEach(key => delete this.itemStatBonuses[key]);

        if (this.equipment) {
            for (const slot in this.equipment) {
                const item = this.equipment[slot];
                if (item && item.stats) {
                    for (const statKey in item.stats) {
                        this.itemStatBonuses[statKey] = (this.itemStatBonuses[statKey] || 0) + item.stats[statKey];
                    }
                }
            }
        }

        this.recalculateHeroStats(updateHeroUI); 
    }


    equipItem(itemInstance, targetSlotId) {
        if (!(itemInstance instanceof Item)) {
            console.error("Attempted to equip non-Item:", itemInstance);
            return false;
        }
        if (itemInstance.slot !== targetSlotId && itemInstance.type !== "consumable") { 
            console.warn(`Item ${itemInstance.name} cannot be equipped in ${targetSlotId}. Expected slot: ${itemInstance.slot}`);
            return false;
        }
        if (!this.equipment.hasOwnProperty(targetSlotId)) {
            console.error(`Invalid equipment slot: ${targetSlotId}`);
            return false;
        }

        if (this.equipment[targetSlotId]) {
            this.unequipItem(targetSlotId, false); 
        }

        this.removeItemFromInventory(itemInstance); 

        this.equipment[targetSlotId] = itemInstance;
        this._applyItemStats(itemInstance);
        this._applyItemEffects(itemInstance);

        if (itemInstance.type === "weapon" && itemInstance.weaponSkills.length > 0) {
            itemInstance.weaponSkills.forEach(skill => {
                if (!this.skills.find(s => s.id === skill.id)) { 
                    this.skills.push(skill);
                }
            });
        }

        this.recalculateHeroStats();
        if (typeof renderEquippedItems === "function") renderEquippedItems(this);
        if (typeof renderSkills === "function") renderSkills(this); 
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

        if (itemToUnequip.type === "weapon" && itemToUnequip.weaponSkills.length > 0) {
            itemToUnequip.weaponSkills.forEach(weaponSkill => {
                const isBaseSkill = this.class.skills.includes(weaponSkill.id) ||
                                  (this.class2 && this.class2.skills.includes(weaponSkill.id)) ||
                                  (this.class3 && this.class3.skills.includes(weaponSkill.id));
                if (!isBaseSkill) {
                    this.skills = this.skills.filter(s => s.id !== weaponSkill.id);
                }
                this.selectedSkills = this.selectedSkills.filter(s => s.id !== weaponSkill.id);
                this.selectedPassiveSkills = this.selectedPassiveSkills.filter(s => s.id !== weaponSkill.id);

            });
            updateSkillBar(this.selectedSkills);
            updatePassiveSkillBar(this.selectedPassiveSkills);
        }

        if (moveToInventory) {
            this.addItemToInventory(itemToUnequip); 
        }

        this.recalculateHeroStats();
        if (typeof renderEquippedItems === "function") renderEquippedItems(this);
        if (typeof renderSkills === "function") renderSkills(this); 
        if (typeof renderPassiveSkills === "function") renderPassiveSkills(this);
        if (typeof renderWeaponSkills === "function") renderWeaponSkills(this);


        return itemToUnequip;
    }

    getSerializableData() {
        const data = super.getSerializableData();
        data.gold = this.gold;
        data.inventory = this.inventory.map(item => item.id);
        data.equipment = {};
        for (const slot in this.equipment) {
            data.equipment[slot] = this.equipment[slot] ? this.equipment[slot].id : null;
        }
        data.selectedSkillIds = this.selectedSkills.map(s => s ? s.id : null);
        data.selectedPassiveSkillIds = this.selectedPassiveSkills.map(s => s ? s.id : null);
        data.baseStats = deepCopy(this.baseStats);
        data.consumableToolbar = this.consumableToolbar.map(item => item ? item.id : null);
        
        // Companion Data NEW
        data.allCompanions = this.allCompanions.map(comp => comp.getSerializableData());
        data.partyFormationPositions = this.partyFormation.map(row =>
            row.map(member => (member ? (member.isHero ? 'hero' : member.companionId) : null))
        );
        return data;
    }

    restoreFromData(data, allHeroClasses, allSkillsLookup, allItemsCacheInstance) {
        super.restoreFromData(data, allHeroClasses, allSkillsLookup);
        this.gold = data.gold || 0;
        this.baseStats = data.baseStats ? deepCopy(data.baseStats) : deepCopy(this.stats);

        this.inventory = [];
        if (data.inventory && allItemsCacheInstance) {
            data.inventory.forEach(itemId => {
                const itemData = allItemsCacheInstance[itemId]; 
                if (itemData) {
                    this.inventory.push(new Item(itemData)); 
                } else {
                    console.warn(`Item ID ${itemId} not found in allItemsCache during hero inventory restoration.`);
                }
            });
        }

        this.equipment = {}; 
        if (data.equipment && allItemsCacheInstance) {
            for (const slot in data.equipment) {
                const itemId = data.equipment[slot];
                if (itemId) {
                    const itemData = allItemsCacheInstance[itemId];
                    if (itemData) {
                        const itemInstance = new Item(itemData);
                        this.equipment[slot] = itemInstance;
                        // _applyItemStats and _applyItemEffects are implicitly handled by recalculateHeroStats
                        // and equipping items one by one, but for direct load:
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
         // Apply all item stats after equipment is loaded
        this.itemStatBonuses = {}; // Reset before recalculating from loaded equipment
        for (const slot in this.equipment) {
            if (this.equipment[slot]) {
                this._applyItemStats(this.equipment[slot]); // Accumulate into this.itemStatBonuses
                this._applyItemEffects(this.equipment[slot]); // Apply persistent effects
            }
        }


        this.consumableToolbar = [null, null, null]; 
        if (data.consumableToolbar && allItemsCacheInstance) {
            data.consumableToolbar.forEach((itemId, index) => {
                if (itemId) {
                    const itemData = allItemsCacheInstance[itemId];
                    if (itemData && itemData.type === "consumable") {
                        this.consumableToolbar[index] = new Item(itemData);
                    } else if (itemData) {
                        console.warn(`Item ID ${itemId} for consumable slot ${index} is not a consumable.`);
                    } else {
                         console.warn(`Item ID ${itemId} for consumable slot ${index} not found.`);
                    }
                }
            });
        }
        this._savedSelectedSkillIds = data.selectedSkillIds || [];
        this._savedSelectedPassiveSkillIds = data.selectedPassiveSkillIds || [];
        
        // Companion Data Restoration NEW
        this.allCompanions = [];
        if (data.allCompanions && allCompanionsData && Object.keys(allCompanionsData).length > 0) {
            data.allCompanions.forEach(compSaveData => {
                const companionDef = allCompanionsData[compSaveData.companionId];
                if (companionDef) {
                    const companion = new Companion(compSaveData.companionId, companionDef, this.team, this.opposingTeam);
                    companion.restoreFromData(compSaveData, companionDef, allSkillsLookup);
                    this.allCompanions.push(companion);
                } else {
                    console.warn(`Companion definition for ID ${compSaveData.companionId} not found during hero load.`);
                }
            });
        }

        this.partyFormation = [ [null, null, null, null], [null, null, null, null] ];
        if (data.partyFormationPositions) {
            data.partyFormationPositions.forEach((row, rowIndex) => {
                row.forEach((memberIdentifier, colIndex) => {
                    if (memberIdentifier === 'hero') {
                        this.partyFormation[rowIndex][colIndex] = this;
                        this.position = (rowIndex === 0) ? 'Front' : 'Back'; // Update hero's position based on formation
                    } else if (memberIdentifier) { // It's a companionId
                        const companionInRoster = this.allCompanions.find(c => c.companionId === memberIdentifier);
                        if (companionInRoster) {
                            this.partyFormation[rowIndex][colIndex] = companionInRoster;
                            companionInRoster.position = (rowIndex === 0) ? 'Front' : 'Back';
                        } else {
                            console.warn(`Companion with ID ${memberIdentifier} from save data not found in restored roster.`);
                        }
                    }
                });
            });
        } else { // Default hero position if no formation saved (e.g. old save)
             this.placeHeroInFirstAvailableSlot(); // Place hero if not in formation
        }
        if (!this.isHeroInFormation()) { // Ensure hero is in formation if not explicitly placed by save
            this.placeHeroInFirstAvailableSlot();
        }


        this.recalculateHeroStats(false); 
    }

    addGold(amount) {
            this.gold += amount;
            if (typeof updateStatsDisplay === "function") updateStatsDisplay(this); // Update gold on hero sheet
        }

        spendGold(amount) {
            if (this.gold >= amount) {
                this.gold -= amount;
                if (typeof updateStatsDisplay === "function") updateStatsDisplay(this); // Update gold on hero sheet
                return true;
            }
            return false;
        }

        hasItem(itemId) {
            return this.inventory.some(item => item.id === itemId);
        }

        selectSkill(skill, skillBox, isPassive = false) {
        const selectedSkillsArray = isPassive ? this.selectedPassiveSkills : this.selectedSkills;
        const maxSkills = 4; // Max skills of one type (active/passive) hero can select for BAR
        // This logic is for the 4-slot skill BAR, not the list of all learnable skills.

        const existingSkillIndex = selectedSkillsArray.findIndex(s => s === skill);

        const skillBarUpdateMethod = isPassive ? updatePassiveSkillBar : updateSkillBar;

        if (existingSkillIndex === -1) { // Skill not currently in the bar
            // Find first empty slot or replace if full (or just don't add if full)
            let added = false;
            for (let i = 0; i < maxSkills; i++) {
                if (!selectedSkillsArray[i]) {
                    selectedSkillsArray[i] = skill;
                    if (!isPassive && skillBox) { // Active skill, set targeting mode from its select box
                        const targetingSelect = skillBox.querySelector('.targeting-modes');
                        if (targetingSelect) skill.targetingMode = targetingSelect.value;
                    }
                    skillBox.classList.add('selected'); // Visual feedback on skill list
                    added = true;
                    break;
                }
            }
            if (!added) {
                 console.log(`Skill bar for ${isPassive ? 'passive' : 'active'} skills is full. Cannot add ${skill.name}.`);
                 // Optionally, remove the 'selected' class from the skillBox if it was added optimistically
                 skillBox.classList.remove('selected');
            }
        } else { // Skill is in the bar, remove it (deselect)
            selectedSkillsArray[existingSkillIndex] = null; // Remove from bar slot
            skillBox.classList.remove('selected'); // Visual feedback on skill list
        }
        skillBarUpdateMethod(selectedSkillsArray); // Update the actual skill bar UI
    }
        triggerRepeatSkills() {
            const activeSelectedSkills = this.selectedSkills.filter(skill => skill && skill.type === "active");

            activeSelectedSkills.forEach(skill => {
                skill.finishCooldown(this);
                if (skill.repeat && !skill.onCooldown) {
                    if (skill.manaCost <= this.currentMana && skill.staminaCost <= this.currentStamina) {
                        skill.useSkill(this);
                    } 
                }
            });
        }
        unselectSkill(slotIndex, isPassive = false) { //This is for SKILL BAR
            const targetArray = isPassive ? this.selectedPassiveSkills : this.selectedSkills;
            const maxSlots = targetArray.length; // Should be 4 for current UI design

            if (slotIndex < 0 || slotIndex >= maxSlots) {
                console.error(`Invalid slotIndex ${slotIndex} to unselect for ${isPassive ? 'passive' : 'active'} skills bar.`);
                return false;
            }

            const skillToUnselect = targetArray[slotIndex];
            if (skillToUnselect) {
                targetArray[slotIndex] = null; // Clear from bar

                // Find the corresponding skill-box in the hero sheet and remove 'selected' class
                const skillBoxId = 'skill-box-' + skillToUnselect.name.replace(/\s/g, '');
                const skillBoxElement = document.getElementById(skillBoxId);
                if (skillBoxElement) {
                    skillBoxElement.classList.remove('selected');
                }


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
                // For the 4-slot skill bars
                const numActiveBarSlots = 4; 
                const numPassiveBarSlots = 4;

                this.selectedSkills = new Array(numActiveBarSlots).fill(null);
                this.selectedPassiveSkills = new Array(numPassiveBarSlots).fill(null);

                if (this._savedSelectedSkillIds) {
                    this._savedSelectedSkillIds.forEach((skillId, index) => {
                        if (skillId && index < this.selectedSkills.length) { // Ensure index is within bar bounds
                            const skillInstance = this.skills.find(s => s.id === skillId);
                            if (skillInstance && skillInstance.type === "active") {
                                this.selectedSkills[index] = skillInstance;
                                // Also mark the corresponding skillBox in the hero sheet as selected
                                const skillBox = document.getElementById('skill-box-' + skillInstance.name.replace(/\s/g, ''));
                                if (skillBox) skillBox.classList.add('selected');

                            } else if (skillInstance) {
                                console.warn(`Saved selected skill ID ${skillId} is not active, cannot place in active bar.`);
                            } else {
                                console.warn(`Saved selected active skill ID ${skillId} not found in hero's available skills.`);
                            }
                        }
                    });
                }

                if (this._savedSelectedPassiveSkillIds) {
                    this._savedSelectedPassiveSkillIds.forEach((skillId, index) => {
                        if (skillId && index < this.selectedPassiveSkills.length) {
                            const skillInstance = this.skills.find(s => s.id === skillId);
                            if (skillInstance && skillInstance.type !== "active") {
                                this.selectedPassiveSkills[index] = skillInstance;
                                const skillBox = document.getElementById('skill-box-' + skillInstance.name.replace(/\s/g, ''));
                                if (skillBox) skillBox.classList.add('selected');
                            } else if (skillInstance) {
                                 console.warn(`Saved selected skill ID ${skillId} is active, cannot place in passive bar.`);
                            } else {
                                console.warn(`Saved selected passive skill ID ${skillId} not found in hero's available skills.`);
                            }
                        }
                    });
                }

                delete this._savedSelectedSkillIds;
                delete this._savedSelectedPassiveSkillIds;

                if (typeof updateSkillBar === "function") updateSkillBar(this.selectedSkills);
                if (typeof updatePassiveSkillBar === "function") updatePassiveSkillBar(this.selectedPassiveSkills);
            }
}
export default Hero;