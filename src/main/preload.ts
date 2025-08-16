import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  readVehicleFolder: (folderPath: string) => ipcRenderer.invoke('read-vehicle-folder', folderPath),
  saveCarcols: (content: string, folderPath: string) => ipcRenderer.invoke('save-carcols', content, folderPath),
  triggerFolderSelection: () => ipcRenderer.invoke('trigger-folder-selection'),
  
  // Settings
  getAppSettings: () => ipcRenderer.invoke('get-app-settings'),
  saveAppSettings: (settings: any) => ipcRenderer.invoke('save-app-settings', settings),
  
  // Events
  onVehicleFolderSelected: (callback: (folderPath: string) => void) => {
    ipcRenderer.on('vehicle-folder-selected', (event, folderPath) => callback(folderPath));
  },
  
  onSaveCarcols: (callback: () => void) => {
    ipcRenderer.on('save-carcols', () => callback());
  },
  
  // Remove listeners
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  }
});

// Type definitions for TypeScript
declare global {
  interface Window {
    electronAPI: {
      readVehicleFolder: (folderPath: string) => Promise<any>;
      saveCarcols: (content: string, folderPath: string) => Promise<any>;
      triggerFolderSelection: () => Promise<any>;
      getAppSettings: () => Promise<any>;
      saveAppSettings: (settings: any) => Promise<any>;
      onVehicleFolderSelected: (callback: (folderPath: string) => void) => void;
      onSaveCarcols: (callback: () => void) => void;
      removeAllListeners: (channel: string) => void;
    };
  }
}
