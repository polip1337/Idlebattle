import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { expect } from 'chai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Skill Validation Tests', () => {
    let mobs;
    let skills;
    let passives;
    let missingSkills;

    before(() => {
        // Read the JSON files
        mobs = JSON.parse(readFileSync(join(__dirname, '../../Data/mobs.json'), 'utf8'));
        skills = JSON.parse(readFileSync(join(__dirname, '../../Data/skills.json'), 'utf8'));
        passives = JSON.parse(readFileSync(join(__dirname, '../../Data/passives.json'), 'utf8'));
        
        // Initialize missing skills collection
        missingSkills = {
            active: new Set(),
            passive: new Set()
        };
    });

    it('should have all mob skills defined in either skills.json or passives.json', () => {
        // Check each mob's skills
        Object.values(mobs).forEach(mob => {
            if (!mob.skills) return;

            mob.skills.forEach(skillId => {
                const isActiveSkill = skills[skillId];
                const isPassiveSkill = passives[skillId];

                if (!isActiveSkill && !isPassiveSkill) {
                    // Try to determine if it should be an active or passive skill
                    // based on the skill name or mob type
                    if (skillId.toLowerCase().includes('passive') || 
                        skillId.toLowerCase().includes('aura') ||
                        skillId.toLowerCase().includes('mastery')) {
                        missingSkills.passive.add(skillId);
                    } else {
                        missingSkills.active.add(skillId);
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

    it('should have consistent skill types between mobs and skill definitions', () => {
        Object.values(mobs).forEach(mob => {
            if (!mob.skills) return;

            mob.skills.forEach(skillId => {
                const activeSkill = skills[skillId];
                const passiveSkill = passives[skillId];

                if (activeSkill && passiveSkill) {
                    throw new Error(`Skill ${skillId} is defined as both active and passive`);
                }

                if (activeSkill && activeSkill.type !== 'active') {
                    throw new Error(`Skill ${skillId} is referenced as active but defined as ${activeSkill.type}`);
                }

                if (passiveSkill && passiveSkill.type !== 'passive') {
                    throw new Error(`Skill ${skillId} is referenced as passive but defined as ${passiveSkill.type}`);
                }
            });
        });
    });
}); 