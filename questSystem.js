export class QuestSystem {
    constructor() {
        this.quests = new Map(); // Map of quest ID to quest data
        this.activeQuests = new Set(); // Track active quest IDs
    }

    // Load all quest files from Quests/ folder
    async loadQuests() {
        try {
            // Assume a list of quest files is available (e.g., via a manifest or server endpoint)
            const questFiles = ['Quests/sampleQuest.js'];
            for (const file of questFiles) {
                const module = await import(`../${file}`);
                const quest = module.default;
                this.quests.set(quest.id, {
                    ...quest,
                    currentStep: 0,
                    completed: false
                });
            }
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
            // Integrate with game systems (e.g., inventory, hero stats)
        }
    }

    // Get quest data for rendering
    getQuestData() {
        const questData = [];
        this.activeQuests.forEach(questId => {
            const quest = this.quests.get(questId);
            questData.push({
                id: quest.id,
                name: quest.name,
                giver: quest.giver,
                description: quest.description,
                currentStep: quest.currentStep,
                totalSteps: quest.steps.length,
                nextHint: quest.completed ? '' : quest.steps[quest.currentStep]?.hint || 'Quest complete',
                completed: quest.completed
            });
        });
        return questData;
    }
}

// Singleton instance
export const questSystem = new QuestSystem();