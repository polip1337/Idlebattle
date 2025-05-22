import { expect } from 'chai';
import embercladsTrial from '../../Data/quests/hollowreach/stage1/embercladsTrial.js';
import lyraBase from '../../Data/NPCs/talia_emberhearth/base.js';
import lyraRitualComplete from '../../Data/NPCs/lyra_emberkin/lyra_ritual_complete.js';
import drenvarRitual from '../../Data/NPCs/lyra_emberkin/drenvar_ritual.js';
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

describe('Emberclad\'s Trial Quest', () => {
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
        console.log('\n=== Missing Implementation Elements for Emberclad\'s Trial ===');
        Object.entries(missingElements).forEach(([category, elements]) => {
            if (elements.length > 0) {
                console.log(`\n${category.toUpperCase()}:`);
                elements.forEach(element => console.log(`  - ${element}`));
            }
        });
    });

    describe('Quest Structure', () => {
        it('should have valid quest metadata', () => {
            if (!embercladsTrial.id) missingElements.questStructure.push('Quest ID is missing');
            if (!embercladsTrial.name) missingElements.questStructure.push('Quest Name is missing');
            if (!embercladsTrial.giver) missingElements.questStructure.push('Quest Giver is missing');
            if (!embercladsTrial.description) missingElements.questStructure.push('Quest Description is missing');
            if (!embercladsTrial.steps || embercladsTrial.steps.length === 0) {
                missingElements.questStructure.push('Quest Steps array is empty or missing');
            }
        });

        it('should have valid requirements', () => {
            if (!embercladsTrial.requirements) {
                missingElements.questStructure.push('Quest Requirements object is missing');
            } else {
                if (!embercladsTrial.requirements.quests) {
                    missingElements.questStructure.push('Required Quests array is missing');
                }
                if (!embercladsTrial.requirements.items) {
                    missingElements.questStructure.push('Required Items array is missing');
                }
            }
        });

        it('should have valid rewards', () => {
            if (!embercladsTrial.rewards) {
                missingElements.rewards.push('Quest Rewards object is missing');
            } else {
                if (!Array.isArray(embercladsTrial.rewards.items)) {
                    missingElements.rewards.push('Item Rewards array is missing or invalid');
                }
                if (typeof embercladsTrial.rewards.experience !== 'number') {
                    missingElements.rewards.push('Experience Reward is missing or invalid');
                }
                if (!embercladsTrial.rewards.reputation) {
                    missingElements.rewards.push('Reputation Rewards object is missing');
                }
            }
        });
    });

    describe('Areas and Travel', () => {
        it('should have all required areas', () => {
            const requiredAreas = ['cinderhold', 'ritual_site', 'scorchveil_pit'];
            requiredAreas.forEach(area => {
                if (!findAreaById(area)) {
                    missingElements.areas.push(`Area "${area}" is not found in maps.json`);
                }
            });
        });

        it('should have required combat encounters', () => {
            if (!findCombatNodesInArea('ritual_site')) {
                missingElements.combat.push('Combat nodes in "ritual_site" area are missing');
            }
        });
    });

    describe('NPCs and Dialogues', () => {
        it('should have all required NPCs and dialogues', () => {
            // Check Lyra's dialogue
            if (!findPOIByNpcAndDialogue('lyra_emberkin', 'questAccepted_emberclad')) {
                missingElements.npcs.push('Lyra Emberkin POI with "questAccepted_emberclad" dialogue is missing');
            }

            // Check Drenvar's dialogue
            if (!findPOIByNpcAndDialogue('drenvar_ironflame', 'ritual_outcome')) {
                missingElements.npcs.push('Drenvar Ironflame POI with "ritual_outcome" dialogue is missing');
            }
        });
    });

    describe('Items', () => {
        it('should have required items', () => {
            if (!embercladsTrial.rewards?.items?.includes('pyromanticRune')) {
                missingElements.items.push('"pyromanticRune" is missing from quest rewards');
            }
        });
    });

    describe('Quest Flow', () => {
        it('should have correct quest metadata', () => {
            if (embercladsTrial.id !== 'embercladsTrial') {
                missingElements.questFlow.push('Quest ID does not match expected value "embercladsTrial"');
            }
            if (embercladsTrial.name !== 'Emberclad\'s Trial') {
                missingElements.questFlow.push('Quest Name does not match expected value "Emberclad\'s Trial"');
            }
            if (embercladsTrial.giver !== 'Lyra Emberkin') {
                missingElements.questFlow.push('Quest Giver does not match expected value "Lyra Emberkin"');
            }
            if (embercladsTrial.steps.length !== 3) {
                missingElements.questFlow.push(`Quest Steps length is ${embercladsTrial.steps.length}, expected 3`);
            }
        });
    });

    describe('Dialogue Flow', () => {
        it('should start quest when accepting from Lyra', () => {
            const startNode = lyraBase.nodes.find(node => node.id === 'start');
            if (!startNode) {
                missingElements.dialogues.push('Lyra start dialogue node is missing');
                return;
            }
            const acceptOption = startNode.options.find(opt => 
                opt.text.includes("About the fog-burning ritual")
            );
            if (!acceptOption) {
                missingElements.dialogues.push('Lyra ritual dialogue option is missing');
            } else if (acceptOption.nextId !== 'questAccepted_emberclad') {
                missingElements.dialogues.push('Lyra ritual dialogue nextId is incorrect');
            }
        });

        it('should add quest and unlock ritual site when accepting', () => {
            const questAcceptedNode = lyraBase.nodes.find(node => node.id === 'questAccepted_emberclad');
            if (!questAcceptedNode) {
                missingElements.dialogues.push('Lyra quest accepted node is missing');
                return;
            }
            const acceptOption = questAcceptedNode.options[0];
            if (!acceptOption?.action) {
                missingElements.dialogues.push('Lyra quest accepted action is missing');
            } else {
                if (!acceptOption.action.some(a => a.type === 'startQuest' && a.questId === 'embercladsTrial')) {
                    missingElements.dialogues.push('Quest start action is missing or incorrect');
                }
                if (!acceptOption.action.some(a => a.type === 'unlockPOI' && a.mapId === 'cinderhold' && a.poiId === 'ritual_site')) {
                    missingElements.dialogues.push('Ritual site unlock action is missing or incorrect');
                }
            }
        });
    });

    describe('Quest Progression', () => {
        it('should handle ritual site combat', () => {
            const combatStep = embercladsTrial.steps.find(step => 
                step.description.includes('Protect the ritual site')
            );
            if (!combatStep) {
                missingElements.questFlow.push('Ritual site combat step is missing');
            } else if (typeof combatStep.condition !== 'function') {
                missingElements.questFlow.push('Ritual site combat step condition is not a function');
            }
        });

        it('should handle ritual outcome with Lyra', () => {
            if (!lyraRitualComplete?.nodes) {
                missingElements.dialogues.push('Lyra ritual complete dialogue nodes are missing');
                return;
            }
            const outcomeNode = lyraRitualComplete.nodes.find(node => node.id === 'ritual_outcome');
            if (!outcomeNode) {
                missingElements.dialogues.push('Lyra ritual outcome node is missing');
            } else if (!outcomeNode.options?.[0]?.action) {
                missingElements.dialogues.push('Lyra ritual outcome action is missing');
            } else if (!outcomeNode.options[0].action.some(a => 
                a.type === 'completeQuest' && 
                a.questId === 'embercladsTrial'
            )) {
                missingElements.dialogues.push('Quest completion action is missing or incorrect');
            }
        });

        it('should handle ritual outcome with Drenvar', () => {
            if (!drenvarRitual?.nodes) {
                missingElements.dialogues.push('Drenvar ritual dialogue nodes are missing');
                return;
            }
            const outcomeNode = drenvarRitual.nodes.find(node => node.id === 'ritual_outcome');
            if (!outcomeNode) {
                missingElements.dialogues.push('Drenvar ritual outcome node is missing');
            } else if (!outcomeNode.options?.[0]?.action) {
                missingElements.dialogues.push('Drenvar ritual outcome action is missing');
            } else if (!outcomeNode.options[0].action.some(a => 
                a.type === 'completeQuest' && 
                a.questId === 'embercladsTrial'
            )) {
                missingElements.dialogues.push('Quest completion action is missing or incorrect');
            }
        });
    });

    describe('Quest Completion', () => {
        it('should grant correct rewards', () => {
            if (!embercladsTrial.rewards?.items?.includes('pyromanticRune')) {
                missingElements.rewards.push('"pyromanticRune" is missing from quest rewards');
            }
            if (embercladsTrial.rewards?.experience !== 75) {
                missingElements.rewards.push(`Experience reward is ${embercladsTrial.rewards?.experience}, expected 75`);
            }
            if (!embercladsTrial.rewards?.reputation?.Emberclad || embercladsTrial.rewards.reputation.Emberclad !== 10) {
                missingElements.rewards.push('Emberclad reputation reward is missing or incorrect');
            }
        });
    });
}); 