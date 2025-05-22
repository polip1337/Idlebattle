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
            combat: []
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
            if (!embercladsTrial.id) missingElements.questStructure.push('Quest ID');
            if (!embercladsTrial.name) missingElements.questStructure.push('Quest Name');
            if (!embercladsTrial.giver) missingElements.questStructure.push('Quest Giver');
            if (!embercladsTrial.description) missingElements.questStructure.push('Quest Description');
            if (!embercladsTrial.steps || embercladsTrial.steps.length === 0) {
                missingElements.questStructure.push('Quest Steps');
            }
        });

        it('should have valid rewards', () => {
            if (!embercladsTrial.rewards) {
                missingElements.questStructure.push('Quest Rewards');
            } else {
                if (!Array.isArray(embercladsTrial.rewards.items)) {
                    missingElements.questStructure.push('Item Rewards');
                }
                if (typeof embercladsTrial.rewards.experience !== 'number') {
                    missingElements.questStructure.push('Experience Reward');
                }
                if (!embercladsTrial.rewards.reputation) {
                    missingElements.questStructure.push('Reputation Rewards');
                }
            }
        });
    });

    describe('Areas and Travel', () => {
        it('should have all required areas', () => {
            const requiredAreas = ['cinderhold', 'ritual_site', 'scorchveil_pit'];
            requiredAreas.forEach(area => {
                if (!findAreaById(area)) {
                    missingElements.areas.push(`Area: ${area}`);
                }
            });
        });

        it('should have required combat encounters', () => {
            if (!findCombatNodesInArea('ritual_site')) {
                missingElements.combat.push('Combat nodes in Ritual Site');
            }
        });
    });

    describe('NPCs and Dialogues', () => {
        it('should have all required NPCs and dialogues', () => {
            // Check Lyra's dialogue
            if (!findPOIByNpcAndDialogue('lyra_emberkin', 'questAccepted_emberclad')) {
                missingElements.npcs.push('Lyra Emberkin POI with questAccepted_emberclad dialogue');
            }

            // Check Drenvar's dialogue
            if (!findPOIByNpcAndDialogue('drenvar_ironflame', 'ritual_outcome')) {
                missingElements.npcs.push('Drenvar Ironflame POI with ritual_outcome dialogue');
            }
        });
    });

    describe('Items', () => {
        it('should have required items', () => {
            if (!embercladsTrial.rewards?.items?.includes('pyromanticRune')) {
                missingElements.items.push('pyromanticRune in quest rewards');
            }
        });
    });

    describe('Quest Initialization', () => {
        it('should have correct quest metadata', () => {
            expect(embercladsTrial.id).to.equal('embercladsTrial');
            expect(embercladsTrial.name).to.equal('Emberclad\'s Trial');
            expect(embercladsTrial.giver).to.equal('Lyra Emberkin');
            expect(embercladsTrial.steps.length).to.equal(3);
        });
    });

    describe('Dialogue Flow', () => {
        it('should start quest when accepting from Lyra', () => {
            const startNode = lyraBase.nodes.find(node => node.id === 'start');
            const acceptOption = startNode.options.find(opt => 
                opt.text.includes("About the fog-burning ritual")
            );
            
            expect(acceptOption).to.exist;
            expect(acceptOption.nextId).to.equal('questAccepted_emberclad');
        });

        it('should add quest and unlock ritual site when accepting', () => {
            const questAcceptedNode = lyraBase.nodes.find(node => node.id === 'questAccepted_emberclad');
            const acceptOption = questAcceptedNode.options[0];
            
            expect(acceptOption.action).to.deep.include({ type: 'startQuest', questId: 'embercladsTrial' });
            expect(acceptOption.action).to.deep.include({ 
                type: 'unlockPOI',
                mapId: 'cinderhold',
                poiId: 'ritual_site'
            });
        });
    });

    describe('Quest Progression', () => {
        it('should handle ritual site combat', () => {
            const combatStep = embercladsTrial.steps.find(step => 
                step.description.includes('Protect the ritual site')
            );
            expect(combatStep).to.exist;
            expect(combatStep.condition).to.be.a('function');
        });

        it('should handle ritual outcome with Lyra', () => {
            expect(lyraRitualComplete).to.have.property('nodes');
            const outcomeNode = lyraRitualComplete.nodes.find(node => node.id === 'ritual_outcome');
            expect(outcomeNode).to.exist;
            expect(outcomeNode.options[0].action).to.deep.include({
                type: 'completeQuest',
                questId: 'embercladsTrial'
            });
        });

        it('should handle ritual outcome with Drenvar', () => {
            expect(drenvarRitual).to.have.property('nodes');
            const outcomeNode = drenvarRitual.nodes.find(node => node.id === 'ritual_outcome');
            expect(outcomeNode).to.exist;
            expect(outcomeNode.options[0].action).to.deep.include({
                type: 'completeQuest',
                questId: 'embercladsTrial'
            });
        });
    });

    describe('Quest Completion', () => {
        it('should grant correct rewards', () => {
            expect(embercladsTrial.rewards.items).to.include('pyromanticRune');
            expect(embercladsTrial.rewards.experience).to.equal(75);
            expect(embercladsTrial.rewards.reputation).to.deep.include({
                Emberclad: 10
            });
        });
    });
}); 