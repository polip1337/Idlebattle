// Skills Management
export class SkillManager {
    static useTeamSkills(team) {
        team.members.forEach(member => {
            if (member.currentHealth <= 0) return;
            
            member.skills?.forEach(skill => {
                if (skill.type === "active") {
                    this.initializeSkillElement(skill, member);
                    
                    if (!member.isHero) {
                        skill.needsInitialCooldownKickoff = false;
                        skill.startCooldown(member);
                        skill.updateCooldownAnimation(member);
                        
                        if (skill.manaCost <= member.currentMana && skill.staminaCost <= member.currentStamina) {
                            skill.useSkill(member);
                        }
                    }
                }
            });
        });
    }

    static initializeSkillElement(skill, member) {
        if (!skill.div && member.element) {
            const skillDivId = member.memberId + "Skill" + skill.name.replace(/\s/g, '');
            const skillElement = member.element.querySelector("#" + skillDivId);
            if (skillElement) {
                skill.setElement(skillElement);
            }
        }
    }
} 