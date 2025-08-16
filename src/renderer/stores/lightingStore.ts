import { create } from 'zustand';
import { CarcolsLightingConfig, CarcolsParser } from '../utils/carcolsParser';

export interface LightConfig {
  color: string;
  direction: number;
  multiples: number;
  intensity: number;
  scaleFactor: number;
}

export interface LightingPattern {
  [row: number]: {
    [column: number]: LightConfig;
  };
}

interface LightingStore {
  lightingData: LightingPattern;
  selectedColor: string;
  bpm: number;
  currentRow: number;
  totalColumns: number;
  totalRows: number;
  carcolsConfig: CarcolsLightingConfig | null;
  currentSirenSetting: number;
  
  setLightingData: (data: LightingPattern) => void;
  setSelectedColor: (color: string) => void;
  setBPM: (bpm: number) => void;
  setCurrentRow: (row: number) => void;
  setTotalColumns: (columns: number) => void;
  setTotalRows: (rows: number) => void;
  updateLight: (row: number, column: number, config: Partial<LightConfig>) => void;
  clearLightingData: () => void;
  loadFromCarcols: (xmlContent: string) => boolean;
  loadFromCurrentVehicle: () => boolean;
  convertCarcolsToLightingPattern: (carcolsConfig: CarcolsLightingConfig, sirenSettingId: number) => LightingPattern;
  setCurrentSirenSetting: (settingId: number) => void;
  exportToCarcols: () => string;
}

const defaultLightConfig: LightConfig = {
  color: 'none',
  direction: 0,
  multiples: 1,
  intensity: 3.5,
  scaleFactor: 100,
};

const createDefaultLightingPattern = (rows: number, columns: number): LightingPattern => {
  const pattern: LightingPattern = {};
  for (let row = 0; row < rows; row++) {
    pattern[row] = {};
    for (let col = 0; col < columns; col++) {
      pattern[row][col] = { ...defaultLightConfig };
    }
  }
  return pattern;
};

