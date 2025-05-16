Okay, this is a significant feature! Let's break it down and implement it.

**1. Data and Core Logic**

*   **`Data/companions.json`**: Defines companion stats, skills, and appearances.
*   **`Companion.js`**: Class for companion characters, inheriting from `Member`.
*   **`Hero.js`**: Updated to manage a roster of all companions and the active party formation.
*   **`initialize.js`**: Loads companion data and integrates them into the game.

**2. Companion Management UI (New Tab in Hero View)**

*   **`index.html`**: Adds a "Companions" sub-tab within the Hero View. This tab will have:
    *   A roster list of all recruited companions.
    *   A 2x4 grid for the active party formation (draggable).
    *   A panel to display details of a selected companion.
*   **`companionUIManager.js`**: New JavaScript file to handle rendering and interactions for the companion UI (roster, formation, details).
*   **`style/heroView.css`**: Updated with styles for the new companion tab elements.

**3. Battle Integration**

*   **`Battle.js`**: The player's team (`team1`) will now be populated from the `hero.partyFormation` (hero + active companions).
*   XP earned in battle will be distributed among the hero and active companions.

**4. Save/Load**

*   Companion roster, active formation, and individual companion progress (level, XP) will be saved and loaded.

Let's start by creating the necessary files and updating existing ones.

--- START OF FILE Data/companions.json ---
```json
{
  "shadowClaw": {
    "id": "shadowClaw",
    "name": "Shadow Claw",
    "description": "A loyal wolf beast with sharp claws and a protective howl.",
    "classInfo": {
      "id": "wolf_beast_companion",
      "name": "Wolf Beast",
      "portrait": "Media/Companions/Portraits/wolf_placeholder.png",
      "battleSprite": "Media/Companions/BattleSprites/wolf_placeholder.png",
      "stats": { "strength": 12, "speed": 15, "dexterity": 14, "vitality": 10, "mana": 0, "stamina": 100, "manaRegen": 0, "accuracy": 5, "dodge": 5, "armor": 2, "magicPower": 0, "magicControl": 0 },
      "statsPerLevel": { "strength": 2, "speed": 1, "dexterity": 1, "vitality": 2, "stamina": 10 }
    },
    "skills": ["basic_attack", "rend"],
    "experienceToLevelMultiplier": 1.1
  },
  "emberWisp": {
    "id": "emberWisp",
    "name": "Ember Wisp",
    "description": "A flickering wisp of fire that can unleash bolts of flame.",
    "classInfo": {
      "id": "fire_wisp_companion",
      "name": "Fire Wisp",
      "portrait": "Media/Companions/Portraits/wisp_placeholder.png",
      "battleSprite": "Media/Companions/BattleSprites/wisp_placeholder.png",
      "stats": { "strength": 3, "speed": 12, "dexterity": 10, "vitality": 7, "mana": 60, "stamina": 40, "manaRegen": 3, "accuracy": 0, "dodge": 2, "armor": 0, "magicPower": 12, "magicControl": 5 },
      "statsPerLevel": { "vitality": 1, "mana": 6, "magicPower": 2, "magicControl": 1 }
    },
    "skills": ["fire_bolt", "healing_light"],
    "experienceToLevelMultiplier": 1.15
  },
  "stoneGuard": {
    "id": "stoneGuard",
    "name": "Stone Guard",
    "description": "A resilient stone golem that excels in defense.",
    "classInfo": {
      "id": "stone_golem_companion",
      "name": "Stone Golem",
      "portrait": "Media/Companions/Portraits/golem_placeholder.png",
      "battleSprite": "Media/Companions/BattleSprites/golem_placeholder.png",
      "stats": { "strength": 15, "speed": 5, "dexterity": 5, "vitality": 15, "mana": 10, "stamina": 120, "manaRegen": 0, "accuracy": 0, "dodge": 0, "armor": 5, "magicPower": 0, "magicControl": 0 },
      "statsPerLevel": { "strength": 2, "vitality": 3, "stamina": 15, "armor": 1 }
    },
    "skills": ["slam", "fortify"],
    "experienceToLevelMultiplier": 1.2
  }
}
```
--- END OF FILE Data/companions.json ---

--- START OF FILE Companion.js ---
```javascript
// Companion.js
import Member from './Member.js';
import { deepCopy } from './Render.js'; // Assuming deepCopy is in Render.js
import { allSkillsCache } from './initialize.js';

class Companion extends Member {
    constructor(companionId, companionData, team = null, opposingTeam = null) {
        super(
            companionData.name,
            companionData.classInfo,
            companionData.skills, // Array of skill IDs
            1, // Start at level 1
            team,
            opposingTeam,
            false // isHero = false
        );
        this.companionId = companionId;
        this.description = companionData.description;
        // experienceToLevel is initialized in Member's constructor via levelUp(false)
        // We'll apply the multiplier after the first level up.
        this.experienceToLevelMultiplier = companionData.experienceToLevelMultiplier || 1.1;
        if (this.level === 1) { // After initial setup by Member constructor
             this.experienceToLevel = Math.floor( (this.class.experienceToLevel || 100) * this.experienceToLevelMultiplier);
        }
    }

    levelUp(updateUI = false) { // updateUI is mostly for hero, companions UI update will be through party render
        const oldLevel = this.level;
        super.levelUp(false); // Call parent, don't let it do hero-specific UI updates

        if (this.level > oldLevel) {
            // Apply custom XP scaling after the level up in super has adjusted experienceToLevel once
            this.experienceToLevel = Math.floor(this.experienceToLevel * this.experienceToLevelMultiplier);
            // console.log(`${this.name} leveled up to ${this.level}! Next level at ${this.experienceToLevel} XP.`);
            // UI update will be handled by re-rendering the companion list/details if needed
        }
    }

    gainExperience(exp) {
        if (this.level >= 100) return; // Max level cap example
        this.experience += exp;
        let leveledUp = false;
        while (this.experience >= this.experienceToLevel && this.level < 100) {
            this.levelUp(false);
            leveledUp = true;
        }
        if (leveledUp && typeof window.refreshCompanionUIDetails === 'function') {
             window.refreshCompanionUIDetails(this); // If this companion is currently displayed
        }
        if (typeof window.refreshCompanionRosterItem === 'function') {
            window.refreshCompanionRosterItem(this);
        }
    }

    getSerializableData() {
        const data = super.getSerializableData();
        data.companionId = this.companionId;
        data.experience = this.experience;
        data.experienceToLevel = this.experienceToLevel;
        data.skillProgression = this.skills.map(s => ({
            id: s.id,
            level: s.level,
            experience: s.experience,
            experienceToNextLevel: s.experienceToNextLevel,
            baseDamage: s.baseDamage,
            repeat: s.repeat // Save repeat state if companions can toggle it
        }));
        return data;
    }

    restoreFromData(data, companionDefinition, allSkillsLookup) {
        // companionDefinition is the raw data from companions.json for this companionId
        const classInfoForMember = { [companionDefinition.classInfo.id]: companionDefinition.classInfo };
        super.restoreFromData(data, classInfoForMember, allSkillsLookup);

        this.companionId = data.companionId; // Should match the key from definitions
        this.experience = data.experience || 0;
        this.experienceToLevel = data.experienceToLevel || Math.floor(100 * (this.experienceToLevelMultiplier || 1.1));

        if (data.skillProgression && allSkillsLookup) {
            this.skills.forEach(skillInstance => {
                const savedSkillData = data.skillProgression.find(sp => sp.id === skillInstance.id);
                if (savedSkillData) {
                    skillInstance.applySavedState(savedSkillData);
                }
            });
        }
    }
}
export default Companion;
```
--- END OF FILE Companion.js ---

--- START OF FILE Hero.js ---
```javascript
// Hero.js
import Member from './Member.js';
import {updatePassiveSkillBar,renderHeroConsumableToolbar, renderBattleConsumableBar, updateSkillBar,deepCopy, updateStatsDisplay, renderSkills, renderPassiveSkills, renderHeroInventory, renderEquippedItems, renderWeaponSkills, updateHealth, updateMana, updateStamina} from './Render.js';
import Skill from './Skill.js';
import Item from './item.js'; // Add this
import EffectClass from './EffectClass.js'; // Add this
import Companion from './Companion.js'; // NEW
export let allCompanionsData = {}; // Loaded in initialize.js

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
        this.consumableToolbar = [null, null, null];
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
                this.addItemToInventory(itemToUnequip); 
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
            if (!target || !(target instanceof Member)) { 
                console.error("Invalid target for consumable:", target);
                return false;
            }

            const success = item.use(target); 

            if (success) {
                console.log(`${this.name} used ${item.name} on ${target.name}.`);
                this.consumableToolbar[slotIndex] = null; 

                if (typeof renderHeroConsumableToolbar === "function") renderHeroConsumableToolbar(this);
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
```
--- END OF FILE Hero.js ---

--- START OF FILE companionUIManager.js ---
```javascript
// companionUIManager.js
import { hero } from './initialize.js'; // Access the global hero instance

let draggedMember = null; // Store the actual Companion or Hero instance being dragged
let draggedElement = null; // Store the DOM element being dragged (e.g., the img inside the slot)

export function initializeCompanionUI() {
    if (hero) {
        renderCompanionRoster(hero);
        renderCompanionPartyFormation(hero);
        displayCompanionDetails(null); // Default: display no companion details
    }
    // setupDragAndDropListeners(); // Called by renderCompanionPartyFormation now
}
// Expose globally if other modules need to refresh parts of the UI
window.initializeCompanionUI = initializeCompanionUI;
window.renderCompanionPartyFormation = renderCompanionPartyFormation;
window.renderCompanionRoster = renderCompanionRoster; // For hero methods to call
window.refreshCompanionUIDetails = displayCompanionDetails; // To update details if companion levels up while displayed
window.refreshCompanionRosterItem = refreshCompanionRosterItem;


export function openHeroSubTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("hero-sub-tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
        tabcontent[i].classList.remove("active");
    }
    tablinks = document.getElementsByClassName("hero-sub-tab-button");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    const currentTabElement = document.getElementById(tabName);
    if (currentTabElement) {
        currentTabElement.style.display = "block";
        currentTabElement.classList.add("active");
    }
    if (evt && evt.currentTarget) { // Check if evt and evt.currentTarget exist
       evt.currentTarget.className += " active";
    }


    if (tabName === 'heroCompanions') {
        initializeCompanionUI();
    }
}
if (!window.openHeroSubTab) { // Ensure it's globally available for HTML onclick
    window.openHeroSubTab = openHeroSubTab;
}

function refreshCompanionRosterItem(companionInstance) {
    if (!hero) return;
    const rosterList = document.getElementById('companions-roster-list');
    if (!rosterList) return;

    const itemDiv = rosterList.querySelector(`.companion-roster-item[data-companion-id="${companionInstance.companionId}"]`);
    if (itemDiv) {
        const nameSpan = itemDiv.querySelector('span');
        if (nameSpan) nameSpan.textContent = `${companionInstance.name} (Lvl ${companionInstance.level})`;
    }
}


function renderCompanionRoster(currentHero) {
    const rosterList = document.getElementById('companions-roster-list');
    if (!rosterList || !currentHero) return;
    rosterList.innerHTML = '';

    currentHero.allCompanions.forEach(comp => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('companion-roster-item');
        itemDiv.dataset.companionId = comp.companionId;

        const portrait = document.createElement('img');
        portrait.src = comp.class.portrait || 'Media/UI/defaultPortrait.png';
        portrait.alt = comp.name;

        const nameSpan = document.createElement('span');
        nameSpan.textContent = `${comp.name} (Lvl ${comp.level})`;

        itemDiv.appendChild(portrait);
        itemDiv.appendChild(nameSpan);

        const isInParty = currentHero.partyFormation.flat().includes(comp);
        if (isInParty) {
            itemDiv.classList.add('in-party');
        }

        itemDiv.addEventListener('click', () => {
            if (!isInParty) {
                const added = currentHero.addCompanionToFirstAvailableSlot(comp);
                // addCompanionToFirstAvailableSlot now calls render functions if successful
            }
            displayCompanionDetails(comp);
        });
        rosterList.appendChild(itemDiv);
    });
}

function renderCompanionPartyFormation(currentHero) {
    const formationContainer = document.getElementById('companions-party-formation');
    if (!formationContainer || !currentHero) return;

    // Ensure hero is in formation if not already
    if (!currentHero.isHeroInFormation()) {
        currentHero.placeHeroInFirstAvailableSlot();
    }

    currentHero.partyFormation.forEach((rowMembers, rowIndex) => {
        const rowDiv = formationContainer.querySelectorAll('.party-formation-row')[rowIndex];
        if (!rowDiv) { console.error(`Formation row ${rowIndex} not found`); return; }

        rowMembers.forEach((member, colIndex) => {
            const slotDiv = rowDiv.querySelectorAll('.party-formation-slot')[colIndex];
            if (!slotDiv) { console.error(`Formation slot [${rowIndex},${colIndex}] not found`); return; }

            slotDiv.innerHTML = ''; // Clear previous content
            slotDiv.classList.remove('has-hero', 'has-companion');
            delete slotDiv.dataset.memberIdentifier; // Clear old identifier

            // Remove old listeners to prevent accumulation
            slotDiv.ondragover = null;
            slotDiv.ondrop = null;
            slotDiv.onclick = null;


            if (member) {
                slotDiv.dataset.memberIdentifier = member.isHero ? 'hero' : member.companionId;
                const portraitImg = document.createElement('img');
                portraitImg.src = member.class.portrait || 'Media/UI/defaultPortrait.png';
                portraitImg.alt = member.name;
                portraitImg.classList.add('companion-portrait-in-slot');
                portraitImg.draggable = true;

                const nameDiv = document.createElement('div');
                nameDiv.classList.add('companion-name-in-slot');
                nameDiv.textContent = member.name.substring(0, 8);


                slotDiv.appendChild(portraitImg);
                slotDiv.appendChild(nameDiv);
                slotDiv.classList.add(member.isHero ? 'has-hero' : 'has-companion');

                portraitImg.addEventListener('dragstart', (event) => {
                    draggedMember = member; // Store the actual member instance
                    draggedElement = portraitImg; // Store the element being dragged
                    event.dataTransfer.setData('text/plain', member.isHero ? 'hero' : member.companionId);
                    event.dataTransfer.effectAllowed = 'move';
                    // Set a transparent drag image or a small custom one if needed
                    // For now, browser default (semi-transparent copy of element)
                    // event.dataTransfer.setDragImage(draggedElement, draggedElement.offsetWidth / 2, draggedElement.offsetHeight / 2);
                    setTimeout(() => { // Hide original element slightly delayed
                        if (draggedElement) draggedElement.style.opacity = '0.5';
                    },0);
                });
                portraitImg.addEventListener('dragend', () => {
                     if (draggedElement) draggedElement.style.opacity = '1'; // Restore opacity
                     draggedMember = null;
                     draggedElement = null;
                });

                slotDiv.addEventListener('click', () => { // Click on the slot (even if it has a member)
                    displayCompanionDetails(member);
                });
            }

            // Always set up drop listeners for the slot itself
            slotDiv.addEventListener('dragover', (event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
            });

            slotDiv.addEventListener('drop', (event) => {
                event.preventDefault();
                if (!draggedMember) return;
                if (draggedElement) draggedElement.style.opacity = '1'; // Restore opacity of dragged element

                const targetRow = parseInt(slotDiv.dataset.row);
                const targetCol = parseInt(slotDiv.dataset.col);

                currentHero.setMemberPositionInFormation(draggedMember, targetRow, targetCol);
                // setMemberPositionInFormation now calls renderCompanionPartyFormation

                draggedMember = null;
                draggedElement = null;
            });
        });
    });
}


function displayCompanionDetails(member) {
    const detailsPanel = document.getElementById('companion-selected-details');
    if (!detailsPanel) return;

    if (!member) {
        detailsPanel.innerHTML = '<p>Select a companion or an empty slot to manage party.</p>';
        return;
    }

    let skillsHTML = '<ul>';
    member.skills.forEach(skill => {
        // skill.description might be long, consider a summary or tooltip for full desc
        skillsHTML += `<li>${skill.name} (Lvl ${skill.level || 1})</li>`;
    });
    skillsHTML += '</ul>';

    detailsPanel.innerHTML = `
        <img src="${member.class.portrait || 'Media/UI/defaultPortrait.png'}" alt="${member.name}" class="detail-portrait">
        <h4>${member.name} - ${member.class.name || member.classType} (Lvl ${member.level})</h4>
        <p><em>${member.description || 'No description.'}</em></p>
        <hr>
        <p>HP: ${Math.round(member.currentHealth)} / ${member.maxHealth}</p>
        <p>Mana: ${member.currentMana} / ${member.stats.mana}</p>
        <p>Stamina: ${member.currentStamina} / ${member.stats.stamina}</p>
        <p>XP: ${member.experience} / ${member.experienceToLevel}
            <div class="companion-stat-xp-bar">
                <div class="progress" style="width:${(member.experience / member.experienceToLevel) * 100}%"></div>
            </div>
        </p>
        <h5>Base Stats:</h5>
        <ul class="comp-stats-list">
            <li>Strength: ${member.stats.strength}</li>
            <li>Speed: ${member.stats.speed}</li>
            <li>Dexterity: ${member.stats.dexterity}</li>
            <li>Vitality: ${member.stats.vitality}</li>
            ${member.stats.magicPower ? `<li>Magic Power: ${member.stats.magicPower}</li>` : ''}
            <li>Armor: ${member.stats.armor || 0}</li>
            <li>Dodge: ${member.stats.dodge || 0}</li>
        </ul>
        <h5>Skills:</h5>
        ${skillsHTML}
        <button id="remove-from-party-btn" style="margin-top:10px;" ${member.isHero ? 'disabled' : ''}>
            ${member.isHero ? 'Hero (Cannot Remove)' : 'Remove from Party'}
        </button>
    `;

    const removeBtn = detailsPanel.querySelector('#remove-from-party-btn');
    if (removeBtn && !member.isHero) {
        removeBtn.addEventListener('click', () => {
            hero.removeMemberFromFormation(member);
            // removeMemberFromFormation now calls render functions
            displayCompanionDetails(null); // Clear details panel
        });
    }
}
```
--- END OF FILE companionUIManager.js ---

