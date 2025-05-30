export default {
    name: "Old Maris",
    portrait: "Media/NPC/old_maris.jpg",
    faction: "unaligned",
    dialogues: {
        // Location-based dialogue organization
        hollowreach: [
            {
                id: "old_maris_cache_return",
                conditions: [
                    {
                        type: "item",
                        itemId: "foodSupplies"
                    }
                ],
                priority: 3
            },
            {
                id: "old_maris_base",
                conditions: [], // No conditions - this is the default dialogue
                priority: 1
            }
        ],
        // Default dialogue for any other location
        default: [
            {
                id: "old_maris_base",
                conditions: [], // No conditions - this is the default dialogue
                priority: 0
            }
        ]
    },
    tradeInventory: ["fogCharm", "healingPotion"]
}; 