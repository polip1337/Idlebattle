export default {
    nodes: [
        {
            id: "start",
            text: "You look like you’ve seen a fight or two. I’m Varkis, best blade in [Hollowreach|hollowreach|Isolated city]. The fog’s full of beasts—want to learn to cut ‘em down proper, or are you just here for ale?",
            options: [
                {
                    text: "Teach me swordfighting.",
                    nextId: "training"
                },
                {
                    text: "What’s your story?",
                    nextId: "story"
                },
                {
                    text: "Just here for ale.",
                    nextId: null
                }
            ]
        },
        {
            id: "training",
            text: "Good. I’ll teach you a [Driftkin|driftkin|Fog nomads] dueling stance—quick and deadly. Costs a [short_sword|short_sword|Basic weapon] to prove you’re serious. Got one, or you wasting my time?",
            options: [
                {
                    text: "Here’s the sword.",
                    nextId: null,
                    action: { type: "train", skill: "swordfighting", value: 2 },
                    conditions: [{ type: "item", item: "short_sword" }]
                },
                {
                    text: "I don’t have a sword.",
                    nextId: null
                }
            ]
        },
        {
            id: "story",
            text: "Fought for the [Driftkin|driftkin|Fog nomads] till a fog-beast took half my crew. Now I teach here, away from the mist. [Hollowreach|hollowreach|Isolated city]’s safer, but mark me—those portals are waking, and trouble’s coming with ‘em.",
            options: [
                {
                    text: "Thanks for the warning.",
                    nextId: null
                },
                {
                    text: "Can you teach me to fight?",
                    nextId: "training"
                }
            ]
        }
    ]
};