Updates to `index.html`:
--- START OF FILE index.html ---
```html
<!DOCTYPE html>
<html>
<head>
    <meta content="width=device-width, initial-scale=1.0" name="viewport">
    <title>RPG Battle</title>
    <link href="style/styles.css" rel="stylesheet" type="text/css">
    <link href="style/heroView.css" rel="stylesheet" type="text/css"> 
    <link href="style/animation.css" rel="stylesheet" type="text/css">
    <link href="style/battleLog.css" rel="stylesheet" type="text/css">
    <link href="style/member.css" rel="stylesheet" type="text/css">
    <link href="style/fireworks.css" rel="stylesheet" type="text/css">
    <link href="style/bottomBar.css" rel="stylesheet" type="text/css">
    <link href="style/evolutionModal.css" rel="stylesheet" type="text/css">
    <link href="style/stats.css" rel="stylesheet" type="text/css">
    <link href="style/map.css" rel="stylesheet" type="text/css">
    <link href="style/greenBorderAnimation.css" rel="stylesheet" type="text/css">
    <link href="style/glow.css" rel="stylesheet" type="text/css">
    <link href="style/home.css" rel="stylesheet" type="text/css">
    <link href="style/slideshow.css" rel="stylesheet" type="text/css">
    <link href="style/dialogue.css" rel="stylesheet" type="text/css">
    <link href="style/library.css" rel="stylesheet" type="text/css">
    <link rel="stylesheet" href="style/questLog.css">
    <link rel="stylesheet" href="style/saveLoadModal.css">
    <link href="style/announcements.css" rel="stylesheet" type="text/css">
</head>
<body>
<div class="home-screen active" id="home-screen">
    <div class="home-menu">
        <h1>RPG Battle</h1>
        <div class="home-buttons">
            <button id="new-game"><img src="Media/UI/new_game.png" alt="New Game"></button>
            <button id="load-game"><img src="Media/UI/load_game.png" alt="Load Game"></button>
            <button id="options"><img src="Media/UI/options.png" alt="Options"></button>
            <button id="exit"><img src="Media/UI/exit.png" alt="Exit"></button>
        </div>
    </div>

    <div id="announcements-box">
        <h2>Announcements</h2>
        <div id="announcements-content" class="themed-scrollbar">
            <div class="announcement-item">
                <p class="announcement-date">2025-05-11</p>
                <p class="announcement-text">Welcome to RPG Battle! The adventure begins now. Explore the world and conquer your foes!</p>
            </div>
            <div class="announcement-item">
                Current version: 0.0.2 - Companions Update!
            </div>
        </div>
    </div>
</div>

<div class="slideshow hidden" id="slideshow">
    <audio id="slideshow-audio" src="Media/intro_placeholder.mp3" preload="auto"></audio>
    <div class="slide" data-duration="8500">
        <img src="Media/slideshow/slide1.jpeg" alt="Slide 1">
        <p>A millennium past, humanity’s dominion swept across the continent, their Golden Empire linked together by arcane portals.</p>
    </div>
    <div class="slide" data-duration="14000">
        <img src="Media/slideshow/slide2.jpeg" alt="Slide 2">
        <p>Even then, no matter how strong the Empire, the wilds remained untamed. Beyond the empire’s gleaming spires, shadows and unspeakable horrors prowled, making it dangerous to stray too far from civilization</p>
    </div>
    <div class="slide" data-duration="11000">
        <img src="Media/slideshow/slide3.jpeg" alt="Slide 3">
        <p>Grand Expeditions, thousands of bold men led by the best of us, carved new bastions from uncharted frontiers, spreading the empire’s banner.</p>
    </div>
    <div class="slide" data-duration="14000">
        <img src="Media/slideshow/slide4.jpeg" alt="Slide 4">
        <p>But fate turned cruel. Without omen or mercy, the portals flickered and died, unleashing a deathly fog that broke every bond between the empire’s cities. To this day, the cause of their failure remains a mystery.</p>
    </div>
    <div class="slide" data-duration="11000">
        <img src="Media/slideshow/slide5.jpeg" alt="Slide 5">
        <p>The wilderness twisted into something even more dangerous. Travelers vanished into the mists. Cities stood alone, some of them falling to famine and strife.</p>
    </div>
    <div class="slide" data-duration="12000">
        <img src="Media/slideshow/slide6.jpeg" alt="Slide 6">
        <p>Now, a milenium later, in Hollowreach the smallest of the Old Empires cities, a hero rises. Driven by destiny, they seek to brave the accursed fog.</p>
    </div>
</div>

<div class="save-load-modal hidden" id="save-load-modal">
    <div class="save-load-content">
        <h2 id="save-load-title">Save/Load Game</h2>
        <div id="save-load-slots-container">
            <!-- Slots will be populated by JS -->
        </div>
        <div class="save-load-actions">
            <button id="save-load-delete-button" class="hidden">Delete</button>
            <button id="save-load-close-button">Close</button>
        </div>
    </div>
</div>

<div class="dialogue-modal hidden" id="dialogue-modal">
    <div class="dialogue-content">
        <div class="npc-portrait">
            <img id="npc-portrait-img" src="Media/npc/sampleNPC.jpg" alt="NPC Portrait">
        </div>
        <div class="dialogue-text">
            <p id="npc-name">NPC Name</p>
            <p id="dialogue-text">Dialogue text goes here.</p>
        </div>
        <div class="dialogue-options">
            <button class="option-button" id="option-1" style="display: none;">Option 1</button>
            <button class="option-button" id="option-2" style="display: none;">Option 2</button>
            <button class="option-button" id="option-3" style="display: none;">Option 3</button>
            <button class="option-button" id="option-4" style="display: none;">Option 4</button>
            <button class="option-button" id="option-5" style="display: none;">Option 5</button>
            <button class="option-button" id="option-6" style="display: none;">Option 6</button>
            <button class="option-button" id="option-7" style="display: none;">Option 7</button>
            <button class="option-button" id="option-8" style="display: none;">Option 8</button>
        </div>
        <div class="dialogue-actions">
            <button class="action-button" id="trade-button" style="display: none;">Trade</button>
        </div>
    </div>
</div>

<div class="popup hidden" id="popup">
    <div class="popup-content">
        <h2 id="popupTitle">Victory!</h2>
        <p id="popupText">Your team has won the battle.</p>
        <p>Note: You can auto repeat by clicking the checkbox at the top of the battle screen.</p>
        <button id="repeat-popup">Repeat stage</button>
        <button id="nextStage-popup">NextStage</button>
        <button id="return-to-map-popup">Return to Map</button>
    </div>
</div>

<div class="modal" id="evolution-modal">
    <div class="modal-content">
        <h2>Choose Your Evolution</h2>
        <div class="evolution-options" id="evolution-options">
            <!-- Evolution options will be populated here dynamically -->
        </div>
    </div>
</div>
<div class="tabcontent" id="quests">
    <button class="back-to-map-button">Back to Map</button>
    <div id="quest-list" class="themed-scrollbar">
        <!-- Quest items will be populated here -->
    </div>
</div>
<div class="tabcontent" id="battlefield" class="battle-view">
    <div id="teamAndBattleContainer-overlay" class="battle-view">
        <div id="teamAndBattleContainer">
            <div id="stage-controls">
                <button id="decrease-stage"><</button>
                <span id="current-stage">Stage 1</span>
                <button id="increase-stage">></button>
                <input id="repeat" type="checkbox">Repeat</input>
                <button id="flee-battle">Flee</button>
            </div>
            <div id="teamContainer">
                <div class="team" id="team1-battle-container"> <!-- Changed ID to be specific for battle -->
                    <div class="team-row"></div>
                    <div class="team-row"></div>
                </div>
                <div class="team-divider"></div>
                <div class="team" id="team2-battle-container"> <!-- Changed ID to be specific for battle -->
                    <div class="team-row"></div>
                    <div class="team-row"></div>
                </div>
            </div>
            <div id="battle-log-container">
                <button id="toggle-log">Hide Log</button>
                <div id="battle-log">
                    <div id="anchor"></div>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="tabcontent" id="heroContent">
    <button class="back-to-map-button">Back to Map</button>
    <div id="heroInfoRow">
        <div id="heroPortraitAndPaperDoll">
            <div id="heroPortrait">
                <img alt="Hero Portrait" src="Media/portrait.jpg"/>
            </div>
            <div id="paperDoll">
                <div class="slot" id="cloakSlot">Cloak</div>
                <div class="slot" id="helmetSlot">Helmet</div>
                <div class="slot" id="amuletSlot">Amulet</div>
                <div class="slot" id="weaponSlot">Weapon</div>
                <div class="slot" id="chestArmorSlot">Chest Armor</div>
                <div class="slot" id="shieldSlot">Shield</div>
                <div class="slot" id="legArmorSlot">Leg Armor</div>
                <div class="slot" id="glovesSlot">Gloves</div>
                <div class="slot" id="bootsSlot">Boots</div>
                <div class="slot" id="ringSlot">Ring</div>
            </div>
        </div>
        <div id="heroDetails">
            <!-- NEW Sub-tabs for Hero View -->
            <div id="hero-sub-tabs">
                <button class="hero-sub-tab-button active" onclick="openHeroSubTab(event, 'heroMainStatsSkills')">Stats & Skills</button>
                <button class="hero-sub-tab-button" onclick="openHeroSubTab(event, 'heroCompanions')">Companions</button>
            </div>

            <div id="heroMainStatsSkills" class="hero-sub-tab-content active">
                <div id="heroClassesAndStats">
                    <div id="inventory">
                        <h2>Inventory</h2>
                        <div class="iconGrid">
                            <div class="inventorySlot" data-slot-id="inventory_0"></div>
                            <div class="inventorySlot" data-slot-id="inventory_1"></div>
                            <div class="inventorySlot" data-slot-id="inventory_2"></div>
                            <div class="inventorySlot" data-slot-id="inventory_3"></div>
                            <div class="inventorySlot" data-slot-id="inventory_4"></div>
                            <div class="inventorySlot" data-slot-id="inventory_5"></div>
                            <div class="inventorySlot" data-slot-id="inventory_6"></div>
                            <div class="inventorySlot" data-slot-id="inventory_7"></div>
                            <div class="inventorySlot" data-slot-id="inventory_8"></div>
                            <div class="inventorySlot" data-slot-id="inventory_9"></div>
                            <div class="inventorySlot" data-slot-id="inventory_10"></div>
                            <div class="inventorySlot" data-slot-id="inventory_11"></div>
                            <div class="inventorySlot" data-slot-id="inventory_12"></div>
                            <div class="inventorySlot" data-slot-id="inventory_13"></div>
                            <div class="inventorySlot" data-slot-id="inventory_14"></div>
                            <div class="inventorySlot" data-slot-id="inventory_15"></div>
                            <div class="inventorySlot" data-slot-id="inventory_16"></div>
                            <div class="inventorySlot" data-slot-id="inventory_17"></div>
                            <div class="inventorySlot" data-slot-id="inventory_18"></div>
                            <div class="inventorySlot" data-slot-id="inventory_19"></div>
                        </div>
                    </div>
                    <div id="heroClasses">
                        <h2>Classes</h2>
                        <p id="heroClass1">Novice</p>
                        <p id="heroClass2">-</p>
                        <p id="heroClass3">-</p>
                    </div>
                    <div id="heroStats">
                        <h2>Statistics</h2>
                        <p>Strength: <span id="heroStrength">0</span></p>
                        <p>Speed: <span id="heroSpeed">0</span></p>
                        <p>Dexterity: <span id="heroDexterity">0</span></p>
                        <p>Vitality: <span id="heroVitality">0</span></p>
                        <p>Magic Power: <span id="heroMagicPower">0</span></p>
                        <p>Mana: <span id="heroMana">0/0</span></p>
                        <p>Mana Regen: <span id="heroManaRegen">0</span></p>
                        <p>Magic Control: <span id="heroMagicControl">0</span></p>
                        <p>Gold: <span id="heroGold">0</span></p>
                        <p>Armor: <span id="heroArmor">0</span></p>
                        <p>Dodge: <span id="heroDodge">0</span></p>
                        <p>Accuracy: <span id="heroAccuracy">0</span></p>
                    </div>
                </div>
                <div id="heroSkills">
                    <div id="heroConsumableToolbarContainer">
                        <h2>Consumable Toolbar</h2>
                        <div id="heroConsumableToolbar" class="iconGrid">
                            <div class="consumable-toolbar-slot inventorySlot" data-slot-index="0"></div>
                            <div class="consumable-toolbar-slot inventorySlot" data-slot-index="1"></div>
                            <div class="consumable-toolbar-slot inventorySlot" data-slot-index="2"></div>
                        </div>
                    </div>
                    <h2>Active Skills</h2>
                    <div id="activeSkills" class="skills-grid">
                        <!-- Skill boxes populated by JS -->
                    </div>
                    <h2>Passive Skills</h2>
                    <div id="passiveSkills" class="skills-grid">
                        <!-- Skill boxes populated by JS -->
                    </div>
                    <div id="heroWeaponSkills">
                        <h2>Weapon Skills</h2>
                        <!-- Content populated by Render.js -->
                    </div>
                </div>
            </div>

            <div id="heroCompanions" class="hero-sub-tab-content">
                <!-- Content managed by companionUIManager.js -->
                <div class="companions-layout">
                    <div class="companions-roster-panel">
                        <h3>Roster</h3>
                        <div id="companions-roster-list" class="themed-scrollbar">
                            <!-- Companions in roster populated by JS -->
                        </div>
                    </div>
                    <div class="companions-active-party-panel">
                        <h3>Active Party (Max 8)</h3>
                        <div id="companions-party-formation">
                            <div class="party-formation-row">
                                <div class="party-formation-slot" data-row="0" data-col="0"></div>
                                <div class="party-formation-slot" data-row="0" data-col="1"></div>
                                <div class="party-formation-slot" data-row="0" data-col="2"></div>
                                <div class="party-formation-slot" data-row="0" data-col="3"></div>
                            </div>
                            <div class="party-formation-row">
                                <div class="party-formation-slot" data-row="1" data-col="0"></div>
                                <div class="party-formation-slot" data-row="1" data-col="1"></div>
                                <div class="party-formation-slot" data-row="1" data-col="2"></div>
                                <div class="party-formation-slot" data-row="1" data-col="3"></div>
                            </div>
                        </div>
                    </div>
                    <div class="companions-detail-panel">
                        <h3>Companion Details</h3>
                        <div id="companion-selected-details">
                            <p>Select a companion to see their details.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="tabcontent" id="map">
    <div style="display: flex; width: 100%; height: 100%; gap: 10px;">
        <div style="flex: 0 0 220px; display: flex; flex-direction: column; gap: 10px; background-color: rgba(26, 20, 16, 0.5); padding: 10px; border-radius: 8px; border: 1px solid #4a3c2b;">
            <div id="hero-portrait-container">
            </div>
            <div id="gridContainer" class="themed-scrollbar">
                <div class="gridItem"><button class="tablinks" id="heroContentNavButton" onclick="openTab(event, 'heroContent')">Party</button></div>
                <div class="gridItem"><button class="tablinks" id="mapNavButton" onclick="openTab(event, 'map')">Map</button></div>
                <div class="gridItem"><button class="tablinks" id="libraryNavButton" onclick="openTab(event, 'library')">Library</button></div>
                <div class="gridItem"><button class="tablinks" id="questsNavButton" onclick="openTab(event, 'quests')">Quests</button></div>
                <div class="gridItem"><button class="tablinks" id="battle-statisticsNavButton" onclick="openTab(event, 'battle-statistics')">Stats</button></div>
                <div class="gridItem"><button class="tablinks" id="saveGameNavButton">Save Game</button></div>
                <div class="gridItem"><button class="tablinks" id="homeNavButton">Home</button></div>
            </div>
        </div>
        <div id="map-container"></div>
        <div id="poi-list-container">
            <h3>Points of Interest</h3>
            <ul id="poi-list" class="themed-scrollbar"></ul>
        </div>
    </div>
</div>

<div class="tabcontent" id="library">
    <div class="library-container">
        <button class="back-to-map-button" style="position: absolute; top: 15px; right: 15px; z-index: 2;">Back to Map</button>
        <div class="topic-list themed-scrollbar">
            <ul id="topics"></ul>
        </div>
        <div class="content-area themed-scrollbar">
            <div id="content">
                <h2>Welcome to the Library</h2>
                <p>Select a topic to view its content.</p>
            </div>
        </div>
    </div>
</div>
<div class="tabcontent statistics-page" id="battle-statistics">
    <button class="back-to-map-button">Back to Map</button>
    <h1>Battle Statistics</h1>
    <div class="statistic-item">
        <span class="statistic-name">Total Damage Dealt:</span>
        <span class="statistic-value" id="total-damage-dealt">0</span>
    </div>
    <div class="statistic-item">
        <span class="statistic-name">Total Damage Received:</span>
        <span class="statistic-value" id="total-damage-received">0</span>
    </div>
    <div class="statistic-item">
        <span class="statistic-name">Total Healing Received:</span>
        <span class="statistic-value" id="total-healing-received">0</span>
    </div>
    <div class="statistic-item">
        <span class="statistic-name">Total Buffs Applied:</span>
        <span class="statistic-value" id="total-buffs-applied">0</span>
    </div>
    <div class="statistic-item">
        <span class="statistic-name">Total Debuffs Applied:</span>
        <span class="statistic-value" id="total-debuffs-applied">0</span>
    </div>
    <div class="statistic-item">
        <span class="statistic-name">Mana Regenerated:</span>
        <span class="statistic-value" id="mana-regenerated">0</span>
    </div>
    <div class="statistic-item">
        <span class="statistic-name">Stamina Regenerated:</span>
        <span class="statistic-value" id="stamina-regenerated">0</span>
    </div>
    <div class="statistic-item">
        <span class="statistic-name">Stamina Spent:</span>
        <span class="statistic-value" id="stamina-spent">0</span>
    </div>
    <div class="statistic-item">
        <span class="statistic-name">Mana Spent:</span>
        <span class="statistic-value" id="mana-spent">0</span>
    </div>
    <div class="statistic-item">
        <span class="statistic-name">Multi-Kills/Hits:</span>
        <span class="statistic-value" id="multi-kills">0</span>
    </div>
    <div class="statistic-item">
        <span class="statistic-name">Critical Hits:</span>
        <span class="statistic-value" id="critical-hits">0</span>
    </div>
    <div class="statistic-item">
        <span class="statistic-name">Critical Damage:</span>
        <span class="statistic-value" id="critical-damage">0</span>
    </div>
    <div class="statistic-item">
        <span class="statistic-name">Misses:</span>
        <span class="statistic-value" id="misses">0</span>
    </div>
    <div class="statistic-item">
        <span class="statistic-name">Skill Usage:</span>
        <span class="statistic-value" id="skill-usage">0</span>
    </div>
    <div class="statistic-item">
        <span class="statistic-name">Successful Flees:</span>
        <span class="statistic-value" id="successful-flees">0</span>
    </div>
    <div class="statistic-item">
        <span class="statistic-name">Gold Collected:</span>
        <span class="statistic-value" id="gold-collected">0</span>
    </div>
</div>

<div id="footer" class="hidden">
    <div id="level-progress-container">
        <div id="level-progress-bar">
            <span id="class-name">Novice</span>
            <div class="tooltip-text">EXP: 0/100</div>
        </div>
    </div>
    <div id="bottomContainer">
        <div id="battleConsumableBar">
        </div>
        <div class="iconContainer">
            <div class="iconRow upperRow">
                <div class="iconGroup">
                    <div class="battleSkillIcon" id="passiveSkill1"><img src="Media/UI/defaultSkill.jpeg"><div class="tooltip"></div></div>
                    <div class="battleSkillIcon" id="passiveSkill2"><img src="Media/UI/defaultSkill.jpeg"><div class="tooltip"></div></div>
                    <div class="battleSkillIcon" id="passiveSkill3"><img src="Media/UI/defaultSkill.jpeg"><div class="tooltip"></div></div>
                    <div class="battleSkillIcon" id="passiveSkill4"><img src="Media/UI/defaultSkill.jpeg"><div class="tooltip"></div></div>
                </div>
                <div class="iconGroup">
                    <div class="battleSkillIcon" id="passiveSkill5"><img src="Media/UI/defaultSkill.jpeg"><div class="tooltip"></div></div>
                    <div class="battleSkillIcon" id="passiveSkill6"><img src="Media/UI/defaultSkill.jpeg"><div class="tooltip"></div></div>
                    <div class="battleSkillIcon" id="passiveSkill7"><img src="Media/UI/defaultSkill.jpeg"><div class="tooltip"></div></div>
                    <div class="battleSkillIcon" id="passiveSkill8"><img src="Media/UI/defaultSkill.jpeg"><div class="tooltip"></div></div>
                </div>
                <div class="iconGroup">
                    <div class="battleSkillIcon" id="passiveSkill9"><img src="Media/UI/defaultSkill.jpeg"><div class="tooltip"></div></div>
                    <div class="battleSkillIcon" id="passiveSkill10"><img src="Media/UI/defaultSkill.jpeg"><div class="tooltip"></div></div>
                    <div class="battleSkillIcon" id="passiveSkill11"><img src="Media/UI/defaultSkill.jpeg"><div class="tooltip"></div></div>
                    <div class="battleSkillIcon" id="passiveSkill12"><img src="Media/UI/defaultSkill.jpeg"><div class="tooltip"></div></div>
                </div>
            </div>
            <div class="iconRow lowerRow">
                <div class="iconGroup">
                    <div class="battleSkillIcon" id="skill1"><img src="Media/UI/defaultSkill.jpeg"><div class="cooldown-overlay hidden"></div></div><div class="tooltip"></div>
                    <div class="battleSkillIcon" id="skill2"><img src="Media/UI/defaultSkill.jpeg"><div class="cooldown-overlay hidden"></div></div><div class="tooltip"></div>
                    <div class="battleSkillIcon" id="skill3"><img src="Media/UI/defaultSkill.jpeg"><div class="cooldown-overlay hidden"></div></div><div class="tooltip"></div>
                    <div class="battleSkillIcon" id="skill4"><img src="Media/UI/defaultSkill.jpeg"><div class="cooldown-overlay hidden"></div></div><div class="tooltip"></div>
                </div>
                <div class="iconGroup">
                    <div class="battleSkillIcon" id="skill5"><img src="Media/UI/defaultSkill.jpeg"><div class="cooldown-overlay hidden"></div></div><div class="tooltip"></div>
                    <div class="battleSkillIcon" id="skill6"><img src="Media/UI/defaultSkill.jpeg"><div class="cooldown-overlay hidden"></div></div><div class="tooltip"></div>
                    <div class="battleSkillIcon" id="skill7"><img src="Media/UI/defaultSkill.jpeg"><div class="cooldown-overlay hidden"></div></div><div class="tooltip"></div>
                    <div class="battleSkillIcon" id="skill8"><img src="Media/UI/defaultSkill.jpeg"><div class="cooldown-overlay hidden"></div></div><div class="tooltip"></div>
                </div>
                <div class="iconGroup">
                    <div class="battleSkillIcon" id="skill9"><img src="Media/UI/defaultSkill.jpeg"><div class="cooldown-overlay hidden"></div></div><div class="tooltip"></div>
                    <div class="battleSkillIcon" id="skill10"><img src="Media/UI/defaultSkill.jpeg"><div class="cooldown-overlay hidden"></div></div><div class="tooltip"></div>
                    <div class="battleSkillIcon" id="skill11"><img src="Media/UI/defaultSkill.jpeg"><div class="cooldown-overlay hidden"></div></div><div class="tooltip"></div>
                    <div class="battleSkillIcon" id="skill12"><img src="Media/UI/defaultSkill.jpeg"><div class="cooldown-overlay hidden"></div></div><div class="tooltip"></div>
                </div>
            </div>
        </div>
    </div>
</div>
<!-- Module Scripts -->
<script src="EffectClass.js" type="module"></script>
<script src="Skill.js" type="module"></script>
<script src="Member.js" type="module"></script>
<script src="Companion.js" type="module"></script> <!-- NEW -->
<script src="Hero.js" type="module"></script>
<script src="Team.js" type="module"></script>
<script src="BattleLog.js" type="module"></script>
<script src="BattleStatistics.js" type="module"></script>
<script src="EvolutionService.js" type="module"></script>
<script src="Render.js" type="module"></script>
<script src="Targeting.js" type="module"></script>
<script src="Area.js" type="module"></script>
<script src="Battle.js" type="module"></script>
<script src="questSystem.js" type="module"></script>
<script src="questLog.js" type="module"></script>
<script src="navigation.js" type="module"></script>
<script src="map.js" type="module"></script>
<script src="home.js" type="module"></script>
<script src="slideshow.js" type="module"></script>
<script src="dialogue.js" type="module"></script>
<script src="libraryLoader.js" type="module"></script>
<script src="companionUIManager.js" type="module"></script> <!-- NEW -->
<script src="item.js" type="module"></script>
<script src="Main.js" type="module"></script>
<script src="saveLoad.js" type="module"></script>
<script src="initialize.js" type="module"></script>

</body>
</html>
```
--- END OF FILE index.html ---

