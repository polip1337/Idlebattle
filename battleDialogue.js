// Dialogue Management
export class DialogueManager {
    static async handleDialogue(npcId, dialogueId, description, battleState) {
        if (!npcId || !dialogueId) return false;
        
        battleState.pauseForDialogue();
        window.battleLog.log(`Starting ${description}: ${dialogueId}`);
        
        try {
            await window.startDialogue(npcId, dialogueId);
            window.battleLog.log(`${description} finished.`);
            return true;
        } catch (error) {
            console.error(`Error during ${description}:`, error);
            return false;
        } finally {
            battleState.resumeFromDialogue();
        }
    }

    static async handlePreBattleDialogue(battleState) {
        const options = battleState.currentBattleDialogueOptions;
        if (options?.npcId && options?.startDialogueId && 
            !battleState.hasShownPreCombatDialogue && battleState.currentBattleStageNumber === 1) {
            
            const shown = await this.handleDialogue(options.npcId, options.startDialogueId, "pre-battle dialogue", battleState);
            if (shown) battleState.hasShownPreCombatDialogue = true;
            return shown;
        }
        return false;
    }

    static async handlePostWinDialogue(battleState) {
        const options = battleState.currentBattleDialogueOptions;
        if (options?.npcId && options?.endWinDialogueId && 
            battleState.currentBattleStageNumber === battleState.currentBattleArea.stages.length) {
            return await this.handleDialogue(options.npcId, options.endWinDialogueId, "post-battle (win) dialogue", battleState);
        }
        return false;
    }

    static async handlePostLossDialogue(battleState) {
        const options = battleState.currentBattleDialogueOptions;
        if (options?.npcId && options?.endLossDialogueId) {
            return await this.handleDialogue(options.npcId, options.endLossDialogueId, "post-battle (loss) dialogue", battleState);
        }
        return false;
    }

    static async handleFleeDialogue(battleState) {
        const options = battleState.currentBattleDialogueOptions;
        if (options?.npcId && options?.fleeDialogueId) {
            return await this.handleDialogue(options.npcId, options.fleeDialogueId, "flee dialogue", battleState);
        }
        return false;
    }
} 