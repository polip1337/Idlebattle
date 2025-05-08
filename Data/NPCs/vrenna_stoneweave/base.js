export default {
    nodes: [
        {
            id: "start",
            text: "The [fog|fog|Unnatural mist] hides our past, traveler. My [Loomkeepers|loomkeepers|Artisan collective] weave its secrets into tapestries. Do you bring hope or chaos?",
            options: [
                {
                    text: "Tell me about the loomkeepers.",
                    nextId: "loomkeepers"
                },
                {
                    text: "I seek a portal sequence. Can you help?",
                    nextId: "quest",
                    action: { type: "startQuest", questId: "lost_pattern" },
                    conditions: [{ type: "skill", stat: "Intelligence", value: 6 }]
                },
                {
                    text: "Can you aid my expedition?",
                    nextId: "expedition",
                    conditions: [{ type: "questActive", questId: "great_crossing" }]
                },
                {
                    text: "Goodbye.",
                    nextId: null
                }
            ]
        },
        {
            id: "loomkeepers",
            text: "We preserve [Hollowreach|hollowreach|Isolated city]’s history in threads. Our tapestries map the [fog|fog|Hides portals], but the [portals|portals|Lost gateways]’ collapse eludes us.",
            options: [
                {
                    text: "How can I help your work?",
                    nextId: "quest"
                },
                {
                    text: "Goodbye.",
                    nextId: null
                }
            ]
        },
        {
            id: "quest",
            text: "A scroll in the [Ashen Archive|ashen_archive|Fog-bound ruin] holds a portal sequence. Retrieve it, but beware the [Driftkin|driftkin|Fog nomads] who claim it.",
            options: [
                {
                    text: "I’ll find it.",
                    nextId: null,
                    action: { type: "startQuest", questId: "goblinSlayer" }
                },
                {
                    text: "Not now.",
                    nextId: null
                }
            ]
        },
        {
            id: "expedition",
            text: "Your expedition could map the [fog|fog|Twists paths]. I’ll weave a tapestry for safe routes, but only if you share your [Amulet|amulet|Fog-parting relic]’s secrets.",
            options: [
                {
                    text: "I’ll share the Amulet’s data.",
                    nextId: null,
                    action: { type: "factionSupport", faction: "loomkeepers", resource: "tapestry_map" }
                },
                {
                    text: "I need time to decide.",
                    nextId: null
                }
            ]
        }
    ]
};