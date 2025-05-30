export default {
    nodes: [
        {
            id: "start",
            text: "*Old Maris's eyes widen as she notices the supplies* By the fog... you found it! The cache behind Ironspire Bridge. *She looks at you with a mix of hope and concern* What do you plan to do with it? The Hollow could use these supplies, but... *she hesitates* I know you need to look after yourself too.",
            options: [
                {
                    text: "I'll distribute the supplies to the Hollow.",
                    nextId: "distributeCache",
                    action: [
                        { type: "removeItem", itemId: "foodSupplies", quantity: 1 },
                        { type: "completeQuest", questId: "hollowsCache", choice: "distribute" }
                    ]
                },
                {
                    text: "I need to keep these for myself.",
                    nextId: "keepCache",
                    action: [
                        { type: "removeItem", itemId: "foodSupplies", quantity: 1 },
                        { type: "completeQuest", questId: "hollowsCache", choice: "keep" }
                    ]
                },
                {
                    text: "I could sell these in Rustmarket.",
                    nextId: "sellCache",
                    action: [
                        { type: "removeItem", itemId: "foodSupplies", quantity: 1 },
                        { type: "addGold", amount: 75 },
                        { type: "completeQuest", questId: "hollowsCache", choice: "sell" }
                    ]
                }
            ]
        },
        {
            id: "distributeCache",
            text: "*Maris's weathered face breaks into a smile* You're a good soul, Taryn. The Hollow won't forget this. *She begins organizing the supplies* I'll make sure these go to the ones who need it most. The council might not care about us, but we look after our own.",
            options: [
                {
                    text: "Is there anything else I can do to help?",
                    nextId: "more_help"
                },
                {
                    text: "I should get going.",
                    nextId: null
                }
            ]
        },
        {
            id: "keepCache",
            text: "*Maris nods slowly* I understand. You need to survive too. *She looks at you with knowing eyes* Just remember, Taryn - sometimes helping others is the best way to help yourself. The Hollow's always been your home, even if the council says otherwise.",
            options: [
                {
                    text: "I'll remember that.",
                    nextId: null
                }
            ]
        },
        {
            id: "sellCache",
            text: "*Maris's expression hardens slightly* Gold's important, I know. But remember who you are, Taryn. The city changes people. *She sighs* Just... be careful in Rustmarket. Not everyone's as honest as they seem.",
            options: [
                {
                    text: "I'll be careful.",
                    nextId: null
                }
            ]
        },
        {
            id: "more_help",
            text: "*Maris thinks for a moment* There's always work to be done. The scavengers have been getting bolder, and the fog's been acting strange near the bridge. *She lowers her voice* If you're heading that way, keep an eye out for anything unusual. The Loomkeepers might be interested in what you find.",
            options: [
                {
                    text: "I'll keep that in mind.",
                    nextId: null
                }
            ]
        }
    ]
}; 