import { openTab } from '../navigation.js';
// driver is now available globally from the CDN script

class MapTour {
    constructor() {
        this.steps = [
            {
                element: '#hero-portrait-container',
                popover: {
                    title: 'Your status',
                    description: 'This shows your current status: health, mana, and stamina.',
                    position: 'right'
                }
            },
            {
                element: '#map-container',
                popover: {
                    title: 'Map',
                    description: 'Move around the map by clicking on the different locations. Yellow nodes are dialogue, red nodes are combat, and blue nodes are travel.',
                    position: 'right'
                }
            },
            {
                element: '#poi-list-container',
                popover: {
                    title: 'Node list',
                    description: 'You can also see a list of all the nodes on the map here.',
                    position: 'right'
                }
            },
            {
                element: '#heroContentNavButton',
                
                popover: {
                    title: 'Party manager',
                    description: 'Lets you display your exact stats and equipment. Used to manage companions and the formation of your party. You will learn more when you click on it.',
                    position: 'right'
                }
            },
            {
                element: '#libraryNavButton',
                popover: {
                    title: 'Library',
                    description: 'The sum total of your knowledge. Very WIP.',
                    position: 'right'
                }
            },
            {
                element: '#gridContainer',
                popover: {
                    title: 'Map View',
                    description: 'Quick access to different game sections. Basically what it says on the label.',
                    position: 'left'
                }
            }
        ];
    }

    startTour() {
        // Ensure we're on the map tab
const driver = window.driver.js.driver;

        // Create driver instance with custom styling
        const driverObj = driver({
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
        driverObj.drive();
    }
}

// Create and export the map tour instance
const mapTour = new MapTour();
export default mapTour; 