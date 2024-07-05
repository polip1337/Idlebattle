import {
    updateHealth,
    updateMana,
    updateStamina,
    updateExp,
    deepCopy,
    updateExpBarText,
    expBarTextAddGlow,
    openEvolutionModal
} from './Render.js';
import {
    hero,
    classTiers,
    heroClasses

} from './initialize.js';

class EvolutionService {

    levelThresholdReached(classIndex) {
        updateExpBarText(hero.classType + " can evolve! Click here!");
        expBarTextAddGlow();
        hero.class1Evolve = true;
        document.getElementById('level-progress-bar').addEventListener('click', () => openEvolutionModal(hero));

    }
    checkClassAvailability() {
        for (let tier in classTiers) {
            classTiers[tier].forEach(className => {
                const classData = heroClasses[className];
                if (className != "Novice") {
                    const requirements = classData.requirements;
                    if (this.meetsRequirements(requirements) && !hero.availableClasses.includes(className)) {
                        hero.availableClasses.push(classData);
                    }
                }
            });
        }
    }

    meetsRequirements(requirements) {
        for (let key in requirements) {
            if (typeof requirements[key] === 'object') {
                for (let subKey in requirements[key]) {
                    if ((battleStatistics[key][subKey] || 0) < requirements[key][subKey]) {
                        return false;
                    }
                }
            } else {
                if ((this[key] || 0) < requirements[key]) {
                    return false;
                }
            }
        }
        return true;
    }
}

export default EvolutionService;