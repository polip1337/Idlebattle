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
            combat: []
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
            if (!proofForTheWeave.id) missingElements.questStructure.push('Quest ID');
            if (!proofForTheWeave.name) missingElements.questStructure.push('Quest Name');
            if (!proofForTheWeave.giver) missingElements.questStructure.push('Quest Giver');
            if (!proofForTheWeave.description) missingElements.questStructure.push('Quest Description');
            if (!proofForTheWeave.steps || proofForTheWeave.steps.length === 0) {
                missingElements.questStructure.push('Quest Steps');
            }
        });

        it('should have valid requirements', () => {
            if (!proofForTheWeave.requirements) {
                missingElements.questStructure.push('Quest Requirements');
            } else {
                if (!proofForTheWeave.requirements.quests) {
                    missingElements.questStructure.push('Required Quests');
                }
                if (!proofForTheWeave.requirements.items) {
                    missingElements.questStructure.push('Required Items');
                }
            }
        });

        it('should have valid rewards', () => {
            if (!proofForTheWeave.rewards) {
                missingElements.questStructure.push('Quest Rewards');
            } else {
                if (!Array.isArray(proofForTheWeave.rewards.items)) {
                    missingElements.questStructure.push('Item Rewards');
                }
                if (typeof proofForTheWeave.rewards.experience !== 'number') {
                    missingElements.questStructure.push('Experience Reward');
                }
                if (!proofForTheWeave.rewards.reputation) {
                    missingElements.questStructure.push('Reputation Rewards');
                }
            }
        });
    });

    describe('Areas and Travel', () => {
        it('should have all required areas', () => {
            const requiredAreas = ['rustmarketSewers', 'scavenger_redoubt'];
            requiredAreas.forEach(area => {
                if (!findAreaById(area)) {
                    missingElements.areas.push(`Area: ${area}`);
                }
            });
        });

        it('should have required combat encounters', () => {
            if (!findCombatNodesInArea('scavenger_redoubt')) {
                missingElements.combat.push('Combat nodes in Scavenger Redoubt');
            }
        });
    });

    describe('NPCs and Dialogues', () => {
        it('should have all required NPCs and dialogues', () => {
            // Check Vrenna's dialogue
            if (!findPOIByNpcAndDialogue('vrenna_stoneweave', 'fragment_request')) {
                missingElements.npcs.push('Vrenna Stoneweave POI with fragment_request dialogue');
            }

            // Check Sewer Contact
            if (!findPOIByNpcAndDialogue('sewer_contact', 'reveal_location')) {
                missingElements.npcs.push('Sewer Contact POI with reveal_location dialogue');
            }
        });
    });

    describe('Items', () => {
        it('should have required items', () => {
            if (!proofForTheWeave.rewards?.items?.includes('loomkeeperPortalMap')) {
                missingElements.items.push('loomkeeperPortalMap in quest rewards');
            }
            if (!proofForTheWeave.requirements?.items?.includes('mistwalkerAmulet')) {
                missingElements.items.push('mistwalkerAmulet in quest requirements');
            }
        });
    });

    describe('Quest Initialization', () => {
        it('should have correct quest metadata', () => {
            expect(proofForTheWeave.id).to.equal('proofForTheWeave');
            expect(proofForTheWeave.name).to.equal('Proof for the Weave');
            expect(proofForTheWeave.giver).to.equal('Vrenna Stoneweave');
            expect(proofForTheWeave.steps.length).to.equal(6);
        });

        it('should have correct requirements', () => {
            expect(proofForTheWeave.requirements.quests).to.include('fogscarHeist');
            expect(proofForTheWeave.requirements.items).to.include('mistwalkerAmulet');
        });
    });

    describe('Dialogue Flow', () => {
        it('should start quest when accepting from Vrenna', () => {
            const startNode = vrennaBase.nodes.find(node => node.id === 'start');
            const acceptOption = startNode.options.find(opt => 
                opt.text.includes("About the tapestry fragment")
            );
            
            expect(acceptOption).to.exist;
            expect(acceptOption.nextId).to.equal('fragment_request');
        });

        it('should add quest and unlock sewers when accepting', () => {
            const questAcceptedNode = vrennaBase.nodes.find(node => node.id === 'fragment_request');
            const acceptOption = questAcceptedNode.options[0];
            
            expect(acceptOption.action).to.deep.include({ type: 'startQuest', questId: 'proofForTheWeave' });
            expect(acceptOption.action).to.deep.include({ 
                type: 'unlockPOI',
                mapId: 'hollowreach',
                poiId: 'rustmarketSewers'
            });
        });
    });

    describe('Quest Progression', () => {
        it('should handle sewer contact dialogue', () => {
            expect(sewerContact).to.have.property('nodes');
            const startNode = sewerContact.nodes.find(node => node.id === 'start');
            expect(startNode).to.exist;
            expect(startNode.options[0].action).to.deep.include({
                type: 'unlockPOI',
                mapId: 'rustmarketSewers',
                poiId: 'scavenger_redoubt'
            });
        });

        it('should handle scavenger combat', () => {
            const combatStep = proofForTheWeave.steps.find(step => 
                step.description.includes('Deal with the fog-touched scavengers')
            );
            expect(combatStep).to.exist;
            expect(combatStep.condition).to.be.a('function');
        });

        it('should handle fragment retrieval', () => {
            const fragmentStep = proofForTheWeave.steps.find(step => 
                step.description.includes('Retrieve the tapestry fragment')
            );
            expect(fragmentStep).to.exist;
            expect(fragmentStep.condition).to.be.a('function');
        });

        it('should handle fragment decision', () => {
            expect(vrennaFragmentReturn).to.have.property('nodes');
            const decisionNode = vrennaFragmentReturn.nodes.find(node => node.id === 'fragment_decision');
            expect(decisionNode).to.exist;
            expect(decisionNode.options[0].action).to.deep.include({
                type: 'completeQuest',
                questId: 'proofForTheWeave'
            });
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