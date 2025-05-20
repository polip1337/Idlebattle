export default {
    nodes: [
        {
            id: "start",
            text: "*A hooded figure steps from the shadows* You're not scavengers. What brings you to these sewers?",
            options: [
                {
                    text: "We're looking for information about the fog-touched scavengers.",
                    nextId: "scavenger_info"
                },
                {
                    text: "We're just passing through.",
                    nextId: null
                }
            ]
        },
        {
            id: "scavenger_info",
            text: "The scavengers? *looks around nervously* They've been causing trouble for everyone down here. Taking things that don't belong to them. What's it worth to you?",
            options: [
                {
                    text: "We can pay for information.",
                    nextId: "payment_offer",
                    conditions: [{ type: "gold", value: 50 }]
                },
                {
                    text: "The Loomkeepers would be grateful for your help.",
                    nextId: "loomkeeper_angle"
                },
                {
                    text: "Maybe we can help each other. What do you need?",
                    nextId: "favor_offer"
                }
            ]
        },
        {
            id: "payment_offer",
            text: "50 gold pieces, and I'll tell you everything I know about their hideout.",
            options: [
                {
                    text: "Here's your payment.",
                    nextId: "reveal_location",
                    action: [
                        { type: "removeGold", value: 50 },
                        { type: "unlockPOI", mapId: "rustmarketSewers", poiId: "sewer_scavengerRedoubt_POI" }
                    ]
                },
                {
                    text: "That's too much. Let's talk about something else.",
                    nextId: "favor_offer"
                }
            ]
        },
        {
            id: "loomkeeper_angle",
            text: "The Loomkeepers? *shifts uncomfortably* They've been good to us down here. Maybe I can help... but you'll need to do something for me first. There's a group of Driftkin causing trouble in the lower sewers. Deal with them, and I'll tell you what I know.",
            options: [
                {
                    text: "We'll handle the Driftkin.",
                    nextId: "driftkin_task",
                    action: { type: "startQuest", questId: "sewer_driftkin" }
                },
                {
                    text: "We don't have time for that.",
                    nextId: "payment_offer"
                }
            ]
        },
        {
            id: "favor_offer",
            text: "What I need... *pauses thoughtfully* The scavengers have been stealing from everyone, including me. If you can get my things back, I'll tell you where to find their main hideout.",
            options: [
                {
                    text: "What did they take from you?",
                    nextId: "stolen_items"
                },
                {
                    text: "We'll pay you instead.",
                    nextId: "payment_offer"
                }
            ]
        },
        {
            id: "stolen_items",
            text: "A family heirloom - an old compass that belonged to my grandfather. It's not valuable to anyone else, but it means everything to me. The scavengers took it last week when they raided my hideout.",
            options: [
                {
                    text: "We'll find your compass.",
                    nextId: "compass_task",
                    action: { type: "startQuest", questId: "sewer_compass" }
                },
                {
                    text: "We don't have time for this.",
                    nextId: "payment_offer"
                }
            ]
        },
        {
            id: "reveal_location",
            text: "The scavengers have set up their main camp in an old maintenance chamber. It's heavily guarded, but with that amulet of yours, you might stand a chance. *draws a rough map in the dirt* Here's how to find it.",
            options: [
                {
                    text: "Thank you for your help.",
                    nextId: null
                }
            ]
        }
    ]
}; 