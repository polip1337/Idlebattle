export default {
    name: "Sewer Contact",
    portrait: "Media/NPC/sewer_contact.jpg",
    dialogues: {
        default: [
            {
                id:"sewer_contact_base",
                conditions: [],
                priority: 0
            },
            {
                id: "return_relic",
                conditions: [
                    {
                        type: "quest",
                        questId: "ossuaryRelic",
                        status: "active"
                    },
                    {
                        type: "item",
                        itemId: "boneWhisperRelic"
                    }
                ],
                priority: 2
            },
            {
                id: "share_info",
                conditions: [
                    {
                        type: "quest",
                        questId: "ossuaryRelic",
                        status: "completed"
                    }
                ],
                priority: 1
            }
        ]
    }
};