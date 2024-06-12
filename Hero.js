import Member from './Member.js';

class Hero extends Member {
constructor(name, classType,classInfo, memberId, team, opposingTeam) {
    super(name, classType,classInfo, memberId, team, opposingTeam);
    this.class2 =null;
    this.skills2 = null;
    this.class3 = null;
    this.skills3 = null;
    this.selectedSkills = [];
  }
      selectSkill(skill, skillBox) {
      const index = this.selectedSkills.indexOf(skill);
      if (index === -1 && this.selectedSkills.length < 4) {
          this.selectedSkills.push(skill);
          skillBox.classList.add('selected');
      } else if (index !== -1) {
          this.selectedSkills.splice(index, 1);
          skillBox.classList.remove('selected');
      }
      }
}
export default Hero;
