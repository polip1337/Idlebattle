# RPG Battle - Electron Desktop App

This is the desktop version of RPG Battle wrapped with Electron.js.

## Features

- **Cross-platform**: Runs on Windows, macOS, and Linux
- **Native desktop experience**: Full window management, menus, and system integration
- **Enhanced save system**: Saves to local file system instead of browser storage
- **Offline play**: No internet connection required
- **Native performance**: Better performance than browser version

## Development Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run in development mode:
```bash
npm run dev
```

This will start the app with DevTools open for debugging.

### Production Build

Build for your current platform:
```bash
npm run build
```

Build for specific platforms:
```bash
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

## File Structure

```
electron/
├── main.js          # Main Electron process
└── preload.js       # Preload script for secure IPC

Media/UI/
└── icon.png         # App icon (replace with your own)

package.json         # Updated with Electron scripts and build config
```

## Key Changes from Browser Version

### Save/Load System
- **Browser**: Uses localStorage
- **Electron**: Uses local file system in user data directory
- **Compatibility**: Save files are not compatible between browser and desktop versions

### Menu Integration
- Native desktop menus with keyboard shortcuts
- File menu: New Game (Ctrl+N), Load Game (Ctrl+O), Exit (Ctrl+Q)
- View menu: DevTools, zoom controls, fullscreen

### Security
- Context isolation enabled
- Node integration disabled
- Secure IPC communication between processes

## Development Workflow

### Adding New Features
1. Develop and test in browser first
2. Test in Electron development mode
3. Ensure compatibility with both platforms
4. Build and test production version

### Debugging
- Use `npm run dev` for development with DevTools
- Check main process logs in terminal
- Use `console.log()` in renderer process (visible in DevTools)

### Platform-Specific Considerations
- **Windows**: Uses NSIS installer
- **macOS**: Uses DMG installer, requires code signing for distribution
- **Linux**: Uses AppImage format

## Building for Distribution

### Windows
```bash
npm run build:win
```
Output: `dist/RPG Battle Setup.exe`

### macOS
```bash
npm run build:mac
```
Output: `dist/RPG Battle.dmg`

### Linux
```bash
npm run build:linux
```
Output: `dist/RPG Battle.AppImage`

## Customization

### App Icon
Replace `Media/UI/icon.png` with your own icon:
- Recommended size: 256x256 pixels
- Format: PNG
- For Windows: Also create `icon.ico`
- For macOS: Also create `icon.icns`

### App Metadata
Edit `package.json`:
- `name`: App name
- `description`: App description
- `author`: Your name
- `build.appId`: Unique app identifier

### Window Settings
Modify `electron/main.js`:
- Window size and position
- Minimum window size
- Window title and icon

## Troubleshooting

### Common Issues

1. **App won't start**
   - Check Node.js version (v16+ required)
   - Reinstall dependencies: `npm install`
   - Check console for error messages

2. **Save/Load not working**
   - Ensure file permissions in user data directory
   - Check if running in Electron mode: `console.log(window.electronAPI)`

3. **Build fails**
   - Ensure all dependencies are installed
   - Check platform-specific requirements
   - Verify icon files exist

4. **Performance issues**
   - Disable DevTools in production
   - Check for memory leaks in renderer process
   - Optimize asset loading

### Getting Help
- Check Electron documentation: https://www.electronjs.org/docs
- Review build configuration in `package.json`
- Test in development mode first

## Future Development

### Potential Enhancements
- Auto-updater integration
- Crash reporting
- Analytics (with user consent)
- Cloud save sync
- Steam integration
- Native notifications

### Migration Considerations
- Save file format changes
- Asset optimization for desktop
- Performance monitoring
- User experience improvements

## License

Same as the main project. See LICENSE file for details. 