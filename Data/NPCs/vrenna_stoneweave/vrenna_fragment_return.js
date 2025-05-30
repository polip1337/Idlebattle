export default {
    nodes: [
        {
            id: "start",
            text: "*Vrenna's eyes widen as she notices the fragment in your possession* Ah, you've found it! *She quickly composes herself, but you notice a flicker of satisfaction in her eyes* The scavengers had it, didn't they? I knew they would.",
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
            id: "fragment_importance",
            text: "*Vrenna's eyes light up with scholarly interest* The patterns in this fragment predate the Great Collapse. They show how the fog first entered our world. The scavengers believe they can use it to control the fog, but that's not its true purpose. *She looks at you intently* It's a map. A record of the portals that once connected our world to others. For your service, I can offer you both 200 gold and introduce you to one of our most promising young weavers. He's been eager to study the world beyond our archives.",
            options: [
                {
                    text: "Tell me more about this young weaver.",
                    nextId: "companion_info"
                },
                {
                    text: "I'll take both the gold and meet the weaver.",
                    nextId: "accept_both",
                    action: [
                        { type: "removeItem", itemId: "tapestryFragment", quantity: 1 },
                        { type: "addGold", amount: 200 },
                        { type: "openDialogue", npcId: "sewer_contact", dialogueId: "share_info" }
                    ]
                },
                {
                    text: "I need time to think about this.",
                    nextId: null
                }
            ]
        },
        {
            id: "scavenger_interest",
            text: "*Vrenna nods thoughtfully* They've been collecting artifacts from the Old Empire. This fragment... it shows something they've been searching for. A way to control the fog. Or at least, that's what they believe. *She studies the fragment more closely* But its true value lies elsewhere. For your service, I can offer you both 200 gold and introduce you to one of our most promising young weavers. He's been eager to study the world beyond our archives.",
            options: [
                {
                    text: "Tell me more about this young weaver.",
                    nextId: "companion_info"
                },
                {
                    text: "I'll take both the gold and meet the weaver.",
                    nextId: "accept_both",
                    action: [
                        { type: "removeItem", itemId: "tapestryFragment", quantity: 1 },
                        { type: "addGold", amount: 200 },
                        { type: "openDialogue", npcId: "sewer_contact", dialogueId: "share_info" }
                    ]
                },
                {
                    text: "I need time to think about this.",
                    nextId: null
                }
            ]
        },
        {
            id: "companion_info",
            text: "His name is Thalindir. A young elf with a rare gift for reading the patterns in ancient artifacts. *Vrenna's expression softens* He's been confined to our archives for too long, studying old texts and fragments. I believe he could learn much from traveling with someone who... understands the practical side of our world. *She looks at you meaningfully* And his knowledge of ancient patterns could prove valuable to you as well.",
            options: [
                {
                    text: "I'll take both the gold and meet Thalindir.",
                    nextId: "accept_both",
                    action: [
                        { type: "removeItem", itemId: "tapestryFragment", quantity: 1 },
                        { type: "addGold", amount: 200 },
                        { type: "openDialogue", npcId: "sewer_contact", dialogueId: "share_info" }
                    ]
                },
                {
                    text: "I need time to think about this.",
                    nextId: null
                }
            ]
        },
        {
            id: "accept_both",
            text: "*Vrenna carefully takes the fragment and hands you a pouch of gold* Excellent choice. The gold is yours, and I'll send word to Thalindir. You'll find him in the lower archives, near the old water treatment plant. Just mention my name and show him the fragment's pattern - he'll be eager to join you. *She gives you a knowing look* He might even tell you things about the fragment that I haven't shared.",
            options: [
                {
                    text: "Thank you for the introduction.",
                    nextId: null
                }
            ]
        }
    ]
}; 