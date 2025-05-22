export default {
    nodes: [
        {
            id: "start",
            text: "*A shadow detaches itself from the wall of the [Rustmarket Sewers|rustmarketSewers|The labyrinthine tunnels beneath the bazaar]. A figure in a tattered cloak, face hidden in darkness* You're not one of the usual rats down here. What brings you to my corner of the sewers?",
            options: [
                {
                    text: "I'm looking for information.",
                    nextId: "information_trade"
                },
                {
                    text: "I'm just exploring.",
                    nextId: "exploration_warning"
                },
                {
                    text: "I should go.",
                    nextId: null
                }
            ]
        },
        {
            id: "information_trade",
            text: "*A dry chuckle echoes from beneath the hood* Information? That's my trade. But nothing comes free in [Hollowreach|hollowreach|The city isolated by portal collapse]. What do you want to know? The scavengers' movements? The latest artifacts found? The secrets of the fog? *The figure shifts slightly* Or perhaps... something more specific?",
            options: [
                {
                    text: "Tell me about the scavengers.",
                    nextId: "scavenger_info"
                },
                {
                    text: "What do you know about the fog?",
                    nextId: "fog_secrets"
                },
                {
                    text: "I'm looking for something specific.",
                    nextId: "specific_inquiry"
                }
            ]
        },
        {
            id: "scavenger_info",
            text: "*The figure leans against the wall* The scavengers... they're getting bolder. Taking more risks. They've found something in the [Scavenger Redoubt|scavengerRedoubt|Their hidden base]. Something old. Something powerful. *A gloved hand extends* If you want more details, it'll cost you. Information is a valuable commodity these days.",
            options: [
                {
                    text: "What's the price?",
                    nextId: "price_negotiation"
                },
                {
                    text: "Maybe another time.",
                    nextId: null
                }
            ]
        },
        {
            id: "fog_secrets",
            text: "*The figure's voice grows quieter* The fog... it's not just a curse. It's a presence. It watches. It learns. *A shiver seems to run through the cloaked form* The scavengers have found ways to use it. The Driftkin worship it. The Emberclad fight it. But none of them understand it. Not really.",
            options: [
                {
                    text: "What do you know about the Mistwalker Amulet?",
                    nextId: "amulet_knowledge",
                    conditions: [
                        { type: "questActive", questId: "mistwalkerSecret" }
                    ],
                    hideWhenUnavailable: true
                },
                {
                    text: "That's... unsettling.",
                    nextId: null
                }
            ]
        },
        {
            id: "amulet_knowledge",
            text: "*The figure's voice drops to a whisper* The Mistwalker Amulet... *they look around nervously* It's not just a tool for navigating the fog. It's a key. A way to understand the fog's true nature. *They lean closer* The scavengers have been searching for it. The Driftkin want to study it. The Emberclad fear it. But Korzog... Korzog knows its true purpose.",
            options: [
                {
                    text: "Where can I find Korzog?",
                    nextId: "korzog_location"
                },
                {
                    text: "This is too dangerous.",
                    nextId: null
                }
            ]
        },
        {
            id: "korzog_location",
            text: "*The figure points upward* The [Ashen Archive|ashenArchive|Where forbidden knowledge is kept]. That's where you'll find Korzog. But be careful - the Archive is not a place for the unprepared. The knowledge there... it changes people.",
            options: [
                {
                    text: "I understand. Thank you.",
                    nextId: null
                }
            ]
        },
        {
            id: "specific_inquiry",
            text: "*The figure straightens, interest evident in their posture* Something specific? Now that's interesting. *They take a step closer* Tell me what you're looking for. Maybe I can help. For the right price, of course.",
            options: [
                {
                    text: "I'm looking for a tapestry fragment.",
                    nextId: "tapestry_info",
                    conditions: [
                        { type: "questActive", questId: "proofForTheWeave" }
                    ],
                    hideWhenUnavailable: true
                },
                {
                    text: "Never mind.",
                    nextId: null
                }
            ]
        },
        {
            id: "tapestry_info",
            text: "*The figure's voice drops to a whisper* The Loomkeeper fragment? *They look around nervously* The scavengers have it. They're using it to map the fog patterns. *A gloved hand extends* For the right price, I can tell you exactly where to find them.",
            options: [
                {
                    text: "What's the price?",
                    nextId: "price_negotiation"
                },
                {
                    text: "I'll find them myself.",
                    nextId: null
                }
            ]
        },
        {
            id: "exploration_warning",
            text: "*The figure's voice takes on a warning tone* Exploring the sewers? Be careful. The fog seeps in through the cracks. The scavengers lurk in the shadows. And there are... other things. Things that don't belong in this world. *They gesture to a nearby tunnel* If you need a guide, or information, you know where to find me.",
            options: [
                {
                    text: "Maybe I do need information.",
                    nextId: "information_trade"
                },
                {
                    text: "I'll be careful.",
                    nextId: null
                }
            ]
        },
        {
            id: "price_negotiation",
            text: "*The figure's hand remains extended* Gold is always welcome. But sometimes... sometimes I trade in favors. Information for information. A helping hand when needed. *The hood tilts slightly* What are you offering?",
            options: [
                {
                    text: "I can pay in gold.",
                    nextId: "gold_payment"
                },
                {
                    text: "What kind of favor?",
                    nextId: "favor_details"
                }
            ]
        },
        {
            id: "gold_payment",
            text: "*The figure's posture straightens with interest* Gold speaks clearly. 100 pieces for the information you seek. *They extend a gloved hand* Payment first, then the details.",
            options: [
                {
                    text: "Here's the gold.",
                    nextId: null,
                    action: [
                        { type: "removeItem", itemId: "gold", quantity: 100 },
                        { type: "unlockPOI", mapId: "rustmarketSewers", poiId: "sewer_scavengerRedoubt_POI" }
                    ]
                },
                {
                    text: "That's too much.",
                    nextId: null
                }
            ]
        },
        {
            id: "start",
            text: "What brings you to the sewers?",
            options: [
                {
                    text: "Goodbye.",
                    nextId: null
                }
            ]
        }
    ]
}; 