export default {
    nodes: [
        {
            id: "start",
            text: "*Zynia's eyes light up as she notices the fragment* That's a Loomkeeper tapestry fragment, isn't it? I've been looking for one of those. The Driftkin would pay handsomely for it.",
            options: [
                {
                    text: "How much are you offering?",
                    nextId: "offer_amount"
                },
                {
                    text: "It's not for sale.",
                    nextId: "decline"
                }
            ],
            conditions: [{ type: "item", item: "tapestryFragment" }]
        },
        {
            id: "offer_amount",
            text: "200 gold pieces. That's more than the Loomkeepers would give you. And we won't ask any questions about how you got it.",
            options: [
                {
                    text: "I'll take it.",
                    nextId: "accept",
                    action: [
                        { type: "removeItem", item: "tapestryFragment" },
                        { type: "addGold", value: 200 },
                        { type: "factionReputation", faction: "Driftkin", value: 10 },
                        { type: "factionReputation", faction: "Loomkeepers", value: -15 },
                        { type: "completeQuest", questId: "proofForTheWeave" }
                    ]
                },
                {
                    text: "I need to think about it.",
                    nextId: "consider"
                }
            ]
        },
        {
            id: "accept",
            text: "A pleasure doing business with you. *takes the fragment carefully* The Driftkin will put this to better use than the Loomkeepers ever could.",
            options: [
                {
                    text: "Goodbye.",
                    nextId: null
                }
            ]
        },
        {
            id: "consider",
            text: "Take your time. But remember - the Loomkeepers won't offer you gold. They'll just take it and give you empty promises.",
            options: [
                {
                    text: "Goodbye.",
                    nextId: null
                }
            ]
        },
        {
            id: "decline",
            text: "Your loss. The Loomkeepers will just lock it away in their vaults. At least the Driftkin would put it to use.",
            options: [
                {
                    text: "Goodbye.",
                    nextId: null
                }
            ]
        }
    ]
}; 