Updates to `style/heroView.css`:
--- START OF FILE style/heroView.css ---
```css
/* Hero View Specific Styles */

#heroContent {
    background-color: #3a3a3a; /* Dark theme for hero screen */
    padding: 20px;
    border: 2px solid #555;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0,0,0,0.5);
    height: 78vh; /* Consistent height */
    overflow-y: auto; /* Scroll if content overflows */
    color: #fff; /* Light text for dark background */
    display: flex; /* Enable flex for main hero content structure */
    flex-direction: column; /* Stack elements vertically */
}

#heroInfoRow {
    display: flex;
    background-color: #4a4a4a;
    padding: 10px; /* Reduced padding */
    border: 1px solid #666; /* Slightly thinner border */
    border-radius: 8px; /* Slightly smaller radius */
    box-shadow: 0 0 8px rgba(0,0,0,0.4);
    margin-bottom: 10px; /* Space before sub-tabs or content */
}

#heroPortraitAndPaperDoll {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding:5px;
}

#heroPortrait {
    flex: 0 0 150px; /* Keep size */
    /* margin-right: 20px; Let gap handle spacing */
}

#heroPortrait img {
    width: 150px;
    height: 150px;
    border: 2px solid #777;
    border-radius: 10px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
}

#paperDoll {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(4, 1fr);
    gap: 5px; /* Reduced gap */
    padding: 5px; /* Reduced padding */
    background-color: #444;
    border: 1px solid #777; /* Thinner border */
    border-radius: 8px;
    box-shadow: 0 0 5px rgba(0,0,0,0.5);
}

.slot { /* Paperdoll slots */
    display: flex;
    justify-content: center;
    align-items: center;
    width: 50px; /* Reduced size */
    height: 50px; /* Reduced size */
    background-color: #555;
    border: 1px solid #777; /* Thinner border */
    border-radius: 4px; /* Smaller radius */
    box-shadow: 0 0 3px rgba(0,0,0,0.4);
    text-align: center;
    color: #fff;
    font-size: 10px; /* Smaller font */
}

.slot:hover {
    background-color: #666;
}

.slot img { 
    width: 90%; /* Make image slightly smaller than slot */
    height: 90%;
    object-fit: contain;
    pointer-events: none;
}


/* Specific Paperdoll Slot Positions */
#helmetSlot { grid-area: 1 / 2 / 2 / 3; }
#cloakSlot { grid-area: 1 / 3 / 2 / 4; }
#amuletSlot { grid-area: 1 / 1 / 2 / 2; }
#weaponSlot { grid-area: 2 / 1 / 3 / 2; }
#chestArmorSlot { grid-area: 2 / 2 / 3 / 3; }
#shieldSlot { grid-area: 2 / 3 / 3 / 4; }
#legArmorSlot { grid-area: 3 / 2 / 4 / 3; }
#glovesSlot { grid-area: 4 / 1 / 4 / 2; }
#bootsSlot { grid-area: 4 / 2 / 5 / 3; }
#ringSlot { grid-area: 4 / 3 / 5 / 4; }


#heroDetails {
    display: flex;
    flex-direction: column;
    gap: 10px; /* Reduced gap */
    width: 100%;
    flex-grow: 1; /* Allow heroDetails to take remaining space */
    overflow: hidden; /* Prevent its own scrollbars if sub-tabs handle scrolling */
}

/* Sub-tabs within Hero View */
#hero-sub-tabs {
    margin-bottom: 10px;
    border-bottom: 1px solid #777;
    padding-bottom: 5px;
    flex-shrink: 0; /* Prevent tabs from shrinking */
}
.hero-sub-tab-button {
    background-color: #505050; /* Darker inactive tab */
    color: #ccc;
    padding: 8px 12px; /* Smaller padding */
    border: 1px solid #666;
    border-bottom: none; /* Remove bottom border for inactive */
    cursor: pointer;
    margin-right: 3px;
    border-radius: 4px 4px 0 0;
    font-size: 0.9em;
}
.hero-sub-tab-button.active {
    background-color: #3e3e3e; /* Slightly darker for active tab content area */
    color: #fff;
    border-color: #777;
    border-bottom: 1px solid #3e3e3e; /* Match active content background */
}
.hero-sub-tab-content {
    display: none;
    padding: 10px;
    border: 1px solid #666;
    border-top: none;
    background-color: #3e3e3e; /* Match active tab "merged" look */
    border-radius: 0 0 8px 8px;
    flex-grow: 1; /* Allow content to fill space */
    overflow-y: auto; /* Scroll if content itself is too long */
}
.hero-sub-tab-content.active {
    display: flex; /* Use flex for sub-tab content layout */
    flex-direction: column; /* Default stack for main content areas */
}


#heroMainStatsSkills { /* This is a .hero-sub-tab-content */
    /* display: flex; /* Let parent .active handle display */
    flex-direction: column; /* Stack Classes/Stats and Skills sections */
    gap: 10px;
}


#heroClassesAndStats {
    display: flex;
    flex-direction: row; /* Inventory, Classes, Stats side-by-side */
    gap: 10px; /* Reduced gap */
    background-color: #4a4a4a; /* Slightly lighter than sub-tab content bg */
    padding: 10px;
    border: 1px solid #666;
    border-radius: 6px;
}

#heroClassesAndStats h2 {
    margin-top: 0;
    border-bottom: 1px solid #666;
    padding-bottom: 5px;
    font-family: 'Cinzel', serif;
    font-size: 1.1em;
}

#inventory {
    flex: 1.5; /* Give inventory more space */
    min-width: 200px; /* Ensure it has some base width */
}
#heroClasses {
    flex: 0.8;
    min-width: 120px;
}
#heroStats {
    flex: 1.2; /* Stats section */
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); /* Responsive columns */
    gap: 5px 10px; /* row-gap column-gap */
    align-content: start; /* Prevent stretching if few items */
}


#heroStats h2 {
    grid-column: 1 / -1; /* Span all columns */
    margin: 0 0 5px 0;
    padding-bottom: 5px;
    font-family: 'Cinzel', serif;
    text-align: center;
}
#heroStats p {
    margin: 2px 0;
    font-size: 0.9em;
}

.statGrid { 
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
}


#inventory h2 {
    text-align: center;
    margin-bottom: 10px;
}

.iconGrid { 
    display: grid;
    gap: 5px; /* Reduced gap */
}

#inventory .iconGrid {
    grid-template-columns: repeat(auto-fill, 50px); /* Fit as many 50px slots as possible */
    justify-content: start; /* Align to start if not filling row */
}


.inventorySlot { 
    width: 45px; /* Slightly smaller */
    height: 45px;
    background-color: #585858; /* Slightly lighter */
    border: 1px solid #777; /* Thinner */
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 3px rgba(0,0,0,0.3);
    position: relative;
}
.inventorySlot img{
    width: 90%; height: 90%; object-fit: contain;
}

.inventorySlot:hover {
    background-color: #6a6a6a;
}


#heroSkills {
    display: flex;
    flex-direction: column;
    gap: 10px;
    background-color: #4a4a4a;
    padding: 10px;
    border: 1px solid #666;
    border-radius: 6px;
    flex-grow: 1; /* Allow skills section to take space */
}

#heroSkills h2 {
    margin-top: 0;
    border-bottom: 1px solid #666;
    padding-bottom: 5px;
    font-family: 'Cinzel', serif;
    font-size: 1.1em;
    text-align: center;
}


#activeSkills, #passiveSkills { /* Now .skills-grid */
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); /* Responsive */
    gap: 8px;
    margin-top: 5px;
}
.skills-grid { /* Class to apply to #activeSkills, #passiveSkills */
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); /* Responsive */
    gap: 8px;
    margin-top: 5px;
}


.skill-box { 
    padding: 5px;
    text-align: center;
    cursor: pointer;
    position: relative;
    background-color: #383838; /* Darker box */
    border: 1px solid #555;
    border-radius: 4px;
    box-shadow: 0 0 3px rgba(0,0,0,0.4);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px; /* Smaller gap */
    min-height: 80px; /* Ensure consistent height */
}
.skill-box:hover {
    border-color: #777;
    background-color: #404040;
}

.skill-box img {
    width: 28px; /* Smaller icon */
    height: 28px;
}

.skill-box .skill-name { 
    font-size: 0.8em; /* Smaller name */
    margin: 2px 0;
    color: #ddd;
}
.skill-box .targeting-modes {
    font-size: 0.75em;
    padding: 1px 3px;
    background-color: #505050;
    color: #ccc;
    border: 1px solid #666;
    border-radius: 3px;
    margin-top: 2px;
    width: 90%; /* Take most of box width */
}


.skill-box.selected {
    border-color: #00b300; /* Brighter green */
    box-shadow: 0 0 5px #00b300;
}


.progressBar { 
    width: 90%; /* Slightly narrower */
    background-color: #555; /* Darker bar track */
    border-radius: 3px;
    overflow: hidden;
    margin-top: auto; /* Push to bottom if skill-box has extra space */
    height: 8px; /* Smaller height */
}

.progress {
    height: 100%; 
    background-color: #009900; /* Darker green progress */
}

#heroWeaponSkills {
    margin-top: 15px;
    padding: 10px;
    background-color: #4a4a4a;
    border: 1px solid #666;
    border-radius: 6px;
}

#heroWeaponSkills h2 {
    margin-top: 0;
    border-bottom: 1px solid #666;
    padding-bottom: 5px;
    font-family: 'Cinzel', serif;
    font-size: 1.1em;
    text-align: center;
}
/* Weapon skills displayed in a grid, similar to active/passive skills */
#heroWeaponSkills .skills-grid { /* Re-use .skills-grid styling */
    margin-top: 5px;
}
#heroWeaponSkills .skill-box { /* Make weapon skill boxes non-interactive if needed */
    cursor: default;
}
#heroWeaponSkills .skill-box:hover { /* No special hover if non-interactive */
    border-color: #555;
    background-color: #383838;
}


#heroConsumableToolbarContainer {
    margin-top: 15px;
    background-color: #404040; /* Slightly darker */
    padding: 10px;
    border: 1px solid #5c5c5c;
    border-radius: 8px;
    box-shadow: 0 0 6px rgba(0,0,0,0.5);
}

#heroConsumableToolbarContainer h2 {
    text-align: center;
    margin-top: 0;
    margin-bottom: 10px;
    border-bottom: 1px solid #666;
    padding-bottom: 8px;
    font-family: 'Cinzel', serif;
    color: #ddd;
    font-size: 1.1em;
}

#heroConsumableToolbar { /* This is an .iconGrid */
    grid-template-columns: repeat(3, minmax(45px, 1fr)); /* 3 columns for 3 slots */
    justify-content: center;
    max-width: 200px; /* Adjust if slot size changes */
    margin: 0 auto;
}

.consumable-toolbar-slot { /* These also have .inventorySlot class */
    background-color: #333333; /* Darker slots */
    border: 1px solid #505050;
    width: 45px; /* Match inventory slot size */
    height: 45px;
}

.consumable-toolbar-slot:hover {
    background-color: #424242;
    border-color: #686868;
}

.consumable-toolbar-slot img {
    pointer-events: none;
}


/* Companion Tab Styles */
#heroCompanions { /* This is a .hero-sub-tab-content */
    /* display: flex; handled by parent .active */
    flex-direction: column; /* Stack title and layout */
    gap: 10px;
}
#heroCompanions > h2 { /* The "Companions" title */
    text-align: center;
    font-family: 'Cinzel', serif;
    margin: 0 0 10px 0;
    padding-bottom: 5px;
    border-bottom: 1px solid #666;
    flex-shrink: 0; /* Prevent title from shrinking */
}

.companions-layout {
    display: flex;
    gap: 15px;
    flex-grow: 1; /* Allow layout to fill remaining space in tab */
    overflow: hidden; /* Prevent layout from causing scrollbars on tab */
}
.companions-roster-panel, .companions-active-party-panel, .companions-detail-panel {
    flex: 1;
    background-color: #4a4a4a; /* Consistent with other panels */
    padding: 10px;
    border-radius: 6px;
    border: 1px solid #666;
    display: flex;
    flex-direction: column; /* Stack title and content list/grid */
    overflow: hidden; /* Important for scrollable children */
}
.companions-roster-panel h3, .companions-active-party-panel h3, .companions-detail-panel h3 {
    margin: 0 0 8px 0;
    padding-bottom: 5px;
    border-bottom: 1px solid #5c5c5c;
    text-align: center;
    font-family: 'Cinzel', serif;
    font-size: 1em;
    flex-shrink: 0; /* Prevent titles from shrinking */
}

.companions-detail-panel {
    flex: 1.2; /* Slightly more space for details */
}
#companions-roster-list, #companion-selected-details {
    overflow-y: auto; /* Allow these specific lists/areas to scroll */
    flex-grow: 1; /* Allow list to take available space in panel */
    padding-right: 5px; /* Space for scrollbar */
}

.companion-roster-item {
    display: flex;
    align-items: center;
    padding: 6px;
    margin-bottom: 4px;
    background-color: #585858;
    border-radius: 3px;
    cursor: pointer;
    border: 1px solid transparent;
    transition: background-color 0.2s, border-color 0.2s;
}
.companion-roster-item:hover {
    background-color: #6a6a6a;
    border-color: #888;
}
.companion-roster-item img {
    width: 35px;
    height: 35px;
    margin-right: 8px;
    border-radius: 50%;
    border: 1px solid #444;
}
.companion-roster-item span {
    font-size: 0.85em;
}
.companion-roster-item.in-party {
    opacity: 0.6;
    background-color: #4f4f4f;
    cursor: default;
}
.companion-roster-item.in-party:hover {
    border-color: transparent; /* No special hover border if in party */
}


#companions-party-formation {
    display: flex;
    flex-direction: column;
    gap: 4px; /* Small gap between rows */
    align-items: center; /* Center rows if container is wider */
    margin-top: 10px; /* Space from title */
}
.party-formation-row {
    display: flex;
    gap: 4px; /* Small gap between slots */
    justify-content: center; /* Center slots in the row */
}
.party-formation-slot {
    width: 60px; /* Smaller slots */
    height: 60px;
    background-color: #383838; /* Darker empty slot */
    border: 1px dashed #666;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    transition: border-color 0.2s;
}
.party-formation-slot:hover {
    border-color: #999;
}
.party-formation-slot img.companion-portrait-in-slot {
    width: 100%;
    height: 100%;
    object-fit: cover;
    cursor: grab;
    transition: opacity 0.2s;
}
.party-formation-slot img.companion-portrait-in-slot:active {
    cursor: grabbing;
}
.party-formation-slot .companion-name-in-slot {
    position: absolute;
    bottom: 1px;
    left: 0;
    right: 0; /* Make it span width */
    text-align: center;
    font-size: 0.65em;
    background-color: rgba(0,0,0,0.6);
    padding: 1px 2px;
    color: white;
    pointer-events: none; /* Allow clicks to pass to slot */
}

.party-formation-slot.has-hero img.companion-portrait-in-slot {
    border: 2px solid gold; /* Highlight hero */
    box-sizing: border-box;
}
.party-formation-slot.has-companion img.companion-portrait-in-slot {
    border: 1px solid #777;
    box-sizing: border-box;
}


#companion-selected-details {
    font-size: 0.85em;
    line-height: 1.5;
}
#companion-selected-details img.detail-portrait {
    width: 80px; /* Smaller detail portrait */
    height: 80px;
    float: left;
    margin-right: 10px;
    margin-bottom: 5px;
    border-radius: 4px;
    border: 1px solid #555;
}
#companion-selected-details h4 { margin-top: 0; font-size: 1.1em; color: #efefef; }
#companion-selected-details p { margin: 3px 0; }
#companion-selected-details hr { border-color: #555; margin: 6px 0; }
#companion-selected-details h5 { font-size: 1em; margin: 8px 0 4px 0; color: #dfdfdf; }
#companion-selected-details ul.comp-stats-list, #companion-selected-details ul {
    list-style-type: none;
    padding-left: 5px;
    margin: 0;
}
#companion-selected-details ul li {
    margin-bottom: 2px;
    font-size: 0.9em;
}
.companion-stat-xp-bar {
    width: 100%;
    height: 6px; /* Slimmer XP bar */
    background-color: #666;
    border-radius: 3px;
    margin-top: 1px;
    overflow: hidden;
}
.companion-stat-xp-bar .progress {
    height: 100%;
    background-color: #00b39e; /* Teal XP bar */
}
#remove-from-party-btn {
    background-color: #702929;
    color: #f0d0d0;
    border: 1px solid #963b3b;
    padding: 5px 10px;
    font-size: 0.8em;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 10px;
    display: block; /* Make it block for easier centering or full width */
    width: fit-content; /* Or width: 100% */
}
#remove-from-party-btn:hover {
    background-color: #8a3333;
}
#remove-from-party-btn:disabled {
    background-color: #555;
    color: #888;
    cursor: not-allowed;
    border-color: #666;
}
```
--- END OF FILE style/heroView.css ---

