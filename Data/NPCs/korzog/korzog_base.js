export default {
    nodes: [
        {
            id: "start",
            text: "*Korzog's massive form looms in the shadows of the [Ashen Archive|ashenArchive|An ancient repository of forbidden knowledge]. His eyes, glowing with an unnatural light, study you intently* So. You've found your way here. And you carry something... interesting. The amulet. *He gestures to the Mistwalker Amulet* I've been expecting you.",
            options: [
                {
                    text: "You know about the amulet?",
                    nextId: "amulet_knowledge",
                    conditions: [
                        { type: "hasItem", itemId: "mistwalkerAmulet" }
                    ],
                    hideWhenUnavailable: true
                },
                {
                    text: "I'm looking for information about the fog.",
                    nextId: "fog_inquiry"
                },
                {
                    text: "I should go.",
                    nextId: null
                }
            ]
        },
        {
            id: "amulet_knowledge",
            text: "*A deep, rumbling laugh echoes through the chamber* Know about it? I helped create it. The Mistwalker Amulet was meant to be a key - a way to understand the fog, to control it. *His voice grows serious* But something went wrong. The fog... it changed. Adapted. The amulet became something else. Something dangerous.",
            options: [
                {
                    text: "What do you mean, dangerous?",
                    nextId: "amulet_warning"
                },
                {
                    text: "How can I use it safely?",
                    nextId: "amulet_guidance"
                }
            ]
        },
        {
            id: "amulet_warning",
            text: "*Korzog's eyes flare brighter* The amulet doesn't just let you navigate the fog - it connects you to it. The more you use it, the more it changes you. The Driftkin understand this, in their way. The Loomkeepers seek to study it. The Emberclad fear it. *He leans forward* But none of them understand its true purpose.",
            options: [
                {
                    text: "What is its true purpose?",
                    nextId: "amulet_purpose"
                },
                {
                    text: "I need to think about this.",
                    nextId: null
                }
            ]
        },
        {
            id: "amulet_purpose",
            text: "*Korzog's voice drops to a whisper* The amulet was meant to be a bridge. A way to communicate with the fog, to understand its nature. But the fog... it's not just a force of nature. It's a consciousness. And it's learning. Adapting. *Their eyes glow with intensity* The amulet is changing too. Becoming something new. Something powerful.",
            options: [
                {
                    text: "What should I do?",
                    nextId: "understanding_quest"
                },
                {
                    text: "This is too dangerous.",
                    nextId: null
                }
            ]
        },
        {
            id: "amulet_guidance",
            text: "*He shakes his massive head* There is no safe way. Only different degrees of risk. The amulet is a tool, yes, but it's also a burden. A responsibility. *His voice grows softer* If you must use it, do so sparingly. And be prepared for the consequences.",
            options: [
                {
                    text: "What consequences?",
                    nextId: "consequences"
                },
                {
                    text: "I understand. Thank you.",
                    nextId: null
                }
            ]
        },
        {
            id: "consequences",
            text: "*Korzog's eyes flare with intensity* The amulet changes those who use it. The more you understand the fog, the more it understands you. *They gesture to the ancient tomes* Some who used it too much... they became something else. Something that could see through the fog, but couldn't see themselves anymore.",
            options: [
                {
                    text: "That's... unsettling.",
                    nextId: "understanding_quest"
                },
                {
                    text: "I need to think about this.",
                    nextId: null
                }
            ]
        },
        {
            id: "fog_inquiry",
            text: "*Korzog's expression darkens* The fog is not what it seems. It's not just a force of nature, not just a curse. It's... alive. In its way. And it's growing stronger. More intelligent. *He gestures to the ancient tomes around him* The answers you seek are here, in the [Ashen Archive|ashenArchive|Where forbidden knowledge is kept]. But knowledge comes with a price.",
            options: [
                {
                    text: "What price?",
                    nextId: "knowledge_price"
                },
                {
                    text: "Maybe I don't want to know.",
                    nextId: null
                }
            ]
        },
        {
            id: "knowledge_price",
            text: "*His eyes narrow* Understanding changes you. Once you see the truth about the fog, about the amulet, about what happened to our world... you can't unsee it. *He stands, his form casting a long shadow* The choice is yours. But remember - ignorance is not always bliss. Sometimes it's just a slower form of death.",
            options: [
                {
                    text: "I want to understand.",
                    nextId: "understanding_quest"
                },
                {
                    text: "I need time to think.",
                    nextId: null
                }
            ]
        },
        {
            id: "understanding_quest",
            text: "*Korzog nods slowly* Then you'll need to prove yourself. The [Rune Chamber|runeChamber|Where the ancient secrets are kept] holds the key to understanding the amulet's true nature. But be warned - the path is not for the faint of heart. The fog will test you. The amulet will change you. Are you ready for that?",
            options: [
                {
                    text: "I'm ready.",
                    action: [
                        { type: "startQuest", questId: "mistwalkerSecret" },
                        {
                            type: "unlockPOI",
                            mapId: "ashenArchive",
                            poiId: "runeChamber"
                        }
                    ]
                },
                {
                    text: "I need to prepare first.",
                    nextId: null
                }
            ]
        }
    ]
}; 