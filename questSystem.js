/**
 * Modified questSystem.js to hide quests that are not started yet.
 * Updated getQuestData to only include quests that are active or completed.
 */
export class QuestSystem {
    constructor() {
        this.quests = new Map(); // Map of quest ID to quest data
        this.activeQuests = new Set(); // Track active quest IDs
        this.maps = null; // Store maps.json data
    }

    // Load maps.json for POI-to-map mapping
    async loadMaps() {
        try {
            const response = await fetch('../Data/maps.json');
            this.maps = await response.json();
        } catch (error) {
            console.error('Error loading maps:', error);
        }
    }

    // Load all quest files from Quests/ folder
    async loadQuests() {
        try {
            // Assume a list of quest files is available
            const questFiles = ['Data/quests/sampleQuest.js'];
            for (const file of questFiles) {
                const module = await import(`../${file}`);
                const quest = module.default;
                this.quests.set(quest.id, {
                    ...quest,
                    currentStep: 0,
                    completed: false
                });
            }
            // Load maps after quests
            await this.loadMaps();
        } catch (error) {
            console.error('Error loading quests:', error);
        }
    }

    // Start a quest
    startQuest(questId) {
        if (this.quests.has(questId) && !this.activeQuests.has(questId)) {
            this.activeQuests.add(questId);
            console.log(`Started quest: ${questId}`);
        }
    }

    // Check and update quest progress
    updateQuestProgress(event, data) {
        this.activeQuests.forEach(questId => {
            const quest = this.quests.get(questId);
            if (quest.completed || quest.currentStep >= quest.steps.length) return;

            const currentStep = quest.steps[quest.currentStep];
            if (currentStep.condition(event, data)) {
                quest.currentStep++;
                if (quest.currentStep >= quest.steps.length) {
                    quest.completed = true;
                    this.activeQuests.delete(questId);
                    this.applyRewards(quest);
                    console.log(`Completed quest: ${questId}`);
                }
                // Notify quest log to update UI
                if (window.updateQuestLog) {
                    window.updateQuestLog();
                }
            }
        });
    }

    // Apply quest rewards
    applyRewards(quest) {
        if (quest.rewards) {
            console.log(`Applying rewards for ${quest.name}:`, quest.rewards);
            // Example: Add items to inventory, increase stats, etc.
        }
    }

    // Find the map containing a POI
    getMapForPOI(poiName) {
        if (!this.maps) return 'Unknown';
        for (const [mapId, mapData] of Object.entries(this.maps)) {
            if (mapData.pois.some(poi => poi.name === poiName)) {
                return mapId;
            }
        }
        return 'Unknown';
    }

    // Get quest data for rendering, including only active or completed quests
    getQuestData() {
        const questData = [];
        this.quests.forEach(quest => {
            // Only include quests that are active or completed
            if (this.activeQuests.has(quest.id) || quest.completed) {
                const nextStep = quest.completed ? null : quest.steps[quest.currentStep];
                const nextPOI = nextStep?.condition.toString().match(/poiName\s*===\s*'([^']+)'/)?.[1];
                const mapId = quest.completed ? 'Completed' : (nextPOI ? this.getMapForPOI(nextPOI) : 'Unknown');
                questData.push({
                    id: quest.id,
                    name: quest.name,
                    giver: quest.giver,
                    description: quest.description,
                    currentStep: quest.currentStep,
                    totalSteps: quest.steps.length,
                    nextHint: quest.completed ? 'Quest complete' : nextStep?.hint || 'No hint available',
                    completed: quest.completed,
                    mapId: mapId
                });
            }
        });
        return questData;
    }
    getQuestData() {
            // ... (existing method)
            const questData = [];
            this.quests.forEach(quest => {
                if (this.activeQuests.has(quest.id) || quest.completed) {
                    const nextStep = (quest.completed || quest.currentStep >= quest.steps.length) ? null : quest.steps[quest.currentStep];
                    const nextPOI = nextStep?.condition.toString().match(/data\.poiName\s*===\s*'([^']+)'/)?.[1] ||
                                    nextStep?.condition.toString().match(/data\.npcId\s*===\s*'([^']+)'/)?.[1]; // Simplified POI/NPC extraction
                    const mapId = quest.completed ? 'Completed' : (nextPOI ? this.getMapForPOI(nextPOI) : 'Unknown');

                    questData.push({
                        id: quest.id,
                        name: quest.name,
                        giver: quest.giver,
                        description: quest.description,
                        currentStep: quest.currentStep,
                        totalSteps: quest.steps.length,
                        nextHint: quest.completed ? 'Quest complete' : (nextStep?.hint || 'No hint available'),
                        completed: quest.completed,
                        mapId: mapId
                    });
                }
            });
            return questData;
        }

        getSerializableData() {
            const serializableQuestsState = {};
            this.quests.forEach((questData, questId) => {
                // Save only the dynamic state, not the whole quest definition
                serializableQuestsState[questId] = {
                    currentStep: questData.currentStep,
                    completed: questData.completed,
                };
            });
            return {
                activeQuests: Array.from(this.activeQuests),
                questsState: serializableQuestsState,
            };
        }

        async restoreFromData(data) {
            if (!data) return;

            // Ensure base quest definitions are loaded first
            if (this.quests.size === 0) {
                await this.loadQuests(); // This also loads maps
            }

            this.activeQuests = new Set(data.activeQuests || []);

            if (data.questsState) {
                Object.entries(data.questsState).forEach(([questId, savedState]) => {
                    if (this.quests.has(questId)) {
                        const quest = this.quests.get(questId);
                        quest.currentStep = savedState.currentStep;
                        quest.completed = savedState.completed;
                    } else {
                        console.warn(`Quest ${questId} found in save data but not in definitions.`);
                    }
                });
            }
            if (window.updateQuestLog) window.updateQuestLog(); // Update UI
        }
}

// Singleton instance
export const questSystem = new QuestSystem();