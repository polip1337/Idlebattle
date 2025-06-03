import { databaseService } from '../database-service.js';
import { expect } from 'chai';

describe('Database Service Tests', () => {
    const testClassName = 'TestWarrior';
    const testClassData = {
        name: 'Test Warrior',
        baseStats: {
            strength: 10,
            defense: 8,
            health: 100
        },
        skills: ['slash', 'block']
    };
    const testTags = ['melee', 'tank', 'physical'];

    // Clean up after each test
    afterEach(async () => {
        try {
            await databaseService.deleteClass(testClassName);
        } catch (error) {
            console.log('Cleanup failed:', error);
        }
    });

    describe('Class Storage Operations', () => {
        it('should store a new class with tags', async () => {
            const result = await databaseService.storeClass(testClassName, testClassData, testTags);
            expect(result).to.be.true;

            const storedClass = await databaseService.getClass(testClassName);
            expect(storedClass).to.not.be.null;
            expect(storedClass.name).to.equal(testClassData.name);
            expect(storedClass.tags).to.deep.equal(testTags);
        });

        it('should limit tags to 5 maximum', async () => {
            const tooManyTags = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6'];
            await databaseService.storeClass(testClassName, testClassData, tooManyTags);
            
            const storedClass = await databaseService.getClass(testClassName);
            expect(storedClass.tags.length).to.equal(5);
        });

        it('should update a class and its tags', async () => {
            // First store the class
            await databaseService.storeClass(testClassName, testClassData, testTags);

            // Update with new data and tags
            const newStats = { strength: 12, defense: 10, health: 120 };
            const newTags = ['melee', 'elite', 'veteran'];
            
            await databaseService.updateClass(testClassName, { baseStats: newStats }, newTags);
            
            const updatedClass = await databaseService.getClass(testClassName);
            expect(updatedClass.baseStats).to.deep.equal(newStats);
            expect(updatedClass.tags).to.deep.equal(newTags);
        });
    });

    describe('Tag Operations', () => {
        beforeEach(async () => {
            await databaseService.storeClass(testClassName, testClassData, testTags);
        });

        it('should add a new tag', async () => {
            await databaseService.addTag(testClassName, 'veteran');
            
            const updatedClass = await databaseService.getClass(testClassName);
            expect(updatedClass.tags).to.include('veteran');
        });

        it('should not add duplicate tags', async () => {
            await databaseService.addTag(testClassName, 'melee');
            
            const updatedClass = await databaseService.getClass(testClassName);
            const meleeCount = updatedClass.tags.filter(tag => tag === 'melee').length;
            expect(meleeCount).to.equal(1);
        });

        it('should remove a tag', async () => {
            await databaseService.removeTag(testClassName, 'melee');
            
            const updatedClass = await databaseService.getClass(testClassName);
            expect(updatedClass.tags).to.not.include('melee');
        });
    });

    describe('Class Search Operations', () => {
        beforeEach(async () => {
            // Create multiple test classes
            await databaseService.storeClass('Warrior1', { ...testClassData, name: 'Warrior 1' }, ['melee', 'tank', 'physical']);
            await databaseService.storeClass('Warrior2', { ...testClassData, name: 'Warrior 2' }, ['melee', 'tank', 'veteran']);
            await databaseService.storeClass('Mage1', { ...testClassData, name: 'Mage 1' }, ['ranged', 'magic', 'support']);
        });

        it('should find classes by multiple tags', async () => {
            const meleeTanks = await databaseService.findClassesByTags(['melee', 'tank']);
            expect(Object.keys(meleeTanks).length).to.equal(2);
            expect(meleeTanks).to.have.property('Warrior1');
            expect(meleeTanks).to.have.property('Warrior2');
        });

        it('should not find classes when tags dont match', async () => {
            const nonExistent = await databaseService.findClassesByTags(['melee', 'magic']);
            expect(Object.keys(nonExistent).length).to.equal(0);
        });

        it('should find all classes with a single tag', async () => {
            const meleeClasses = await databaseService.findClassesByTags(['melee']);
            expect(Object.keys(meleeClasses).length).to.equal(2);
        });
    });

    describe('Error Handling', () => {
        it('should handle non-existent class gracefully', async () => {
            const nonExistentClass = await databaseService.getClass('NonExistentClass');
            expect(nonExistentClass).to.be.null;
        });

        it('should handle invalid tag operations gracefully', async () => {
            const result = await databaseService.addTag('NonExistentClass', 'test');
            expect(result).to.be.false;
        });
    });
}); 