import { togglePause } from '../initialize.js';

class CombatTour {
    constructor() {
        this.steps = [
            {
                element: '#teamAndBattleContainer',
                popover: {
                    title: 'Combat Arena',
                    description: 'This is where the battle takes place. Watch your party members and enemies fight in real-time. You can use space to pause the game.',
                    position: 'bottom'
                }
            },
            {
                element: '#team2',
                popover: {
                    title: 'Enemy team',
                    description: 'This is the enemy team. It consist from up to 8 enemies. There are 4 in the front row and 4 in the back row. You target different enemies using automatic targeting modes you select in the party screen.',
                    position: 'left'
                }
            },
            {
                element: '#team2-member0',
                popover: {
                    title: 'Enemy team',
                    description: 'This is a single enemy. You can see their mana, stamina and skills here. Enemies start with all skills on cooldown. Once the cooldown is over, they will use their skills. When they take damage the portrait will turn red.',
                    position: 'left'
                }
            },
            
            {
                element: '#team1',
                popover: {
                    title: 'Party Formation',
                    description: 'Your party members\' positions in combat. You can rearange them in the party screen.',
                    position: 'right'
                }
            },
            {
                element: '#team1-member0',
                popover: {
                    title: 'Hero',
                    description: 'Your character. He has no skills since they are displayed at the bottom of the screen.',
                    position: 'right'
                }
            },
            {
                element: '#stage-controls',
                popover: {
                    title: 'Combat Controls',
                    description: 'Display how many stages this combat encounter will have. You need to beat all stages to win. You can flee combat from here, though it is not guaranteed, it depends on your and the enemies speed.',
                    position: 'top'
                }
            },
            {
                element: '#battle-log-container',
                popover: {
                    title: 'Combat Log',
                    description: 'Detailed information about what\'s happening in the battle. Check here for damage numbers, status effects, and special events.',
                    position: 'left'
                }
            },
            {
                element: '#footer',
                popover: {
                    title: 'Abilities',
                    description: 'Your characters skills. Click to use them in combat. You can also use the number keys to trigger them. If you click twice a skill will be set on auto-cast, it is signified by a green border. You select the skills in the party screen.',
                    position: 'top'
                }
            },
            {
                element: '#battleConsumableBar',
                popover: {
                    title: 'Consumables',
                    description: 'Your selected consumables, click to consume. You select them in the party screen.',
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
            },
            onDestroyed: () => {
                // Unpause the battle when the tour ends
                togglePause();
            }
        });

        // Pause the battle before starting the tour
        togglePause();

        // Start the tour
        driverObj.setSteps(this.steps);
        driverObj.drive();
    }
}

// Create and export the combat tour instance
const combatTour = new CombatTour();
export default combatTour; 