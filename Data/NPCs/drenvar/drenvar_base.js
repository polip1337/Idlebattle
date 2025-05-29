export default {
    nodes: [
        {
            id: "start",
            text: "*Drenvar stands by the ritual fire in [Cinderhold|cinderhold|The Emberclad's stronghold], their hands moving in practiced patterns as they tend the flames* You've completed the trial. That means you understand the importance of our work here. The fog may be growing stronger, but so are we. *They look up, their face marked with ritual scars* What brings you to the ritual grounds?",
            options: [
                {
                    text: "I want to learn more about your rituals.",
                    nextId: "ritual_knowledge",
                    conditions: [
                        { type: "questCompleted", questId: "embercladsTrial" }
                    ],
                    hideWhenUnavailable: true
                },
                {
                    text: "I'm looking for Lyra.",
                    nextId: "lyra_reference"
                },
                {
                    text: "Just passing through.",
                    nextId: "passing_through"
                }
            ]
        },
        {
            id: "ritual_knowledge",
            text: "*Drenvar's eyes light up with passion* The rituals are more than just fire and smoke. They're a connection to something ancient. Something powerful. *They gesture to the ritual circle* Each flame, each movement, each word... they all have meaning. They all have power. The fog fears this power. That's why it tries to corrupt our rituals, to turn them against us.",
            options: [
                {
                    text: "Can you teach me these rituals?",
                    nextId: "ritual_teaching"
                },
                {
                    text: "How do you protect against corruption?",
                    nextId: "corruption_protection"
                }
            ]
        },
        {
            id: "lyra_reference",
            text: "*Drenvar nods respectfully* Lyra leads us well. She's in the [Scorchveil Pit|scorchveilPit|Where our most powerful rituals are performed], preparing for the next fog-burning ceremony. *Their expression grows serious* The fog has been particularly aggressive lately. We need to strengthen our defenses.",
            options: [
                {
                    text: "I can help with the ceremony.",
                    nextId: "ceremony_help"
                },
                {
                    text: "I'll find her there.",
                    nextId: null
                }
            ]
        },
        {
            id: "ceremony_help",
            text: "*Drenvar's eyes light up with hope* Your help would be most welcome. The ceremony requires strength, focus, and a pure heart. *They gesture toward the Scorchveil Pit* Speak with Lyra. She'll guide you through the preparations.",
            options: [
                {
                    text: "I'll go to her now.",
                    nextId: null
                },
                {
                    text: "What should I expect?",
                    nextId: "ceremony_expectations"
                }
            ]
        },
        {
            id: "ceremony_expectations",
            text: "*Drenvar's expression grows serious* The ceremony is intense. The flames will test you, challenge you. But if your heart is true, they will protect you. *They look toward the pit* The fog fears our fire. Together, we can push it back.",
            options: [
                {
                    text: "I understand. I'll go to Lyra.",
                    nextId: null
                }
            ]
        },
        {
            id: "ritual_teaching",
            text: "*Drenvar considers you carefully* Teaching the rituals... it's not just about learning the words or the movements. It's about understanding the fire. Feeling its power. *They extend a hand, a small flame dancing in their palm* The first step is learning to listen to the flames. To hear what they tell you about the fog.",
            options: [
                {
                    text: "I'm ready to learn.",
                    nextId: "ritual_beginning"
                },
                {
                    text: "Maybe I'm not ready yet.",
                    nextId: null
                }
            ]
        },
        {
            id: "ritual_beginning",
            text: "*Drenvar's eyes light up with approval* Good. The first ritual is simple, but powerful. We call it the Flame's Whisper. *They guide your hands into position* Close your eyes. Feel the heat. Listen to what the flames tell you about the fog.",
            options: [
                {
                    text: "I can feel something...",
                    nextId: "ritual_progress"
                },
                {
                    text: "This is harder than I thought.",
                    nextId: "ritual_encouragement"
                }
            ]
        },
        {
            id: "ritual_progress",
            text: "*Drenvar nods approvingly* The connection is forming. The flames recognize your potential. *They gesture to the ritual circle* This is just the beginning. The more you practice, the stronger your connection will become.",
            options: [
                {
                    text: "I want to learn more.",
                    nextId: null,
                    action: { type: "startQuest", questId: "embercladsRitual" }
                },
                {
                    text: "I need to practice this first.",
                    nextId: null
                }
            ]
        },
        {
            id: "ritual_encouragement",
            text: "*Drenvar's expression softens* The first time is always the hardest. The flames are shy. They need to learn to trust you. *They place a hand on your shoulder* Keep trying. The connection will come.",
            options: [
                {
                    text: "I'll keep practicing.",
                    nextId: null
                },
                {
                    text: "Maybe another time.",
                    nextId: null
                }
            ]
        },
        {
            id: "corruption_protection",
            text: "*Their expression darkens* The fog tries to twist our rituals, to use our own power against us. We protect ourselves through purity of purpose. Through understanding. Through the strength of our community. *They gesture to the other Emberclad around them* Alone, we are vulnerable. Together, we are strong.",
            options: [
                {
                    text: "How can I help strengthen the community?",
                    nextId: "community_strength"
                },
                {
                    text: "I understand.",
                    nextId: null
                }
            ]
        },
        {
            id: "community_strength",
            text: "*Drenvar's eyes light up with hope* There are many ways. Help protect our rituals. Share what you learn with others. Stand with us against the fog. *They place a hand on your shoulder* Every person who joins our cause makes us stronger. Every flame we kindle together pushes back the darkness.",
            options: [
                {
                    text: "I'll do what I can.",
                    nextId: null,
                    action: { type: "startQuest", questId: "embercladsCommunity" }
                },
                {
                    text: "I need to think about this.",
                    nextId: null
                }
            ]
        },
        {
            id: "passing_through",
            text: "*Drenvar nods, returning to their work with the ritual fire* The [Cinderhold|cinderhold|Our flame-protected haven] is open to all who seek shelter from the fog. Rest if you need to. The flames will keep you safe. *They look up briefly* But remember - in these times, we all need to stand together against the darkness.",
            options: [
                {
                    text: "Maybe I should stay a while.",
                    nextId: "ritual_knowledge",
                    conditions: [
                        { type: "questCompleted", questId: "embercladsTrial" }
                    ],
                    hideWhenUnavailable: true
                },
                {
                    text: "Thank you for the hospitality.",
                    nextId: null
                }
            ]
        }
    ]
}; 