export default {
    id: 'sylvaraFogTest',
    name: "Driftkin's Test",
    giver: 'Sylvara Tidewalker',
    description: 'Sylvara Tidewalker challenges you to prove your worth by navigating a treacherous fog-choked route in Driftmoor. Success could earn you the trust of the Driftkin and their support.',
    steps: [
        {
            description: 'Navigate through the fog-choked path in Driftmoor.',
            hint: 'Follow the clockwise fog currents and beware of fog-mutated wolves.',
            condition: (event, data) => event === 'combatComplete' && data.poiName === 'Foggy Path'
        },
        {
            description: 'Return to Sylvara Tidewalker.',
            hint: 'Speak to Sylvara via dialogue to report your success.',
            condition: (event, data) => event === 'dialogue' && data.npc === 'Sylvara Tidewalker'
        }
    ],
    rewards: {
        success: { 
            reputation: { driftkin: 10}
        }
    }
}; 