class Skill {
    constructor(name, type,icon, description, damage, manaCost,staminaCost, cooldown, damageType, targetingModes, effect) {
        this.name = name;
        this.icon = icon;
        this.type = type;
        this.description = description;
        this.damage = damage;
        this.manaCost = manaCost;
        this.staminaCost = staminaCost;
        this.cooldown = cooldown;
        this.damageType = damageType;
        this.targetingModes = targetingModes;
        this.effect = effect;

        this.level = 1;
        this.experience = 0;
        this.experienceToNextLevel = 100; // Example value for level 1
  }

  // Calculate damage based on the member's stats and skill level
  calculateDamage(member) {
    let damage = this.damage * this.level;
    if (this.damageType === 'physical') {
      damage += member.stats.strength;
    } else if (this.damageType === 'magical') {
      damage += member.stats.magicPower;
    }
    return damage;
  }

  // Apply the skill effect to a target member
  applyEffect(targetMember) {
    if (this.effectType) {
      targetMember.applyBuff(new Buff(this.effectType, 5, targetMember, this.effectType, this.effectValue));
    }
  }

  // Gain experience for the skill
  gainExperience(amount) {
    this.experience += amount;
    while (this.experience >= this.experienceToNextLevel) {
      this.levelUp();
    }
  }

  // Level up the skill, increasing its potency
  levelUp() {
    this.experience -= this.experienceToNextLevel;
    this.level += 1;
    this.experienceToNextLevel = Math.floor(this.experienceToNextLevel * 1.5); // Increase experience needed for next level
    this.baseDamage = Math.floor(this.baseDamage * 1.1); // Increase base damage by 10% per level
    if (this.effectValue) {
      this.effectValue = Math.floor(this.effectValue * 1.1); // Increase effect value by 10% per level
    }
  }
}

export default Skill;

