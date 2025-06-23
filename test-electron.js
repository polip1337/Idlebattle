// Simple test to verify Electron integration
console.log('Testing Electron integration...');

// Check if running in Electron
if (typeof window !== 'undefined' && window.electronAPI) {
    console.log('✅ Running in Electron mode');
    console.log('Platform:', window.electronAPI.platform);
    console.log('Electron version:', window.electronAPI.appVersion);
    console.log('Node version:', window.electronAPI.nodeVersion);
    console.log('Chrome version:', window.electronAPI.chromeVersion);
    
    // Test save/load functionality
    const testSaveData = {
        timestamp: new Date().toISOString(),
        test: true,
        data: 'Test save data'
    };
    
    window.electronAPI.saveGame(testSaveData)
        .then(result => {
            if (result.success) {
                console.log('✅ Save test successful:', result.filePath);
            } else {
                console.error('❌ Save test failed:', result.error);
            }
        })
        .catch(error => {
            console.error('❌ Save test error:', error);
        });
        
} else {
    console.log('🌐 Running in browser mode');
}

console.log('Electron integration test complete'); 