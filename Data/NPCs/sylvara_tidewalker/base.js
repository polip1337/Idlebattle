export default {
    nodes: [
        {
            id: "start",
            text: "Well, stranger, you’ve wandered deep into the [fog|fog|Living storm]. Name’s Sylvara Tidewalker, born to dance on its currents with my [Driftkin|driftkin|Fog nomads]. This ain’t no place for city boots or faint hearts. Got a reason for being here, or are you just chasing shadows in the haze?",
            options: [
                {
                    text: "Who are the Driftkin, exactly?",
                    nextId: "driftkin"
                },
                {
                    text: "Will you join my expedition?",
                    nextId: "expedition",
                    conditions: [{ type: "questActive", questId: "great_crossing" }],
                    hideWhenUnavailable: true

                },
                {
                    text: "What’s the deal with the fog? It feels... alive.",
                    nextId: "fog_lore"
                },
                {
                    text: "I need the Driftkin to help me. I want to get into the Ashen Archive.",
                    nextId: "ashenArchive",
                    conditions: [{ type: 'questActive', questId: 'mistwalkerSecret'},
                                 { type: 'questActive', questId: 'sylvaraFogTest', negate:true}
                    ],
                    hideWhenUnavailable: true

                },
                {
                    text: "I beat your test.",
                    nextId: "test_success",
                    conditions: [{ type: 'questStep', questId: 'sylvaraFogTest', stepIndex: 1 }],
                    hideWhenUnavailable: true

                },
                {
                    text: "How do you get along with Hollowreach?",
                    nextId: "city_relation"
                },
                {
                    text: "I’m leaving. This place is too much.",
                    nextId: null
                }
            ]
        },
        {
            id: "driftkin",
            text: "The Driftkin? We’re the fog’s kin, carved by its breath. We roam [Driftmoor|driftmoor|Fog dockyard] on our [driftbarges|driftbarges|Floating rigs], patched together from scavenged [portals|portals|Lost tech] and whatever the fog doesn’t eat. It changes us—eyes glow like moonstones, skin tough as stormglass. We’re free, but it’s a hard freedom. Hollowreach calls us outcasts, yet they beg for our shards. You here to trade, join the ride, or just gawk?",
            options: [
                {
                    text: "How do you live out there in the fog?",
                    nextId: "survival"
                },
                {
                    text: "What’s your history? Where’d the Driftkin come from?",
                    nextId: "driftkin_origins"
                },
                {
                    text: "Can you teach me to navigate the fog?",
                    nextId: "quest_tease"
                },
                {
                    text: "What’s it like living on a driftbarge?",
                    nextId: "barge_life"
                },
                {
                    text: "Sounds like a rough life. I’m out.",
                    nextId: null
                }
            ]
        },
        {
            id: "driftkin_origins",
            text: "Our roots? Born from the Old Empire’s collapse, when the [portals|portals|Gate tech] shattered and the fog swallowed the world. Some of us—elves, humans, half-orcs—refused to cower in Hollowreach. We took to the fog, learned its rhythms. Our ancestors wove the first driftbarges from wrecked portal frames, swearing never to be tethered. Now we’re a tribe, bound by survival and the [Driftmoor|driftmoor|Nomad haven] code: share the haul, guard the weak. You looking to understand us or just digging for secrets?",
            options: [
                {
                    text: "That’s incredible. Can you teach me to navigate like that?",
                    nextId: "quest_tease"
                },
                {
                    text: "What’s life like on a driftbarge?",
                    nextId: "barge_life"
                },
                {
                    text: "I’ve heard enough. I’m done.",
                    nextId: null
                }
            ]
        },
        {
            id: "barge_life",
            text: "Life on a driftbarge? It’s raw, stranger. We sleep under canopies of patched [portal|portals|Old tech] scraps, lulled by their hum. Meals are fog-fish or roots roasted over shard-fires—tastes better than city slop, trust me. Every day’s a dance: patching hulls, dodging [Pulsefinders|pulsefinders|Fog cult] traps, feeling the fog’s pulse through the deck. We’re a family, tight as the ropes we knot. Ever lived somewhere that’s both your home and your fight? Got the heart for it?",
            options: [
                {
                    text: "Sounds intense. Teach me to navigate like you.",
                    nextId: "quest_tease"
                },
                {
                    text: "How do you all get along, living so close?",
                    nextId: "barge_community"
                },
                {
                    text: "What kind of songs do you sing out there?",
                    nextId: "driftkin_songs"
                },
                {
                    text: "Not for me. I’m leaving.",
                    nextId: null
                }
            ]
        },
        {
            id: "barge_community",
            text: "How we get along? Like siblings in a storm—sometimes we bicker, but we’re blood. On a barge, everyone’s got a role: navigators read the fog, mechanics mend the [portal|portals|Tech] scraps, cooks keep us fed. We share everything—food, stories, even dreams. Fights happen, sure, but the [Driftmoor|driftmoor|Nomad haven] code keeps us tight: no one’s left behind. You ever had a crew you’d die for, or you more the lone wolf type?",
            options: [
                {
                    text: "I want to learn to navigate with a crew like that.",
                    nextId: "quest_tease"
                },
                {
                    text: "What’s the Driftmoor code like?",
                    nextId: "driftmoor_code"
                },
                {
                    text: "Sounds close-knit. I’m done for now.",
                    nextId: null
                }
            ]
        },
        {
            id: "driftmoor_code",
            text: "The Driftmoor code? It’s our spine. Simple rules: share what you scavenge, protect the weak, and never betray the barge. Break it, and you’re cast out—no second chances. It’s kept us alive since the Old Empire fell. Every Driftkin swears it under the fog’s glow, with [Shardwreck Bay|shardwreck_bay|Barge graveyard] as witness. You got a code you live by, stranger, or you just make it up as you go?",
            options: [
                {
                    text: "I respect that. Teach me to navigate the fog.",
                    nextId: "quest_tease"
                },
                {
                    text: "That’s enough for now. I’m out.",
                    nextId: null
                }
            ]
        },
        {
            id: "driftkin_songs",
            text: "Our songs? They’re our history, our heart. We sing of the first Driftkin, who sailed the fog when the Old Empire fell. Ballads of lost [portals|portals|Gate tech], of storms we outran, of kin we buried in [Shardwreck Bay|shardwreck_bay|Barge graveyard]. They’re not just tunes—they guide us, keep our bearings when the fog blinds. Ever heard a song that feels like it’s pulling you somewhere? That’s us. Want to hear one, or you just asking to pass the time?",
            options: [
                {
                    text: "I’d love to hear a song. Sing one.",
                    nextId: "sing_song"
                },
                {
                    text: "Can you teach me to navigate the fog instead?",
                    nextId: "quest_tease"
                },
                {
                    text: "I’m good. Let’s move on.",
                    nextId: null
                }
            ]
        },
        {
            id: "sing_song",
            text: "Alright, stranger, one verse for you. *‘Through fog we glide, where stars don’t shine, / Driftkin bold on threads divine. / Portal’s hum, our heart’s own beat, / In [Shardwreck Bay|shardwreck_bay|Lost haven] our souls will meet.’* That’s an old one, sung when we bury our dead. Keeps us grounded. You got a song of your own, or you want to learn what keeps us alive out here?",
            options: [
                {
                    text: "Teach me how to navigate the fog.",
                    nextId: "quest_tease"
                },
                {
                    text: "That’s beautiful. I’m done for now.",
                    nextId: null
                }
            ]
        },
        {
            id: "survival",
            text: "Survive the fog? We *dance* with it. Our [driftbarges|driftbarges|Floating rigs] are rigged with [portal|portals|Old tech] scraps that hum with fog-energy. We read the currents like a book—swirls mean calm, pulses mean trouble. [Pulsefinders|pulsefinders|Fog cult] set traps, but we’re sharper. Takes quick hands and a sharper mind. You got those, or you just here to dream about it?",
            options: [
                {
                    text: "I want to learn your ways. Teach me.",
                    nextId: "quest_tease"
                },
                {
                    text: "What’s with these Pulsefinders?",
                    nextId: "pulsefinders"
                },
                {
                    text: "Too wild for me. I’m out.",
                    nextId: null
                }
            ]
        },
        {
            id: "pulsefinders",
            text: "The [Pulsefinders|pulsefinders|Crazed worshippers]? They’re lost to the fog, snorting its glowing plants and bolting tech to their skulls. Think it’s a god, call it their ‘divine mist.’ Half are raving, half are scheming—both’ll gut you for a shard. I’ve seen ‘em dance in [Verdant Hollow|verdant_hollow|Fog temple], mad as a storm. You crossing their path, or you smart enough to avoid ‘em?",
            options: [
                {
                    text: "I need a portal shard. Can you help me get one?",
                    nextId: "quest_tease"
                },
                {
                    text: "Good to know. I’m leaving.",
                    nextId: null
                }
            ]
        },
        {
            id: "city_relation",
            text: "Hollowreach? We’re their dirty little secret. They need our [portals|portals|Tech] shards to keep their lights on, but they sneer at us, call us fog-freaks. We trade at [Rustmarket|rustmarket|Bazaar]—fair deals, mostly—but their [Loomkeepers|loomkeepers|Artisan scribes] and [Emberclad|emberclad|Fire zealots] act like we’re the problem. Truth is, they’re jealous of our freedom. You from the city, or you got no love for their stone walls either?",
            options: [
                {
                    text: "I’m no fan of the city. Can you teach me to navigate the fog?",
                    nextId: "quest_tease"
                },
                {
                    text: "Why do they distrust you so much?",
                    nextId: "city_tension"
                },
                {
                    text: "I’m done talking about this.",
                    nextId: null
                }
            ]
        },
        {
            id: "city_tension",
            text: "Distrust? Ha! Hollowreach thinks we bring the fog’s monsters to their gates. They’re half-right—our barges stir the mist, and things follow. But without our shards, their forges go cold, and their [Loomkeepers|loomkeepers|Tapestry scribes] can’t weave their fancy maps. They need us, but they’ll never admit it. Ever been caught between folks who hate you but want your goods? That’s us.",
            options: [
                {
                    text: "I’m with you. Teach me to navigate the fog.",
                    nextId: "quest_tease"
                },
                {
                    text: "How do you deal with their attitude?",
                    nextId: "city_coping"
                },
                {
                    text: "I’ve heard enough. I’m out.",
                    nextId: null
                }
            ]
        },
        {
            id: "city_coping",
            text: "Deal with it? We laugh it off. At [Rustmarket|rustmarket|Trade hub], we drive hard bargains—shards for supplies, no charity. If they spit on us, we slip out before dawn, back to the fog. Some Driftkin, like Joren Halfhand, talk of cutting ties entirely, but we need their steel as much as they need our scraps. It’s a cold truce. You ever had to trade with folks who look down on you? What’s your trick?",
            options: [
                {
                    text: "I’d rather learn to live free like you. Teach me navigation.",
                    nextId: "quest_tease"
                },
                {
                    text: "That’s tough. I’m done for now.",
                    nextId: null
                }
            ]
        },
        {
            id: "fog_lore",
            text: "The fog’s alive, alright. It twists, it thinks, it *hungers*. Hides [portals|portals|Ancient gates] in its guts, warps flesh if you linger too long. Some say it’s the Old Empire’s ruin, bleeding out from broken [portals|portals|Gate tech]. Others think it’s got its own will, older than Hollowreach. Me? I don’t care what it is—I ride it. You planning to fight it, study it, or just stand there wondering?",
            options: [
                {
                    text: "I want to navigate it. Can you teach me?",
                    nextId: "quest_tease"
                },
                {
                    text: "What’s the Old Empire’s role in this?",
                    nextId: "old_empire"
                },
                {
                    text: "I’m out. This is too much.",
                    nextId: null
                }
            ]
        },
        {
            id: "old_empire",
            text: "Old Empire? Bunch of arrogant fools who thought they could tame the [portals|portals|Gate tech]. Built wonders, sure, but cracked the world open. Fog poured out, swallowed their cities. Places like [Fogscar Vault|fogscar_vault|Buried ruin] still hum with their secrets—runes, constructs, shards. [Emberclad|emberclad|Fire zealots] call it a curse; I call it a treasure map. You hunting their relics, or you got bigger plans?",
            options: [
                {
                    text: "I’m after a portal shard. Can you help?",
                    nextId: "quest_tease"
                },
                {
                    text: "I’ll come back another time.",
                    nextId: null
                }
            ]
        },
        {
            id: "ashenArchive",
            text: "The Ashen Archive, huh? You’re chasing ghosts in a place that’s been dust for centuries, stranger. Driftkin don’t just hand out favors for city-dwellers sniffing after old ruins. You want our help? Prove you’re not some weakling who’ll choke in the fog. I’ve got a little test in mind—think you can handle it, or you just here to waste my air?",
            options: [
                {
                    text: "I’ll take your test. What’s it about?",
                    nextId: null,
                    action: { type: "startQuest", questId: "sylvaraFogTest" }
                },
                {
                    text: "Why should I jump through hoops for you?",
                    nextId: "archive_motivation"
                },
                {
                    text: "Sounds too dangerous. I’m out.",
                    nextId: null
                }
            ]
        },
        {
            id: "archive_motivation",
            text: "Why? ‘Cause the Ashen Archive ain’t safe. We’d be sticking our necks out, dodging [Pulsefinders|pulsefinders|Fog cult] and worse to get you there. You want Driftkin to risk our barges and blood, you gotta show you’re worth the trouble. So, you in, or you gonna scurry back to Hollowreach?",
            options: [
                {
                    text: "Alright, I’ll do your test.",
                    nextId: null,
                    action: { type: "startQuest", questId: "sylvaraFogTest" }
                },
                {
                    text: "Forget it. I’ll find another way.",
                    nextId: null
                }
            ]
        },
        {
            id: "expedition",
            text: "Your [great_crossing|great_crossing|Big trek] needs my [driftbarges|driftbarges|Fog rigs], huh? I’m Sylvara Tidewalker, best pilot in the fog. I’ll lead, but this ain’t charity—you follow my calls, and if I spot [portals|portals|Tech] worth grabbing, we detour. My barge, my rules. You good with that, or you gonna drag your feet?",
            options: [
                {
                    text: "Your rules, your barge. I’m in.",
                    nextId: null,
                    action: { type: "startQuest", questId: "sylvara_expedition" }
                },
                {
                    text: "I’ll find another way.",
                    nextId: null
                }
            ]
        },
        {
            id: "archive_success",
            text: "Well, I’ll be fog-damned. You crawled through that test and came out breathing. Not bad, stranger—maybe you’ve got some Driftkin spark in you after all. Ready for the second test?",
            options: [
                {
                    text: "I’m ready. What’s the next test?",
                    nextId: "second_test"
                },
                {
                    text: "Another test? You serious? How many of these are there?",
                    nextId: "test_count"
                }
            ]
        },
        {
            id: "test_count",
            text: "Ha! You thought one little jaunt through the fog would seal the deal? Nah, stranger, we Driftkin don’t trust easy. Three tests to prove you’re worth our blood and barges for that [Ashen Archive|ashen_archive|Lost library] run. You’ve got one down, two to go. Don’t look so sour—most don’t even survive the first. Ready for number two, or you gonna whine some more?",
            options: [
                {
                    text: "Fine, I’ll do the second test. What is it?",
                    nextId: "second_test"
                },
                {
                    text: "Three tests? That’s ridiculous. I’m out.",
                    nextId: null
                }
            ]
        },
        {
            id: "second_test",
            text: "Good. You’re not folding yet—maybe there’s hope for you. Second test’s with Joren Halfhand, our gear-tinker. He’s been cursing up a storm trying to calibrate a fog compass. Dunno what is twitchier he or that compass. Help him get it steady, and you’re one step closer to us risking our necks for your Archive. Don’t break his gear, or you’ll wish the fog ate you first.",
            options: [
                {
                    text: "I’ll help Joren with the compass.",
                    nextId: null,
                    action: [
                        { type: "startQuest", questId: "jorensCompass" }
                    ]
                },
                {
                    text: "I need to think about this one.",
                    nextId: null
                }
            ]
        }
    ]
};