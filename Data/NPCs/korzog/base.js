export default {
    nodes: [
        {
            id: "start",
            text: "Vrenna’s too cautious. The [fog|fog|Living chaos] can be tamed with my weaves. You got the guts to help, or you just another coward?",
            options: [
                {
                    text: "What’s your plan for the [fog|fog|Chaos mist]?",
                    nextId: "plan"
                },
                {
                    text: "I hear you’re making a forbidden tapestry.",
                    nextId: "quest",
                    action: { type: "startQuest", questId: "korzogs_rebellion" },
                    conditions: [{ type: "skill", stat: "Dexterity", value: 7 }]
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
            id: "plan",
            text: "My tapestries can bind [fog|fog|Monstrous mist] creatures, not just map them. Vrenna fears the risk, but I say we fight the [portals|portals|Broken gates]’ curse head-on.",
            options: [
                {
                    text: "Sounds dangerous. What do you need?",
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
            text: "I’ve woven a tapestry in the [Weave Vault|weave_vault|Hidden chamber] to control fog-beasts. Steal it for me, or destroy it if you’re with Vrenna.",
            options: [
                {
                    text: "I’ll get it.",
                    nextId: null,
                    action: { type: "startQuest", questId: "korzogs_rebellion" }
                },
                {
                    text: "I’ll stop you.",
                    nextId: null,
                    action: { type: "factionConflict", faction: "loomkeepers", status: "oppose_korzog" }
                }
            ]
        },
        {
            id: "expedition",
            text: "Your expedition needs fighters. My weaves can trap fog-beasts, but I want a cut of any [portals|portals|Gateways] you find.",
            options: [
                {
                    text: "Join us, and you’ll get a share.",
                    nextId: null,
                    action: { type: "factionSupport", faction: "loomkeepers", resource: "beast_traps" }
                },
                {
                    text: "No deal.",
                    nextId: null
                }
            ]
        }
    ]
};