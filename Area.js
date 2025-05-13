import Member from './Member.js';


class Area {
    constructor(jsonPath) {
        this.jsonPath = jsonPath; // CRITICAL: This must happen
        this.name = "";
        this.stages = [];
        this.stageNumber = 1;
        this.description = "";
        fetch(jsonPath)
            .then(response => response.json())
            .then(data => {
                this.stages = data.stages;
                this.stageNumber = 1; // For example, you want to spawn mobs for stage 1
            });
    }

    spawnMobs(mobClasses, team2) {
        const stage = this.stages[this.stageNumber - 1];
        if (!stage) {
            console.error("Invalid stage number");
            return;
        }

        const mobs = [];
        for (let i = 0; i < stage.mobs.length; i++) {
            const mobData = stage.mobs[i];
            for (let i = 0; i < mobData.count; i++) {
                try {
                    mobs.push(new Member(this.deepCopy(mobClasses[mobData.type].name),
                        this.deepCopy(mobClasses[mobData.type].class),
                        this.deepCopy(mobClasses[mobData.type].skills),
                        mobData.level));
                } catch (error) {
                    console.log(mobData.type + "   " + mobClasses[mobData.type]);
                }

            }
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
