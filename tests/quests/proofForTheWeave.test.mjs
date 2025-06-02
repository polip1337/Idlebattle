import { expect } from 'chai';
import { describe, it, before, after } from 'mocha';

// Mock quest data
const mockProofForTheWeave = {
    id: 'proofForTheWeave',
    name: 'Proof for the Weave',
    giver: 'Vrenna Stoneweave',
    description: 'Retrieve the tapestry fragment',
    steps: [
        {
            description: 'Talk to Vrenna about the fragment',
            condition: () => true
        },
        {
            description: 'Find the sewer contact',
            condition: () => true
        },
        {
            description: 'Enter the scavenger redoubt',
            condition: () => true
        },
        {
            description: 'Deal with the fog-touched scavengers',
            condition: () => true
        },
        {
            description: 'Retrieve the tapestry fragment',
            condition: () => true
        },
        {
            description: 'Return to Vrenna',
            condition: () => true
        }
    ],
    requirements: {
        quests: ['fogscarHeist'],
        items: ['mistwalkerAmulet']
    },
    rewards: {
        items: ['loomkeeperPortalMap'],
        experience: 50,
        reputation: {
            Loomkeepers: 10,
            Driftkin: -5
        },
        unlock: 'mistwalkerSecret'
    }
};

// Mock NPC dialogue data
const mockVrennaBase = {
    nodes: [
        {
            id: 'start',
            text: 'Welcome to my shop.',
            options: [
                {
                    text: 'About the tapestry fragment',
                    nextId: 'fragment_request'
                }
            ]
        },
        {
            id: 'fragment_request',
            text: 'I need you to retrieve a tapestry fragment.',
            options: [
                {
                    text: 'I accept',
                    action: [
                        { type: 'startQuest', questId: 'proofForTheWeave' },
                        { type: 'unlockPOI', mapId: 'hollowreach', poiId: 'rustmarketSewers' }
                    ]
                }
            ]
        }
    ]
};

const mockSewerContact = {
    nodes: [
        {
            id: 'start',
            text: 'The scavengers have what you seek.',
            options: [
                {
                    text: 'Tell me more',
                    action: [
                        { type: 'unlockPOI', mapId: 'rustmarketSewers', poiId: 'scavenger_redoubt' }
                    ]
                }
            ]
        }
    ]
};

