export default {
    nodes: [
        {
            id: "start",
            text: "*Lyra watches the last embers of the ritual fade, her expression a mix of satisfaction and concern* The fog has been driven back. For now. *She turns to you, the glow of the ritual fires still reflecting in her eyes* Drenvar tells me you showed remarkable control during the ritual. The flames responded to you as if you were born to wield them.",
            options: [
                {
                    text: "The ritual was... intense.",
                    nextId: "ritual_reflection"
                },
                {
                    text: "I felt a connection to the flames.",
                    nextId: "flame_connection"
                }
            ]
        },
        {
            id: "ritual_reflection",
            text: "*Lyra nods, a small smile playing on her lips* Intense is one word for it. The fog fights back harder each time we perform the ritual. It's learning. Adapting. *Her expression grows serious* But so are we. Your presence today... it made the ritual stronger than I've seen in years.",
            options: [
                {
                    text: "What does that mean?",
                    nextId: "ritual_significance"
                },
                {
                    text: "I'm honored to have helped.",
                    nextId: null,
                    action: { 
                        type: "completeQuest",
                        questId: "embercladsTrial"
                    }
                }
            ]
        },
        {
            id: "flame_connection",
            text: "*Lyra's eyes light up with interest* A natural affinity for the flames. That's rare. *She steps closer, studying you intently* The Emberclad have always believed that some souls are born with a spark of the eternal flame. It seems you might be one of them.",
            options: [
                {
                    text: "What does that mean for me?",
                    nextId: "emberclad_potential"
                },
                {
                    text: "I'm not sure I understand.",
                    nextId: "flame_explanation"
                }
            ]
        },
        {
            id: "ritual_significance",
            text: "*Lyra gestures to the ritual circle* The fog is growing stronger. More intelligent. It's not just a force of nature anymore - it's becoming something else. Something that thinks. That plans. *Her voice grows firm* We need warriors who can stand against it. Who can wield the flames not just as a weapon, but as a shield for our people.",
            options: [
                {
                    text: "I want to help protect Hollowreach.",
                    nextId: null,
                    action: { 
                        type: "completeQuest",
                        questId: "embercladsTrial"
                    }
                },
                {
                    text: "The fog is changing?",
                    nextId: "fog_evolution"
                }
            ]
        },
        {
            id: "emberclad_potential",
            text: "*Lyra's expression is both proud and solemn* It means you have a choice. The path of the Emberclad is not an easy one. The fog will test you. The flames will demand much of you. *She offers you a small, glowing rune* But if you choose to walk this path, you'll never walk it alone.",
            options: [
                {
                    text: "I choose to stand with the Emberclad.",
                    nextId: null,
                    action: { 
                        type: "completeQuest",
                        questId: "embercladsTrial"
                    }
                },
                {
                    text: "I need time to think.",
                    nextId: "time_to_think"
                }
            ]
        },
        {
            id: "flame_explanation",
            text: "*Lyra's voice takes on a teaching tone* The eternal flame is more than just fire. It's the spark of resistance against the fog. The light that keeps the darkness at bay. *She gestures to the ritual circle* What you felt today was that spark recognizing you. Calling to you.",
            options: [
                {
                    text: "I want to learn more.",
                    nextId: "emberclad_potential"
                },
                {
                    text: "I need to process this.",
                    nextId: "time_to_think"
                }
            ]
        },
        {
            id: "fog_evolution",
            text: "*Lyra's expression darkens* Yes. It's learning from us. From our rituals. Our defenses. Each time we drive it back, it comes back stronger. More cunning. *She looks at the ritual circle* That's why we need warriors like you. People who can adapt. Who can grow with the flames.",
            options: [
                {
                    text: "I'll stand with you against the fog.",
                    nextId: null,
                    action: { 
                        type: "completeQuest",
                        questId: "embercladsTrial"
                    }
                }
            ]
        },
        {
            id: "time_to_think",
            text: "*Lyra nods understandingly* The path of the Emberclad is not one to choose lightly. *She offers you the glowing rune* Take this. When you're ready to make your choice, the flame will guide you back to us.",
            options: [
                {
                    text: "Thank you for understanding.",
                    nextId: null,
                    action: { 
                        type: "completeQuest",
                        questId: "embercladsTrial"
                    }
                }
            ]
        }
    ]
}; 