export default {
    nodes: [
        {
            id: "start",
            text: "*The air around Lyra shimmers with heat as she tends to a small flame in her palm* Welcome to [Cinderhold|cinderhold|The Emberclad's stronghold, where fire keeps the fog at bay]. I'm Lyra Emberkin, and if you're here, you either seek our protection or our knowledge. Which is it?",
            options: [
                {
                    text: "I've heard the Emberclad can control fire.",
                    nextId: "fire_control"
                },
                {
                    text: "I need help against the fog.",
                    nextId: "fog_threat"
                },
                {
                    text: "I'm just passing through.",
                    nextId: "passing_through"
                }
            ]
        },
        {
            id: "fire_control",
            text: "*The flame in her hand grows larger, casting dancing shadows* Control? No. We don't control fire - we dance with it. The fog fears our flames, but respect is a two-way street. *She extinguishes the flame with a snap of her fingers* If you want to learn our ways, you'll need to prove yourself. The [Scorchveil Pit|scorchveilPit|Where Emberclad initiates face their trials] awaits those who seek the flame.",
            options: [
                {
                    text: "I want to learn your ways.",
                    nextId: "initiation",
                    conditions: [
                        { type: "questActive", questId: "embercladsTrial", negate: true },
                        { type: "questCompleted", questId: "embercladsTrial", negate: true }
                    ],
                    hideWhenUnavailable: true
                },
                {
                    text: "Maybe another time.",
                    nextId: null
                }
            ]
        },
        {
            id: "fog_threat",
            text: "*Her expression darkens* The fog grows stronger every day. It's not just corrupting the land anymore - it's changing, adapting. Our flames... they're not as effective as they once were. *She looks you up and down* You seem capable. Perhaps you could help us strengthen our rituals. The [Scorchveil Pit|scorchveilPit|Where we test our mettle against the fog] could use someone like you.",
            options: [
                {
                    text: "I'll help strengthen your rituals.",
                    nextId: "initiation",
                    conditions: [
                        { type: "questActive", questId: "embercladsTrial", negate: true },
                        { type: "questCompleted", questId: "embercladsTrial", negate: true }
                    ],
                    hideWhenUnavailable: true
                },
                {
                    text: "I need to think about it.",
                    nextId: null
                }
            ]
        },
        {
            id: "initiation",
            text: "*She nods, a small smile playing on her lips* Good. The [Scorchveil Pit|scorchveilPit|Our sacred testing ground] will be your first trial. You'll help us perform a fog-burning ritual, protect it from the corrupted constructs that lurk in the mist. *She hands you a small, glowing ember* Keep this with you. It will guide you to the ritual site.",
            options: [
                {
                    text: "I'm ready to begin.",
                    action: [
                        { type: "startQuest", questId: "embercladsTrial" },
                        { type: "addItem", itemId: "emberclad_ember" },
                        {
                            type: "unlockPOI",
                            mapId: "cinderhold",
                            poiId: "scorchveilPit"
                        }
                    ]
                },
                {
                    text: "I need to prepare first.",
                    nextId: null
                }
            ]
        },
        {
            id: "passing_through",
            text: "*She raises an eyebrow* Just passing through? In these times? *She shakes her head* Well, you're welcome to rest here. The fog doesn't dare touch [Cinderhold|cinderhold|Our flame-protected haven]. But remember - when the fog comes for you, and it will, our flames will be here. If you're willing to earn them.",
            options: [
                {
                    text: "Maybe I should stay a while.",
                    nextId: "fire_control"
                },
                {
                    text: "I'll keep that in mind.",
                    nextId: null
                }
            ]
        }
    ]
}; 