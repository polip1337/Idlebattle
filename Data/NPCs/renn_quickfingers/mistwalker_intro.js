export default {
    nodes: [
    {
    start: {
        text: "Ah, you're just the person I was hoping to see! I've come across something fascinating - an Old Empire amulet that seems to have power over the fog. But I need someone with your... particular skills to help me investigate it further.",
        options: [
            {
                text: "Tell me more about this amulet.",
                next: "mistwalker_explanation"
            },
            {
                text: "I'm not interested in Old Empire artifacts.",
                next: "mistwalker_reject"
            }
        ]
    },
    mistwalker_explanation: {
        text: "The Mistwalker Amulet was found in the Ashen Archive, but it's protected by ancient rune-etched sentries. The amulet seems to repel fog, which could be crucial for exploring Old Empire portals. I need your help to retrieve it and understand its secrets.",
        options: [
            {
                text: "I'll help you investigate the amulet.",
                next: "mistwalker_accept",
                action: "startQuest",
                questId: "mistwalkerSecret"
            },
            {
                text: "The Ashen Archive sounds dangerous.",
                next: "mistwalker_concern"
            }
        ]
    },
    mistwalker_accept: {
        text: "Excellent! Meet me at the Ashen Archive entrance. I'll help you navigate the fog traps and deal with the sentries. Just be careful - I've heard rumors that Korzog, a rogue Loomkeeper, has been sniffing around the archive as well.",
        options: [
            {
                text: "I'll meet you there.",
                next: "mistwalker_depart"
            }
        ]
    },
    mistwalker_concern: {
        text: "It is dangerous, but the potential knowledge we could gain is worth the risk. The amulet might help us understand how the Old Empire controlled the fog, which could be crucial for our survival.",
        options: [
            {
                text: "You're right. I'll help.",
                next: "mistwalker_accept",
                action: "startQuest",
                questId: "mistwalkerSecret"
            },
            {
                text: "I need more time to think about it.",
                next: "mistwalker_reject"
            }
        ]
    },
    mistwalker_reject: {
        text: "I understand. The risks are significant. If you change your mind, you know where to find me. The amulet won't be going anywhere... at least, I hope not.",
        options: [
            {
                text: "Goodbye.",
                next: "end"
            }
        ]
    },
    mistwalker_depart: {
        text: "Good. I'll prepare some supplies and meet you there. Remember, the archive is full of fog traps and rune-etched sentries. We'll need to be careful and clever to get through.",
        options: [
            {
                text: "I'll be ready.",
                next: "end"
            }
        ]
    }
}; 