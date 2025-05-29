export default {
    name: "Renn Quickfingers",
    portrait: "Media/NPC/renn_quickfingers.jpg",
    dialogues: {
        // Location-based dialogue organization
        rennsHouse: [
            {
                id: "mistwalker_intro",
                conditions: [
                    {
                        type: "quest",
                        questId: "mistwalkerSecret",
                        status: "active"
                    },
                     {
                         type: "questStep",
                         questId: "mistwalkerSecret",
                         stepIndex: 0
                     }
                ],
                priority: 3
            },
            {
                id: "renn_mistwalker_Active",
                conditions: [
                    {
                        type: "quest",
                        questId: "mistwalkerSecret",
                        status: "active"
                    },
                    {
                        type: "questStep",
                        questId: "mistwalkerSecret",
                        stepIndex: 2
                    }
                ],
                priority: 2
            },
            {
                id: "renn_base",
                conditions: [], // No conditions - this is the default dialogue for Renn's house
                priority: 1
            }
        ],
        tavern: [
            {
                id: "renn_tavern",
                conditions: [], // No conditions needed since location is handled by the parent structure
                priority: 1
            }
        ],
        // Default dialogue for any other location
        default: [
            {
                id: "renn_base",
                conditions: [], // No conditions - this is the default dialogue
                priority: 0
            }
        ]
    },
    "canTrade": true,
    "gold": 500,
    "barterThreshold": 0,
    "tradeInventory": [
      { "id": "healing_potion_minor_001", "quantity": 10 },
      { "id": "simple_sword_001", "quantity": 2 },
      { "id": "worn_leather_helmet_001", "quantity": 1 }
    ],
};