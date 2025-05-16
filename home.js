import { openTab } from './navigation.js';
// loadGameData is now exported by initialize.js and passed to saveLoad.js
// For new game, we call it directly.
import { loadGameData } from './initialize.js';
import { startSlideshow } from './slideshow.js';
import { openLoadModal } from './saveLoad.js';

export function initializeHomeScreen() {
    const homeScreen = document.getElementById('home-screen');
    const newGameButton = document.getElementById('new-game');
    const loadGameButton = document.getElementById('load-game');
    const optionsButton = document.getElementById('options');
    const exitButton = document.getElementById('exit');

    function hideHomeScreenAndShowFooter() {
        homeScreen.classList.remove('active');
        homeScreen.classList.add('hidden');
    }

    if (newGameButton) {
        newGameButton.addEventListener('click', async () => {
            startSlideshow(async () => {
            hideHomeScreenAndShowFooter();
                const gameReady = await loadGameData(null); // Start new game (null signifies no saved state)
                if (gameReady) {
                    openTab({ currentTarget: document.getElementById('mapNavButton') }, 'map');
                } else {
                    // Error handling for game not starting (e.g. critical data load failure)
                    // loadGameData should alert the user.
                    console.error("New game initialization failed.");
                    // Optionally, re-show home screen or an error message screen.
                }
            });
        });
    }

    if (loadGameButton) {
        loadGameButton.addEventListener('click', () => {
            openLoadModal();
            // Game loading success (hiding home screen, opening map) is handled by
            // the loadGame function in saveLoad.js calling initialize.js#loadGameData
        });
    }

    if (optionsButton) {
        optionsButton.addEventListener('click', () => {
            hideHomeScreenAndShowFooter();
            openTab({ currentTarget: document.getElementById('optionsNavButton') }, 'options');
        });
    }

    if (exitButton) {
        exitButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to exit?')) {
                window.close();
            }
        });
    }


}