// BattleController.js - Main controller that orchestrates all battle systems
import { BattleState } from './battle_state.js';
import { FleeSystem } from './flee_system.js';
import { BattleOutcome } from './battle_outcome.js';
import { TeamManager } from './team_manager.js';
import { BattleUI } from './battle_ui.js';
import { isPaused, hero, team1, team2, renderTeamMembers, evolutionService } from './initialize.js';
import { refreshMapElements, handleOutOfCombatRegeneration } from './map.js';
import { handleActions } from './actionHandler.js';
import Area from './Area.js';
import { openTab } from './navigation.js';
import { Formation } from './Formation.js';

// Expose formation globally for targeting system
let globalFormation = null;

export function getFormation() {
    return globalFormation;
}

export class BattleController {
    constructor() {
        this.battleState = new BattleState();
        this.fleeSystem = new FleeSystem(this.battleState, team1, team2);
        this.battleOutcome = new BattleOutcome(this.battleState, team1, team2);
        this.teamManager = new TeamManager(this.battleState);
        this.ui = new BattleUI(this.battleState);
        this.formation = new Formation();
        globalFormation = this.formation;
        
        this.setupCallbacks();
        this.setupKeyboardControls();
    }
    
    setupCallbacks() {
        // Flee system callbacks
        this.fleeSystem.setFleeCallback(() => {
            this.stopBattle(true);
        });
        
        // Battle outcome callbacks
        this.battleOutcome.setCallbacks(
            (wasPlayerVictorious) => this.onBattleEnd(wasPlayerVictorious),
            () => this.ui.showWinPopup(),
            () => this.ui.showLossPopup()
        );
        
        // UI callbacks
        this.ui.setCallbacks(
            () => this.stopBattle(false),
            () => this.repeatStage(),
            () => this.nextStage()
        );
    }
    
    setupKeyboardControls() {
        document.addEventListener('keydown', (event) => {
            if (event.key.toLowerCase() === 'x' && this.battleState.battleStarted) {
                // Cheat: Defeat all enemies instantly
                team2.members.forEach(member => {
                    member.currentHealth = 0;
                });
                this.checkBattleOutcome();
            }
        });
    }
    
    async gameTick() {
        if (isPaused || !this.battleState.battleStarted || this.battleState.isBattlePausedForDialogue) {
            // Pause all effects when battle is paused
            if (isPaused) {
                [...team1.members, ...team2.members].forEach(member => {
                    member.effects.forEach(effect => effect.pause());
                });
            }
            return;
        }

        // Unpause all effects when battle resumes
        [...team1.members, ...team2.members].forEach(member => {
            member.effects.forEach(effect => effect.unpause());
        });

        this.teamManager.handleTeamRegeneration();
        await this.checkBattleOutcome();
    }
    
    async checkBattleOutcome() {
        const battleEnded = await this.battleOutcome.checkBattleOutcome();
        if (battleEnded) {
            this.teamManager.stopAllSkills(team1, team2);
            if (hero) evolutionService.checkClassAvailability();
        }
    }

