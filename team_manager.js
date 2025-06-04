// TeamManager.js - Handles team setup, skills, and regeneration
import { hero, team1, team2, mobsClasses } from './initialize.js';
import EffectClass from './EffectClass.js';
import { updateHealth, updateMana, updateStamina } from './Render.js';

export class TeamManager {
    constructor(battleState) {
        this.battleState = battleState;
    }
    
    setupTeams(activePlayerParty, currentBattleArea, currentBattleStageNumber) {
        this.setupPlayerTeam(activePlayerParty);
        const mobs = this.setupEnemyTeam(currentBattleArea, currentBattleStageNumber);
        return { playerTeam: team1, enemyTeam: team2, mobs };
    }
    
    setupPlayerTeam(activePlayerParty) {
        team1.clearMembers();
        
        activePlayerParty.forEach((member) => {
            member.team = team1;
            member.opposingTeam = team2;
            member.dead = false;
            member.effects = [];
            team1.addMember(member);
        });
        
        this.initializePlayerTeamMembers();
    }
    
    setupEnemyTeam(currentBattleArea, currentBattleStageNumber) {
        team2.clearMembers();
        const mobs = currentBattleArea.spawnMobs(mobsClasses, team2, currentBattleStageNumber);
        
        if (!mobs || mobs.length === 0) {
            console.warn(`No mobs spawned for stage ${currentBattleStageNumber}.`);
            return [];
        }

        mobs.forEach((mob) => {
            mob.team = team2;
            mob.opposingTeam = team1;
            team2.addMember(mob);
        });
        
        return mobs;
    }
    
    initializePlayerTeamMembers() {
        team1.members.forEach(member => {
            if (typeof member.initializeDOMElements === 'function') {
                member.initializeDOMElements();
            }
            
            updateHealth(member);
            updateMana(member);
            updateStamina(member);
            
            if (member.element) {
                const effectsContainer = member.element.querySelector('.effects');
                if (effectsContainer) effectsContainer.innerHTML = '';
                
                const portraitImg = member.element.querySelector(".memberPortrait img");
                if (portraitImg && member.class.portrait) {
                    portraitImg.src = member.class.portrait;
                }
            }
            
            // Reset skill states for companions
            if (!member.isHero && member.skills) {
                this.resetMemberSkills(member);
            }
        });
    }
    
    resetMemberSkills(member) {
        member.skills.forEach(skill => {
            skill.needsInitialCooldownKickoff = true;
            skill.onCooldown = false;
            skill.remainingDuration = 0;
            skill.cooldownStartTime = null;
            
            if (skill.overlay) {
                skill.overlay.classList.add('hidden');
                skill.overlay.style.animation = '';
                skill.overlay.style.height = '0%';
                skill.overlay.classList.remove('paused');
            }
            
            if (skill.div) {
                skill.div.classList.remove('disabled');
            }
        });
    }
    
    useTeamSkills(teamInstance) {
        teamInstance.members.forEach(member => {
            if (member.currentHealth > 0) {
                member.skills.forEach(skill => {
                    if (skill.type === "active") {
                        // Initialize skill element if not already set
                        if (!skill.div && member.element) {
                            const skillDivId = member.memberId + "Skill" + skill.name.replace(/\s/g, '');
                            const skillElement = member.element.querySelector("#" + skillDivId);
                            if (skillElement) {
                                skill.setElement(skillElement);
                            }
                        }
                        
                        if (!member.isHero) {
                            skill.needsInitialCooldownKickoff = true;
                            skill.useSkill(member);
                        }
                    }
                });
            }
        });
    }
    
    stopAllSkills(playerTeamInstance, enemyTeamInstance) {
        this.stopTeamSkills(playerTeamInstance);
        this.stopTeamSkills(enemyTeamInstance);
    }
    
    stopTeamSkills(teamInstance) {
        if (teamInstance?.members) {
            teamInstance.members.forEach(member => {
                if (member && typeof member.stopSkills === 'function') {
                    member.stopSkills();
                }
            });
        }
    }
    
    handleTeamRegeneration() {
        // Player team regeneration
        team1.members.forEach(member => {
            if (member.currentHealth > 0) member.handleRegeneration();
        });
        
        // Enemy team regeneration
        team2.members.forEach(member => {
            if (member.currentHealth > 0) member.handleRegeneration();
        });
    }
    
    applyStageEffects(currentStage) {
        if (currentStage?.onEnterEffect) {
            team1.members.forEach(member => {
                new EffectClass(member, currentStage.onEnterEffect);
            });
        }
    }
    
    finishHeroSkills() {
        if (hero?.skills) {
            hero.skills.forEach(skill => {
                if (skill && typeof skill.finishCooldown === 'function') {
                    skill.finishCooldown(hero, false);
                }
            });
        }
    }
}