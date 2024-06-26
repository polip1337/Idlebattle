import { updateSkillBar,updatePassiveSkillBar, updateStamina, updateMana} from './Render.js';
import { selectTarget } from './Targeting.js';

class Skill {
    constructor(name, type, icon, description, damage, manaCost,staminaCost, cooldown, damageType, targetingModes, effect) {
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
  useSkill(member, div = null){
          let skillDiv = null;
          if(div == null){
            skillDiv = member.element.querySelector("#" + member.memberId + "Skill" + this.name.replace(/\s/g, ''));
          }else{
            skillDiv = div;
          }
          if(this.type == "active"){
              this.startCooldown(skillDiv, this.cooldown,member);

              const target = selectTarget(member, this.targetingModes[0]);

              member.performAttack(target, this);
          }
  }
  startCooldown(container, duration, member) {
          var overlay = document.querySelector("#" + container.id + " .cooldown-overlay");
          container.classList.add('disabled');
          overlay.classList.remove('hidden');

          overlay.style.animation = '';
          overlay.offsetHeight;
          overlay.style.animation = `fill ${duration}s ease-in-out forwards`;
          overlay.addEventListener('animationend', () => {
              overlay.classList.add('hidden');  /* Hide the square */
              container.classList.remove('disabled');  /* Enable pointer events */
              this.useSkill(member,container);

          }, { once: true });
      }
}

export default Skill;

