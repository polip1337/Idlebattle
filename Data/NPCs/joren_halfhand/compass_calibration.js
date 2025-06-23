export default {
    id: "compass_calibration",
    title: "Calibrate the Fog Compass",
    description: "Joren Halfhand demands you calibrate a volatile fog compass to track [Fogscar Vault|fogscar_vault|Buried ruin] currents for the Ashen Archive quest. His unstable prosthetic and the fog’s interference mean he needs your hands, but his cryptic instructions and short fuse make this a high-stakes puzzle. Too many mistakes, and the compass is ruined.",
    prerequisites: ["met_sylvara", "sylvara_fog_test_completed"],
    rewards: {
        success: { reputation: { driftkin: 15 }, item: "calibrated_fog_compass", questProgress: "ashen_archive_step_2" },
        partial: { reputation: { driftkin: 0 }, item: "damaged_compass" },
        failure: { reputation: { driftkin: -10 }, questProgress: "ashen_archive_stalled" }
    },
    nodes: [
        {
            id: "start",
            text: "Joren Halfhand’s prosthetic arm sparks as he thrusts a flickering fog compass at you, his eyes wild. 'Sylvara’s got you pegged as useful, Taryn, but I ain’t buying it! This compass is our key to [Fogscar Vault|fogscar_vault|Buried ruin], and it’s spitting sparks. My arm’s too shaky to hold it steady in this [fog|fog|Tech-corrupting mist]—it messes with my circuits, so you’re my hands. Don’t botch this, or we’re both fog-food! The shard’s got four modes: pulse, hum, flare, damp. Read the fog’s currents, match the shard’s glow to ‘em, and don’t touch the red crystal—it’ll call [Pulsefinders|pulsefinders|Cultists]. First step’s the outer current. Watch the fog swirl—what’s the move?'",
            options: [
                {
                    text: "Ask Joren to clarify the fog’s current patterns.",
                    nextId: "hints"
                },
                {
                    text: "Why can’t you do this yourself?",
                    nextId: "why_help"
                },
                {
                    text: "This looks too dangerous. I’m out.",
                    nextId: "retreat"
                }
            ]
        },
        {
            id: "why_help",
            text: "Joren’s prosthetic twitches, nearly dropping the compass. 'Why? ‘Cause this [fog|fog|Eats metal]’s screwing with my arm’s wiring! I can’t hold the shard steady and read its feedback at the same time. You wanna reach your [Ashen Archive|ashen_archive|Lost library], you’ll do the grunt work. Now quit whining like Renn and get to it—or scram!'",
            options: [
                {
                    text: "Fine, I’ll help. What’s the first step?",
                    nextId: "hints"
                },
                {
                    text: "I’m not ready for this. I’ll come back.",
                    nextId: "retreat"
                }
            ]
        },
        {
            id: "retreat",
            text: "Joren roars, hurling a wrench into the fog. 'Useless orphanage rat! Get outta my sight before I feed you to the [fog|fog|Spawns beasts]! Don’t come crawling back ‘til you grow a spine!'",
            options: [
                {
                    text: "Wait, I’ll do it. Let’s start.",
                    nextId: "hints"
                },
                {
                    text: "You’re right, I’m out.",
                    nextId: null,
                    action: { type: "failQuest", questId: "compass_calibration" }
                }
            ]
        },
        {
            id: "hints",
            text: "Joren glares, his voice a low growl. 'Pay attention, Taryn! Fog swirls clockwise for stable currents—makes the shard glow blue. Counter-clockwise means trouble—green glow. No swirl’s a null zone—white glow. Damp’s for when it’s overloading—red glow, but careful, it’s risky. Outer current’s spinning right now, shard’s pulsing blue. Match it, then watch the fog shift. Don’t screw up the sequence, and keep clear of the red crystal! First setting—what’s it?'",
            options: [
                {
                    text: "Set the shard to pulse for the blue glow.",
                    nextId: "step_one_correct"
                },
                {
                    text: "Set the shard to hum for stability.",
                    nextId: "step_one_wrong"
                },
                {
                    text: "Set the shard to flare for the clockwise current.",
                    nextId: "step_one_wrong"
                },
                {
                    text: "Set the shard to damp to prevent overload.",
                    nextId: "step_one_damp_mistake"
                }
            ]
        },
        {
            id: "step_one_correct",
            text: "The compass hums, its needle steadying as you set the shard to pulse, matching the blue glow. Joren grunts. 'Not dead yet, huh? Fog’s shifting—inner current’s spinning left, shard’s glowing green. Match it quick, before the [fog|fog|Tech-corrupter] twists it!' *Mistake count: 0*",
            options: [
                {
                    text: "Set the shard to hum for the green glow.",
                    nextId: "step_two_correct"
                },
                {
                    text: "Set the shard to pulse to maintain the blue glow.",
                    nextId: "step_two_wrong"
                },
                {
                    text: "Set the shard to flare for the counter-clockwise current.",
                    nextId: "step_two_wrong"
                },
                {
                    text: "Adjust the red crystal to stabilize the shift.",
                    nextId: "red_crystal_mistake"
                }
            ]
        },
        {
            id: "step_one_wrong",
            text: "The compass sparks, its needle jerking wildly. Joren curses. 'Wrong! Blue glow’s clockwise—pulse, not that garbage! You’re stressing the shard!' He resets it, glaring. 'Try again, and don’t make me regret this! Fog’s still clockwise, blue glow.' *Mistake count: 1*",
            options: [
                {
                    text: "Set the shard to pulse for the blue glow.",
                    nextId: "step_one_correct"
                },
                {
                    text: "Set the shard to flare for the clockwise current.",
                    nextId: "step_one_wrong_again"
                },
                {
                    text: "Set the shard to damp to calm the sparks.",
                    nextId: "step_one_damp_mistake"
                }
            ]
        },
        {
            id: "step_one_wrong_again",
            text: "Another spark, and Joren’s prosthetic nearly shorts out. 'You’re killing it, Taryn! Clockwise, blue—pulse! One more screw-up, and this shard’s toast!' The fog swirls clockwise, shard glowing blue. *Mistake count: 2*",
            options: [
                {
                    text: "Set the shard to pulse for the blue glow.",
                    nextId: "step_one_correct"
                },
                {
                    text: "I can’t do this. I’m out.",
                    nextId: "failure"
                }
            ]
        },
        {
            id: "step_one_damp_mistake",
            text: "You set the shard to damp, and the compass screeches, glowing red. Joren yanks it back. 'Damp’s for overloads, not currents! You’re begging for [Pulsefinders|pulsefinders|Cultists] to swarm us!' He resets it, fuming. 'Clockwise, blue—get it right!' *Mistake count: 1*",
            options: [
                {
                    text: "Set the shard to pulse for the blue glow.",
                    nextId: "step_one_correct"
                },
                {
                    text: "Set the shard to hum for stability.",
                    nextId: "step_one_wrong"
                }
            ]
        },
        {
            id: "red_crystal_mistake",
            text: "You touch the red crystal, and the compass wails, fog pulsing ominously. Joren smacks your hand away. 'Idiot! That crystal’s a fog-beacon! You want beasts on us?' He resets it, shaking. 'Stick to the shard, Taryn! Whatever step you’re on, try again!' *Mistake count: 2*",
            options: [
                {
                    text: "Return to the current step and try again.",
                    nextId: null // Dynamic based on previous node, e.g., step_one_wrong or step_two_wrong
                },
                {
                    text: "This is too much. I’m done.",
                    nextId: "failure"
                }
            ]
        },
        {
            id: "step_two_correct",
            text: "The compass steadies, its green glow syncing with the counter-clockwise current as you set the shard to hum. Joren mutters, 'Not bad… yet. Core’s dead still—no swirl, shard’s white. Last step’s tricky—get it wrong, and we’re screwed.' *Mistake count: unchanged*",
            options: [
                {
                    text: "Set the shard to flare for the white glow.",
                    nextId: "step_three_correct"
                },
                {
                    text: "Set the shard to hum to reinforce the green glow.",
                    nextId: "step_two_wrong"
                },
                {
                    text: "Set the shard to damp for the still core.",
                    nextId: "step_two_damp_mistake"
                },
                {
                    text: "Set the shard to pulse as a precaution.",
                    nextId: "step_two_wrong"
                }
            ]
        },
        {
            id: "step_two_wrong",
            text: "The compass jolts, green glow flickering. Joren snarls, 'Counter-clockwise is hum, not that! You’re throwing the matrix off!' He resets it, fog thickening. 'Left swirl, green glow—do it right!' *Mistake count: +1*",
            options: [
                {
                    text: "Set the shard to hum for the green glow.",
                    nextId: "step_two_correct"
                },
                {
                    text: "Set the shard to flare for the counter-clockwise current.",
                    nextId: "step_two_wrong_again"
                },
                {
                    text: "Set the shard to damp to stabilize it.",
                    nextId: "step_two_damp_mistake"
                }
            ]
        },
        {
            id: "step_two_wrong_again",
            text: "The compass screeches, nearly overloading. Joren’s voice cracks. 'Hum, Taryn! Green glow! One more mistake, and this thing’s scrap!' Fog swirls left, green glow. *Mistake count: +1*",
            options: [
                {
                    text: "Set the shard to hum for the green glow.",
                    nextId: "step_two_correct"
                },
                {
                    text: "I’m out. This is impossible.",
                    nextId: "failure"
                }
            ]
        },
        {
            id: "step_two_damp_mistake",
            text: "You set the shard to damp, and the compass glows red, shuddering. Joren roars, 'Damp’s for overloads, not currents! You’re risking a shard-burst!' He resets it, fog pulsing. 'Counter-clockwise, green—focus!' *Mistake count: +1*",
            options: [
                {
                    text: "Set the shard to hum for the green glow.",
                    nextId: "step_two_correct"
                },
                {
                    text: "Set the shard to pulse for stability.",
                    nextId: "step_two_wrong"
                }
            ]
        },
        {
            id: "step_three_correct",
            text: "You set the shard to flare, and the compass locks onto the white glow, needle pointing true. Joren stares, stunned. 'Fog me… you actually did it. This thing’s singing for [Fogscar Vault|fogscar_vault|Buried ruin]. Take it, Taryn—you’ve earned it, barely.' *Mistake count: unchanged*",
            options: [
                {
                    text: "Take the compass and thank Joren.",
                    nextId: "success"
                }
            ]
        },
        {
            id: "step_three_wrong",
            text: "The compass sparks violently, white glow fading. Joren yanks it back. 'Null zone’s flare, not that junk! You’ve pushed it too far!' He tries to reset it, but it’s damaged. 'This is on you, Taryn!' *Mistake count: +1*",
            options: [
                {
                    text: "Apologize and take what’s left.",
                    nextId: "partial_success"
                }
            ]
        },
        {
            id: "step_three_damp_mistake",
            text: "You set the shard to damp, and the compass wails, red glow pulsing. Joren screams, 'Not damp! You’ve fried it!' The shard cracks, useless. 'Get out, Taryn! You’ve ruined everything!' *Mistake count: +1*",
            options: [
                {
                    text: "Leave in shame.",
                    nextId: "failure"
                }
            ]
        },
        {
            id: "step_three_overload",
            text: "The compass overloads, shard glowing red-hot. Joren throws it into the fog, cursing. 'Too many mistakes, Taryn! You’ve destroyed it! No [Fogscar Vault|fogscar_vault|Buried ruin] for you—or us!' *Mistake count: maxed*",
            options: [
                {
                    text: "Flee before Joren attacks.",
                    nextId: "failure"
                }
            ]
        },
        {
            id: "success",
            text: "Joren hands you the calibrated fog compass, its glow steady. 'This’ll lead to [Fogscar Vault|fogscar_vault|Buried ruin]—don’t break it. Tell Sylvara I’m done with her strays. And Taryn? Don’t cross me again.' He turns away, muttering about [Pulsefinders|pulsefinders|Cultists].",
            options: [
                {
                    text: "Return to Sylvara with the compass.",
                    nextId: null,
                    action: [
                        { type: "openDialogue", npcId: "sylvara_tidewalker", dialogueId: "archive_success" }
                    ]
                }
            ]
        },
        {
            id: "partial_success",
            text: "Joren tosses you a damaged compass, its needle twitching. 'It’s half-fried, thanks to you. Might work, might not. Tell Sylvara you barely scraped by. Now get outta my sight!' He storms off, prosthetic sparking.",
            options: [
                {
                    text: "Take the damaged compass and leave.",
                    nextId: null,
                    action: { type: "completeQuest", questId: "compass_calibration", outcome: "partial" }
                }
            ]
        },
        {
            id: "failure",
            text: "Joren’s prosthetic glows dangerously as he points to the fog. 'You’ve cost us the [Ashen Archive|ashen_archive|Lost library], Taryn! Driftkin don’t forget screw-ups like this. Get lost, and don’t show your face ‘til you’ve got something worth my shards!'",
            options: [
                {
                    text: "Leave and face Sylvara’s judgment.",
                    nextId: null,
                    action: { type: "failQuest", questId: "compass_calibration" }
                }
            ]
        }
    ]
};