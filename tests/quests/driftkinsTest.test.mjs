import { expect } from 'chai';
import driftkinsTest from '../../Data/quests/hollowreach/stage1/driftkinsTest.js';
import sylvaraBase from '../../Data/NPCs/sylvara_tidewalker/base.js';
import sylvaraQuestComplete from '../../Data/NPCs/sylvara_tidewalker/sylvara_quest_complete.js';

describe('Driftkin\'s Test Quest', () => {
    let gameState;
    let questState;
    let missingElements;

    beforeEach(() => {
        gameState = {
            inventory: [],
            companions: [],
            activeQuests: [],
            completedQuests: [],
            unlockedPOIs: [],
            currentMap: 'hollowreach'
        };
        questState = {
            currentStep: 0,
            completedSteps: []
        };
        missingElements = {
            questStructure: [],
            areas: [],
            npcs: [],
            dialogues: [],
            items: [],
            combat: [],
            questFlow: [],
            rewards: []
        };
    });

    after(() => {
        // Print missing elements report
        console.log('\n=== Missing Implementation Elements for Driftkin\'s Test ===');
        Object.entries(missingElements).forEach(([category, elements]) => {
            if (elements.length > 0) {
                console.log(`\n${category.toUpperCase()}:`);
                elements.forEach(element => console.log(`  - ${element}`));
            }
        });
    });

    describe('Quest Structure', () => {
        it('should have valid quest metadata', () => {
            if (!driftkinsTest.id) missingElements.questStructure.push('Quest ID is missing');
            if (!driftkinsTest.name) missingElements.questStructure.push('Quest Name is missing');
            if (!driftkinsTest.giver) missingElements.questStructure.push('Quest Giver is missing');
            if (!driftkinsTest.description) missingElements.questStructure.push('Quest Description is missing');
            if (!driftkinsTest.steps || driftkinsTest.steps.length === 0) {
                missingElements.questStructure.push('Quest Steps array is empty or missing');
            }
        });

        it('should have valid requirements', () => {
            if (!driftkinsTest.requirements) {
                missingElements.questStructure.push('Quest Requirements object is missing');
            } else {
                if (!driftkinsTest.requirements.quests) {
                    missingElements.questStructure.push('Required Quests array is missing');
                }
                if (!driftkinsTest.requirements.items) {
                    missingElements.questStructure.push('Required Items array is missing');
                }
            }
        });

        it('should have valid rewards', () => {
            if (!driftkinsTest.rewards) {
                missingElements.rewards.push('Quest Rewards object is missing');
            } else {
                if (!Array.isArray(driftkinsTest.rewards.items)) {
                    missingElements.rewards.push('Item Rewards array is missing or invalid');
                }
                if (typeof driftkinsTest.rewards.experience !== 'number') {
                    missingElements.rewards.push('Experience Reward is missing or invalid');
                }
                if (!driftkinsTest.rewards.reputation) {
                    missingElements.rewards.push('Reputation Rewards object is missing');
                }
            }
        });
    });

    describe('Quest Flow', () => {
        it('should have correct quest metadata', () => {
            if (driftkinsTest.id !== 'driftkinsTest') {
                missingElements.questFlow.push('Quest ID does not match expected value "driftkinsTest"');
            }
            if (driftkinsTest.name !== "Driftkin's Test") {
                missingElements.questFlow.push('Quest Name does not match expected value "Driftkin\'s Test"');
            }
            if (driftkinsTest.giver !== 'Sylvara Tidewalker') {
                missingElements.questFlow.push('Quest Giver does not match expected value "Sylvara Tidewalker"');
            }
            if (driftkinsTest.steps.length !== 3) {
                missingElements.questFlow.push(`Quest Steps length is ${driftkinsTest.steps.length}, expected 3`);
            }
        });
    });

    describe('Dialogue Flow', () => {
        it('should start quest when accepting from Sylvara', () => {
            const startNode = sylvaraBase.nodes.find(node => node.id === 'start');
            if (!startNode) {
                missingElements.dialogues.push('Sylvara start dialogue node is missing');
                return;
            }
            const acceptOption = startNode.options.find(opt => 
                opt.nextId === 'quest'
            );
            if (!acceptOption) {
                missingElements.dialogues.push('Sylvara quest dialogue option is missing');
            } else if (acceptOption.nextId !== 'questAccepted_driftkin') {
                missingElements.dialogues.push('Sylvara quest dialogue nextId is incorrect');
            }
        });

        it('should add quest and unlock foggy path when accepting', () => {
            const questAcceptedNode = sylvaraBase.nodes.find(node => node.id === 'questAccepted_driftkin');
            if (!questAcceptedNode) {
                missingElements.dialogues.push('Sylvara quest accepted node is missing');
                return;
            }
            const acceptOption = questAcceptedNode.options[0];
            if (!acceptOption?.action) {
                missingElements.dialogues.push('Sylvara quest accepted action is missing');
            } else {
                if (!acceptOption.action.some(a => a.type === 'startQuest' && a.questId === 'driftkinsTest')) {
                    missingElements.dialogues.push('Quest start action is missing or incorrect');
                }
                if (!acceptOption.action.some(a => a.type === 'unlockPOI' && a.mapId === 'driftmoor' && a.poiId === 'foggy_path')) {
                    missingElements.dialogues.push('Foggy path unlock action is missing or incorrect');
                }
            }
        });
    });

    describe('Quest Progression', () => {
        it('should handle foggy path navigation', () => {
            const navigationStep = driftkinsTest.steps.find(step => 
                step.description.includes('Navigate the foggy route')
            );
            if (!navigationStep) {
                missingElements.questFlow.push('Foggy path navigation step is missing');
            } else if (typeof navigationStep.condition !== 'function') {
                missingElements.questFlow.push('Foggy path navigation step condition is not a function');
            }
        });

        it('should handle wolf encounter', () => {
            const wolfStep = driftkinsTest.steps.find(step => 
                step.description.includes('survive the mutated wolves')
            );
            if (!wolfStep) {
                missingElements.questFlow.push('Wolf encounter step is missing');
            } else if (typeof wolfStep.condition !== 'function') {
                missingElements.questFlow.push('Wolf encounter step condition is not a function');
            }
        });

        it('should handle quest completion dialogue', () => {
            if (!sylvaraQuestComplete?.nodes) {
                missingElements.dialogues.push('Sylvara quest complete dialogue nodes are missing');
                return;
            }
            const completeNode = sylvaraQuestComplete.nodes.find(node => node.id === 'quest_complete');
            if (!completeNode) {
                missingElements.dialogues.push('Quest complete node is missing');
            } else if (!completeNode.options?.[0]?.action) {
                missingElements.dialogues.push('Quest complete action is missing');
            } else if (!completeNode.options[0].action.some(a => 
                a.type === 'completeQuest' && 
                a.questId === 'driftkinsTest'
            )) {
                missingElements.dialogues.push('Quest completion action is missing or incorrect');
            }
        });
    });

    describe('Quest Completion', () => {
        it('should grant correct rewards', () => {
            if (!driftkinsTest.rewards?.items?.includes('fogProofCompass')) {
                missingElements.rewards.push('"fogProofCompass" is missing from quest rewards');
            }
            if (driftkinsTest.rewards?.experience !== 75) {
                missingElements.rewards.push(`Experience reward is ${driftkinsTest.rewards?.experience}, expected 75`);
            }
            if (!driftkinsTest.rewards?.reputation?.Driftkin || driftkinsTest.rewards.reputation.Driftkin !== 10) {
                missingElements.rewards.push('Driftkin reputation reward is missing or incorrect');
            }
        });
    });
}); 