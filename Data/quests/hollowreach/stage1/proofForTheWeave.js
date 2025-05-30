export default {
    id: 'proofForTheWeave',
    name: 'Proof for the Weave',
    giver: 'Vrenna Stoneweave',
    description: 'Prove the amulet\'s power to Vrenna Stoneweave by recovering a stolen tapestry fragment from Rustmarket\'s sewers.',
    steps: [
        {
            description: 'Enter the Rustmarket Sewers to search for information about the scavengers.',
            hint: 'Navigate to the Rustmarket Sewers and look for someone who might know about the scavengers.',
            condition: (event, data) => event === 'areaEnter' && data.areaId === 'rustmarketSewers'
        },
        {
            description: 'Find and speak to the sewer contact about the scavengers\' location.',
            hint: 'Look for a hooded figure in the sewers who might have information.',
            condition: (event, data) => event === 'dialogue' && data.npc === 'sewer_contact' && data.dialogueId === 'reveal_location'
        },
        {
            description: 'Deal with the fog-touched scavengers guarding the fragment.',
            hint: 'Either fight or negotiate with the scavengers in their hideout.',
            condition: (event, data) => event === 'combatComplete' && data.poiName === 'Scavenger Cache'
        },
        {
            description: 'Decide what to do with the fragment.',
            hint: 'Choose whether to return it to Vrenna, sell it to the Driftkin, or keep it for study.',
            condition: (event, data) => event === 'dialogue' && data.npc === 'Vrenna Stoneweave' && data.dialogueId === 'fragment_decision'
        }
    ],
    rewards: {
        experience: 50,
        reputation: {
            Loomkeepers: 10,
            Driftkin: -5
        },
        items: ['loomkeeperPortalMap'],
        unlock: "mistwalkerSecret"
    },
    requirements: {
        quests: ['fogscarHeist'],
        items: ['mistwalkerAmulet']
    }
}; 