export default {
    nodes: [
        {
            id: 'start',
            text: 'Greetings, traveler. The village is plagued by goblins from the [Goblin Cave|goblinCave|A dark cave filled with goblins]. Will you help us?',
            options: [
                {
                    text: 'Accept the quest to clear the Goblin Cave.',
                    action: { type: 'startQuest', questId: 'goblinSlayer' },
                    nextId: 'questAccepted'
                },
                {
                    text: 'Decline the quest.',
                    nextId: 'decline'
                }
            ]
        },
        {
            id: 'questAccepted',
            text: 'Thank you, brave soul. Clear the Goblin Cave and return to me when the deed is done.',
            options: [
                {
                    text: 'I will return after defeating the goblins.',
                    conditions: [
                        { type: 'questActive', questId: 'goblinSlayer' }
                    ]
                }
            ]
        },
        {
            id: 'decline',
            text: 'Very well. Return if you change your mind.'
        },
        {
            id: 'questComplete',
            text: 'You have defeated the goblins! The village is safe thanks to you.',
            conditions: [
                { type: 'questActive', questId: 'goblinSlayer' }
            ]
        }
    ]
};