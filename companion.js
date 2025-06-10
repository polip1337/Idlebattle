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
        const classInfoForMember = { [companionDefinition.classInfo.id]: companionDefinition };
        super.restoreFromData(data, classInfoForMember, allSkillsLookup);

        this.companionId = data.companionId; // Should match the key from definitions
        this.experience = data.experience || 0;
        this.experienceToLevel = data.experienceToLevel || Math.floor(100 * (this.experienceToLevelMultiplier || 1.1));

        // Move skill progression restoration after parent class initialization
        if (data.skillProgression && allSkillsLookup && this.skills) {
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