import { renderTeamMembers, updateHealth, updateMana, updateStamina } from '../Render.js';
import { battleLog } from '../initialize.js';
import EffectClass from '../EffectClass.js';

export class BattleTeams {
    constructor(team1, team2) {
        this.team1 = team1;
        this.team2 = team2;
    }

    setupPlayerTeam(hero) {
        this.team1.clearMembers();
        const activePlayerParty = hero.getActivePartyMembers();

        activePlayerParty.forEach((member) => {
            member.team = this.team1;
            member.opposingTeam = this.team2;
            member.dead = false;
            member.currentHealth = member.maxHealth;
            member.currentMana = member.stats.mana;
            member.currentStamina = member.stats.stamina;
            member.effects = [];
            this.team1.addMember(member);
        });

        this.renderTeam(this.team1, 'team1');
        this.initializeTeamMembers(this.team1);
    }

    setupEnemyTeam(area, mobsClasses) {
        this.team2.clearMembers();
        const mobs = area.spawnMobs(mobsClasses, this.team2, area.currentStageNumber);

        if (!mobs || mobs.length === 0) {
            battleLog.log(`Warning: No enemies for ${area.name} - Stage ${area.currentStageNumber}.`);
            return;
        }

        mobs.forEach((mob) => {
            mob.team = this.team2;
            mob.opposingTeam = this.team1;
            this.team2.addMember(mob);
        });

        this.renderTeam(this.team2, 'team2');
        this.initializeTeamMembers(this.team2);
    }

    renderTeam(team, teamId) {
        renderTeamMembers(team.members, teamId, true);
    }

    initializeTeamMembers(team) {
        team.members.forEach(member => {
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
        });
    }

    handleRegeneration() {
        this.team1.members.forEach(member => {
            if (member.currentHealth > 0) member.handleRegeneration();
        });
        this.team2.members.forEach(member => {
            if (member.currentHealth > 0) member.handleRegeneration();
        });
    }

    initializeSkills() {
        this.useTeamSkills(this.team2);
        this.useTeamSkills(this.team1);
        if (this.team1.members[0]?.isHero) {
            this.team1.members[0].triggerRepeatSkills();
        }
    }

    useTeamSkills(team) {
        team.members.forEach(member => {
            if (member.currentHealth > 0) {
                member.skills.forEach(skill => {
                    if (skill.type === "active" && !member.isHero) {
                        skill.needsInitialCooldownKickoff = true;
                        skill.useSkill(member);
                    }
                });
            }
        });
    }

    stopAllSkills() {
        [this.team1, this.team2].forEach(team => {
            if (team?.members) {
                team.members.forEach(member => {
                    if (member && typeof member.stopSkills === 'function') {
                        member.stopSkills();
                    }
                });
            }
        });
    }

    removeAllEffects() {
        [this.team1, this.team2].forEach(team => {
            if (team?.members) {
                team.members.forEach(member => {
                    if (member?.effects) {
                        [...member.effects].forEach(effect => effect.remove());
                    }
                });
            }
        });
    }

    hasActiveMembers() {
        const team1Alive = this.team1.members.some(member => member.currentHealth > 0);
        const team2Alive = this.team2.members.some(member => member.currentHealth > 0);
        return team1Alive && team2Alive;
    }

    isTeam1Victorious() {
        return this.team1.members.some(member => member.currentHealth > 0) &&
               !this.team2.members.some(member => member.currentHealth > 0);
    }

    calculateRewards() {
        const goldDrop = this.calculateGoldDrop();
        const xpFromBattle = this.calculateStageXP();
        return { goldDrop, xpFromBattle };
    }

    calculateGoldDrop() {
        return this.team2.members.reduce((total, mob) => {
            return total + (mob.currentHealth <= 0 && mob.goldDrop > 0 ? mob.goldDrop : 0);
        }, 0);
    }

    calculateStageXP() {
        const xpPerStageBase = 50;
        const xpFromBattle = xpPerStageBase * this.currentStageNumber;
        return Math.max(10, Math.floor(xpFromBattle));
    }

    distributeRewards({ goldDrop, xpFromBattle }) {
        if (goldDrop > 0) {
            this.team1.members[0].addGold(goldDrop);
            battleLog.log(`Collected ${goldDrop} gold!`);
        }

        if (xpFromBattle > 0 && this.team1.members[0]) {
            battleLog.log(`Party gained ${xpFromBattle} XP!`);
            this.team1.members[0].distributeBattleXP(xpFromBattle);
        }
    }

    defeatAllEnemies() {
        this.team2.members.forEach(member => {
            member.currentHealth = 0;
        });
    }
} 