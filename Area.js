import Member from './Member.js';

class Area {
    constructor(jsonPath) {
        this.jsonPath = jsonPath;
        this.name = ""; // Will be populated from JSON or inferred from path
        this.stages = [];
        this.stageNumber = 1; // Represents the default or current stage being configured/viewed, not necessarily battle stage
        this.description = "";
        this.isLoaded = false; // Flag to check if data has been fetched
    }

    async loadData() {
        if (this.isLoaded) {
            // console.log(`Area data for ${this.name} already loaded.`);
            return;
        }
        try {
            const response = await fetch("Data/Areas/" + this.jsonPath.replace(/\s/g, "") + ".json");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} while fetching ${this.jsonPath}`);
            }
            const data = await response.json();

            this.name = data.areaName || this.jsonPath.split('/').pop().replace(/\.json$/i, ''); // Get name from JSON or infer
            this.description = data.areaDescription || ""; // Get description from JSON
            this.stages = data.stages;
            this.stageNumber = 1; // Reset to default first stage after loading
            this.isLoaded = true;
            // console.log(`Area data loaded successfully for: ${this.name}`);
        } catch (error) {
            console.error(`Failed to load area data from ${this.jsonPath}:`, error);
            this.stages = []; // Ensure stages is empty on error
            this.isLoaded = false; // Explicitly set to false on error
        }
    }

    spawnMobs(mobClasses, teamToPopulate, stageNumToSpawn) { // teamToPopulate is not used, returns mobs
        if (!this.isLoaded) {
            console.error(`Area data for ${this.name} is not loaded. Call loadData() first.`);
            return [];
        }
        const stageIndex = stageNumToSpawn - 1;
        if (stageIndex < 0 || stageIndex >= this.stages.length) {
            console.error(`Invalid stage number ${stageNumToSpawn} for area ${this.name}. Max stages: ${this.stages.length}, Available: ${this.stages.map(s => s.stage).join(', ')}`);
            return [];
        }

        const stage = this.stages[stageIndex];
        if (!stage) {
            console.error(`Stage data not found for stage number ${stageNumToSpawn} (index ${stageIndex}) in area ${this.name}.`);
            return [];
        }

        const mobs = [];
        if (stage.mobs && Array.isArray(stage.mobs)) {
            for (let i = 0; i < stage.mobs.length; i++) {
                const mobData = stage.mobs[i];
                const mobClassDefinition = mobClasses[mobData.type]; // Get the class definition

                if (!mobClassDefinition) {
                    console.warn(`Mob type "${mobData.type}" not found in mobClasses for area ${this.name}, stage ${stageNumToSpawn}.`);
                    continue;
                }

                for (let j = 0; j < mobData.count; j++) {
                    try {
                        // Pass the actual class definition object to Member constructor
                        mobs.push(new Member(
                            mobClassDefinition.name, // Name from class definition
                            mobClassDefinition,      // The full class definition object
                            mobClassDefinition.skills, // Skill IDs or definitions from class def
                            mobData.level
                        ));
                    } catch (error) {
                        console.error(`Error creating member of type ${mobData.type}:`, error, "Mob Class Def:", mobClassDefinition);
                    }
                }
            }
        } else {
            console.warn(`No mobs defined or mobs array is malformed for stage ${stageNumToSpawn} in area ${this.name}.`);
        }
        return mobs;
    }

    deepCopy(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        if (Array.isArray(obj)) {
            return obj.map(item => this.deepCopy(item));
        }
        const copy = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                copy[key] = this.deepCopy(obj[key]);
            }
        }
        return copy;
    }
}

export default Area;