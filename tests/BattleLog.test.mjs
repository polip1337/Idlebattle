import { expect } from 'chai';
import BattleLog from '../BattleLog.js';

describe('BattleLog', function() {
    let battleLog;
    let mockLogContainer;

    beforeEach(() => {
        // Mock the DOM container
        mockLogContainer = {
            children: [],
            insertBefore: function(newChild, referenceNode) {
                if (referenceNode) {
                    const index = this.children.indexOf(referenceNode);
                    this.children.splice(index, 0, newChild);
                } else {
                    this.children.push(newChild); // Or unshift for prepending
                }
            },
            firstChild: null, // Will be set by insertBefore
            scrollTop: 0,
            scrollHeight: 0,
            // Helper to simulate DOM structure for testing
            _updateFirstChild: function() {
                this.firstChild = this.children.length > 0 ? this.children[0] : null;
            }
        };
        battleLog = new BattleLog(mockLogContainer);
    });

    describe('log', function() {
        it('should add a new log entry to the container', function() {
            battleLog.log('Test message', 'info');
            mockLogContainer._updateFirstChild(); // Simulate DOM update

            expect(mockLogContainer.children.length).to.equal(1);
            const logEntry = mockLogContainer.children[0];
            expect(logEntry.textContent).to.equal('Test message');
            // JSDOM would be better for classList checks
            // expect(logEntry.classList.contains('info')).to.be.true;
        });

        it('should prepend new log entries', function() {
            battleLog.log('First message', 'info');
            mockLogContainer._updateFirstChild();
            battleLog.log('Second message', 'warning');
            mockLogContainer._updateFirstChild();


            expect(mockLogContainer.children.length).to.equal(2);
            // log is prepending, so 'Second message' should be at index 0
            expect(mockLogContainer.children[0].textContent).to.equal('Second message');
            expect(mockLogContainer.children[1].textContent).to.equal('First message');
        });

        it('should scroll to the bottom (scrollHeight)', function() {
            mockLogContainer.scrollHeight = 100; // Simulate content height
            battleLog.log('Scroll test', 'debug');
            expect(mockLogContainer.scrollTop).to.equal(mockLogContainer.scrollHeight);
        });
    });
});