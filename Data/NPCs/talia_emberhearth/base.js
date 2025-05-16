export default {
    nodes: [
        {
            id: "start",
            text: "Welcome to my tavern, traveler. The fog’s been thicker than a dwarf’s beard lately. Folk say it’s the [portals|portals|Lost gateways] stirring again. Heard anything out there in [Hollowreach|hollowreach|Isolated city]?",
            options: [
                {
                    text: "What’s the talk about the fog?",
                    nextId: "fog_lore"
                },
                {
                    text: "Any work around here?",
                    nextId: "work"
                },
                {
                    text: "Just passing through.",
                    nextId: null
                }
            ]
        },
        {
            id: "fog_lore",
            text: "The [Driftkin|driftkin|Fog nomads] claim the fog’s alive, hiding paths to lost worlds. [Pulsefinders|pulsefinders|Fog worshippers] call it a god. Me? I’ve seen barrels vanish in that mist, only to reappear empty. Something’s out there, and it ain’t friendly.",
            options: [
                {
                    text: "What about the portals?",
                    nextId: "portals"
                },
                {
                    text: "Thanks for the info.",
                    nextId: null
                }
            ]
        },
        {
            id: "portals",
            text: "Old tales say [Hollowreach|hollowreach|Isolated city] was a hub of portals, till they collapsed. [Loomkeepers|loomkeepers|Artisan collective] weave maps of where they might be, but the fog twists everything. If you’re hunting answers, try the [Ashen Archive|ashen_archive|Fog-bound ruin].",
            options: [
                {
                    text: "I’ll check it out.",
                    nextId: null
                },
                {
                    text: "Too risky for me.",
                    nextId: null
                }
            ]
        },
        {
            id: "work",
            text: "Plenty of trouble in [Hollowreach|hollowreach|Isolated city]. The [Driftkin|driftkin|Fog nomads] are hiring for a barge run, but it’s risky. Or talk to that scribe, Renn, by the bar—he’s always scheming something. Watch your back, though.",
            options: [
                {
                    text: "I’ll look into it.",
                    nextId: null
                },
                {
                    text: "Not now.",
                    nextId: null
                }
            ]
        }
    ]
};