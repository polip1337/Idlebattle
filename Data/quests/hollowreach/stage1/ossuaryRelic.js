export default {
    id: 'ossuaryRelic',
    name: 'The Bone Whisper',
    giver: 'Sewer Contact',
    description: 'Retrieve a  relic from the Drowned Ossuary in the Rustmarket Sewers to fulfill a favor for the mysterious sewer contact.',
    steps: [
        {
            description: 'Defeat the undead guardians in the Drowned Ossuary.',
            hint: 'Prepare for combat against skeletons and wraiths awakened by the fog.',
            condition: (event, data) => event === 'combatComplete' && data.poiName === 'Drowned Ossuary'
        },
        {
            description: 'Retrieve the Bone Whisper relic from the crypt’s altar.',
            hint: 'Search the Drowned Ossuary for a relic that hums with dark energy.',
            condition: (event, data) => event === 'itemPickup' && data.itemId === 'boneWhisperRelic'
        },
        {
            description: 'Return the Bone Whisper relic to the sewer contact.',
            hint: 'Bring the relic back to the mysterious figure in the Rustmarket Sewers.',
            condition: (event, data) => event === 'dialogue' && data.npc === 'sewer_contact' && data.dialogueId === 'relic_return'
        }
    ],
    rewards: {
        experience: 40
    }
};