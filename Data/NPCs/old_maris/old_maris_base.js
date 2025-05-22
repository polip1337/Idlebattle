export default {
    nodes: [
        {
            id: "start",
            text: "*Old Maris looks up from her work sorting supplies, her weathered face softening into a warm, familiar smile* Well, if it ain’t Taryn, my dear heart, all grown up and back in [Orphan's Hollow|orphansHollow|The last safe haven for Hollowreach's most vulnerable]. *She adjusts her shawl and steps closer* Been too long since you’ve come ‘round, child. We’re still here, holdin’ this place together despite the fog. *She gestures to the bustling community around her* Takes all we’ve got to keep folks fed and safe, but you know we don’t give up easy.",
            options: [
                {
                    text: "How’re you keeping everyone fed these days, Maris?",
                    nextId: "food_crisis",
                    conditions: [
                        { type: "questActive", questId: "hollowsCache", negate: true },
                        { type: "questCompleted", questId: "hollowsCache", negate: true }
                    ],
                    hideWhenUnavailable: true
                },
                {
                    text: "I want to help out, Maris. For old times’ sake.",
                    nextId: "help_offer",
                    conditions: [
                        { type: "questActive", questId: "hollowsCache", negate: true },
                        { type: "questCompleted", questId: "hollowsCache", negate: true }
                    ],
                    hideWhenUnavailable: true
                },
                {
                    text: "Just passing through, but it’s good to see you.",
                    nextId: "passing_through"
                }
            ]
        },
        {
            id: "food_crisis",
            text: "*Maris sighs, her hands resting on her cane as her eyes grow distant* Oh, Taryn, it’s a struggle. The fog’s choked out our crops, and the Old Empire’s caches we relied on are near empty. *She leans closer, her voice dropping to a hopeful whisper* Word is, there’s a cache hidden out there, maybe in the [Fogged Docks|foggedDocks|An abandoned dock swallowed by the mist]. Trouble is, the fog’s too thick to get through right now. If we could find a way in—or find other caches—it’d mean full bellies for these folks come winter.",
            options: [
                {
                    text: "I’ll keep an eye out for a way to get through the fog.",
                    nextId: "quest_offer"
                },
                {
                    text: "That sounds like a lot to handle, Maris.",
                    nextId: "danger_acknowledgment"
                }
            ]
        },
        {
            id: "help_offer",
            text: "*Maris’s eyes crinkle with pride* That’s my Taryn, always had a heart bigger than the Hollow itself. *She pats your arm gently* You were always runnin’ about these streets as a young’un, helpin’ where you could. Now, here’s somethin’ big: we’ve heard of a cache in the [Fogged Docks|foggedDocks|An old dock that might hold supplies]. Problem is, the fog’s so thick we can’t get in. If you could find a way to push through that mist—or sniff out other caches—it’d save lives, child.",
            options: [
                {
                    text: "I’ll look for a way to get through or find other caches.",
                    nextId: "quest_offer"
                },
                {
                    text: "I need some time to think it over, Maris.",
                    nextId: null
                }
            ]
        },
        {
            id: "quest_offer",
            text: "*Maris’s voice grows firm, her eyes gleaming with resolve* Bless you, Taryn. The [Fogged Docks|foggedDocks|Our best hope for survival] are locked tight by that cursed fog right now—no one’s found a way in. *She presses a small, glowing crystal into your hand* This old thing might help you spot somethin’ in the mist, or at least keep you from gettin’ lost. Keep your eyes peeled for any caches or a way to fight through that fog. The kids here are countin’ on you, same as they always did.",
            options: [
                {
                    text: "I’ll do my best, Maris.",
                    action: [
                        { type: "startQuest", questId: "hollowsCache" },
                        { type: "addItem", itemId: "fog_guide_crystal" }
                    ]
                },
                {
                    text: "I’ll need to gear up first.",
                    nextId: null
                }
            ]
        },
        {
            id: "danger_acknowledgment",
            text: "*Maris nods, her expression soft but heavy* It’s a hard truth, Taryn. The fog’s a beast, and what hides in it’s worse. *She glances at the children playing nearby, her voice steadying* But you know what’s worse than the fog? Lettin’ these folks starve. You grew up here—you know we fight for each other. If you change your mind, we’ll be waitin’, same as always.",
            options: [
                {
                    text: "Alright, I’ll look for a way to help.",
                    nextId: "quest_offer",
                    conditions: [
                        { type: "questActive", questId: "hollowsCache", negate: true },
                        { type: "questCompleted", questId: "hollowsCache", negate: true }
                    ],
                    hideWhenUnavailable: true
                },
                {
                    text: "I hope you find a way, Maris.",
                    nextId: null
                }
            ]
        },
        {
            id: "passing_through",
            text: "*Maris chuckles, adjusting her shawl* Passin’ through, are you? Just like when you were a scamp, always wanderin’. *Her smile warms* [Orphan's Hollow|orphansHollow|Our little family] is still your home, Taryn, fog or no fog. Stay a while—there’s stew by the fire and folks who’d love to hear your stories. You’re one of ours, always will be.",
            options: [
                {
                    text: "Maybe I can stick around and help out.",
                    nextId: "help_offer",
                    conditions: [
                        { type: "questActive", questId: "hollowsCache", negate: true },
                        { type: "questCompleted", questId: "hollowsCache", negate: true }
                    ],
                    hideWhenUnavailable: true
                },
                {
                    text: "Thanks, Maris. It’s good to be back.",
                    nextId: null
                }
            ]
        }
    ]
};