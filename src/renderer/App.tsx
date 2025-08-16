import React, { useEffect, useState } from 'react';
import { VehicleViewer } from './components/VehicleViewer';
import { LightingEditor } from './components/LightingEditor';
import { FileManager } from './components/FileManager';
import { Logo } from './components/Logo';
import { useVehicleStore } from './stores/vehicleStore';
import { useLightingStore } from './stores/lightingStore';
import './App.css';

function App() {
  const [currentVehicle, setCurrentVehicle] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { setVehicleData } = useVehicleStore();
  const { setLightingData, loadFromCarcols } = useLightingStore();

  useEffect(() => {
    // Listen for vehicle folder selection from main process
    window.electronAPI.onVehicleFolderSelected(async (folderPath: string) => {
      try {
        setIsLoading(true);
        const vehicleData = await window.electronAPI.readVehicleFolder(folderPath);
        setCurrentVehicle(vehicleData);
        setVehicleData(vehicleData);
        
        // Parse carcols.meta if it exists
        if (vehicleData.carcols) {
          console.log('Carcols data loaded:', vehicleData.carcols);
          
          try {
            // Parse the carcols.meta content and load lighting configuration
            const success = loadFromCarcols(vehicleData.carcols);
            if (success) {
              console.log('Successfully loaded lighting configuration from carcols.meta');
            } else {
              console.warn('Failed to load lighting configuration from carcols.meta - using defaults');
            }
          } catch (carcolsError) {
            console.warn('Error parsing carcols.meta, using default lighting configuration:', carcolsError);
            // Don't show alert for carcols parsing errors - just use defaults
          }
        } else {
          console.log('No carcols.meta found in vehicle folder - using default lighting configuration');
        }
        
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.error('Error loading vehicle folder:', error);
        // Only show alert for critical folder loading errors
        if (error instanceof Error && error.message.includes('ENOENT')) {
          alert('Vehicle folder not found. Please check the folder path and try again.');
        } else if (error instanceof Error && error.message.includes('EACCES')) {
          alert('Access denied to vehicle folder. Please check permissions and try again.');
        } else {
          console.error('Non-critical error during vehicle loading:', error);
          // Continue loading with available data instead of showing alert
        }
      }
    });

    // Listen for save request from main process
    window.electronAPI.onSaveCarcols(() => {
      // TODO: Implement save functionality
      console.log('Save carcols requested');
    });

    // Cleanup listeners on unmount
    return () => {
      window.electronAPI.removeAllListeners('vehicle-folder-selected');
      window.electronAPI.removeAllListeners('save-carcols');
    };
  }, [setVehicleData, loadFromCarcols]);

  if (!currentVehicle) {
    return (
      <div className="app-container">
        <div className="welcome-screen">
          {/* Background Logo */}
          <Logo size="large" isBackground={true} />
          
          {/* Content Overlay */}
          <div className="welcome-content">
            <p className="welcome-subtitle">3D Car Lighting Pattern Editor</p>
            <div className="welcome-actions">
              <button 
                className="btn-primary"
                onClick={() => {
                  // Trigger folder selection dialog through main process
                  window.electronAPI.triggerFolderSelection();
                }}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Open Vehicle Folder'}
              </button>
              <p className="welcome-hint">
                Use File → Open Vehicle Folder or press Ctrl+O
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Debug logging
  console.log('Rendering main interface with vehicle:', currentVehicle);
  console.log('Vehicle data:', currentVehicle);

  return (
    <div className="app-container">
      {/* Background Logo */}
      <Logo size="large" isBackground={true} />
      
      <header className="app-header">
        <div className="header-logo">
          <h1>SirenX Desktop - {currentVehicle.folderPath.split('\\').pop()}</h1>
        </div>
        <div className="header-actions">
          <button 
            className="btn-secondary"
            onClick={() => setCurrentVehicle(null)}
          >
            Close Vehicle
          </button>
        </div>
      </header>
      
      <main className="app-main">
        <div className="left-panel">
          <FileManager vehicle={currentVehicle} />
        </div>
        
        <div className="center-panel">
          <LightingEditor vehicle={currentVehicle} />
        </div>
        
        <div className="right-panel">
          <VehicleViewer vehicle={currentVehicle} />
        </div>
      </main>
    </div>
  );
}

export default App;
