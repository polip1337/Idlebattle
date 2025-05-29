export default {
    nodes: [
        
        {
            id: "start",
            text: "*The [Ashen Archive|ashenArchive|An ancient repository of forbidden knowledge] looms before you, its walls covered in strange runes that seem to shift and change in the dim light. Korzog stands at the entrance, their massive form casting a long shadow* So. You've come seeking knowledge. *Their eyes, glowing with an unnatural light, study you intently* The amulet brought you here, didn't it?",
            options: [
                {
                    text: "I need to understand the amulet.",
                    nextId: "amulet_understanding"
                },
                {
                    text: "Renn said you could help.",
                    nextId: "renn_reference"
                }
            ]
        },
        {
            id: "amulet_understanding",
            text: "*Korzog's expression darkens* Understanding comes with a price. The amulet... it's more than just a tool. It's a bridge. A connection between our world and something else. *They gesture to the Archive* The answers you seek are inside. But be warned - once you know the truth, you can't unknow it.",
            options: [
                {
                    text: "I'm ready to learn.",
                    nextId: "archive_entrance"
                },
                {
                    text: "What price?",
                    nextId: "knowledge_price"
                }
            ]
        },
        {
            id: "renn_reference",
            text: "*A deep, rumbling laugh echoes through the chamber* Renn Quickfingers. Always meddling in things they don't understand. *Their expression grows serious* But they were right about one thing - I can help you understand the amulet. If you're willing to face what that understanding means.",
            options: [
                {
                    text: "I want to understand.",
                    nextId: "archive_entrance"
                },
                {
                    text: "What do you mean?",
                    nextId: "understanding_warning"
                }
            ]
        },
        {
            id: "knowledge_price",
            text: "*Korzog's eyes flare brighter* The amulet changes those who use it. The more you understand it, the more it understands you. *They gesture to the ancient tomes around them* The fog isn't just a curse. It's a presence. A consciousness. And the amulet... it's learning to speak to it.",
            options: [
                {
                    text: "I still want to learn.",
                    nextId: "archive_entrance"
                },
                {
                    text: "Maybe I should leave.",
                    nextId: "departure_warning"
                }
            ]
        },
        {
            id: "understanding_warning",
            text: "*Korzog's voice takes on a grave tone* The amulet was meant to be a key. A way to understand the fog. To control it. But something went wrong. The fog... it changed. Adapted. *They look around cautiously* The factions think they understand it. The Driftkin worship it. The Emberclad fear it. The Loomkeepers study it. But none of them know the truth.",
            options: [
                {
                    text: "What is the truth?",
                    nextId: "truth_revelation"
                },
                {
                    text: "I need to think about this.",
                    nextId: "time_to_think"
                }
            ]
        },
        {
            id: "departure_warning",
            text: "*Korzog's expression grows serious* Leaving won't change what's happening. The fog is growing stronger. The amulet is changing. And the factions... they're getting desperate. *They gesture to the Archive* The answers are here. Whether you seek them or not, they will find you.",
            options: [
                {
                    text: "You're right. I'll stay.",
                    nextId: "archive_entrance"
                },
                {
                    text: "I still need time.",
                    nextId: "time_to_think"
                }
            ]
        },
        {
            id: "truth_revelation",
            text: "*Korzog looks around cautiously before speaking* The fog didn't just appear. It was called. Summoned. The Old Empire... they sought power beyond their understanding. The portals that once connected our world to others... they weren't just for travel. They were gates. And when they opened the wrong one... *Their voice drops to a whisper* The fog was their punishment. Our punishment.",
            options: [
                {
                    text: "The amulet was meant to fix this?",
                    nextId: "amulet_purpose"
                },
                {
                    text: "This is too much to process.",
                    nextId: "time_to_think"
                }
            ]
        },
        {
            id: "amulet_purpose",
            text: "*Korzog nods slowly* The amulet was their last attempt to control what they had unleashed. A key to understanding the fog. To communicating with it. *Their expression darkens* But the fog is changing. Adapting. The amulet is changing with it. Becoming something new. Something powerful.",
            options: [
                {
                    text: "What should I do?",
                    nextId: "guidance_offering"
                },
                {
                    text: "This is dangerous.",
                    nextId: "danger_acknowledgment"
                }
            ]
        },
        {
            id: "guidance_offering",
            text: "*Korzog gestures to the Archive* The answers are here. In the ancient texts. In the runes on the walls. *They offer you a small, glowing crystal* Take this. It will help you understand. Guide you to the truth. But remember - knowledge is power. And power... it always comes with a price.",
            options: [
                {
                    text: "I understand.",
                    nextId: null,
                    action: { 
                        type: "startQuest",
                        questId: "mistwalkerSecret"
                    }
                }
            ]
        },
        {
            id: "danger_acknowledgment",
            text: "*Korzog's eyes flare with intensity* Yes. Very dangerous. The factions will want the amulet. The Driftkin to understand it. The Loomkeepers to study it. The Emberclad to destroy it. *Their voice grows grave* But the greatest danger is not knowing. Not understanding what's happening to our world.",
            options: [
                {
                    text: "I'll take the risk.",
                    nextId: "guidance_offering"
                },
                {
                    text: "I need more time.",
                    nextId: "time_to_think"
                }
            ]
        },
        {
            id: "time_to_think",
            text: "*Korzog nods understandingly* The truth is not easy to face. Take your time. But remember - the fog doesn't wait. The amulet doesn't wait. And the factions... they're getting desperate. *They gesture to the exit* When you're ready to face the truth, you'll know where to find me.",
            options: [
                {
                    text: "Thank you for your patience.",
                    nextId: null
                }
            ]
        },
        {
            id: "archive_entrance",
            text: "*Korzog steps aside, revealing a massive door covered in ancient runes* The Archive holds many secrets. Some will help you understand the amulet. Others... they might change you forever. *Their eyes glow brighter* Are you sure you want to proceed?",
            options: [
                {
                    text: "I'm ready to face whatever lies within.",
                    nextId: "archive_warning"
                },
                {
                    text: "Maybe I should reconsider.",
                    nextId: "time_to_think"
                }
            ]
        },
        {
            id: "archive_warning",
            text: "*The runes on the door begin to glow* Very well. But remember - knowledge is a double-edged sword. The amulet will respond to what you learn here. *They place a hand on the door* Once you enter, there's no turning back.",
            options: [
                {
                    text: "I understand. Open the door.",
                    nextId: "guidance_offering"
                },
                {
                    text: "I need more time to prepare.",
                    nextId: "time_to_think"
                }
            ]
        }
    ]
}; 