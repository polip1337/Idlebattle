export default {
    name: "Old Maris",
    portrait: "Media/NPC/old_maris.jpg",
    faction: "unaligned",
    dialogues: {
        // Location-based dialogue organization
        orphansHollow: [
            {
                id: "cache_return",
                conditions: [
                    {
                        type: "item",
                        itemId: "foodSupplies"
                    }
                ],
                priority: 3
            },
            {
                id: "base",
                conditions: [], // No conditions - this is the default dialogue
                priority: 1
            }
        ],
        // Default dialogue for any other location
        default: [
            {
                id: "base",
                conditions: [], // No conditions - this is the default dialogue
                priority: 0
            }
        ]
    },
    tradeInventory: ["fogCharm", "healingPotion"]
}; 