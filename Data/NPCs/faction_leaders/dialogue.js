export default {
    nodes: [
        {
            id: "start",
            text: "Welcome to the faction leaders' chamber. Who would you like to speak with?",
            options: [
                {
                    text: "The Loomkeeper Elder",
                    nextId: "loomkeeper_elder_start"
                },
                {
                    text: "The Driftkin Chief",
                    nextId: "driftkin_chief_start"
                },
                {
                    text: "The Emberclad Commander",
                    nextId: "emberclad_commander_start"
                }
            ]
        },
        {
            id: "loomkeeper_elder_start",
            text: "The Mistwalker Amulet... a fascinating discovery. The Loomkeepers have been studying Old Empire artifacts for generations. Share it with us, and we'll provide you with a detailed map of known portal locations.",
            options: [
                {
                    text: "I'll share the amulet's secrets with the Loomkeepers.",
                    nextId: "loomkeeper_accept",
                    action: { type: "completeQuest", questId: "mistwalker_amulet" }
                },
                {
                    text: "I need to consider other options.",
                    nextId: "loomkeeper_reject"
                }
            ]
        },
        {
            id: "loomkeeper_accept",
            text: "Wise choice. The Loomkeepers will put this knowledge to good use. Here's the portal map - it will help you navigate the Old Empire's network.",
            options: [
                {
                    text: "Thank you for your trust.",
                    nextId: null
                }
            ]
        },
        {
            id: "loomkeeper_reject",
            text: "Very well. But remember, the Loomkeepers are the most knowledgeable about Old Empire artifacts. We'll be here if you change your mind.",
            options: [
                {
                    text: "I understand.",
                    nextId: null
                }
            ]
        },
        {
            id: "driftkin_chief_start",
            text: "A fog-repelling amulet? This could be exactly what the Driftkin need to explore the deeper mists. Share it with us, and we'll give you our most advanced fog compass.",
            options: [
                {
                    text: "I'll share the amulet's secrets with the Driftkin.",
                    nextId: "driftkin_accept",
                    action: { type: "completeQuest", questId: "mistwalker_amulet" }
                },
                {
                    text: "I need to consider other options.",
                    nextId: "driftkin_reject"
                }
            ]
        },
        {
            id: "driftkin_accept",
            text: "The Driftkin thank you. This fog compass will help you navigate even the thickest mists. May it serve you well.",
            options: [
                {
                    text: "Thank you for your trust.",
                    nextId: null
                }
            ]
        },
        {
            id: "driftkin_reject",
            text: "Think carefully. The Driftkin know the mists better than anyone. We'll be here if you need us.",
            options: [
                {
                    text: "I understand.",
                    nextId: null
                }
            ]
        },
        {
            id: "emberclad_commander_start",
            text: "An amulet that controls the fog? The Emberclad could use this to protect our borders. Share it with us, and we'll give you our most powerful flame ward.",
            options: [
                {
                    text: "I'll share the amulet's secrets with the Emberclad.",
                    nextId: "emberclad_accept",
                    action: { 
                        type: "completeQuest",
                        questId: "mistwalker_amulet"
                    }
                },
                {
                    text: "I need to consider other options.",
                    nextId: "emberclad_reject"
                }
            ]
        },
        {
            id: "emberclad_accept",
            text: "The Emberclad are in your debt. This flame ward will protect you from the most dangerous threats. Use it well.",
            options: [
                {
                    text: "Thank you for your trust.",
                    nextId: null
                }
            ]
        },
        {
            id: "emberclad_reject",
            text: "The offer stands. The Emberclad are the strongest faction in these lands. We'll be here if you change your mind.",
            options: [
                {
                    text: "I understand.",
                    nextId: null
                }
            ]
        }
    ]
}; 