import Member from './Member.js';
import {updatePassiveSkillBar, updateSkillBar,deepCopy, updateStatsDisplay, renderSkills, renderPassiveSkills} from './Render.js';
import Skill from './Skill.js'; // Added import for Skill constructor

class Hero extends Member {
    constructor(name, classInfo, skills, level = 1, team, opposingTeam) {
        super(name, classInfo, skills, level = 1, team, opposingTeam, true);
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
        this.gold = 0; // Initialize gold
    }

    selectSkill(skill, skillBox, isPassive = false) {
        const selectedSkills = isPassive ? this.selectedPassiveSkills : this.selectedSkills;
        const maxSkills = 4;
        // Find the index of the skill instance if it's already selected
        const existingSkillIndex = selectedSkills.findIndex(s => s === skill);

        const skillBarUpdateMethod = isPassive ? updatePassiveSkillBar : updateSkillBar;

        // The skillBox might not be directly tied to selectedSkills index if skills are added/removed non-sequentially
        // For setting skill element, we need to derive its intended slot in the UI bar if it's being added.
        // If it's already selected, skill.div should already be set.

        if (existingSkillIndex === -1 && selectedSkills.length < maxSkills) { // Adding new skill
            if (!isPassive) {
                const targetingSelect = skillBox.querySelector('.targeting-modes');
                if (targetingSelect) { // Ensure targetingSelect exists
                    skill.targetingMode = targetingSelect.value;
                }
            }
            selectedSkills.push(skill);
            skillBox.classList.add('selected');
            // Set the element after adding to selectedSkills, using its new index in the bar
            const newIndexInBar = selectedSkills.length -1; // 0-indexed
            const skillBarElementId = isPassive ? "#passiveSkill" + (newIndexInBar + 1) : "#skill" + (newIndexInBar + 1);
            const skillDiv = document.querySelector(skillBarElementId);
            if (skillDiv) {
                skill.setElement(skillDiv);
            }
        } else if (existingSkillIndex !== -1) { // Removing skill
            selectedSkills.splice(existingSkillIndex, 1);
            skillBox.classList.remove('selected');
            skill.setElement(null); // Clear element association
        }

        skillBarUpdateMethod(selectedSkills);
    }

    getSkill(skillDiv) {
        const skillNumber = parseInt(skillDiv.id.match(/\d+/)[0]);
        return this.selectedSkills[skillNumber - 1];
    }

    triggerRepeatSkills() {
        var activeSkills = this.selectedSkills.filter(skill => skill.type == "active");
        activeSkills.forEach(skill => {
            if (skill.repeat && !skill.onCooldown) {
                skill.useSkill(this);
            }
        });
    }

    addGold(amount) {
        this.gold += amount;
        // Future: Update UI if gold is displayed somewhere permanently.
        // For now, map screen stats will reflect this when map is opened/updated.
    }

    spendGold(amount) {
        if (this.gold >= amount) {
            this.gold -= amount;
            return true;
        }
        return false;
    }
        getSerializableData() {
            return {
                name: this.name,
                classId: this.class.id, // Save the class ID
                classType: this.classType, // Still save name for display/fallback
                level: this.level,
                isHero: this.isHero,
                experience: this.experience,
                experienceToLevel: this.experienceToLevel,
                stats: deepCopy(this.stats),
                currentHealth: this.currentHealth,
                maxHealth: this.maxHealth,
                currentMana: this.currentMana,
                currentStamina: this.currentStamina,
                gold: this.gold,
                position: this.position,
                skillProgression: this.skills.map(s => ({
                    name: s.name,
                    level: s.level,
                    experience: s.experience,
                    experienceToNextLevel: s.experienceToNextLevel,
                    baseDamage: s.baseDamage,
                })),
                selectedSkillNames: this.selectedSkills.map(s => s.name),
                selectedPassiveSkillNames: this.selectedPassiveSkills.map(s => s.name),
            };
        }

