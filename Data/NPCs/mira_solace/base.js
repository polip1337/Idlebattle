export default {
    nodes: [
        {
            id: "start",
            text: "Eryndor's [Pulsefinders|pulsefinders|Fog cult] promise salvation, but their [fog|fog|Madness mist] implants took my brother. Can you help me stop them?",
            options: [
                {
                    text: "What's wrong with the implants?",
                    nextId: "implants"
                },
                {
                    text: "I'm testing an implant in the [Shrine of Whispers|shrine_of_whispers|Cave].",
                    nextId: "quest",
                    action: { type: "startQuest", questId: "pulse_within" },
                    conditions: [{ type: "skill", stat: "Charisma", value: 6 }]
                },
                {
                    text: "Can you aid my expedition?",
                    nextId: "expedition",
                    conditions: [{ type: "questActive", questId: "great_crossing" }]
                },
                {
                    text: "Goodbye.",
                    nextId: null
                }
            ]
        },
        {
            id: "implants",
            text: "The [fog|fog|Twists minds]'s implants give visions, but they drive you mad. Eryndor ignores the danger, and [Hollowreach|hollowreach|City] suffers.",
            options: [
                {
                    text: "How can I stop this?",
                    nextId: "quest"
                },
                {
                    text: "Goodbye.",
                    nextId: null
                }
            ]
        },
        {
            id: "quest",
            text: "If you take an implant in the [Shrine of Whispers|shrine_of_whispers|Cave], destroy the shrine instead. The [Loomkeepers|loomkeepers|Weavers] will thank you.",
            options: [
                {
                    text: "I'll destroy it.",
                    nextId: null,
                    action: { type: "startQuest", questId: "pulse_within", objective: "destroy_shrine" }
                },
                {
                    text: "I need the vision.",
                    nextId: null,
                    action: { type: "startQuest", questId: "pulse_within" }
                }
            ]
        },
        {
            id: "expedition",
            text: "Your expedition could expose the [fog|fog|Danger]'s truth. I'll guide you without implants, but keep Eryndor's [Pulsefinders|pulsefinders|Cult] in check.",
            options: [
                {
                    text: "Join us.",
                    nextId: null,
                    action: { type: "startQuest", questId: "mira_expedition" }
                },
                {
                    text: "Not now.",
                    nextId: null
                }
            ]
        }
    ]
};