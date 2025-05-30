export default {
    nodes: [
        {
            id: "start",
            text: "Welcome to the [Archives|archives|Ancient knowledge repository], traveler. I am the Archivist, keeper of [forbidden lore|forbidden_lore|Dangerous knowledge]. What brings you to these hallowed halls?",
            options: [
                {
                    text: "I seek knowledge about the ancient portals.",
                    nextId: "portals",
                    conditions: [
                        { type: "skill", stat: "intelligence", value: 8 }
                    ]
                },
                {
                    text: "I have this strange artifact...",
                    nextId: "artifact",
                    conditions: [
                        { type: "item", itemId: "mysteriousRelic" }
                    ],
                    hideWhenUnavailable: true
                },
                {
                    text: "I'm here about the missing scrolls.",
                    nextId: "scrolls",
                    conditions: [
                        { type: "questActive", questId: "missing_scrolls" }
                    ],
                    hideWhenUnavailable: true
                },
                {
                    text: "I'd like to browse your collection.",
                    nextId: "collection",
                    action: [
                        { type: "setGameState", stateType: "npcKnowledge", npcId: "archivist", key: "showedCollection", value: true }
                    ]
                },
                {
                    text: "Goodbye.",
                    nextId: null
                }
            ]
        },
        {
            id: "portals",
            text: "The [portals|portals|Dimensional gateways]? *adjusts spectacles* That's advanced knowledge. I can share what I know, but it will cost you. 100 gold pieces for the basic information.",
            options: [
                {
                    text: "I'll pay for the information.",
                    nextId: "portals_paid",
                    conditions: [
                        { type: "item", itemId: "gold", quantity: 100 }
                    ],
                    action: [
                        { type: "removeGold", amount: 100 },
                        { type: "addItem", itemId: "portalNotes", quantity: 1 }
                    ]
                },
                {
                    text: "That's too expensive.",
                    nextId: "portals_expensive"
                }
            ]
        },
        {
            id: "portals_paid",
            text: "Excellent. *hands you a bundle of notes* These contain the basic portal sequences. But beware - the [fog|fog|Dimensional mist] has corrupted many of them. You'll need to verify each one.",
            options: [
                {
                    text: "Thank you. I'll be careful.",
                    nextId: null,
                    action: [
                        { type: "startQuest", questId: "portal_research" }
                    ]
                }
            ]
        },
        {
            id: "artifact",
            text: "*examines the relic carefully* This is... remarkable. A genuine [Elder Sign|elder_sign|Ancient symbol of power]. I must study it further. Would you be willing to leave it with me?",
            options: [
                {
                    text: "I'll leave it with you for study.",
                    nextId: "artifact_study",
                    action: [
                        { type: "removeItem", itemId: "mysteriousRelic", quantity: 1 },
                        { type: "setGameState", stateType: "npcKnowledge", npcId: "archivist", key: "hasRelic", value: true }
                    ]
                },
                {
                    text: "I need to keep it with me.",
                    nextId: "artifact_keep"
                }
            ]
        },
        {
            id: "scrolls",
            text: "Ah yes, the missing scrolls. They were last seen in the [Restricted Section|restricted_section|Forbidden area]. I can grant you access, but you'll need to prove your worth first.",
            options: [
                {
                    text: "How can I prove myself?",
                    nextId: "scrolls_proof",
                    action: [
                        { type: "startQuest", questId: "archivist_trial" }
                    ]
                },
                {
                    text: "I'll find another way.",
                    nextId: null
                }
            ]
        },
        {
            id: "collection",
            text: "Of course! *leads you to a large bookshelf* Our collection is organized by era. The [Ancient Era|ancient_era|First age] section is particularly fascinating, though some volumes are... unstable.",
            options: [
                {
                    text: "Show me the Ancient Era section.",
                    nextId: "ancient_section",
                    action: [
                        { type: "startSlideshow", slideshowId: "ancient_books", resumeDialogue: true, npcId: "archivist", dialogueId: "base" }
                    ]
                },
                {
                    text: "I should go.",
                    nextId: null
                }
            ]
        }
    ]
}; 