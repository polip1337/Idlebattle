export default {
    nodes: [
        {
            id: "start",
            text: "H-hey! You startled me! I’m Elrin Loomsong, weaver for the [Loomkeepers|loomkeepers|Tapestry scribes]. Vrenna Stoneweave—she, uh, she said you’re looking for companions? For a journey? I-I’m not much for heroics, but my weaves, they can… they can map the fog’s secrets. So, um, why’re you here? Need my skills, or just… passing by?",
            options: [
                {
                    text: "Who are the Loomkeepers?",
                    nextId: "loomkeepers"
                },
                {
                    text: "Vrenna says you can help with my quest. Will you come along?",
                    nextId: "join_quest",
                    conditions: [{ type: "questActive", questId: "great_crossing" }]
                },
                {
                    text: "What do your tapestries do?",
                    nextId: "tapestry_skills"
                },
                {
                    text: "What’s the deal with the fog?",
                    nextId: "fog_lore"
                },
                {
                    text: "Just poking around. See ya.",
                    nextId: null
                }
            ]
        },
        {
            id: "loomkeepers",
            text: "Th-the [Loomkeepers|loomkeepers|Artisan scribes]? Oh, we’re, uh, we’re keepers of history! We weave [portals|portals|Lost tech] secrets and the Old Empire’s collapse into tapestries. In the [Threadhall|threadhall|Weaver’s sanctum], our maps—they shift with the fog! Record truths no parchment can hold. Vrenna, she’s our matriarch, says we preserve, don’t meddle. B-but I’m… I’m curious about the fog’s secrets. You… you here to chase those, or something else?",
            options: [
                {
                    text: "That’s amazing. Will you join my expedition?",
                    nextId: "join_quest",
                    conditions: [{ type: "questActive", questId: "great_crossing" }]
                },
                {
                    text: "How do your tapestries work?",
                    nextId: "tapestry_skills"
                },
                {
                    text: "What’s your history with the fog?",
                    nextId: "fog_lore"
                },
                {
                    text: "Sounds wild, but I’m outta here.",
                    nextId: null
                }
            ]
        },
        {
            id: "tapestry_skills",
            text: "M-my tapestries? They’re… they’re not just thread! I use [portal|portals|Old tech] fragments, fog-touched dyes—they map the [fog|fog|Living storm]’s currents. Stuff even [Driftkin|driftkin|Fog nomads] can’t follow! Some show hidden ruins, like [Fogscar Vault|fogscar_vault|Buried ruin]. Others… they twitch when [Pulsefinders|pulsefinders|Fog cult] get close. I-I’m no fighter, but my weaves can guide us. You… you want that, or something specific?",
            options: [
                {
                    text: "That’s perfect. Join my expedition?",
                    nextId: "join_quest",
                    conditions: [{ type: "questActive", questId: "great_crossing" }]
                },
                {
                    text: "Can you weave something to track a portal shard?",
                    nextId: "shard_weave"
                },
                {
                    text: "How do you deal with the fog’s dangers?",
                    nextId: "fog_lore"
                },
                {
                    text: "Gotta go. Thanks anyway.",
                    nextId: null
                }
            ]
        },
        {
            id: "shard_weave",
            text: "A p-portal shard? Oh, that’s… that’s tough! But, uh, I can try. My tapestries can sense [portals|portals|Gate tech]—their hum makes the threads glow. Could point to [Vortex Reach|vortex_reach|Maelstrom] or [Fogscar Vault|fogscar_vault|Old ruin]. But the fog—it’s… it’s dangerous, and my weaves aren’t perfect. If I came along, I’d need time to craft it. W-why do you need a shard? Power? Knowledge? Something… personal?",
            options: [
                {
                    text: "I need your weaves. Join my expedition.",
                    nextId: "join_quest",
                    conditions: [{ type: "questActive", questId: "great_crossing" }]
                },
                {
                    text: "What kind of dangers are we talking about?",
                    nextId: "fog_lore"
                },
                {
                    text: "Need to think about it. Bye for now.",
                    nextId: null
                }
            ]
        },
        {
            id: "fog_lore",
            text: "Th-the fog? It’s… it’s a nightmare! Twists time, warps flesh, hides [portals|portals|Ancient gates] in its depths. My tapestries—they hint it’s tied to the Old Empire’s fall. Maybe [portals|portals|Gate tech] broke somehow. [Emberclad|emberclad|Fire zealots] call it a curse, [Pulsefinders|pulsefinders|Fog cult] worship it. Me? I-I think it’s alive. My weaves track it, but… only so much. You… you planning to fight it, or just poking around?",
            options: [
                {
                    text: "I need your skills to face it. Join my expedition?",
                    nextId: "join_quest",
                    conditions: [{ type: "questActive", questId: "great_crossing" }]
                },
                {
                    text: "Can your tapestries find a portal shard?",
                    nextId: "shard_weave"
                },
                {
                    text: "That’s enough for now. I’m out.",
                    nextId: null
                }
            ]
        },
        {
            id: "join_quest",
            text: "V-Vrenna thinks I should join your [great_crossing|great_crossing|Big trek]? Oh, wow, okay… I-I’m good with threads, and my tapestries can light the way through the [fog|fog|Living storm]. But, uh, I’m no fighter! I’d need someone to handle [Pulsefinders|pulsefinders|Fog cult] or… or worse. I’ll bring my loom, my knowledge, but you—you lead, alright? Deal, or… or you need time to decide?",
            options: [
                {
                    text: "Deal. You’re in!",
                    nextId: null,
                    action: { type: "startQuest", questId: "elrin_companion" }
                },
                {
                    text: "Gimme some time to think. I’ll be back.",
                    nextId: null
                }
            ]
        }
    ]
};