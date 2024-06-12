class HostileArea extends Area {
  constructor(name, monsterTypes, levelRange) {
    super(name);
    this.monsterTypes = monsterTypes;
    this.levelRange = levelRange;
  }

  spawnMonster() {
    const monsterType = this.monsterTypes[Math.floor(Math.random() * this.monsterTypes.length)];
    const level = Math.floor(Math.random() * (this.levelRange.max - this.levelRange.min + 1)) + this.levelRange.min;
    return { type: monsterType, level: level };
  }

  encounter() {
    const monster = this.spawnMonster();
    console.log(`A wild ${monster.type} (Level ${monster.level}) appears!`);
    // Logic to initiate battle encounter with the spawned monster...
  }
}
