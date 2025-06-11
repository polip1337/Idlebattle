import { openTab } from '../navigation.js';

class PartyTour {
    constructor() {
        this.steps = [
            {
                element: '#heroContent',
                popover: {
                    title: 'Party Management',
                    description: 'This is where you can manage your character and view their stats, equipment, and skills.',
                    position: 'bottom'
                }
            },
            {
                element: '#heroPortraitAndPaperDoll',
                popover: {
                    title: 'Character Portrait & Equipment',
                    description: 'View your character\'s portrait and manage their equipment slots. Each slot can hold different types of gear. Drag and drop from the inventory to equip.',
                    position: 'right'
                }
            },
            {
                element: '#heroClasses',
                popover: {
                    title: 'Class System',
                    description: 'Your character can learn up to three different classes. Each class provides unique abilities and stat bonuses. Level up your classes to unlock new skills.',
                    position: 'left'
                }
            },
            {
                element: '#heroMainStatsSkills',
                popover: {
                    title: 'Stats & Skills',
                    description: 'View your character\'s core attributes and manage their active and passive skills. Active skills are used in combat, while passive skills provide constant benefits. Skills with a green border are selected and available in combat.'
                    +'You have more skills than slots so pick carefully.',
                    position: 'top'
                }
            },
            {
                element: '#hero-sub-tabs',
                popover: {
                    title: 'Sub tabs',
                    description: 'Here you can switch between viewing your stats or managing companions. You can have up to 7 companions in your active party. Arrange them in formation to optimize combat effectiveness.',
                    position: 'bottom'
                }
            },
            {
                element: '#inventory',
                popover: {
                    title: 'Inventory',
                    description: 'Store and manage your items here. Equip gear, use consumables, and organize your belongings. Your inventory can hold up to 20 items.',
                    position: 'left'
                }
            },
            {
                element: '#bottomContainer',
                popover: {
                    title: 'Skillbar',
                    description: 'This is a preview of your skillbar. You can see the order of your skills here. Click on skills in the active/passive window above to select/deselect them. If a skill has a green border, it means it will automatically trigger when off cooldown, while in combat. A bit of automation for you.',
                    position: 'top'
                }
            },
            {
                element: '#battleConsumableBar',
                popover: {
                    title: 'Consumables',
                    description: 'You can set up to 3 consumable items for combat here. Drag and drop from the inventory to equip. Use them by clicking on them. You can also use the items directly from the inventory, when youre out of combat.',
                     position: 'top'
                }
            }
        ];
    }

    startTour() {
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

// Create and export the party tour instance
const partyTour = new PartyTour();
export default partyTour; 