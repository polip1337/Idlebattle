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
        this.visitedScreens = JSON.parse(localStorage.getItem('visitedScreens') || '{}');
        this.createOverlayContainer();
        this.setupEventListeners();
    }

    createOverlayContainer() {
        this.overlayContainer = document.createElement('div');
        this.overlayContainer.className = 'tutorial-overlay hidden';
        this.overlayContainer.innerHTML = '<img src="" alt="Tutorial Overlay">';
        document.body.appendChild(this.overlayContainer);
    }

    setupEventListeners() {
        this.overlayContainer.addEventListener('click', () => {
            this.hideOverlay();
        });
    }

    showOverlay(screenId) {
        if (!TUTORIAL_SCREENS[screenId]) return;
        
        const screen = TUTORIAL_SCREENS[screenId];
        if (this.visitedScreens[screenId]) return;

        const img = this.overlayContainer.querySelector('img');
        img.src = screen.image;
        this.overlayContainer.classList.remove('hidden');
        
        // Mark screen as visited
        this.visitedScreens[screenId] = true;
        localStorage.setItem('visitedScreens', JSON.stringify(this.visitedScreens));
    }

    hideOverlay() {
        this.overlayContainer.classList.add('hidden');
    }

    checkAndShowTutorial(screenId) {
        if (!this.visitedScreens[screenId]) {
            this.showOverlay(screenId);
        }
    }
}

// Create and export the tutorial overlay instance
const tutorialOverlay = new TutorialOverlay();
export default tutorialOverlay; 