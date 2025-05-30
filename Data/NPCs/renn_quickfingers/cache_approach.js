export default {
    nodes: [
        {
            id: "start",
            text: "*Renn's eyes narrow as he spots the cache through the swirling fog* There it is... the cache Old Maris mentioned. *He pulls his hood tighter against the mist* The fog's thicker here than I expected. We'll need to be quick about this.",
            options: [
                {
                    text: "What's the plan?",
                    nextId: "plan"
                },
                {
                    text: "The fog seems... different here.",
                    nextId: "fog_warning"
                }
            ]
        },
        {
            id: "plan",
            text: "*Renn's fingers twitch with anticipation* Simple enough - we grab what we can carry and get out. The fog's been getting worse, and I don't like how it's moving. *He gestures to the cache* But first, we need to deal with whatever's guarding it. The Old Empire didn't leave their supplies unprotected.",
            options: [
                {
                    text: "Let's get this over with.",
                    nextId: null
                },
                {
                    text: "What kind of protection are we talking about?",
                    nextId: "protection_warning"
                }
            ]
        },
        {
            id: "fog_warning",
            text: "*Renn's expression grows serious* Yeah... it's not just thicker. It's... watching. *He shivers despite himself* I've been in these docks before, but never seen the fog act like this. Almost like it knows what we're after.",
            options: [
                {
                    text: "We should hurry then.",
                    nextId: "plan"
                },
                {
                    text: "Maybe we should turn back.",
                    nextId: "no_turning_back"
                }
            ]
        },
        {
            id: "protection_warning",
            text: "*Renn's voice drops to a whisper* The Old Empire used constructs. Metal guardians that don't sleep, don't tire. *He pulls out a small device* I've got something that might help, but we'll still need to be quick. Once we trigger them, we won't have long.",
            options: [
                {
                    text: "Let's do this.",
                    nextId: null
                },
                {
                    text: "We should be careful.",
                    nextId: "plan"
                }
            ]
        },
        {
            id: "no_turning_back",
            text: "*Renn shakes his head firmly* No. The Hollow needs these supplies. Old Maris is counting on us. *He adjusts his gloves* Besides, I've got a reputation to maintain. Renn Quickfingers doesn't back down from a challenge.",
            options: [
                {
                    text: "Alright, let's get this done.",
                    nextId: "plan"
                }
            ]
        }
    ]
};
