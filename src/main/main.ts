import { app, BrowserWindow, ipcMain, dialog, Menu } from 'electron';
import * as path from 'path';
import * as fs from 'fs-extra';
import Store from 'electron-store';

const store = new Store();

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    // icon: path.join(__dirname, '../assets/icon.png'), // Icon disabled for development
    titleBarStyle: 'default',
    show: false,
  });

  // Load the app
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools(); // Commented out to not open dev tools by default
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create menu template
const template: Electron.MenuItemConstructorOptions[] = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Open Vehicle Folder',
        accelerator: 'CmdOrCtrl+O',
        click: async () => {
          const result = await dialog.showOpenDialog(mainWindow!, {
            properties: ['openDirectory'],
            title: 'Select Vehicle Folder'
          });
          
          if (!result.canceled && result.filePaths.length > 0) {
            mainWindow?.webContents.send('vehicle-folder-selected', result.filePaths[0]);
          }
        }
      },
      {
        label: 'Save carcols.meta',
        accelerator: 'CmdOrCtrl+S',
        click: () => {
          mainWindow?.webContents.send('save-carcols');
        }
      },
      {
        type: 'separator'
      },
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
      { role: 'undo', label: 'Undo' },
      { role: 'redo', label: 'Redo' },
      { type: 'separator' },
      { role: 'cut', label: 'Cut' },
      { role: 'copy', label: 'Copy' },
      { role: 'paste', label: 'Paste' }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload', label: 'Reload' },
      { role: 'forceReload', label: 'Force Reload' },
      { role: 'toggleDevTools', label: 'Toggle Developer Tools' },
      { type: 'separator' },
      { role: 'resetZoom', label: 'Actual Size' },
      { role: 'zoomIn', label: 'Zoom In' },
      { role: 'zoomOut', label: 'Zoom Out' },
      { type: 'separator' },
      { role: 'togglefullscreen', label: 'Toggle Fullscreen' }
    ]
  }
];

if (process.platform === 'darwin') {
  template.unshift({
    label: app.getName(),
    submenu: [
      { role: 'about', label: 'About SirenX Desktop' },
      { type: 'separator' },
      { role: 'services', label: 'Services' },
      { type: 'separator' },
      { role: 'hide', label: 'Hide SirenX Desktop' },
      { role: 'hideOthers', label: 'Hide Others' },
      { role: 'unhide', label: 'Show All' },
      { type: 'separator' },
      { role: 'quit', label: 'Quit SirenX Desktop' }
    ]
  });
}

app.whenReady().then(() => {
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  
  createWindow();

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

// IPC handlers for file operations
ipcMain.handle('trigger-folder-selection', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow!, {
      properties: ['openDirectory'],
      title: 'Select Vehicle Folder'
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
      mainWindow?.webContents.send('vehicle-folder-selected', result.filePaths[0]);
    }
    return { success: true };
  } catch (error) {
    console.error('Error in folder selection:', error);
    throw error;
  }
});

ipcMain.handle('read-vehicle-folder', async (event, folderPath: string) => {
  try {
    const files = await fs.readdir(folderPath);
    const vehicleData: any = {
      folderPath,
      files: [],
      carcols: null,
      models: []
    };

    // Recursive function to scan directories for vehicle files
    const scanDirectory = async (dirPath: string, relativePath: string = '') => {
      const items = await fs.readdir(dirPath);
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const relativeItemPath = path.join(relativePath, item);
        const stats = await fs.stat(fullPath);
        
        if (stats.isFile()) {
          if (item.toLowerCase() === 'carcols.meta') {
            const content = await fs.readFile(fullPath, 'utf8');
            vehicleData.carcols = content;
          } else if (item.toLowerCase().endsWith('.yft') || item.toLowerCase().endsWith('.ytd')) {
            vehicleData.models.push({
              name: item,
              path: fullPath,
              type: path.extname(item).toLowerCase(),
              relativePath: relativeItemPath.replace(/\//g, '\\') // Convert to Windows path
            });
            console.log('Found vehicle model:', relativeItemPath);
          }
          
          vehicleData.files.push({
            name: item,
            path: fullPath,
            size: stats.size,
            isDirectory: false,
            relativePath: relativeItemPath.replace(/\//g, '\\') // Convert to Windows path
          });
        } else if (stats.isDirectory()) {
          // Recursively scan subdirectories (especially 'stream' folder)
          await scanDirectory(fullPath, relativeItemPath);
          
          vehicleData.files.push({
            name: item,
            path: fullPath,
            size: 0,
            isDirectory: true,
            relativePath: relativeItemPath.replace(/\//g, '\\') // Convert to Windows path
          });
        }
      }
    };

    // Start scanning from the root vehicle folder
    await scanDirectory(folderPath);
    
    console.log('Vehicle folder scan complete. Found models:', vehicleData.models.length);
    console.log('Models found:', vehicleData.models.map((m: any) => m.relativePath || m.name));
    
    return vehicleData;
  } catch (error) {
    console.error('Error reading vehicle folder:', error);
    throw error;
  }
});

ipcMain.handle('save-carcols', async (event, content: string, folderPath: string) => {
  try {
    const filePath = path.join(folderPath, 'carcols.meta');
    await fs.writeFile(filePath, content, 'utf8');
    return { success: true, filePath };
  } catch (error) {
    console.error('Error saving carcols.meta:', error);
    throw error;
  }
});

ipcMain.handle('get-app-settings', () => {
  return store.get('settings', {});
});

ipcMain.handle('save-app-settings', (event, settings: any) => {
  store.set('settings', settings);
  return { success: true };
});
