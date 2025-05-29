export default {
    nodes: [
        {
            id: 'start',
            text: "Ah, Taryn! I see you've been busy with that amulet business. How's it going?",
            options: [
                {
                    text: "I chose to work with the faction.",
                    nextId: 'faction_path',
                    conditions: [
                        { type: 'questActive', questId: 'mistwalkerSecret' },
                        { type: 'questStep', questId: 'mistwalkerSecret', stepIndex: 2, branch: 'faction_help' }
                    ],
                    hideWhenUnavailable: true
                },
                {
                    text: "I'm going with the archive plan.",
                    nextId: 'archive_path',
                    conditions: [
                        { type: 'questActive', questId: 'mistwalkerSecret' },
                        { type: 'questStep', questId: 'mistwalkerSecret', stepIndex: 2, branch: 'archive_plan' }
                    ],
                    hideWhenUnavailable: true
                }
            ]
        },
        {
            id: 'faction_path',
            text: "The faction route, eh? Smart choice. They've got resources and connections that could make this whole thing a lot smoother. Just remember - they'll expect something in return. These factions don't do favors for free.",
            options: [
                {
                    text: "I understand. I'll be careful.",
                    nextId: 'faction_warning'
                }
            ]
        },
        {
            id: 'faction_warning',
            text: "Good. Keep your wits about you when dealing with them. And if things get too... complicated, you know where to find me. I've got a few tricks up my sleeve that might help if you need them.",
            options: [
                {
                    text: "Thanks for the advice, Renn.",
                    // No nextId, closes dialogue
                }
            ]
        },
        {
            id: 'archive_path',
            text: "The archive, huh? Bold choice. Those old ruins are full of secrets, but if anyone can navigate them, it's us. Just watch out for Korzog - he's been sniffing around there lately, and he's not the type to share nicely.",
            options: [
                {
                    text: "I'll keep an eye out for him.",
                    nextId: 'archive_warning'
                }
            ]
        },
        {
            id: 'archive_warning',
            text: "Do that. And remember - the archive's puzzles are tricky, but they're not impossible. If you get stuck, look for patterns in the runes. They usually tell a story if you know how to read them.",
            options: [
                {
                    text: "I'll remember that. Thanks, Renn.",
                    // No nextId, closes dialogue
                }
            ]
        },
        {
            id: 'still_deciding',
            text: "Take your time. This isn't a decision to rush into. The faction's got power and influence, but the archive might hold secrets that could change everything. Whatever you choose, make sure it's what you believe in.",
            options: [
                {
                    text: "I will. Thanks for the advice.",
                    // No nextId, closes dialogue
                }
            ]
        }
    ]
};