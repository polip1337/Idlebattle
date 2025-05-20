export default {
    loomkeeper_elder: {
        mistwalker_choice: {
            text: "The Mistwalker Amulet... a fascinating discovery. The Loomkeepers have been studying Old Empire artifacts for generations. Share it with us, and we'll provide you with a detailed map of known portal locations.",
            options: [
                {
                    text: "I'll share the amulet's secrets with the Loomkeepers.",
                    next: "loomkeeper_accept",
                    action: "completeQuestStep",
                    rewards: {
                        items: ['loomkeeperPortalMap'],
                        reputation: {
                            Loomkeepers: 10,
                            Driftkin: -5,
                            Emberclad: -5
                        }
                    }
                },
                {
                    text: "I need to consider other options.",
                    next: "loomkeeper_reject"
                }
            ]
        },
        loomkeeper_accept: {
            text: "Wise choice. The Loomkeepers will put this knowledge to good use. Here's the portal map - it will help you navigate the Old Empire's network.",
            options: [
                {
                    text: "Thank you for your trust.",
                    next: "end"
                }
            ]
        },
        loomkeeper_reject: {
            text: "Very well. But remember, the Loomkeepers are the most knowledgeable about Old Empire artifacts. We'll be here if you change your mind.",
            options: [
                {
                    text: "I understand.",
                    next: "end"
                }
            ]
        }
    },
    driftkin_chief: {
        mistwalker_choice: {
            text: "A fog-repelling amulet? This could be exactly what the Driftkin need to explore the deeper mists. Share it with us, and we'll give you our most advanced fog compass.",
            options: [
                {
                    text: "I'll share the amulet's secrets with the Driftkin.",
                    next: "driftkin_accept",
                    action: "completeQuestStep",
                    rewards: {
                        items: ['driftkinFogCompass'],
                        reputation: {
                            Driftkin: 10,
                            Loomkeepers: -5,
                            Emberclad: -5
                        }
                    }
                },
                {
                    text: "I need to consider other options.",
                    next: "driftkin_reject"
                }
            ]
        },
        driftkin_accept: {
            text: "The Driftkin thank you. This fog compass will help you navigate even the thickest mists. May it serve you well.",
            options: [
                {
                    text: "Thank you for your trust.",
                    next: "end"
                }
            ]
        },
        driftkin_reject: {
            text: "Think carefully. The Driftkin know the mists better than anyone. We'll be here if you need us.",
            options: [
                {
                    text: "I understand.",
                    next: "end"
                }
            ]
        }
    },
    emberclad_commander: {
        mistwalker_choice: {
            text: "An amulet that controls the fog? The Emberclad could use this to protect our borders. Share it with us, and we'll give you our most powerful flame ward.",
            options: [
                {
                    text: "I'll share the amulet's secrets with the Emberclad.",
                    next: "emberclad_accept",
                    action: "completeQuestStep",
                    rewards: {
                        items: ['embercladFlameWard'],
                        reputation: {
                            Emberclad: 10,
                            Loomkeepers: -5,
                            Driftkin: -5
                        }
                    }
                },
                {
                    text: "I need to consider other options.",
                    next: "emberclad_reject"
                }
            ]
        },
        emberclad_accept: {
            text: "The Emberclad are in your debt. This flame ward will protect you from the most dangerous threats. Use it well.",
            options: [
                {
                    text: "Thank you for your trust.",
                    next: "end"
                }
            ]
        },
        emberclad_reject: {
            text: "The offer stands. The Emberclad are the strongest faction in these lands. We'll be here if you change your mind.",
            options: [
                {
                    text: "I understand.",
                    next: "end"
                }
            ]
        }
    }
}; 