export default {
    id: 'fogscarHeist',
    name: 'The Sewer Door Heist',
    giver: 'Renn Quickfingers',
    description: 'Join Renn to infiltrate the Rustmarket Sewers and uncover the secrets behind a mysterious Old Empire door.',
    steps: [
        {
            description: 'Meet Renn in Rustmarket to plan the heist.',
            hint: 'Find Renn Quickfingers in the Rustmarket area of Hollowreach.',
            condition: (event, data) => event === 'dialogue' && data.npc === 'Renn Quickfingers'
        },
        {
            description: 'Infiltrate the Rustmarket Sewers and defeat the fog-touched scavengers.',
            hint: 'Enter the Rustmarket Sewers in Rustmarket and win the combat encounter.',
            condition: (event, data) => event === 'combatComplete' && data.poiName === 'Rustmarket Sewers'
        },
        {
            description: 'Escape the guardian construct in the Rustmarket Sewers.',
            hint: 'Flee from the guardian construct to survive the encounter.',
            condition: (event, data) => event === 'escape' && data.poiName === 'Rustmarket Sewers'
        },
        {
            description: 'Return to Renn in Rustmarket to report your success.',
            hint: 'Speak to Renn Quickfingers via dialogue in Rustmarket to complete the heist.',
            condition: (event, data) => event === 'dialogue' && data.npc === 'Renn Quickfingers'
        }
    ],
    rewards: {
        experience: 50,
        unlock:"mistwalkerSecret"
    }
};