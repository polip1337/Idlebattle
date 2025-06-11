import { openTab } from './navigation.js';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

class MapTour {
    constructor() {
        this.driver = null;
        this.steps = [
            {
                element: '#hero-portrait-container',
                popover: {
                    title: 'Hero Portrait',
                    description: 'This shows your character\'s current status and appearance.',
                    position: 'right'
                }
            },
            {
                element: '#hero-map-gold-display',
                popover: {
                    title: 'Gold Display',
                    description: 'Your current gold amount is shown here.',
                    position: 'right'
                }
            },
            {
                element: '#hero-map-exp-bars-container',
                popover: {
                    title: 'Experience Bars',
                    description: 'Track your progress in each class here. Each bar shows your current level and experience.',
                    position: 'right'
                }
            },
            {
                element: '#gridContainer',
                popover: {
                    title: 'Navigation Menu',
                    description: 'Quick access to different game sections like Party, Map, Library, and more.',
                    position: 'right'
                }
            },
            {
                element: '#map-container',
                popover: {
                    title: 'Map View',
                    description: 'The main map area where you can explore different locations and points of interest.',
                    position: 'left'
                }
            },
            {
                element: '#poi-list-container',
                popover: {
                    title: 'Points of Interest',
                    description: 'A list of all available locations on the current map.',
                    position: 'left'
                }
            }
        ];
    }


    startTour() {
        if (!this.driver) {
            console.error('Driver.js not initialized');
            return;
        }

        // Ensure we're on the map tab
        openTab(null, 'map');

        // Create driver instance with custom styling
        const driverObj = this.driver.driver({
            animate: true,
            showProgress: true,
            showButtons: ['next', 'previous', 'close'],
            stagePadding: 0,
            overlayColor: 'rgba(0, 0, 0, 0.75)',
            onHighlightStarted: (element) => {
                // Add any additional highlighting effects here
                element.style.zIndex = '1000';
            },
            onDeselected: (element) => {
                // Reset any additional highlighting effects
                element.style.zIndex = '';
            }
        });

        // Start the tour
        driverObj.setSteps(this.steps);
        driverObj.start();
    }
}

// Create and export the map tour instance
const mapTour = new MapTour();
export default mapTour; 