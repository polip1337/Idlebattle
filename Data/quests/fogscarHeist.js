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
            description: 'Listen to Renn\'s warning about the fogged corridor.',
            hint: 'Pay attention to Renn\'s dialogue about the dangerous fogged district route.',
            condition: (event, data) => event === 'dialogue' && data.npc === 'Renn Quickfingers' && data.dialogueId === 'getToTheDoor'
        },
        {
            description: 'Escape the guardian construct in the Rustmarket Sewers.',
            hint: 'Flee from the guardian construct to survive the encounter.',
            condition: (event, data) => event === 'escape' && data.poiName === 'Vault Antechamber'
        },
        {
            description: 'Navigate through the collapsed corridors and escape through the fogged district.',
            hint: 'Use the amulet\'s protection to survive the poisonous fog and escape to the surface.',
            condition: (event, data) => event === 'areaEnter' && data.areaId === 'foggedDistrict'
        },
        {
            description: 'Return to the surface and discuss the amulet with Renn.',
            hint: 'Speak to Taryn and Renn about the mysterious amulet and decide how to proceed.',
            condition: (event, data) => event === 'dialogue' && data.npc === 'Renn Quickfingers' && data.dialogueId === 'amulet_discussion'
        }
    ],
    rewards: {
        experience: 50,
        unlock: "mistwalkerSecret"
    }
};