const mockVrennaFragmentReturn = {
    nodes: [
        {
            id: 'fragment_decision',
            text: 'You have the fragment!',
            options: [
                {
                    text: 'Here it is',
                    action: [
                        { type: 'completeQuest', questId: 'proofForTheWeave' }
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
                npcId: 'vrenna_stoneweave',
                dialogueId: 'fragment_request',
                type: 'npc'
            },
            {
                npcId: 'sewer_contact',
                dialogueId: 'reveal_location',
                type: 'npc'
            },
            {
                areaId: 'rustmarketSewers',
                type: 'combat'
            },
            {
                areaId: 'scavenger_redoubt',
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

describe('Proof for the Weave Quest', () => {
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
        console.log('\n=== Missing Implementation Elements for Proof for the Weave ===');
        Object.entries(missingElements).forEach(([category, elements]) => {
            if (elements.length > 0) {
                console.log(`\n${category.toUpperCase()}:`);
                elements.forEach(element => console.log(`  - ${element}`));
            }
        });
    });

    describe('Quest Structure', () => {
        it('should have valid quest metadata', () => {
            if (!mockProofForTheWeave.id) missingElements.questStructure.push('Quest ID is missing');
            if (!mockProofForTheWeave.name) missingElements.questStructure.push('Quest Name is missing');
            if (!mockProofForTheWeave.giver) missingElements.questStructure.push('Quest Giver is missing');
            if (!mockProofForTheWeave.description) missingElements.questStructure.push('Quest Description is missing');
            if (!mockProofForTheWeave.steps || mockProofForTheWeave.steps.length === 0) {
                missingElements.questStructure.push('Quest Steps array is empty or missing');
            }
        });

        it('should have valid requirements', () => {
            if (!mockProofForTheWeave.requirements) {
                missingElements.questStructure.push('Quest Requirements object is missing');
            } else {
                if (!mockProofForTheWeave.requirements.quests) {
                    missingElements.questStructure.push('Required Quests array is missing');
                }
                if (!mockProofForTheWeave.requirements.items) {
                    missingElements.questStructure.push('Required Items array is missing');
                }
            }
        });

        it('should have valid rewards', () => {
            if (!mockProofForTheWeave.rewards) {
                missingElements.rewards.push('Quest Rewards object is missing');
            } else {
                if (!Array.isArray(mockProofForTheWeave.rewards.items)) {
                    missingElements.rewards.push('Item Rewards array is missing or invalid');
                }
                if (typeof mockProofForTheWeave.rewards.experience !== 'number') {
                    missingElements.rewards.push('Experience Reward is missing or invalid');
                }
                if (!mockProofForTheWeave.rewards.reputation) {
                    missingElements.rewards.push('Reputation Rewards object is missing');
                }
            }
        });
    });

    describe('Areas and Travel', () => {
        it('should have all required areas', () => {
            const requiredAreas = ['rustmarketSewers', 'scavenger_redoubt'];
            requiredAreas.forEach(area => {
                if (!findAreaById(area)) {
                    missingElements.areas.push(`Area "${area}" is not found in maps.json`);
                }
            });
        });

        it('should have required combat encounters', () => {
            if (!findCombatNodesInArea('scavenger_redoubt')) {
                missingElements.combat.push('Combat nodes in "scavenger_redoubt" area are missing');
            }
        });
    });

    describe('NPCs and Dialogues', () => {
        it('should have all required NPCs and dialogues', () => {
            // Check Vrenna's dialogue
            if (!findPOIByNpcAndDialogue('vrenna_stoneweave', 'fragment_request')) {
                missingElements.npcs.push('Vrenna Stoneweave POI with "fragment_request" dialogue is missing');
            }

            // Check Sewer Contact
            if (!findPOIByNpcAndDialogue('sewer_contact', 'reveal_location')) {
                missingElements.npcs.push('Sewer Contact POI with "reveal_location" dialogue is missing');
            }
        });
    });

    describe('Items', () => {
        it('should have required items', () => {
            if (!mockProofForTheWeave.rewards?.items?.includes('loomkeeperPortalMap')) {
                missingElements.items.push('"loomkeeperPortalMap" is missing from quest rewards');
            }
            if (!mockProofForTheWeave.requirements?.items?.includes('mistwalkerAmulet')) {
                missingElements.items.push('"mistwalkerAmulet" is missing from quest requirements');
            }
        });
    });

    describe('Quest Flow', () => {
        it('should have correct quest metadata', () => {
            if (mockProofForTheWeave.id !== 'proofForTheWeave') {
                missingElements.questFlow.push('Quest ID does not match expected value "proofForTheWeave"');
            }
            if (mockProofForTheWeave.name !== 'Proof for the Weave') {
                missingElements.questFlow.push('Quest Name does not match expected value "Proof for the Weave"');
            }
            if (mockProofForTheWeave.giver !== 'Vrenna Stoneweave') {
                missingElements.questFlow.push('Quest Giver does not match expected value "Vrenna Stoneweave"');
            }
            if (mockProofForTheWeave.steps.length !== 6) {
                missingElements.questFlow.push(`Quest Steps length is ${mockProofForTheWeave.steps.length}, expected 6`);
            }
        });

        it('should have correct requirements', () => {
            if (!mockProofForTheWeave.requirements?.quests?.includes('fogscarHeist')) {
                missingElements.questFlow.push('Required quest "fogscarHeist" is missing');
            }
            if (!mockProofForTheWeave.requirements?.items?.includes('mistwalkerAmulet')) {
                missingElements.questFlow.push('Required item "mistwalkerAmulet" is missing');
            }
        });
    });

    describe('Dialogue Flow', () => {
        it('should start quest when accepting from Vrenna', () => {
            const startNode = mockVrennaBase.nodes.find(node => node.id === 'start');
            if (!startNode) {
                missingElements.dialogues.push('Vrenna start dialogue node is missing');
                return;
            }
            const acceptOption = startNode.options.find(opt => 
                opt.text.includes("About the tapestry fragment")
            );
            if (!acceptOption) {
                missingElements.dialogues.push('Vrenna fragment request dialogue option is missing');
            } else if (acceptOption.nextId !== 'fragment_request') {
                missingElements.dialogues.push('Vrenna fragment request dialogue nextId is incorrect');
            }
        });

        it('should add quest and unlock sewers when accepting', () => {
            const questAcceptedNode = mockVrennaBase.nodes.find(node => node.id === 'fragment_request');
            if (!questAcceptedNode) {
                missingElements.dialogues.push('Vrenna fragment request node is missing');
                return;
            }
            const acceptOption = questAcceptedNode.options[0];
            if (!acceptOption?.action) {
                missingElements.dialogues.push('Vrenna fragment request action is missing');
            } else {
                if (!acceptOption.action.some(a => a.type === 'startQuest' && a.questId === 'proofForTheWeave')) {
                    missingElements.dialogues.push('Quest start action is missing or incorrect');
                }
                if (!acceptOption.action.some(a => a.type === 'unlockPOI' && a.mapId === 'hollowreach' && a.poiId === 'rustmarketSewers')) {
                    missingElements.dialogues.push('Sewers unlock action is missing or incorrect');
                }
            }
        });
    });

    describe('Quest Progression', () => {
        it('should handle sewer contact dialogue', () => {
            if (!mockSewerContact?.nodes) {
                missingElements.dialogues.push('Sewer contact dialogue nodes are missing');
                return;
            }
            const startNode = mockSewerContact.nodes.find(node => node.id === 'start');
            if (!startNode) {
                missingElements.dialogues.push('Sewer contact start node is missing');
            } else if (!startNode.options?.[0]?.action) {
                missingElements.dialogues.push('Sewer contact start node action is missing');
            } else if (!startNode.options[0].action.some(a => 
                a.type === 'unlockPOI' && 
                a.mapId === 'rustmarketSewers' && 
                a.poiId === 'scavenger_redoubt'
            )) {
                missingElements.dialogues.push('Scavenger redoubt unlock action is missing or incorrect');
            }
        });

        it('should handle scavenger combat', () => {
            const combatStep = mockProofForTheWeave.steps.find(step => 
                step.description.includes('Deal with the fog-touched scavengers')
            );
            if (!combatStep) {
                missingElements.questFlow.push('Scavenger combat step is missing');
            } else if (typeof combatStep.condition !== 'function') {
                missingElements.questFlow.push('Scavenger combat step condition is not a function');
            }
        });

        it('should handle fragment retrieval', () => {
            const fragmentStep = mockProofForTheWeave.steps.find(step => 
                step.description.includes('Retrieve the tapestry fragment')
            );
            if (!fragmentStep) {
                missingElements.questFlow.push('Fragment retrieval step is missing');
            } else if (typeof fragmentStep.condition !== 'function') {
                missingElements.questFlow.push('Fragment retrieval step condition is not a function');
            }
        });

        it('should handle fragment decision', () => {
            if (!mockVrennaFragmentReturn?.nodes) {
                missingElements.dialogues.push('Vrenna fragment return dialogue nodes are missing');
                return;
            }
            const decisionNode = mockVrennaFragmentReturn.nodes.find(node => node.id === 'fragment_decision');
            if (!decisionNode) {
                missingElements.dialogues.push('Fragment decision node is missing');
            } else if (!decisionNode.options?.[0]?.action) {
                missingElements.dialogues.push('Fragment decision action is missing');
            } else if (!decisionNode.options[0].action.some(a => 
                a.type === 'completeQuest' && 
                a.questId === 'proofForTheWeave'
            )) {
                missingElements.dialogues.push('Quest completion action is missing or incorrect');
            }
        });
    });

    describe('Quest Completion', () => {
        it('should grant correct rewards', () => {
            expect(mockProofForTheWeave.rewards.items).to.include('loomkeeperPortalMap');
            expect(mockProofForTheWeave.rewards.experience).to.equal(50);
            expect(mockProofForTheWeave.rewards.reputation).to.deep.include({
                Loomkeepers: 10,
                Driftkin: -5
            });
        });

        it('should unlock mistwalkerSecret quest', () => {
            expect(mockProofForTheWeave.rewards.unlock).to.equal('mistwalkerSecret');
        });
    });
}); 