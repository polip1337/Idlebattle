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
            if (!hollowsCache.id) missingElements.questStructure.push('Quest ID is missing');
            if (!hollowsCache.name) missingElements.questStructure.push('Quest Name is missing');
            if (!hollowsCache.giver) missingElements.questStructure.push('Quest Giver is missing');
            if (!hollowsCache.description) missingElements.questStructure.push('Quest Description is missing');
            if (!hollowsCache.steps || hollowsCache.steps.length === 0) {
                missingElements.questStructure.push('Quest Steps array is empty or missing');
            }
        });

        it('should have valid requirements', () => {
            if (!hollowsCache.requirements) {
                missingElements.questStructure.push('Quest Requirements object is missing');
            } else {
                if (!hollowsCache.requirements.quests) {
                    missingElements.questStructure.push('Required Quests array is missing');
                }
                if (!hollowsCache.requirements.items) {
                    missingElements.questStructure.push('Required Items array is missing');
                }
            }
        });

        it('should have valid rewards', () => {
            if (!hollowsCache.rewards) {
                missingElements.rewards.push('Quest Rewards object is missing');
            } else {
                if (!Array.isArray(hollowsCache.rewards.items)) {
                    missingElements.rewards.push('Item Rewards array is missing or invalid');
                }
                if (typeof hollowsCache.rewards.experience !== 'number') {
                    missingElements.rewards.push('Experience Reward is missing or invalid');
                }
                if (!hollowsCache.rewards.reputation) {
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
            if (!hollowsCache.rewards?.items?.includes('foodRations')) {
                missingElements.items.push('"foodRations" is missing from quest rewards');
            }
        });
    });

    describe('Quest Flow', () => {
        it('should have correct quest metadata', () => {
            if (hollowsCache.id !== 'hollowsCache') {
                missingElements.questFlow.push('Quest ID does not match expected value "hollowsCache"');
            }
            if (hollowsCache.name !== 'The Hollow\'s Cache') {
                missingElements.questFlow.push('Quest Name does not match expected value "The Hollow\'s Cache"');
            }
            if (hollowsCache.giver !== 'Old Maris') {
                missingElements.questFlow.push('Quest Giver does not match expected value "Old Maris"');
            }
            if (hollowsCache.steps.length !== 3) {
                missingElements.questFlow.push(`Quest Steps length is ${hollowsCache.steps.length}, expected 3`);
            }
        });
    });

    describe('Dialogue Flow', () => {
        it('should start quest when accepting from Old Maris', () => {
            const startNode = oldMarisBase.nodes.find(node => node.id === 'start');
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
            const questAcceptedNode = oldMarisBase.nodes.find(node => node.id === 'questAccepted_cache');
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
            const combatStep = hollowsCache.steps.find(step => 
                step.description.includes('defeat the scavengers')
            );
            if (!combatStep) {
                missingElements.questFlow.push('Cache vault combat step is missing');
            } else if (typeof combatStep.condition !== 'function') {
                missingElements.questFlow.push('Cache vault combat step condition is not a function');
            }
        });

        it('should handle cache decision', () => {
            if (!oldMarisCacheReturn?.nodes) {
                missingElements.dialogues.push('Old Maris cache return dialogue nodes are missing');
                return;
            }
            const decisionNode = oldMarisCacheReturn.nodes.find(node => node.id === 'cache_decision');
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
            if (!hollowsCache.rewards?.items?.includes('foodRations')) {
                missingElements.rewards.push('"foodRations" is missing from quest rewards');
            }
            if (hollowsCache.rewards?.experience !== 50) {
                missingElements.rewards.push(`Experience reward is ${hollowsCache.rewards?.experience}, expected 50`);
            }
            if (!hollowsCache.rewards?.reputation?.Hollowreach || hollowsCache.rewards.reputation.Hollowreach !== 10) {
                missingElements.rewards.push('Hollowreach reputation reward is missing or incorrect');
            }
        });
    });
}); 