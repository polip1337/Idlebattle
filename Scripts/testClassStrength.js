import ClassStrengthEstimator from './classStrengthEstimator.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the class data
const classesData = JSON.parse(readFileSync(join(__dirname, '../Data/classes.json'), 'utf8'));
const skillsData = JSON.parse(readFileSync(join(__dirname, '../Data/skills.json'), 'utf8'));

// Create estimator instance
const estimator = new ClassStrengthEstimator();

// Helper function to get full skill data
function getFullSkillData(skillIds) {
    return skillIds.map(skillId => {
        const skillKey = skillId.toLowerCase().replace(/\s+/g, '_');
        return skillsData[skillKey] || { id: skillId, name: skillId };
    });
}

// Analyze Novice class
const noviceData = {
    ...classesData.classes.Novice,
    skills: getFullSkillData(classesData.classes.Novice.skills)
};

// Analyze Rogue class (using Shadowfoot as it's the closest to a Rogue)
const rogueData = {
    ...classesData.classes.Shadowfoot,
    skills: getFullSkillData(classesData.classes.Shadowfoot.skills)
};

// Analyze Warrior Progression Classes
const bronzeSquireData = {
    ...classesData.classes["Bronze Squire"],
    skills: getFullSkillData(classesData.classes["Bronze Squire"].skills)
};

const ironKnightData = {
    ...classesData.classes["Iron Knight"],
    skills: getFullSkillData(classesData.classes["Iron Knight"].skills)
};

const steelPaladinData = {
    ...classesData.classes["Steel Paladin"],
    skills: getFullSkillData(classesData.classes["Steel Paladin"].skills)
};

const adamantGuardianData = {
    ...classesData.classes["Adamant Guardian"],
    skills: getFullSkillData(classesData.classes["Adamant Guardian"].skills)
};

const mythrilChampionData = {
    ...classesData.classes["Mythril Champion"],
    skills: getFullSkillData(classesData.classes["Mythril Champion"].skills)
};

// Run analysis
console.log('=== Novice Class Analysis ===');
console.log(JSON.stringify(estimator.estimateClassStrength(noviceData, 1), null, 2));

console.log('\n=== Rogue Class Analysis ===');
console.log(JSON.stringify(estimator.estimateClassStrength(rogueData, 1), null, 2));

console.log('\n=== Warrior Progression Analysis ===');
console.log('\n=== Bronze Squire (Tier 1) ===');
console.log(JSON.stringify(estimator.estimateClassStrength(bronzeSquireData, 1), null, 2));

console.log('\n=== Iron Knight (Tier 2) ===');
console.log(JSON.stringify(estimator.estimateClassStrength(ironKnightData, 2), null, 2));

console.log('\n=== Steel Paladin (Tier 3) ===');
console.log(JSON.stringify(estimator.estimateClassStrength(steelPaladinData, 3), null, 2));

console.log('\n=== Adamant Guardian (Tier 4) ===');
console.log(JSON.stringify(estimator.estimateClassStrength(adamantGuardianData, 4), null, 2));

console.log('\n=== Mythril Champion (Tier 5) ===');
console.log(JSON.stringify(estimator.estimateClassStrength(mythrilChampionData, 5), null, 2)); 