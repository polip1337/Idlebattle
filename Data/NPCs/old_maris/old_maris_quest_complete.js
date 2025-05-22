export default {
    nodes: [
        {
            id: "start",
            text: "*Old Maris carefully arranges the food rations, his weathered hands moving with practiced efficiency* The fog takes much from us, but it hasn't taken our spirit. Not yet. *He looks up, his eyes crinkling with a smile* You've done good work here, child. The cache you found will keep Hollowreach's people fed for weeks. In times like these, that's worth more than gold.",
            options: [
                {
                    text: "How long can we keep finding caches like this?",
                    nextId: "future_concerns"
                },
                {
                    text: "I'm glad I could help the people of Hollowreach.",
                    nextId: null,
                    action: { 
                        type: "completeQuest",
                        questId: "hollowsCache"
                    }
                }
            ]
        },
        {
            id: "future_concerns",
            text: "*He sighs, leaning on his walking stick* The Old Empire left many caches, but they're running dry. The fog makes it harder to find them, and what we do find... well, it's not getting any fresher. *He straightens up, determination in his voice* But we'll manage. We always have. The people of Hollowreach are survivors. Take these rations - you've earned them, and who knows? Maybe you'll be the one to find the next cache when we need it most.",
            options: [
                {
                    text: "I'll keep an eye out for more caches.",
                    nextId: null,
                    action: { 
                        type: "completeQuest",
                        questId: "hollowsCache"
                    }
                },
                {
                    text: "Thank you for the rations.",
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