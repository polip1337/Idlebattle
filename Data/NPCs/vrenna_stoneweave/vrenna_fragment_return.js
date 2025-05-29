export default {
    nodes: [
        {
            id: "start",
            text: "Ah, you've returned with the fragment. Let me examine it closely.",
            options: [
                {
                    text: "Here it is.",
                    nextId: "fragment_return"
                }
            ]
        },
        {
            id: "fragment_return",
            text: "*Vrenna's eyes widen as you present the tapestry fragment. Her hands, usually steady, tremble slightly as she takes it* This... this is more than I dared hope for. *She carefully spreads the fragment on her worktable, the ancient threads glowing faintly* The patterns... they're intact. The weave is still strong. *She looks up at you, her expression a mix of awe and concern* Do you know what this means?",
            options: [
                {
                    text: "What do the patterns show?",
                    nextId: "pattern_meaning"
                },
                {
                    text: "The scavengers were guarding it fiercely.",
                    nextId: "scavenger_interest"
                }
            ]
        },
        {
            id: "pattern_meaning",
            text: "*Vrenna's fingers traced the intricate patterns* These aren't just decorative. They're a map. A record of the portals that once connected our world to others. *Her voice grew more intense* The fog... it came through one of these. The scavengers must have realized this. That's why they were protecting it.",
            options: [
                {
                    text: "Can we use this to stop the fog?",
                    nextId: "fog_solution"
                },
                {
                    text: "What happened to the other portals?",
                    nextId: "portal_history"
                }
            ]
        },
        {
            id: "scavenger_interest",
            text: "*Vrenna nods thoughtfully* The scavengers have been collecting artifacts from the Old Empire. They understand their value better than most. *She studies the fragment more closely* This particular piece... it shows something they've been searching for. A way to control the fog. Or at least, that's what they believe.",
            options: [
                {
                    text: "Is that possible?",
                    nextId: "control_possibility"
                },
                {
                    text: "What do you believe?",
                    nextId: "vrenna_belief"
                }
            ]
        },
        {
            id: "fog_solution",
            text: "*Vrenna's expression grew serious* The fog is part of our world now. It can't be simply stopped. But this... *She gestures to the fragment* This might help us understand it. Learn to live with it. Maybe even communicate with it. *Her voice dropped to a whisper* The Loomkeepers have always believed that the fog is more than just a curse. It's a presence. A consciousness.",
            options: [
                {
                    text: "What will you do with this knowledge?",
                    nextId: "knowledge_use"
                },
                {
                    text: "The other factions won't like this.",
                    nextId: "faction_reaction"
                }
            ]
        },
        {
            id: "portal_history",
            text: "*Vrenna's expression darkened* The Old Empire used them recklessly. They opened gates to worlds they didn't understand. Worlds that didn't want to be found. *She pointed to a specific pattern on the fragment* This one... this is where it all went wrong. Where they opened the gate to the fog's world.",
            options: [
                {
                    text: "Can we close it?",
                    nextId: "gate_closure"
                },
                {
                    text: "What happened to the Empire?",
                    nextId: "empire_fate"
                }
            ]
        },
        {
            id: "control_possibility",
            text: "*Vrenna shook her head* Control is the wrong word. The fog is too powerful. Too... alive. *She traced the patterns again* But understanding? Communication? That might be possible. The Loomkeepers have been studying the fog's patterns. How it moves. How it changes. This fragment... it could be the key to understanding its language.",
            options: [
                {
                    text: "What will you do with this knowledge?",
                    nextId: "knowledge_use"
                },
                {
                    text: "The other factions won't like this.",
                    nextId: "faction_reaction"
                }
            ]
        },
        {
            id: "vrenna_belief",
            text: "*Vrenna's eyes took on a distant look* I believed the fog is trying to tell us something. The way it moves. The patterns it creates. *She gestured to the fragment* These ancient weavers understood that. They recorded it. Preserved it. *Her voice grew more passionate* We need to learn to listen. To understand. Before it's too late.",
            options: [
                {
                    text: "What do you mean, too late?",
                    nextId: "urgency_explanation"
                },
                {
                    text: "How can I help?",
                    nextId: "help_offering"
                }
            ]
        },
        {
            id: "knowledge_use",
            text: "*Vrenna carefully rolled up the fragment* The Loomkeepers will study it. Learn from it. *Her expression grew determined* We need to understand the fog before the other factions try to destroy it. Or worse, try to control it. *She offered you a small, woven token* Take this. A symbol of our gratitude. And a promise - the Loomkeepers will use this knowledge wisely.",
            options: [
                {
                    text: "I trust you to do what's right.",
                    nextId: null,
                    action: { 
                        type: "completeQuest",
                        questId: "proofForTheWeave"
                    }
                }
            ]
        },
        {
            id: "faction_reaction",
            text: "*Vrenna's expression grew grave* No, they won't. The Emberclad will want to destroy it. The Driftkin will want to worship it. The scavengers will want to exploit it. *She looked at you intently* That's why we need to understand it first. To show them there's another way.",
            options: [
                {
                    text: "I'll help you show them.",
                    nextId: null,
                    action: { 
                        type: "completeQuest",
                        questId: "proofForTheWeave"
                    }
                }
            ]
        },
        {
            id: "gate_closure",
            text: "*Vrenna shook her head sadly* The gate is already closed. The fog is here. It's part of our world now. *She pointed to another pattern* But these other gates... they might still be open. Or worse, they might be opening. *Her voice grew urgent* We need to understand the patterns. Learn to read them. Before it's too late.",
            options: [
                {
                    text: "What can I do to help?",
                    nextId: "help_offering"
                }
            ]
        },
        {
            id: "empire_fate",
            text: "*Vrenna's voice took on a somber tone* They paid the price for their arrogance. The fog consumed them. Changed them. *She gestured to the fragment* This is all that remains of their knowledge. Their understanding. *Her expression grew determined* We must learn from their mistakes. Not repeat them.",
            options: [
                {
                    text: "How can I help?",
                    nextId: "help_offering"
                }
            ]
        },
        {
            id: "urgency_explanation",
            text: "*Vrenna's hands moved quickly as she spoke* The fog is changing. Growing stronger. More intelligent. The patterns in the fragment... they showed that this has happened before. In other worlds. *Her voice dropped to a whisper* When the fog reached a certain point, it didn't just consume. It transformed. Everything.",
            options: [
                {
                    text: "What can we do?",
                    nextId: "help_offering"
                }
            ]
        },
        {
            id: "help_offering",
            text: "*Vrenna's expression brightened* You've already helped more than you know. This fragment... it's a start. *She offered you a small, woven token* Take this. A symbol of our gratitude. And a promise - the Loomkeepers will use this knowledge wisely. *She looked at you intently* But we'll need your help again. The fog is changing. We need to be ready.",
            options: [
                {
                    text: "I'll help when you need me.",
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