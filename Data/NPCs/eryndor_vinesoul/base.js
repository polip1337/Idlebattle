export default {
    nodes: [
        {
            id: "start",
            text: "The [fog|fog|Divine mind] speaks, and your [Amulet|amulet|Holy relic] is its voice. Join my [Pulsefinders|pulsefinders|Fog worshippers], or defy the divine?",
            options: [
                {
                    text: "What do the [Pulsefinders|pulsefinders|Cult] believe?",
                    nextId: "pulsefinders"
                },
                {
                    text: "I need a vision from the [Shrine of Whispers|shrine_of_whispers|Cave].",
                    nextId: "quest",
                    action: { type: "startQuest", questId: "pulse_within" },
                    conditions: [{ type: "skill", stat: "Willpower", value: 7 }]
                },
                {
                    text: "Will you support my expedition?",
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
            id: "pulsefinders",
            text: "The [fog|fog|Sentient god] birthed when [portals|portals|False gates] fell. Our implants let us hear its will, guiding [Hollowreach|hollowreach|Lost city] to transcendence.",
            options: [
                {
                    text: "Can the fog guide me?",
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
            text: "In the [Shrine of Whispers|shrine_of_whispers|Neural cave], take an implant to see the [fog|fog|God]’s path. [Loomkeepers|loomkeepers|Weavers] may try to stop you.",
            options: [
                {
                    text: "I'll take the implant.",
                    nextId: null,
                    action: { type: "startQuest", questId: "pulse_within" }
                },
                {
                    text: "I refuse.",
                    nextId: null
                }
            ]
        },
        {
            id: "expedition",
            text: "Your expedition serves the [fog|fog|Divine will]. My [Pulsefinders|pulsefinders|Guides] will join with implants, but you must embrace our visions.",
            options: [
                {
                    text: "Your guides are welcome.",
                    nextId: null,
                    action: { type: "startQuest", questId: "pulsefinder_expedition" }
                },
                {
                    text: "I'll pass.",
                    nextId: null
                }
            ]
        }
    ]
};