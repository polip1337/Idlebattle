export default {
    nodes: [
        {
            id: "start",
            text: "*Old Maris looks up from his work organizing supplies, his weathered face breaking into a warm smile* Ah, a new face in [Orphan's Hollow|orphansHollow|The last safe haven for Hollowreach's most vulnerable]. I'm Maris, though most just call me Old Maris. *He gestures to the bustling activity around them* We do what we can to keep everyone fed and safe here. The fog may take much, but it hasn't taken our community spirit.",
            options: [
                {
                    text: "How do you manage to feed everyone?",
                    nextId: "food_crisis",
                    conditions: [
                        { type: "questActive", questId: "hollowsCache", negate: true },
                        { type: "questCompleted", questId: "hollowsCache", negate: true }
                    ],
                    hideWhenUnavailable: true
                },
                {
                    text: "I'd like to help the community.",
                    nextId: "help_offer",
                    conditions: [
                        { type: "questActive", questId: "hollowsCache", negate: true },
                        { type: "questCompleted", questId: "hollowsCache", negate: true }
                    ],
                    hideWhenUnavailable: true
                },
                {
                    text: "I'm just passing through.",
                    nextId: "passing_through"
                }
            ]
        },
        {
            id: "food_crisis",
            text: "*He sighs, leaning on his walking stick* It's getting harder. The fog makes it difficult to grow crops, and the Old Empire's caches are running dry. *His eyes light up with hope* But we've heard rumors of a hidden cache in the [Ironspire Ruin|ironspireRuin|An ancient structure that might hold supplies]. If we could find it... well, it would mean the difference between survival and starvation for many here.",
            options: [
                {
                    text: "I could help look for this cache.",
                    nextId: "quest_offer"


                },
                {
                    text: "That sounds dangerous.",
                    nextId: "danger_acknowledgment"
                }
            ]
        },
        {
            id: "help_offer",
            text: "*His smile grows wider* That's the spirit! We can always use helping hands around here. *He looks you up and down appraisingly* You seem capable. There's something specific you could help with - we've heard of a supply cache in the [Ironspire Ruin|ironspireRuin|An ancient structure that might hold the key to our survival]. It's not without risk, but the reward... well, it could save lives.",
            options: [
                {
                    text: "I'll help find the cache.",
                    nextId: "quest_offer",
                    conditions: [
                        { type: "questActive", questId: "hollowsCache", negate: true },
                        { type: "questCompleted", questId: "hollowsCache", negate: true }
                    ],
                    hideWhenUnavailable: true
                },
                {
                    text: "I need to think about it.",
                    nextId: null
                }
            ]
        },
        {
            id: "quest_offer",
            text: "*He straightens up, determination in his voice* The [Ironspire Ruin|ironspireRuin|Our best hope for survival] isn't far, but the fog has made it dangerous. The cache should be in a vault there. *He hands you a small, glowing crystal* This will help guide you through the fog. Bring back what you can - every bit helps these days.",
            options: [
                {
                    text: "I'll find the cache.",
                    action: [
                        { type: "startQuest", questId: "hollowsCache" },
                        { type: "addItem", itemId: "fog_guide_crystal" },
                        {
                            type: "unlockPOI",
                            mapId: "hollowreach",
                            poiId: "ironspireRuin"
                        }
                    ]
                },
                {
                    text: "I need to prepare first.",
                    nextId: null
                }
            ]
        },
        {
            id: "danger_acknowledgment",
            text: "*He nods understandingly* Aye, it is dangerous. The fog, the ruins, the things that lurk in the mist... *He looks around at the people of Orphan's Hollow* But sometimes, the greater danger is doing nothing. When you're ready to help, you'll know. And we'll be here, doing what we can to keep everyone alive.",
            options: [
                {
                    text: "Maybe I can help after all.",
                    nextId: "quest_offer",
                    conditions: [
                        { type: "questActive", questId: "hollowsCache", negate: true },
                        { type: "questCompleted", questId: "hollowsCache", negate: true }
                    ],
                    hideWhenUnavailable: true
                },
                {
                    text: "I understand. Good luck.",
                    nextId: null
                }
            ]
        },
        {
            id: "passing_through",
            text: "*He nods, his smile never fading* Of course, of course. The [Orphan's Hollow|orphansHollow|Our little community] is open to all who need shelter. The fog's been particularly thick lately, so feel free to rest here as long as you need. *He gestures to a nearby fire* We've got warm food and warmer company.",
            options: [
                {
                    text: "Maybe I could help while I'm here.",
                    nextId: "help_offer"
                },
                {
                    text: "Thank you for the hospitality.",
                    nextId: null
                }
            ]
        }
    ]
}; 