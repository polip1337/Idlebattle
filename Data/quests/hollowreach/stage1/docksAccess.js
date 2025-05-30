export default {
    id: 'docksAccess',
    name: "Access to the Fogged Docks",
    giver: 'Guard',
    description: 'Find a way to gain access to the Fogged Docks area.',
    steps: [
        {
            description: 'Find a way past the guard at the docks entrance.',
            hint: 'Try talking to the guard or seek help from Vrenna at the Threadhall.',
            condition: (event, data) => event === 'dialogue' && data.npc === 'Guard' && data.dialogueId === 'start'
        },
        {
            description: 'Choose your approach: Sneak past, bribe the guard, or seek Vrenna\'s help.',
            hint: 'Make your choice in the dialogue.',
            condition: (event, data) => event === 'travel' && data.mapId === 'foggedDocks'
            
        }
    ],
    rewards: {
        experience: 50  
    },
    requirements: {
        level: 1
    }
}; 