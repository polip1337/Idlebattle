export default {
    mistwalker_confrontation: {
        text: "Ah, I see you've found the amulet. Hand it over, and I'll let you walk away. The Loomkeepers have no right to keep such power to themselves.",
        options: [
            {
                text: "The amulet doesn't belong to the Loomkeepers either.",
                next: "mistwalker_negotiate"
            },
            {
                text: "I won't let you take it.",
                next: "mistwalker_combat",
                action: "startCombat"
            }
        ]
    },
    mistwalker_negotiate: {
        text: "You're right, it belongs to no one. But I can help you understand its true power. The Loomkeepers would just lock it away in their vaults.",
        options: [
            {
                text: "What do you know about its power?",
                next: "mistwalker_reveal"
            },
            {
                text: "I still can't trust you.",
                next: "mistwalker_combat",
                action: "startCombat"
            }
        ]
    },
    mistwalker_reveal: {
        text: "The amulet can control the fog around Old Empire portals. With it, we could explore places the Loomkeepers have kept hidden for centuries. Share it with me, and I'll show you secrets they've been hiding.",
        options: [
            {
                text: "I'll consider your offer, but I need time to think.",
                next: "mistwalker_standoff"
            },
            {
                text: "Your knowledge is valuable, but I can't trust you.",
                next: "mistwalker_combat",
                action: "startCombat"
            }
        ]
    },
    mistwalker_standoff: {
        text: "Time is a luxury we don't have. The Loomkeepers will be here soon. Make your choice now.",
        options: [
            {
                text: "I'll share what I learn with you, but I keep the amulet.",
                next: "mistwalker_compromise",
                action: "completeQuestStep"
            },
            {
                text: "I can't make that deal.",
                next: "mistwalker_combat",
                action: "startCombat"
            }
        ]
    },
    mistwalker_compromise: {
        text: "A reasonable offer. I'll be watching for your discoveries. Don't disappoint me.",
        options: [
            {
                text: "I'll be in touch.",
                next: "end"
            }
        ]
    },
    mistwalker_combat: {
        text: "So be it. You'll regret this decision.",
        options: [
            {
                text: "We'll see about that.",
                next: "end"
            }
        ]
    }
}; 