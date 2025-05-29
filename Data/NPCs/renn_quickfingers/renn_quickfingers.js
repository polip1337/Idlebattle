export default {
    name: "Renn Quickfingers",
    portrait: "Media/NPC/renn_quickfingers.jpg",
    dialogues: [
        {
            id: "renn_base",
            conditions: [] // No conditions - this is the default dialogue
        },
        {
            id: "mistwalker_intro",
            conditions: [
                {
                    type: "quest",
                    questId: "mistwalkerSecret",
                    status: "not_started"
                },
                {
                    type: "location",
                    locationId: "rennsHouse"
                }
            ],
            priority: 3
        },
        {
            id: "renn_questActive",
            conditions: [
                {
                    type: "quest",
                    questId: "mistwalkerSecret",
                    status: "active"
                }
            ],
            priority: 2
        },
        
        {
            id: "renn_tavern",
            conditions: [
                {
                    type: "location",
                    locationId: "tavern"
                }
            ],
            priority: 1
        }
    ],
    "canTrade": true,
    "gold": 500,
    "barterThreshold": 0,
    "tradeInventory": [
      { "id": "healing_potion_minor_001", "quantity": 10 },
      { "id": "simple_sword_001", "quantity": 2 },
      { "id": "worn_leather_helmet_001", "quantity": 1 }
    ],
};