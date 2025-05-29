export default {
    nodes: [
        {
            id: "start",
            text: "*Old Maris's weathered face breaks into a wide smile as you present the cache* By the ancestors, you found it! *They carefully take the cache, their hands trembling with age and excitement* The children... they'll have food for weeks. *They look up at you, their eyes glistening* You've done more than just find supplies. You've given us hope.",
            options: [
                {
                    text: "The cache was well hidden.",
                    nextId: "cache_location"
                },
                {
                    text: "How will you distribute the supplies?",
                    nextId: "supply_distribution"
                }
            ]
        },
        {
            id: "cache_location",
            text: "*Old Maris nods knowingly* The [Ironspire Ruin|ironspireRuin|An ancient fortress now overrun by the fog]. A dangerous place, even before the fog. *They carefully open the cache* The Old Empire stored their emergency supplies there. Places like this... they're becoming more important as the fog spreads.",
            options: [
                {
                    text: "There might be more caches.",
                    nextId: "more_caches"
                },
                {
                    text: "The fog is getting worse.",
                    nextId: "fog_warning"
                }
            ]
        },
        {
            id: "supply_distribution",
            text: "*Old Maris's expression grows serious* Fairly. That's the only way. *They gesture to the surrounding area* The [Orphan's Hollow|orphansHollow|A community of those who have lost their families to the fog] has grown since the fog came. More mouths to feed. More people to protect. *They look at you intently* We take care of our own here. Share what we have.",
            options: [
                {
                    text: "I can help find more supplies.",
                    nextId: "future_help"
                },
                {
                    text: "The other districts might need help too.",
                    nextId: "other_districts"
                }
            ]
        },
        {
            id: "more_caches",
            text: "*Old Maris's eyes light up* Yes! The Old Empire was thorough. They prepared for the worst. *They pull out an old, tattered map* There are rumors of other caches. In the [Scorchveil Pit|scorchveilPit|Where the Emberclad perform their rituals]. The [Rustmarket Sewers|rustmarketSewers|The labyrinthine tunnels beneath the bazaar]. *Their voice grows excited* But they're dangerous places now. The fog has changed them.",
            options: [
                {
                    text: "I can help search for them.",
                    nextId: "future_help"
                },
                {
                    text: "The fog is getting worse.",
                    nextId: "fog_warning"
                }
            ]
        },
        {
            id: "fog_warning",
            text: "*Old Maris's expression darkens* Yes. It's changing. Growing stronger. More... intelligent. *They look around nervously* The children have been having nightmares. They say the fog speaks to them. Shows them things. *Their voice drops to a whisper* I've lived through many changes in this city. But nothing like this.",
            options: [
                {
                    text: "What can we do?",
                    nextId: "hope_offering"
                },
                {
                    text: "The factions are getting desperate.",
                    nextId: "faction_tensions"
                }
            ]
        },
        {
            id: "future_help",
            text: "*Old Maris's face brightens* Your help would mean the world to us. The children... they need someone to look up to. Someone who shows them that there's still good in this world. *They offer you a small, carved token* Take this. A symbol of our gratitude. And a promise - the Hollow will always welcome you.",
            options: [
                {
                    text: "I'll help when I can.",
                    nextId: null,
                    action: { 
                        type: "completeQuest",
                        questId: "hollowsCache"
                    }
                }
            ]
        },
        {
            id: "other_districts",
            text: "*Old Maris nods thoughtfully* Yes. The fog doesn't care about district boundaries. We're all in this together. *They gesture to the cache* This is a start. A way to show that we can work together. That we can help each other. *Their expression grows determined* The Hollow will share what we have. It's the only way forward.",
            options: [
                {
                    text: "I'll help spread the word.",
                    nextId: null,
                    action: { 
                        type: "completeQuest",
                        questId: "hollowsCache"
                    }
                }
            ]
        },
        {
            id: "hope_offering",
            text: "*Old Maris's expression softens* We do what we've always done. We survive. We help each other. We remember who we are. *They gesture to the children playing nearby* They're our future. Our hope. As long as we keep them safe, keep them fed, keep them together... we'll find a way through this.",
            options: [
                {
                    text: "I'll help protect them.",
                    nextId: null,
                    action: { 
                        type: "completeQuest",
                        questId: "hollowsCache"
                    }
                }
            ]
        },
        {
            id: "faction_tensions",
            text: "*Old Maris sighs heavily* Yes. The Emberclad want to burn it away. The Driftkin want to worship it. The Loomkeepers want to study it. *They look at you intently* But here in the Hollow, we just want to live. To survive. To keep our children safe. *Their voice grows firm* That's what matters. That's what we fight for.",
            options: [
                {
                    text: "I'll help you protect the Hollow.",
                    nextId: null,
                    action: { 
                        type: "completeQuest",
                        questId: "hollowsCache"
                    }
                }
            ]
        }
    ]
}; 