export default {
    nodes: [
        {
            id: "start",
            text: "*Renn lets out a low whistle as he examines the cache* Well, well... the Old Empire didn't disappoint. *He carefully sorts through the supplies* Food, medicine, tools... this'll keep the Hollow going for weeks. *He looks up at you, a rare serious expression on his face* We need to get this back to Maris. Fast.",
            options: [
                {
                    text: "The fog seems to be getting worse.",
                    nextId: "fog_warning"
                },
                {
                    text: "Let's get moving.",
                    nextId: "moving_out"
                }
            ]
        },
        {
            id: "fog_warning",
            text: "*Renn nods grimly* Yeah, it's not just thicker - it's angry. Like we took something it wanted. *He quickly stuffs supplies into his pack* The constructs were one thing, but I don't want to stick around to see what else the fog might send after us.",
            options: [
                {
                    text: "We should hurry back to the Hollow.",
                    nextId: "moving_out"
                },
                {
                    text: "What do you mean, 'something it wanted'?",
                    nextId: "fog_speculation"
                }
            ]
        },
        {
            id: "moving_out",
            text: "*Renn secures the last of the supplies* Alright, let's move. I know a quick way back to the Hollow. *He pulls out his fog guide crystal* This should help us navigate through the worst of it. *He looks back at the cache* There might be more out there, but this is a good start.",
            options: [
                {
                    text: "Lead the way.",
                    nextId: null,
                    action: {
                        type: "completeQuest",
                        questId: "hollowsCache"
                    }
                }
            ]
        },
        {
            id: "fog_speculation",
            text: "*Renn's voice drops to a whisper* The fog... it's changing. Getting smarter. More... aware. *He glances around nervously* I've heard stories from the Driftkin. They say it's not just mist anymore. It's something else. Something that remembers. *He shakes his head* But that's a problem for another day. Right now, we need to get these supplies to safety.",
            options: [
                {
                    text: "You're right. Let's go.",
                    nextId: "moving_out"
                }
            ]
        }
    ]
};
