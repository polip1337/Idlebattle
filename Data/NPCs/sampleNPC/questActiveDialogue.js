export default {
    nodes: [
        {
            id: 'start',
            text: 'You’ve returned, hero! Have you cleared the [Goblin Cave|goblinCave|A dark cave filled with goblins]?',
            options: [
                {
                    text: 'Yes, the goblins are defeated.',
                    conditions: [
                        { type: 'questActive', questId: 'goblinSlayer' }
                    ],
                    action: { type: 'completeQuest', questId: 'goblinSlayer' },
                    nextId: 'questComplete'
                },
                {
                    text: 'Not yet.',
                    nextId: 'notYet'
                }
            ]
        },
        {
            id: 'questComplete',
            text: 'You have defeated the goblins! The village is safe thanks to you. Take these rewards as our gratitude.'
        },
        {
            id: 'notYet',
            text: 'Please hurry, the village depends on you.'
        }
    ]
};