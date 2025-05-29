export default {
    id: 'driftkinsTest',
    name: 'Driftkin’s Test',
    giver: 'Sylvara Tidewalker',
    description: 'Prove the Mistwalker Amulet’s power to Sylvara Tidewalker by navigating a fog-choked route in Driftmoor.',
    steps: [
        {
            description: 'Speak to Sylvara Tidewalker in Driftmoor to receive the challenge.',
            hint: 'Find Sylvara at Sylvara’s Barge in Driftmoor.',
            condition: (event, data) => event === 'dialogue' && data.npcName === 'Sylvara Tidewalker' && data.dialogueNodeId === 'questAccepted_driftkin'
        },
        {
            description: 'Navigate the foggy route in Driftmoor and survive the mutated wolves.',
            hint: 'Travel to the Foggy Path in Driftmoor and win or evade the combat encounter.',
            condition: (event, data) => (event === 'combatComplete' || event === 'dialogue') && data.poiName === 'Foggy Path' && ['wolfEvaded', 'wolfDefeated'].includes(data.dialogueNodeId)
        },
        {
            description: 'Report your success to Sylvara Tidewalker.',
            hint: 'Return to Sylvara’s Barge in Driftmoor to report the outcome.',
            condition: (event, data) => event === 'dialogue' && data.npcName === 'Sylvara Tidewalker' && ['successfulNavigation', 'partialSuccess', 'betraySylvara'].includes(data.dialogueNodeId)
        }
    ],
    rewards: {
        items: ['fogProofCompass'],
        experience: 75,
        reputation: {
            Driftkin: 10 // Only applied if navigation is successful
        }
    }
};