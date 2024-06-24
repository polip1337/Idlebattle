import Member from './Member.js';
import {battleLog} from './Main.js';
import { updateSkillBar,updatePassiveSkillBar, updateStamina, updateMana} from './Render.js';
import { selectTarget } from './Targeting.js';

class Hero extends Member {
constructor(name, classType,classInfo, memberId, team, opposingTeam, position) {
    super(name, classType,classInfo, memberId, team, opposingTeam);
    this.class2 =null;
    this.skills2 = null;
    this.class3 = null;
    this.skills3 = null;
    this.selectedSkills = [];
    this.selectedPassiveSkills = [];
  }
    selectSkill(skill, skillBox) {
      const index = this.selectedSkills.indexOf(skill);
      if (index === -1 && this.selectedSkills.length < 4) {
         const targetingSelect = skillBox.querySelector('.targeting-modes');
        skill.targetingMode = targetingSelect.value;
          this.selectedSkills.push(skill);
          skillBox.classList.add('selected');
      } else if (index !== -1) {
          this.selectedSkills.splice(index, 1);
          skillBox.classList.remove('selected');
      }
      updateSkillBar(this.selectedSkills);
    }

    selectPassiveSkill(skill, skillBox) {
      const index = this.selectedPassiveSkills.indexOf(skill);
      if (index === -1 && this.selectedPassiveSkills.length < 4) {


          this.selectedPassiveSkills.push(skill);
          skillBox.classList.add('selected');
      } else if (index !== -1) {
          this.selectedPassiveSkills.splice(index, 1);
          skillBox.classList.remove('selected');
      }
      updatePassiveSkillBar(this.selectedPassiveSkills);
    }

    useSkill(skillDiv){

        const skillNumber = parseInt(skillDiv.id.match(/\d+/)[0]);
        const skill = this.selectedSkills[skillNumber -1];
        if(skill.manaCost <= this.currentMana && skill.staminaCost <= this.currentStamina){
            this.currentMana -=skill.manaCost;
            this.currentStamina -=skill.staminaCost;
            updateMana(this);
            updateStamina(this);

            this.startCooldown(skillDiv, skill.cooldown);

            const target = selectTarget(this, skill.targetingMode);

            this.performAttack(target,skill);
        }

    }

    startCooldown(container, duration) {
        var overlay = document.querySelector("#" + container.id + " .cooldown-overlay");
        container.classList.add('disabled');
        overlay.classList.remove('hidden');

        overlay.style.animation = '';
        overlay.offsetHeight;
        overlay.style.animation = `fill ${duration}s ease-in-out forwards`;
        overlay.addEventListener('animationend', () => {
            overlay.classList.add('hidden');  /* Hide the square */
            container.classList.remove('disabled');  /* Enable pointer events */
            if( document.querySelector("#" + container.id + " input").checked){
                this.useSkill(container);
            };
        }, { once: true });
    }
}
export default Hero;
