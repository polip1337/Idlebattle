export default {
    nodes: [
        {
            id: "start",
            text: "Well met, traveler. Have you heard tales of the [portals|portals|Ancient gateways] that once bound our lands?",
            options: [
                {
                    text: "Tell me about the [portals|portals|Magical gateways].",
                    nextId: "portals",
                    conditions: [
                        { type: "skill", stat: "Magic Power", value: 5 }
                    ]
                },
                {
                    text: "Any news from [Hollowreach|hollowreach|Forgotten city]?",
                    nextId: "hollowreach"
                },
                {
                    text: "Goodbye.",
                    nextId: null
                }
            ]
        },
        {
            id: "portals",
            text: "The [portals|portals|Powered by ancient magic] connected cities until they failed, unleashing the [fog|fog|Unnatural mist]. Scholars believe their magic can be restored.",
            options: [
                {
                    text: "How can they be restored?",
                    nextId: "restore",
                    conditions: [
                        { type: "skill", stat: "Magic Control", value: 10 }
                    ]
                },
                {
                    text: "Thank you.",
                    nextId: null
                }
            ]
        },
        {
            id: "restore",
            text: "Restoring the [portals|portals|Gateways of the empire] requires a lost artifact from the [Mystic Forest|mysticForest|Spirit-guarded woods]. It’s a perilous task.",
            options: [
                {
                    text: "I’ll look into it.",
                    nextId: null,
                    action: { type: "startQuest", questId: "portalArtifact" }
                }
            ]
        },
        {
            id: "hollowreach",
            text: "[Hollowreach|hollowreach|Isolated city] struggles, but its people are resilient. They seek heroes to brave the [fog|fog|Hides dangers].",
            options: [
                {
                    text: "I’ll help them.",
                    nextId: null,
                    action: { type: "startQuest", questId: "hollowreachAid" }
                },
                {
                    text: "Goodbye.",
                    nextId: null
                }
            ]
        }
    ]
};