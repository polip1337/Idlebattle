export default {
    nodes: [
        {
            id: "start",
            text: "The [fog|fog|Living storm]’s my home, stranger. My [Driftkin|driftkin|Fog nomads] ride its currents. You got something worth my time?",
            options: [
                {
                    text: "Tell me about the [Driftkin|driftkin|Nomads].",
                    nextId: "driftkin"
                },
                {
                    text: "I need a portal shard from [Vortex Reach|vortex_reach|Maelstrom].",
                    nextId: "quest",
                    action: { type: "startQuest", questId: "barge_over_the_brink" },
                    conditions: [{ type: "skill", stat: "Agility", value: 8 }]
                },
                {
                    text: "Will you join my expedition?",
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
            id: "driftkin",
            text: "We live on driftbarges, scavenging [portals|portals|Lost tech]’ shards. The [fog|fog|Twists flesh] changes us, but it’s freedom. Hollowreach fears us for it.",
            options: [
                {
                    text: "Can you help me navigate the fog?",
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
            text: "A portal shard lies in [Vortex Reach|vortex_reach|Fog maelstrom]. Pilot my barge to get it, but watch for [Pulsefinders|pulsefinders|Fog cult] meddling.",
            options: [
                {
                    text: "I’m in.",
                    nextId: null,
                    action: { type: "startQuest", questId: "barge_over_the_brink" }
                },
                {
                    text: "Too risky.",
                    nextId: null
                }
            ]
        },
        {
            id: "expedition",
            text: "Your expedition needs my barges to cross the [fog|fog|Deadly mist]. I’ll lead, but we detour for [portals|portals|Tech] if I say so.",
            options: [
                {
                    text: "Your barges are welcome.",
                    nextId: null,
                    action: { type: "factionSupport", faction: "driftkin", resource: "driftbarges" }
                },
                {
                    text: "I’ll pass.",
                    nextId: null
                }
            ]
        }
    ]
};