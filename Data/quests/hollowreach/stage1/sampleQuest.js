export default {
    id: 'goblinSlayer',
    name: 'Goblin Slayer',
    giver: 'Old Sage',
    description: 'The Old Sage has tasked you with clearing the Goblin Cave to protect the village.',
    steps: [
        {
            description: 'Travel to the Goblin Cave.',
            hint: 'Find the Goblin Cave on the Goblin Plains map.',
            condition: (event, data) => event === 'travel' && data.poiName === 'Goblin Cave'
        },
        {
            description: 'Defeat the goblins in the cave.',
            hint: 'Engage in combat at the Goblin Cave and win the battle.',
            condition: (event, data) => event === 'combatComplete' && data.poiName === 'Goblin Cave'
        },
        {
            description: 'Return to the Old Sage.',
            hint: 'Speak to the Old Sage via dialogue to report your success.',
            condition: (event, data) => event === 'dialogue' && data.npc === 'Old Sage'
        }
    ],
    rewards: {
        items: ['healingPotion'],
        experience: 100
    }
};