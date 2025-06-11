import { selectTarget } from '../Targeting.js';

function getAllHandledTargetingModes() {
    // Get all targeting modes handled in Targeting.js
    const handledModes = new Set();
    
    // Extract all case statements from the switch statement
    const switchCases = [
        'Random', 'Random Front', 'Random Back', 'Random Any',
        'Random Ally Front', 'Random Ally Back', 'Random Ally',
        'Self', 'Specific Enemy Front X', 'Specific Enemy Back X',
        'Specific Ally Front X', 'Specific Ally Back X',
        'All Front', 'All Back', 'All Enemies',
        'All Team Front', 'All Team Back', 'All Ally',
        'Row Front', 'Row Back', 'All Characters',
        'Lowest HP Front', 'Lowest HP Back', 'Lowest HP',
        'Highest HP Front', 'Highest HP Back', 'Highest HP Any',
        'Lowest HP Team Front', 'Lowest HP Team Back', 'Lowest HP Team Any',
        'Highest HP Team Front', 'Highest HP Team Back', 'Highest HP Team Any',
        'Column 1', 'Column 2', 'Column 3', 'Column 4',
        'Adjacent Enemies', 'Adjacent Allies',
        'Diagonal from Caster', 'Diagonal from Target'
    ];

    switchCases.forEach(mode => handledModes.add(mode));
    return handledModes;
}

export async function checkUntrackedTargeting() {
    try {
        // Fetch skills data
        const response = await fetch('../Data/skills.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const skillsData = await response.json();

        // Get all handled targeting modes
        const handledModes = getAllHandledTargetingModes();
        const untrackedModes = new Set();
        let skillCount = 0;

        // Process each skill
        Object.values(skillsData).forEach(skill => {
            skillCount++;
            if (skill.targetingModes) {
                skill.targetingModes.forEach(mode => {
                    // Check if the mode is handled
                    if (!handledModes.has(mode)) {
                        untrackedModes.add(mode);
                    }
                });
            }
        });

        // Print results
        console.log("Total skills checked:", skillCount);
        console.log('Untracked targeting modes found in skills:');
        console.log('----------------------------------------');
        Array.from(untrackedModes).sort().forEach(mode => {
            console.log(mode);
        });
        console.log('----------------------------------------');
        console.log(`Total untracked targeting modes: ${untrackedModes.size}`);

    } catch (error) {
        console.error('Error checking untracked targeting modes:', error);
    }
}

// Make the function available globally
window.checkUntrackedTargeting = checkUntrackedTargeting; 