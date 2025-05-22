export default {
    nodes: [
        {
            id: "start",
            text: "You've mastered the fog's embrace, haven't you? *She takes a deep breath, her eyes glazing over slightly* The way it dances between your fingers... the way it whispers secrets only you can hear... *She shakes her head, snapping back to focus* You've earned this compass. It'll guide you through the thickest mists.",
            options: [
                {
                    text: "The fog seems to affect you differently than others.",
                    nextId: "fog_addiction"
                },
                {
                    text: "Thank you for the compass.",
                    nextId: null,
                    action: { 
                        type: "completeQuest",
                        questId: "driftkinsTest"
                    }
                }
            ]
        },
        {
            id: "fog_addiction",
            text: "*Her fingers twitch slightly* The fog... it's not just a tool or a danger. It's... *she trails off, her gaze distant* It's like a lover that both caresses and consumes. The Driftkin understand this better than most. *She forces a smile* But enough about that. Take your reward - you've earned it.",
            options: [
                {
                    text: "I understand.",
                    nextId: null,
                    action: { 
                        type: "completeQuest",
                        questId: "driftkinsTest"
                    }
                }
            ]
        }
    ]
}; 