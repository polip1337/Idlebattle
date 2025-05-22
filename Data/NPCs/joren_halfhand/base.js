export default {
    nodes: [
        {
            id: "start",
            text: "Oi, keep your distance! The [fog|fog|Corrupts tech and flesh alike]’s got eyes, and I don’t need spies sniffing around my [Driftkin|driftkin|Barge folk]. You’re Taryn, yeah? From the orphanage? Don’t think that makes us pals. What do you want?",
            options: [
                {
                    text: "Heard you’re the best with driftbarges. What’s your deal?",
                    nextId: "role"
                },
                {
                    text: "I’m looking into a wrecked barge in Driftmoor. Know anything?",
                    nextId: "wreck_info",
                    conditions: [{ type: "skill", stat: "Engineering", value: 4 }]
                },
                {
                    text: "I need your skills for an expedition through the fog.",
                    nextId: "expedition",
                    conditions: [{ type: "questActive", questId: "great_crossing" }]
                },
                {
                    text: "Just passing through. Goodbye.",
                    nextId: null
                }
            ]
        },
        {
            id: "role",
            text: "Best? Hmph. I keep the [Driftkin|driftkin|Scavengers of the fog]’s barges running, patching ‘em up when the [fog|fog|Eats metal like candy] chews through. [Portals|portals|Old Empire relics]’ shards are my trade—priceless, cursed things. One wrong move, and they hum with fog-beasts. Why you asking? Got designs on my work?",
            options: [
                {
                    text: "No designs, just need help with a wrecked barge.",
                    nextId: "wreck_info"
                },
                {
                    text: "You ever work with portal shards yourself?",
                    nextId: "shards"
                },
                {
                    text: "Sounds like trouble. I’ll leave you to it.",
                    nextId: null
                }
            ]
        },
        {
            id: "shards",
            text: "Work with ‘em? I *live* for ‘em. Those [portals|portals|Old Empire tech] shards power our barges, but they’re tricky. One sparked wrong, and my arm—\" *he waves his glowing prosthetic* \"—gone. Now I’m half-machine, half-paranoid. The [Pulsefinders|pulsefinders|Fog worshippers] are after ‘em too, claiming they’re ‘divine.’ You after shards, or just stirring trouble?",
            options: [
                {
                    text: "I’m dealing with a barge wreck. Sounds like your expertise.",
                    nextId: "wreck_info"
                },
                {
                    text: "Pulsefinders? What’s their deal with the shards?",
                    nextId: "pulsefinders"
                },
                {
                    text: "I’ll steer clear of your shards. Goodbye.",
                    nextId: null
                }
            ]
        },
        {
            id: "pulsefinders",
            text: "Those [Pulsefinders|pulsefinders|Cultist lunatics] think the fog’s a god, and the shards are its ‘voice.’ They’ll shove glowing vines in their skulls to ‘commune’ with it. Madness! Saw one at Driftmoor, eyes glowing, muttering about the [Starbarge Wreck|starbarge_wreck|Old ruin]’s core. They’re trouble, Taryn, and they’re watching me. You with ‘em?",
            options: [
                {
                    text: "Not with them. Tell me about that Starbarge Wreck.",
                    nextId: "wreck_info"
                },
                {
                    text: "Sounds like you’re the paranoid one. I’m out.",
                    nextId: null
                }
            ]
        },
        {
            id: "wreck_info",
            text: "The [Starbarge Wreck|starbarge_wreck|Broken hulk] in Driftmoor’s leaking portal energy, pulling [fog|fog|Spawns beasts] like moths to a flame. Its core’s unstable—could rip a hole in the city if it goes. I’d fix it, but the [Pulsefinders|pulsefinders|Cult freaks] are crawling all over, wanting that core for their rituals. You got the guts to shut it down?",
            options: [
                {
                    text: "I’ll take a look. What’s the job?",
                    nextId: "quest"
                },
                {
                    text: "Why not fix it yourself?",
                    nextId: "why_not"
                },
                {
                    text: "Too risky for me. Good luck.",
                    nextId: null
                }
            ]
        },
        {
            id: "why_not",
            text: "Me? March into a fog-choked wreck with [Pulsefinders|pulsefinders|Zealots] and beasts? I’ve lost one arm already, Taryn. Ain’t keen on losing more. Besides, my barge’s got a shard humming wrong—can’t leave it. You’re fresh, got orphanage grit. Think you can handle it, or you just talk like Renn now?",
            options: [
                {
                    text: "I’m in. Tell me about the job.",
                    nextId: "quest"
                },
                {
                    text: "Renn? What’s he got to do with this?",
                    nextId: "renn"
                },
                {
                    text: "Not my fight. I’m out.",
                    nextId: null
                }
            ]
        },
        {
            id: "renn",
            text: "That [Renn|renn|Quickfingers] weasel? Always poking around Rustmarket, nicking shards and secrets. He’d sell his own bunkmate—probably did, back at the orphanage. Saw him eyeing the [Starbarge Wreck|starbarge_wreck|Hulk] too. Bet he’s after its core. You running his errands, or you got your own play?",
            options: [
                {
                    text: "Not his errand. I’ll check the wreck myself.",
                    nextId: "quest"
                },
                {
                    text: "I’ll watch out for Renn. Goodbye.",
                    nextId: null
                }
            ]
        },
        {
            id: "quest",
            text: "Alright, Taryn. The [Starbarge Wreck|starbarge_wreck|Leaking ruin]’s core needs shutting down before it tears Driftmoor apart. Sneak in, dodge the [fog|fog|Spawns drones] beasts, and disable the core’s shard matrix—smash it if you have to. But watch for [Pulsefinders|pulsefinders|Cultists]. They’ll gut you for that core. Bring me a shard fragment as proof, and I’ll owe you. Deal?",
            options: [
                {
                    text: "Deal. I’ll handle it.",
                    nextId: null,
                    action: { type: "startQuest", questId: "moors_lament" }
                },
                {
                    text: "I’ll think about it.",
                    nextId: null
                }
            ]
        },
        {
            id: "expedition",
            text: "Your [great_crossing|great_crossing|Fog expedition] is suicide without my tech, Taryn. I can rig a driftbarge to cut through the [fog|fog|Twists paths], but it’ll cost you. And keep those [Pulsefinders|pulsefinders|Crazed mystics] away—they’ll sabotage my work just to ‘commune’ with the mist. You serious about this?",
            options: [
                {
                    text: "Dead serious. Let’s make it happen.",
                    nextId: null,
                    action: { type: "startQuest", questId: "joren_expedition" }
                },
                {
                    text: "I’ll get back to you.",
                    nextId: null
                }
            ]
        }
    ]
};