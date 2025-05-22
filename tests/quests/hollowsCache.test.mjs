import { expect } from 'chai';
import hollowsCache from '../../Data/quests/hollowreach/stage1/hollowsCache.js';
import oldMarisBase from '../../Data/NPCs/old_maris/old_maris_base.js';
import oldMarisCacheReturn from '../../Data/NPCs/old_maris/old_maris_cache_return.js';
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
            combat: []
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
            if (!hollowsCache.id) missingElements.questStructure.push('Quest ID');
            if (!hollowsCache.name) missingElements.questStructure.push('Quest Name');
            if (!hollowsCache.giver) missingElements.questStructure.push('Quest Giver');
            if (!hollowsCache.description) missingElements.questStructure.push('Quest Description');
            if (!hollowsCache.steps || hollowsCache.steps.length === 0) {
                missingElements.questStructure.push('Quest Steps');
            }
        });

        it('should have valid rewards', () => {
            if (!hollowsCache.rewards) {
                missingElements.questStructure.push('Quest Rewards');
            } else {
                if (!Array.isArray(hollowsCache.rewards.items)) {
                    missingElements.questStructure.push('Item Rewards');
                }
                if (typeof hollowsCache.rewards.experience !== 'number') {
                    missingElements.questStructure.push('Experience Reward');
                }
                if (!hollowsCache.rewards.reputation) {
                    missingElements.questStructure.push('Reputation Rewards');
                }
            }
        });
    });

    describe('Areas and Travel', () => {
        it('should have all required areas', () => {
            const requiredAreas = ['orphans_hollow', 'ironspire_ruin', 'cache_vault'];
            requiredAreas.forEach(area => {
                if (!findAreaById(area)) {
                    missingElements.areas.push(`Area: ${area}`);
                }
            });
        });

        it('should have required combat encounters', () => {
            if (!findCombatNodesInArea('cache_vault')) {
                missingElements.combat.push('Combat nodes in Cache Vault');
            }
        });
    });

    describe('NPCs and Dialogues', () => {
        it('should have all required NPCs and dialogues', () => {
            // Check Old Maris's dialogue
            if (!findPOIByNpcAndDialogue('old_maris', 'questAccepted_cache')) {
                missingElements.npcs.push('Old Maris POI with questAccepted_cache dialogue');
            }

            // Check cache return dialogue
            if (!findPOIByNpcAndDialogue('old_maris', 'cache_decision')) {
                missingElements.npcs.push('Old Maris POI with cache_decision dialogue');
            }
        });
    });

    describe('Items', () => {
        it('should have required items', () => {
            if (!hollowsCache.rewards?.items?.includes('foodRations')) {
                missingElements.items.push('foodRations in quest rewards');
            }
        });
    });

    describe('Quest Initialization', () => {
        it('should have correct quest metadata', () => {
            expect(hollowsCache.id).to.equal('hollowsCache');
            expect(hollowsCache.name).to.equal('The Hollow\'s Cache');
            expect(hollowsCache.giver).to.equal('Old Maris');
            expect(hollowsCache.steps.length).to.equal(3);
        });
    });

    describe('Dialogue Flow', () => {
        it('should start quest when accepting from Old Maris', () => {
            const startNode = oldMarisBase.nodes.find(node => node.id === 'start');
            const acceptOption = startNode.options.find(opt => 
                opt.text.includes("About the food cache")
            );
            
            expect(acceptOption).to.exist;
            expect(acceptOption.nextId).to.equal('questAccepted_cache');
        });

        it('should add quest and unlock Ironspire Ruin when accepting', () => {
            const questAcceptedNode = oldMarisBase.nodes.find(node => node.id === 'questAccepted_cache');
            const acceptOption = questAcceptedNode.options[0];
            
            expect(acceptOption.action).to.deep.include({ type: 'startQuest', questId: 'hollowsCache' });
            expect(acceptOption.action).to.deep.include({ 
                type: 'unlockPOI',
                mapId: 'hollowreach',
                poiId: 'ironspire_ruin'
            });
        });
    });

    describe('Quest Progression', () => {
        it('should handle cache vault combat', () => {
            const combatStep = hollowsCache.steps.find(step => 
                step.description.includes('defeat the scavengers')
            );
            expect(combatStep).to.exist;
            expect(combatStep.condition).to.be.a('function');
        });

        it('should handle cache decision', () => {
            expect(oldMarisCacheReturn).to.have.property('nodes');
            const decisionNode = oldMarisCacheReturn.nodes.find(node => node.id === 'cache_decision');
            expect(decisionNode).to.exist;
            expect(decisionNode.options[0].action).to.deep.include({
                type: 'completeQuest',
                questId: 'hollowsCache'
            });
        });
    });

    describe('Quest Completion', () => {
        it('should grant correct rewards', () => {
            expect(hollowsCache.rewards.items).to.include('foodRations');
            expect(hollowsCache.rewards.experience).to.equal(50);
            expect(hollowsCache.rewards.reputation).to.deep.include({
                Hollowreach: 10
            });
        });
    });
}); 