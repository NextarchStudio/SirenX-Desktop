export interface CarcolsLightingConfig {
  vehicleName: string;
  sirenSettings: SirenSetting[];
  totalRows: number;
  totalColumns: number;
}

export interface SirenSetting {
  id: number;
  name: string;
  timeMultiplier: number;
  lightFalloffMax: number;
  lightFalloffExponent: number;
  lightInnerConeAngle: number;
  lightOuterConeAngle: number;
  lightOffset: number;
  textureName: string;
  sequencerBpm: number;
  leftHeadlight: LightConfig;
  rightHeadlight: LightConfig;
  leftTailLight: LightConfig;
  rightTailLight: LightConfig;
  leftIndicator: LightConfig;
  rightIndicator: LightConfig;
  extra1: LightConfig;
  extra2: LightConfig;
  extra3: LightConfig;
  extra4: LightConfig;
  extra5: LightConfig;
  extra6: LightConfig;
  extra7: LightConfig;
  extra8: LightConfig;
  extra9: LightConfig;
  extra10: LightConfig;
  extra11: LightConfig;
  extra12: LightConfig;
  extra13: LightConfig;
  extra14: LightConfig;
  extra15: LightConfig;
  extra16: LightConfig;
  extra17: LightConfig;
  extra18: LightConfig;
  extra19: LightConfig;
  extra20: LightConfig;
  extra21: LightConfig;
  extra22: LightConfig;
  extra23: LightConfig;
  extra24: LightConfig;
  extra25: LightConfig;
  extra26: LightConfig;
  extra27: LightConfig;
  extra28: LightConfig;
  extra29: LightConfig;
  extra30: LightConfig;
  extra31: LightConfig;
  extra32: LightConfig;
}

export interface LightConfig {
  color: string;
  intensity: number;
  falloffMax: number;
  falloffExponent: number;
  innerConeAngle: number;
  outerConeAngle: number;
  offset: number;
  textureName: string;
  sequencerBpm: number;
}

export class CarcolsParser {
  /**
   * Parse carcols.meta XML content and extract lighting configuration
   */
  static parseCarcolsMeta(xmlContent: string): CarcolsLightingConfig | null {
    try {
      // Create a DOM parser
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
      
      // Check for parsing errors
      const parseError = xmlDoc.getElementsByTagName('parsererror');
      if (parseError.length > 0) {
        console.error('XML parsing error:', parseError[0].textContent);
        return null;
      }
      
      // Find the vehicle element - GTA V format
      const vehicleElement = xmlDoc.querySelector('CVehicleModelInfoVarGlobal > Sirens > Item > name');
      if (!vehicleElement) {
        console.warn('No vehicle model found in carcols.meta');
        return null;
      }
      
      const vehicleName = vehicleElement.textContent || 'Unknown Vehicle';
      console.log('Found vehicle:', vehicleName);
      
      // Find siren settings - GTA V format
      const sirenSettings: SirenSetting[] = [];
      const sirenElements = xmlDoc.querySelectorAll('CVehicleModelInfoVarGlobal > Sirens > Item');
      
      sirenElements.forEach((sirenElement, index) => {
        const sirenSetting = this.parseSirenSetting(sirenElement as Element, index);
        if (sirenSetting) {
          sirenSettings.push(sirenSetting);
        }
      });
      
      // Calculate total rows and columns based on siren settings
      const totalRows = Math.max(...sirenSettings.map(s => this.getLightCount(s)), 32);
      const totalColumns = Math.max(...sirenSettings.map(s => this.getSequencerLength(s)), 20);
      
      console.log('Parsed carcols.meta:', {
        vehicleName,
        sirenSettingsCount: sirenSettings.length,
        totalRows,
        totalColumns
      });
      
      return {
        vehicleName,
        sirenSettings,
        totalRows,
        totalColumns
      };
      
    } catch (error) {
      console.error('Error parsing carcols.meta:', error);
      return null;
    }
  }
  
