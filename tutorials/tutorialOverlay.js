import mapTour from './mapTour.js';
import combatTour from './combatTour.js';
import partyTour from './partyTour.js';
// Tutorial overlay configuration
const TUTORIAL_SCREENS = {
    'map': {
        image: 'Media/tutorial/map_tutorial.png',
        element: 'map'
    },
    'party': {
        image: 'Media/tutorial/party_tutorial.png',
        element: 'heroContent'
    },
    'companions': {
        image: 'Media/tutorial/companions_tutorial.png',
        element: 'heroCompanions'
    },
    'battle': {
        image: 'Media/tutorial/battle_tutorial.png',
        element: 'battlefield'
    }
};

class TutorialOverlay {
    constructor() {
        this.visitedScreens = {};
    }

    showOverlay(screenId) {
        if (!TUTORIAL_SCREENS[screenId]) return;
        
        if (this.visitedScreens[screenId]) return;

        // Start appropriate tour based on screen
        if (screenId === 'battle') {
            combatTour.startTour();
        } else if (screenId === 'party') {
            partyTour.startTour();
        } else {
            mapTour.startTour();
        }

        this.visitedScreens[screenId] = true;
    }

    hideOverlay() {
        this.overlayContainer.classList.add('hidden');
    }
    checkAndShowTutorial(screenId) {
        if (!this.visitedScreens[screenId]) {
            this.showOverlay(screenId);
        }
    }
    // New methods for save/load integration
    getSerializableData() {
        return {
            visitedScreens: this.visitedScreens
        };
    }

    loadFromData(data) {
        if (data && data.visitedScreens) {
            this.visitedScreens = data.visitedScreens;
        }
    }

    reset() {
        this.visitedScreens = {};
    }
}

// Create and export the tutorial overlay instance
const tutorialOverlay = new TutorialOverlay();
export default tutorialOverlay; 