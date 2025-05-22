export default {
    nodes: [
        {
            id: "start",
            text: "Well, well, look who’s stumbled into the [fog|fog|Living storm]. I’m Sylvara Tidewalker, born to ride its currents with my [Driftkin|driftkin|Fog nomads]. This ain’t a place for soft feet, stranger. Got something worth my time, or you just lost in the haze?",
            options: [
                {
                    text: "Tell me about the Driftkin.",
                    nextId: "driftkin"
                },
                {
                    text: "I need a portal shard from [Vortex Reach|vortex_reach|Maelstrom].",
                    nextId: "shard_ask",
                    conditions: [{ type: "skill", stat: "Agility", value: 8 }]
                },
                {
                    text: "Will you join my expedition?",
                    nextId: "expedition",
                    conditions: [{ type: "questActive", questId: "great_crossing" }]
                },
                {
                    text: "What’s with the fog? It’s... alive?",
                    nextId: "fog_lore"
                },
                {
                    text: "Never mind. I’m leaving.",
                    nextId: null
                }
            ]
        },
        {
            id: "driftkin",
            text: "The Driftkin? We’re the fog’s children, darling. We sail [driftbarges|driftbarges|Floating rigs] through the [fog|fog|Twisting mist], scavenging [portals|portals|Lost tech] shards while Hollowreach cowers. The fog reshapes us—eyes like moonlight, skin like stormglass. Freedom’s our price, and we pay it gladly. You here to judge, or you want in on the ride?",
            options: [
                {
                    text: "Can you help me navigate the fog?",
                    nextId: "quest_tease"
                },
                {
                    text: "How do you survive out there?",
                    nextId: "survival"
                },
                {
                    text: "Sounds like trouble. I’m out.",
                    nextId: null
                }
            ]
        },
        {
            id: "survival",
            text: "Survive? Ha! We don’t just survive, we *thrive*. Our barges are patched with [portal|portals|Old tech] scraps, humming with fog-energy. We read the currents, dodge [Pulsefinders|pulsefinders|Fog cult] traps, and laugh when the storms try to break us. Takes guts and a sharp eye—got either of those, stranger?",
            options: [
                {
                    text: "I want to learn to navigate like you.",
                    nextId: "quest_tease"
                },
                {
                    text: "What’s the deal with the Pulsefinders?",
                    nextId: "pulsefinders"
                },
                {
                    text: "I’ll pass on the fog life.",
                    nextId: null
                }
            ]
        },
        {
            id: "pulsefinders",
            text: "Those [Pulsefinders|pulsefinders|Crazed worshippers]? They think the fog’s a god, snorting its plants and grafting tech to their skulls. Half of ‘em are mad, the other half madder. They’ll slit your throat for a shard or pray over your corpse—depends on the day. Steer clear unless you’re desperate. So, you got a reason to keep talking, or is this a sightseeing tour?",
            options: [
                {
                    text: "I need a portal shard. Can you help?",
                    nextId: "quest_tease"
                },
                {
                    text: "Thanks for the warning. I’m done.",
                    nextId: null
                }
            ]
        },
        {
            id: "fog_lore",
            text: "Alive? Oh, the fog’s more than that—it’s a beast with a thousand moods. It twists flesh, bends time, hides [portals|portals|Ancient gates] in its belly. Some say it’s the Old Empire’s ruin bleeding out, others think it’s got a mind of its own. Me? I ride it, not question it. You looking to tangle with it or just curious?",
            options: [
                {
                    text: "I want to navigate it. Can you teach me?",
                    nextId: "quest_tease"
                },
                {
                    text: "What’s the Old Empire got to do with it?",
                    nextId: "old_empire"
                },
                {
                    text: "That’s enough. I’m leaving.",
                    nextId: null
                }
            ]
        },
        {
            id: "old_empire",
            text: "The Old Empire? Greedy fools who cracked the world open with their [portals|portals|Gate tech]. Built wonders, sure, but their toys broke, and the fog spilled out. Now their ruins—[Fogscar Vault|fogscar_vault|Buried ruin], places like that—hum with secrets. [Emberclad|emberclad|Fire zealots] say it’s a curse. I say it’s opportunity. You chasing their ghosts or something else?",
            options: [
                {
                    text: "I’m after a portal shard. Can you help?",
                    nextId: "quest_tease"
                },
                {
                    text: "I’ll come back later.",
                    nextId: null
                }
            ]
        },
        {
            id: "shard_ask",
            text: "A portal shard from [Vortex Reach|vortex_reach|Maelstrom]? Bold ask, stranger. Those shards are like stars in a storm—rare and dangerous. You think you’ve got the spine to chase one? I’m not holding your hand, but I’m curious to see if you’ll crash and burn. What’s your angle?",
            options: [
                {
                    text: "I’m ready to prove myself. Point me to it.",
                    nextId: "quest_tease"
                },
                {
                    text: "Why’s it so dangerous?",
                    nextId: "vortex_danger"
                },
                {
                    text: "Maybe later.",
                    nextId: null
                }
            ]
        },
        {
            id: "vortex_danger",
            text: "Why’s it dangerous? Ha! [Vortex Reach|vortex_reach|Fog maelstrom] is where the fog chews up barges and spits out wrecks. Gravity flips, winds scream, and [Pulsefinders|pulsefinders|Cult lunatics] hunt anything that moves. A shard’s worth a fortune, but most who chase ‘em end up fog-food. Still think you’re up for it, or you just wasting my air?",
            options: [
                {
                    text: "I’m in. Tell me how to get that shard.",
                    nextId: "quest_tease"
                },
                {
                    text: "Sounds like a death trap. I’m out.",
                    nextId: null
                }
            ]
        },
        {
            id: "quest_tease",
            text: "Navigate the fog? You’ve got that gleam in your eye, like you think you’re tougher than the [fog|fog|Living storm]. Fine, I’ll bite. There’s a portal shard in [Vortex Reach|vortex_reach|Maelstrom], but it’s a deathwish for greenhorns. Take my barge, dodge the [Pulsefinders|pulsefinders|Fog cult], and maybe you’ll grab it. I don’t care if you fail—plenty do. Just don’t sink my ride. Deal?",
            options: [
                {
                    text: "Deal. I’ll get that shard.",
                    nextId: null,
                    action: { type: "startQuest", questId: "barge_over_the_brink" }
                },
                {
                    text: "Not worth it. I’m out.",
                    nextId: null
                }
            ]
        },
        {
            id: "expedition",
            text: "Your [great_crossing|great_crossing|Big trek] needs my barges to slice through the [fog|fog|Deadly mist], huh? I’m Sylvara Tidewalker—best pilot you’ll ever meet. I’ll lead, but don’t expect me to hold your hand. And if I spot [portals|portals|Tech] worth grabbing, we detour. My rules, my way. You good with that, or you gonna waste my time?",
            options: [
                {
                    text: "Your barges, your rules. Let’s do it.",
                    nextId: null,
                    action: { type: "startQuest", questId: "sylvara_expedition" }
                },
                {
                    text: "I’ll find another way.",
                    nextId: null
                }
            ]
        }
    ]
};