export default {
    nodes: [
        {
            id: "start",
            text: "By the order of the Loomkeepers guild noone is allowed entry to the docks. Fog covers the whole area.",
            options: [
                {
                    text: "I need to get through. Can we work something out?",
                    nextId: "negotiate"
                },
                {
                    text: "Fine.",
                    nextId: null
                }
            ]
        },
        {
            id: "negotiate",
            text: "Hmm... *The guard looks you up and down* There might be a few ways we could arrange this. But it won't be free.",
            options: [
                {
                    text: "Maybe a token of appreciation? How does a 100 gold coin sound?",
                    nextId: "bribe_offer",
                    conditions: [
                        { type: "item", itemId: "gold", quantity: 100 }
                    ]
                },
                {
                    text: "*Try to sneak past*",
                    nextId: "got_through",
                    conditions: [
                        { type: "skill", itemId: "dexterity", quantity: 20 }
                    ]
                },
                {
                    text: "I'll talk to Vrenna about this.",
                    nextId: "vrenna_suggestion"
                },
                {
                    text: "Never mind.",
                    nextId: null
                }
            ]
        },
        {
            id: "bribe_offer",
            text: "*The guard's eyes narrow* 100 gold. That's my price. And you never saw me.",
            options: [
                {
                    text: "Here's your gold.",
                    nextId: "got_through",
                    action: [
                        { type: "removeGold", amount: 100 },
                        
                    ]
                    
                },
                {
                    text: "That's too much.",
                    nextId: null
                }
            ]
        },
        {
            id: "vrenna_suggestion",
            text: "Yeah, whatever. If you think it will help."
            
        },
        {
            id: "got_through",
            text: "You managed to get through.",
            action: [
            { type: "unlockPOI", mapId: "hollowreach", poiId: "foggedDocks_open" },
            { type: "hidePOI", mapId: "hollowreach", poiId: "foggedDocks" },
            { type: "travelToMap", mapId: "foggedDocks" }
            ]
        }
    ]
};