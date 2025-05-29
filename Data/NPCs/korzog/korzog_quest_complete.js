export default {
    nodes: [
        {
            id: "start",
            text: "*Korzog's eyes glow with an intense light as he examines the enhanced amulet* The Rune Chamber has revealed its secrets to you. The amulet is more than a tool - it's a bridge. A connection between our world and... something else. *His voice grows grave* The fog didn't just appear. It was called. Summoned. And the amulet was meant to be the key to controlling it.",
            options: [
                {
                    text: "Who summoned the fog?",
                    nextId: "fog_origin"
                },
                {
                    text: "What does this mean for the amulet?",
                    nextId: "amulet_future"
                }
            ]
        },
        {
            id: "fog_origin",
            text: "*He looks around cautiously* The Old Empire. They sought power beyond their understanding. The portals that once connected our world to others... they weren't just for travel. They were gates. And when they opened the wrong one... *He shakes his head* The fog was their punishment. Our punishment. The amulet was their last attempt to fix what they had broken.",
            options: [
                {
                    text: "Can we fix it now?",
                    nextId: "fix_attempt"
                },
                {
                    text: "I need to think about this.",
                    nextId: null,
                    action: { 
                        type: "completeQuest",
                        questId: "mistwalkerSecret"
                    }
                }
            ]
        },
        {
            id: "amulet_future",
            text: "*He holds the amulet up, watching the light play across its surface* The amulet is changing. Adapting. Just like the fog. It's becoming something new. Something powerful. *He offers it back to you* Keep it. Use it wisely. The factions will want it - the Driftkin to understand it, the Loomkeepers to study it, the Emberclad to destroy it. But its true purpose... that's for you to discover.",
            options: [
                {
                    text: "I'll be careful with it.",
                    nextId: null,
                    action: { 
                        type: "completeQuest",
                        questId: "mistwalkerSecret"
                    }
                },
                {
                    text: "Maybe it should be destroyed.",
                    nextId: null,
                    action: { 
                        type: "completeQuest",
                        questId: "mistwalkerSecret"
                    }
                }
            ]
        },
        {
            id: "fix_attempt",
            text: "*A dark laugh echoes through the chamber* Fix it? The fog is part of our world now. It's changing us, just as we changed it. The amulet... it's not a solution. It's a tool. A weapon. A key. What you do with it... that's what matters now. *He gestures to the exit* The factions will want to know what you've learned. Choose wisely who you tell.",
            options: [
                {
                    text: "I understand.",
                    nextId: null,
                    action: { 
                        type: "completeQuest",
                        questId: "mistwalkerSecret"
                    }
                }
            ]
        }
    ]
}; 