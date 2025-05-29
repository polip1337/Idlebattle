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
            text: "*Zynia's eyes gleam with anticipation* 500 gold pieces. That's more than the Loomkeepers would ever give you. And we'll put it to better use than they would.",
            options: [
                {
                    text: "I accept your offer.",
                    nextId: "accept"
                },
                {
                    text: "I need to think about it.",
                    nextId: "consider"
                },
                {
                    text: "No, I'll keep it.",
                    nextId: "decline"
                }
            ]
        },
        {
            id: "accept",
            text: "A pleasure doing business with you. *takes the fragment carefully* The Driftkin will put this to better use than the Loomkeepers ever could.",
            options: [
                {
                    text: "Goodbye.",
                    nextId: null,
                    action: [
                        { type: "removeItem", itemId: "tapestryFragment" },
                        { type: "addItem", itemId: "gold", quantity: 500 }
                    ]
                }
            ]
        },
        {
            id: "consider",
            text: "Take your time. But remember - the Loomkeepers won't offer you gold. They'll just take it and give you empty promises.",
            options: [
                {
                    text: "I've made my decision. I accept.",
                    nextId: "accept"
                },
                {
                    text: "I've decided to keep it.",
                    nextId: "decline"
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