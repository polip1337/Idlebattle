import { expect } from 'chai';
import proofForTheWeave from '../../Data/quests/hollowreach/stage1/proofForTheWeave.js';
import vrennaBase from '../../Data/NPCs/vrenna_stoneweave/vrenna_base.js';
import sewerContact from '../../Data/NPCs/sewer_contact/sewer_contact_base.js';
import vrennaFragmentReturn from '../../Data/NPCs/vrenna_stoneweave/vrenna_fragment_return.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Read maps.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const maps = JSON.parse(readFileSync(join(__dirname, '../../Data/maps.json'), 'utf8'));

// Helper to find a POI by npcId and dialogueId
function findPOIByNpcAndDialogue(npcId, dialogueId) {
  for (const map of Object.values(maps)) {
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

// Helper to find an area by areaId
function findAreaById(areaId) {
  for (const map of Object.values(maps)) {
    if (!map.pois) continue;
    for (const poi of map.pois) {
      if (poi.areaId === areaId) {
        return true;
      }
    }
  }
  return false;
}

// Helper to find combat nodes in an area
function findCombatNodesInArea(areaId) {
  for (const map of Object.values(maps)) {
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
            if (!proofForTheWeave.id) missingElements.questStructure.push('Quest ID is missing');
            if (!proofForTheWeave.name) missingElements.questStructure.push('Quest Name is missing');
            if (!proofForTheWeave.giver) missingElements.questStructure.push('Quest Giver is missing');
            if (!proofForTheWeave.description) missingElements.questStructure.push('Quest Description is missing');
            if (!proofForTheWeave.steps || proofForTheWeave.steps.length === 0) {
                missingElements.questStructure.push('Quest Steps array is empty or missing');
            }
        });

        it('should have valid requirements', () => {
            if (!proofForTheWeave.requirements) {
                missingElements.questStructure.push('Quest Requirements object is missing');
            } else {
                if (!proofForTheWeave.requirements.quests) {
                    missingElements.questStructure.push('Required Quests array is missing');
                }
                if (!proofForTheWeave.requirements.items) {
                    missingElements.questStructure.push('Required Items array is missing');
                }
            }
        });

        it('should have valid rewards', () => {
            if (!proofForTheWeave.rewards) {
                missingElements.rewards.push('Quest Rewards object is missing');
            } else {
                if (!Array.isArray(proofForTheWeave.rewards.items)) {
                    missingElements.rewards.push('Item Rewards array is missing or invalid');
                }
                if (typeof proofForTheWeave.rewards.experience !== 'number') {
                    missingElements.rewards.push('Experience Reward is missing or invalid');
                }
                if (!proofForTheWeave.rewards.reputation) {
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
            if (!proofForTheWeave.rewards?.items?.includes('loomkeeperPortalMap')) {
                missingElements.items.push('"loomkeeperPortalMap" is missing from quest rewards');
            }
            if (!proofForTheWeave.requirements?.items?.includes('mistwalkerAmulet')) {
                missingElements.items.push('"mistwalkerAmulet" is missing from quest requirements');
            }
        });
    });

    describe('Quest Flow', () => {
        it('should have correct quest metadata', () => {
            if (proofForTheWeave.id !== 'proofForTheWeave') {
                missingElements.questFlow.push('Quest ID does not match expected value "proofForTheWeave"');
            }
            if (proofForTheWeave.name !== 'Proof for the Weave') {
                missingElements.questFlow.push('Quest Name does not match expected value "Proof for the Weave"');
            }
            if (proofForTheWeave.giver !== 'Vrenna Stoneweave') {
                missingElements.questFlow.push('Quest Giver does not match expected value "Vrenna Stoneweave"');
            }
            if (proofForTheWeave.steps.length !== 6) {
                missingElements.questFlow.push(`Quest Steps length is ${proofForTheWeave.steps.length}, expected 6`);
            }
        });

        it('should have correct requirements', () => {
            if (!proofForTheWeave.requirements?.quests?.includes('fogscarHeist')) {
                missingElements.questFlow.push('Required quest "fogscarHeist" is missing');
            }
            if (!proofForTheWeave.requirements?.items?.includes('mistwalkerAmulet')) {
                missingElements.questFlow.push('Required item "mistwalkerAmulet" is missing');
            }
        });
    });

    describe('Dialogue Flow', () => {
        it('should start quest when accepting from Vrenna', () => {
            const startNode = vrennaBase.nodes.find(node => node.id === 'start');
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
            const questAcceptedNode = vrennaBase.nodes.find(node => node.id === 'fragment_request');
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
            if (!sewerContact?.nodes) {
                missingElements.dialogues.push('Sewer contact dialogue nodes are missing');
                return;
            }
            const startNode = sewerContact.nodes.find(node => node.id === 'start');
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
            const combatStep = proofForTheWeave.steps.find(step => 
                step.description.includes('Deal with the fog-touched scavengers')
            );
            if (!combatStep) {
                missingElements.questFlow.push('Scavenger combat step is missing');
            } else if (typeof combatStep.condition !== 'function') {
                missingElements.questFlow.push('Scavenger combat step condition is not a function');
            }
        });

        it('should handle fragment retrieval', () => {
            const fragmentStep = proofForTheWeave.steps.find(step => 
                step.description.includes('Retrieve the tapestry fragment')
            );
            if (!fragmentStep) {
                missingElements.questFlow.push('Fragment retrieval step is missing');
            } else if (typeof fragmentStep.condition !== 'function') {
                missingElements.questFlow.push('Fragment retrieval step condition is not a function');
            }
        });

        it('should handle fragment decision', () => {
            if (!vrennaFragmentReturn?.nodes) {
                missingElements.dialogues.push('Vrenna fragment return dialogue nodes are missing');
                return;
            }
            const decisionNode = vrennaFragmentReturn.nodes.find(node => node.id === 'fragment_decision');
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
            expect(proofForTheWeave.rewards.items).to.include('loomkeeperPortalMap');
            expect(proofForTheWeave.rewards.experience).to.equal(50);
            expect(proofForTheWeave.rewards.reputation).to.deep.include({
                Loomkeepers: 10,
                Driftkin: -5
            });
        });

        it('should unlock mistwalkerSecret quest', () => {
            expect(proofForTheWeave.rewards.unlock).to.equal('mistwalkerSecret');
        });
    });
}); 