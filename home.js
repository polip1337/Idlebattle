import { openTab } from './navigation.js';
import { loadGameData } from './initialize.js'; // Correct path
import { startSlideshow } from './slideshow.js';
import { openLoadModal } from './saveLoad.js'; // For Load Game button

export function initializeHomeScreen() {
    const homeScreen = document.getElementById('home-screen');
    const newGameButton = document.getElementById('new-game');
    const loadGameButton = document.getElementById('load-game');
    const optionsButton = document.getElementById('options'); // Assuming you have an options tab
    const exitButton = document.getElementById('exit');
    const homeNavButton = document.getElementById('homeNavButton');

    function hideHomeScreenAndShowFooter() {
        homeScreen.classList.remove('active');
        homeScreen.classList.add('hidden');
        document.getElementById('footer').classList.remove('hidden');
    }

    newGameButton.addEventListener('click', async () => {
        // No need to hide home screen here, slideshow will cover it.
        // loadGameData(null) will eventually hide it after slideshow.
        startSlideshow(async () => {
            await loadGameData(null); // Start new game after slideshow
            hideHomeScreenAndShowFooter();
            openTab({ currentTarget: document.getElementById('mapNavButton') }, 'map');

        });
    });

    loadGameButton.addEventListener('click', () => {
        openLoadModal(); // This will handle game loading and navigation
        // No need to hide home screen here, openLoadModal handles flow.
        // If a game is successfully loaded from the modal, `initialize.js` `loadGameData`
        // will then hide the home screen and open the map tab.
    });

    optionsButton.addEventListener('click', () => {
        hideHomeScreenAndShowFooter();
        openTab({ currentTarget: document.getElementById('optionsNavButton') }, 'options');
    });

    exitButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to exit?')) {
            window.close(); // Note: This may not work in all browsers
        }
    });

    homeNavButton.addEventListener('click', () => {
        homeScreen.classList.add('active');
        homeScreen.classList.remove('hidden');
        document.getElementById('footer').classList.add('hidden');
        const tabContents = document.getElementsByClassName('tabcontent');
        for (let content of tabContents) {
            content.classList.remove('active');
        }
        const tabLinks = document.getElementsByClassName('tablinks');
        for (let link of tabLinks) {
            link.classList.remove('active');
        }
        homeNavButton.classList.add('active');
    });
}