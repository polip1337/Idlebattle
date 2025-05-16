import { allSkillsCache } from './initialize.js'; // Used for weapon skills
import Skill from './Skill.js';
import { deepCopy } from './Render.js';
import EffectClass from './EffectClass.js'; // Ensure EffectClass is imported

class Item {
    constructor(itemData) {
        this.id = itemData.id;
        this.name = itemData.name;
        this.type = itemData.type;
        this.slot = itemData.slot;
        this.icon = itemData.icon;
        this.description = itemData.description;
        this.rarity = itemData.rarity || "common";
        this.value = itemData.value || 0;

        this.stats = itemData.stats ? deepCopy(itemData.stats) : {};
        // Effects should be an array of effect definition objects
        this.effects = itemData.effects ? deepCopy(itemData.effects) : [];
        if(itemData.weaponSkills){
            this.weaponSkills = itemData.weaponSkills;
        }else{
            this.weaponSkills = [];
        }
        if (this.type === "weapon" && itemData.weaponSkillIds) {
            itemData.weaponSkillIds.forEach(skillId => {
                const skillDataFromCache = allSkillsCache[skillId]; // skillDataFromCache is the definition
                if (skillDataFromCache) {
                    // Skill constructor expects (skillData, effects_definition_array)
                    this.weaponSkills.push(new Skill(skillDataFromCache, skillDataFromCache.effects));
                } else {
                    console.warn(`Weapon skill ID '${skillId}' not found for item '${this.name}'.`);
                }
            });
        }
    }

    use(target) {
        if (this.type !== "consumable") {
            console.warn(`Attempted to use non-consumable item ${this.name} as consumable.`);
            return false;
        }
        if (!target) { // Target should be a Member instance
            console.error(`Target not provided for using item ${this.name}.`);
            return false;
        }

        console.log(`Using ${this.name} on ${target.name}.`);

        // Apply effects defined on the item
        if (this.effects && this.effects.length > 0) {
            this.effects.forEach(effectData => {
                // effectData is an object like: { name: "Minor Heal Effect", type: "buff", subType: "heal", value: 25, duration: 0, icon: "...", ... }
                new EffectClass(target, effectData); // EffectClass applies it and handles UI updates
            });
        }

        // Note: Consumables are single-use. Their removal from the toolbar/inventory
        // is handled by the Hero class after this 'use' method returns successfully.
        return true;
    }
}

export default Item;