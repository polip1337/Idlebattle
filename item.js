import { allSkillsCache } from './initialize.js';
import Skill from './Skill.js';
import { deepCopy } from './Render.js';

class Item {
    constructor(itemData) {
        this.id = itemData.id;
        this.name = itemData.name;
        this.type = itemData.type; // e.g., "weapon", "helmet", "chest", "gloves", "boots", "ring", "amulet", "consumable"
        this.slot = itemData.slot; // e.g., "weaponSlot", "helmetSlot", "inventory"
        this.icon = itemData.icon;
        this.description = itemData.description;
        this.rarity = itemData.rarity || "common";
        this.value = itemData.value || 0; // Gold value

        this.stats = itemData.stats ? deepCopy(itemData.stats) : {}; // { strength: 5, vitality: 10 }
        this.effects = itemData.effects ? deepCopy(itemData.effects) : []; // Array of effect definitions

        // For weapons, store skill instances
        this.weaponSkills = [];
        if (this.type === "weapon" && itemData.weaponSkillIds) {
            itemData.weaponSkillIds.forEach(skillId => {
                const skillData = allSkillsCache[skillId];
                if (skillData) {
                    this.weaponSkills.push(new Skill(skillData, skillData.effects));
                } else {
                    console.warn(`Weapon skill ID '${skillId}' not found for item '${this.name}'.`);
                }
            });
        }
    }

    // Placeholder for using a consumable item
    use(target) {
        if (this.type === "consumable") {
            console.log(`Using ${this.name} on ${target.name}`);
            // Apply effects, heal, etc.
            // Remove from inventory
            return true;
        }
        return false;
    }
}

export default Item;