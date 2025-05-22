import { expect } from 'chai';
import mistwalkerSecret from '../../Data/quests/hollowreach/stage1/mistwalkerSecret.js';
import vrennaBase from '../../Data/NPCs/vrenna_stoneweave/vrenna_base.js';
import rennMistwalkerIntro from '../../Data/NPCs/renn_quickfingers/mistwalker_intro.js';
import korzogArchive from '../../Data/NPCs/korzog/korzog_archive.js';
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

// Helper to find travel connections between maps
function findTravelConnection(fromMapId, toMapId) {
  for (const map of Object.values(maps)) {
    if (!map.pois) continue;
    for (const poi of map.pois) {
      if (poi.type === 'travel' && poi.mapId === toMapId) {
        return true;
      }
    }
  }
  return false;
}

describe('Mistwalker Secret Quest', () => {
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
        console.log('\n=== Missing Implementation Elements for Mistwalker Secret ===');
        Object.entries(missingElements).forEach(([category, elements]) => {
            if (elements.length > 0) {
                console.log(`\n${category.toUpperCase()}:`);
                elements.forEach(element => console.log(`  - ${element}`));
            }
        });
    });

    describe('Quest Structure', () => {
        it('should have valid quest metadata', () => {
            if (!mistwalkerSecret.id) missingElements.questStructure.push('Quest ID is missing');
            if (!mistwalkerSecret.name) missingElements.questStructure.push('Quest Name is missing');
            if (!mistwalkerSecret.giver) missingElements.questStructure.push('Quest Giver is missing');
            if (!mistwalkerSecret.description) missingElements.questStructure.push('Quest Description is missing');
            if (!mistwalkerSecret.steps || mistwalkerSecret.steps.length === 0) {
                missingElements.questStructure.push('Quest Steps array is empty or missing');
            }
        });

        it('should have valid requirements', () => {
            if (!mistwalkerSecret.requirements) {
                missingElements.questStructure.push('Quest Requirements object is missing');
            } else {
                if (!mistwalkerSecret.requirements.quests) {
                    missingElements.questStructure.push('Required Quests array is missing');
                }
                if (!mistwalkerSecret.requirements.items) {
                    missingElements.questStructure.push('Required Items array is missing');
                }
            }
        });

        it('should have valid rewards', () => {
            if (!mistwalkerSecret.rewards) {
                missingElements.rewards.push('Quest Rewards object is missing');
            } else {
                if (!Array.isArray(mistwalkerSecret.rewards.items)) {
                    missingElements.rewards.push('Item Rewards array is missing or invalid');
                }
                if (typeof mistwalkerSecret.rewards.experience !== 'number') {
                    missingElements.rewards.push('Experience Reward is missing or invalid');
                }
                if (!mistwalkerSecret.rewards.reputation) {
                    missingElements.rewards.push('Reputation Rewards object is missing');
                }
            }
        });
    });

    describe('Quest Flow', () => {
        it('should have correct quest metadata', () => {
            if (mistwalkerSecret.id !== 'mistwalkerSecret') {
                missingElements.questFlow.push('Quest ID does not match expected value "mistwalkerSecret"');
            }
            if (mistwalkerSecret.name !== 'Proof for the weave') {
                missingElements.questFlow.push('Quest Name does not match expected value "Proof for the weave"');
            }
            if (mistwalkerSecret.giver !== 'Vrenna Stoneweave') {
                missingElements.questFlow.push('Quest Giver does not match expected value "Vrenna Stoneweave"');
            }
            if (mistwalkerSecret.steps.length !== 5) {
                missingElements.questFlow.push(`Quest Steps length is ${mistwalkerSecret.steps.length}, expected 5`);
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
                opt.text.includes("About the Mistwalker Amulet")
            );
            if (!acceptOption) {
                missingElements.dialogues.push('Vrenna Mistwalker Amulet dialogue option is missing');
            } else if (acceptOption.nextId !== 'questAccepted_mistwalker') {
                missingElements.dialogues.push('Vrenna Mistwalker Amulet dialogue nextId is incorrect');
            }
        });

        it('should add quest and unlock Renn dialogue when accepting', () => {
            const questAcceptedNode = vrennaBase.nodes.find(node => node.id === 'questAccepted_mistwalker');
            if (!questAcceptedNode) {
                missingElements.dialogues.push('Vrenna quest accepted node is missing');
                return;
            }
            const acceptOption = questAcceptedNode.options[0];
            if (!acceptOption?.action) {
                missingElements.dialogues.push('Vrenna quest accepted action is missing');
            } else {
                if (!acceptOption.action.some(a => a.type === 'startQuest' && a.questId === 'mistwalkerSecret')) {
                    missingElements.dialogues.push('Quest start action is missing or incorrect');
                }
                if (!acceptOption.action.some(a => a.type === 'unlockPOI' && a.mapId === 'hollowreach' && a.poiId === 'renn_quickfingers_house')) {
                    missingElements.dialogues.push('Renn\'s house unlock action is missing or incorrect');
                }
            }
        });
    });

    describe('Quest Progression', () => {
        it('should handle Renn discussion about amulet', () => {
            if (!rennMistwalkerIntro?.nodes) {
                missingElements.dialogues.push('Renn Mistwalker intro dialogue nodes are missing');
                return;
            }
            const startNode = rennMistwalkerIntro.nodes.find(node => node.id === 'start');
            if (!startNode) {
                missingElements.dialogues.push('Renn start node is missing');
            } else if (!startNode.options?.[0]?.action) {
                missingElements.dialogues.push('Renn start node action is missing');
            } else if (!startNode.options[0].action.some(a => 
                a.type === 'unlockPOI' && 
                a.mapId === 'hollowreach' && 
                a.poiId === 'ashenArchive_entrance'
            )) {
                missingElements.dialogues.push('Ashen Archive entrance unlock action is missing or incorrect');
            }
        });

        it('should handle Ashen Archive entrance', () => {
            const archiveEntrance = mistwalkerSecret.steps.find(step => 
                step.description.includes('Enter the Ashen Archive')
            );
            if (!archiveEntrance) {
                missingElements.questFlow.push('Ashen Archive entrance step is missing');
            } else if (typeof archiveEntrance.condition !== 'function') {
                missingElements.questFlow.push('Ashen Archive entrance step condition is not a function');
            }
        });

        it('should handle rune-etched sentries', () => {
            const sentriesStep = mistwalkerSecret.steps.find(step => 
                step.description.includes('Deal with the rune-etched sentries')
            );
            if (!sentriesStep) {
                missingElements.questFlow.push('Rune-etched sentries step is missing');
            } else if (typeof sentriesStep.condition !== 'function') {
                missingElements.questFlow.push('Rune-etched sentries step condition is not a function');
            }
        });

        it('should handle rune puzzles', () => {
            const puzzleStep = mistwalkerSecret.steps.find(step => 
                step.description.includes('Solve the rune puzzles')
            );
            if (!puzzleStep) {
                missingElements.questFlow.push('Rune puzzles step is missing');
            } else if (typeof puzzleStep.condition !== 'function') {
                missingElements.questFlow.push('Rune puzzles step condition is not a function');
            }
        });

        it('should handle Korzog confrontation', () => {
            if (!korzogArchive?.nodes) {
                missingElements.dialogues.push('Korzog archive dialogue nodes are missing');
                return;
            }
            const confrontationNode = korzogArchive.nodes.find(node => node.id === 'confrontation');
            if (!confrontationNode) {
                missingElements.dialogues.push('Korzog confrontation node is missing');
            } else if (!confrontationNode.options?.[0]?.action) {
                missingElements.dialogues.push('Korzog confrontation action is missing');
            } else if (!confrontationNode.options[0].action.some(a => 
                a.type === 'completeQuest' && 
                a.questId === 'mistwalkerSecret'
            )) {
                missingElements.dialogues.push('Quest completion action is missing or incorrect');
            }
        });
    });

    describe('Quest Completion', () => {
        it('should grant correct rewards', () => {
            if (!mistwalkerSecret.rewards?.items?.includes('mistwalkerAmulet')) {
                missingElements.rewards.push('"mistwalkerAmulet" is missing from quest rewards');
            }
            if (mistwalkerSecret.rewards?.experience !== 100) {
                missingElements.rewards.push(`Experience reward is ${mistwalkerSecret.rewards?.experience}, expected 100`);
            }
            const expectedReputation = {
                Loomkeepers: 10,
                Driftkin: 10,
                Emberclad: 10
            };
            Object.entries(expectedReputation).forEach(([faction, value]) => {
                if (!mistwalkerSecret.rewards?.reputation?.[faction] || 
                    mistwalkerSecret.rewards.reputation[faction] !== value) {
                    missingElements.rewards.push(`${faction} reputation reward is missing or incorrect`);
                }
            });
        });
    });
}); 