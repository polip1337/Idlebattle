import { renderTeamMembers, updateHealth, updateMana, updateStamina } from './Render.js';

// Team Management
export class TeamManager {
    static setupPlayerTeam(team1, team2, hero) {
        team1.clearMembers();
        const activeParty = hero.getActivePartyMembers();

        activeParty.forEach(member => {
            member.team = team1;
            member.opposingTeam = team2;
            member.dead = false;
            member.effects = [];
            team1.addMember(member);
            this.resetMemberState(member);
        });

        renderTeamMembers(team1.members, 'team1', true);
        team1.members.forEach(member => {
            member.initializeDOMElements?.();
            updateHealth(member);
            updateMana(member);
            updateStamina(member);
            this.updateMemberUI(member);
        });
    }

    static setupEnemyTeam(team2, battleState, mobsClasses) {
        team2.clearMembers();
        const mobs = battleState.currentBattleArea.spawnMobs(mobsClasses, team2, battleState.currentBattleStageNumber);

        if (!mobs?.length) {
            console.warn(`No mobs spawned for ${battleState.currentPoiName}, stage ${battleState.currentBattleStageNumber}.`);
            window.battleLog.log(`Warning: No enemies for ${battleState.currentPoiName} - Stage ${battleState.currentBattleStageNumber}.`);
            return false;
        }

        mobs.forEach(mob => {
            mob.team = team2;
            mob.opposingTeam = team1;
            team2.addMember(mob);
        });

        renderTeamMembers(team2.members, 'team2', true);
        team2.members.forEach(mob => mob.initializeDOMElements?.());
        return true;
    }

    static resetMemberState(member) {
        if (member.element) {
            const effectsContainer = member.element.querySelector('.effects');
            if (effectsContainer) effectsContainer.innerHTML = '';
        }

        if (!member.isHero && member.skills) {
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
    }

    static handleRegeneration(team1, team2) {
        [...team1.members, ...team2.members].forEach(member => {
            if (member.currentHealth > 0) member.handleRegeneration();
        });
    }

    static removeAllEffects(team) {
        if (team?.members) {
            team.members.forEach(member => {
                if (member?.effects) {
                    [...member.effects].forEach(effect => effect.remove());
                }
            });
        }
    }

    static stopAllSkills(...teams) {
        teams.forEach(team => {
            if (team?.members) {
                team.members.forEach(member => member.stopSkills?.());
            }
        });
    }
} 