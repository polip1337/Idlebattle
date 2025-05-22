import { expect } from 'chai';
import driftkinsTest from '../../Data/quests/hollowreach/stage1/driftkinsTest.js';
import sylvaraBase from '../../Data/NPCs/sylvara_tidewalker/base.js';
import sylvaraQuestComplete from '../../Data/NPCs/sylvara_tidewalker/sylvara_quest_complete.js';

describe('Driftkin\'s Test Quest', () => {
    let gameState;
    let questState;

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
    });

    describe('Quest Initialization', () => {
        it('should have correct quest metadata', () => {
            expect(driftkinsTest.id).to.equal('driftkinsTest');
            expect(driftkinsTest.name).to.equal("Driftkin\'s Test");
            expect(driftkinsTest.giver).to.equal('Sylvara Tidewalker');
            expect(driftkinsTest.steps.length).to.equal(3);
        });
    });

    describe('Dialogue Flow', () => {
        it('should start quest when accepting from Sylvara', () => {
            const startNode = sylvaraBase.nodes.find(node => node.id === 'start');
            const acceptOption = startNode.options.find(opt => 
                opt.nextId === 'quest'
            );
            
            expect(acceptOption).to.exist;
            expect(acceptOption.nextId).to.equal('questAccepted_driftkin');
        });

        it('should add quest and unlock foggy path when accepting', () => {
            const questAcceptedNode = sylvaraBase.nodes.find(node => node.id === 'questAccepted_driftkin');
            const acceptOption = questAcceptedNode.options[0];
            
            expect(acceptOption.action).to.deep.include({ type: 'startQuest', questId: 'driftkinsTest' });
            expect(acceptOption.action).to.deep.include({ 
                type: 'unlockPOI',
                mapId: 'driftmoor',
                poiId: 'foggy_path'
            });
        });
    });

    describe('Quest Progression', () => {
        it('should handle foggy path navigation', () => {
            const navigationStep = driftkinsTest.steps.find(step => 
                step.description.includes('Navigate the foggy route')
            );
            expect(navigationStep).to.exist;
            expect(navigationStep.condition).to.be.a('function');
        });

        it('should handle wolf encounter', () => {
            const wolfStep = driftkinsTest.steps.find(step => 
                step.description.includes('survive the mutated wolves')
            );
            expect(wolfStep).to.exist;
            expect(wolfStep.condition).to.be.a('function');
        });

        it('should handle quest completion dialogue', () => {
            expect(sylvaraQuestComplete).to.have.property('nodes');
            const completeNode = sylvaraQuestComplete.nodes.find(node => node.id === 'quest_complete');
            expect(completeNode).to.exist;
            expect(completeNode.options[0].action).to.deep.include({
                type: 'completeQuest',
                questId: 'driftkinsTest'
            });
        });
    });

    describe('Quest Completion', () => {
        it('should grant correct rewards', () => {
            expect(driftkinsTest.rewards.items).to.include('fogProofCompass');
            expect(driftkinsTest.rewards.experience).to.equal(75);
            expect(driftkinsTest.rewards.reputation).to.deep.include({
                Driftkin: 10
            });
        });
    });
}); 