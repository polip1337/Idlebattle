export default {
    nodes: [
        {
            id: 'start',
            text: "That amulet you wear... *studies it intently* The Mistwalker Amulet. I've only seen it in our oldest tapestries. They are rumored to only for the first person that touches them. If you wish to prove its not fake, there's a task I have in mind. A valuable tapestry fragment was stolen from our archives - one that contains information valuable to us. It's being held by fog-touched scavengers in the Rustmarket Sewers.",
            options: [
                {
                    text: "The Mistwalker Amulet? Tell me more about it.",
                    nextId: 'amulet_info'
                },
                {
                    text: "I'll help recover the fragment.",
                    nextId: 'fragment_accept',
                    action: { type: 'startQuest', questId: 'proofForTheWeave' }
                },
                {
                    text: "What's in it for me?",
                    nextId: 'fragment_reward'
                }
            ]
        },
        {
            id: 'amulet_info',
            text: "The Mistwalker Amulet was crafted by the Old Empire's greatest weavers. It has the power to part the fog and reveal hidden paths. The Loomkeepers have been searching for it, as it could help us understand the portal network's collapse. Now that you have it, we might finally be able to piece together what happened.",
            options: [
                {
                    text: "I'll help recover the fragment.",
                    nextId: 'fragment_accept',
                    action: { type: 'startQuest', questId: 'proofForTheWeave' }
                },
                {
                    text: "What's in it for me?",
                    nextId: 'fragment_reward'
                }
            ]
        },
        {
            id: 'fragment_reward',
            text: "The Loomkeepers' knowledge is priceless, but I understand the need for tangible rewards. Return the fragment, and I'll share something out of our vaults with you. More importantly, you'll have our trust - something that's becoming increasingly valuable in these troubled times.",
            options: [
                {
                    text: "I'll help recover the fragment.",
                    nextId: 'fragment_accept',
                    action: { type: 'startQuest', questId: 'proofForTheWeave' }
                },
                {
                    text: "I need to think about it.",
                    nextId: 'fragment_decline'
                }
            ]
        },
        {
            id: 'fragment_accept',
            text: "Good. The scavengers have set up camp in the sewers. They're dangerous, but with the amulet's power, you should be able to handle them. Be careful - they're not just ordinary thieves. The fog has... changed them.",
            options: [
                {
                    text: "I'll be careful.",
                    nextId: 'fragment_guidance'
                }
            ]
        },
        {
            id: 'fragment_guidance',
            text: "The fragment will glow with a soft blue light - it's woven with portal shards. Don't let the scavengers destroy it. And watch out for Zynia Velt - she's been spying on our archives. If you see her, don't trust her offers.",
            options: [
                {
                    text: "I understand. I'll find the fragment.",
                    nextId: null,
                    action: [
                        { type: 'unlockPOI', mapId: 'rustmarketSewers', poiId: 'sewer_scavengerRedoubt_POI' }
                    ]
                },
                {
                    text: "I've already found it.",
                    nextId: 'fragment_return',
                    conditions: [
                        { type: "hasItem", itemId: "tapestryFragment" }
                    ],
                    hideWhenUnavailable: true
                }
            ]
        },
        {
            id: 'fragment_decline',
            text: "Very well. The offer stands if you change your mind. But remember - the Loomkeepers' knowledge could be crucial in understanding your amulet's true power.",
            options: [
                {
                    text: "I'll keep that in mind.",
                    nextId: null
                },
                {
                    text: "Actually, I've changed my mind. I'll help.",
                    nextId: 'fragment_accept'
                }
            ]
        },
        {
            id: 'fragment_return',
            text: "You've found it! *Examines the fragment carefully* This is exactly what we've been looking for. The portal coordinates are intact. Thank you for returning it to us.",
            options: [
                {
                    text: "You're welcome.",
                    nextId: null,
                    action: [
                        { type: 'completeQuest', questId: 'proofForTheWeave' },
                        { type: 'addItem', item: 'loomkeeperPortalMap' }
                    ]
                }
            ]
        }
    ]
}; 