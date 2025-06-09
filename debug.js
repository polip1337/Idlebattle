import { hero } from './initialize.js';
import { changeHeroClass } from './classChange.js';
import { questSystem } from './questSystem.js';

let allClasses = {};

export function initializeDebug() {
    // Load all classes from classes.json
    fetch('Data/classes.json')
        .then(response => response.json())
        .then(data => {
            allClasses = data;
            populateClassSelect();
        })
        .catch(error => console.error('Error loading classes:', error));

    // Set up event listeners
    document.getElementById('debug-close').addEventListener('click', closeDebugModal);
    document.getElementById('debug-change-class').addEventListener('click', handleClassChange);
    document.getElementById('debug-add-exp').addEventListener('click', handleAddExp);
    document.getElementById('debug-add-gold').addEventListener('click', handleAddGold);
    document.getElementById('debug-set-quest-step').addEventListener('click', handleSetQuestStep);

    // Add keyboard shortcut
    document.addEventListener('keydown', (event) => {
        if (event.key.toLowerCase() === 'c') {
            toggleDebugModal();
        }
    });
}

function toggleDebugModal() {
    const modal = document.getElementById('debug-modal');
    if (modal.classList.contains('hidden')) {
        openDebugModal();
    } else {
        closeDebugModal();
    }
}

function openDebugModal() {
    const modal = document.getElementById('debug-modal');
    modal.classList.remove('hidden');
    populateClassSelect();
}

function closeDebugModal() {
    const modal = document.getElementById('debug-modal');
    modal.classList.add('hidden');
}

function populateClassSelect() {
    const select = document.getElementById('debug-class-select');
    select.innerHTML = '<option value="">Select a class...</option>';

    // Add classes from all tiers
    Object.entries(allClasses).forEach(([tier, tierData]) => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = `Tier ${tier.replace('tier', '')}`;
        
        tierData.classes.forEach(classInfo => {
            const option = document.createElement('option');
            option.value = JSON.stringify(classInfo);
            option.textContent = classInfo.name;
            optgroup.appendChild(option);
        });
        
        select.appendChild(optgroup);
    });
}

function handleClassChange() {
    const select = document.getElementById('debug-class-select');
    const selectedValue = select.value;
    
    if (selectedValue) {
        try {
            const classInfo = JSON.parse(selectedValue);
            changeHeroClass(classInfo);
        } catch (error) {
            console.error('Error changing class:', error);
        }
    }
}

function handleAddExp() {
    const expInput = document.getElementById('debug-exp-input');
    const expToAdd = parseInt(expInput.value) || 0;
    
    if (expToAdd > 0 && hero) {
        hero.addExperience(expToAdd);
    }
}

function handleAddGold() {
    const goldInput = document.getElementById('debug-gold-input');
    const goldToAdd = parseInt(goldInput.value) || 0;
    
    if (goldToAdd > 0 && hero) {
        hero.gold += goldToAdd;
        // Update gold display if needed
        const goldDisplay = document.getElementById('gold-display');
        if (goldDisplay) {
            goldDisplay.textContent = hero.gold;
        }
    }
}

function handleSetQuestStep() {
    const stepInput = document.getElementById('debug-quest-step');
    const newStep = parseInt(stepInput.value) || 1;
    
    if (newStep > 0 && questSystem) {
        questSystem.setCurrentStep(newStep);
    }
} 