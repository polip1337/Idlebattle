export default {
    nodes: [
        {
            id: "start",
            text: "I don’t trust strangers sniffing around my work. I'll tell you what i told everyone else the [fog|fog|Living chaos] can be tamed with my weaves, but Vrenna’s too spineless to try. Who are you, and who sent you?",
            options: [
                {
                    text: "I know Renn Quickfingers. He says you’re the best weaver.",
                    nextId: "renn"
                },
                {
                    text: "What’s your plan for the [fog|fog|Chaos mist]?",
                    nextId: "plan"
                },
                {
                    text: "Can you help my expedition?",
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
            id: "renn",
            text: "Renn Quickfingers, eh? That rogue trusts you? Maybe you’re not one of Vrenna’s dogs. I’ve got a job—steal a tapestry I wove in the [Weave Vault|weave_vault|Hidden chamber]. It controls fog-beasts. You up for it, or you wasting my time?",
            options: [
                {
                    text: "I’ll steal it for you.",
                    nextId: null,
                    action: { type: "startQuest", questId: "korzogs_rebellion" }
                },
                {
                    text: "Why should I trust you?",
                    nextId: "distrust"
                },
                {
                    text: "Goodbye.",
                    nextId: null
                }
            ]
        },
        {
            id: "distrust",
            text: "Trust me? I’m the one taking a chance on you. Renn’s word carries weight, so I’ll give you a shot. Steal the tapestry from the [Weave Vault|weave_vault|Hidden chamber], or get out before I mark you as trouble.",
            options: [
                {
                    text: "Alright, I’ll get the tapestry.",
                    nextId: null,
                    action: { type: "startQuest", questId: "korzogs_rebellion" }
                },
                {
                    text: "I’m not your errand runner.",
                    nextId: null
                }
            ]
        },
        {
            id: "plan",
            text: "You think I’d just spill my secrets to some nobody? The [fog|fog|Monstrous mist] bends to my weaves, unlike Vrenna’s weak plans. Prove you’re not her spy—know anyone worth my trust?",
            options: [
                {
                    text: "I know Renn Quickfingers.",
                    nextId: "renn"
                },
                {
                    text: "What do you need me to do?",
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
            text: "You’re bold, asking questions without proof you’re not with Vrenna. I’ve got something big in the [Weave Vault|weave_vault|Hidden chamber]—a tapestry that can control fog-beasts. Steal it for me, or destroy it if you’re her lapdog. Pick a side.",
            options: [
                {
                    text: "I’ll get it.",
                    nextId: null,
                    action: { type: "startQuest", questId: "korzogs_rebellion" }
                },
                {
                    text: "I’ll stop you.",
                    nextId: null,
                    action: { type: "startQuest", questId: "oppose_korzog" }
                }
            ]
        },
        {
            id: "expedition",
            text: "Your expedition? I don’t trust your lot yet. My weaves can trap fog-beasts, but I want a cut of any [portals|portals|Gateways] you find. Prove you’re not wasting my time—know someone like Renn Quickfingers?",
            options: [
                {
                    text: "Renn Quickfingers sent me.",
                    nextId: "renn"
                },
                {
                    text: "Join us, and you’ll get a share.",
                    nextId: null,
                    action: { type: "startQuest", questId: "korzog_expedition" }
                },
                {
                    text: "No deal.",
                    nextId: null
                }
            ]
        }
    ]
};