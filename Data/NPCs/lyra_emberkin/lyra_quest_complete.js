export default {
    nodes: [
        {
            id: "start",
            text: "*Lyra's eyes glow with the embers of the ritual* The fog recoils from our flames, but it always returns. Stronger. Hungrier. *She clenches her fist, causing small flames to dance between her fingers* You've proven yourself in the Scorchveil Pit. The Emberclad need warriors like you - those who understand that sometimes, the only way to fight darkness is with fire.",
            options: [
                {
                    text: "The fog seems to be getting worse.",
                    nextId: "fog_warning"
                },
                {
                    text: "I'm honored to have helped the Emberclad.",
                    nextId: "quest_complete",
                    action: { 
                        type: "completeQuest",
                        questId: "embercladsTrial"
                    }
                }
            ]
        },
        {
            id: "quest_complete",
            text: "*Lyra's eyes glow with the embers of the ritual* The fog recoils from our flames, but it always returns. Stronger. Hungrier. *She clenches her fist, causing small flames to dance between her fingers* You've proven yourself in the Scorchveil Pit. The Emberclad need warriors like you - those who understand that sometimes, the only way to fight darkness is with fire.",
            options: [
                {
                    text: "The fog seems to be getting worse.",
                    nextId: "fog_warning"
                },
                {
                    text: "I'm honored to have helped the Emberclad.",
                    nextId: null,
                    action: { 
                        type: "completeQuest",
                        questId: "embercladsTrial"
                    }
                }
            ]
        },
        {
            id: "fog_warning",
            text: "*The flames in her hand grow more intense* It's not just getting worse - it's learning. Adapting. The fog that once only corrupted flesh now seeks to consume our very essence. The ritual we performed today... it's just the beginning. We need to be ready for what's coming. *She offers you the Pyromantic Rune* Take this. It's more than a reward - it's a promise. The Emberclad stand with those who fight the darkness.",
            options: [
                {
                    text: "I'll stand with you against the fog.",
                    nextId: null,
                    action: { 
                        type: "completeQuest",
                        questId: "embercladsTrial"
                    }
                },
                {
                    text: "Thank you for the rune.",
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