export default {
    id: 'proofForTheWeave',
    name: "Proof for the weave",
    giver: 'Vrenna Stoneweave',
    description: 'Uncover the Mistwalker Amulet\'s secrets and choose a faction to share them with.',
    steps: [
        {
            description: 'Meet Renn in her house to discuss the amulet\'s origins.',
            hint: 'Find Renn Quickfingers in the Rustmarket area.',
            condition: (event, data) => event === 'dialogue' && data.npc === 'Renn Quickfingers' && data.dialogueId === 'mistwalker_intro'
        },
        {
            description: 'Enter the Ashen Archive and navigate through the fog traps.',
            hint: 'Travel to the Ashen Archive entrance and proceed carefully.',
            condition: (event, data) => event === 'areaEnter' && data.areaId === 'ashenArchive'
        },
        {
            description: 'Deal with the rune-etched sentries.',
            hint: 'Either sneak past or defeat the sentries guarding the archive.',
            condition: (event, data) => (event === 'combatComplete' || event === 'stealthSuccess') && data.areaId === 'ashenArchive'
        },
        {
            description: 'Solve the rune puzzles in the Rune Chamber.',
            hint: 'Interact with the ancient runes to activate the amulet.',
            condition: (event, data) => event === 'puzzleComplete' && data.areaId === 'runeChamber'
        },
        {
            description: 'Confront Korzog and protect the amulet.',
            hint: 'Either negotiate with or defeat Korzog to secure the amulet.',
            condition: (event, data) => (event === 'combatComplete' || event === 'dialogue') && data.npc === 'Korzog'
        }
    ],
    rewards: {
        items: ['mistwalkerAmulet'],
        experience: 100,
        reputation: {
            Loomkeepers: 10,
            Driftkin: 10,
            Emberclad: 10
        }
    },
    requirements: {
        level: 1,
        reputation: {
            Loomkeepers: 0,
            Driftkin: 0,
            Emberclad: 0
        }
    }
}; 