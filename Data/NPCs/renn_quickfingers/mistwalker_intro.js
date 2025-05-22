export default {
    nodes: [
    {
        id:"start",
        text: "Taryn! That amulet we found in the sewers... it's dangerous. The Loomkeepers will want to study it, the Driftkin to use it, and the Emberclad to weaponize it. But you know what I think? We should figure it out ourselves. The Ashen Archive might have answers, and I've got a few tricks up my sleeve for getting in there.",
        options: [
            {
                text: "What do you know about the archive?",
                nextId: "archive_info"
            },
            {
                text: "Maybe we should get help from the factions.",
                nextId: "faction_consideration"
            }
        ]
    },
    {
     id:"archive_info",
        text: "The Ashen Archive's full of Old Empire knowledge, but it's protected by rune-etched sentries and fog traps. I've been casing it for a while - there's a back entrance we can use. Just need to watch out for Korzog. That rogue Loomkeeper's been sniffing around there too.",
        options: [
            {
                text: "Let's try the archive first.",
                nextId: "archive_plan"
            },
            {
                text: "Maybe we should consider getting help.",
                nextId: "faction_consideration"
            }
        ]
    },
    {
     id:"faction_consideration",
        text: "Look, I get it. The factions have resources we don't. The Loomkeepers have knowledge, the Driftkin know the fog better than anyone, and the Emberclad... well, they've got firepower. But here's the thing - once they know about the amulet, they'll want it. Badly. We could use it as leverage, get what we need from them, but we'd have to be careful. Trust me, I know these people - they'll smile to your face while planning how to take it from you.",
        options: [
            {
                text: "You're right. Let's try the archive first.",
                nextId: "archive_plan"
            },
            {
                text: "Which faction would be safest to approach?",
                nextId: "faction_analysis"
            }
        ]
    },
    {
     id:"faction_analysis",
        text: "Vrenna Stoneweave's Loomkeepers are the most... predictable. They'll want to study it, but they're bound by their rules. The Driftkin under Sylvara Tidewalker? They're wild cards - they might help us navigate the fog, but they'll want to push deeper into it. And the Emberclad... Lyra Emberkin's not bad, but her people see everything as a weapon. Once they know about the amulet, they'll want to use it to burn away the fog, consequences be damned.",
        options: [
            {
                text: "Let's stick to the archive plan.",
                nextId: "archive_plan"
            },
            {
                text: "I need more time to think.",
                nextId: "mistwalker_reject"
            }
        ]
    },
    {
     id:"archive_plan",
        text: "Good choice! Meet me at the archive's back entrance. I'll bring some tools for the sentries, and with that amulet of yours, we should be able to handle the fog traps. Just remember - we're there for knowledge, not trouble. Though knowing Korzog, trouble might find us anyway.",
        options: [
            {
                text: "I'll meet you there.",
                nextId: "archive_depart"
            }
        ]
    },
    {
     id:"mistwalker_reject",
        text: "Take your time. The archive isn't going anywhere, and neither are the factions. Just remember - knowledge is power in Hollowreach, and right now, we've got a chance to get ahead of everyone else. When you're ready, you know where to find me.",
        options: [
            {
                text: "Goodbye.",
                nextId: null
            }
        ]
    },
    {
     id:"archive_depart",
        text: "Perfect. I'll get everything ready. Remember, we're looking for anything about fog control or Old Empire artifacts. And watch out for Korzog - he's been acting strange lately, even for a Loomkeeper. Something about the amulet's got him spooked.",
        options: [
            {
                text: "I'll be careful.",
                nextId: null
            }
        ]
    }
    
    ]
}; 