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
                    text: "I have found this amulet. Can you tell me anything about it?",
                    nextId: "mistwalker",
                    conditions: [{ type: 'item', itemId: 'mistwalkerAmulet' }],
                    hideWhenUnavailable: true
                },
                {
                    text: "I need help getting into the Fogged Docks.",
                    nextId: "docks_help",
                    conditions: [
                        { type: "questActive", questId: "docksAccess" }
                    ],
                    hideWhenUnavailable: true
                },
                {
                    text: "Can you aid my expedition?",
                    nextId: "expedition",
                    conditions: [{ type: "questActive", questId: "great_crossing" }],
                    hideWhenUnavailable: true
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
                    action: { type: "startQuest", questId: "vrenna_expedition" }
                },
                {
                    text: "I need time to decide.",
                    nextId: null
                }
            ]
        },
        {
            id: "docks_help",
            text: "*She sets aside her work* The Fogged Docks? That's a restricted area. *She studies you carefully* What business do you have there?",
            options: [
                {
                    text: "I have this amulet that might interest you...",
                    nextId: "amulet_show",
                    conditions: [
                        { type: "item", itemId: "mistwalkerAmulet" }
                    ],
                    hideWhenUnavailable: true
                },
                {
                    text: "I can pay for your help.",
                    nextId: "payment_help",
                    conditions: [
                        { type: "item", itemId: "gold", quantity: 50 }
                    ]
                },
                {
                    text: "Never mind.",
                    nextId: null
                }
            ]
        },
        {
            id: "amulet_show",
            text: "*Her eyes widen as she sees the amulet* The Mistwalker Amulet! If its a fake its your own life at risk. The guard wont bother you. But we need to talk about the amulet.",
            options: [
                {
                    text: "Thank you. What do you know about the it?",
                    nextId: "mistwalker",
                    action: [
                        { type: "unlockPOI", mapId: "hollowreach", poiId: "ironspine_to_docks_unlocked" },
                        { type: "hidePOI", mapId: "hollowreach", poiId: "ironspine_to_docks_locked" },
                    ]
                }
            ]
        },
        {
            id: "payment_help",
            text: "*She considers for a moment* 50 gold. I'll write you a pass. The Loomkeepers have certain privileges, after all. The guard wont bother you.",
            options: [
                {
                    text: "Here's your payment.",
                    nextId: null,
                    action: [
                        { type: "removeGold", amount: 50 },
                        { type: "unlockPOI", mapId: "hollowreach", poiId: "ironspine_to_docks_unlocked" },
                        { type: "hidePOI", mapId: "hollowreach", poiId: "ironspine_to_docks_locked" }
                    ]
                },
                {
                    text: "That's too much.",
                    nextId: null
                }
            ]
        }
    ]
};