  /**
   * Parse individual siren setting from XML element
   */
  private static parseSirenSetting(element: Element, id: number): SirenSetting | null {
    try {
      const getTextContent = (tagName: string): string => {
        const el = element.querySelector(tagName);
        return el?.textContent || '';
      };
      
      const getNumberContent = (tagName: string, defaultValue: number = 0): number => {
        const content = getTextContent(tagName);
        return content ? parseFloat(content) : defaultValue;
      };
      
      // Parse the main siren setting properties
      const sirenSetting: SirenSetting = {
        id,
        name: getTextContent('name') || `Siren ${id}`,
        timeMultiplier: getNumberContent('timeMultiplier', 1.0),
        lightFalloffMax: getNumberContent('lightFalloffMax', 50.0),
        lightFalloffExponent: getNumberContent('lightFalloffExponent', 1.0),
        lightInnerConeAngle: getNumberContent('lightInnerConeAngle', 2.290610),
        lightOuterConeAngle: getNumberContent('lightOuterConeAngle', 70.0),
        lightOffset: getNumberContent('lightOffset', 0.0),
        textureName: getTextContent('textureName') || 'VehicleLight_sirenlight',
        sequencerBpm: getNumberContent('sequencerBpm', 600),
        // Initialize all lights as inactive
        leftHeadlight: this.getDefaultLightConfig(),
        rightHeadlight: this.getDefaultLightConfig(),
        leftTailLight: this.getDefaultLightConfig(),
        rightTailLight: this.getDefaultLightConfig(),
        leftIndicator: this.getDefaultLightConfig(),
        rightIndicator: this.getDefaultLightConfig(),
        extra1: this.getDefaultLightConfig(),
        extra2: this.getDefaultLightConfig(),
        extra3: this.getDefaultLightConfig(),
        extra4: this.getDefaultLightConfig(),
        extra5: this.getDefaultLightConfig(),
        extra6: this.getDefaultLightConfig(),
        extra7: this.getDefaultLightConfig(),
        extra8: this.getDefaultLightConfig(),
        extra9: this.getDefaultLightConfig(),
        extra10: this.getDefaultLightConfig(),
        extra11: this.getDefaultLightConfig(),
        extra12: this.getDefaultLightConfig(),
        extra13: this.getDefaultLightConfig(),
        extra14: this.getDefaultLightConfig(),
        extra15: this.getDefaultLightConfig(),
        extra16: this.getDefaultLightConfig(),
        extra17: this.getDefaultLightConfig(),
        extra18: this.getDefaultLightConfig(),
        extra19: this.getDefaultLightConfig(),
        extra20: this.getDefaultLightConfig(),
        extra21: this.getDefaultLightConfig(),
        extra22: this.getDefaultLightConfig(),
        extra23: this.getDefaultLightConfig(),
        extra24: this.getDefaultLightConfig(),
        extra25: this.getDefaultLightConfig(),
        extra26: this.getDefaultLightConfig(),
        extra27: this.getDefaultLightConfig(),
        extra28: this.getDefaultLightConfig(),
        extra29: this.getDefaultLightConfig(),
        extra30: this.getDefaultLightConfig(),
        extra31: this.getDefaultLightConfig(),
        extra32: this.getDefaultLightConfig(),
      };
      
      // Parse the nested sirens section
      const sirensSection = element.querySelector('sirens');
      if (sirensSection) {
        const sirenItems = sirensSection.querySelectorAll('Item');
        console.log(`Found ${sirenItems.length} siren items in ${sirenSetting.name}`);
        
        sirenItems.forEach((sirenItem, index) => {
          if (index < 32) { // Limit to 32 extra lights
            const lightConfig = this.parseGTAVSirenLight(sirenItem as Element);
            console.log(`Parsed siren ${index + 1}:`, lightConfig);
            
            if (lightConfig.color !== 'none') {
              // Map to the appropriate extra light
              const extraKey = `extra${index + 1}` as keyof SirenSetting;
              if (extraKey in sirenSetting) {
                (sirenSetting as any)[extraKey] = lightConfig;
                console.log(`Mapped siren ${index + 1} to ${extraKey}:`, lightConfig);
              }
            } else {
              console.log(`Siren ${index + 1} has no color, skipping`);
            }
          }
        });
      }
      
      return sirenSetting;
      
    } catch (error) {
      console.error('Error parsing siren setting:', error);
      return null;
    }
  }
  
