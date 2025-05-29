export default {
    name: "Sewer Contact",
    portrait: "Media/NPC/sewer_contact.jpg",
    dialogues: {
        default: [
            {
                id: "base",
                conditions: [],
                priority: 0
            },
            {
                id: "return_relic",
                conditions: [
                    {
                        type: "questActive",
                        questId: "ossuaryRelic"
                    },
                    {
                        type: "item",
                        item: "boneWhisperRelic"
                    }
                ],
                priority: 2
            },
            {
                id: "share_info",
                conditions: [
                    {
                        type: "questCompleted",
                        questId: "ossuaryRelic"
                    }
                ],
                priority: 1
            }
        ]
    }
};