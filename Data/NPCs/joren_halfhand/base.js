export default {
    nodes: [
        {
            id: "start",
            text: "Keep your distance. The [fog|fog|Corrupts tech]’s bad enough without spies. What do you want with my [Driftkin|driftkin|Barge folk]?",
            options: [
                {
                    text: "What’s your role here?",
                    nextId: "role"
                },
                {
                    text: "I need help with a wrecked barge.",
                    nextId: "quest",
                    action: { type: "startQuest", questId: "moors_lament" },
                    conditions: [{ type: "skill", stat: "Engineering", value: 6 }]
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
            id: "role",
            text: "I fix driftbarges, keep ‘em floating despite the [fog|fog|Ruins machines]. [portals|portals|Old tech]’ shards are my life, but they’re cursed.",
            options: [
                {
                    text: "Can you fix a barge wreck?",
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
            text: "The [Starbarge Wreck|starbarge_wreck|Leaking ruin]’s core is drawing [fog|fog|Spawns drones] beasts. Disable it, but [Pulsefinders|pulsefinders|Cultists] want it too.",
            options: [
                {
                    text: "I’ll handle it.",
                    nextId: null,
                    action: { type: "startQuest", questId: "moors_lament" }
                },
                {
                    text: "Not my problem.",
                    nextId: null
                }
            ]
        },
        {
            id: "expedition",
            text: "Your expedition’s doomed without my tech. I’ll rig barges for the [fog|fog|Deadly paths], but no [Pulsefinders|pulsefinders|Mad cult] near my work.",
            options: [
                {
                    text: "Your skills are needed.",
                    nextId: null,
                    action: { type: "factionSupport", faction: "driftkin", resource: "barge_tech" }
                },
                {
                    text: "I’ll think it over.",
                    nextId: null
                }
            ]
        }
    ]
};