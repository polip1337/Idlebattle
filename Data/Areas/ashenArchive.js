export default {
    id: 'ashenArchive',
    name: 'Ashen Archive',
    description: 'An ancient repository of Old Empire knowledge, now shrouded in fog and protected by rune-etched sentries.',
    locations: [
        {
            id: 'archiveEntrance',
            name: 'Archive Entrance',
            description: 'The massive stone doors of the archive stand partially open, fog swirling around the entrance.',
            connections: ['rustmarket', 'archiveMainHall'],
            encounters: [
                {
                    type: 'trap',
                    id: 'fogTrap1',
                    name: 'Fog Trap',
                    description: 'A subtle rune pattern on the floor that triggers a dense fog cloud when disturbed.',
                    difficulty: 1,
                    rewards: {
                        experience: 10
                    }
                }
            ]
        },
        {
            id: 'archiveMainHall',
            name: 'Main Hall',
            description: 'A vast chamber filled with ancient tomes and artifacts. Rune-etched sentries patrol the area.',
            connections: ['archiveEntrance', 'runeChamber'],
            encounters: [
                {
                    type: 'combat',
                    id: 'runeSentries',
                    name: 'Rune-etched Sentries',
                    description: 'Ancient constructs powered by Old Empire runes, programmed to protect the archive.',
                    difficulty: 2,
                    rewards: {
                        experience: 25,
                        items: ['runeFragment']
                    }
                },
                {
                    type: 'trap',
                    id: 'fogTrap2',
                    name: 'Advanced Fog Trap',
                    description: 'A complex network of runes that creates multiple fog barriers.',
                    difficulty: 2,
                    rewards: {
                        experience: 15
                    }
                }
            ]
        },
        {
            id: 'runeChamber',
            name: 'Rune Chamber',
            description: 'A circular chamber with glowing runes covering the walls. The Mistwalker Amulet rests on a central pedestal.',
            connections: ['archiveMainHall'],
            encounters: [
                {
                    type: 'puzzle',
                    id: 'runePuzzle',
                    name: 'Rune Activation Puzzle',
                    description: 'A complex arrangement of runes that must be activated in the correct sequence to unlock the amulet\'s power.',
                    difficulty: 3,
                    rewards: {
                        experience: 50,
                        items: ['mistwalkerAmulet']
                    }
                }
            ],
            special: {
                type: 'quest',
                questId: 'mistwalkerSecret',
                trigger: 'puzzleComplete'
            }
        }
    ],
    requirements: {
        level: 5,
        quests: ['mistwalkerSecret']
    },
    rewards: {
        experience: 100,
        items: ['mistwalkerAmulet', 'runeFragment'],
        reputation: {
            Loomkeepers: 5,
            Driftkin: 5,
            Emberclad: 5
        }
    }
}; 