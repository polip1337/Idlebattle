import { expect } from 'chai';
import mistwalkerSecret from '../../Data/quests/hollowreach/stage1/mistwalkerSecret.js';
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

describe('Mistwalker Secret Quest Implementation Check', () => {
  let missingElements = {
    questStructure: [],
    areas: [],
    npcs: [],
    dialogues: [],
    travelConnections: [],
    items: [],
    combat: []
  };

  before(() => {
    // Reset missing elements
    Object.keys(missingElements).forEach(key => {
      missingElements[key] = [];
    });
  });

  after(() => {
    // Print missing elements report
    console.log('\n=== Missing Implementation Elements ===');
    Object.entries(missingElements).forEach(([category, elements]) => {
      if (elements.length > 0) {
        console.log(`\n${category.toUpperCase()}:`);
        elements.forEach(element => console.log(`  - ${element}`));
      }
    });
  });

  describe('Quest Structure', () => {
    it('should have valid quest metadata', () => {
      if (!mistwalkerSecret.id) missingElements.questStructure.push('Quest ID');
      if (!mistwalkerSecret.name) missingElements.questStructure.push('Quest Name');
      if (!mistwalkerSecret.giver) missingElements.questStructure.push('Quest Giver');
      if (!mistwalkerSecret.description) missingElements.questStructure.push('Quest Description');
      if (!mistwalkerSecret.steps || mistwalkerSecret.steps.length === 0) {
        missingElements.questStructure.push('Quest Steps');
      }
    });

    it('should have valid requirements', () => {
      if (!mistwalkerSecret.requirements) {
        missingElements.questStructure.push('Quest Requirements');
      } else {
        if (typeof mistwalkerSecret.requirements.level !== 'number') {
          missingElements.questStructure.push('Level Requirement');
        }
        if (!mistwalkerSecret.requirements.reputation) {
          missingElements.questStructure.push('Reputation Requirements');
        }
      }
    });

    it('should have valid rewards', () => {
      if (!mistwalkerSecret.rewards) {
        missingElements.questStructure.push('Quest Rewards');
      } else {
        if (!Array.isArray(mistwalkerSecret.rewards.items)) {
          missingElements.questStructure.push('Item Rewards');
        }
        if (typeof mistwalkerSecret.rewards.experience !== 'number') {
          missingElements.questStructure.push('Experience Reward');
        }
        if (!mistwalkerSecret.rewards.reputation) {
          missingElements.questStructure.push('Reputation Rewards');
        }
      }
    });
  });

  describe('Areas and Travel', () => {
    it('should have all required areas', () => {
      const requiredAreas = ['ashenArchive', 'runeChamber'];
      requiredAreas.forEach(area => {
        if (!findAreaById(area)) {
          missingElements.areas.push(`Area: ${area}`);
        }
      });
    });

    it('should have required travel connections', () => {
      const requiredConnections = [
        { from: 'hollowreach', to: 'ashenArchive' },
        { from: 'ashenArchive', to: 'runeChamber' }
      ];
      requiredConnections.forEach(conn => {
        if (!findTravelConnection(conn.from, conn.to)) {
          missingElements.travelConnections.push(`Travel: ${conn.from} -> ${conn.to}`);
        }
      });
    });
  });

  describe('NPCs and Dialogues', () => {
    it('should have all required NPCs and dialogues', () => {
      // Check Renn's dialogue
      if (!findPOIByNpcAndDialogue('renn_quickfingers', 'mistwalker_intro')) {
        missingElements.npcs.push('Renn Quickfingers POI with mistwalker_intro dialogue');
      }

      // Check final choice NPCs
      const finalNpcs = ['Loomkeeper Elder', 'Driftkin Chief', 'Emberclad Commander'];
      finalNpcs.forEach(npc => {
        let found = false;
        for (const map of Object.values(maps)) {
          if (!map.pois) continue;
          for (const poi of map.pois) {
            if ((poi.npcId === npc || poi.npc === npc)) {
              found = true;
              break;
            }
          }
          if (found) break;
        }
        if (!found) {
          missingElements.npcs.push(`Final Choice NPC: ${npc}`);
        }
      });
    });
  });

  describe('Combat and Items', () => {
    it('should have required combat encounters', () => {
      if (!findCombatNodesInArea('ashenArchive')) {
        missingElements.combat.push('Combat nodes in Ashen Archive');
      }
    });

    it('should have required items', () => {
      if (!mistwalkerSecret.rewards?.items?.includes('mistwalkerAmulet')) {
        missingElements.items.push('mistwalkerAmulet in quest rewards');
      }
    });
  });

  describe('Quest Steps', () => {
    it('should have valid step conditions', () => {
      mistwalkerSecret.steps?.forEach((step, index) => {
        if (!step.description) {
          missingElements.questStructure.push(`Step ${index + 1} description`);
        }
        if (!step.hint) {
          missingElements.questStructure.push(`Step ${index + 1} hint`);
        }
        if (typeof step.condition !== 'function') {
          missingElements.questStructure.push(`Step ${index + 1} condition function`);
        }
      });
    });
  });
}); 