export default {
    nodes: [
        {
            id: "start",
            text: "Greetings, traveler. The [fog|fog|Unnatural mist that isolates Hollowreach] has made [Hollowreach|hollowreach|Forgotten city of the empire] a lonely place. Do you seek wisdom or aid?",
            options: [
                {
                    text: "Tell me about the [fog|fog|Unnatural mist].",
                    nextId: "fog",
                    conditions: [
                        { type: "skill", stat: "Magic Control", value: 5 }
                    ]
                },
                {
                    text: "Do you have any quests?",
                    nextId: "quest",
                    action: { type: "startQuest", questId: "fogRelic" }
                },
                {
                    text: "Can you give me something?",
                    nextId: "item",
                    conditions: [
                        { type: "item", itemId: "fogCharm" }
                    ]
                },
                {
                    text: "Goodbye.",
                    nextId: null
                }
            ]
        },
        {
            id: "fog",
            text: "The [fog|fog|Appeared when portals closed] appeared when the [portals|portals|Magical gateways of the empire] closed. It’s unnatural, twisting the mind and hiding monsters. A relic in the [Mystic Forest|mysticForest|Ancient, spirit-guarded woods] may dispel it.",
            options: [
                {
                    text: "How do I find this relic?",
                    nextId: "relic",
                    conditions: [
                        { type: "skill", stat: "Dexterity", value: 8 }
                    ]
                },
                {
                    text: "Can you help me fight the monsters?",
                    nextId: "monsters"
                },
                {
                    text: "Goodbye.",
                    nextId: null
                }
            ]
        },
        {
            id: "relic",
            text: "The relic lies deep in the [Mystic Forest|mysticForest|Guarded by spirits]. Seek the glowing shrine, but beware its trials.",
            options: [
                {
                    text: "Thank you for the information.",
                    nextId: null
                },
                {
                    text: "Can you give me something to help?",
                    nextId: "item"
                }
            ]
        },
        {
            id: "monsters",
            text: "I’m too old to fight, but take this charm. It may protect you from the [fog|fog|Twists the mind]’s creatures.",
            options: [
                {
                    text: "Thank you!",
                    nextId: null,
                    action: { type: "giveItem", itemId: "fogCharm" }
                }
            ]
        },
        {
            id: "quest",
            text: "A relic in the [Mystic Forest|mysticForest|Ancient woods] could clear the [fog|fog|Isolates cities]. Will you retrieve it for [Hollowreach|hollowreach|Your home city]?",
            options: [
                {
                    text: "I’ll do it.",
                    nextId: "relic",
                    conditions: [
                        { type: "skill", stat: "Strength", value: 10 }
                    ]
                },
                {
                    text: "Not now.",
                    nextId: null
                }
            ]
        },
        {
            id: "item",
            text: "Here, take this old charm. It might help you in the [fog|fog|Hides monsters].",
            options: [
                {
                    text: "Thank you!",
                    nextId: null,
                    action: { type: "giveItem", itemId: "fogCharm" }
                }
            ]
        }
    ]
};