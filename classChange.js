import { hero, allHeroClasses } from './initialize.js';

let selectedClassId = null;

export function openClassChangeModal() {
    const modal = document.getElementById('class-change-modal');
    const optionsContainer = document.getElementById('class-change-options');
    
    if (!modal || !optionsContainer) {
        console.error('Class change modal elements not found');
        return;
    }

    // Clear previous options
    optionsContainer.innerHTML = '';
    selectedClassId = null;

    // Add all available classes
    Object.values(allHeroClasses).forEach(classInfo => {
        const classData = hero.classHistory[classInfo.id] || {
            level: 1,
            experience: 0,
            experienceToLevel: 100
        };

        const classOption = document.createElement('div');
        classOption.className = 'class-option';
        if (classInfo.id === hero.classId) {
            classOption.classList.add('selected');
            selectedClassId = classInfo.id;
        }

        classOption.innerHTML = `
            <h3>${classInfo.name}</h3>
            <div class="class-level">Level: ${classData.level}</div>
            <div class="class-description">${classInfo.description || 'No description available.'}</div>
            <div class="class-stats">
                ${Object.entries(classInfo.stats).map(([stat, value]) => 
                    `<div>${stat}: ${value}</div>`
                ).join('')}
            </div>
        `;

        classOption.addEventListener('click', () => {
            // Remove selected class from all options
            document.querySelectorAll('.class-option').forEach(opt => 
                opt.classList.remove('selected')
            );
            
            // Add selected class to clicked option
            classOption.classList.add('selected');
            selectedClassId = classInfo.id;
        });

        optionsContainer.appendChild(classOption);
    });

    // Show modal
    modal.classList.add('active');
}

export function closeClassChangeModal() {
    const modal = document.getElementById('class-change-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

export function confirmClassChange() {
    if (!selectedClassId || selectedClassId === hero.classId) {
        return;
    }

    const newClassInfo = allHeroClasses[selectedClassId];
    if (!newClassInfo) {
        console.error('Selected class not found in allHeroClasses');
        return;
    }

    if (hero.changeClass(newClassInfo)) {
        closeClassChangeModal();
    }
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    const cancelButton = document.getElementById('class-change-cancel');
    if (cancelButton) {
        cancelButton.addEventListener('click', closeClassChangeModal);
    }

    // Add click outside to close
    const modal = document.getElementById('class-change-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeClassChangeModal();
            }
        });
    }
}); 