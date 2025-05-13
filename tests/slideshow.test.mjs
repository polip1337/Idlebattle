import { expect } from 'chai';
// import { startSlideshow } from '../slideshow.js';
// DOM-heavy and uses setTimeout.

describe('Slideshow (Conceptual)', function() {
    let mockSlideshowElement, mockSlideElements;
    let clock; // For controlling setTimeout
    let slideshowModule;

    beforeEach(async () => {
        mockSlideElements = [
            { classList: { add: sinon.spy(), remove: sinon.spy() } },
            { classList: { add: sinon.spy(), remove: sinon.spy() } }
        ];
        mockSlideshowElement = {
            classList: { add: sinon.spy(), remove: sinon.spy() }
        };

        global.document = {
            getElementById: (id) => {
                if (id === 'slideshow') return mockSlideshowElement;
                return null;
            },
            querySelectorAll: (selector) => {
                if (selector === '.slide') return mockSlideElements;
                return [];
            }
        };

        // Use Sinon's fake timers
        clock = sinon.useFakeTimers();

        slideshowModule = await import('../slideshow.js');
    });

    afterEach(() => {
        delete global.document;
        clock.restore();
        sinon.restore();
    });

    it('startSlideshow should show the slideshow and first slide, then cycle through slides', function(done) {
        const onCompleteSpy = sinon.spy();
        slideshowModule.startSlideshow(onCompleteSpy);

        // Initial state
        expect(mockSlideshowElement.classList.remove.calledWith('hidden')).to.be.true;
        expect(mockSlideshowElement.classList.add.calledWith('active')).to.be.true;
        expect(mockSlideElements[0].classList.add.calledWith('active')).to.be.true;

        // Advance time for first slide duration (6s)
        clock.tick(6000);
        expect(mockSlideElements[0].classList.remove.calledWith('active')).to.be.true;
        expect(mockSlideElements[1].classList.add.calledWith('active')).to.be.true;

        // Advance time for second slide duration
        clock.tick(6000);
        expect(mockSlideElements[1].classList.remove.calledWith('active')).to.be.true;

        // Slideshow ends
        expect(mockSlideshowElement.classList.remove.calledWith('active')).to.be.true;
        expect(mockSlideshowElement.classList.add.calledWith('hidden')).to.be.true;
        expect(onCompleteSpy.calledOnce).to.be.true;

        done(); // For async nature of clock.tick if it were real async
    });
});