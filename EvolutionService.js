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
        this.evolutionData = null; // Will hold the parsed evolutions.json content
        this.isInitialized = false;
        this._evolutionModalHandler = null; // To store the event handler for removal
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
            const response = await fetch('./Data/evolutions.json'); // Fetch the JSON file
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} while fetching evolutions.json`);
            }
            this.evolutionData = await response.json(); // Parse it
            this.isInitialized = true;
            console.log("EvolutionService initialized with evolution data.");
        } catch (error) {
            console.error("Failed to initialize EvolutionService:", error);
            this.evolutionData = null;
            this.isInitialized = false;
            // Depending on the application, you might want to re-throw the error
            // or have a fallback mechanism.
        }
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

        this.checkClassAvailability(); // This will update hero.availableClasses and hero.canEvolve

        const progressBar = document.getElementById('level-progress-bar');

        if (hero.canEvolve) {
            updateExpBarText((hero.classType || "Hero") + " can evolve! Click here!");
            expBarTextAddGlow();
            hero.class1Evolve = true; // Assuming this flag is still used for specific UI logic

            if (progressBar && !progressBar.dataset.evolutionListenerAttached) {
                // Define handler and store it for potential removal
                this._evolutionModalHandler = () => {
                    this.checkClassAvailability(); // Re-check just before opening for fresh data
                    openEvolutionModal(hero);
                };
                progressBar.addEventListener('click', this._evolutionModalHandler);
                progressBar.dataset.evolutionListenerAttached = 'true';
            }
        } else {
            // Logic to reset UI if no evolutions are available
            // e.g., updateExpBarText("Keep training!"); removeGlow();
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

        const currentHeroClass = hero.classType || "Novice"; // Default to Novice if classType is not set
        const heroRarity = hero.rarity || 'common'; // Default to 'common' rarity if not set

        const newAvailableClasses = [];
        let classesCheckedCount = 0; // Counter for checked classes

        this.evolutionData.tiers.forEach(tier => {
            tier.classes.forEach(classDef => {
                classesCheckedCount++; // Increment for each class definition encountered

                // Skip generic tier markers like "Adept", "Master" if they are placeholders
                // with "() => true" and not actual evolvable classes.
                // "Initiate" is a Tier 1 class and should be processed.
                if (["Adept", "Master"].includes(classDef.name)) {
                    const reqStrForRarity = classDef.requirements[heroRarity];
                    const reqStrCommon = classDef.requirements.common;
                    if ((reqStrForRarity && reqStrForRarity.trim() === "() => true") ||
                        (!reqStrForRarity && reqStrCommon && reqStrCommon.trim() === "() => true")) {
                        return; // Skip this placeholder entry
                    }
                }

                let isCandidatePath = false;
                // For "Novice", available evolutions are Tier 1 classes (those without a 'from' field).
                if (currentHeroClass === "Novice") {
                    if (!classDef.from) {
                        isCandidatePath = true;
                    }
                } else {
                    // For other classes, the 'from' field must match the hero's current class.
                    if (classDef.from === currentHeroClass) {
                        isCandidatePath = true;
                    }
                }

                if (!isCandidatePath) {
                    return; // Not a valid evolution path for the hero's current class.
                }

                // Get the requirement string for the hero's rarity, or fallback to 'common'.
                const requirementString = classDef.requirements[heroRarity] || classDef.requirements['common'];
                if (!requirementString) {
                    // console.warn(`No requirement string found for class "${classDef.name}" (rarity "${heroRarity}" or "common").`);
                    return;
                }

                // Prepare the 'stats' object to be passed to the requirement function.
                // This should include all relevant hero statistics.
                // The hero's current class is passed as 'previousClass' for requirement checks.
                const statsSnapshot = {
                    ...hero, // Includes top-level stats like hero.level, hero.honor etc.
                    ...(hero.stats || {}), // Merges stats from a nested hero.stats object
                    ...(hero.battleStatistics || {}) // Merges stats from a nested hero.battleStatistics object
                };

                // Remove properties that might cause issues or are not simple stats
                delete statsSnapshot.availableClasses; // Avoid circular references or large data
                // delete statsSnapshot.inventory; // Example of other complex data to remove from stats context

                const evaluationContext = {
                    ...statsSnapshot,
                    previousClass: currentHeroClass // Used by requirements like "(stats) => stats.previousClass === 'Squire'"
                };

                if (this.meetsRequirements(requirementString, evaluationContext)) {
                    // Add class if requirements are met and it's not already in the list
                    if (!newAvailableClasses.some(ac => ac.name === classDef.name)) {
                        newAvailableClasses.push({ ...classDef, tierName: tier.name });
                    }
                }
            });
        });

        hero.availableClasses = newAvailableClasses;
        hero.canEvolve = hero.availableClasses.length > 0;

        // Log the counts
        console.log(`Evolution check: ${classesCheckedCount} class definitions processed. ${hero.availableClasses.length} evolutions available for ${hero.classType || 'Novice'}.`);
    }

    /**
     * Evaluates if the hero's statistics meet the class evolution requirements.
     * @param {string} requirementString - A string representing an executable JS arrow function.
     * @param {object} statsContext - An object containing the hero's current statistics and 'previousClass'.
     * @returns {boolean} - True if requirements are met, false otherwise.
     */
    meetsRequirements(requirementString, statsContext) {
        try {
            // Dynamically create a function from the requirement string.
            // The 'stats' parameter in the string function will receive `statsContext`.
            const requirementFn = new Function('stats', `return (${requirementString})(stats);`);
            return requirementFn(statsContext);
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
}

export default EvolutionService;