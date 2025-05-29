export default {
    id: 'hollowsCache',
    name: 'The Hollow’s Cache',
    giver: 'Old Maris',
    description: 'Uncover a food cache behind Ironspire Bridge to aid Hollowreach’s food crisis.',
    steps: [
        {
            description: 'Speak to Old Maris in Orphan’s Hollow to learn about the cache.',
            hint: 'Find Old Maris in the Orphan’s Hollow area.',
            condition: (event, data) => event === 'dialogue' && data.npcName === 'Old Maris' && data.dialogueNodeId === 'questAccepted_cache'
        },
        {
            description: 'Enter the Ironspire Ruin and defeat the scavengers guarding the cache.',
            hint: 'Travel to the Ironspire Ruin and win the combat encounter at the Cache Vault.',
            condition: (event, data) => event === 'combatComplete' && data.poiName === 'Cache Vault'
        },
        {
            description: 'Decide the fate of the food cache.',
            hint: 'Choose to distribute, keep, or sell the food cache in the Cache Vault.',
            condition: (event, data) => event === 'dialogue' && data.npcName === 'Old Maris' && ['distributeCache', 'keepCache', 'sellCache'].includes(data.dialogueNodeId)
        }
    ],
    rewards: {
        items: ['foodRations'],
        experience: 50,
        reputation: {
            Hollowreach: 10 // Only applied if cache is distributed
        }
    }
};