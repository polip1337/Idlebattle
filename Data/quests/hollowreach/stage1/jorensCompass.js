export default {
    id: 'jorensCompass',
    name: "Joren's Technical Troubles",
    giver: 'Joren Halfhand',
    description: 'Joren Halfhand needs help testing and improving his fog-navigation devices. His experimental gadgets could revolutionize how people navigate the mist, but they need proper testing and refinement.',
    steps: [
        {
            description: 'Meet with Joren to discuss his latest invention.',
            hint: 'Find Joren in his workshop to learn about his new fog-navigation device.',
            condition: (event, data) => event === 'dialogue' && data.npc === 'Joren Halfhand' && data.dialogueStage === 'compass_introducrtion'
        },
        {
            description: 'Test Joren\'s device in controlled conditions.',
            hint: 'Calibrate the compass with Joren.',
            condition: (event, data) => event === 'dialogue' && data.npc === 'Joren Halfhand' && data.dialogueStage === 'calibrated'
        },
        {
            description: 'Report your findings to Joren.',
            hint: 'Return the compass to Joren.',
            condition: (event, data) => event === 'dialogue' && data.npc === 'Joren Halfhand' && data.dialogueStage === 'report'
        }
    ],
    rewards: {
        success: {
            reputation: { driftkin: 15 },
            experience: 150
        }
    }
}; 