  /**
   * Get default light configuration
   */
  private static getDefaultLightConfig(): LightConfig {
    return {
      color: 'none',
      intensity: 3.5,
      falloffMax: 50.0,
      falloffExponent: 1.0,
      innerConeAngle: 2.290610,
      outerConeAngle: 70.0,
      offset: 0.0,
      textureName: 'VehicleLight_sirenlight',
      sequencerBpm: 600,
    };
  }
  
  /**
   * Count the number of active lights in a siren setting
   */
  private static getLightCount(sirenSetting: SirenSetting): number {
    const lights = [
      sirenSetting.leftHeadlight, sirenSetting.rightHeadlight,
      sirenSetting.leftTailLight, sirenSetting.rightTailLight,
      sirenSetting.leftIndicator, sirenSetting.rightIndicator,
      sirenSetting.extra1, sirenSetting.extra2, sirenSetting.extra3, sirenSetting.extra4,
      sirenSetting.extra5, sirenSetting.extra6, sirenSetting.extra7, sirenSetting.extra8,
      sirenSetting.extra9, sirenSetting.extra10, sirenSetting.extra11, sirenSetting.extra12,
      sirenSetting.extra13, sirenSetting.extra14, sirenSetting.extra15, sirenSetting.extra16,
      sirenSetting.extra17, sirenSetting.extra18, sirenSetting.extra19, sirenSetting.extra20,
      sirenSetting.extra21, sirenSetting.extra22, sirenSetting.extra23, sirenSetting.extra24,
      sirenSetting.extra25, sirenSetting.extra26, sirenSetting.extra27, sirenSetting.extra28,
      sirenSetting.extra29, sirenSetting.extra30, sirenSetting.extra31, sirenSetting.extra32,
    ];
    
    return lights.filter(light => light.color !== 'none').length;
  }
  
  /**
   * Get the sequencer length (number of columns) from BPM
   */
  private static getSequencerLength(sirenSetting: SirenSetting): number {
    // Estimate sequencer length based on BPM
    // This is a rough calculation - actual GTA V sequencers may vary
    const baseLength = 20;
    const bpmMultiplier = sirenSetting.sequencerBpm / 600; // 600 BPM is baseline
    return Math.round(baseLength * bpmMultiplier);
  }

  /**
   * Parse individual GTA V siren light from XML element
   */
  private static parseGTAVSirenLight(element: Element): LightConfig {
    const getTextContent = (tagName: string): string => {
      const el = element.querySelector(tagName);
      return el?.textContent || '';
    };
    
    const getNumberContent = (tagName: string, defaultValue: number = 0): number => {
      const content = getTextContent(tagName);
      return content ? parseFloat(content) : defaultValue;
    };
    
    // Parse color - GTA V uses hex format like 0xFFFF0000
    let color = getTextContent('color');
    if (color && color.startsWith('0x')) {
      // Convert GTA V hex format to standard hex
      color = '#' + color.substring(2);
      console.log(`Converted color from ${getTextContent('color')} to ${color}`);
    } else if (color && color !== 'none') {
      // If not hex, try to convert common color names
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
    
    // Parse intensity - it's directly under the Item, not under corona
    const intensity = getNumberContent('intensity', 3.5);
    
    console.log(`Parsed siren light: color=${color}, intensity=${intensity}`);
    
    return {
      color: color || 'none',
      intensity: intensity,
      falloffMax: getNumberContent('corona > intensity', 50.0),
      falloffExponent: 1.0, // Default value
      innerConeAngle: getNumberContent('corona > size', 2.290610),
      outerConeAngle: getNumberContent('corona > pull', 70.0),
      offset: getNumberContent('rotation > start', 0.0),
      textureName: 'VehicleLight_sirenlight', // Default texture
      sequencerBpm: 500, // Default BPM
    };
  }
}