        restoreFromData(data, allHeroClasses, allSkillsLookup) {
            this.name = data.name;

            const savedClassName = data.classType; // Original saved name
            const classIdToLookup = data.classId || savedClassName; // Prefer classId (from new saves), fallback to name (from old saves)

            let classDefinition = allHeroClasses[classIdToLookup];

            if (!classDefinition && data.classId && savedClassName !== data.classId) {
                // If lookup by explicit classId failed, try the savedClassName as a last resort for that ID.
                console.warn(`Class lookup failed for ID: '${data.classId}'. Attempting lookup with saved name: '${savedClassName}'`);
                classDefinition = allHeroClasses[savedClassName];
            }

            if (!classDefinition) {
                // If still not found (e.g., old save where name != id, or corrupted data)
                console.error(`Failed to find class definition for ID '${classIdToLookup}' or name '${savedClassName}'. Attempting to load 'novice'.`);
                classDefinition = allHeroClasses['novice']; // Default fallback
                if (!classDefinition) {
                    const firstClassKey = Object.keys(allHeroClasses)[0];
                    if (firstClassKey) {
                        classDefinition = allHeroClasses[firstClassKey];
                        console.warn(`'novice' class not found. Using first available class: '${firstClassKey}'`);
                    } else {
                        alert("Critical error: No hero classes loaded. Game cannot continue.");
                        throw new Error("No hero classes available to restore hero.");
                    }
                }
            }

            this.class = deepCopy(classDefinition);
            this.classType = this.class.name; // Set hero's display name for class from the definition actually loaded

            this.level = data.level;
            this.isHero = data.isHero;
            this.experience = data.experience;
            this.experienceToLevel = data.experienceToLevel;
            this.stats = deepCopy(data.stats);
            this.maxHealth = data.maxHealth;
            this.currentHealth = Math.min(data.currentHealth, this.maxHealth);

            this.currentMana = Math.min(data.currentMana, this.stats.mana);
            this.currentStamina = Math.min(data.currentStamina, this.stats.stamina);

            this.gold = data.gold || 0; // Fallback for old saves
            this.position = data.position || 'Front'; // Fallback

            // Restore skills with their progression
            // 1. Get base skills from the now correctly loaded this.class
            if (!this.class.skills) {
                console.error(`Loaded class '${this.class.name}' (ID: ${this.class.id}) has no skills array.`);
                this.class.skills = []; // Prevent error on map
            }
            const baseSkillsFromClass = this.class.skills.map(skillId => {
                const skillData = allSkillsLookup[skillId];
                if (!skillData) {
                    console.error(`Skill ID '${skillId}' not found in allSkillsLookup for class '${this.class.name}'. Skipping skill.`);
                    return null;
                }
                return deepCopy(skillData);
            }).filter(Boolean); // Remove nulls if any skillId was not found

            // 2. Create Skill instances and apply saved progression
            this.skills = baseSkillsFromClass.map(baseSkillData => {
                const skillInstance = new Skill(baseSkillData, baseSkillData.effects);
                const savedProg = data.skillProgression.find(sp => sp.name === skillInstance.name);
                if (savedProg) {
                    skillInstance.applySavedState(savedProg);
                }
                return skillInstance;
            });

            this.savedSelectedSkillNames = data.selectedSkillNames;
            this.savedSelectedPassiveSkillNames = data.selectedPassiveSkillNames;
        }

        reselectSkillsAfterLoad() {
            if (!this.skills || this.skills.length === 0) return;

            this.selectedSkills = [];
            this.selectedPassiveSkills = [];

            if (this.savedSelectedSkillNames) {
                const activeSkillBoxesContainer = document.getElementById("activeSkills"); // Container of skill boxes
                this.savedSelectedSkillNames.forEach(name => {
                    const skillToSelect = this.skills.find(s => s.name === name && s.type === "active");
                    if (skillToSelect) {
                        // Find a free skill box if possible, or just add to list
                        const availableBox = Array.from(activeSkillBoxesContainer.querySelectorAll(".skill-box:not(.selected) .skill-name"))
                                               .find(span => span.textContent === name)?.closest(".skill-box");
                        if (availableBox) {
                            this.selectSkill(skillToSelect, availableBox, false);
                        } else {
                             this.selectedSkills.push(skillToSelect);
                        }
                    }
                });
            }
            updateSkillBar(this.selectedSkills);

            if (this.savedSelectedPassiveSkillNames) {
                 const passiveSkillBoxesContainer = document.getElementById("passiveSkills");
                this.savedSelectedPassiveSkillNames.forEach(name => {
                    const skillToSelect = this.skills.find(s => s.name === name && s.type !== "active");
                     if (skillToSelect) {
                        const availableBox = Array.from(passiveSkillBoxesContainer.querySelectorAll(".skill-box:not(.selected) .skill-name"))
                                               .find(span => span.textContent === name)?.closest(".skill-box");
                        if (availableBox) {
                            this.selectSkill(skillToSelect, availableBox, true);
                        } else {
                            this.selectedPassiveSkills.push(skillToSelect);
                        }
                    }
                });
            }
            updatePassiveSkillBar(this.selectedPassiveSkills);

            delete this.savedSelectedSkillNames;
            delete this.savedSelectedPassiveSkillNames;

            if (document.getElementById('heroContent').classList.contains('active')) {
                updateStatsDisplay(this);
                renderSkills(this); // This should re-render based on this.skills
                renderPassiveSkills(this); // This should re-render based on this.skills
            }
        }
    }

export default Hero;