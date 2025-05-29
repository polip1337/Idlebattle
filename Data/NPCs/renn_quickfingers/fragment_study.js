export default {
    nodes: [
        {
            id: "start",
            text: "*Renn's eyes widen as she sees the fragment* That's a Loomkeeper tapestry fragment! Where did you get that? *examines it closely* The patterns... they're unlike anything I've seen before.",
            options: [
                {
                    text: "I found it in the sewers. I thought you might want to study it.",
                    nextId: "study_offer"
                },
                {
                    text: "I was going to return it to the Loomkeepers.",
                    nextId: "loomkeeper_warning"
                }
            ],
            conditions: [{ type: "item", item: "tapestryFragment" }]
        },
        {
            id: "study_offer",
            text: "Study it? *excited* This could be the key to understanding how the Old Empire's portal network worked! Let me examine it properly in my workshop. I have equipment that can analyze the portal shards woven into it.",
            options: [
                {
                    text: "Go ahead and study it.",
                    nextId: "accept_study",
                    action: [
                        { type: "removeItem", item: "tapestryFragment" },
                        { type: "addItem", item: "portalShard" },
                        { type: "completeQuest", questId: "proofForTheWeave" }
                    ]
                },
                {
                    text: "I should return it to the Loomkeepers.",
                    nextId: "loomkeeper_warning"
                }
            ]
        },
        {
            id: "accept_study",
            text: "This is incredible! *carefully places the fragment under a strange device* The portal shards are still active. I can extract one for you to keep, and I'll make detailed notes about the patterns. This could help us understand how to navigate the fog!",
            options: [
                {
                    text: "What do you think you'll learn from it?",
                    nextId: "explanation"
                },
                {
                    text: "Goodbye.",
                    nextId: null
                }
            ]
        },
        {
            id: "explanation",
            text: "The Old Empire used these tapestries to map their portal network. Each thread represents a connection between points in the fog. If we can decode these patterns, we might be able to find safe paths through the mist. The Loomkeepers would just lock this away in their vaults, but we can actually learn from it!",
            options: [
                {
                    text: "Goodbye.",
                    nextId: null
                }
            ]
        },
        {
            id: "loomkeeper_warning",
            text: "The Loomkeepers? *frowns* They'll just lock it away in their vaults. They're too afraid to actually study these things. But... it's your choice. Just know that returning it means we might never understand its secrets.",
            options: [
                {
                    text: "I'll let you study it after all.",
                    nextId: "study_offer"
                },
                {
                    text: "I need to think about it.",
                    nextId: null
                }
            ]
        }
    ]
}; 