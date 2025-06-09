import { hero, allHeroClasses } from './initialize.js';
import { updateStatsDisplay, renderSkills, renderPassiveSkills } from './Render.js';

let classChangeModal;

export function initializeClassChange() {
    classChangeModal = document.getElementById('class-change-modal');
    const cancelButton = document.getElementById('class-change-cancel');
    
    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            classChangeModal.style.display = 'none';
        });
    }
}

export function openClassChangeModal() {
    const optionsContainer = document.getElementById('class-change-options');
    if (!optionsContainer || !hero) return;

    // Clear previous options
    optionsContainer.innerHTML = '';

    // Get all available classes
    const availableClasses = Object.values(allHeroClasses.classes || {});
    
    // Create option for each class
    availableClasses.forEach(classInfo => {
        const classOption = document.createElement('div');
        classOption.className = 'class-option';
        
        // Check if this class is already one of the hero's classes
        const isCurrentClass = hero.classId === classInfo.id || 
                             (hero.class2 && hero.class2.id === classInfo.id) ||
                             (hero.class3 && hero.class3.id === classInfo.id);
        
        // Get class history if it exists
        const classHistory = hero.classHistory[classInfo.id];
        const classLevel = classHistory ? classHistory.level : 1;
        
        classOption.innerHTML = `
            <h3>${classInfo.name}</h3>
            <p>Level: ${classLevel}</p>
            <p>${classInfo.description || ''}</p>
            <button class="select-class-button" ${isCurrentClass ? 'disabled' : ''}>
                ${isCurrentClass ? 'Current Class' : 'Select Class'}
            </button>
        `;

        if (!isCurrentClass) {
            const selectButton = classOption.querySelector('.select-class-button');
            selectButton.addEventListener('click', () => {
                changeHeroClass(classInfo);
                classChangeModal.style.display = 'none';
            });
        }

        optionsContainer.appendChild(classOption);
    });

    classChangeModal.style.display = 'block';
}

export function changeHeroClass(newClassInfo) {
    if (!hero || !newClassInfo) return;

    hero.activeSelectedSkills = [];
    hero.selectedSkills = [];
    hero.selectedPassiveSkills = [];

    // Update current class info
    hero.classType = newClassInfo.name;
    hero.classId = newClassInfo.id;
    hero.class = newClassInfo;
    
    // Restore class-specific data
    hero.level = 1;
    hero.experience = 0;
    hero.experienceToLevel = 100;

    // Update skills
    hero.skills = hero.createSkillsFromIDs(newClassInfo.skills || []);
    
    // Update stats
    hero.stats = { ...newClassInfo.stats };
    hero.statsPerLevel = newClassInfo.statsPerLevel;
    
    // Recalculate stats with current level
    hero.recalculateHeroStats(true);
    
    // Update UI
    updateStatsDisplay(hero);
    renderSkills(hero);
    renderPassiveSkills(hero);
    
    // Update class display
    const class1Level = document.getElementById('heroClass1Level');
    if (class1Level) class1Level.textContent = hero.level;
    
    // Update class name display
    const className = document.getElementById('class-name');
    if (className) className.textContent = hero.classType;
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    const cancelButton = document.getElementById('class-change-cancel');
    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            classChangeModal.style.display = 'none';
        });
    }

    // Add click outside to close
    const modal = document.getElementById('class-change-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                classChangeModal.style.display = 'none';
            }
        });
    }
}); 