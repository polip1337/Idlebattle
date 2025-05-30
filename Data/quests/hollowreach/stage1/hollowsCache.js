export default {
    id: 'hollowsCache',
    name: 'The Hollow’s Cache',
    giver: 'Old Maris',
    description: 'Uncover a food cache behind Ironspire Bridge to aid Hollowreach’s food crisis.',
    steps: [
        {
            description: 'Enter the Fogged Docks somehow',
            hint: 'You have to deal with the guard, or get there by accident.',
            condition: (event, data) => event === 'travel' && data.mapId === 'foggedDocks'
        },
        {
            description: 'Defeat the scavengers guarding the cache.',
            hint: 'Travel to the Ironspire Ruin and win the combat encounter at the Cache Vault.',
            condition: (event, data) => event === 'combatComplete' && data.poiName === 'Fogged Cache'
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