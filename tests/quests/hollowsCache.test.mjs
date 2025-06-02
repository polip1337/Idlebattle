import { expect } from 'chai';
import { describe, it, before, after } from 'mocha';

// Mock quest data
const mockHollowsCache = {
    id: 'hollowsCache',
    name: 'The Hollow\'s Cache',
    giver: 'Old Maris',
    description: 'Retrieve the food cache from Ironspire Ruin',
    steps: [
        {
            description: 'Talk to Old Maris about the cache',
            condition: () => true
        },
        {
            description: 'Enter the Ironspire Ruin',
            condition: () => true
        },
        {
            description: 'Defeat the scavengers and retrieve the cache',
            condition: () => true
        }
    ],
    requirements: {
        quests: [],
        items: []
    },
    rewards: {
        items: ['foodRations'],
        experience: 50,
        reputation: {
            Hollowreach: 10
        }
    }
};

// Mock NPC dialogue data
const mockOldMarisBase = {
    nodes: [
        {
            id: 'start',
            text: 'Welcome to the orphanage.',
            options: [
                {
                    text: 'About the food cache',
                    nextId: 'questAccepted_cache'
                }
            ]
        },
        {
            id: 'questAccepted_cache',
            text: 'I need you to retrieve our food cache.',
            options: [
                {
                    text: 'I accept',
                    action: [
                        { type: 'startQuest', questId: 'hollowsCache' },
                        { type: 'unlockPOI', mapId: 'hollowreach', poiId: 'ironspire_ruin' }
                    ]
                }
            ]
        }
    ]
};

const mockOldMarisCacheReturn = {
    nodes: [
        {
            id: 'cache_decision',
            text: 'You have the cache!',
            options: [
                {
                    text: 'Here it is',
                    action: [
                        { type: 'completeQuest', questId: 'hollowsCache' }
                    ]
                }
            ]
        }
    ]
};

// Mock map data
const mockMaps = {
    hollowreach: {
        pois: [
            {
                npcId: 'old_maris',
                dialogueId: 'questAccepted_cache',
                type: 'npc'
            },
            {
                areaId: 'orphans_hollow',
                type: 'npc'
            },
            {
                areaId: 'ironspire_ruin',
                type: 'combat'
            },
            {
                areaId: 'cache_vault',
                type: 'combat'
            }
        ]
    }
};

// Helper functions
function findPOIByNpcAndDialogue(npcId, dialogueId) {
    for (const map of Object.values(mockMaps)) {
        if (!map.pois) continue;
        for (const poi of map.pois) {
            if (
                (poi.npcId === npcId || poi.npc === npcId) &&
                poi.dialogueId === dialogueId
            ) {
                return true;
            }
        }
    }
    return false;
}

function findAreaById(areaId) {
    for (const map of Object.values(mockMaps)) {
        if (!map.pois) continue;
        for (const poi of map.pois) {
            if (poi.areaId === areaId) {
                return true;
            }
        }
    }
    return false;
}

function findCombatNodesInArea(areaId) {
    for (const map of Object.values(mockMaps)) {
        if (!map.pois) continue;
        for (const poi of map.pois) {
            if (poi.areaId === areaId && poi.type === 'combat') {
                return true;
            }
        }
    }
    return false;
}

