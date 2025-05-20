export default {
    id: 'fogscarHeist',
    name: 'The Sewer Door Heist',
    giver: 'Renn Quickfingers',
    description: 'Join Renn to infiltrate the Rustmarket Sewers and uncover the secrets behind a mysterious Old Empire door.',
    steps: [

        {
            description: 'Infiltrate the Rustmarket Sewers and search for the door.',
            hint: 'Enter the Rustmarket Sewers in Rustmarket and win the First corridor combat encounter.',
            condition: (event, data) => event === 'combatComplete' && data.poiName === 'First Corridor'
        },
        {
                    description: 'Go deeper into the Rustmarket Sewers and defeat the fog-touched scavengers, who are blocking your way.',
                    hint: 'Enter the Rustmarket Sewers in Rustmarket and win the Scavenger Redoubt combat encounter.',
                    condition: (event, data) => event === 'combatComplete' && data.poiName === 'Scavenger Redoubt'
        },
        {
            description: 'Escape the guardian construct in the Rustmarket Sewers.',
            hint: 'Flee from the guardian construct to survive the encounter.',
            condition: (event, data) => event === 'escape' && data.poiName === 'Vault Antechamber'
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