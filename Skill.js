import { updateSkillBar,updatePassiveSkillBar, updateStamina, updateMana, renderLevelUp} from './Render.js';
import { selectTarget } from './Targeting.js';

class Skill {
    constructor(skillData,effects, element = null) {
        this.name = skillData.name;
        this.icon = skillData.icon;
        this.type = skillData.type;
        this.description = skillData.description;
        this.damage = skillData.damage;
        this.heal = skillData.heal;
        this.manaCost = skillData.manaCost;
        this.staminaCost = skillData.staminaCost;
        this.cooldown = skillData.cooldown;
        this.remainingDuration = 0;
        this.cooldownStartTime = null;
        this.onCooldown = false;
        this.damageType = skillData.damageType;
        this.targetingModes = skillData.targetingModes;
        this.extraTargets = skillData.extraTargets;
        this.effects = effects;
        this.div= element;
        this.repeat = false;
        this.level = 1;
        this.experience = 0;
        this.experienceToNextLevel = 100; // Example value for level 1
  }
    setElement(element) {
        this.div = element;
    }
  // Calculate damage based on the member's stats and skill level
  calculateDamage(member) {
    let damage = this.damage * this.level * member.stats.damage;
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
      renderLevelUp(this);
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
  useSkill(member){
    if(this.type == "active"){
        this.repeat = true;
        let skillDiv = null;
        if(this.div == null){
            skillDiv = member.element.querySelector("#" + member.memberId + "Skill" + this.name.replace(/\s/g, ''));
            this.div = skillDiv;
            this.startCooldown(member);
        }else{
        this.startCooldown(member);
        var targets = selectTarget(member, this.targetingModes[0]);

        if(this.extraTargets != undefined){
            this.extraTargets.forEach(mode => {
                        targets = targets.concat(selectTarget(member, mode));
            })
        }

        targets.forEach(target => {
            member.performAttack(member, target, this);
        });
        }

    }
  }
  pause(member){
    if(this.type == "active"){
        var overlay = this.div.querySelector(" .cooldown-overlay");
        overlay.classList.add('paused');
    }
  }
  unpause(member){
      if(this.type == "active"){
          var overlay = this.div.querySelector(" .cooldown-overlay");
          overlay.classList.remove('paused');
      }
    }
  heroStopSkill(){
    var overlay = this.div.querySelector(" .cooldown-overlay");
    overlay.style.animation = '';
    overlay.classList.add('hidden');  /* Hide the square */
    this.div.classList.remove('disabled');
    this.onCooldown = false;
  }
  startCooldown(member) {
    this.cooldownStartTime = Date.now();
    this.remainingDuration = this.cooldown;
    this.updateCooldownAnimation(member);
    this.onCooldown = true;
  }
  reduceCooldown( amount,member) {
      const elapsedTime = (Date.now() - this.cooldownStartTime) / 1000;
      console.log("Elapsed time: " + elapsedTime);
      console.log("Total cooldown: " + this.cooldown);
      console.log("Amount to change: " + amount);

      this.remainingDuration = Math.max(0, this.cooldown - elapsedTime - amount);
      console.log("remainingDuration: " + this.remainingDuration);

      if(this.remainingDuration > 0) {
        this.updateCooldownAnimation(  member);
      }
      else{
        console.log("Finishing early for skill " + this.name);
        this.finishiCooldown(member);
      }
  }
  updateCooldownAnimation(member) {
          var overlay = this.div.querySelector(" .cooldown-overlay");
          this.div.classList.add('disabled');
          overlay.classList.remove('hidden');
          overlay.style.animation = '';
          overlay.offsetHeight;

          const remainingPercentage = (this.remainingDuration / this.cooldown) * 100;
          overlay.style.height = `${remainingPercentage}%`;
          overlay.style.animation = `fill ${this.remainingDuration}s ease-in-out forwards`;
          console.log("For skill "+ this.name + "RemainingDuration after draw: " + this.remainingDuration);

          overlay.addEventListener('animationend', () => {
            this.finishiCooldown(member);
          }, { once: true });
      }
  finishiCooldown(member){
    var overlay = this.div.querySelector(" .cooldown-overlay");
    overlay.style.animation = '';
    overlay.offsetHeight;
    this.remainingDuration = 0;
    this.cooldownStartTime = null;
    overlay.classList.add('hidden');  /* Hide the square */
    this.div.classList.remove('disabled');  /* Enable pointer events */
    if( this.repeat != false){
      if(member.name == "Hero"){
        member.useSkill(this.div);
      }
      this.useSkill(member);
    }else{
        this.onCooldown = false;
    }
  }
}

export default Skill;

