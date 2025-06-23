import { app, BrowserWindow, Menu, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let isDev = process.argv.includes('--dev');

function createWindow() {
    // Create the browser window
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, '../Media/UI/icon.png'),
        title: 'RPG Battle',
        show: false // Don't show until ready
    });

    // Load the index.html file
    const indexPath = path.join(__dirname, '../index.html');
    mainWindow.loadFile(indexPath);

    // Show window when ready to prevent visual flash
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        
        // Open DevTools in development mode
        if (isDev) {
            mainWindow.webContents.openDevTools();
        }
    });

    // Handle window closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Handle external links
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        // Open external links in default browser
        import('electron').then(({ shell }) => {
            shell.openExternal(url);
        });
        return { action: 'deny' };
    });
}

// Create menu template
function createMenu() {
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'New Game',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        mainWindow.webContents.send('menu-new-game');
                    }
                },
                {
                    label: 'Load Game',
                    accelerator: 'CmdOrCtrl+O',
                    click: () => {
                        mainWindow.webContents.send('menu-load-game');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Exit',
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'close' }
            ]
        }
    ];

    // Add macOS-specific menu items
    if (process.platform === 'darwin') {
        template.unshift({
            label: app.getName(),
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideOthers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        });
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// App event handlers
app.whenReady().then(() => {
    createWindow();
    createMenu();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPC handlers for save/load functionality
ipcMain.handle('save-game', async (event, saveData) => {
    try {
        const savePath = path.join(app.getPath('userData'), 'saves');
        
        // Ensure saves directory exists
        if (!fs.existsSync(savePath)) {
            fs.mkdirSync(savePath, { recursive: true });
        }

        const fileName = `save_${Date.now()}.json`;
        const filePath = path.join(savePath, fileName);
        
        fs.writeFileSync(filePath, JSON.stringify(saveData, null, 2));
        
        return { success: true, filePath };
    } catch (error) {
        console.error('Save error:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('load-game', async (event) => {
    try {
        const savePath = path.join(app.getPath('userData'), 'saves');
        
        if (!fs.existsSync(savePath)) {
            return { success: false, error: 'No saves directory found' };
        }

        const files = fs.readdirSync(savePath)
            .filter(file => file.endsWith('.json'))
            .map(file => ({
                name: file,
                path: path.join(savePath, file),
                date: fs.statSync(path.join(savePath, file)).mtime
            }))
            .sort((a, b) => b.date - a.date);

        return { success: true, saves: files };
    } catch (error) {
        console.error('Load error:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('load-save-file', async (event, filePath) => {
    try {
        const saveData = fs.readFileSync(filePath, 'utf8');
        return { success: true, data: JSON.parse(saveData) };
    } catch (error) {
        console.error('Load file error:', error);
        return { success: false, error: error.message };
    }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    dialog.showErrorBox('Error', 'An unexpected error occurred. Please restart the application.');
}); 