export const useLightingStore = create<LightingStore>((set, get) => ({
  lightingData: {},
  selectedColor: 'red',
  bpm: 600,
  currentRow: 0,
  totalColumns: 20,
  totalRows: 32,
  carcolsConfig: null,
  currentSirenSetting: 0,
  
  setLightingData: (data) => set({ lightingData: data }),
  setSelectedColor: (color) => set({ selectedColor: color }),
  setBPM: (bpm) => set({ bpm }),
  setCurrentRow: (row) => set({ currentRow: row }),
  setTotalColumns: (columns) => set((state) => {
    // Create new lighting pattern with new column count
    const newLightingData = createDefaultLightingPattern(state.totalRows, columns);
    
    // Preserve existing data for columns that still exist
    Object.keys(state.lightingData).forEach(rowStr => {
      const row = parseInt(rowStr);
      if (row < state.totalRows) {
        Object.keys(state.lightingData[row]).forEach(colStr => {
          const col = parseInt(colStr);
          if (col < columns) {
            newLightingData[row][col] = { ...state.lightingData[row][col] };
          }
        });
      }
    });
    
    return { 
      totalColumns: columns,
      lightingData: newLightingData
    };
  }),
  setTotalRows: (rows) => set({ totalRows: rows }),
  setCurrentSirenSetting: (settingId) => set({ currentSirenSetting: settingId }),
  
  updateLight: (row, column, config) => set((state) => {
    const newLightingData = { ...state.lightingData };
    
    if (!newLightingData[row]) {
      newLightingData[row] = {};
    }
    
    if (!newLightingData[row][column]) {
      newLightingData[row][column] = { ...defaultLightConfig };
    }
    
    newLightingData[row][column] = {
      ...newLightingData[row][column],
      ...config
    };
    
    return { lightingData: newLightingData };
  }),
  
  clearLightingData: () => set((state) => ({
    lightingData: createDefaultLightingPattern(state.totalRows, state.totalColumns)
  })),
  
  loadFromCarcols: (xmlContent: string) => {
    try {
      const carcolsConfig = CarcolsParser.parseCarcolsMeta(xmlContent);
      if (!carcolsConfig) {
        console.warn('Failed to parse carcols.meta');
        return false;
      }
      
      // Update store with carcols data
      set({
        carcolsConfig,
        totalRows: carcolsConfig.totalRows,
        totalColumns: carcolsConfig.totalColumns,
        bpm: carcolsConfig.sirenSettings[0]?.sequencerBpm || 600,
        currentSirenSetting: 0
      });
      
      // Convert carcols data to lighting pattern
      const lightingPattern = get().convertCarcolsToLightingPattern(carcolsConfig, 0);
      set({ lightingData: lightingPattern });
      
      console.log('Successfully loaded carcols.meta:', carcolsConfig);
      return true;
      
    } catch (error) {
      console.error('Error loading carcols.meta:', error);
      return false;
    }
  },

  loadFromCurrentVehicle: () => {
    const state = get();
    console.log('loadFromCurrentVehicle called with state:', {
      hasCarcolsConfig: !!state.carcolsConfig,
      carcolsConfig: state.carcolsConfig,
      currentSirenSetting: state.currentSirenSetting,
      totalRows: state.totalRows,
      totalColumns: state.totalColumns
    });
    
    if (!state.carcolsConfig) {
      console.warn('No carcols config available');
      return false;
    }
    
    // Convert current carcols data to lighting pattern
    const lightingPattern = get().convertCarcolsToLightingPattern(state.carcolsConfig, state.currentSirenSetting);
    console.log('Generated lighting pattern:', lightingPattern);
    
    set({ lightingData: lightingPattern });
    
    console.log('Loaded lighting pattern from current vehicle:', lightingPattern);
    return true;
  },
  
  convertCarcolsToLightingPattern: (carcolsConfig: CarcolsLightingConfig, sirenSettingId: number) => {
    const sirenSetting = carcolsConfig.sirenSettings[sirenSettingId];
    if (!sirenSetting) {
      console.warn('No siren setting found for ID:', sirenSettingId);
      return createDefaultLightingPattern(carcolsConfig.totalRows, carcolsConfig.totalColumns);
    }
    
    console.log('Converting carcols to lighting pattern:', {
      sirenSetting,
      totalRows: carcolsConfig.totalRows,
      totalColumns: carcolsConfig.totalColumns
    });
    
    // Create a grid-based pattern
    const pattern: LightingPattern = {};
    
    // Define the light positions and their grid mapping
    const lightMappings = [
      { name: 'leftHeadlight', row: 0, config: sirenSetting.leftHeadlight },
      { name: 'rightHeadlight', row: 1, config: sirenSetting.rightHeadlight },
      { name: 'leftTailLight', row: 2, config: sirenSetting.leftTailLight },
      { name: 'rightTailLight', row: 3, config: sirenSetting.rightTailLight },
      { name: 'leftIndicator', row: 4, config: sirenSetting.leftIndicator },
      { name: 'rightIndicator', row: 5, config: sirenSetting.rightIndicator },
      { name: 'extra1', row: 6, config: sirenSetting.extra1 },
      { name: 'extra2', row: 7, config: sirenSetting.extra2 },
      { name: 'extra3', row: 8, config: sirenSetting.extra3 },
      { name: 'extra4', row: 9, config: sirenSetting.extra4 },
      { name: 'extra5', row: 10, config: sirenSetting.extra5 },
      { name: 'extra6', row: 11, config: sirenSetting.extra6 },
      { name: 'extra7', row: 12, config: sirenSetting.extra7 },
      { name: 'extra8', row: 13, config: sirenSetting.extra8 },
      { name: 'extra9', row: 14, config: sirenSetting.extra9 },
      { name: 'extra10', row: 15, config: sirenSetting.extra10 },
      { name: 'extra11', row: 16, config: sirenSetting.extra11 },
      { name: 'extra12', row: 17, config: sirenSetting.extra12 },
      { name: 'extra13', row: 18, config: sirenSetting.extra13 },
      { name: 'extra14', row: 19, config: sirenSetting.extra14 },
      { name: 'extra15', row: 20, config: sirenSetting.extra15 },
      { name: 'extra16', row: 21, config: sirenSetting.extra16 },
      { name: 'extra17', row: 22, config: sirenSetting.extra17 },
      { name: 'extra18', row: 23, config: sirenSetting.extra18 },
      { name: 'extra19', row: 24, config: sirenSetting.extra19 },
      { name: 'extra20', row: 25, config: sirenSetting.extra20 },
      { name: 'extra21', row: 26, config: sirenSetting.extra21 },
      { name: 'extra22', row: 27, config: sirenSetting.extra22 },
      { name: 'extra23', row: 28, config: sirenSetting.extra23 },
      { name: 'extra24', row: 29, config: sirenSetting.extra24 },
      { name: 'extra25', row: 30, config: sirenSetting.extra25 },
      { name: 'extra26', row: 31, config: sirenSetting.extra26 },
      { name: 'extra27', row: 32, config: sirenSetting.extra27 },
      { name: 'extra28', row: 33, config: sirenSetting.extra28 },
      { name: 'extra29', row: 34, config: sirenSetting.extra29 },
      { name: 'extra30', row: 35, config: sirenSetting.extra30 },
      { name: 'extra31', row: 36, config: sirenSetting.extra31 },
      { name: 'extra32', row: 37, config: sirenSetting.extra32 },
    ];
    
    // Initialize all rows with default values
    for (let row = 0; row < carcolsConfig.totalRows; row++) {
      pattern[row] = {};
      for (let col = 0; col < carcolsConfig.totalColumns; col++) {
        pattern[row][col] = { ...defaultLightConfig };
      }
    }
    
    // Map active lights to their grid positions
    let activeLightCount = 0;
    lightMappings.forEach((lightMapping) => {
      if (lightMapping.row < carcolsConfig.totalRows && lightMapping.config.color !== 'none') {
        console.log(`Mapping light ${lightMapping.name} at row ${lightMapping.row}:`, lightMapping.config);
        activeLightCount++;
        
        // Convert color to proper hex format if needed
        let color = lightMapping.config.color;
        if (color && color !== 'none') {
          // If color is not already a hex, try to convert common color names
          if (!color.startsWith('#')) {
            const colorMap: { [key: string]: string } = {
              'red': '#FF0000',
              'blue': '#0066FF',
              'white': '#FFFFFF',
              'amber': '#FFB800',
              'purple': '#8000FF',
              'green': '#00FF00',
              'lightblue': '#00FFFF',
              'pink': '#FF00FF'
            };
            color = colorMap[color.toLowerCase()] || color;
          }
        }
        
        // Fill the entire row for this light
        for (let col = 0; col < carcolsConfig.totalColumns; col++) {
          pattern[lightMapping.row][col] = {
            color: color,
            direction: 0, // Default direction
            multiples: 1, // Default multiples
            intensity: lightMapping.config.intensity,
            scaleFactor: 100, // Default scale factor
          };
        }
      }
    });
    
    console.log(`Created pattern with ${activeLightCount} active lights:`, pattern);
    return pattern;
  },
  
  exportToCarcols: () => {
    // TODO: Implement export back to carcols.meta format
    const state = get();
    console.log('Exporting lighting data to carcols format:', state.lightingData);
    return '<!-- Exported carcols.meta content -->';
  }
}));