Updates to `initialize.js`:
--- START OF FILE initialize.js ---
```javascript
import {nextStage as battleNextStageCmd, repeatStage as battleRepeatStageCmd, startBattle, returnToMap, attemptFlee} from './Battle.js';
import Team from './Team.js';
import Hero from './Hero.js';
import Companion from './Companion.js'; // NEW
import { allCompanionsData as heroModuleAllCompanionsData } from './Hero.js'; // Import from Hero

import EvolutionService from './EvolutionService.js';
import Skill from './Skill.js';
import BattleLog from './BattleLog.js';
import Item from './item.js';
import { currentMapId as mapJsCurrentMapId, initializeMap as initMapModule, setMapStateFromLoad } from './map.js'; 

import {
    deepCopy,
    renderHero,
    renderLevelProgress,
    renderMember, 
    renderPassiveSkills,
    renderSkills,
    showTooltip,
    updateSkillTooltip,
    updateStatsDisplay,
    updateHealth,
    updateMana,
    updateStamina,
    updatePassiveSkillTooltip
} from './Render.js';
import BattleStatistics from './BattleStatistics.js';
import {openTab} from './navigation.js';
import {initializeHomeScreen} from './home.js';
import {initializeDialogue} from './dialogue.js';
import {questSystem as globalQuestSystem} from './questSystem.js';
import {initializeQuestLog} from './questLog.js';
import { openSaveModal, setInitializeAndLoadGame as setInitLoadFnForSaveLoad } from './saveLoad.js';
import { initializeCompanionUI } from './companionUIManager.js'; // NEW


export let battleStatistics;
export let evolutionService;
export let isPaused = false;
export let team1; 
export let team2; 
export let hero;
export let battleLog;
export let classTiers;
export let heroClasses;
export let mobsClasses = null; 
export let allSkillsCache = null;
export let allItemsCache = null;
export let allCompanionsData = {}; // NEW: To store loaded companion definitions


export const NPC_MEDIA_PATH = "Media/NPC/";
let clickTimeout; 


async function loadJSON(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error ${response.status} for URL: ${url}`);
    return response.json();
}

async function loadEffects() {
    try { return await loadJSON('Data/effects.json'); }
    catch (error) { console.error("Failed to load effects.json:", error); return {}; }
}

async function loadSkills(effects, path) {
    try {
        const data = await loadJSON(path);
        const skills = {};
        Object.keys(data).forEach(skillKey => {
            const skillData = data[skillKey];
            skillData.id = skillData.id || skillKey;
            let processedEffects = null;
            if (skillData.effects) {
                if (Array.isArray(skillData.effects) && skillData.effects.length > 0 && skillData.effects[0].id && effects && effects[skillData.effects[0].id]) { // Check effect exists
                    const effectTemplate = effects[skillData.effects[0].id];
                    processedEffects = { ...deepCopy(effectTemplate), ...deepCopy(skillData.effects[0]) };
                } else if (typeof skillData.effects === 'object' && !Array.isArray(skillData.effects) && skillData.effects.id && effects && effects[skillData.effects.id]) { // Check effect exists
                    const effectTemplate = effects[skillData.effects.id];
                    processedEffects = { ...deepCopy(effectTemplate), ...deepCopy(skillData.effects) };
                } else {
                     processedEffects = deepCopy(skillData.effects);
                }
            }
            skills[skillKey] = { ...skillData, effects: processedEffects };
        });
        return skills;
    } catch (error) { console.error(`Failed to load skills from ${path}:`, error); return {};}
}

async function loadItems() {
    try {
        const itemFiles = await loadJSON('Data/items_manifest.json');
        const loadedItems = {};
        for (const fileName of itemFiles) {
            try {
                const itemData = await loadJSON(`Data/Items/${fileName}`);
                if (itemData.id) loadedItems[itemData.id] = new Item(itemData); // Store Item instance directly
                else console.warn(`Item in ${fileName} missing 'id'.`);
            } catch (fileError) {
                console.warn(`Failed to load item file ${fileName}. Status: ${fileError}`);
            }
        }
        return loadedItems;
    } catch (error) { console.error("Failed to load items manifest:", error); return {};}
}

async function loadMobs() { 
    try {
        const mobsData = await loadJSON('Data/mobs.json');
        return mobsData; 
    } catch (error) { console.error("Failed to load mobs.json:", error); return {}; }
}

async function loadClasses() { 
    try {
        const classesData = await loadJSON('Data/classes.json');
        const loadedClasses = {};
        classTiers = classesData['tiers'] || [];
        const heroClassDefinitions = classesData['classes'] || {};
        for (const key in heroClassDefinitions) {
            const heroClassDef = heroClassDefinitions[key];
            loadedClasses[heroClassDef.id] = {...heroClassDef, skills: heroClassDef.skills || []};
        }
        return loadedClasses;
    } catch (error) { console.error("Failed to load classes.json:", error); return { tiers: [], classes: {} }; }
}

// NEW function to load companion definitions
async function loadCompanionDefinitions() {
    try {
        allCompanionsData = await loadJSON('Data/companions.json');
        heroModuleAllCompanionsData = allCompanionsData; // Make available to Hero.js if it expects it this way
        console.log("Companions definitions loaded:", allCompanionsData);
    } catch (error) {
        console.error("Failed to load companions.json:", error);
        allCompanionsData = {};
        heroModuleAllCompanionsData = {};
    }
}


export async function loadGameData(savedGameState = null) {
    try {
        console.log(savedGameState ? "Loading game from saved state." : "Starting new game.");

        const effects = await loadEffects();
        allSkillsCache = {
            ...(await loadSkills(effects, 'Data/skills.json')),
            ...(await loadSkills(effects, 'Data/passives.json'))
        };
        allItemsCache = await loadItems();
        mobsClasses = await loadMobs(); 
        heroClasses = await loadClasses();
        await loadCompanionDefinitions(); // NEW: Load companion defs

        if (Object.keys(heroClasses).length === 0 || Object.keys(allSkillsCache).length === 0) {
            console.error("CRITICAL: Hero classes or skills failed to load.");
            alert("Fatal Error: Core game data could not be loaded. Check console.");
            return false;
        }

        initiateBattleLog();
        evolutionService = new EvolutionService();
        await evolutionService.init();

        // team1 for BATTLEFIELD, team2 for BATTLEFIELD
        team1 = new Team('Team1', 'team1-battle-container'); 
        team2 = new Team('Team2', 'team2-battle-container'); 

        if (savedGameState) {
            if (!savedGameState.heroData || !savedGameState.mapStateData || !savedGameState.mapStateData.currentMapId) {
                console.error("CRITICAL: Saved game state missing heroData or essential mapStateData.", savedGameState);
                alert("Error: Save data is corrupted. Cannot load game.");
                return false;
            }

            const classIdForHero = savedGameState.heroData.classId || 'novice';
            let heroClassInfo = heroClasses[classIdForHero] || heroClasses['novice'] || Object.values(heroClasses)[0];
            if (!heroClassInfo) {
                alert("Critical error: No hero classes available to load hero."); return false;
            }
            // Pass null for initial team1, team2 for Hero constructor, will be set by Battle.js
            hero = new Hero("Placeholder", heroClassInfo, [], 1, null, null);
            hero.restoreFromData(savedGameState.heroData, heroClasses, allSkillsCache, allItemsCache);
            // Hero's restoreFromData now handles companions and partyFormation.

            battleStatistics = new BattleStatistics();
            battleStatistics.restoreFromData(savedGameState.battleStatisticsData);
            await globalQuestSystem.restoreFromData(savedGameState.questSystemData);

            initMapModule(); 
            setMapStateFromLoad(savedGameState.mapStateData); 

            renderLevelProgress(hero);
            // No direct team1 rendering here for map UI. Hero map portrait is handled by map.js
            // renderTeamMembers(hero.getActivePartyMembers(), 'team1-members-map', true); // Example if needed for map

            hero.reselectSkillsAfterLoad();
            if (document.getElementById('heroContent')) {
                updateStatsDisplay(hero); renderSkills(hero); renderPassiveSkills(hero);
                initializeCompanionUI(); // Initialize companion UI after hero is loaded
            }
            const homeScreen = document.getElementById('home-screen');
            if (homeScreen?.classList.contains('active')) {
                homeScreen.classList.remove('active'); homeScreen.classList.add('hidden');
                document.getElementById('footer')?.classList.remove('hidden');
            }
            openTab(null, 'map');

        } else { // New Game
            battleStatistics = new BattleStatistics();
            await globalQuestSystem.loadQuests();

            if (!createAndInitHero(heroClasses, null, null)) return false; 
            
            ['simple_sword_001', 'worn_leather_helmet_001', 'healing_potion_minor_001', 'healing_potion_minor_001'].forEach(itemId => {
                if(allItemsCache[itemId]) hero.addItemToInventory(new Item(allItemsCache[itemId])); // Create new instances for inventory
            });
            
            // Recruit some default companions for a new game
            hero.recruitCompanion('shadowClaw');
            hero.recruitCompanion('emberWisp');
            // hero.recruitCompanion('stoneGuard'); // Optionally add more

            initMapModule(); 
            if (document.getElementById('heroContent')) {
                 initializeCompanionUI(); // Also initialize for new game
            }
        }

        initiateEventListeners();
        initializeQuestLog();
        battleStatistics.updateBattleStatistics();

        return true;

    } catch (error) {
        console.error("A critical error occurred during loadGameData:", error);
        alert("A fatal error occurred while initializing the game. Check console.");
        return false;
    }
}
setInitLoadFnForSaveLoad(loadGameData);


function createAndInitHero(classes, playerTeamContext, opposingTeamContext) {
    const baseClassId = 'novice';
    let baseClassInfo = classes[baseClassId] || Object.values(classes)[0];
    if (!baseClassInfo) {
        console.error("Cannot create hero: No classes loaded or 'novice' not found.");
        alert("Fatal: No classes available to create hero.");
        return false;
    }

    const heroSkillsInstances = (baseClassInfo.skills || []).map(skillId => {
        const skillData = allSkillsCache[skillId];
        return skillData ? new Skill(skillData, skillData.effects) : null;
    }).filter(Boolean);

    hero = new Hero("Hero", baseClassInfo, heroSkillsInstances, 1, playerTeamContext, opposingTeamContext);
    // Initial hero placement in formation
    hero.placeHeroInFirstAvailableSlot();


    if (document.getElementById('heroContent')) {
        updateStatsDisplay(hero); renderSkills(hero); renderPassiveSkills(hero);
    }
    renderLevelProgress(hero);
    // No team rendering for map here, hero portrait on map is separate
    selectInitialSkills();
    return true;
}


function selectInitialSkills() {
    if (!hero || !hero.skills) return;
    const activeSkillBoxes = document.querySelectorAll("#activeSkills .skill-box");
    let activeSelectedCount = 0;
    hero.skills.forEach(skill => {
        if (skill.type === "active" && activeSelectedCount < 4 && activeSkillBoxes[activeSelectedCount]) {
            const skillBox = Array.from(activeSkillBoxes).find(sb => sb.id === 'skill-box-' + skill.name.replace(/\s/g, ''));
            if(skillBox) hero.selectSkill(skill, skillBox, false);
            activeSelectedCount++;
        }
    });

    const passiveSkillBoxes = document.querySelectorAll("#passiveSkills .skill-box");
    let passiveSelectedCount = 0;
    hero.skills.forEach(skill => {
        if (skill.type !== "active" && passiveSelectedCount < 4 && passiveSkillBoxes[passiveSelectedCount]) {
             const skillBox = Array.from(passiveSkillBoxes).find(sb => sb.id === 'skill-box-' + skill.name.replace(/\s/g, ''));
            if(skillBox) hero.selectSkill(skill, skillBox, true);
            passiveSelectedCount++;
        }
    });
}

function initiateBattleLog() {
    const logContainer = document.getElementById('battle-log');
    if (!logContainer) {
        console.warn("Battle log container not found.");
        battleLog = { log: console.log }; 
        return;
    }
    battleLog = new BattleLog(logContainer);
    const toggleLogButton = document.getElementById('toggle-log');
    if (toggleLogButton) {
        let logVisible = true;
        toggleLogButton.addEventListener('click', () => {
            logVisible = !logVisible;
            logContainer.style.display = logVisible ? 'flex' : 'none';
            toggleLogButton.textContent = logVisible ? 'Hide Log' : 'Show Log';
        });
    }
}

export function renderTeamMembers(membersToRender, containerId, clearExisting = true) {
    const teamContainerElement = document.getElementById(containerId);
    if (!teamContainerElement) {
        // console.warn(`Team container ${containerId} not found for rendering members.`);
        return;
    }
    const teamRows = teamContainerElement.querySelectorAll('.team-row');
    if (teamRows.length < 2) {
        console.error(`Team rows not found in ${containerId}. HTML structure issue.`);
        return;
    }

    if (clearExisting) {
        teamRows[0].innerHTML = ''; teamRows[1].innerHTML = '';
    }
    
    // Ensure members have unique member IDs for this battle instance if they are companions or mobs
    membersToRender.forEach((member, index) => {
        if (!member.isHero) { // Hero's memberId is usually fixed
            member.memberId = `${containerId}-member-${member.companionId || member.classId || 'unknown'}-${index}`;
        } else {
            member.memberId = `hero-${containerId}`; // Ensure hero has a unique ID for this container context
        }
    });


    membersToRender.forEach(member => {
        // Determine row based on member.position (default to Front if not set for some reason)
        const targetRowIndex = (member.position === "Back") ? 1 : 0;
        let rowElement = teamRows[targetRowIndex];

        // Basic overflow: if preferred row is full (4 members) and other row has space
        if (rowElement.children.length >= 4) {
            const otherRowIndex = (targetRowIndex === 0) ? 1 : 0;
            if (teamRows[otherRowIndex].children.length < 4) {
                rowElement = teamRows[otherRowIndex];
                // Optionally, log or update member.position if moved due to overflow,
                // but for battle rendering, this visual placement is key.
            } else {
                // Both rows full, cannot place more. This shouldn't happen if maxPartySize is respected.
                console.warn(`Cannot place ${member.name} in ${containerId}, both rows are full.`);
                return; 
            }
        }
        
        const memberElement = member.isHero ? renderHero(member) : renderMember(member); // renderMember for companions too
        rowElement.appendChild(memberElement);
        
        // Ensure DOM elements are initialized for dynamic updates (health bars etc.)
        if (typeof member.initializeDOMElements === 'function') {
             member.initializeDOMElements(); // Connects member instance to its new DOM element
        }
        updateHealth(member); updateMana(member); updateStamina(member);
    });
}


