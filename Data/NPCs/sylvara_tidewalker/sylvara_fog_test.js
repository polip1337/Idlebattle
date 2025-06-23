export default {
    id: "sylvara_fog_test",
    title: "Driftkin's Test",
    description: "Sylvara Tidewalker challenges you to prove your worth by navigating a treacherous fog-choked route in Driftmoor. Success could earn you the trust of the Driftkin and their support.",
    prerequisites: ["met_sylvara"],
    rewards: {
        success: { reputation: { driftkin: 10, loomkeepers: -5 }, item: "fog_compass", ally: "sylvara" },
        partial: { reputation: { driftkin: 5 }, item: "basic_compass" },
        failure: { reputation: { driftkin: -5 } }
    },
    stages: [
        {
            id: "start",
            text: "Sylvara eyes you with a mix of curiosity and skepticism as fog swirls around her driftbarge. 'So you want to learn our ways, huh? Think you can dance with the fog like us Driftkin?' She gestures toward a treacherous path disappearing into the mist. 'That route there—it's where we test our young ones. Fog-mutated wolves prowl it, and the currents shift like a drunk sailor. You make it through without getting yourself killed, and maybe I'll believe you're worth teaching.'",
            options: [
                {
                    text: "I'm ready for your test. What do I need to know?",
                    nextId: "briefing"
                },
                {
                    text: "Why should I prove myself to you?",
                    nextId: "motivation"
                },
                {
                    text: "Fog-mutated wolves? Maybe I'm not ready for this.",
                    nextId: "retreat"
                }
            ]
        },
        {
            id: "motivation",
            text: "Sylvara's eyes narrow, her voice taking on an edge. 'Because, stranger, trust ain't handed out like bread in Hollowreach. We Driftkin share our secrets with blood and kin, not every wanderer who stumbles into the fog. You want to navigate like us? Want our help when the mist turns nasty? Then show me you won't fold when the fog bites back. Too many outsiders come here thinking they can master what took us generations to learn, then end up as fog-wraith food.'",
            options: [
                {
                    text: "Fair enough. Tell me about this test.",
                    nextId: "briefing"
                },
                {
                    text: "I understand. I'll prove myself.",
                    nextId: "navigate_prep"
                }
            ]
        },
        {
            id: "retreat",
            text: "Sylvara snorts with amusement. 'Smart enough to know fear, at least. Come back when you've grown a spine, city-soft. The fog don't respect cowards, and neither do I.'",
            options: [
                {
                    text: "Wait, I've changed my mind. I'll take the test.",
                    nextId: "briefing"
                },
                {
                    text: "You're right. I'll come back when I'm stronger.",
                    nextId: null,
                    action: { type: "failQuest", questId: "sylvara_fog_test" }
                }
            ]
        },
        {
            id: "briefing",
            text: "Sylvara's expression softens slightly, respect creeping into her voice. 'Alright then. Listen close—the fog's got its own language. Clockwise swirls mean safe passage, counter-clockwise means trouble brewing. Watch for blue pulses—that's [Pulsefinder|pulsefinders|Fog cult] trap work. And those wolves... they ain't natural anymore. Fog's changed 'em, made 'em hungry for warm blood. Keep your wits sharp and don't try to fight the currents. Work with the fog, not against it.'",
            options: [
                {
                    text: "Got it. Clockwise good, counter-clockwise bad, avoid blue lights.",
                    nextId: "navigate_prep"
                },
                {
                    text: "What happens if I encounter the wolves?",
                    nextId: "wolf_warning"
                }
            ]
        },
        {
            id: "wolf_warning",
            text: "'The wolves?' Sylvara's hand moves to the blade at her hip. 'They're pack hunters now, smarter than they should be. Fog's twisted their minds as much as their bodies. If you see glowing eyes in the mist, don't run—that triggers their hunt instinct. Stand your ground, make yourself big, and back away slow. If they charge...' She shrugs. 'Well, hope you're faster than you look.'",
            options: [
                {
                    text: "Understood. I'm ready to begin the test.",
                    nextId: "navigate_prep"
                },
                {
                    text: "Maybe I should come back better prepared.",
                    nextId: "retreat"
                }
            ]
        },
        {
            id: "navigate_prep",
            text: "The fog-choked path stretches before you, tendrils of mist coiling around gnarled trees and broken stones. You can hear something moving in the distance—a low growl that makes your skin crawl. Sylvara watches from her barge, arms crossed. 'Remember—read the fog, trust your instincts, and don't be a hero. Just get to the other side in one piece.'",
            options: [
                {
                    text: "Follow the clockwise fog currents carefully",
                    nextId: "smart_navigation"
                },
                {
                    text: "Push through quickly to avoid the wolves",
                    nextId: "hasty_navigation"
                },
                {
                    text: "Try to find an alternate route around the danger",
                    nextId: "coward_path"
                }
            ]
        },
        {
            id: "smart_navigation",
            text: "You move carefully, reading the fog's patterns like Sylvara taught you. The mist parts before you as you follow the gentle clockwise currents. Behind you, you hear frustrated growls as the wolves lose your scent in the shifting fog. Your patience pays off—the fog seems to guide you around the worst dangers.",
            options: [
                {
                    text: "Continue following the safe currents",
                    nextId: "wolf_encounter"
                },
                {
                    text: "Speed up now that you've avoided the pack",
                    nextId: "tech_glitch"
                }
            ]
        },
        {
            id: "hasty_navigation",
            text: "You rush forward, hoping speed will save you from the wolves. But the fog thickens in response to your panic, and you stumble into a counter-clockwise swirl that sends you spinning off course. Glowing eyes appear in the mist ahead—you've run straight into the pack's hunting ground.",
            options: [
                {
                    text: "Stand your ground and back away slowly",
                    nextId: "wolf_standoff"
                },
                {
                    text: "Try to fight your way through",
                    nextId: "wolf_fight"
                }
            ]
        },
        {
            id: "coward_path",
            text: "You try to skirt around the main path, looking for an easier route. But the fog grows denser away from the marked trail, and soon you're hopelessly lost. Worse, you've wandered into [Pulsefinder|pulsefinders|Fog cult] territory—blue lights pulse ominously in the distance, and you hear the sound of mechanical clicking.",
            options: [
                {
                    text: "Retreat back to the main path",
                    nextId: "hasty_navigation"
                },
                {
                    text: "Try to sneak past the Pulsefinder traps",
                    nextId: "trap_navigation"
                }
            ]
        },
        {
            id: "wolf_encounter",
            text: "Despite your careful navigation, you round a bend and come face to face with a fog-mutated wolf. Its eyes glow with unnatural light, and its breath mists in the air like acid. It hasn't attacked yet—it's sizing you up, deciding if you're prey or threat.",
            options: [
                {
                    text: "Remember Sylvara's advice: stand tall and back away slowly",
                    nextId: "wolf_success"
                },
                {
                    text: "Try to scare it off by making noise",
                    nextId: "wolf_aggro"
                },
                {
                    text: "Attempt to communicate with it somehow",
                    nextId: "wolf_strange"
                }
            ]
        },
        {
            id: "tech_glitch",
            text: "As you pick up speed, following what seems like a safe current, you hear a mechanical whirring sound. One of Joren Halfhand's experimental navigation devices, hidden in the fog, suddenly activates and interferes with the natural flow. The fog currents become chaotic, and you find yourself disoriented just as you hear wolves howling nearby.",
            options: [
                {
                    text: "Try to disable the malfunctioning device",
                    nextId: "tech_fix"
                },
                {
                    text: "Ignore the device and focus on the wolves",
                    nextId: "wolf_standoff"
                }
            ]
        },
        {
            id: "wolf_success",
            text: "You follow Sylvara's advice perfectly. The wolf studies you for a long moment, then seems to decide you're not worth the trouble. It fades back into the fog with an almost respectful nod. You've earned the respect of both the fog and its creatures.",
            options: [
                {
                    text: "Continue to the end of the route",
                    nextId: "perfect_success"
                }
            ]
        },
        {
            id: "wolf_standoff",
            text: "You manage to keep your nerve as the wolves circle you, neither fleeing nor attacking. It's a tense standoff, but eventually they lose interest and melt back into the fog. You're shaken but unharmed.",
            options: [
                {
                    text: "Press on to complete the route",
                    nextId: "partial_success"
                }
            ]
        },
        {
            id: "wolf_fight",
            text: "The wolves attack in a coordinated pack, and you barely manage to fight them off. You're injured and exhausted, but you've proven you can survive when cornered. The fog seems to thicken around you, almost protectively.",
            options: [
                {
                    text: "Limp to the end of the route",
                    nextId: "bloody_success"
                }
            ]
        },
        {
            id: "wolf_aggro",
            text: "Your shouting triggers the wolf's hunting instincts. It howls, calling its pack, and suddenly you're surrounded by glowing eyes. This wasn't the smart play.",
            options: [
                {
                    text: "Fight for your life",
                    nextId: "wolf_fight"
                },
                {
                    text: "Try to back away despite the pack",
                    nextId: "wolf_standoff"
                }
            ]
        },
        {
            id: "wolf_strange",
            text: "Something compels you to reach out with your thoughts rather than your weapons. Strangely, the fog-mutated wolf tilts its head, as if listening. For a moment, you sense an intelligence behind those glowing eyes—not malicious, just... changed. The wolf steps aside, allowing you passage.",
            options: [
                {
                    text: "Thank the wolf and continue",
                    nextId: "mysterious_success"
                }
            ]
        },
        {
            id: "tech_fix",
            text: "You manage to locate and disable Joren's malfunctioning device, restoring the natural fog currents. The mechanical interference stops, and you can navigate properly again. Your technical skills have saved you from a dangerous situation.",
            options: [
                {
                    text: "Use the restored currents to complete the route",
                    nextId: "technical_success"
                }
            ]
        },
        {
            id: "trap_navigation",
            text: "You carefully avoid the pulsing blue lights, using the fog itself as cover. It's nerve-wracking, but you manage to slip past the [Pulsefinder|pulsefinders|Fog cult] traps and find your way back to the main route. You've learned something about stealth in the fog.",
            options: [
                {
                    text: "Rejoin the main path and finish the test",
                    nextId: "sneaky_success"
                }
            ]
        },
        {
            id: "perfect_success",
            text: "You emerge from the fog exactly where Sylvara said you would, having navigated the route flawlessly. She's waiting with a broad grin and genuine respect in her eyes. 'Now that's what I call reading the fog! You've got the instincts of a born Driftkin. Welcome to the family, stranger.'",
            options: [
                {
                    text: "Thank her for the training",
                    nextId: "complete_perfect"
                }
            ]
        },
        {
            id: "partial_success",
            text: "You reach the end of the route, though not without some trouble. Sylvara nods approvingly. 'Not bad for a first try. You kept your head when it mattered, even if you didn't read all the signs right. There's potential in you.'",
            options: [
                {
                    text: "Ask what I could have done better",
                    nextId: "complete_partial"
                }
            ]
        },
        {
            id: "bloody_success",
            text: "You stagger out of the fog, bloodied but victorious. Sylvara rushes to help you, respect and concern warring in her expression. 'Damn fool way to do it, but you survived. Takes guts to face a fog-wolf pack and live. You've earned your place, even if you did it the hard way.'",
            options: [
                {
                    text: "Collapse gratefully",
                    nextId: "complete_bloody"
                }
            ]
        },
        {
            id: "mysterious_success",
            text: "You emerge from the fog with an strange story to tell. Sylvara listens with wide eyes as you describe your encounter with the wolf. 'Never heard of anything like that before. The fog's changing you already, isn't it? That's... that's something special. You're definitely one of us now.'",
            options: [
                {
                    text: "Ask what she means about the fog changing you",
                    nextId: "complete_mysterious"
                }
            ]
        },
        {
            id: "technical_success",
            text: "You complete the route efficiently, having solved the technical problem that would have stymied others. Sylvara is impressed. 'Smart thinking with Joren's contraption. Most folks would've panicked when the currents went haywire. You've got the makings of a fine navigator.'",
            options: [
                {
                    text: "Offer to help fix more of Joren's devices",
                    nextId: "complete_technical"
                }
            ]
        },
        {
            id: "sneaky_success",
            text: "You make it through the route by a combination of stealth and persistence. Sylvara raises an eyebrow. 'Interesting approach. Not how most Driftkin would handle it, but you adapted to the situation. That's what matters in the fog—flexibility.'",
            options: [
                {
                    text: "Sometimes discretion is the better part of valor",
                    nextId: "complete_sneaky"
                }
            ]
        },
        {
            id: "complete_perfect",
            text: "Sylvara hands you a masterfully crafted fog compass, its needle pointing not north but toward the safest currents. 'This belonged to my mentor. You've earned it, and my trust. When you need passage through the fog, the Driftkin will remember this day.' She extends her hand. 'Welcome to the family.'",
            options: [
                {
                    text: "Accept her hand and the compass",
                    nextId: null,
                    action: { type: "completeQuest", questId: "sylvara_fog_test", outcome: "perfect" }
                }
            ]
        },
        {
            id: "complete_partial",
            text: "'You moved too fast at times, didn't trust the fog enough,' Sylvara explains. 'But you learned, and that's what matters.' She hands you a basic compass. 'Keep practicing, and maybe next time you'll dance with the fog instead of fighting it.'",
            options: [
                {
                    text: "I'll remember that lesson",
                    nextId: null,
                    action: { type: "completeQuest", questId: "sylvara_fog_test", outcome: "partial" }
                }
            ]
        },
        {
            id: "complete_bloody",
            text: "After tending your wounds, Sylvara looks you in the eye. 'You've got the heart of a Driftkin, I'll give you that. Stupid brave, but brave all the same.' She gives you her own fog compass. 'You'll need this more than me, apparently. Try not to fight everything next time.'",
            options: [
                {
                    text: "Thank her for her help and the compass",
                    nextId: null,
                    action: { type: "completeQuest", questId: "sylvara_fog_test", outcome: "bloody" }
                }
            ]
        },
        {
            id: "complete_mysterious",
            text: "'The fog marks those it finds worthy,' Sylvara says quietly. 'Changes them, makes them part of something bigger. What happened to you out there... that's rare. Very rare.' She looks at you with new respect. 'You're not just learning our ways—you're becoming something new. The Driftkin will follow someone like that.'",
            options: [
                {
                    text: "I'm honored by your trust",
                    nextId: null,
                    action: { type: "completeQuest", questId: "sylvara_fog_test", outcome: "mysterious" }
                }
            ]
        },
        {
            id: "complete_technical",
            text: "'Joren could use someone with your skills,' Sylvara muses. 'His gadgets cause more problems than they solve, but with the right touch...' She hands you a modified compass with additional technical readouts. 'This might help you navigate both fog and technology.'",
            options: [
                {
                    text: "I'd be happy to help improve the Driftkin's technology",
                    nextId: null,
                    action: { type: "completeQuest", questId: "sylvara_fog_test", outcome: "technical" }
                }
            ]
        },
        {
            id: "complete_sneaky",
            text: "'Stealth has its place in the fog,' Sylvara admits. 'Sometimes the best way through is around.' She hands you a compass that pulses when danger is near. 'This'll help you avoid trouble before it finds you. Might be just what someone with your... approach needs.'",
            options: [
                {
                    text: "Sometimes the quiet way is the smart way",
                    nextId: null,
                    action: { type: "completeQuest", questId: "sylvara_fog_test", outcome: "sneaky" }
                }
            ]
        }
    ]
};