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
                    text: "I have found this amulet.Can you tell me anything about it?",
                    nextId: "mistwalker",
                    conditions: [{ type: 'item', item: 'mistwalkerAmulet' }]
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
            text: "We preserve [Hollowreach|hollowreach|Isolated city]'s history in threads. Our tapestries map the [fog|fog|Hides portals], but the [portals|portals|Lost gateways]' collapse eludes us.",
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
            id: "mistwalker",
            text: "The Mistwalker Amulet... *leans forward, eyes narrowing* I've heard tales of such artifacts. They supposedly work only on the first person that touches them. If you wish to prove its genuine, I have a task that would serve us both.",
            options: [
                {
                    text: "What task do you have in mind?",
                    action: [
                        { type: "startQuest", questId: "proofForTheWeave" },
                        {type: "openDialogue", npcId: "vrenna_stoneweave", dialogueId: "proof_for_weave"}
                    ] 
                    
                },
                {
                    text: "I'll consider it later.",
                    nextId: null
                }
            ]
        },
        {
            id: "quest",
            text: "A scroll in the [Ashen Archive|ashen_archive|Fog-bound ruin] holds a portal sequence. Retrieve it, but beware the [Driftkin|driftkin|Fog nomads] who claim it.",
            options: [
                {
                    text: "I'll find it.",
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
            text: "Your expedition could map the [fog|fog|Twists paths]. I'll weave a tapestry for safe routes, but only if you share your [Amulet|amulet|Fog-parting relic]'s secrets.",
            options: [
                {
                    text: "I'll share the Amulet's data.",
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