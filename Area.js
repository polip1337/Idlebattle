class Area {
  constructor(jsonPath) {

    fetch(jsonPath)
      .then(response => response.json())
      .then(data => {
        this.stages = data.stages;
        this.stageNumber = 1; // For example, you want to spawn mobs for stage 1
      });
  }

  spawnMobs() {
    const stage = this.stages[this.stageNumber - 1];
    if (!stage) {
      console.error("Invalid stage number");
      return ;
    }

    const mobs = [];
    stage.mobs.forEach(mobData => {
      for (let i = 0; i < mobData.count; i++) {
        mobs.push(new Mob(mobData.type, mobData.level));
      }
    });
    return mobs;
  }
}

class Mob {
  constructor(type, level) {
    this.type = type;
    this.level = level;
  }

}

export default Area;
