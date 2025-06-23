import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // Save/Load functionality
    saveGame: (saveData) => ipcRenderer.invoke('save-game', saveData),
    loadGame: () => ipcRenderer.invoke('load-game'),
    loadSaveFile: (filePath) => ipcRenderer.invoke('load-save-file', filePath),
    
    // Menu events
    onMenuNewGame: (callback) => ipcRenderer.on('menu-new-game', callback),
    onMenuLoadGame: (callback) => ipcRenderer.on('menu-load-game', callback),
    
    // Remove listeners
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
    
    // Platform info
    platform: process.platform,
    
    // App info
    appVersion: process.versions.electron,
    nodeVersion: process.versions.node,
    chromeVersion: process.versions.chrome
});

// Handle window focus events
window.addEventListener('focus', () => {
    // Notify the main process that the window is focused
    ipcRenderer.send('window-focused');
});

// Handle window blur events
window.addEventListener('blur', () => {
    // Notify the main process that the window is blurred
    ipcRenderer.send('window-blurred');
});

// Prevent context menu in production
if (!process.argv.includes('--dev')) {
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
} 