function initiateEventListeners() {
    const navButtonMappings = {
        'heroContentNavButton': 'heroContent', 'mapNavButton': 'map',
        'libraryNavButton': 'library', // 'optionsNavButton': 'options', // Options not fully implemented yet
        'battle-statisticsNavButton': 'battle-statistics',
        'questsNavButton': 'quests', // Add quests button
        'homeNavButton': 'home' // Add home button
    };
    for (const id in navButtonMappings) {
        const button = document.getElementById(id);
        if (button) {
            // Remove existing listener to prevent duplicates if this function is called multiple times
            // This is a simple way; a more robust way would be to store and remove specific handlers.
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            newButton.addEventListener('click', (event) => openTab(event, navButtonMappings[id]));
        }
    }
    
    const saveGameButton = document.getElementById('saveGameNavButton');
    if (saveGameButton) {
        const newSaveButton = saveGameButton.cloneNode(true);
        saveGameButton.parentNode.replaceChild(newSaveButton, saveGameButton);
        newSaveButton.addEventListener('click', openSaveModal);
    }


    // Battle popup buttons
    document.getElementById('repeat-popup')?.addEventListener('click', () => { hidePopupForBattleActions(); battleRepeatStageCmd(); });
    document.getElementById('nextStage-popup')?.addEventListener('click', () => { hidePopupForBattleActions(); battleNextStageCmd(); });
    document.getElementById('return-to-map-popup')?.addEventListener('click', () => { hidePopupForBattleActions(); returnToMap(); });

    document.getElementById('flee-battle')?.addEventListener('click', attemptFlee);
    
    // Centralized keydown listener
    document.removeEventListener('keydown', handleGlobalKeyDown); // Remove previous if any
    document.addEventListener('keydown', handleGlobalKeyDown);


    // Tooltip listeners (ensure these are general enough or scoped correctly)
    const tooltipArea = document.getElementById('battlefield') || document.body; // More general for battle tooltips
    tooltipArea.addEventListener('mouseover', (event) => {
        const target = event.target.closest('.memberPortrait, .iconDiv, .battleSkillIcon, .buff, .debuff, [data-tooltip-text]');
        if (target) {
            const tooltip = target.querySelector('.tooltip, .effectTooltip'); 
            if (tooltip && tooltip.innerHTML.trim()) showTooltip(event, tooltip);
        }
    }, true);
    tooltipArea.addEventListener('mouseout', (event) => {
        const target = event.target.closest('.memberPortrait, .iconDiv, .battleSkillIcon, .buff, .debuff, [data-tooltip-text]');
        const tooltip = target?.querySelector('.tooltip, .effectTooltip');
        if (tooltip) { tooltip.style.display = 'none'; tooltip.style.visibility = 'hidden'; }
    }, true);

    // Skill bar listeners are now set in Render.js within updateSkillBar
}

function handleGlobalKeyDown(event) {
    if (event.code === 'Space') {
        const activeTab = document.querySelector('.tabcontent.active');
        if (activeTab && activeTab.id === 'battlefield') { // Only pause if on battlefield
            togglePause();
        }
    }
    // Add other global keybinds here if needed
}


function hidePopupForBattleActions() { 
    document.getElementById('popup')?.classList.add('hidden');
}


document.addEventListener('DOMContentLoaded', async () => {
    initializeHomeScreen(); 
    await initializeDialogue();
    initializeQuestLog(); // Initialize quest log UI system

    document.querySelectorAll('.back-to-map-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const mapNavButton = document.getElementById('mapNavButton') || document.querySelector('.tablinks[onclick*="\'map\'"]');
            openTab({ currentTarget: mapNavButton }, 'map');
        });
    });
});


function togglePause() {
    isPaused = !isPaused;
    const overlayTarget = document.getElementById('teamAndBattleContainer-overlay') || document.getElementById('battlefield');
    if (!overlayTarget) return;

    overlayTarget.classList.toggle('paused-overlay', isPaused);
    if (battleLog) battleLog.log(isPaused ? "Battle Paused" : "Battle Resumed");

    const activeBattleParty = hero ? hero.getActivePartyMembers() : []; // Get current active party for battle
    const enemyParty = team2 ? team2.members : [];

    [...activeBattleParty, ...enemyParty].forEach(member => {
        if (member && member.currentHealth > 0) { // Check member exists and is alive
            if (isPaused) member.stopSkills();
            else member.startSkills();
        }
    });
}
```
--- END OF FILE initialize.js ---

Updates to `Battle.js`:
--- START OF FILE Battle.js ---
```javascript
import Member from './Member.js';
import {battleLog, evolutionService,renderTeamMembers, hero, isPaused,
 team1, team2, battleStatistics, mobsClasses, allCompanionsData } from './initialize.js'; // Added allCompanionsData
import Hero from './Hero.js';
import Area from './Area.js';
import { questSystem } from './questSystem.js';
import { openTab } from './navigation.js';
import { updateHealth, updateMana, updateStamina } from './Render.js';


let battleStarted = false;
let battleInterval = null;
let isFleeOnCooldown = false;
const FLEE_COOLDOWN_SECONDS = 10;
let currentPoiName = null; 
let currentBattleDialogueOptions = null;
let isBattlePausedForDialogue = false;

let currentBattleArea = null; 
let currentBattleStageNumber = 1; 
const xpPerStageBase = 50; // Base XP for clearing a stage

function resetFleeButtonState() {
    const fleeButton = document.getElementById('flee-battle');
    if (fleeButton) {
        fleeButton.disabled = false;
        fleeButton.textContent = "Flee";
    }
    isFleeOnCooldown = false;
}

function initializeBattleState(poiName = null, stageNum = 1) { 
    currentPoiName = poiName;
    currentBattleStageNumber = stageNum;
    currentBattleArea = null; 
    resetFleeButtonState();
    isBattlePausedForDialogue = false;
}

async function gameTick() {
    if (isPaused || !battleStarted || isBattlePausedForDialogue) return;

    // Player team (hero + companions) regeneration
    team1.members.forEach(member => {
        if (member.currentHealth > 0) member.handleRegeneration();
    });
    // Enemy team regeneration
    team2.members.forEach(member => {
        if (member.currentHealth > 0) member.handleRegeneration();
    });

    await checkBattleOutcome();
}

async function checkBattleOutcome() {
    const team1Alive = team1.members.some(member => member.currentHealth > 0);
    const team2Alive = team2.members.some(member => member.currentHealth > 0);

    if (!team1Alive || !team2Alive) {
        if (battleInterval) clearInterval(battleInterval);
        battleInterval = null;

        const wasBattleStarted = battleStarted; // Store before changing
        battleStarted = false; // Stop battle logic

        if (!team1Alive) {
            await handleBattleLoss();
        } else { // team1 won (team2 defeated)
            await handleBattleWin();
        }

        // Stop skills for all members involved in the just-ended battle
        // This uses the current members in team1 and team2 at the point of battle end.
        stopAllSkills(team1, team2);
        
        if (hero) evolutionService.checkClassAvailability(); // Check hero evolution

        const popup = document.getElementById('popup');
        if (wasBattleStarted && (!popup || popup.classList.contains('hidden'))) {
             checkAndHandleRepeatStage(); // Auto-repeat if enabled and appropriate
        }
    }
}

function calculateGoldDrop() {
    let totalGoldDropped = 0;
    team2.members.forEach(mob => {
        if (mob.currentHealth <= 0 && mob.goldDrop > 0) {
            totalGoldDropped += mob.goldDrop;
        }
    });
    return totalGoldDropped;
}

function calculateStageXP() {
    // Example: XP scales with stage number and maybe POI difficulty
    let xpFromBattle = xpPerStageBase * currentBattleStageNumber;
    // Could add more complex calculation based on enemies defeated, their levels, etc.
    return Math.max(10, Math.floor(xpFromBattle)); // Ensure at least some XP
}


async function handleBattleWin() {
    const totalGoldDropped = calculateGoldDrop();
    if (totalGoldDropped > 0) {
        hero.addGold(totalGoldDropped); // addGold now updates hero sheet UI
        battleLog.log(`Collected ${totalGoldDropped} gold!`);
        battleStatistics.addGoldCollected(totalGoldDropped);
    }

    const xpFromBattle = calculateStageXP();
    if (xpFromBattle > 0 && hero) {
        battleLog.log(`Party gained ${xpFromBattle} XP!`);
        hero.distributeBattleXP(xpFromBattle); // Distributes to hero and active companions
    }

    questSystem.updateQuestProgress('combatComplete', { poiName: currentPoiName, stage: currentBattleStageNumber });

    if (currentBattleDialogueOptions && currentBattleDialogueOptions.npcId && currentBattleDialogueOptions.endWinDialogueId) {
        isBattlePausedForDialogue = true;
        battleLog.log(`Starting post-battle (win) dialogue: ${currentBattleDialogueOptions.endWinDialogueId}`);
        await window.startDialogue(currentBattleDialogueOptions.npcId, currentBattleDialogueOptions.endWinDialogueId);
        battleLog.log("Post-battle (win) dialogue finished.");
        isBattlePausedForDialogue = false;
    }
    
    if (currentBattleArea && currentBattleStageNumber < currentBattleArea.stages.length) {
        showPopup("Stage Cleared!", `Your team has cleared stage ${currentBattleStageNumber}.`);
    } else {
        showPopup("Victory!", `Your team has defeated all enemies in ${currentPoiName}.`);
    }
}

async function handleBattleLoss() {
    if (currentBattleDialogueOptions && currentBattleDialogueOptions.npcId && currentBattleDialogueOptions.endLossDialogueId) {
        isBattlePausedForDialogue = true;
        battleLog.log(`Starting post-battle (loss) dialogue: ${currentBattleDialogueOptions.endLossDialogueId}`);
        await window.startDialogue(currentBattleDialogueOptions.npcId, currentBattleDialogueOptions.endLossDialogueId);
        battleLog.log("Post-battle (loss) dialogue finished.");
        isBattlePausedForDialogue = false;
    }
    showPopup("Defeat!", "Your team has been defeated.");
}

function checkAndHandleRepeatStage() {
    const repeatCheckbox = document.getElementById('repeat');
    const popup = document.getElementById('popup');
    if (repeatCheckbox && repeatCheckbox.checked && popup && !popup.classList.contains('hidden')) {
        const canAdvance = currentBattleArea && currentBattleStageNumber < currentBattleArea.stages.length;
        if (!canAdvance || (popup && popup.querySelector('#popupTitle').textContent.includes("Victory!"))) { 
            setTimeout(async () => {
                await repeatStage();
            }, 1000);
        }
    }
}

function useTeamSkills(teamInstance) { // Renamed param for clarity
    teamInstance.members.forEach(member => {
        if (member.currentHealth > 0) {
            // Companions and Mobs use their skills automatically based on their AI (if any) or simple loop
            // For now, loop through all skills and use if not on cooldown and resources permit
            member.skills.forEach(skill => {
                 if (skill.type === "active" && !skill.onCooldown &&
                    skill.manaCost <= member.currentMana &&
                    skill.staminaCost <= member.currentStamina) {
                    skill.useSkill(member); // Member uses its own skill
                } else if (skill.type === "passive") {
                    // Passive skills usually apply their effects on init or under certain conditions handled by EffectClass
                }
            });
        }
    });
}

function stopAllSkills(playerTeamInstance, enemyTeamInstance) {
    if (playerTeamInstance && playerTeamInstance.members) {
        playerTeamInstance.members.forEach(member => {
            if (member && typeof member.stopSkills === 'function') { // Check member exists
                member.stopSkills();
            }
        });
    }
    if (enemyTeamInstance && enemyTeamInstance.members) {
        enemyTeamInstance.members.forEach(member => {
            if (member && typeof member.stopSkills === 'function') { // Check member exists
                member.stopSkills();
            }
        });
    }
}


function calculateFleeChance() {
    let heroDex = hero.stats.dexterity || 0;
    // Consider average dexterity of the entire player party for flee chance
    const avgPlayerPartyDex = team1.members.reduce((sum, pMember) => sum + (pMember.stats.dexterity || 0), 0) / team1.members.length || heroDex;

    let avgEnemyDex = 0;
    const aliveEnemies = team2.getAllAliveMembers();

    if (aliveEnemies.length > 0) {
        avgEnemyDex = aliveEnemies.reduce((sum, enemy) => sum + (enemy.stats.dexterity || 0), 0) / aliveEnemies.length;
    }

    let fleeChance = 50 + Math.floor(avgPlayerPartyDex / 5) - Math.floor(avgEnemyDex / 5);
    return Math.max(10, Math.min(90, fleeChance));
}

function handleSuccessfulFlee(fleeChance, randomRoll) {
    battleLog.log(`Successfully fled from battle! (Chance: ${fleeChance.toFixed(0)}%, Rolled: ${randomRoll.toFixed(0)})`);
    battleStatistics.addSuccessfulFlee();
    stopBattle(true); 
    questSystem.updateQuestProgress('escape', { poiName: currentPoiName});
}

function handleFailedFlee(fleeChance, randomRoll) {
    battleLog.log(`Failed to flee! (Chance: ${fleeChance.toFixed(0)}%, Rolled: ${randomRoll.toFixed(0)})`);
}

function startFleeCooldownVisuals() {
    const fleeButton = document.getElementById('flee-battle');
    if (!fleeButton) return;

    let cooldownTimeLeft = FLEE_COOLDOWN_SECONDS;
    fleeButton.textContent = `Flee (${cooldownTimeLeft}s)`;

    const cooldownInterval = setInterval(() => {
        cooldownTimeLeft--;
        const currentFleeButton = document.getElementById('flee-battle'); // Re-fetch in case DOM changed
        if (currentFleeButton) {
            currentFleeButton.textContent = `Flee (${cooldownTimeLeft}s)`;
        }

        if (cooldownTimeLeft <= 0) {
            clearInterval(cooldownInterval);
            isFleeOnCooldown = false;
            if (currentFleeButton && battleStarted) { // Only enable if battle is still ongoing
                currentFleeButton.disabled = false;
                currentFleeButton.textContent = "Flee";
            } else if (currentFleeButton) { // If battle ended during cooldown, just reset text
                 currentFleeButton.textContent = "Flee";
            }
        }
    }, 1000);
}

export function attemptFlee() {
    if (!battleStarted) {
        battleLog.log("Cannot flee, battle not active.");
        return;
    }
    if (isFleeOnCooldown) {
        battleLog.log("Flee is on cooldown.");
        return;
    }

    const fleeButton = document.getElementById('flee-battle');
    if (fleeButton) {
        fleeButton.disabled = true;
    }
    isFleeOnCooldown = true;

    const fleeChance = calculateFleeChance();
    const randomRoll = Math.random() * 100;

    if (randomRoll < fleeChance) {
        handleSuccessfulFlee(fleeChance, randomRoll);
    } else {
        handleFailedFlee(fleeChance, randomRoll);
    }
    startFleeCooldownVisuals();
}

function showPopup(title, message) {
    if (isBattlePausedForDialogue) return;

    const popup = document.getElementById('popup');
    const titleDiv = document.getElementById('popupTitle');
    const messageDiv = document.getElementById('popupText');
    const nextStageButton = document.getElementById('nextStage-popup'); 

    if (popup && titleDiv && messageDiv) {
        titleDiv.textContent = title;
        messageDiv.textContent = message;

        if (nextStageButton) {
            const canAdvance = currentBattleArea && currentBattleArea.isLoaded && currentBattleStageNumber < currentBattleArea.stages.length;
            if (title.includes("Stage Cleared!") && canAdvance) {
                nextStageButton.style.display = 'inline-block';
            } else {
                nextStageButton.style.display = 'none';
            }
        }
        popup.classList.remove('hidden');
    }
}

function hidePopup() {
    const popup = document.getElementById('popup');
    if (popup) {
        popup.classList.add('hidden');
    }
}

export function returnToMap() { 
    hidePopup();
    stopBattle(false); 
    openTab({ currentTarget: document.getElementById('mapNavButton') }, 'map');
}

async function startBattle(poiData, dialogueOptions = null, stageNum = 1) {
    if (!poiData || !poiData.name) {
        console.error("startBattle called without valid POI data or POI name.");
        battleLog.log("Error: Battle cannot start without area information.");
        return;
    }
    const areaNameString = poiData.name;
    initializeBattleState(areaNameString, stageNum); 

    currentBattleDialogueOptions = dialogueOptions;
    currentBattleArea = new Area(areaNameString); 

    battleLog.log(`Attempting to load area: ${areaNameString} for battle.`);
    await currentBattleArea.loadData();

    if (!currentBattleArea.isLoaded) {
        console.error(`Failed to load data for area: ${areaNameString}. Cannot start battle.`);
        battleLog.log(`Error: Could not load enemy team for ${areaNameString}.`);
        showPopup("Battle Error", `Could not load battle area: ${areaNameString}.`);
        setTimeout(returnToMap, 2000); 
        return;
    }
    battleLog.log(`Area ${areaNameString} loaded. Spawning mobs for stage ${currentBattleStageNumber}.`);

    // Populate Player Team (team1)
    team1.clearMembers();
    const activePlayerParty = hero.getActivePartyMembers(); // Gets hero + companions from formation

    activePlayerParty.forEach((member, index) => {
        member.team = team1; // Assign to battle team instance
        member.opposingTeam = team2;
        // member.memberId is set in renderTeamMembers or should be persistent on hero/companion
        
        // Reset states for battle
        member.dead = false;
        member.currentHealth = member.maxHealth;
        member.currentMana = member.stats.mana;
        member.currentStamina = member.stats.stamina;
        member.effects = []; // Clear effects from previous battles/states
        // Visual reset will be handled by renderTeamMembers and subsequent updates

        team1.addMember(member);
    });
    renderTeamMembers(team1.members, 'team1-battle-container', true); // Render to BATTLEFIELD container
    team1.members.forEach(member => { // Initialize DOM elements after rendering
      if (typeof member.initializeDOMElements === 'function') member.initializeDOMElements();
      updateHealth(member); updateMana(member); updateStamina(member); // Ensure bars are correct
       if (member.element) { // Clear visual effects from previous battle
            const effectsContainer = member.element.querySelector('.effects');
            if (effectsContainer) effectsContainer.innerHTML = '';
            const portraitImg = member.element.querySelector(".memberPortrait img");
            if (portraitImg && member.class.portrait) portraitImg.src = member.class.portrait; // Reset portrait from dead.jpg
        }
    });


    // Populate Enemy Team (team2)
    team2.clearMembers(); 
    const mobs = currentBattleArea.spawnMobs(mobsClasses, team2, currentBattleStageNumber);

    if (!mobs || mobs.length === 0) {
        console.warn(`No mobs spawned for ${areaNameString}, stage ${currentBattleStageNumber}.`);
        battleLog.log(`Warning: No enemies for ${areaNameString} - Stage ${currentBattleStageNumber}.`);
    }

    mobs.forEach((mob, index) => {
        mob.team = team2;
        mob.opposingTeam = team1;
        // mob.memberId is set in renderTeamMembers
        team2.addMember(mob);
    });
    renderTeamMembers(team2.members, 'team2-battle-container', true); 
    team2.members.forEach(mob => {
        if (typeof mob.initializeDOMElements === 'function') mob.initializeDOMElements();
    });


    if (dialogueOptions && dialogueOptions.npcId && dialogueOptions.startDialogueId) {
        isBattlePausedForDialogue = true;
        battleLog.log(`Starting pre-battle dialogue: ${dialogueOptions.startDialogueId}`);
        await window.startDialogue(dialogueOptions.npcId, dialogueOptions.startDialogueId);
        battleLog.log("Pre-battle dialogue finished.");
        isBattlePausedForDialogue = false;
    }
    
    // Check if battle should even start if one team is empty (e.g. no mobs spawned)
    if (team1.members.length === 0 || team2.members.length === 0) {
        battleLog.log("Battle cannot start, one team is empty.");
        await checkBattleOutcome(); // This will resolve the empty battle immediately
        return;
    }


    battleLog.log(`Battle started at ${currentPoiName}, Stage ${currentBattleStageNumber}`);
    battleStarted = true;

    useTeamSkills(team2); // Mobs use their skills
    if (hero) hero.triggerRepeatSkills(); // Hero's auto-repeat skills

    if (battleInterval) {
        clearInterval(battleInterval);
    }
    battleInterval = setInterval(gameTick, 1000);
}

