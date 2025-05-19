import { hero } from './initialize.js';

class ReputationSystem {
    constructor() {
        this.factionReputations = {};
        this.characterReputations = {};
        this.reputationData = null;
        this.loadReputationData();
    }

    async loadReputationData() {
        try {
            const response = await fetch('Data/reputationData.json');
            this.reputationData = await response.json();
            this.initializeReputations();
        } catch (error) {
            console.error('Error loading reputation data:', error);
        }
    }

    initializeReputations() {
        // Initialize faction reputations
        for (const [factionId, factionData] of Object.entries(this.reputationData.factions)) {
            this.factionReputations[factionId] = {
                currentReputation: 0,
                ...factionData
            };
        }

        // Initialize character reputations
        for (const [characterId, characterData] of Object.entries(this.reputationData.characters)) {
            this.characterReputations[characterId] = {
                currentReputation: 0,
                ...characterData
            };
        }
    }

    getReputationLevel(reputationValue, levels) {
        if (reputationValue >= levels.exalted) return 'exalted';
        if (reputationValue >= levels.revered) return 'revered';
        if (reputationValue >= levels.honored) return 'honored';
        if (reputationValue >= levels.friendly) return 'friendly';
        if (reputationValue >= levels.neutral) return 'neutral';
        if (reputationValue >= levels.unfriendly) return 'unfriendly';
        return 'hostile';
    }

    getFactionReputation(factionId) {
        const faction = this.factionReputations[factionId];
        if (!faction) return null;

        const level = this.getReputationLevel(faction.currentReputation, faction.reputationLevels);
        return {
            ...faction,
            currentLevel: level
        };
    }

    getCharacterReputation(characterId) {
        const character = this.characterReputations[characterId];
        if (!character) return null;

        const level = this.getReputationLevel(character.currentReputation, character.reputationLevels);
        return {
            ...character,
            currentLevel: level
        };
    }

    modifyFactionReputation(factionId, amount) {
        const faction = this.factionReputations[factionId];
        if (!faction) return false;

        const oldLevel = this.getReputationLevel(faction.currentReputation, faction.reputationLevels);
        faction.currentReputation += amount;
        const newLevel = this.getReputationLevel(faction.currentReputation, faction.reputationLevels);

        if (oldLevel !== newLevel) {
            this.onReputationLevelChanged('faction', factionId, oldLevel, newLevel);
        }

        return true;
    }

    modifyCharacterReputation(characterId, amount) {
        const character = this.characterReputations[characterId];
        if (!character) return false;

        const oldLevel = this.getReputationLevel(character.currentReputation, character.reputationLevels);
        character.currentReputation += amount;
        const newLevel = this.getReputationLevel(character.currentReputation, character.reputationLevels);

        if (oldLevel !== newLevel) {
            this.onReputationLevelChanged('character', characterId, oldLevel, newLevel);
        }

        return true;
    }

    onReputationLevelChanged(type, id, oldLevel, newLevel) {
        // This can be used to trigger UI updates or game events when reputation changes
        console.log(`${type} ${id} reputation changed from ${oldLevel} to ${newLevel}`);
        // You can add event dispatching here if needed
    }

    getSerializableData() {
        return {
            factionReputations: Object.fromEntries(
                Object.entries(this.factionReputations).map(([id, data]) => [
                    id,
                    { currentReputation: data.currentReputation }
                ])
            ),
            characterReputations: Object.fromEntries(
                Object.entries(this.characterReputations).map(([id, data]) => [
                    id,
                    { currentReputation: data.currentReputation }
                ])
            )
        };
    }

    loadFromData(data) {
        if (data.factionReputations) {
            for (const [id, repData] of Object.entries(data.factionReputations)) {
                if (this.factionReputations[id]) {
                    this.factionReputations[id].currentReputation = repData.currentReputation;
                }
            }
        }

        if (data.characterReputations) {
            for (const [id, repData] of Object.entries(data.characterReputations)) {
                if (this.characterReputations[id]) {
                    this.characterReputations[id].currentReputation = repData.currentReputation;
                }
            }
        }
    }
}

export const reputationSystem = new ReputationSystem(); 