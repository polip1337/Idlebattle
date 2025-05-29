export default {
    nodes: [
        {
            id: "start",
            text: "Keep your voice down, stranger. I'm Renn, once a scribe of the [Ashen Archive|ashen_archive|Fog-bound ruin]. I've got texts the [Loomkeepers|loomkeepers|Artisan collective] don't want you to see. Interested, or are you one of their spies?",
            options: [
                {
                    text: "What texts do you have?",
                    nextId: "texts"
                },
                {
                    text: "Why are you hiding?",
                    nextId: "hiding"
                },
                {
                    text: "I'm no spy. Goodbye.",
                    nextId: null
                }
            ]
        },
        {
            id: "texts",
            text: "I've got a fragment of a portal sequence, scribbled by a mad [Pulsefinder|pulsefinders|Fog worshippers]. It's dangerous, but it could lead to a lost gate. Want it? I need a [healingPotion|healingPotion|Restores health] first—fog's eating my lungs.",
            options: [
                {
                    text: "Here's your potion.",
                    nextId: null,
                    action: [
                        { type: "removeItem", item: "healingPotion" },
                        { type: "addItem", item: "forbidden_scroll" }
                    ],
                    conditions: [{ type: "item", item: "healingPotion" }]
                },
                {
                    text: "I don't have one.",
                    nextId: null
                }
            ]
        },
        {
            id: "hiding",
            text: "The [Loomkeepers|loomkeepers|Artisan collective] want my head for stealing from the Archive. I saw tapestries that move, recording secrets. They'll kill to keep that quiet. You won't sell me out, will you?",
            options: [
                {
                    text: "Your secret's safe.",
                    nextId: null
                },
                {
                    text: "I'm not getting involved.",
                    nextId: null
                }
            ]
        },
        {
            id: "texts",
            text: "I have some texts for sale.",
            options: [
                {
                    text: "I'll buy one.",
                    nextId: null,
                    action: { type: "startQuest", questId: "buy_text" }
                }
            ]
        }
    ]
};