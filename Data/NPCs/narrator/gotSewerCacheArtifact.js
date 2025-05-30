export default {
    nodes: [
        {
            id: "start",
            text: "The fog-touched scavenger leader collapses, their tattered cloak pooling in the murky water of the sewer. A low groan echoes through the damp tunnels as the air grows heavy. In a chest hidden under the rubble, you spot a glint— the bluish glow of magic surrounding a piece of fabric. Its jagged edges seem to hum with the same unnatural fog that clings to the walls, and touching it sends a shiver up your spine.",
            options: [
                {
                    text: "Take the shard",
                    nextId: null,
                    action: [
                        { type: "addItem", itemId: "tapestryFragment", quantity: 1 },
                        { type: "travelToMap", mapId: "rustmarketSewers" }
                    ]
                }
            ]
        }
    ]
};