describe('Hollow\'s Cache Quest', () => {
    let gameState;
    let questState;
    let missingElements;

    beforeEach(() => {
        gameState = {
            inventory: [],
            companions: [],
            activeQuests: [],
            completedQuests: [],
            unlockedPOIs: [],
            currentMap: 'hollowreach'
        };
        questState = {
            currentStep: 0,
            completedSteps: []
        };
        missingElements = {
            questStructure: [],
            areas: [],
            npcs: [],
            dialogues: [],
            items: [],
            combat: [],
            questFlow: [],
            rewards: []
        };
    });

    after(() => {
        // Print missing elements report
        console.log('\n=== Missing Implementation Elements for Hollow\'s Cache ===');
        Object.entries(missingElements).forEach(([category, elements]) => {
            if (elements.length > 0) {
                console.log(`\n${category.toUpperCase()}:`);
                elements.forEach(element => console.log(`  - ${element}`));
            }
        });
    });

    describe('Quest Structure', () => {
        it('should have valid quest metadata', () => {
            if (!mockHollowsCache.id) missingElements.questStructure.push('Quest ID is missing');
            if (!mockHollowsCache.name) missingElements.questStructure.push('Quest Name is missing');
            if (!mockHollowsCache.giver) missingElements.questStructure.push('Quest Giver is missing');
            if (!mockHollowsCache.description) missingElements.questStructure.push('Quest Description is missing');
            if (!mockHollowsCache.steps || mockHollowsCache.steps.length === 0) {
                missingElements.questStructure.push('Quest Steps array is empty or missing');
            }
        });

        it('should have valid requirements', () => {
            if (!mockHollowsCache.requirements) {
                missingElements.questStructure.push('Quest Requirements object is missing');
            } else {
                if (!mockHollowsCache.requirements.quests) {
                    missingElements.questStructure.push('Required Quests array is missing');
                }
                if (!mockHollowsCache.requirements.items) {
                    missingElements.questStructure.push('Required Items array is missing');
                }
            }
        });

        it('should have valid rewards', () => {
            if (!mockHollowsCache.rewards) {
                missingElements.rewards.push('Quest Rewards object is missing');
            } else {
                if (!Array.isArray(mockHollowsCache.rewards.items)) {
                    missingElements.rewards.push('Item Rewards array is missing or invalid');
                }
                if (typeof mockHollowsCache.rewards.experience !== 'number') {
                    missingElements.rewards.push('Experience Reward is missing or invalid');
                }
                if (!mockHollowsCache.rewards.reputation) {
                    missingElements.rewards.push('Reputation Rewards object is missing');
                }
            }
        });
    });

    describe('Areas and Travel', () => {
        it('should have all required areas', () => {
            const requiredAreas = ['orphans_hollow', 'ironspire_ruin', 'cache_vault'];
            requiredAreas.forEach(area => {
                if (!findAreaById(area)) {
                    missingElements.areas.push(`Area "${area}" is not found in maps.json`);
                }
            });
        });

        it('should have required combat encounters', () => {
            if (!findCombatNodesInArea('cache_vault')) {
                missingElements.combat.push('Combat nodes in "cache_vault" area are missing');
            }
        });
    });

    describe('NPCs and Dialogues', () => {
        it('should have all required NPCs and dialogues', () => {
            // Check Old Maris's dialogue
            if (!findPOIByNpcAndDialogue('old_maris', 'questAccepted_cache')) {
                missingElements.npcs.push('Old Maris POI with "questAccepted_cache" dialogue is missing');
            }

            // Check cache return dialogue
            if (!findPOIByNpcAndDialogue('old_maris', 'cache_decision')) {
                missingElements.npcs.push('Old Maris POI with "cache_decision" dialogue is missing');
            }
        });
    });

    describe('Items', () => {
        it('should have required items', () => {
            if (!mockHollowsCache.rewards?.items?.includes('foodRations')) {
                missingElements.items.push('"foodRations" is missing from quest rewards');
            }
        });
    });

    describe('Quest Flow', () => {
        it('should have correct quest metadata', () => {
            if (mockHollowsCache.id !== 'hollowsCache') {
                missingElements.questFlow.push('Quest ID does not match expected value "hollowsCache"');
            }
            if (mockHollowsCache.name !== 'The Hollow\'s Cache') {
                missingElements.questFlow.push('Quest Name does not match expected value "The Hollow\'s Cache"');
            }
            if (mockHollowsCache.giver !== 'Old Maris') {
                missingElements.questFlow.push('Quest Giver does not match expected value "Old Maris"');
            }
            if (mockHollowsCache.steps.length !== 3) {
                missingElements.questFlow.push(`Quest Steps length is ${mockHollowsCache.steps.length}, expected 3`);
            }
        });
    });

    describe('Dialogue Flow', () => {
        it('should start quest when accepting from Old Maris', () => {
            const startNode = mockOldMarisBase.nodes.find(node => node.id === 'start');
            if (!startNode) {
                missingElements.dialogues.push('Old Maris start dialogue node is missing');
                return;
            }
            const acceptOption = startNode.options.find(opt => 
                opt.text.includes("About the food cache")
            );
            if (!acceptOption) {
                missingElements.dialogues.push('Old Maris food cache dialogue option is missing');
            } else if (acceptOption.nextId !== 'questAccepted_cache') {
                missingElements.dialogues.push('Old Maris food cache dialogue nextId is incorrect');
            }
        });

        it('should add quest and unlock Ironspire Ruin when accepting', () => {
            const questAcceptedNode = mockOldMarisBase.nodes.find(node => node.id === 'questAccepted_cache');
            if (!questAcceptedNode) {
                missingElements.dialogues.push('Old Maris quest accepted node is missing');
                return;
            }
            const acceptOption = questAcceptedNode.options[0];
            if (!acceptOption?.action) {
                missingElements.dialogues.push('Old Maris quest accepted action is missing');
            } else {
                if (!acceptOption.action.some(a => a.type === 'startQuest' && a.questId === 'hollowsCache')) {
                    missingElements.dialogues.push('Quest start action is missing or incorrect');
                }
                if (!acceptOption.action.some(a => a.type === 'unlockPOI' && a.mapId === 'hollowreach' && a.poiId === 'ironspire_ruin')) {
                    missingElements.dialogues.push('Ironspire Ruin unlock action is missing or incorrect');
                }
            }
        });
    });

    describe('Quest Progression', () => {
        it('should handle cache vault combat', () => {
            const combatStep = mockHollowsCache.steps.find(step => 
                step.description.includes('defeat the scavengers')
            );
            if (!combatStep) {
                missingElements.questFlow.push('Cache vault combat step is missing');
            } else if (typeof combatStep.condition !== 'function') {
                missingElements.questFlow.push('Cache vault combat step condition is not a function');
            }
        });

        it('should handle cache decision', () => {
            if (!mockOldMarisCacheReturn?.nodes) {
                missingElements.dialogues.push('Old Maris cache return dialogue nodes are missing');
                return;
            }
            const decisionNode = mockOldMarisCacheReturn.nodes.find(node => node.id === 'cache_decision');
            if (!decisionNode) {
                missingElements.dialogues.push('Cache decision node is missing');
            } else if (!decisionNode.options?.[0]?.action) {
                missingElements.dialogues.push('Cache decision action is missing');
            } else if (!decisionNode.options[0].action.some(a => 
                a.type === 'completeQuest' && 
                a.questId === 'hollowsCache'
            )) {
                missingElements.dialogues.push('Quest completion action is missing or incorrect');
            }
        });
    });

    describe('Quest Completion', () => {
        it('should grant correct rewards', () => {
            if (!mockHollowsCache.rewards?.items?.includes('foodRations')) {
                missingElements.rewards.push('"foodRations" is missing from quest rewards');
            }
            if (mockHollowsCache.rewards?.experience !== 50) {
                missingElements.rewards.push(`Experience reward is ${mockHollowsCache.rewards?.experience}, expected 50`);
            }
            if (!mockHollowsCache.rewards?.reputation?.Hollowreach || mockHollowsCache.rewards.reputation.Hollowreach !== 10) {
                missingElements.rewards.push('Hollowreach reputation reward is missing or incorrect');
            }
        });
    });
}); 