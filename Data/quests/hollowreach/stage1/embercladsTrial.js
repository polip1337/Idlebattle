export default {
    id: 'embercladsTrial',
    name: 'Emberclad’s Trial',
    giver: 'Lyra Emberkin',
    description: 'Assist Lyra Emberkin’s fog-burning ritual in Scorchveil Pit using the Mistwalker Amulet.',
    steps: [
        {
            description: 'Speak to Lyra Emberkin in Cinderhold to receive the task.',
            hint: 'Find Lyra Emberkin in the Cinderhold area.',
            condition: (event, data) => event === 'dialogue' && data.npcName === 'Lyra Emberkin' && data.dialogueNodeId === 'questAccepted_emberclad'
        },
        {
            description: 'Protect the ritual site in Scorchveil Pit from fog-tainted constructs.',
            hint: 'Travel to the Scorchveil Pit and win or evade the combat encounter at the Ritual Site.',
            condition: (event, data) => (event === 'combatComplete' || event === 'dialogue') && data.poiName === 'Ritual Site' && ['constructEvaded', 'constructDefeated'].includes(data.dialogueNodeId)
        },
        {
            description: 'Decide the ritual’s outcome with Lyra Emberkin.',
            hint: 'Speak to Lyra or Drenvar in Scorchveil Pit to choose the ritual’s fate.',
            condition: (event, data) => event === 'dialogue' && ['lyra_emberkin', 'drenvar_ironflame'].includes(data.npcName) && ['protectRitual', 'failRitual', 'sabotageRitual'].includes(data.dialogueNodeId)
        }
    ],
    rewards: {
        items: ['pyromanticRune'],
        experience: 75,
        reputation: {
            Emberclad: 10 // Only applied if ritual is protected
        }
    }
};