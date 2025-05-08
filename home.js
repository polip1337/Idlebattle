import { openTab } from './navigation.js';
import { loadGameData } from './initialize.js';
import { startSlideshow } from './slideshow.js';

export function initializeHomeScreen() {
    const homeScreen = document.getElementById('home-screen');
    const newGameButton = document.getElementById('new-game');
    const loadGameButton = document.getElementById('load-game');
    const optionsButton = document.getElementById('options');
    const exitButton = document.getElementById('exit');
    const homeNavButton = document.getElementById('homeNavButton');

    function hideHomeScreen() {
        homeScreen.classList.remove('active');
        homeScreen.classList.add('hidden');
        document.getElementById('footer').classList.remove('hidden');
    }

    newGameButton.addEventListener('click', () => {
        hideHomeScreen();
        startSlideshow(() => {
            openTab({ currentTarget: document.getElementById('mapNavButton') }, 'map');
        });
    });

    loadGameButton.addEventListener('click', () => {
        // Placeholder for load game logic
        alert('Load Game functionality not implemented yet.');
        // Future: Load saved game state from localStorage or a file
        // hideHomeScreen();
        // loadGameData();
        // openTab({ currentTarget: document.getElementById('battlefieldNavButton') }, 'battlefield');
    });

    optionsButton.addEventListener('click', () => {
        hideHomeScreen();
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