export default {
    nodes: [
        
        {
            id: "start",
            text: "*Drenvar stands in the center of the ritual circle, their hands moving in precise patterns as they tend the sacred flames* The ritual is almost ready. The fog has been particularly aggressive lately, trying to corrupt our sacred flames. But today... today we will show it the true power of the Emberclad.",
            options: [
                {
                    text: "What can I do to help?",
                    nextId: "ritual_help"
                },
                {
                    text: "I'll watch and learn.",
                    nextId: "ritual_observation"
                }
            ]
        },
        {
            id: "ritual_help",
            text: "*Drenvar's eyes glow with the reflection of the flames* Your presence here is help enough. The ritual draws strength from those who stand against the fog. *They gesture to a specific spot in the circle* Stand there. Let the flames guide you. When the time comes, you'll know what to do.",
            options: [
                {
                    text: "I'm ready.",
                    nextId: "ritual_beginning"
                },
                {
                    text: "What should I expect?",
                    nextId: "ritual_warning"
                }
            ]
        },
        {
            id: "ritual_warning",
            text: "*The flames flicker ominously* The fog will try to interfere. It always does. It will show you visions, whisper lies, try to turn the flames against us. *Their voice grows firm* Remember - the fire is our ally. It burns away corruption. Trust in its light.",
            options: [
                {
                    text: "I understand.",
                    nextId: "ritual_beginning"
                },
                {
                    text: "Maybe I should just watch.",
                    nextId: "ritual_observation"
                }
            ]
        },
        {
            id: "ritual_observation",
            text: "*Drenvar nods approvingly* Wisdom in caution. Watch closely. Learn the patterns. The flames speak to those who listen. *They begin to chant, the fire responding to their words* When you're ready to take part, you'll know.",
            options: [
                {
                    text: "I want to help now.",
                    nextId: "ritual_help"
                },
                {
                    text: "I'll keep watching.",
                    nextId: "ritual_beginning"
                }
            ]
        },
        {
            id: "ritual_beginning",
            text: "*The flames rise higher, forming a protective circle around the ritual space* The fog approaches. I can feel it. *Drenvar's voice takes on a rhythmic quality* Stand firm. The flames will protect us. The ritual will purify this place.",
            options: [
                {
                    text: "I see the fog coming.",
                    nextId: "ritual_confrontation"
                },
                {
                    text: "The flames are growing stronger.",
                    nextId: "ritual_confrontation"
                }
            ]
        },
        {
            id: "ritual_confrontation",
            text: "*The fog seeps into the ritual circle, but the flames push it back* Now! Focus your will on the flames. Let them burn away the corruption. *Drenvar's voice rises in intensity* Together, we are stronger than the fog!",
            options: [
                {
                    text: "I can feel the power!",
                    nextId: "ritual_victory"
                },
                {
                    text: "The fog is retreating!",
                    nextId: "ritual_victory"
                }
            ]
        },
        {
            id: "ritual_victory",
            text: "*The flames surge, driving back the fog completely* We've done it! The ritual is complete. *Drenvar's face is alight with triumph* The fog has been purged from this place. For now. *They turn to you, respect evident in their gaze* You have the heart of an Emberclad. The flames recognized your strength.",
            options: [
                {
                    text: "Thank you for teaching me.",
                    nextId: null,
                    action: { 
                        type: "completeQuest",
                        questId: "embercladsTrial"
                    }
                },
                {
                    text: "The fog will be back.",
                    nextId: "ritual_warning_future"
                }
            ]
        },
        {
            id: "ritual_warning_future",
            text: "*Drenvar's expression grows serious* Yes. It always returns. Stronger. More cunning. *They gesture to the still-burning ritual flames* But so do we. Each time we drive it back, we learn. We grow. We become stronger. *They offer you a small, glowing ember* Take this. A reminder of today's victory. And a promise of future battles.",
            options: [
                {
                    text: "I'll be ready.",
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