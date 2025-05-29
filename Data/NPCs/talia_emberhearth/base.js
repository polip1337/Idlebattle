export default {
    nodes: [
        {
            id: "start",
            text: "Well, if it ain’t Taryn, skulkin’ into my tavern again. Fog’s thicker than a dwarf’s beard out there, and twice as ornery. You’ve lived in [Hollowreach|hollowreach|Isolated city] long enough to know it’s stirrin’ trouble. Heard any whispers on your wanderings?",
            options: [
                {
                    text: "What’s the deal with this fog?",
                    nextId: "fog_lore"
                },
                {
                    text: "Got any work for an old neighbor?",
                    nextId: "work"
                },
                {
                    text: "Just here for a drink, Talia.",
                    nextId: "drink"
                }
            ]
        },
        {
            id: "fog_lore",
            text: "You’ve seen it, Taryn—fog so dense it swallows sound. The [Driftkin|driftkin|Fog nomads] swear it’s alive, hidin’ paths to lost worlds. [Pulsefinders|pulsefinders|Fog worshippers] call it their god’s breath. Me? I’ve watched good ale barrels vanish in that mist, only to turn up empty. Somethin’s out there, and it’s got teeth.",
            options: [
                {
                    text: "What’s this about portals?",
                    nextId: "portals"
                },
                {
                    text: "That’s creepy. Any way to stay safe?",
                    nextId: "safety"
                },
                {
                    text: "Thanks, Talia. I’ll steer clear.",
                    nextId: null
                }
            ]
        },
        {
            id: "portals",
            text: "You’ve heard the old tales, Taryn. [Hollowreach|hollowreach|Isolated city] was a crossroads of portals once, till they went wild and collapsed. The [Loomkeepers|loomkeepers|Artisan collective] are still weavin’ maps to find ‘em, but the fog plays tricks. They’re desperate for a relic in the [Ashen Archive|ashen_archive|Fog-bound ruin] to stabilize one. Might be worth a look.",
            options: [
                {
                    text: "What kind of relic?",
                    nextId: "relic"
                },
                {
                    text: "Sounds like a death trap.",
                    nextId: null
                }
            ]
        },
        {
            id: "relic",
            text: "The [Loomkeepers|loomkeepers|Artisan collective] call it the Shard of Tethys—a crystal what hums like a trapped storm. Supposedly, it’s buried in the [Ashen Archive|ashen_archive|Fog-bound ruin]. They reckon it’ll anchor a portal and keep the fog from eatin’ it. They’re offerin’ good coin, Taryn, but that ruin’s a maze, and the fog don’t play nice.",
            options: [
                {
                    text: "I’ll head to the Ashen Archive for the Shard.",
                    nextId: "accept_quest"
                },
                {
                    text: "Too dangerous for me, Talia.",
                    nextId: null
                }
            ]
        },
        {
            id: "accept_quest",
            text: "Knew you had a spark, Taryn. The [Loomkeepers|loomkeepers|Artisan collective] are holed up near the old mill. Find their leader, Vrenna—she’ll point you to the [Ashen Archive|ashen_archive|Fog-bound ruin]. Watch for fog-wraiths; they’ll strip your bones before you blink. Bring that Shard back, and I’ll have a mug waitin’ for you.",
            options: [
                {
                    text: "I’m on it, Talia.",
                    nextId: null
                }
            ]
        },
        {
            id: "safety",
            text: "Safe? In [Hollowreach|hollowreach|Isolated city]? Hah! Carry a lantern with a trueflame wick—[Driftkin|driftkin|Fog nomads] sell ‘em cheap. Keeps the fog from crawlin’ too close. If you’re really spooked, stick to the cobbled paths. Stray off, and you’re as good as gone.",
            options: [
                {
                    text: "Good to know. What about those portals?",
                    nextId: "portals"
                },
                {
                    text: "I’ll stick to the paths. Thanks.",
                    nextId: null
                }
            ]
        },
        {
            id: "work",
            text: "Always trouble in [Hollowreach|hollowreach|Isolated city], Taryn, you know that. The [Driftkin|driftkin|Fog nomads] need hands for a barge run, but the fog’s been snatchin’ boats. Or there’s Renn, that shifty scribe by the bar, mutterin’ about some job. If you want real work, though, the [Loomkeepers|loomkeepers|Artisan collective] are lookin’ for someone brave or fool enough to poke around the [Ashen Archive|ashen_archive|Fog-bound ruin].",
            options: [
                {
                    text: "What’s the Loomkeepers’ deal?",
                    nextId: "relic"
                },
                {
                    text: "I’ll talk to Renn.",
                    nextId: "renn"
                },
                {
                    text: "Not feelin’ it, Talia.",
                    nextId: null
                }
            ]
        },
        {
            id: "renn",
            text: "That weasel Renn? He’s scribblin’ away in the corner, probably plottin’ something dodgy. Last week, he had folk chasin’ ‘cursed coins’ in the fog. Half didn’t come back. If you’re desperate, hear him out, but don’t say I didn’t warn you, Taryn.",
            options: [
                {
                    text: "I’ll see what he’s got.",
                    nextId: null
                },
                {
                    text: "Sounds like a bad bet. Any other work?",
                    nextId: "relic"
                }
            ]
        },
        {
            id: "drink",
            text: "A drink, eh? You’ve been dodgin’ my ale since you were old enough to shave, Taryn. Got a fresh batch of [Mistbrew|mistbrew|Local ale]—tastes like the fog smells, but it’ll warm your bones. Still, you look like you’re itchin’ for more than a mug. Trouble’s brewin’ out there.",
            options: [
                {
                    text: "What kind of trouble?",
                    nextId: "fog_lore"
                },
                {
                    text: "Just the ale for now, Talia.",
                    nextId: null
                }
            ]
        }
    ]
};