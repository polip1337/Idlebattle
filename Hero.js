import Member from './Member.js';
import {battleLog} from './initialize.js';
import {battleStarted} from './Battle.js';
import {battleStatistics} from './initialize.js';
import { updateSkillBar,updatePassiveSkillBar, updateStamina, updateMana} from './Render.js';
import { selectTarget } from './Targeting.js';
import Skill from './Skill.js';

class Hero extends Member {
constructor(name, classInfo,skills, level = 1, team,opposingTeam) {
    super(name, classInfo,skills, level = 1, team,opposingTeam,true);
    this.class2 =null;

    this.skills2 = null;
    this.class3 = null;
    this.skills3 = null;
    this.selectedSkills = [];
    this.selectedPassiveSkills = [];
    this.position = 'Front';
    this.repeat = false;
    this.availableClasses = [];
    this.class1Evolve = false;
    this.class2Evolve = false;
    this.class3Evolve = false;
  }
selectSkill(skill, skillBox, isPassive = false) {
    const selectedSkills = isPassive ? this.selectedPassiveSkills : this.selectedSkills;
    const maxSkills = 4;
    const index = selectedSkills.indexOf(skill);
    const skillBarUpdateMethod = isPassive ? updatePassiveSkillBar : updateSkillBar;
    if(isPassive){
        skill.setElement(document.querySelector("#skill" + index));

    }else{
        skill.setElement(document.querySelector("#passiveSkill" + index));
    }

    if (index === -1 && selectedSkills.length < maxSkills) {
        if (!isPassive) {
            const targetingSelect = skillBox.querySelector('.targeting-modes');
            skill.targetingMode = targetingSelect.value;
        }else{

        }
        selectedSkills.push(skill);
        skillBox.classList.add('selected');
    } else if (index !== -1) {
        selectedSkills.splice(index, 1);
        skillBox.classList.remove('selected');
    }

    skillBarUpdateMethod(selectedSkills);
}

    getSkill(skillDiv){
        const skillNumber = parseInt(skillDiv.id.match(/\d+/)[0]);
        return this.selectedSkills[skillNumber -1];
    }
    triggerRepeatSkills(){
        var activeSkills = this.selectedSkills.filter(skill => skill.type == "active");
        activeSkills.forEach(skill => {
            if (skill.repeat && !skill.onCooldown){
                skill.useSkill(this);
            }
        });
    }

}

export default Hero;