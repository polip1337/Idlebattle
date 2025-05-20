export default {
    id: 'mistwalkerSecret',
    name: "The Mistwalker's Secret",
    giver: 'Renn Quickfingers',
    description: 'Uncover the Mistwalker Amulet\'s secrets and choose a faction to share them with.',
    steps: [
        {
            description: 'Meet Renn in Rustmarket to discuss the amulet\'s origins.',
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
        },
        {
            description: 'Choose a faction to share the amulet\'s secrets with.',
            hint: 'Decide whether to align with the Loomkeepers, Driftkin, or Emberclad.',
            condition: (event, data) => event === 'dialogue' && ['Loomkeeper Elder', 'Driftkin Chief', 'Emberclad Commander'].includes(data.npc)
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