import {
    // updateHealth, // Not used in this class directly
    // updateMana, // Not used in this class directly
    // updateStamina, // Not used in this class directly
    // updateExp, // Not used in this class directly
    // deepCopy, // Not used in this class directly
    updateExpBarText,
    expBarTextAddGlow,
    openEvolutionModal
} from './Render.js';
import {
    hero
    // classTiers and heroClasses from initialize.js are no longer the primary source
    // for evolution paths as evolutions.json will be used.
} from './initialize.js';

class EvolutionService {
    constructor() {
        this.evolutionData = null;
        this.isInitialized = false;
        this._evolutionModalHandler = null;
        this._debugMode = false;
        this._displayedClassesCount = 5;
        this._allAvailableClasses = [];
    }

    /**
     * Initializes the service by fetching and parsing evolution data from evolutions.json.
     * Must be called and awaited before using other methods.
     */
    async init() {
        if (this.isInitialized) {
            return;
        }
        try {
            const response = await fetch('./Data/evolutions.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} while fetching evolutions.json`);
            }
            this.evolutionData = await response.json();
            this.isInitialized = true;
            this._setupDebugHandlers();
            console.log("EvolutionService initialized with evolution data.");
        } catch (error) {
            console.error("Failed to initialize EvolutionService:", error);
            this.evolutionData = null;
            this.isInitialized = false;
        }
    }

