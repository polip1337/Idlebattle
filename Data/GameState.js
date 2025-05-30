export class GameState {
    constructor() {
        // NPC Knowledge tracking
        this.npcKnowledge = {
            vrenna_stoneweave: {
                knowsAboutAmulet: false,
                hasSeenAmulet: false,
                hasGivenDocksAccess: false,
                hasStartedLostPatternQuest: false,
                hasStartedExpeditionQuest: false
            }
            // Add other NPCs here as needed
        };

        // Quest states
        this.questStates = {
            docksAccess: false,
            lost_pattern: false,
            great_crossing: false,
            vrenna_expedition: false
        };

        // Location states
        this.locationStates = {
            foggedDocks: {
                isAccessible: false,
                isDiscovered: false
            }
        };
    }

    // Methods to update NPC knowledge
    setNPCKnowledge(npcId, knowledgeKey, value) {
        if (this.npcKnowledge[npcId]) {
            this.npcKnowledge[npcId][knowledgeKey] = value;
        }
    }

    getNPCKnowledge(npcId, knowledgeKey) {
        return this.npcKnowledge[npcId]?.[knowledgeKey] ?? false;
    }

    // Methods to update quest states
    setQuestState(questId, state) {
        this.questStates[questId] = state;
    }

    getQuestState(questId) {
        return this.questStates[questId] ?? false;
    }

    // Methods to update location states
    setLocationState(locationId, stateKey, value) {
        if (this.locationStates[locationId]) {
            this.locationStates[locationId][stateKey] = value;
        }
    }

    getLocationState(locationId, stateKey) {
        return this.locationStates[locationId]?.[stateKey] ?? false;
    }

    // Save game state
    save() {
        return {
            npcKnowledge: this.npcKnowledge,
            questStates: this.questStates,
            locationStates: this.locationStates
        };
    }

    // Load game state
    load(savedState) {
        if (savedState.npcKnowledge) this.npcKnowledge = savedState.npcKnowledge;
        if (savedState.questStates) this.questStates = savedState.questStates;
        if (savedState.locationStates) this.locationStates = savedState.locationStates;
    }
}

// Create a singleton instance
export const gameState = new GameState(); 