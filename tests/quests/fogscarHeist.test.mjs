import { expect } from 'chai';
import fogscarHeist from '../../Data/quests/hollowreach/stage1/fogscarHeist.js';
import rennBase from '../../Data/NPCs/renn_quickfingers/renn_base.js';
import rennFirstCorridorPreBattle from '../../Data/NPCs/renn_quickfingers/renn_firstcorridor_pre_battle.js';
import rennFirstCorridorPostBattle from '../../Data/NPCs/renn_quickfingers/renn_firstcorridor_post_battle.js';
import rennSecondCorridorPreBattle from '../../Data/NPCs/renn_quickfingers/renn_secondcorridor_pre_battle.js';
import rennSecondCorridorPostBattle from '../../Data/NPCs/renn_quickfingers/renn_secondcorridor_post_battle.js';
import rennVaultPanic from '../../Data/NPCs/renn_quickfingers/renn_vault_panic.js';
import rennVaultFled from '../../Data/NPCs/renn_quickfingers/renn_vault_fled.js';
import rennFoggedCorridorWarning from '../../Data/NPCs/renn_quickfingers/renn_foggedcorridor_warning.js';
import rennFoggedCorridorSurprise from '../../Data/NPCs/renn_quickfingers/renn_foggedcorridor_surprise.js';
import rennFoggedCorridorEscape from '../../Data/NPCs/renn_quickfingers/renn_foggedcorridor_escape.js';

describe('Fogscar Heist Quest', () => {
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
            expect(fogscarHeist.id).to.equal('fogscarHeist');
            expect(fogscarHeist.name).to.equal('The Sewer Door Heist');
            expect(fogscarHeist.giver).to.equal('Renn Quickfingers');
            expect(fogscarHeist.steps.length).to.equal(6);
        });
    });

    describe('Dialogue Flow', () => {
        it('should start quest when accepting from Renn', () => {
            const startNode = rennBase.nodes.find(node => node.id === 'start');
            const acceptOption = startNode.options.find(opt => 
                opt.text.includes("About that sewer door job")
            );
            
            expect(acceptOption).to.exist;
            expect(acceptOption.nextId).to.equal('questAccepted_ongoing');
        });

        it('should add sword and start quest when accepting initial offer', () => {
            const heistRevealNode = rennBase.nodes.find(node => node.id === 'heist_reveal');
            const acceptOption = heistRevealNode.options.find(opt => 
                opt.text.includes("I'm in")
            );
            
            expect(acceptOption).to.exist;
            expect(acceptOption.action).to.deep.include({ type: 'startQuest', questId: 'fogscarHeist' });
            expect(acceptOption.action).to.deep.include({ type: 'addItem', itemId: 'simple_sword_001' });
            expect(acceptOption.action).to.deep.include({ 
                type: 'unlockPOI',
                mapId: 'hollowreach',
                poiId: 'rustmarketSewersPOI'
            });
        });

        it('should add Renn as companion after accepting quest', () => {
            const questAcceptedNode = rennBase.nodes.find(node => node.id === 'questAccepted_heist');
            const acceptOption = questAcceptedNode.options[0];
            
            expect(acceptOption.action).to.deep.include({
                type: "addCompanion",
                companionId: "renn_quickfingers"
            });
        });
    });

    describe('Quest Progression', () => {
        it('should progress through first corridor combat', () => {
            expect(rennFirstCorridorPreBattle).to.have.property('nodes');
            expect(rennFirstCorridorPostBattle).to.have.property('nodes');
            expect(rennFirstCorridorPostBattle.nodes[0].action).to.deep.include({
                type: 'unlockPOI',
                mapId: 'rustmarketSewers',
                poiId: 'sewer_scavengerRedoubt_POI'
            });
        });

        it('should progress through scavenger redoubt combat', () => {
            expect(rennSecondCorridorPreBattle).to.have.property('nodes');
            expect(rennSecondCorridorPostBattle).to.have.property('nodes');
            const startNode = rennSecondCorridorPostBattle.nodes.find(node => node.id === 'start');
            expect(startNode).to.exist;
            const unlockAction = startNode.options[0].action;
            expect(unlockAction).to.deep.include({
                type: 'unlockPOI',
                mapId: 'rustmarketSewers',
                poiId: 'sewer_vaultAntechamber_POI'
            });
            expect(unlockAction).to.deep.include({
                type: 'unlockPOI',
                mapId: 'rustmarketSewers',
                poiId: 'sewer_foggedCorridor_POI'
            });
        });

        it('should handle fogged corridor warning dialogue', () => {
            expect(rennFoggedCorridorWarning).to.have.property('nodes');
            expect(rennFoggedCorridorWarning.nodes[0]).to.have.property('id', 'start');
        });

        it('should handle vault encounter correctly', () => {
            expect(rennVaultPanic).to.have.property('nodes');
            expect(rennVaultFled).to.have.property('nodes');
            const fleeNode = rennVaultFled.nodes.find(node => node.id === 'flee_to_fog');
            expect(fleeNode.action).to.deep.include({ type: 'equip', itemId: 'mistwalkerAmulet' });
        });


        it('should handle fogged district navigation', () => {
            expect(rennFoggedCorridorEscape).to.have.property('nodes');
            const amuletNode = rennFoggedCorridorEscape.nodes.find(node => node.id === 'amulet_discussion');
            expect(amuletNode).to.exist;
            const actions = amuletNode.options[0].action;
            expect(actions).to.deep.include({ 
                type: 'travelToMap',
                mapId: 'foggedDocks'
            });
            expect(actions).to.deep.include({
                type: 'hidePOI',
                mapId: 'rustmarketSewers',
                poiId: 'sewer_foggedCorridor_POI'
            });
            expect(actions).to.deep.include({
                type: 'unlockPOI',
                mapId: 'hollowreach',
                poiId: 'renn_quickfingers_house'
            });
        });

        it('should handle final amulet discussion', () => {
            expect(rennFoggedCorridorEscape).to.have.property('nodes');
            const amuletNode = rennFoggedCorridorEscape.nodes.find(node => node.id === 'amulet_discussion');
            expect(amuletNode).to.exist;
            expect(amuletNode.options[0].action).to.deep.include({ 
                type: 'travelToMap',
                mapId: 'foggedDocks'
            });
        });
    });

    describe('Quest Completion', () => {
        it('should unlock mistwalkerSecret quest upon completion', () => {
            expect(fogscarHeist.rewards.unlock).to.equal('mistwalkerSecret');
        });

        it('should grant correct experience reward', () => {
            expect(fogscarHeist.rewards.experience).to.equal(50);
        });
    });
}); 