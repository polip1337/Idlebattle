import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { expect } from 'chai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Skill Validation Tests', () => {
    let mobs;
    let classes;
    let skills;
    let passives;
    let missingSkills;

    before(() => {
        // Read the JSON files
        mobs = JSON.parse(readFileSync(join(__dirname, '../../Data/mobs.json'), 'utf8'));
        classes = JSON.parse(readFileSync(join(__dirname, '../../Data/classes.json'), 'utf8'));
        skills = JSON.parse(readFileSync(join(__dirname, '../../Data/skills.json'), 'utf8'));
        passives = JSON.parse(readFileSync(join(__dirname, '../../Data/passives.json'), 'utf8'));
        
        // Initialize missing skills collection
        missingSkills = {
            active: new Set(),
            passive: new Set()
        };
    });

    it('should have all mob and class skills defined in either skills.json or passives.json', () => {
        // Check each mob's skills
        Object.values(mobs).forEach(mob => {
            if (!mob.skills) return;

            mob.skills.forEach((skillId, index) => {
                const isActiveSkill = skills[skillId];
                const isPassiveSkill = passives[skillId];

                if (!isActiveSkill && !isPassiveSkill) {
                    // First 8 skills are active, next 4 are passive
                    if (index < 8) {
                        missingSkills.active.add(skillId);
                    } else if (index < 12) {
                        missingSkills.passive.add(skillId);
                    } else {
                        // If there are more than 12 skills, log a warning
                        console.warn(`Skill ${skillId} at index ${index} is beyond the expected skill count (12)`);
                        missingSkills.active.add(skillId); // Default to active for unexpected positions
                    }
                }
            });
        });

        // Check each class's skills
        Object.values(classes.classes).forEach(classData => {
            if (!classData.skills) return;

            classData.skills.forEach((skillId, index) => {
                const isActiveSkill = skills[skillId];
                const isPassiveSkill = passives[skillId];

                if (!isActiveSkill && !isPassiveSkill) {
                    // First 8 skills are active, next 4 are passive
                    if (index < 8) {
                        missingSkills.active.add(skillId);
                    } else if (index < 12) {
                        missingSkills.passive.add(skillId);
                    } else {
                        // If there are more than 12 skills, log a warning
                        console.warn(`Skill ${skillId} at index ${index} is beyond the expected skill count (12)`);
                        missingSkills.active.add(skillId); // Default to active for unexpected positions
                    }
                }
            });
        });

        // Create detailed error message if any skills are missing
        if (missingSkills.active.size > 0 || missingSkills.passive.size > 0) {
            let errorMessage = 'Missing skill definitions:\n';
            
            if (missingSkills.active.size > 0) {
                errorMessage += '\nActive Skills:\n';
                missingSkills.active.forEach(skill => {
                    errorMessage += `- ${skill}\n`;
                });
            }
            
            if (missingSkills.passive.size > 0) {
                errorMessage += '\nPassive Skills:\n';
                missingSkills.passive.forEach(skill => {
                    errorMessage += `- ${skill}\n`;
                });
            }

            throw new Error(errorMessage);
        }
    });

    it('should have consistent skill types between mobs/classes and skill definitions', () => {
        // Check mob skills
        Object.values(mobs).forEach(mob => {
            if (!mob.skills) return;

            mob.skills.forEach((skillId, index) => {
                const activeSkill = skills[skillId];
                const passiveSkill = passives[skillId];

                if (activeSkill && passiveSkill) {
                    throw new Error(`Skill ${skillId} is defined as both active and passive`);
                }

                // Verify skill type matches position
                if (index < 8) {
                    if (passiveSkill) {
                        throw new Error(`Skill ${skillId} at index ${index} should be active but is defined as passive`);
                    }
                } else if (index < 12) {
                    if (activeSkill) {
                        throw new Error(`Skill ${skillId} at index ${index} should be passive but is defined as active`);
                    }
                }
            });
        });

        // Check class skills
        Object.values(classes.classes).forEach(classData => {
            if (!classData.skills) return;

            classData.skills.forEach((skillId, index) => {
                const activeSkill = skills[skillId];
                const passiveSkill = passives[skillId];

                if (activeSkill && passiveSkill) {
                    throw new Error(`Skill ${skillId} is defined as both active and passive`);
                }

                // Verify skill type matches position
                if (index < 8) {
                    if (passiveSkill) {
                        throw new Error(`Skill ${skillId} at index ${index} should be active but is defined as passive`);
                    }
                } else if (index < 12) {
                    if (activeSkill) {
                        throw new Error(`Skill ${skillId} at index ${index} should be passive but is defined as active`);
                    }
                }
            });
        });
    });
}); 