    async startBattle(poiData, dialogueOptions = null, stageNum = 1) {
        if (!poiData || !poiData.name) {
            console.error("startBattle called without valid POI data or POI name.");
            return;
        }

        // Clear map regeneration interval when entering battle
        if (window.regenerationInterval) {
            clearInterval(window.regenerationInterval);
            window.regenerationInterval = null;
        }

        const areaNameString = poiData.name;
        this.battleState.initializeBattle(areaNameString, stageNum);
        this.battleState.currentBattleDialogueOptions = dialogueOptions;
        this.battleState.currentBattleArea = new Area(areaNameString);

        await this.battleState.currentBattleArea.loadData();

        if (!this.battleState.currentBattleArea.isLoaded) {
            console.error(`Failed to load data for area: ${areaNameString}. Cannot start battle.`);
            return;
        }

        // Handle pre-battle sequence
        if (poiData.preBattleSequence?.length > 0) {
            for (const action of poiData.preBattleSequence) {
                await handleActions(action);
            }
        }

        // Set up teams
        const { playerTeam, enemyTeam, mobs } = this.teamManager.setupTeams(
            hero.getActivePartyMembers(),
            this.battleState.currentBattleArea,
            this.battleState.currentBattleStageNumber
        );

        if (playerTeam.members.length === 0 || enemyTeam.members.length === 0) {
            await this.checkBattleOutcome();
            return;
        }

        // Initialize formation with teams
        this.formation.initializeTeams(playerTeam, enemyTeam);

        renderTeamMembers(playerTeam.members, enemyTeam.members, 'team1', true);


        // Apply passive skills for all team members
        [...playerTeam.members, ...enemyTeam.members].forEach(member => {
            if (member.skills) {
                member.skills.forEach(skill => {
                    if (skill.type === "passive") {
                        // Only apply passive effects if the skill is selected
                        if (member.isHero && member.selectedPassiveSkills?.includes(skill)) {
                            skill.useSkill(member);
                        } else if (!member.isHero) {
                            // For non-hero members, apply all passive skills
                            skill.useSkill(member);
                        }
                    }
                });
            }
        });

        // Set battle as started but paused
        this.battleState.startBattle();
        this.fleeSystem.resetCooldown();

        // Handle area-level onEnterActions
        if (this.battleState.currentBattleArea.onEnterActions?.length > 0) {
            await handleActions(this.battleState.currentBattleArea.onEnterActions);
        }

        // Show pre-combat dialogue
        if (dialogueOptions?.npcId && dialogueOptions?.startDialogueId &&
            !this.battleState.hasShownPreCombatDialogue && 
            this.battleState.currentBattleStageNumber === 1) {
            await window.startDialogue(dialogueOptions.npcId, dialogueOptions.startDialogueId);
            this.battleState.hasShownPreCombatDialogue = true;
            if (isPaused) return;
        }

        // Handle stage-specific effects and actions
        const currentStage = this.battleState.currentBattleArea.stages[this.battleState.currentBattleStageNumber - 1];
        if (currentStage) {
            this.teamManager.applyStageEffects(currentStage);
            if (currentStage.onEnterActions) {
                await handleActions(currentStage.onEnterActions);
            }
        }

        // Start skills
        this.teamManager.useTeamSkills(team2);
        this.teamManager.useTeamSkills(team1);
        if (hero) hero.triggerRepeatSkills();

        // Set up battle interval
        this.battleState.setBattleInterval(setInterval(() => this.gameTick(), 1000));

        // Update UI
        this.ui.updateStageDisplay();

        // Unpause battle
        this.battleState.resumeFromDialogue();
    }

    stopBattle(fled = false) {
        this.battleState.stopBattle();
        this.teamManager.finishHeroSkills();

        // Restart map regeneration
        if (!window.regenerationInterval) {
            window.regenerationInterval = setInterval(handleOutOfCombatRegeneration, 2000);
        }

        if (fled) {
            this.ui.hidePopup();
            openTab({ currentTarget: document.getElementById('mapNavButton') }, 'map');
        }
    }

    async repeatStage() {
        this.ui.hidePopup();
        if (!this.battleState.currentBattleArea?.isLoaded || !this.battleState.currentPoiName) {
            returnToMap();
            return;
        }

        if (this.battleState.battleStarted) this.stopBattle(false);

        const pseudoPoiData = { name: this.battleState.currentPoiName };
        await this.startBattle(
            pseudoPoiData,
            this.battleState.currentBattleDialogueOptions,
            this.battleState.currentBattleStageNumber
        );
    }

    async nextStage() {
        this.ui.hidePopup();
        if (!this.battleState.currentBattleArea?.isLoaded || !this.battleState.currentPoiName) {
            returnToMap();
            return;
        }

        if (this.battleState.battleStarted) this.stopBattle(false);

        const nextStageNum = this.battleState.currentBattleStageNumber + 1;

        if (nextStageNum > this.battleState.currentBattleArea.stages.length) {
            return;
        }

        const pseudoPoiData = { name: this.battleState.currentPoiName };
        await this.startBattle(
            pseudoPoiData,
            this.battleState.currentBattleDialogueOptions,
            nextStageNum
        );
    }

    onBattleEnd(wasPlayerVictorious) {
        if (wasPlayerVictorious) {
            this.battleState.markStageCompleted(this.battleState.currentBattleStageNumber);
            this.ui.updateStageDisplay();
        }
    }
}