function stopBattle(fled = false) {
    if (battleInterval) {
        clearInterval(battleInterval);
        battleInterval = null;
    }
    isBattlePausedForDialogue = false; // Ensure dialogue pause is lifted

    // Skills are stopped by checkBattleOutcome -> handleWin/Loss -> stopAllSkills
    // or here directly if fleeing.
    if (fled) {
        battleStarted = false; 
        stopAllSkills(team1, team2); // Explicitly stop skills if fleeing before outcome check
        hidePopup();
        openTab({ currentTarget: document.getElementById('mapNavButton') }, 'map');
    }
}

async function repeatStage() {
    hidePopup();
    if (!currentBattleArea || !currentBattleArea.isLoaded || !currentPoiName) {
        console.error("Cannot repeat stage: Battle area context not valid.");
        battleLog.log("Error: No valid area context to repeat the stage.");
        returnToMap();
        return;
    }
    const pseudoPoiData = { name: currentPoiName }; 
    await startBattle(pseudoPoiData, currentBattleDialogueOptions, currentBattleStageNumber);
}

async function nextStage() {
    hidePopup();
    if (!currentBattleArea || !currentBattleArea.isLoaded || !currentPoiName) {
        console.error("Cannot advance to next stage: Battle area context not valid.");
        battleLog.log("Error: No valid area context for next stage.");
        returnToMap();
        return;
    }

    const nextStageNum = currentBattleStageNumber + 1;

    if (nextStageNum > currentBattleArea.stages.length) {
        battleLog.log(`All stages in ${currentPoiName} cleared! This should have been caught by handleBattleWin.`);
        showPopup("Area Cleared!", `You have completed all stages in ${currentPoiName}.`);
        return; 
    }

    const pseudoPoiData = { name: currentPoiName };
    await startBattle(pseudoPoiData, currentBattleDialogueOptions, nextStageNum);
}

export {startBattle, stopBattle, hidePopup, battleStarted, repeatStage, nextStage};
```
--- END OF FILE Battle.js ---

Final check on `style/heroView.css` and `index.html` for the skill grid class name.
In `index.html` for `#activeSkills` and `#passiveSkills`, I used placeholder `div.skill` which implies the old structure.
The JS `renderSkills` and `renderPassiveSkills` in `Render.js` uses `skill-box`.
I've updated `heroView.css` to better target `.skill-box` for the hero sheet.
The `skills-grid` class has been added to `index.html` for `#activeSkills` and `#passiveSkills`.

I'll create placeholder companion portraits if they don't exist (e.g., `Media/Companions/Portraits/wolf_placeholder.png`). Assume these exist for now.
This is a very large change, there might be minor adjustments needed after testing.

One more thing: `renderTeamMembers` in `initialize.js` had `team1-members-map` as a containerId for team1, but the battle logic will use `team1-battle-container`. This is fine as they serve different display purposes. The map only shows the hero's portrait currently via `hero-portrait-container`. `team1-members-map` isn't actually used to display a full team on the map in the current setup. The player's party for battle will be correctly rendered into `team1-battle-container`.This is a substantial update! I've implemented the companion system as requested.

Here's a summary of the changes and new files:

**New Files:**

1.  **`Data/companions.json`**: Contains definitions for companions (stats, skills, appearance). I've added three example companions: Shadow Claw (wolf), Ember Wisp (fire elemental), and Stone Guard (golem). You'll need to create placeholder images for them in `Media/Companions/Portraits/` (e.g., `wolf_placeholder.png`).
2.  **`Companion.js`**: Defines the `Companion` class, inheriting from `Member.js`. It handles companion-specific logic like leveling and experience gain.
3.  **`companionUIManager.js`**: Manages the UI for the new "Companions" tab in the Hero view. This includes rendering the roster, the 2x4 active party formation grid (with drag-and-drop), and the selected companion's details.

**Modified Files:**

1.  **`Hero.js`**:
    *   Added `allCompanions` array (roster of `Companion` instances).
    *   Added `partyFormation` (2x4 grid for hero + active companions).
    *   Methods to recruit companions, add/remove from formation, set position, and distribute battle XP.
    *   Updated serialization/deserialization (`getSerializableData`, `restoreFromData`) to include companion and party formation data.
    *   `selectSkill` and `unselectSkill` now correctly refer to the 4-slot skill BAR for active/passive skills, distinct from the list of all learnable skills.

2.  **`initialize.js`**:
    *   Loads `companions.json` into `allCompanionsData`.
    *   Integrates `companionUIManager.js`.
    *   When a new game starts, the hero now recruits "Shadow Claw" and "Ember Wisp" by default.
    *   `renderTeamMembers` updated to handle dynamic `memberId` for battle DOM elements, especially for companions.
    *   Ensures hero is placed in the party formation.
    *   Global keydown listener (`handleGlobalKeyDown`) made more specific to only pause on the battlefield.

3.  **`Battle.js`**:
    *   `startBattle`:
        *   Player's team (`team1`) is now populated from `hero.getActivePartyMembers()` (which reads from `hero.partyFormation`).
        *   Resets companion/hero states (health, mana, effects) before battle.
    *   `handleBattleWin`: Calls `hero.distributeBattleXP()` to share XP among the hero and active companions.
    *   `calculateFleeChance`: Now considers the average dexterity of the player's active party.
    *   `stopAllSkills`: Now correctly targets members in the battle `team1` and `team2` instances.

4.  **`index.html`**:
    *   Added a "Companions" sub-tab to the "Party" (Hero view) screen.
    *   Included HTML structure for the companion roster, active party formation grid, and details panel.
    *   Linked the new `Companion.js` and `companionUIManager.js` scripts.
    *   Updated some `id` attributes for team containers in the battlefield section to be more specific (e.g., `team1-battle-container`).
    *   Added `onclick` handlers for the new sub-tab buttons.
    *   The `#activeSkills` and `#passiveSkills` divs now have the class `skills-grid` for consistent styling.

5.  **`style/heroView.css`**:
    *   Added extensive CSS for the new "Companions" tab, including roster items, the formation grid, slots, and the details panel.
    *   Refined existing Hero view styles for better layout and appearance with the new sub-tab structure.

6.  **`style/styles.css`**:
    *   Minor adjustments to ensure general styles don't conflict and that tooltips work broadly.

**Key Functional Changes:**

*   **Recruitment & Roster:** Hero can recruit companions, who are stored in a master list.
*   **Active Party & Formation:** Players can form an active party of up to 8 members (hero + 7 companions) by dragging and dropping them (and the hero) within a 2x4 grid in the new "Companions" tab.
*   **Companion Progression:** Companions gain XP from battles (shared with the hero) and level up, improving their stats according to their definitions in `companions.json`.
*   **Battle Participation:** Active companions join the hero in battles, using their predefined skills.
*   **Stats Display:** Clicking a companion in the roster or formation shows their detailed stats, skills, and XP progress.
*   **Saving/Loading:** All companion data (roster, levels, XP, active formation) is saved and loaded.

**To Make This Fully Functional, You Would Need To:**

1.  Create placeholder images for companions in `Media/Companions/Portraits/` (e.g., `wolf_placeholder.png`, `wisp_placeholder.png`, `golem_placeholder.png`).
2.  Ensure the skill IDs used in `companions.json` (e.g., "claw\_attack", "fire\_bolt") exist in your `Data/skills.json` or `Data/passives.json`.
3.  Thoroughly test all aspects: recruitment, party management, battle participation, XP gain, saving/loading.

This is a major step towards a more complex party-based RPG!

--- START OF FILE Data/companions.json ---
```json
{
  "shadowClaw": {
    "id": "shadowClaw",
    "name": "Shadow Claw",
    "description": "A loyal wolf beast with sharp claws and a protective howl.",
    "classInfo": {
      "id": "wolf_beast_companion",
      "name": "Wolf Beast",
      "portrait": "Media/Companions/Portraits/wolf_placeholder.png",
      "battleSprite": "Media/Companions/BattleSprites/wolf_placeholder.png",
      "stats": { "strength": 12, "speed": 15, "dexterity": 14, "vitality": 10, "mana": 0, "stamina": 100, "manaRegen": 0, "accuracy": 5, "dodge": 5, "armor": 2, "magicPower": 0, "magicControl": 0 },
      "statsPerLevel": { "strength": 2, "speed": 1, "dexterity": 1, "vitality": 2, "stamina": 10 },
      "experienceToLevel": 100
    },
    "skills": ["basic_attack", "rend"],
    "experienceToLevelMultiplier": 1.1
  },
  "emberWisp": {
    "id": "emberWisp",
    "name": "Ember Wisp",
    "description": "A flickering wisp of fire that can unleash bolts of flame.",
    "classInfo": {
      "id": "fire_wisp_companion",
      "name": "Fire Wisp",
      "portrait": "Media/Companions/Portraits/wisp_placeholder.png",
      "battleSprite": "Media/Companions/BattleSprites/wisp_placeholder.png",
      "stats": { "strength": 3, "speed": 12, "dexterity": 10, "vitality": 7, "mana": 60, "stamina": 40, "manaRegen": 3, "accuracy": 0, "dodge": 2, "armor": 0, "magicPower": 12, "magicControl": 5 },
      "statsPerLevel": { "vitality": 1, "mana": 6, "magicPower": 2, "magicControl": 1 },
      "experienceToLevel": 120
    },
    "skills": ["fire_bolt", "healing_light"],
    "experienceToLevelMultiplier": 1.15
  },
  "stoneGuard": {
    "id": "stoneGuard",
    "name": "Stone Guard",
    "description": "A resilient stone golem that excels in defense.",
    "classInfo": {
      "id": "stone_golem_companion",
      "name": "Stone Golem",
      "portrait": "Media/Companions/Portraits/golem_placeholder.png",
      "battleSprite": "Media/Companions/BattleSprites/golem_placeholder.png",
      "stats": { "strength": 15, "speed": 5, "dexterity": 5, "vitality": 15, "mana": 10, "stamina": 120, "manaRegen": 0, "accuracy": 0, "dodge": 0, "armor": 5, "magicPower": 0, "magicControl": 0 },
      "statsPerLevel": { "strength": 2, "vitality": 3, "stamina": 15, "armor": 1 },
      "experienceToLevel": 150
    },
    "skills": ["slam", "fortify"],
    "experienceToLevelMultiplier": 1.2
  }
}
```
--- END OF FILE Data/companions.json ---

--- START OF FILE Companion.js ---
```javascript
// Companion.js
import Member from './Member.js';
import { deepCopy } from './Render.js'; // Assuming deepCopy is in Render.js
import { allSkillsCache } from './initialize.js';

class Companion extends Member {
    constructor(companionId, companionData, team = null, opposingTeam = null) {
        super(
            companionData.name,
            companionData.classInfo,
            companionData.skills, // Array of skill IDs
            1, // Start at level 1
            team,
            opposingTeam,
            false // isHero = false
        );
        this.companionId = companionId;
        this.description = companionData.description;
        // experienceToLevel is initialized in Member's constructor via levelUp(false)
        // We'll apply the multiplier after the first level up.
        this.experienceToLevelMultiplier = companionData.experienceToLevelMultiplier || 1.1;
        if (this.level === 1) { // After initial setup by Member constructor
             this.experienceToLevel = Math.floor( (this.class.experienceToLevel || 100) * this.experienceToLevelMultiplier);
        }
    }

    levelUp(updateUI = false) { // updateUI is mostly for hero, companions UI update will be through party render
        const oldLevel = this.level;
        super.levelUp(false); // Call parent, don't let it do hero-specific UI updates

        if (this.level > oldLevel) {
            // Apply custom XP scaling after the level up in super has adjusted experienceToLevel once
            this.experienceToLevel = Math.floor(this.experienceToLevel * this.experienceToLevelMultiplier);
            // console.log(`${this.name} leveled up to ${this.level}! Next level at ${this.experienceToLevel} XP.`);
            // UI update will be handled by re-rendering the companion list/details if needed
        }
    }

    gainExperience(exp) {
        if (this.level >= 100) return; // Max level cap example
        this.experience += exp;
        let leveledUp = false;
        while (this.experience >= this.experienceToLevel && this.level < 100) {
            this.levelUp(false);
            leveledUp = true;
        }
        if (leveledUp && typeof window.refreshCompanionUIDetails === 'function') {
             window.refreshCompanionUIDetails(this); // If this companion is currently displayed
        }
        if (typeof window.refreshCompanionRosterItem === 'function') {
            window.refreshCompanionRosterItem(this);
        }
    }

    getSerializableData() {
        const data = super.getSerializableData();
        data.companionId = this.companionId;
        data.experience = this.experience;
        data.experienceToLevel = this.experienceToLevel;
        data.skillProgression = this.skills.map(s => ({
            id: s.id,
            level: s.level,
            experience: s.experience,
            experienceToNextLevel: s.experienceToNextLevel,
            baseDamage: s.baseDamage,
            repeat: s.repeat // Save repeat state if companions can toggle it
        }));
        return data;
    }

    restoreFromData(data, companionDefinition, allSkillsLookup) {
        // companionDefinition is the raw data from companions.json for this companionId
        const classInfoForMember = { [companionDefinition.classInfo.id]: companionDefinition.classInfo };
        super.restoreFromData(data, classInfoForMember, allSkillsLookup);

        this.companionId = data.companionId; // Should match the key from definitions
        this.experience = data.experience || 0;
        this.experienceToLevel = data.experienceToLevel || Math.floor( (this.class.experienceToLevel || 100) * (this.experienceToLevelMultiplier || 1.1));


        if (data.skillProgression && allSkillsLookup) {
            this.skills.forEach(skillInstance => {
                const savedSkillData = data.skillProgression.find(sp => sp.id === skillInstance.id);
                if (savedSkillData) {
                    skillInstance.applySavedState(savedSkillData);
                }
            });
        }
    }
}
export default Companion;
```
--- END OF FILE Companion.js ---

