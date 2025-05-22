export default {
    nodes: [
        {
            id: "start",
            text: "*Vrenna looks up from an ancient tapestry, her fingers still tracing its patterns* Welcome to the [Threadhall|threadhall|The Loomkeepers' sanctum, where ancient knowledge is preserved in thread and weave]. I am Vrenna Stoneweave, and if you've found your way here, you must be seeking knowledge. Or perhaps... you've found some yourself?",
            options: [
                {
                    text: "I'm interested in the Loomkeepers' work.",
                    nextId: "loomkeepers_intro"
                },
                {
                    text: "I found something that might interest you.",
                    nextId: "artifact_inquiry"
                },
                {
                    text: "I'm just looking around.",
                    nextId: "casual_visit"
                }
            ]
        },
        {
            id: "loomkeepers_intro",
            text: "*She carefully sets aside the tapestry* The Loomkeepers preserve the old ways, the forgotten knowledge. Each thread, each pattern tells a story of the world before the fog. *Her eyes light up with scholarly passion* We've discovered that the ancient weaves hold more than just stories - they contain power, knowledge that might help us understand what happened to our world.",
            options: [
                {
                    text: "How can I help preserve this knowledge?",
                    nextId: "quest_offer",
                    conditions: [
                        { type: "questActive", questId: "proofForTheWeave", negate: true },
                        { type: "questCompleted", questId: "proofForTheWeave", negate: true }
                    ],
                    hideWhenUnavailable: true
                },
                {
                    text: "That's fascinating, but I should go.",
                    nextId: null
                }
            ]
        },
        {
            id: "artifact_inquiry",
            text: "*She leans forward, her interest clearly piqued* You've found something? *She gestures to the tapestries around her* We're always seeking fragments of the old world. Artifacts, especially those with patterns or weaves, can tell us much about what happened when the fog came. What have you discovered?",
            options: [
                {
                    text: "I found a tapestry fragment in the sewers.",
                    nextId: "quest_offer",
                    conditions: [
                        { type: "questActive", questId: "proofForTheWeave", negate: true },
                        { type: "questCompleted", questId: "proofForTheWeave", negate: true }
                    ],
                    hideWhenUnavailable: true
                },
                {
                    text: "Nothing specific yet, but I'll keep an eye out.",
                    nextId: null
                }
            ]
        },
        {
            id: "quest_offer",
            text: "*Her eyes narrow with focused interest* A tapestry fragment in the sewers? That's... unexpected. The scavengers have been more active lately, taking what they can find. *She stands, her robes rustling* If you could recover that fragment for us, we could learn much from its patterns. The [Scavenger Redoubt|scavengerRedoubt|Where the scavengers hoard their finds] would be the place to look. Will you help us recover this piece of history?",
            options: [
                {
                    text: "I'll help recover the fragment.",
                    action: [
                        { type: "startQuest", questId: "proofForTheWeave" },
                        {
                            type: "unlockPOI",
                            mapId: "hollowreach",
                            poiId: "scavengerRedoubt"
                        }
                    ]
                },
                {
                    text: "I need to think about it.",
                    nextId: null
                }
            ]
        },
        {
            id: "casual_visit",
            text: "*She nods, returning to her work* The [Threadhall|threadhall|Our repository of knowledge] is open to all who seek understanding. The tapestries tell stories of the old world, of the time before the fog. *She looks up briefly* If you find anything that might help us understand our past, or perhaps our future, do bring it to us. Knowledge is our greatest weapon against the unknown.",
            options: [
                {
                    text: "I'll keep that in mind.",
                    nextId: null
                }
            ]
        }
    ]
}; 