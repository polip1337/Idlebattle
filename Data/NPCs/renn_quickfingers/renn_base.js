export default {
    nodes: [
        {
            id: 'start',
            text: 'Taryn! Well, look who finally crawled out of the [Orphan\'s Hollow|orphansHollow|A dilapidated orphanage on the city’s edge, where Taryn grew up.]. Been a while. The real world\'s a bit different from those dusty old walls, eh?',
            options: [
                {
                    text: "It's... a lot to take in. Good to see you, Renn.",
                    nextId: 'city_intro_1',
                    conditions: [
                        { type: 'questActive', questId: 'fogscarHeist', negate: true },
                        { type: 'questCompleted', questId: 'fogscarHeist', negate: true }
                    ],
                    hideWhenUnavailable: true
                },
                {
                    text: "I manage. Good to see you too. What's new in your world?",
                    nextId: 'city_intro_1',
                    conditions: [
                        { type: 'questActive', questId: 'fogscarHeist', negate: true },
                        { type: 'questCompleted', questId: 'fogscarHeist', negate: true }
                    ],
                    hideWhenUnavailable: true
                },
                {
                    text: "Renn! Just the man I was looking for. About that sewer door job...",
                    nextId: 'questAccepted_ongoing',
                    conditions: [ { type: 'questActive', questId: 'fogscarHeist' } ],
                    hideWhenUnavailable: true
                },
                {
                    text: "Hey Renn. That sewer door business was something else, wasn't it?",
                    nextId: 'heistAlreadyDone',
                    conditions: [ { type: 'questCompleted', questId: 'fogscarHeist' } ],
                    hideWhenUnavailable: true
                }
            ]
        },
        {
            id: 'city_intro_1',
            text: "Heh. 'A lot to take in' is [Hollowreach|hollowreach|A city isolated by the collapse of interdimensional portals]'s unofficial motto. Especially down here in [Rustmarket|rustmarket|A neutral bazaar where all factions trade. Thieves and spies lurk among the stalls]. It's a chaotic mess, sure, but it's where the real opportunities are, if you know how to spot 'em. And how not to get a knife in your back.",
            options: [
                {
                    text: "So, care to teach me a few steps, old friend?",
                    nextId: 'city_intro_2'
                },
                {
                    text: "I'm a quick learner. What's the first lesson?",
                    nextId: 'city_intro_2'
                }
            ]
        },
        {
            id: 'city_intro_2',
            text: "Alright, listen up. First lesson of [Rustmarket|rustmarket|A neutral bazaar where all factions trade...]: trust no one completely, not even charming old me. *Especially* not charming old me.\" She winks. \"Second: always have an escape route. Third: information is more valuable than gold, most days. Now...\" She leans in, voice a bit lower. \"You didn't just come here for survival tips, did you? You got that look in your eye, same one you had before you 'borrowed' Matron Grimshaw's keys. You looking to make a splash, Taryn? Or just test the waters?",
            options: [
                {
                    text: "I'm definitely looking for more than just 'getting by'.",
                    nextId: 'heist_pre_pitch'
                },
                {
                    text: "A bit of both, I guess. What did you have in mind?",
                    nextId: 'heist_pre_pitch'
                },
                {
                    text: "For now, just finding my feet. Maybe later.",
                    nextId: 'decline_early'
                }
            ]
        },
        {
            id: 'decline_early',
            text: "Fair play. [Hollowreach|hollowreach|The city isolated by portal collapse] isn't going anywhere. You know where to find me in [Rustmarket|rustmarket|The central bazaar] when you're ready to stir things up. Don't be a stranger, Taryn."
            // No options, closes dialogue
        },
        {
            id: 'heist_pre_pitch',
            text: "That's the spirit! I knew that fire from the [Orphan's Hollow|orphansHollow|Our charming old home] days was still in ya. See, I've been keeping my ear to the ground, and I've stumbled onto something... significant. Something that could set us both up nicely, and maybe even make navigating this fog-choked city a damn sight easier.",
            options: [
                {
                    text: "You've got my full attention. What is it?",
                    nextId: 'heist_reveal'
                },
                {
                    text: "Sounds risky, Renn. What's the catch?",
                    nextId: 'heist_reveal' // Renn will address risk in the reveal
                }
            ]
        },
        {
            id: 'heist_reveal',
            text: "Risky? Taryn, my friend, everything worth doing in [Hollowreach|hollowreach|This lovely, doomed city] is risky! But the payoff for this... *chef's kiss*. I'm talking about a hidden door in the [Rustmarket Sewers|rustmarketSewers|The labyrinthine tunnels beneath the bazaar]. They say it leads to an Old Empire stash, packed with relics and who-knows-what. Right under [Rustmarket|rustmarket|The bazaar]'s nose. Imagine what we could find! So, what do you say? Fancy a bit of sewer-diving with your old pal Renn? I’ll even toss in a fine sword I ‘found’ to sweeten the deal if you’re in.",
            options: [
                {
                    text: 'Alright, Renn. I\'m in. Let\'s find that door. And I’ll take that sword.',
                    action: [
                        { type: 'startQuest', questId: 'fogscarHeist' },
                        { type: 'addItem', itemId: 'ironSword' },
                        {
                            type: 'unlockPOI',
                            mapId: 'hollowreach',
                            poiId: 'rustmarketSewersPOI'
                        }
                    ],
                    nextId: 'questAccepted_heist',
                    conditions: [
                        { type: 'questActive', questId: 'fogscarHeist', negate: true },
                        { type: 'questCompleted', questId: 'fogscarHeist', negate: true }
                    ],
                    hideWhenUnavailable: true
                },
                {
                    text: 'A sewer door to an Old Empire stash... Sounds incredibly dangerous.',
                    nextId: 'heist_reassurance',
                    conditions: [
                        { type: 'questActive', questId: 'fogscarHeist', negate: true },
                        { type: 'questCompleted', questId: 'fogscarHeist', negate: true }
                    ],
                    hideWhenUnavailable: true
                },
                {
                    text: 'That\'s a bit rich for my blood, Renn. Too risky.',
                    nextId: 'decline_heist',
                    conditions: [
                        { type: 'questActive', questId: 'fogscarHeist', negate: true },
                        { type: 'questCompleted', questId: 'fogscarHeist', negate: true }
                    ],
                    hideWhenUnavailable: true
                }
            ]
        },
        {
            id: 'heist_reassurance',
            text: "Dangerous? Of course! That's where the real scores are, Taryn! Look, I wouldn't drag you into something I didn't think we could handle. I'm good with locks and traps, you've got quick hands and quicker feet – or you will, after I show you a few tricks. This door in the [Rustmarket Sewers|rustmarketSewers|Those slimy tunnels] is our ticket to something big. Plus, I’ll give you that sword I mentioned – sharp enough to cut through any trouble. So, you in, or are those sewer rats too scary for ya?",
            options: [
                 {
                    text: 'Okay, okay, you convinced me. Let\'s do it. And don’t forget the sword.',
                    action: [
                        { type: 'startQuest', questId: 'fogscarHeist' },
                        { type: 'addItem', itemId: 'ironSword' },
                        {
                            type: 'unlockPOI',
                            mapId: 'hollowreach',
                            poiId: 'rustmarketSewersPOI'
                        }
                    ],
                    nextId: 'questAccepted_heist',
                    conditions: [
                        { type: 'questActive', questId: 'fogscarHeist', negate: true },
                        { type: 'questCompleted', questId: 'fogscarHeist', negate: true }
                    ],
                    hideWhenUnavailable: true
                },
                {
                    text: 'Rats, constructs... Yeah, I think I\'ll pass. Maybe I\'m not cut out for this yet.',
                    nextId: 'decline_tooWeak',
                     conditions: [
                        { type: 'questActive', questId: 'fogscarHeist', negate: true },
                        { type: 'questCompleted', questId: 'fogscarHeist', negate: true }
                    ],
                    hideWhenUnavailable: true
                }
            ]
        },
        {
            id: 'questAccepted_heist',
            text: 'Sweet! I knew I could count on you. Here’s that [Iron Sword|ironSword|A well-balanced blade, perfect for close encounters], as promised. Meet me at the [Rustmarket Sewers|rustmarketSewers|The tunnels under the bazaar]. We’ll find that door, crack it open, and see what’s waiting. It\'ll be a bit tricky, but don\'t worry. I’ll show you the ropes, teach you a thing or two about handling trouble. Think of it as a... practical lesson in Hollowreach survival.',
            options: [
                {
                    text: 'Got it. See you in the sewers.'
                    // No nextId, closes dialogue. Player navigates via map.
                }
            ]
        },
        {
            id: 'questAccepted_ongoing',
            text: "Right! The [Rustmarket Sewers|rustmarketSewers|Those slimy tunnels]. Glad you're still on board. That [Iron Sword|ironSword|Your new favorite toy] should come in handy. Ready to head down there? I was just thinking about the best way to that door. It'll be tricky, but like I said, I'll show you a few moves.",
            options: [
                {
                    text: 'Lead the way, Renn. Let\'s get this done.'
                    // No nextId, closes dialogue.
                }
            ]
        },
        {
            id: 'decline_heist',
            text: 'Your loss, Taryn. Some treasures are worth the risk, especially whatever’s behind that door in the [Rustmarket Sewers|rustmarketSewers|The underbelly of the bazaar]. But hey, if you ever grow a bigger pair... or just change your mind, you know where to find me. [Rustmarket|rustmarket|My usual haunt] is my turf.'
            // No options, closes dialogue
        },
        {
            id: 'decline_tooWeak',
            text: "Hah, don't sell yourself short, Taryn! But fair enough, the [Rustmarket Sewers|rustmarketSewers|That slimy maze] is no walk in the park. Maybe another time, eh? Or for something a little less... 'rat-infested'. Stick around [Rustmarket|rustmarket|The bazaar of wonders and woes], we'll find something that suits your pace when you're ready."
            // No options, closes dialogue
        },
        {
            id: 'heistAlreadyDone',
            text: "Right you are! My memory's not what it used to be. Good job on that [Rustmarket Sewers|rustmarketSewers|That little sewer adventure] run, by the way. Whatever was behind that door must’ve been worth it... or at least made a good story, eh? So, what's next on our agenda?"
            // Options could lead to other topics or end dialogue
        }
    ]
};