--- START OF FILE companionUIManager.js ---
```javascript
// companionUIManager.js
import { hero } from './initialize.js'; // Access the global hero instance

let draggedMember = null; // Store the actual Companion or Hero instance being dragged
let draggedElement = null; // Store the DOM element being dragged (e.g., the img inside the slot)

export function initializeCompanionUI() {
    if (hero) {
        renderCompanionRoster(hero);
        renderCompanionPartyFormation(hero);
        displayCompanionDetails(null); // Default: display no companion details
    }
    // setupDragAndDropListeners(); // Called by renderCompanionPartyFormation now
}
// Expose globally if other modules need to refresh parts of the UI
window.initializeCompanionUI = initializeCompanionUI;
window.renderCompanionPartyFormation = renderCompanionPartyFormation;
window.renderCompanionRoster = renderCompanionRoster; // For hero methods to call
window.refreshCompanionUIDetails = displayCompanionDetails; // To update details if companion levels up while displayed
window.refreshCompanionRosterItem = refreshCompanionRosterItem;


export function openHeroSubTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("hero-sub-tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
        tabcontent[i].classList.remove("active");
    }
    tablinks = document.getElementsByClassName("hero-sub-tab-button");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    const currentTabElement = document.getElementById(tabName);
    if (currentTabElement) {
        currentTabElement.style.display = "flex"; // Use flex for sub-tab content
        currentTabElement.classList.add("active");
    }
    if (evt && evt.currentTarget) { // Check if evt and evt.currentTarget exist
       evt.currentTarget.className += " active";
    }


    if (tabName === 'heroCompanions') {
        initializeCompanionUI();
    }
}
if (!window.openHeroSubTab) { // Ensure it's globally available for HTML onclick
    window.openHeroSubTab = openHeroSubTab;
}

function refreshCompanionRosterItem(companionInstance) {
    if (!hero) return;
    const rosterList = document.getElementById('companions-roster-list');
    if (!rosterList) return;

    const itemDiv = rosterList.querySelector(`.companion-roster-item[data-companion-id="${companionInstance.companionId}"]`);
    if (itemDiv) {
        const nameSpan = itemDiv.querySelector('span');
        if (nameSpan) nameSpan.textContent = `${companionInstance.name} (Lvl ${companionInstance.level})`;
    }
}


function renderCompanionRoster(currentHero) {
    const rosterList = document.getElementById('companions-roster-list');
    if (!rosterList || !currentHero) return;
    rosterList.innerHTML = '';

    currentHero.allCompanions.forEach(comp => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('companion-roster-item');
        itemDiv.dataset.companionId = comp.companionId;

        const portrait = document.createElement('img');
        portrait.src = comp.class.portrait || 'Media/UI/defaultPortrait.png';
        portrait.alt = comp.name;

        const nameSpan = document.createElement('span');
        nameSpan.textContent = `${comp.name} (Lvl ${comp.level})`;

        itemDiv.appendChild(portrait);
        itemDiv.appendChild(nameSpan);

        const isInParty = currentHero.partyFormation.flat().includes(comp);
        if (isInParty) {
            itemDiv.classList.add('in-party');
        }

        itemDiv.addEventListener('click', () => {
            if (!isInParty) {
                currentHero.addCompanionToFirstAvailableSlot(comp);
                // addCompanionToFirstAvailableSlot now calls render functions if successful
            }
            displayCompanionDetails(comp);
        });
        rosterList.appendChild(itemDiv);
    });
}

function renderCompanionPartyFormation(currentHero) {
    const formationContainer = document.getElementById('companions-party-formation');
    if (!formationContainer || !currentHero) return;

    // Ensure hero is in formation if not already
    if (!currentHero.isHeroInFormation()) {
        currentHero.placeHeroInFirstAvailableSlot(); // This will call render functions
        return; // Let the recursive call handle the rest of the rendering
    }

    currentHero.partyFormation.forEach((rowMembers, rowIndex) => {
        const rowDiv = formationContainer.querySelectorAll('.party-formation-row')[rowIndex];
        if (!rowDiv) { console.error(`Formation row ${rowIndex} not found`); return; }

        rowMembers.forEach((member, colIndex) => {
            const slotDiv = rowDiv.querySelectorAll('.party-formation-slot')[colIndex];
            if (!slotDiv) { console.error(`Formation slot [${rowIndex},${colIndex}] not found`); return; }

            slotDiv.innerHTML = ''; // Clear previous content
            slotDiv.classList.remove('has-hero', 'has-companion');
            delete slotDiv.dataset.memberIdentifier; // Clear old identifier

            // Remove old listeners to prevent accumulation
            slotDiv.ondragover = null;
            slotDiv.ondrop = null;
            slotDiv.onclick = null;


            if (member) {
                slotDiv.dataset.memberIdentifier = member.isHero ? 'hero' : member.companionId;
                const portraitImg = document.createElement('img');
                portraitImg.src = member.class.portrait || 'Media/UI/defaultPortrait.png';
                portraitImg.alt = member.name;
                portraitImg.classList.add('companion-portrait-in-slot');
                portraitImg.draggable = true;

                const nameDiv = document.createElement('div');
                nameDiv.classList.add('companion-name-in-slot');
                nameDiv.textContent = member.name.substring(0, 8);


                slotDiv.appendChild(portraitImg);
                slotDiv.appendChild(nameDiv);
                slotDiv.classList.add(member.isHero ? 'has-hero' : 'has-companion');

                portraitImg.addEventListener('dragstart', (event) => {
                    draggedMember = member; 
                    draggedElement = portraitImg; 
                    event.dataTransfer.setData('text/plain', member.isHero ? 'hero' : member.companionId);
                    event.dataTransfer.effectAllowed = 'move';
                    setTimeout(() => { 
                        if (draggedElement) draggedElement.style.opacity = '0.5';
                    },0);
                });
                portraitImg.addEventListener('dragend', () => {
                     if (draggedElement) draggedElement.style.opacity = '1'; 
                     draggedMember = null;
                     draggedElement = null;
                });

                slotDiv.addEventListener('click', () => { 
                    displayCompanionDetails(member);
                });
            }

            slotDiv.addEventListener('dragover', (event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
            });

            slotDiv.addEventListener('drop', (event) => {
                event.preventDefault();
                if (!draggedMember) return;
                if (draggedElement) draggedElement.style.opacity = '1'; 

                const targetRow = parseInt(slotDiv.dataset.row);
                const targetCol = parseInt(slotDiv.dataset.col);

                currentHero.setMemberPositionInFormation(draggedMember, targetRow, targetCol);
                // setMemberPositionInFormation now calls renderCompanionPartyFormation

                draggedMember = null;
                draggedElement = null;
            });
        });
    });
}


function displayCompanionDetails(member) {
    const detailsPanel = document.getElementById('companion-selected-details');
    if (!detailsPanel) return;

    if (!member) {
        detailsPanel.innerHTML = '<p>Select a companion or an empty slot to manage party.</p>';
        return;
    }

    let skillsHTML = '<ul>';
    member.skills.forEach(skill => {
        skillsHTML += `<li>${skill.name} (Lvl ${skill.level || 1})</li>`; // Simplified skill display
    });
    skillsHTML += '</ul>';

    detailsPanel.innerHTML = `
        <img src="${member.class.portrait || 'Media/UI/defaultPortrait.png'}" alt="${member.name}" class="detail-portrait">
        <h4>${member.name} - ${member.class.name || member.classType} (Lvl ${member.level})</h4>
        <p><em>${member.description || 'No description.'}</em></p>
        <hr>
        <p>HP: ${Math.round(member.currentHealth)} / ${member.maxHealth}</p>
        <p>Mana: ${member.currentMana} / ${member.stats.mana}</p>
        <p>Stamina: ${member.currentStamina} / ${member.stats.stamina}</p>
        <p>XP: ${member.experience} / ${member.experienceToLevel}
            <div class="companion-stat-xp-bar">
                <div class="progress" style="width:${(member.experience / member.experienceToLevel) * 100}%"></div>
            </div>
        </p>
        <h5>Base Stats:</h5>
        <ul class="comp-stats-list">
            <li>Strength: ${member.stats.strength}</li>
            <li>Speed: ${member.stats.speed}</li>
            <li>Dexterity: ${member.stats.dexterity}</li>
            <li>Vitality: ${member.stats.vitality}</li>
            ${member.stats.magicPower ? `<li>Magic Power: ${member.stats.magicPower}</li>` : ''}
            <li>Armor: ${member.stats.armor || 0}</li>
            <li>Dodge: ${member.stats.dodge || 0}</li>
        </ul>
        <h5>Skills:</h5>
        ${skillsHTML}
        <button id="remove-from-party-btn" style="margin-top:10px;" ${member.isHero ? 'disabled' : ''}>
            ${member.isHero ? 'Hero (Cannot Remove)' : 'Remove from Party'}
        </button>
    `;

    const removeBtn = detailsPanel.querySelector('#remove-from-party-btn');
    if (removeBtn && !member.isHero) {
        removeBtn.addEventListener('click', () => {
            hero.removeMemberFromFormation(member);
            // removeMemberFromFormation now calls render functions
            displayCompanionDetails(null); // Clear details panel
        });
    }
}
```
--- END OF FILE companionUIManager.js ---

--- START OF FILE style/heroView.css ---
```css
/* Hero View Specific Styles */

#heroContent {
    background-color: #3a3a3a; /* Dark theme for hero screen */
    padding: 20px;
    border: 2px solid #555;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0,0,0,0.5);
    height: 78vh; /* Consistent height */
    overflow-y: auto; /* Scroll if content overflows */
    color: #fff; /* Light text for dark background */
    display: flex; /* Enable flex for main hero content structure */
    flex-direction: column; /* Stack elements vertically */
}

#heroInfoRow {
    display: flex;
    background-color: #4a4a4a;
    padding: 10px; /* Reduced padding */
    border: 1px solid #666; /* Slightly thinner border */
    border-radius: 8px; /* Slightly smaller radius */
    box-shadow: 0 0 8px rgba(0,0,0,0.4);
    margin-bottom: 10px; /* Space before sub-tabs or content */
}

#heroPortraitAndPaperDoll {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding:5px;
}

#heroPortrait {
    flex: 0 0 150px; /* Keep size */
    /* margin-right: 20px; Let gap handle spacing */
}

#heroPortrait img {
    width: 150px;
    height: 150px;
    border: 2px solid #777;
    border-radius: 10px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
}

#paperDoll {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(4, 1fr);
    gap: 5px; /* Reduced gap */
    padding: 5px; /* Reduced padding */
    background-color: #444;
    border: 1px solid #777; /* Thinner border */
    border-radius: 8px;
    box-shadow: 0 0 5px rgba(0,0,0,0.5);
}

.slot { /* Paperdoll slots */
    display: flex;
    justify-content: center;
    align-items: center;
    width: 50px; /* Reduced size */
    height: 50px; /* Reduced size */
    background-color: #555;
    border: 1px solid #777; /* Thinner border */
    border-radius: 4px; /* Smaller radius */
    box-shadow: 0 0 3px rgba(0,0,0,0.4);
    text-align: center;
    color: #fff;
    font-size: 10px; /* Smaller font */
}

.slot:hover {
    background-color: #666;
}

.slot img { 
    width: 90%; /* Make image slightly smaller than slot */
    height: 90%;
    object-fit: contain;
    pointer-events: none;
}


/* Specific Paperdoll Slot Positions */
#helmetSlot { grid-area: 1 / 2 / 2 / 3; }
#cloakSlot { grid-area: 1 / 3 / 2 / 4; }
#amuletSlot { grid-area: 1 / 1 / 2 / 2; }
#weaponSlot { grid-area: 2 / 1 / 3 / 2; }
#chestArmorSlot { grid-area: 2 / 2 / 3 / 3; }
#shieldSlot { grid-area: 2 / 3 / 3 / 4; }
#legArmorSlot { grid-area: 3 / 2 / 4 / 3; }
#glovesSlot { grid-area: 4 / 1 / 4 / 2; }
#bootsSlot { grid-area: 4 / 2 / 5 / 3; }
#ringSlot { grid-area: 4 / 3 / 5 / 4; }


#heroDetails {
    display: flex;
    flex-direction: column;
    gap: 10px; /* Reduced gap */
    width: 100%;
    flex-grow: 1; /* Allow heroDetails to take remaining space */
    overflow: hidden; /* Prevent its own scrollbars if sub-tabs handle scrolling */
}

/* Sub-tabs within Hero View */
#hero-sub-tabs {
    margin-bottom: 10px;
    border-bottom: 1px solid #777;
    padding-bottom: 5px;
    flex-shrink: 0; /* Prevent tabs from shrinking */
}
.hero-sub-tab-button {
    background-color: #505050; /* Darker inactive tab */
    color: #ccc;
    padding: 8px 12px; /* Smaller padding */
    border: 1px solid #666;
    border-bottom: none; /* Remove bottom border for inactive */
    cursor: pointer;
    margin-right: 3px;
    border-radius: 4px 4px 0 0;
    font-size: 0.9em;
}
.hero-sub-tab-button.active {
    background-color: #3e3e3e; /* Slightly darker for active tab content area */
    color: #fff;
    border-color: #777;
    border-bottom: 1px solid #3e3e3e; /* Match active content background */
}
.hero-sub-tab-content {
    display: none;
    padding: 10px;
    border: 1px solid #666;
    border-top: none;
    background-color: #3e3e3e; /* Match active tab "merged" look */
    border-radius: 0 0 8px 8px;
    flex-grow: 1; /* Allow content to fill space */
    overflow-y: auto; /* Scroll if content itself is too long */
}
.hero-sub-tab-content.active {
    display: flex; /* Use flex for sub-tab content layout */
    flex-direction: column; /* Default stack for main content areas */
}


#heroMainStatsSkills { /* This is a .hero-sub-tab-content */
    /* display: flex; /* Let parent .active handle display */
    flex-direction: column; /* Stack Classes/Stats and Skills sections */
    gap: 10px;
}


#heroClassesAndStats {
    display: flex;
    flex-direction: row; /* Inventory, Classes, Stats side-by-side */
    gap: 10px; /* Reduced gap */
    background-color: #4a4a4a; /* Slightly lighter than sub-tab content bg */
    padding: 10px;
    border: 1px solid #666;
    border-radius: 6px;
}

#heroClassesAndStats h2 {
    margin-top: 0;
    border-bottom: 1px solid #666;
    padding-bottom: 5px;
    font-family: 'Cinzel', serif;
    font-size: 1.1em;
}

#inventory {
    flex: 1.5; /* Give inventory more space */
    min-width: 200px; /* Ensure it has some base width */
}
#heroClasses {
    flex: 0.8;
    min-width: 120px;
}
#heroStats {
    flex: 1.2; /* Stats section */
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); /* Responsive columns */
    gap: 5px 10px; /* row-gap column-gap */
    align-content: start; /* Prevent stretching if few items */
}


#heroStats h2 {
    grid-column: 1 / -1; /* Span all columns */
    margin: 0 0 5px 0;
    padding-bottom: 5px;
    font-family: 'Cinzel', serif;
    text-align: center;
}
#heroStats p {
    margin: 2px 0;
    font-size: 0.9em;
}

.statGrid { 
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
}


#inventory h2 {
    text-align: center;
    margin-bottom: 10px;
}

.iconGrid { 
    display: grid;
    gap: 5px; /* Reduced gap */
}

#inventory .iconGrid {
    grid-template-columns: repeat(auto-fill, 50px); /* Fit as many 50px slots as possible */
    justify-content: start; /* Align to start if not filling row */
}


.inventorySlot { 
    width: 45px; /* Slightly smaller */
    height: 45px;
    background-color: #585858; /* Slightly lighter */
    border: 1px solid #777; /* Thinner */
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 3px rgba(0,0,0,0.3);
    position: relative;
}
.inventorySlot img{
    width: 90%; height: 90%; object-fit: contain;
}

.inventorySlot:hover {
    background-color: #6a6a6a;
}


#heroSkills {
    display: flex;
    flex-direction: column;
    gap: 10px;
    background-color: #4a4a4a;
    padding: 10px;
    border: 1px solid #666;
    border-radius: 6px;
    flex-grow: 1; /* Allow skills section to take space */
}

#heroSkills h2 {
    margin-top: 0;
    border-bottom: 1px solid #666;
    padding-bottom: 5px;
    font-family: 'Cinzel', serif;
    font-size: 1.1em;
    text-align: center;
}


.skills-grid { /* Class to apply to #activeSkills, #passiveSkills */
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); /* Responsive */
    gap: 8px;
    margin-top: 5px;
}


.skill-box { 
    padding: 5px;
    text-align: center;
    cursor: pointer;
    position: relative;
    background-color: #383838; /* Darker box */
    border: 1px solid #555;
    border-radius: 4px;
    box-shadow: 0 0 3px rgba(0,0,0,0.4);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px; /* Smaller gap */
    min-height: 80px; /* Ensure consistent height */
}
.skill-box:hover {
    border-color: #777;
    background-color: #404040;
}

.skill-box img {
    width: 28px; /* Smaller icon */
    height: 28px;
}

.skill-box .skill-name { 
    font-size: 0.8em; /* Smaller name */
    margin: 2px 0;
    color: #ddd;
}
.skill-box .targeting-modes {
    font-size: 0.75em;
    padding: 1px 3px;
    background-color: #505050;
    color: #ccc;
    border: 1px solid #666;
    border-radius: 3px;
    margin-top: 2px;
    width: 90%; /* Take most of box width */
}


.skill-box.selected {
    border-color: #00b300; /* Brighter green */
    box-shadow: 0 0 5px #00b300;
}


.progressBar { 
    width: 90%; /* Slightly narrower */
    background-color: #555; /* Darker bar track */
    border-radius: 3px;
    overflow: hidden;
    margin-top: auto; /* Push to bottom if skill-box has extra space */
    height: 8px; /* Smaller height */
}

.progress {
    height: 100%; 
    background-color: #009900; /* Darker green progress */
}

#heroWeaponSkills {
    margin-top: 15px;
    padding: 10px;
    background-color: #4a4a4a;
    border: 1px solid #666;
    border-radius: 6px;
}

#heroWeaponSkills h2 {
    margin-top: 0;
    border-bottom: 1px solid #666;
    padding-bottom: 5px;
    font-family: 'Cinzel', serif;
    font-size: 1.1em;
    text-align: center;
}
/* Weapon skills displayed in a grid, similar to active/passive skills */
#heroWeaponSkills .skills-grid { /* Re-use .skills-grid styling */
    margin-top: 5px;
}
#heroWeaponSkills .skill-box { /* Make weapon skill boxes non-interactive if needed */
    cursor: default;
}
#heroWeaponSkills .skill-box:hover { /* No special hover if non-interactive */
    border-color: #555;
    background-color: #383838;
}


#heroConsumableToolbarContainer {
    margin-top: 15px;
    background-color: #404040; /* Slightly darker */
    padding: 10px;
    border: 1px solid #5c5c5c;
    border-radius: 8px;
    box-shadow: 0 0 6px rgba(0,0,0,0.5);
}

#heroConsumableToolbarContainer h2 {
    text-align: center;
    margin-top: 0;
    margin-bottom: 10px;
    border-bottom: 1px solid #666;
    padding-bottom: 8px;
    font-family: 'Cinzel', serif;
    color: #ddd;
    font-size: 1.1em;
}

#heroConsumableToolbar { /* This is an .iconGrid */
    grid-template-columns: repeat(3, minmax(45px, 1fr)); /* 3 columns for 3 slots */
    justify-content: center;
    max-width: 200px; /* Adjust if slot size changes */
    margin: 0 auto;
}

.consumable-toolbar-slot { /* These also have .inventorySlot class */
    background-color: #333333; /* Darker slots */
    border: 1px solid #505050;
    width: 45px; /* Match inventory slot size */
    height: 45px;
}

.consumable-toolbar-slot:hover {
    background-color: #424242;
    border-color: #686868;
}

.consumable-toolbar-slot img {
    pointer-events: none;
}


/* Companion Tab Styles */
#heroCompanions { /* This is a .hero-sub-tab-content */
    /* display: flex; handled by parent .active */
    flex-direction: column; /* Stack title and layout */
    gap: 10px;
}
#heroCompanions > h2 { /* The "Companions" title */
    text-align: center;
    font-family: 'Cinzel', serif;
    margin: 0 0 10px 0;
    padding-bottom: 5px;
    border-bottom: 1px solid #666;
    flex-shrink: 0; /* Prevent title from shrinking */
}

.companions-layout {
    display: flex;
    gap: 15px;
    flex-grow: 1; /* Allow layout to fill remaining space in tab */
    overflow: hidden; /* Prevent layout from causing scrollbars on tab */
}
.companions-roster-panel, .companions-active-party-panel, .companions-detail-panel {
    flex: 1;
    background-color: #4a4a4a; /* Consistent with other panels */
    padding: 10px;
    border-radius: 6px;
    border: 1px solid #666;
    display: flex;
    flex-direction: column; /* Stack title and content list/grid */
    overflow: hidden; /* Important for scrollable children */
}
.companions-roster-panel h3, .companions-active-party-panel h3, .companions-detail-panel h3 {
    margin: 0 0 8px 0;
    padding-bottom: 5px;
    border-bottom: 1px solid #5c5c5c;
    text-align: center;
    font-family: 'Cinzel', serif;
    font-size: 1em;
    flex-shrink: 0; /* Prevent titles from shrinking */
}

.companions-detail-panel {
    flex: 1.2; /* Slightly more space for details */
}
#companions-roster-list, #companion-selected-details {
    overflow-y: auto; /* Allow these specific lists/areas to scroll */
    flex-grow: 1; /* Allow list to take available space in panel */
    padding-right: 5px; /* Space for scrollbar */
}

.companion-roster-item {
    display: flex;
    align-items: center;
    padding: 6px;
    margin-bottom: 4px;
    background-color: #585858;
    border-radius: 3px;
    cursor: pointer;
    border: 1px solid transparent;
    transition: background-color 0.2s, border-color 0.2s;
}
.companion-roster-item:hover {
    background-color: #6a6a6a;
    border-color: #888;
}
.companion-roster-item img {
    width: 35px;
    height: 35px;
    margin-right: 8px;
    border-radius: 50%;
    border: 1px solid #444;
}
.companion-roster-item span {
    font-size: 0.85em;
}
.companion-roster-item.in-party {
    opacity: 0.6;
    background-color: #4f4f4f;
    cursor: default;
}
.companion-roster-item.in-party:hover {
    border-color: transparent; /* No special hover border if in party */
}


#companions-party-formation {
    display: flex;
    flex-direction: column;
    gap: 4px; /* Small gap between rows */
    align-items: center; /* Center rows if container is wider */
    margin-top: 10px; /* Space from title */
}
.party-formation-row {
    display: flex;
    gap: 4px; /* Small gap between slots */
    justify-content: center; /* Center slots in the row */
}
.party-formation-slot {
    width: 60px; /* Smaller slots */
    height: 60px;
    background-color: #383838; /* Darker empty slot */
    border: 1px dashed #666;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    transition: border-color 0.2s;
}
.party-formation-slot:hover {
    border-color: #999;
}
.party-formation-slot img.companion-portrait-in-slot {
    width: 100%;
    height: 100%;
    object-fit: cover;
    cursor: grab;
    transition: opacity 0.2s;
}
.party-formation-slot img.companion-portrait-in-slot:active {
    cursor: grabbing;
}
.party-formation-slot .companion-name-in-slot {
    position: absolute;
    bottom: 1px;
    left: 0;
    right: 0; /* Make it span width */
    text-align: center;
    font-size: 0.65em;
    background-color: rgba(0,0,0,0.6);
    padding: 1px 2px;
    color: white;
    pointer-events: none; /* Allow clicks to pass to slot */
}

.party-formation-slot.has-hero img.companion-portrait-in-slot {
    border: 2px solid gold; /* Highlight hero */
    box-sizing: border-box;
}
.party-formation-slot.has-companion img.companion-portrait-in-slot {
    border: 1px solid #777;
    box-sizing: border-box;
}


#companion-selected-details {
    font-size: 0.85em;
    line-height: 1.5;
}
#companion-selected-details img.detail-portrait {
    width: 80px; /* Smaller detail portrait */
    height: 80px;
    float: left;
    margin-right: 10px;
    margin-bottom: 5px;
    border-radius: 4px;
    border: 1px solid #555;
}
#companion-selected-details h4 { margin-top: 0; font-size: 1.1em; color: #efefef; }
#companion-selected-details p { margin: 3px 0; }
#companion-selected-details hr { border-color: #555; margin: 6px 0; }
#companion-selected-details h5 { font-size: 1em; margin: 8px 0 4px 0; color: #dfdfdf; }
#companion-selected-details ul.comp-stats-list, #companion-selected-details ul {
    list-style-type: none;
    padding-left: 5px;
    margin: 0;
}
#companion-selected-details ul li {
    margin-bottom: 2px;
    font-size: 0.9em;
}
.companion-stat-xp-bar {
    width: 100%;
    height: 6px; /* Slimmer XP bar */
    background-color: #666;
    border-radius: 3px;
    margin-top: 1px;
    overflow: hidden;
}
.companion-stat-xp-bar .progress {
    height: 100%;
    background-color: #00b39e; /* Teal XP bar */
}
#remove-from-party-btn {
    background-color: #702929;
    color: #f0d0d0;
    border: 1px solid #963b3b;
    padding: 5px 10px;
    font-size: 0.8em;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 10px;
    display: block; /* Make it block for easier centering or full width */
    width: fit-content; /* Or width: 100% */
}
#remove-from-party-btn:hover {
    background-color: #8a3333;
}
#remove-from-party-btn:disabled {
    background-color: #555;
    color: #888;
    cursor: not-allowed;
    border-color: #666;
}
```
--- END OF FILE style/heroView.css ---