    _setupDebugHandlers() {
        const showDebugInfoBtn = document.getElementById('show-debug-info');
        const showMoreClassesBtn = document.getElementById('show-more-classes');
        const closeModalBtn = document.getElementById('close-evolution-modal');

        if (showDebugInfoBtn) {
            showDebugInfoBtn.addEventListener('click', () => this._toggleDebugInfo());
        }
        if (showMoreClassesBtn) {
            showMoreClassesBtn.addEventListener('click', () => this._showMoreClasses());
        }
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => this._closeEvolutionModal());
        }
    }

    _toggleDebugInfo() {
        const debugInfo = document.getElementById('debug-info');
        if (!debugInfo) return;

        if (debugInfo.classList.contains('hidden')) {
            this._updateDebugInfo();
            debugInfo.classList.remove('hidden');
        } else {
            debugInfo.classList.add('hidden');
        }
    }

    _updateDebugInfo() {
        const debugInfo = document.getElementById('debug-info');
        if (!debugInfo) return;

        const currentHeroClass = hero.classType || "Novice";
        const heroRarity = hero.rarity || 'common';
        const statsSnapshot = this._getStatsSnapshot();

        let debugText = `Current Class: ${currentHeroClass}\n`;
        debugText += `Hero Rarity: ${heroRarity}\n\n`;
        debugText += `Available Classes: ${this._allAvailableClasses.length}\n`;
        debugText += `Displayed Classes: ${this._displayedClassesCount}\n\n`;
        debugText += `Current Stats:\n`;
        for (const [key, value] of Object.entries(statsSnapshot)) {
            debugText += `${key}: ${value}\n`;
        }

        debugInfo.textContent = debugText;
    }

    _showMoreClasses() {
        this._displayedClassesCount += 5;
        this._updateEvolutionModal();
    }

    _closeEvolutionModal() {
        const modal = document.getElementById('evolution-modal');
        if (modal) {
            modal.style.display = 'none';
            this._displayedClassesCount = 5; // Reset displayed classes count
        }
    }

    _getStatsSnapshot() {
        // Create a deep copy of hero stats
        const statsSnapshot = {
            ...hero,
            ...(hero.stats || {})
        };

        // Remove non-stat properties
        delete statsSnapshot.availableClasses;
        delete statsSnapshot.canEvolve;
        delete statsSnapshot.class1Evolve;

        // Get battle statistics from the global battleStatistics instance
        const battleStats = window.battleStatistics;
        if (battleStats) {
            // Add damage type stats
            statsSnapshot.meleeDamage = battleStats.meleeDamageDealt || 0;
            statsSnapshot.rangedDamage = battleStats.rangedDamageDealt || 0;
            statsSnapshot.fireDamage = battleStats.damageDealt['Fire'] || 0;
            statsSnapshot.iceDamage = battleStats.damageDealt['Ice'] || 0;
            statsSnapshot.lightningDamage = battleStats.damageDealt['Lightning'] || 0;
            statsSnapshot.earthDamage = battleStats.damageDealt['Earth'] || 0;
            statsSnapshot.physicalDamageTaken = battleStats.damageReceived['Physical'] || 0;

            // Add other relevant stats
            statsSnapshot.enemiesDefeated = Object.values(battleStats.enemiesDefeated || {}).reduce((a, b) => a + b, 0);
            statsSnapshot.criticalHits = battleStats.criticalHits || 0;
            statsSnapshot.spellsCast = Object.values(battleStats.skillUsage || {}).reduce((a, b) => a + b, 0);
            statsSnapshot.manaUsed = battleStats.manaSpent || 0;
            statsSnapshot.hpHealed = battleStats.healingDone || 0;
            statsSnapshot.buffsCast = battleStats.buffsCast || 0;
        }

        return statsSnapshot;
    }

    /**
     * Called when a condition (e.g., hero level-up) suggests evolutions might be available.
     * Checks for evolutions and updates UI elements like the experience bar.
     */
    levelThresholdReached() {
        if (!this.isInitialized || !this.evolutionData) {
            console.warn("EvolutionService not initialized. Call init() first before checking thresholds.");
            return;
        }

        this.checkClassAvailability();

        const progressBar = document.getElementById('level-progress-bar');

        if (hero.canEvolve) {
            updateExpBarText((hero.classType || "Hero") + " can evolve! Click here!");
            expBarTextAddGlow();
            hero.class1Evolve = true;

            if (progressBar && !progressBar.dataset.evolutionListenerAttached) {
                this._evolutionModalHandler = () => {
                    this.checkClassAvailability();
                    this._updateEvolutionModal();
                };
                progressBar.addEventListener('click', this._evolutionModalHandler);
                progressBar.dataset.evolutionListenerAttached = 'true';
            }
        } else {
            hero.class1Evolve = false;
            if (progressBar && progressBar.dataset.evolutionListenerAttached) {
                if (this._evolutionModalHandler) {
                    progressBar.removeEventListener('click', this._evolutionModalHandler);
                }
                progressBar.removeAttribute('data-evolution-listener-attached');
                this._evolutionModalHandler = null;
            }
        }
    }

    /**
     * Checks available class evolutions based on hero's current state and evolution rules from JSON.
     * Updates `hero.availableClasses` and `hero.canEvolve`.
     */
    checkClassAvailability() {
        if (!this.isInitialized || !this.evolutionData) {
            console.warn("EvolutionService not initialized or data not loaded. Cannot check class availability.");
            hero.availableClasses = [];
            hero.canEvolve = false;
            return;
        }

        const currentHeroClass = hero.classType || "Novice";
        const heroRarity = hero.rarity || 'common';
        const newAvailableClasses = [];
        let classesCheckedCount = 0;

        // Get current stats snapshot
        const statsSnapshot = this._getStatsSnapshot();

        this.evolutionData.tiers.forEach(tier => {
            tier.classes.forEach(classDef => {
                classesCheckedCount++;

                // Skip special classes (Adept, Master) if they don't have valid requirements
                if (["Adept", "Master"].includes(classDef.name)) {
                    const reqStrForRarity = classDef.requirements[heroRarity];
                    const reqStrCommon = classDef.requirements.common;
                    if ((reqStrForRarity && reqStrForRarity.trim() === "() => true") ||
                        (!reqStrForRarity && reqStrCommon && reqStrCommon.trim() === "() => true")) {
                        return;
                    }
                }

                // Check if this class is a valid evolution path
                let isCandidatePath = false;
                if (currentHeroClass === "Novice") {
                    if (!classDef.from) {
                        isCandidatePath = true;
                    }
                } else {
                    if (classDef.from === currentHeroClass) {
                        isCandidatePath = true;
                    }
                }

                if (!isCandidatePath) {
                    return;
                }

                // Get the appropriate requirement string based on rarity
                const requirementString = classDef.requirements[heroRarity] || classDef.requirements['common'];
                if (!requirementString) {
                    return;
                }

                // Create evaluation context with previous class info
                const evaluationContext = {
                    ...statsSnapshot,
                    previousClass: currentHeroClass
                };

                // Check if requirements are met
                if (this.meetsRequirements(requirementString, evaluationContext)) {
                    if (!newAvailableClasses.some(ac => ac.name === classDef.name)) {
                        newAvailableClasses.push({ 
                            ...classDef, 
                            tierName: tier.name,
                            requirements: requirementString // Store the requirement string for UI display
                        });
                    }
                }
            });
        });

        this._allAvailableClasses = newAvailableClasses;
        hero.availableClasses = newAvailableClasses.slice(0, this._displayedClassesCount);
        hero.canEvolve = newAvailableClasses.length > 0;

        if (this._debugMode) {
            console.log(`Evolution check: ${classesCheckedCount} class definitions processed. ${newAvailableClasses.length} evolutions available for ${hero.classType || 'Novice'}.`);
            console.log('Available classes:', newAvailableClasses);
        }
    }

    /**
     * Evaluates if the hero's statistics meet the class evolution requirements.
     * @param {string} requirementString - A string representing an executable JS arrow function.
     * @param {object} statsContext - An object containing the hero's current statistics and 'previousClass'.
     * @returns {boolean} - True if requirements are met, false otherwise.
     */
    meetsRequirements(requirementString, statsContext) {
        try {
            // Create a safe evaluation context
            const safeContext = {
                ...statsContext,
                // Add any helper functions or constants needed for requirements
                Math: Math,
                Number: Number,
                Boolean: Boolean,
                String: String,
                Array: Array,
                Object: Object
            };

            // Create the requirement function with the safe context
            const requirementFn = new Function('stats', `
                with (stats) {
                    return (${requirementString})(stats);
                }
            `);

            return requirementFn(safeContext);
        } catch (error) {
            console.error(
                `Error evaluating requirement function.
                Stats Context (first level keys): ${Object.keys(statsContext).join(', ')}
                Requirement String: ${requirementString}
                Error:`, error
            );
            return false;
        }
    }

    _updateEvolutionModal() {
        const modal = document.getElementById('evolution-modal');
        const evolutionOptionsDiv = document.getElementById('evolution-options');
        if (!modal || !evolutionOptionsDiv) return;

        evolutionOptionsDiv.innerHTML = '';
        const displayedClasses = this._allAvailableClasses.slice(0, this._displayedClassesCount);

        displayedClasses.forEach((evolution, index) => {
            const evolutionDiv = document.createElement('div');
            evolutionDiv.className = 'evolution-option';
            evolutionDiv.innerHTML = `
                <h3>${evolution.name}</h3>
                <p>${evolution.description}</p>
                <p>Tier: ${evolution.tierName}</p>
            `;
            evolutionDiv.addEventListener('click', () => {
                console.log("Evolution selected:", evolution.name);
                this._closeEvolutionModal();
            });
            evolutionOptionsDiv.appendChild(evolutionDiv);
        });

        modal.style.display = 'block';
    }
}

export default EvolutionService;