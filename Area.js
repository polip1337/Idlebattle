import Member from './Member.js';

class Area {
    constructor(areaNameString) {
        this.areaName = areaNameString;
        this.displayName = "";
        this.stages = [];
        this.description = "";
        this.isLoaded = false;
    }

    async loadData() {
        if (this.isLoaded) {
            return;
        }
        if (!this.areaName) {
            console.error("Area name is not set. Cannot load data.");
            this.isLoaded = false; // Ensure this is set if early exit
            return;
        }
        try {
            const filePath = `Data/Areas/${this.areaName.replace(/\s/g, "")}.json`;
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} while fetching ${filePath}`);
            }
            const data = await response.json();

            this.displayName = data.areaName || this.areaName;
            this.description = data.areaDescription || "";
            this.stages = data.stages || [];
            this.isLoaded = true;
        } catch (error) {
            console.error(`Failed to load area data for ${this.areaName} (source JSON: ${this.areaName.replace(/\s/g, "")}.json):`, error);
            this.displayName = this.areaName || "Error Loading Area";
            this.stages = []; // Ensure stages is empty on error
            this.isLoaded = false;
        }
    }

    // teamToPopulate is no longer strictly needed as we return mobs, but kept for signature consistency if used elsewhere.
    spawnMobs(mobClasses, teamToPopulate, stageNumToSpawn) {
        if (!this.isLoaded) {
            console.error(`Area data for ${this.displayName} (source: ${this.areaName}.json) is not loaded. Call loadData() first.`);
            return [];
        }
        const stageIndex = stageNumToSpawn - 1;
        if (stageIndex < 0 || stageIndex >= this.stages.length) {
            console.error(`Invalid stage number ${stageNumToSpawn} for area ${this.displayName}. Max stages: ${this.stages.length}. Available: ${this.stages.map((s,i) => i+1).join(', ')}`);
            return [];
        }

        const stage = this.stages[stageIndex];
        if (!stage) {
            console.error(`Stage data not found for stage number ${stageNumToSpawn} (index ${stageIndex}) in area ${this.displayName}.`);
            return [];
        }

        const mobs = [];
        if (stage.mobs && Array.isArray(stage.mobs)) {
            for (const mobData of stage.mobs) {
                const mobClassDefinition = mobClasses[mobData.type];
                if (!mobClassDefinition) {
                    console.warn(`Mob type "${mobData.type}" not found in mobClasses for area ${this.displayName}, stage ${stageNumToSpawn}.`);
                    continue;
                }
                for (let j = 0; j < mobData.count; j++) {
                    try {
                        mobs.push(new Member(
                            mobClassDefinition.name,
                            mobClassDefinition,
                            mobClassDefinition.skills,
                            mobData.level
                        ));
                    } catch (error) {
                        console.error(`Error creating member of type ${mobData.type}:`, error, "Mob Class Def:", mobClassDefinition);
                    }
                }
            }
        } else {
            console.warn(`No mobs defined or mobs array is malformed for stage ${stageNumToSpawn} in area ${this.displayName}.`);
        }
        return mobs;
    }
}

export default Area;