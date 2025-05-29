/**
 * Modified questSystem.js to hide quests that are not started yet.
 * Updated getQuestData to only include quests that are active or completed.
 */
export class QuestSystem {
    constructor() {
        this.QUEST_PATH ="Data/quests";
        this.quests = new Map(); // Map of quest ID to quest data
        this.activeQuests = new Set(); // Track active quest IDs
        this.maps = null; // Store maps.json data
        this.questFiles = [
            'Idlebattle/Data/quests/hollowreach/stage1/fogscarHeist.js',
            'Idlebattle/Data/quests/hollowreach/stage1/mistwalkerSecret.js',
            'Idlebattle/Data/quests/hollowreach/stage1/proofForTheWeave.js',
            'Idlebattle/Data/quests/hollowreach/stage1/driftkinsTest.js',
            'Idlebattle/Data/quests/hollowreach/stage1/embercladsTrial.js',
            'Idlebattle/Data/quests/hollowreach/stage1/hollowsCache.js',
            'Idlebattle/Data/quests/hollowreach/stage1/ossuaryRelic.js'
        ];
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

            for (const file of this.questFiles) {
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
   async startQuest(questId) {
        if (!this.quests.has(questId)) {
            console.warn(`Quest ${questId} not found, attempting to reload quests...`);
            await this.loadQuests();

            if (!this.quests.has(questId)) {
                console.error(`Attempted to start non-existent quest: ${questId}`);
                return false;
            }
        }
        
        if (this.activeQuests.has(questId)) {
            console.warn(`Attempted to start already active quest: ${questId}`);
            return false;
        }

        const quest = this.quests.get(questId);
        this.activeQuests.add(questId);
        console.log(`Started quest: ${questId}`, {
            name: quest.name,
            giver: quest.giver,
            description: quest.description,
            steps: quest.steps.length
        });
        
        return true;
    }

    // Complete a quest
    completeQuest(questId) {
        if (!this.quests.has(questId)) {
            console.error(`Attempted to complete non-existent quest: ${questId}`);
            return false;
        }

        const quest = this.quests.get(questId);
        quest.completed = true;
        this.activeQuests.delete(questId);
        this.applyRewards(quest);
        console.log(`Completed quest: ${questId}`);
        
        // Notify quest log to update UI
        if (window.updateQuestLog) {
            window.updateQuestLog();
        }
        
        return true;
    }

    // Check and update quest progress
    updateQuestProgress(event, data) {
        this.activeQuests.forEach(questId => {
            const quest = this.quests.get(questId);
            if (quest.completed || quest.currentStep >= quest.steps.length) return;

            const currentStep = quest.steps[quest.currentStep];
            
            // Handle branching steps
            if (currentStep.branches) {
                // Check if we've chosen a branch
                if (currentStep.condition && currentStep.condition(event, data)) {
                    // Determine which branch was chosen based on the dialogueId
                    const chosenBranch = data.dialogueId;
                    if (currentStep.branches[chosenBranch]) {
                        // Replace the remaining steps with the chosen branch's steps
                        quest.steps = [
                            ...quest.steps.slice(0, quest.currentStep + 1),
                            ...currentStep.branches[chosenBranch]
                        ];
                        quest.currentBranch = chosenBranch; // Track which branch was chosen
                        quest.currentStep++;
                    }
                }
            } else if (currentStep.condition && currentStep.condition(event, data)) {
                quest.currentStep++;
                if (quest.currentStep >= quest.steps.length) {
                    quest.completed = true;
                    this.activeQuests.delete(questId);
                    this.applyRewards(quest);
                    console.log(`Completed quest: ${questId}`);
                }
            }
            
            // Notify quest log to update UI
            if (window.updateQuestLog) {
                window.updateQuestLog();
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
            if (this.activeQuests.has(quest.id) || quest.completed) {
                const nextStep = (quest.completed || quest.currentStep >= quest.steps.length) ? null : quest.steps[quest.currentStep];
                let nextPOI = null;
                
                // Safely handle condition function
                if (nextStep?.condition && typeof nextStep.condition === 'function') {
                    const conditionStr = nextStep.condition.toString();
                    nextPOI = conditionStr.match(/data\.poiName\s*===\s*'([^']+)'/)?.[1] ||
                             conditionStr.match(/data\.npcId\s*===\s*'([^']+)'/)?.[1];
                }
                
                const mapId = quest.completed ? 'Completed' : (nextPOI ? this.getMapForPOI(nextPOI) : 'Unknown');

                // Calculate total steps including any potential branches
                let totalSteps = quest.steps.length;
                if (nextStep?.branches) {
                    // Add the maximum number of steps from any branch
                    totalSteps += Math.max(...Object.values(nextStep.branches).map(branch => branch.length));
                }

                questData.push({
                    id: quest.id,
                    name: quest.name,
                    giver: quest.giver,
                    description: quest.description,
                    currentStep: quest.currentStep,
                    totalSteps: totalSteps,
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
            serializableQuestsState[questId] = {
                currentStep: questData.currentStep,
                completed: questData.completed,
                currentBranch: questData.currentBranch, // Save the current branch
                steps: questData.steps // Save the current state of steps including any branch changes
            };
        });
        return {
            activeQuests: Array.from(this.activeQuests),
            questsState: serializableQuestsState,
        };
    }

    async restoreFromData(data) {
        if (!data) return;

        if (this.quests.size === 0) {
            await this.loadQuests();
        }

        this.activeQuests = new Set(data.activeQuests || []);

        if (data.questsState) {
            Object.entries(data.questsState).forEach(([questId, savedState]) => {
                if (this.quests.has(questId)) {
                    const quest = this.quests.get(questId);
                    quest.currentStep = savedState.currentStep;
                    quest.completed = savedState.completed;
                    quest.currentBranch = savedState.currentBranch; // Restore the current branch
                    
                    // Restore steps while preserving original condition functions
                    if (savedState.steps) {
                        const originalQuest = this.quests.get(questId);
                        quest.steps = savedState.steps.map((savedStep, index) => {
                            // If we have the original quest and step, use its condition function
                            if (originalQuest && originalQuest.steps[index]) {
                                return {
                                    ...savedStep,
                                    condition: originalQuest.steps[index].condition
                                };
                            }
                            return savedStep;
                        });
                    }
                } else {
                    console.warn(`Quest ${questId} found in save data but not in definitions.`);
                }
            });
        }
        if (window.updateQuestLog) window.updateQuestLog();
    }
}

// Singleton instance
export const questSystem = new QuestSystem();