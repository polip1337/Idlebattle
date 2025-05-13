import { expect } from 'chai';
import BattleStatistics from '../BattleStatistics.js';

describe('BattleStatistics', function() {
    let stats;

    beforeEach(() => {
        stats = new BattleStatistics();
        // Mock document.getElementById for updateBattleStatistics if testing it
        global.document = {
            getElementById: (id) => ({ innerText: '', innerHTML: '' }) // Simplified mock
        };
    });

    afterEach(() => {
        delete global.document;
    });

    describe('Constructor', function() {
        it('should initialize all statistics to zero or empty objects', function() {
            expect(stats.damageDealt).to.deep.equal({});
            expect(stats.damageReceived).to.deep.equal({});
            expect(stats.enemiesDefeated).to.deep.equal({});
            expect(stats.successfulDodges).to.equal(0);
            // ... and so on for all properties
            expect(stats.goldCollected).to.equal(0);
        });
    });

    describe('addDamageDealt', function() {
        it('should add damage to the specified type and update total', function() {
            stats.addDamageDealt('Physical', 100);
            stats.addDamageDealt('Fire', 50);
            stats.addDamageDealt('Physical', 20);

            expect(stats.damageDealt.Physical).to.equal(120);
            expect(stats.damageDealt.Fire).to.equal(50);
            expect(stats.damageDealt.Total).to.equal(170);
        });
    });

    describe('addDamageReceived', function() {
        it('should add damage received to the specified type and update total', function() {
            stats.addDamageReceived('Physical', 70);
            stats.addDamageReceived('Poison', 30);
            expect(stats.damageReceived.Physical).to.equal(70);
            expect(stats.damageReceived.Poison).to.equal(30);
            expect(stats.damageReceived.Total).to.equal(100);
        });
    });

    describe('addEnemyDefeated', function() {
        it('should increment the count for the defeated enemy type', function() {
            stats.addEnemyDefeated('Goblin');
            stats.addEnemyDefeated('Orc');
            stats.addEnemyDefeated('Goblin');
            expect(stats.enemiesDefeated.Goblin).to.equal(2);
            expect(stats.enemiesDefeated.Orc).to.equal(1);
        });
    });

    describe('addSuccessfulDodge', function() {
        it('should increment successfulDodges', function() {
            stats.addSuccessfulDodge();
            stats.addSuccessfulDodge();
            expect(stats.successfulDodges).to.equal(2);
        });
    });

    describe('addSuccessfulBlock', function() {
        it('should increment successfulBlocks', function() {
            stats.addSuccessfulBlock();
            expect(stats.successfulBlocks).to.equal(1);
        });
    });

    describe('addHealingDone', function() {
        it('should increment healingDone', function() {
            stats.addHealingDone(50);
            stats.addHealingDone(25);
            expect(stats.healingDone).to.equal(75);
        });
    });

    describe('addCriticalHit', function() {
        it('should increment criticalHits and add to criticalDamage', function() {
            stats.addCriticalHit(150);
            stats.addCriticalHit(200);
            expect(stats.criticalHits).to.equal(2);
            expect(stats.criticalDamage).to.equal(350);
        });
    });

    describe('addSkillUsage', function() {
        it('should increment the usage count for the skill', function() {
            stats.addSkillUsage('Fireball');
            stats.addSkillUsage('Heal');
            stats.addSkillUsage('Fireball');
            expect(stats.skillUsage.Fireball).to.equal(2);
            expect(stats.skillUsage.Heal).to.equal(1);
        });
    });

    describe('addTotalHealingReceived', function() {
        it('should increment totalHealingReceived', function() {
            stats.addTotalHealingReceived(10);
            expect(stats.totalHealingReceived).to.equal(10);
        });
    });

    describe('addTotalBuffsApplied', function() {
        it('should increment totalBuffsApplied', function() {
            stats.addTotalBuffsApplied();
            expect(stats.totalBuffsApplied).to.equal(1);
        });
    });

    describe('addTotalDebuffsApplied', function() {
        it('should increment totalDebuffsApplied', function() {
            stats.addTotalDebuffsApplied();
            expect(stats.totalDebuffsApplied).to.equal(1);
        });
    });

    describe('addManaRegenerated', function() {
        it('should increment manaRegenerated', function() {
            stats.addManaRegenerated(20.5); // Test rounding
            expect(stats.manaRegenerated).to.equal(21);
        });
    });

    describe('addStaminaRegenerated', function() {
        it('should increment staminaRegenerated', function() {
            stats.addStaminaRegenerated(15.2); // Test rounding
            expect(stats.staminaRegenerated).to.equal(15);
        });
    });

    describe('addStaminaSpent', function() {
        it('should increment staminaSpent if amount is positive', function() {
            stats.addStaminaSpent(5);
            stats.addStaminaSpent(0);
            stats.addStaminaSpent(-2);
            expect(stats.staminaSpent).to.equal(5);
        });
    });

    describe('addManaSpent', function() {
        it('should increment manaSpent if amount is positive', function() {
            stats.addManaSpent(10);
            expect(stats.manaSpent).to.equal(10);
        });
    });

    describe('addMultiHit', function() {
        it('should increment multiHits', function() {
            stats.addMultiHit();
            expect(stats.multiHits).to.equal(1);
        });
    });

    describe('addMiss', function() {
        it('should increment misses', function() {
            stats.addMiss();
            expect(stats.misses).to.equal(1);
        });
    });

    describe('addSuccessfulFlee', function() {
        it('should increment successfulFlees', function() {
            stats.addSuccessfulFlee();
            expect(stats.successfulFlees).to.equal(1);
        });
    });

    describe('addGoldCollected', function() {
        it('should increment goldCollected', function() {
            stats.addGoldCollected(100);
            stats.addGoldCollected(50);
            expect(stats.goldCollected).to.equal(150);
        });
    });

    describe('updateBattleStatistics (DOM interaction)', function() {
        it('should attempt to update DOM elements', function() {
            // This test mainly checks if the function runs without error with mocked DOM.
            // Verifying exact innerText/innerHTML changes would require more detailed DOM mocks or JSDOM.
            stats.addDamageDealt('Physical', 10);
            stats.addSkillUsage('Slice', 2);
            expect(() => stats.updateBattleStatistics()).to.not.throw();
        });
    });
});