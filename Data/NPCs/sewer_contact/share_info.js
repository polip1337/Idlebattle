export default {
    nodes: [
        {
            id: "start",
            text: "The figure slinks from the shadows, their cloak like a shroud over the sewer’s damp stone. 'You brought me the Bone Whisper, wanderer. Its hum still lingers in my bones.' Their voice is a low rasp, eyes glinting like grave-lights beneath the hood. 'The shadows owe you answers. Ask your questions—what stirs the scavengers? What hides in the fog?",
            options: [
                {
                    text: "What are the scavengers up to now?",
                    nextId: "scavenger_scheme"
                },
                {
                    text: "What’s the truth about the fog?",
                    nextId: "fog_revelation"
                },
                {
                    text: "Tell me about the tapestry the scavengers stole.",
                    nextId: "tapestry_hint",
                    conditions: [
                        { type: "questActive", questId: "proofForTheWeave" }
                    ],
                    hideWhenUnavailable: true
                }
            ]
        },
        {
            id: "scavenger_scheme",
            text: "The figure’s gloved fingers curl, as if clutching unseen threads. 'The scavengers skulk in their [Scavenger Redoubt|scavengerRedoubt|That festering den], hoarding relics from the deep. Their Fogscar leader’s got a new prize—something old, its runes glowing like a dying star.' Their voice drops, a hiss. 'They think they’ll bend the fog to it. The dead laugh at such arrogance.'",
            options: [
                {
                    text: "What else can you tell me?",
                    nextId: "start"
                },
                {
                    text: "That’s enough for now.",
                    nextId: null
                }
            ]
        },
        {
            id: "fog_revelation",
            text: "The figure’s voice falls to a whisper, like water seeping through a crypt. 'The fog lives, wanderer. It sees you, weighs your soul, twists your path.' Their cloak stirs, as if the mist itself listens. 'Born when the Old Empire’s portals cracked, it’s no mere veil—it’s a mind, hungry and ancient. What does it whisper when you sleep?'",
            options: [
                {
                    text: "That’s chilling. What else do you know?",
                    nextId: "start"
                },
                {
                    text: "I’ve heard enough.",
                    nextId: null
                }
            ]
        },
        {
            id: "tapestry_hint",
            text: "The figure’s chuckle is a dry rattle, like bones in a forgotten crypt. 'That fragment? The scavengers stashed it in a [Scavenger Cache|scavengerCache|A hidden nook for their stolen weaves], deep in these sewers.' They point to a mist-clogged tunnel, their glove dark with stains. 'A gift for your service—the shadows guide you there. But beware the fog’s tricks.'",
            options: [
                {
                    text: "Point me to it.",
                    nextId: "weave_cache_guide",
                    action: [
                        { type: "unlockPOI", mapId: "rustmarketSewers", poiId: "sewer_scavenger_cache_POI" }
                    ]
                }
            ]
        },
        {
            id: "weave_cache_guide",
            text: "The figure’s hood dips, a flicker of approval in their gaze. 'The [Weave Cache|weaveCache|Where the scavengers hoard their loot] lies through that passage.' Their voice softens, reverent as a dirge. 'Claim that fragment, wanderer. The dead are keen to see what you weave with it.'",
            options: [
                {
                    text: "I’ll find it.",
                    nextId: null
                }
            ]
        }
    ]
};