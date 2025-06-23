export default {
    id: "sylvara_tech_test",
    title: "The Fog's Errand",
    description: "Sylvara Tidewalker, with a sly grin, sends you into Driftmoor's fog to 'prove' your worth by attuning a portal fragment. Her irony suggests she’s just getting free work done, and she directs you to Joren Halfhand for the technical know-how.",
    prerequisites: ["sylvara_fog_test"],
    rewards: {
        success: { reputation: { driftkin: 6 }, item: "pulse_reader" },
        failure: { reputation: { driftkin: -4 } }
    },
    stages: [
        {
            id: "start",
            text: "Sylvara lounges against her driftbarge’s helm, twirling a glowing portal fragment like it’s a toy. Her moonstone eyes flicker with amusement. 'Well, look at you, hero of the fog test, dodging wolves like a proper Driftkin. Bravo.' Her voice drips with mock awe. 'But, see, surviving’s only half the game. These little shards keep our barges humming, and—lucky you—I’ve got a job that needs doing. Take this fragment into Driftmoor’s nastiest fog, attune it to our beacon, and maybe I’ll think you’re more than a useful pair of hands. Sound fun?'",
            options: [
                {
                    text: "Wait, why me? I already passed your test.",
                    nextId: "motivation"
                },
                {
                    text: "Fine, I’ll do it. How does this fragment work?",
                    nextId: "joren_redirect"
                },
                {
                    text: "Sounds like you’re just dumping work on me.",
                    nextId: "call_out"
                }
            ]
        },
        {
            id: "motivation",
            text: "Sylvara’s grin widens, sharp as a fog-wolf’s teeth. 'Oh, you’re quick, aren’t you? Passed one test and think you’re family? Cute. The fog don’t care about your victory lap—it’s always hungry. These fragments are our lifeline, and I need someone... expendable to tune ‘em right. Prove you can handle our tech, and I might not send you on every dirty job that pops up. Deal, or you scooting back to Rustmarket’s cozy stalls?'",
            options: [
                {
                    text: "Deal. Tell me about the fragment.",
                    nextId: "joren_redirect"
                },
                {
                    text: "This feels like a setup. I’m out.",
                    nextId: "retreat"
                }
            ]
        },
        {
            id: "call_out",
            text: "Sylvara laughs, a low, throaty sound. 'Oh, you *are* sharp! Guilty as charged, stranger. Barges don’t fix themselves, and I’ve got better things to do than muck about in the fog for every loose shard. But here’s the kicker: do this, and you might actually learn something. Or, y’know, you could walk away and miss out on all the glory.' Her smirk dares you to bite.",
            options: [
                {
                    text: "Fine, I’ll play along. What’s the job?",
                    nextId: "joren_redirect"
                },
                {
                    text: "I’m not your errand runner. I’m done.",
                    nextId: "retreat"
                }
            ]
        },
        {
            id: "retreat",
            text: "Sylvara shrugs, tossing the fragment into a crate with a clink. 'Figures. All talk, no spine. Fog’s too much for most, and I ain’t got time to babysit. Come back when you’re ready to roll up your sleeves, or stick to Hollowreach’s safe walls.'",
            options: [
                {
                    text: "Wait, I’ll do it. Tell me more.",
                    nextId: "joren_redirect"
                },
                {
                    text: "You’re right. I’m not ready.",
                    nextId: null,
                    action: { type: "failQuest", questId: "sylvara_tech_test" }
                }
            ]
        },
        {
            id: "joren_redirect",
            text: "Sylvara’s smirk softens, but her eyes still gleam with mischief. 'Atta spirit. The fragment’s Old Empire junk, hums with the fog’s pulse—high pitch for trouble, low for calm. But don’t ask me for the boring details; I’m a pilot, not a tinker. Head to Joren Halfhand’s workshop, stern of the barge. He’s got that creepy magic arm and all the know-how. Tell him I sent you to fix his mess. Oh, and don’t die out there—be a shame to lose my favorite new errand runner.'",
            options: [
                {
                    text: "I’ll find Joren and get this done.",
                    nextId: "joren_meeting"
                },
                {
                    text: "What’s out in the fog I should worry about?",
                    nextId: "fog_warning"
                }
            ]
        },
        {
            id: "fog_warning",
            text: "Sylvara’s tone turns mock-serious, hand on hip. 'Oh, just the usual Driftmoor welcome: fog-mutated wolves with a taste for fresh meat, [Pulsefinders|pulsefinders|Fog cult] traps that’ll fry your brain, and currents that’ll spin you like a drunk sailor. Mess up the fragment’s attuning, and it’ll scream loud enough to bring ‘em all running. But you’re a big, brave hero, right? Joren’ll fill you in. Off you go.'",
            options: [
                {
                    text: "I’ll talk to Joren and handle it.",
                    nextId: "joren_meeting"
                },
                {
                    text: "This sounds like too much. I’m out.",
                    nextId: "retreat"
                }
            ]
        },
        {
            id: "joren_meeting",
            text: "Joren Halfhand, a wiry human with a glowing prosthetic arm, glares at you from his cluttered workshop. Tools and portal scraps litter the deck. 'Sylvara sent you, huh? Typical. She breaks my gear, then sends some greenhorn to clean up. This fragment’s gotta be attuned to our beacon in Driftmoor’s deep fog. Match its hum to the beacon’s—low and steady—or it’ll go haywire and pull every wolf in the mist. Don’t expect me to hold your hand out there.'",
            options: [
                {
                    text: "I’ll attune it carefully in the fog.",
                    nextId: "fog_challenge"
                },
                {
                    text: "Any tips for using this fragment?",
                    nextId: "joren_tips"
                }
            ]
        },
        {
            id: "joren_tips",
            text: "Joren snorts, his magic arm sparking faintly. 'Tips? Don’t be an idiot. Hold the fragment, feel its pulse—think of it like a heartbeat. Fog’s thick out there, so watch for [Pulsefinder|pulsefinders|Fog cult] blue glows; they’ll mess with the hum. Wolves’ll come if you panic. Keep calm, match the beacon’s rhythm, and maybe you won’t wreck my work. Now get moving.'",
            options: [
                {
                    text: "Got it. I’m heading into the fog.",
                    nextId: "fog_challenge"
                }
            ]
        },
        {
            id: "fog_challenge",
            text: "The fog engulfs you as you leave the barge, the fragment’s hum jittery in your grip. Driftmoor’s mist swirls thick, muffling distant wolf howls. A faint blue glow pulses nearby—Pulsefinder traps, no doubt. Somewhere in the haze is Joren’s beacon, its low hum your only guide if you can sync the fragment right.",
            options: [
                {
                    text: "Focus on the fragment’s pulse to find the beacon",
                    nextId: "attune_success"
                },
                {
                    text: "Rush through the fog to reach the beacon fast",
                    nextId: "attune_failure"
                }
            ]
        },
        {
            id: "attune_success",
            text: "You steady your breathing, letting the fragment’s hum align with your own pulse. The fog seems to thin slightly, guiding you to a rig of portal scraps pulsing softly—the beacon. As you touch it, the fragment’s hum locks into a low, steady rhythm, its glow calm. You’ve nailed it, despite Sylvara’s doubts.",
            options: [
                {
                    text: "Return to Sylvara with the attuned fragment",
                    nextId: "complete_success"
                }
            ]
        },
        {
            id: "attune_failure",
            text: "You barrel through the fog, the fragment’s hum spiking wildly. The mist thickens, and a chorus of growls erupts—wolves, drawn by the fragment’s chaotic pulse. You scramble back, the fragment’s glow flickering weakly. Joren’s not gonna be happy.",
            options: [
                {
                    text: "Try again to attune the fragment",
                    nextId: "fog_challenge"
                },
                {
                    text: "Head back to Sylvara, empty-handed",
                    nextId: "complete_failure"
                }
            ]
        },
        {
            id: "complete_success",
            text: "Sylvara’s waiting, one eyebrow arched as you hand over the attuned fragment. 'Well, color me shocked. You actually pulled it off, errand runner.' Her tone’s half-mocking, half-impressed. 'Joren’s junk works again, and I didn’t have to lift a finger. Here, take this pulse reader—keeps tabs on fog currents. Don’t get cocky, though; I’ve got plenty more jobs where that came from.'",
            options: [
                {
                    text: "Glad I could help. What’s next?",
                    nextId: null,
                    action: { type: "completeQuest", questId: "sylvara_tech_test", outcome: "success" }
                }
            ]
        },
        {
            id: "complete_failure",
            text: "Sylvara takes the flickering fragment, her smirk pure I-told-you-so. 'What, the fog too much for our big hero? Or maybe Joren’s toy was too tricky? Either way, you’ve cost me time I don’t have.' She sighs, theatrical. 'Get it together and try again, or stick to fetching my groceries at Rustmarket.'",
            options: [
                {
                    text: "I’ll make it right next time.",
                    nextId: null,
                    action: { type: "failQuest", questId: "sylvara_tech_test" }
                }
            ]
        }
    ]
};