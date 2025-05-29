export default {
    nodes: [
        {
            id: "start",
            text: "*Vrenna carefully examines the tapestry fragment, her fingers tracing the ancient patterns* The weave... it's more than just thread and dye. Each strand tells a story, holds a memory of the world before the fog. *She looks up, her eyes alight with scholarly fervor* You've done well, bringing this back. The Loomkeepers will preserve this knowledge, study it... perhaps even use it to understand what happened to our world.",
            options: [
                {
                    text: "What do you think happened to the world?",
                    nextId: "world_theory"
                },
                {
                    text: "I'm glad I could help preserve this piece of history.",
                    nextId: null,
                    action: { 
                        type: "completeQuest",
                        questId: "proofForTheWeave"
                    }
                }
            ]
        },
        {
            id: "world_theory",
            text: "*She lowers her voice, glancing around the Threadhall* The patterns in this tapestry... they match fragments we've found in the Ashen Archive. The fog didn't just appear - it was summoned, or perhaps unleashed. The portals that once connected our world to others... they didn't just collapse. They were... transformed. *She quickly changes the subject* But that's a discussion for another time. Take your reward - you've earned it, and perhaps more importantly, you've proven yourself trustworthy to the Loomkeepers.",
            options: [
                {
                    text: "I'd like to learn more about these patterns.",
                    nextId: null,
                    action: { 
                        type: "completeQuest",
                        questId: "proofForTheWeave"
                    }
                },
                {
                    text: "Thank you for the reward.",
                    nextId: null,
                    action: { 
                        type: "completeQuest",
                        questId: "proofForTheWeave"
                    }
                }
            ]
        }
    ]
}; 