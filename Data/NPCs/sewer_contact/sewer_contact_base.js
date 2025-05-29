export default {
    nodes: [
        {
            id: "start",
            text: "A shadow slips from the damp wall of the [Rustmarket Sewers|rustmarketSewers|The labyrinthine tunnels beneath the bazaar]. A figure in a tattered cloak, face swallowed by shadow. They tilt their head, sizing you up like a crow eyeing a fresh corpse. 'Well, well. Not the usual vermin skittering through my tunnels. What’s a fresh soul like you doing in this festering maze?'",
            options: [
                {
                    text: "I’m after information.",
                    nextId: "information_trade"
                },
                {
                    text: "Just poking around.",
                    nextId: "exploration_warning"
                },
                {
                    text: "I shouldn’t be here.",
                    nextId: null
                }
            ]
        },
        {
            id: "information_trade",
            text: "The figure lets out a raspy chuckle, like dry bones rattling. 'Information, eh? That’s my trade, and I’ve got plenty—whispers from the dark, secrets the fog don’t want told. In [Hollowreach|hollowreach|The city cut off by broken portals], nothing’s free. You want scavengers’ schemes? Artifacts fresh from the muck? Or maybe... the fog’s own truths?' They lean closer, a faint whiff of decay on their breath. 'What’s it you’re chasing?'",
            options: [
                {
                    text: "Tell me about the scavengers.",
                    nextId: "scavenger_info"
                },
                {
                    text: "What’s the deal with the fog?",
                    nextId: "fog_secrets"
                },
                {
                    text: "I’m looking for something particular.",
                    nextId: "specific_inquiry"
                }
            ]
        },
        {
            id: "scavenger_info",
            text: "The figure slouches against the slimy wall, their cloak blending into the gloom. 'Scavengers, huh? Greedy little rats, clawing deeper into the [Scavenger Redoubt|scavengerRedoubt|Their bolt-hole in the sewers]. Word is they’ve dug up something ancient—something that hums with power. Old bones don’t lie.' Their gloved hand creeps out, palm up. 'More than that’ll cost you. Secrets ain’t cheap.'",
            options: [
                {
                    text: "What’s your price?",
                    nextId: "price_negotiation"
                },
                {
                    text: "Let's go back to the other information.",
                    nextId: "information_trade"
                }
            ]
        },
        {
            id: "fog_secrets",
            text: "The figure’s voice drops, barely a whisper over the drip of sewer water. 'The fog... its more. It’s alive, got a mind of its own. Watches you. Knows you. Learns and adapts' Their hood shifts, like they’re glancing at something unseen.'What do you want with it?'",
            options: [

                {
                    text: "That’s creepy as hell. Let's go back to the other information",
                    nextId: "information_trade"
                }
            ]
        },
        {
            id: "specific_inquiry",
            text: "The figure’s posture shifts, like a predator catching a scent. 'Particular, eh? That’s the kind of talk I like. Spill it—what’s got you creeping through my sewers?' Their voice is smooth, but there’s a hunger in it, like they’re peeling back your secrets with every word. 'Tell me, and maybe I’ll whisper something back. For a price.'",
            options: [
                {
                    text: "I’m after a tapestry fragment.",
                    nextId: "tapestry_info",
                    conditions: [
                        { type: "questActive", questId: "proofForTheWeave" }
                    ],
                    hideWhenUnavailable: true
                },
                {
                    text: "Changed my mind.",
                    nextId: null
                }
            ]
        },
        {
            id: "tapestry_info",
            text: "The figure’s chuckle is low, almost a growl. 'A Loomkeeper’s trinket? That tapestry fragment’s hot goods. Scavengers snatched it, and they’re itching to pawn it off in the [Scavenger Redoubt|scavengerRedoubt|Their grubby hideout].' They glance around, as if the shadows themselves might eavesdrop. 'I know exactly where they’re holed up. But knowledge like that? It’s got a cost.'",
            options: [
                {
                    text: "What’s the price?",
                    nextId: "price_negotiation"
                },
                {
                    text: "I’ll track ’em down myself.",
                    nextId: null
                }
            ]
        },
        {
            id: "exploration_warning",
            text: "The figure snorts, a sound like gravel on bone. 'Poking around? Brave or stupid, and I ain’t decided which. The fog creeps through these walls, thick and hungry. Scavengers’ll gut you for a shiny. And there’s worse—things that don’t die easy.' They point to a tunnel, their glove stained with something dark. 'You change your mind about needing help, I’m here. For a price.'",
            options: [
                {
                    text: "Alright, I need information.",
                    nextId: "information_trade"
                },
                {
                    text: "I’ll watch my step.",
                    nextId: null
                }
            ]
        },
        {
            id: "price_negotiation",
            text: "The figure’s gloved hand hovers, expectant. 'Gold’s good—shines even in the dark. But I’ve a taste for... other things. A favor, maybe. Something to quiet the whispers in the deep.' Their hood tilts, voice dripping with sly intent. 'What’s your offer, wanderer?'",
            options: [
                {
                    text: "I’ve got gold.",
                    nextId: "gold_payment"
                },
                {
                    text: "What kind of favor?",
                    nextId: "favor_details"
                }
            ]
        },
        {
            id: "gold_payment",
            text: "The figure’s fingers curl eagerly, like they’re already counting coins. 'Gold, huh? 100 pieces, and I’ll spill the exact spot in the [Scavenger Redoubt|scavengerRedoubt|Where the scavengers hide]. No tricks.' They hold out their hand, the glove patched and faintly stained. 'Pay up, and the secret’s yours.'",
            options: [
                {
                    text: "Here’s the gold.",
                    nextId: null,
                    action: [
                        { type: "removeGold", quantity: 100 },
                        { type: "unlockPOI", mapId: "rustmarketSewers", poiId: "sewer_scavengerRedoubt_POI" }
                    ]
                },
                {
                    text: "Too steep for me.",
                    nextId: null
                }
            ]
        },
        {
            id: "favor_details",
            text: "The figure’s voice turns soft, almost too soft, like a whisper from a grave. 'A favor’s worth more than gold sometimes. There’s a place in these sewers—old, forgotten, where the bones still hum with... let’s call it life.' They lean closer, their cloak rustling like dry leaves. 'Bring me something from there. A trinket, a relic, something that remembers the dark. Do that, and I’ll give you the scavengers’ hideout. Deal?'",
            options: [
                {
                    text: "I’ll get your relic.",
                    nextId: "favor_accepted"
                },
                {
                    text: "That sounds like trouble.",
                    nextId: null
                }
            ]
        },
        {
            id: "favor_accepted",
            text: "The figure’s hood dips, satisfied. 'Good. Head to the [Drowned Ossuary|drownedOssuary|A crypt in the sewers where old things linger]. Find me something that still... sings. You’ll know it when you feel it.' Their voice carries a strange reverence, like they’re speaking to the shadows themselves. 'Bring it back, and the [Scavenger Redoubt|scavengerRedoubt|The scavengers’ den] is yours. Don’t linger too long—the fog don’t like visitors.'",
            options: [
                {
                    text: "I’ll be back with it.",
                    nextId: null,
                    action: [
                        { type: "startQuest", questId: "ossuaryRelic" },
                        { type: "unlockPOI", mapId: "rustmarketSewers", poiId: "drowned_ossuary_POI" }

                    ]
                }
            ]
        }
    ]
};