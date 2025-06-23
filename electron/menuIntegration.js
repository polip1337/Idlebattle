// Menu integration helper for Electron
// This file helps connect Electron menu events to the existing game functions

export function setupMenuIntegration() {
    // Check if running in Electron
    if (typeof window !== 'undefined' && window.electronAPI) {
        console.log('Setting up Electron menu integration...');
        
        // Import game functions dynamically to avoid circular dependencies
        import('../saveLoad.js').then(({ openSaveModal, openLoadModal }) => {
            // Handle New Game menu item
            window.electronAPI.onMenuNewGame(() => {
                console.log('New Game triggered from menu');
                // Trigger new game - you may need to adjust this based on your game's structure
                const newGameButton = document.getElementById('new-game');
                if (newGameButton) {
                    newGameButton.click();
                }
            });
            
            // Handle Load Game menu item
            window.electronAPI.onMenuLoadGame(() => {
                console.log('Load Game triggered from menu');
                openLoadModal();
            });
        }).catch(error => {
            console.error('Failed to setup menu integration:', error);
        });
        
        // Clean up listeners when page unloads
        window.addEventListener('beforeunload', () => {
            window.electronAPI.removeAllListeners('menu-new-game');
            window.electronAPI.removeAllListeners('menu-load-game');
        });
    }
}

// Auto-setup when this module is imported
setupMenuIntegration(); 