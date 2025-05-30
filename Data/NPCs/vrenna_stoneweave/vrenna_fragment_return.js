export default {
    nodes: [
        {
            id: "start",
            text: "*Vrenna's eyes widen as she notices the fragment in your possession* Ah, you've found it! *She quickly composes herself, but you notice a flicker of satisfaction in her eyes* The scavengers had it, didn't they? I knew they would. ",
            options: [
                {
                    text: "I didnt need the amulet, there was no fog where the scavengers lived.",
                    nextId: "reveal_motive"
                },
                {
                    text: "The scavengers were guarding it fiercely.",
                    nextId: "scavenger_interest"
                }
            ]
        },
        {
            id: "reveal_motive",
            text: "*Vrenna's expression shifts, a small smile playing on her lips* The Mistwalker Amulet was never in doubt. I've read about its kind before. But the fragment... *she gestures to it* That was the real prize. The scavengers stole it from our archives last month. I needed someone to retrieve it. Someone with... unique contacts.",
            options: [
                {
                    text: "What's so important about this fragment?",
                    nextId: "fragment_importance"
                }
            ]
        },
        {
            id: "acknowledge_deception",
            text: "*Vrenna's smile fades, replaced by a look of earnestness* I did what was necessary. The fragment contains patterns that could help us understand the fog's nature. The scavengers would have used it for their own ends. *She gestures to the fragment* But you've done well. Better than I expected. I'm willing to offer you 200 gold for it, or... *she hesitates* I could introduce you to someone who might be interested in joining your cause.",
            options: [
                {
                    text: "I'll take the gold.",
                    nextId: "take_gold",
                    action: [
                        { type: "removeItem", itemId: "tapestryFragment", quantity: 1 },
                        { type: "addGold", amount: 200 }
                    ]
                },
                {
                    text: "Tell me about this potential companion.",
                    nextId: "companion_info"
                },
                {
                    text: "I need time to think about this.",
                    nextId: null
                }
            ]
        },
        {
            id: "fragment_importance",
            text: "*Vrenna's eyes light up with scholarly interest* The patterns in this fragment predate the Great Collapse. They show how the fog first entered our world. The scavengers believe they can use it to control the fog, but that's not its true purpose. *She looks at you intently* It's a map. A record of the portals that once connected our world to others. I can offer you 200 gold for it, or introduce you to someone who might help you understand its true value.",
            options: [
                {
                    text: "I'll take the gold.",
                    nextId: "take_gold",
                    action: [
                        { type: "removeItem", itemId: "tapestryFragment", quantity: 1 },
                        { type: "addGold", amount: 200 }
                    ]
                },
                {
                    text: "Tell me about this potential companion.",
                    nextId: "companion_info"
                },
                {
                    text: "I need time to think about this.",
                    nextId: null
                }
            ]
        },
        {
            id: "scavenger_interest",
            text: "*Vrenna nods thoughtfully* They've been collecting artifacts from the Old Empire. This fragment... it shows something they've been searching for. A way to control the fog. Or at least, that's what they believe. *She studies the fragment more closely* But its true value lies elsewhere. I can offer you 200 gold for it, or introduce you to someone who might help you understand its significance.",
            options: [
                {
                    text: "I'll take the gold.",
                    nextId: "take_gold",
                    action: [
                        { type: "removeItem", itemId: "tapestryFragment", quantity: 1 },
                        { type: "addGold", amount: 200 }
                    ]
                },
                {
                    text: "Tell me about this potential companion.",
                    nextId: "companion_info"
                },
                {
                    text: "I need time to think about this.",
                    nextId: null
                }
            ]
        },
        {
            id: "take_gold",
            text: "*She carefully takes the fragment and hands you a pouch of gold* Thank you. This will help us preserve more of our history. The patterns in this fragment will be studied carefully. *She looks at you with a mix of gratitude and something else* You've proven yourself more capable than I initially thought.",
            options: [
                {
                    text: "Goodbye.",
                    nextId: null
                }
            ]
        },
        {
            id: "companion_info",
            text: "There's a contact in the sewers who has been... let's say, helping people navigate the darker corners of Hollowreach. They're skilled in finding hidden paths and have a network of informants. If you're interested, I can arrange an introduction. They might help you understand the true nature of artifacts like this fragment.",
            options: [
                {
                    text: "I'd like to meet this contact.",
                    nextId: "introduce_contact",
                    action: [
                        { type: "removeItem", itemId: "tapestryFragment", quantity: 1 },
                        { type: "openDialogue", npcId: "sewer_contact", dialogueId: "share_info" }
                    ]
                },
                {
                    text: "I'll take the gold instead.",
                    nextId: "take_gold"
                },
                {
                    text: "I need to think about this.",
                    nextId: null
                }
            ]
        },
        {
            id: "introduce_contact",
            text: "Excellent choice. I'll send word ahead. You'll find them in the lower sewers, near the old water treatment plant. Just mention my name and show them the fragment's pattern - they'll know what to look for. *She gives you a knowing look* They might even tell you things about the fragment that I haven't shared.",
            options: [
                {
                    text: "Thank you for the introduction.",
                    nextId: null
                }
            ]
        }
    ]
}; 