--- START OF FILE index.html ---
```html
<!DOCTYPE html>
<html>
<head>
    <meta content="width=device-width, initial-scale=1.0" name="viewport">
    <title>RPG Battle</title>
    <link href="style/styles.css" rel="stylesheet" type="text/css">
    <link href="style/heroView.css" rel="stylesheet" type="text/css"> 
    <link href="style/animation.css" rel="stylesheet" type="text/css">
    <link href="style/battleLog.css" rel="stylesheet" type="text/css">
    <link href="style/member.css" rel="stylesheet" type="text/css">
    <link href="style/fireworks.css" rel="stylesheet" type="text/css">
    <link href="style/bottomBar.css" rel="stylesheet" type="text/css">
    <link href="style/evolutionModal.css" rel="stylesheet" type="text/css">
    <link href="style/stats.css" rel="stylesheet" type="text/css">
    <link href="style/map.css" rel="stylesheet" type="text/css">
    <link href="style/greenBorderAnimation.css" rel="stylesheet" type="text/css">
    <link href="style/glow.css" rel="stylesheet" type="text/css">
    <link href="style/home.css" rel="stylesheet" type="text/css">
    <link href="style/slideshow.css" rel="stylesheet" type="text/css">
    <link href="style/dialogue.css" rel="stylesheet" type="text/css">
    <link href="style/library.css" rel="stylesheet" type="text/css">
    <link rel="stylesheet" href="style/questLog.css">
    <link rel="stylesheet" href="style/saveLoadModal.css">
    <link href="style/announcements.css" rel="stylesheet" type="text/css">
</head>
<body>
<div class="home-screen active" id="home-screen">
    <div class="home-menu">
        <h1>RPG Battle</h1>
        <div class="home-buttons">
            <button id="new-game"><img src="Media/UI/new_game.png" alt="New Game"></button>
            <button id="load-game"><img src="Media/UI/load_game.png" alt="Load Game"></button>
            <button id="options"><img src="Media/UI/options.png" alt="Options"></button>
            <button id="exit"><img src="Media/UI/exit.png" alt="Exit"></button>
        </div>
    </div>

    <div id="announcements-box">
        <h2>Announcements</h2>
        <div id="announcements-content" class="themed-scrollbar">
            <div class="announcement-item">
                <p class="announcement-date">2025-05-11</p>
                <p class="announcement-text">Welcome to RPG Battle! The adventure begins now. Explore the world and conquer your foes!</p>
            </div>
            <div class="announcement-item">
                Current version: 0.0.2 - Companions Update!
            </div>
        </div>
    </div>
</div>

<div class="slideshow hidden" id="slideshow">
    <audio id="slideshow-audio" src="Media/intro_placeholder.mp3" preload="auto"></audio>
    <div class="slide" data-duration="8500">
        <img src="Media/slideshow/slide1.jpeg" alt="Slide 1">
        <p>A millennium past, humanity’s dominion swept across the continent, their Golden Empire linked together by arcane portals.</p>
    </div>
    <div class="slide" data-duration="14000">
        <img src="Media/slideshow/slide2.jpeg" alt="Slide 2">
        <p>Even then, no matter how strong the Empire, the wilds remained untamed. Beyond the empire’s gleaming spires, shadows and unspeakable horrors prowled, making it dangerous to stray too far from civilization</p>
    </div>
    <div class="slide" data-duration="11000">
        <img src="Media/slideshow/slide3.jpeg" alt="Slide 3">
        <p>Grand Expeditions, thousands of bold men led by the best of us, carved new bastions from uncharted frontiers, spreading the empire’s banner.</p>
    </div>
    <div class="slide" data-duration="14000">
        <img src="Media/slideshow/slide4.jpeg" alt="Slide 4">
        <p>But fate turned cruel. Without omen or mercy, the portals flickered and died, unleashing a deathly fog that broke every bond between the empire’s cities. To this day, the cause of their failure remains a mystery.</p>
    </div>
    <div class="slide" data-duration="11000">
        <img src="Media/slideshow/slide5.jpeg" alt="Slide 5">
        <p>The wilderness twisted into something even more dangerous. Travelers vanished into the mists. Cities stood alone, some of them falling to famine and strife.</p>
    </div>
    <div class="slide" data-duration="12000">
        <img src="Media/slideshow/slide6.jpeg" alt="Slide 6">
        <p>Now, a milenium later, in Hollowreach the smallest of the Old Empires cities, a hero rises. Driven by destiny, they seek to brave the accursed fog.</p>
    </div>
</div>

<div class="save-load-modal hidden" id="save-load-modal">
    <div class="save-load-content">
        <h2 id="save-load-title">Save/Load Game</h2>
        <div id="save-load-slots-container">
            <!-- Slots will be populated by JS -->
        </div>
        <div class="save-load-actions">
            <button id="save-load-delete-button" class="hidden">Delete</button>
            <button id="save-load-close-button">Close</button>
        </div>
    </div>
</div>

<div class="dialogue-modal hidden" id="dialogue-modal">
    <div class="dialogue-content">
        <div class="npc-portrait">
            <img id="npc-portrait-img" src="Media/npc/sampleNPC.jpg" alt="NPC Portrait">
        </div>
        <div class="dialogue-text">
            <p id="npc-name">NPC Name</p>
            <p id="dialogue-text">Dialogue text goes here.</p>
        </div>
        <div class="dialogue-options">
            <button class="option-button" id="option-1" style="display: none;">Option 1</button>
            <button class="option-button" id="option-2" style="display: none;">Option 2</button>
            <button class="option-button" id="option-3" style="display: none;">Option 3</button>
            <button class="option-button" id="option-4" style="display: none;">Option 4</button>
            <button class="option-button" id="option-5" style="display: none;">Option 5</button>
            <button class="option-button" id="option-6" style="display: none;">Option 6</button>
            <button class="option-button" id="option-7" style="display: none;">Option 7</button>
            <button class="option-button" id="option-8" style="display: none;">Option 8</button>
        </div>
        <div class="dialogue-actions">
            <button class="action-button" id="trade-button" style="display: none;">Trade</button>
        </div>
    </div>
</div>

<div class="popup hidden" id="popup">
    <div class="popup-content">
        <h2 id="popupTitle">Victory!</h2>
        <p id="popupText">Your team has won the battle.</p>
        <p>Note: You can auto repeat by clicking the checkbox at the top of the battle screen.</p>
        <button id="repeat-popup">Repeat stage</button>
        <button id="nextStage-popup">NextStage</button>
        <button id="return-to-map-popup">Return to Map</button>
    </div>
</div>

<div class="modal" id="evolution-modal">
    <div class="modal-content">
        <h2>Choose Your Evolution</h2>
        <div class="evolution-options" id="evolution-options">
            <!-- Evolution options will be populated here dynamically -->
        </div>
    </div>
</div>
<div class="tabcontent" id="quests">
    <button class="back-to-map-button">Back to Map</button>
    <div id="quest-list" class="themed-scrollbar">
        <!-- Quest items will be populated here -->
    </div>
</div>
<div class="tabcontent" id="battlefield" class="battle-view">
    <div id="teamAndBattleContainer-overlay" class="battle-view">
        <div id="teamAndBattleContainer">
            <div id="stage-controls">
                <button id="decrease-stage"><</button>
                <span id="current-stage">Stage 1</span>
                <button id="increase-stage">></button>
                <input id="repeat" type="checkbox">Repeat</input>
                <button id="flee-battle">Flee</button>
            </div>
            <div id="teamContainer">
                <div class="team" id="team1-battle-container"> 
                    <div class="team-row"></div>
                    <div class="team-row"></div>
                </div>
                <div class="team-divider"></div>
                <div class="team" id="team2-battle-container"> 
                    <div class="team-row"></div>
                    <div class="team-row"></div>
                </div>
            </div>
            <div id="battle-log-container">
                <button id="toggle-log">Hide Log</button>
                <div id="battle-log">
                    <div id="anchor"></div>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="tabcontent" id="heroContent">
    <button class="back-to-map-button">Back to Map</button>
    <div id="heroInfoRow">
        <div id="heroPortraitAndPaperDoll">
            <div id="heroPortrait">
                <img alt="Hero Portrait" src="Media/portrait.jpg"/>
            </div>
            <div id="paperDoll">
                <div class="slot" id="cloakSlot">Cloak</div>
                <div class="slot" id="helmetSlot">Helmet</div>
                <div class="slot" id="amuletSlot">Amulet</div>
                <div class="slot" id="weaponSlot">Weapon</div>
                <div class="slot" id="chestArmorSlot">Chest Armor</div>
                <div class="slot" id="shieldSlot">Shield</div>
                <div class="slot" id="legArmorSlot">Leg Armor</div>
                <div class="slot" id="glovesSlot">Gloves</div>
                <div class="slot" id="bootsSlot">Boots</div>
                <div class="slot" id="ringSlot">Ring</div>
            </div>
        </div>
        <div id="heroDetails">
            <div id="hero-sub-tabs">
                <button class="hero-sub-tab-button active" onclick="openHeroSubTab(event, 'heroMainStatsSkills')">Stats & Skills</button>
                <button class="hero-sub-tab-button" onclick="openHeroSubTab(event, 'heroCompanions')">Companions</button>
            </div>

            <div id="heroMainStatsSkills" class="hero-sub-tab-content active">
                <div id="heroClassesAndStats">
                    <div id="inventory">
                        <h2>Inventory</h2>
                        <div class="iconGrid">
                            <div class="inventorySlot" data-slot-id="inventory_0"></div>
                            <div class="inventorySlot" data-slot-id="inventory_1"></div>
                            <div class="inventorySlot" data-slot-id="inventory_2"></div>
                            <div class="inventorySlot" data-slot-id="inventory_3"></div>
                            <div class="inventorySlot" data-slot-id="inventory_4"></div>
                            <div class="inventorySlot" data-slot-id="inventory_5"></div>
                            <div class="inventorySlot" data-slot-id="inventory_6"></div>
                            <div class="inventorySlot" data-slot-id="inventory_7"></div>
                            <div class="inventorySlot" data-slot-id="inventory_8"></div>
                            <div class="inventorySlot" data-slot-id="inventory_9"></div>
                            <div class="inventorySlot" data-slot-id="inventory_10"></div>
                            <div class="inventorySlot" data-slot-id="inventory_11"></div>
                            <div class="inventorySlot" data-slot-id="inventory_12"></div>
                            <div class="inventorySlot" data-slot-id="inventory_13"></div>
                            <div class="inventorySlot" data-slot-id="inventory_14"></div>
                            <div class="inventorySlot" data-slot-id="inventory_15"></div>
                            <div class="inventorySlot" data-slot-id="inventory_16"></div>
                            <div class="inventorySlot" data-slot-id="inventory_17"></div>
                            <div class="inventorySlot" data-slot-id="inventory_18"></div>
                            <div class="inventorySlot" data-slot-id="inventory_19"></div>
                        </div>
                    </div>
                    <div id="heroClasses">
                        <h2>Classes</h2>
                        <p id="heroClass1">Novice</p>
                        <p id="heroClass2">-</p>
                        <p id="heroClass3">-</p>
                    </div>
                    <div id="heroStats">
                        <h2>Statistics</h2>
                        <p>Strength: <span id="heroStrength">0</span></p>
                        <p>Speed: <span id="heroSpeed">0</span></p>
                        <p>Dexterity: <span id="heroDexterity">0</span></p>
                        <p>Vitality: <span id="heroVitality">0</span></p>
                        <p>Magic Power: <span id="heroMagicPower">0</span></p>
                        <p>Mana: <span id="heroMana">0/0</span></p>
                        <p>Mana Regen: <span id="heroManaRegen">0</span></p>
                        <p>Magic Control: <span id="heroMagicControl">0</span></p>
                        <p>Gold: <span id="heroGold">0</span></p>
                        <p>Armor: <span id="heroArmor">0</span></p>
                        <p>Dodge: <span id="heroDodge">0</span></p>
                        <p>Accuracy: <span id="heroAccuracy">0</span></p>
                    </div>
                </div>
                <div id="heroSkills">
                    <div id="heroConsumableToolbarContainer">
                        <h2>Consumable Toolbar</h2>
                        <div id="heroConsumableToolbar" class="iconGrid">
                            <div class="consumable-toolbar-slot inventorySlot" data-slot-index="0"></div>
                            <div class="consumable-toolbar-slot inventorySlot" data-slot-index="1"></div>
                            <div class="consumable-toolbar-slot inventorySlot" data-slot-index="2"></div>
                        </div>
                    </div>
                    <h2>Active Skills</h2>
                    <div id="activeSkills" class="skills-grid">
                        <!-- Skill boxes populated by JS -->
                    </div>
                    <h2>Passive Skills</h2>
                    <div id="passiveSkills" class="skills-grid">
                        <!-- Skill boxes populated by JS -->
                    </div>
                    <div id="heroWeaponSkills">
                        <h2>Weapon Skills</h2>
                        <div class="skills-grid">
                            <!-- Content populated by Render.js -->
                        </div>
                    </div>
                </div>
            </div>

            <div id="heroCompanions" class="hero-sub-tab-content">
                <h2>Companions</h2>
                <div class="companions-layout">
                    <div class="companions-roster-panel">
                        <h3>Roster</h3>
                        <div id="companions-roster-list" class="themed-scrollbar">
                        </div>
                    </div>
                    <div class="companions-active-party-panel">
                        <h3>Active Party (Max 8)</h3>
                        <div id="companions-party-formation">
                            <div class="party-formation-row">
                                <div class="party-formation-slot" data-row="0" data-col="0"></div>
                                <div class="party-formation-slot" data-row="0" data-col="1"></div>
                                <div class="party-formation-slot" data-row="0" data-col="2"></div>
                                <div class="party-formation-slot" data-row="0" data-col="3"></div>
                            </div>
                            <div class="party-formation-row">
                                <div class="party-formation-slot" data-row="1" data-col="0"></div>
                                <div class="party-formation-slot" data-row="1" data-col="1"></div>
                                <div class="party-formation-slot" data-row="1" data-col="2"></div>
                                <div class="party-formation-slot" data-row="1" data-col="3"></div>
                            </div>
                        </div>
                    </div>
                    <div class="companions-detail-panel">
                        <h3>Companion Details</h3>
                        <div id="companion-selected-details">
                            <p>Select a companion to see their details.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="tabcontent" id="map">
    <div style="display: flex; width: 100%; height: 100%; gap: 10px;">
        <div style="flex: 0 0 220px; display: flex; flex-direction: column; gap: 10px; background-color: rgba(26, 20, 16, 0.5); padding: 10px; border-radius: 8px; border: 1px solid #4a3c2b;">
            <div id="hero-portrait-container">
            </div>
            <div id="gridContainer" class="themed-scrollbar">
                <div class="gridItem"><button class="tablinks" id="heroContentNavButton" onclick="openTab(event, 'heroContent')">Party</button></div>
                <div class="gridItem"><button class="tablinks" id="mapNavButton" onclick="openTab(event, 'map')">Map</button></div>
                <div class="gridItem"><button class="tablinks" id="libraryNavButton" onclick="openTab(event, 'library')">Library</button></div>
                <div class="gridItem"><button class="tablinks" id="questsNavButton" onclick="openTab(event, 'quests')">Quests</button></div>
                <div class="gridItem"><button class="tablinks" id="battle-statisticsNavButton" onclick="openTab(event