export default {
    nodes: [
        {
            id: "start",
            text: "The figure's hood snaps up, their posture suddenly rigid. 'You... you found it. The bone whisper.' Their voice is barely a breath, trembling with something between awe and hunger. 'I can feel it from here—the old song, the deep hum. Give it to me.' Their gloved hand extends, fingers twitching with barely contained anticipation.",
            options: [
                {
                    text: "Here's the relic.",
                    nextId: "accept_relic",
                    conditions: [
                        { type: "item", item: "boneWhisperRelic" }
                    ]
                },
                {
                    text: "I don't have it yet.",
                    nextId: null
                }
            ]
        },
        {
            id: "accept_relic",
            text: "The figure's hands close around the relic with a reverence that borders on worship. 'Yes... yes, this is it. The voice of the deep, the song of the forgotten.' They cradle it close, their hood dipping low. 'You've done well, wanderer. Better than well. Now... let me tell you what I know about the fog.'",
            options: [
                {
                    text: "I'm listening.",
                    nextId: "share_secrets",
                    action: [
                        { type: "removeItem", item: "boneWhisperRelic" },
                        { type: "completeQuest", questId: "ossuaryRelic" }
                    ]
                }
            ]
        }
    ]
}; 