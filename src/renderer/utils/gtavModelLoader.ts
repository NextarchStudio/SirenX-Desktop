import * as THREE from 'three';

export interface GTAModelData {
  vertices: Float32Array;
  indices: Uint32Array;
  normals: Float32Array;
  uvs: Float32Array;
  textures: THREE.Texture[];
  boundingBox: THREE.Box3;
}

export interface YFTFileHeader {
  magic: string;
  version: number;
  modelCount: number;
  textureCount: number;
  flags: number;
}

export interface YTDFileHeader {
  magic: string;
  version: number;
  textureCount: number;
  flags: number;
}

export class GTAModelLoader {
  private static instance: GTAModelLoader;
  
  private constructor() {}
  
  static getInstance(): GTAModelLoader {
    if (!GTAModelLoader.instance) {
      GTAModelLoader.instance = new GTAModelLoader();
    }
    return GTAModelLoader.instance;
  }

  /**
   * Attempts to load a .yft model file
   * This is a basic implementation - you'll need to enhance it with proper GTA V parsing
   */
  async loadYFTModel(filePath: string): Promise<GTAModelData> {
    try {
      console.log('Attempting to load YFT model:', filePath);
      
      // For now, return a placeholder model
      // TODO: Implement actual .yft parsing
      console.warn('YFT parsing not yet implemented - using fallback model');
      
      return this.createBasicVehicleModel();
    } catch (error) {
      console.error('Error loading YFT model:', error);
      throw new Error(`Failed to load YFT model: ${error}`);
    }
  }

  /**
   * Attempts to load .ytd texture files
   * This is a basic implementation - you'll need to enhance it with proper GTA V parsing
   */
  async loadYTDTextures(filePath: string): Promise<THREE.Texture[]> {
    try {
      console.log('Attempting to load YTD textures:', filePath);
      
      // For now, return placeholder textures
      // TODO: Implement actual .ytd parsing
      console.warn('YTD parsing not yet implemented - using fallback textures');
      
      return this.createFallbackTextures();
    } catch (error) {
      console.error('Error loading YTD textures:', error);
      throw new Error(`Failed to load YTD textures: ${error}`);
    }
  }

  /**
   * Creates a realistic fallback vehicle model based on vehicle name
   */
  createFallbackVehicleModel(vehicleName: string): THREE.Group {
    const vehicleGroup = new THREE.Group();
    
    // Determine vehicle type from name
    const name = vehicleName.toLowerCase();
    let isSportsCar = false;
    let isTruck = false;
    let isMotorcycle = false;
    
    if (name.includes('sport') || name.includes('super') || name.includes('race')) {
      isSportsCar = true;
    } else if (name.includes('truck') || name.includes('van') || name.includes('bus')) {
      isTruck = true;
    } else if (name.includes('bike') || name.includes('motorcycle')) {
      isMotorcycle = true;
    }
    
    let vehicleModel: THREE.Group;
    
    if (isMotorcycle) {
      vehicleModel = this.createMotorcycleModel();
    } else if (isTruck) {
      vehicleModel = this.createTruckModel();
    } else {
      vehicleModel = this.createCarModel(isSportsCar);
    }
    
    vehicleGroup.add(vehicleModel);
    
    // Add some basic lighting effects
    const pointLight = new THREE.PointLight(0x00ff00, 0.5, 10);
    pointLight.position.set(0, 2, 0);
    vehicleGroup.add(pointLight);
    
    return vehicleGroup;
  }

  /**
   * Creates a basic vehicle model for testing
   */
  private createBasicVehicleModel(): GTAModelData {
    // Create a simple car shape
    const geometry = new THREE.BoxGeometry(2, 1, 4);
    const material = new THREE.MeshStandardMaterial({ color: 0x4444ff });
    
    const mesh = new THREE.Mesh(geometry, material);
    const boundingBox = new THREE.Box3().setFromObject(mesh);
    
    return {
      vertices: new Float32Array(geometry.attributes.position.array),
      indices: new Uint32Array(geometry.index?.array || []),
      normals: new Float32Array(geometry.attributes.normal?.array || []),
      uvs: new Float32Array(geometry.attributes.uv?.array || []),
      textures: [],
      boundingBox
    };
  }

  /**
   * Creates fallback textures
   */
  private createFallbackTextures(): THREE.Texture[] {
    // Create a simple colored texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    
    // Create a simple pattern
    ctx.fillStyle = '#4444ff';
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(16, 16, 32, 32);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    return [texture];
  }

  private createCarModel(isSportsCar: boolean): THREE.Group {
    const carGroup = new THREE.Group();
    
    // Car body
    const bodyGeometry = new THREE.BoxGeometry(2, 0.8, 4);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: isSportsCar ? 0xff0000 : 0x4444ff,
      metalness: 0.7,
      roughness: 0.2
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.4;
    carGroup.add(body);
    
    // Hood
    const hoodGeometry = new THREE.BoxGeometry(1.8, 0.1, 1.5);
    const hood = new THREE.Mesh(hoodGeometry, bodyMaterial);
    hood.position.set(0, 0.85, 1.25);
    carGroup.add(hood);
    
    // Trunk
    const trunkGeometry = new THREE.BoxGeometry(1.8, 0.1, 1.5);
    const trunk = new THREE.Mesh(trunkGeometry, bodyMaterial);
    trunk.position.set(0, 0.85, -1.25);
    carGroup.add(trunk);
    
    // Roof
    const roofGeometry = new THREE.BoxGeometry(1.6, 0.1, 2.5);
    const roof = new THREE.Mesh(roofGeometry, bodyMaterial);
    roof.position.set(0, 1.4, 0);
    carGroup.add(roof);
    
    // Windows
    const windowMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.6
    });
    
    // Front windshield
    const frontWindowGeometry = new THREE.BoxGeometry(1.4, 0.05, 0.8);
    const frontWindow = new THREE.Mesh(frontWindowGeometry, windowMaterial);
    frontWindow.position.set(0, 1.2, 1.8);
    frontWindow.rotation.x = -0.3;
    carGroup.add(frontWindow);
    
    // Rear windshield
    const rearWindowGeometry = new THREE.BoxGeometry(1.4, 0.05, 0.8);
    const rearWindow = new THREE.Mesh(rearWindowGeometry, windowMaterial);
    rearWindow.position.set(0, 1.2, -1.8);
    rearWindow.rotation.x = 0.3;
    carGroup.add(rearWindow);
    
    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 16);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    
    const wheelPositions = [
      [-0.9, 0.4, 1.2], [-0.9, 0.4, -1.2], // Left wheels
      [0.9, 0.4, 1.2], [0.9, 0.4, -1.2]    // Right wheels
    ];
    
    wheelPositions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.position.set(pos[0], pos[1], pos[2]);
      wheel.rotation.z = Math.PI / 2;
      carGroup.add(wheel);
    });
    
    // Spoiler (for sports cars)
    if (isSportsCar) {
      const spoilerGeometry = new THREE.BoxGeometry(1.6, 0.1, 0.3);
      const spoiler = new THREE.Mesh(spoilerGeometry, bodyMaterial);
      spoiler.position.set(0, 1.5, -2.2);
      carGroup.add(spoiler);
    }
    
    // Exhaust
    const exhaustGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 8);
    const exhaustMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 });
    const exhaust = new THREE.Mesh(exhaustGeometry, exhaustMaterial);
    exhaust.position.set(-0.3, 0.2, -2.3);
    exhaust.rotation.x = Math.PI / 2;
    carGroup.add(exhaust);
    
    return carGroup;
  }

  private createTruckModel(): THREE.Group {
    const truckGroup = new THREE.Group();
    
    // Truck body
    const bodyGeometry = new THREE.BoxGeometry(2.5, 1.2, 6);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8B4513,
      metalness: 0.5,
      roughness: 0.3
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.6;
    truckGroup.add(body);
    
    // Cab
    const cabGeometry = new THREE.BoxGeometry(2.2, 1.5, 2);
    const cab = new THREE.Mesh(cabGeometry, bodyMaterial);
    cab.position.set(0, 1.35, 2);
    truckGroup.add(cab);
    
    // Windows
    const windowMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.6
    });
    
    const windowGeometry = new THREE.BoxGeometry(1.8, 0.8, 0.1);
    const window = new THREE.Mesh(windowGeometry, windowMaterial);
    window.position.set(0, 1.5, 2.9);
    truckGroup.add(window);
    
    // Wheels (larger for trucks)
    const wheelGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.3, 16);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    
    const wheelPositions = [
      [-1.1, 0.6, 2.5], [-1.1, 0.6, -2.5], // Left wheels
      [1.1, 0.6, 2.5], [1.1, 0.6, -2.5]    // Right wheels
    ];
    
    wheelPositions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.position.set(pos[0], pos[1], pos[2]);
      wheel.rotation.z = Math.PI / 2;
      truckGroup.add(wheel);
    });
    
    return truckGroup;
  }

  private createMotorcycleModel(): THREE.Group {
    const bikeGroup = new THREE.Group();
    
    // Motorcycle body
    const bodyGeometry = new THREE.BoxGeometry(0.8, 0.6, 2.5);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x000000,
      metalness: 0.8,
      roughness: 0.1
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.3;
    bikeGroup.add(body);
    
    // Seat
    const seatGeometry = new THREE.BoxGeometry(0.6, 0.2, 0.8);
    const seatMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const seat = new THREE.Mesh(seatGeometry, seatMaterial);
    seat.position.set(0, 0.7, 0.3);
    bikeGroup.add(seat);
    
    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.1, 16);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    
    const frontWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    frontWheel.position.set(0, 0.4, 1.2);
    frontWheel.rotation.z = Math.PI / 2;
    bikeGroup.add(frontWheel);
    
    const rearWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    rearWheel.position.set(0, 0.4, -1.2);
    rearWheel.rotation.z = Math.PI / 2;
    bikeGroup.add(rearWheel);
    
    // Handlebar
    const handlebarGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8);
    const handlebarMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 });
    const handlebar = new THREE.Mesh(handlebarGeometry, handlebarMaterial);
    handlebar.position.set(0, 1.2, 1.2);
    bikeGroup.add(handlebar);
    
    return bikeGroup;
  }

  /**
   * Attempts to parse a .yft file header
   * This is a basic implementation - you'll need to enhance it
   */
  private parseYFTHeader(buffer: ArrayBuffer): YFTFileHeader | null {
    try {
      const view = new DataView(buffer);
      
      // Check magic number (this is a placeholder - you need the actual GTA V magic)
      const magic = String.fromCharCode(...new Uint8Array(buffer.slice(0, 4)));
      
      if (magic !== 'YFT ' && magic !== 'YFT\0') {
        console.warn('Invalid YFT magic number:', magic);
        return null;
      }
      
      // Parse basic header info (this is simplified - you need the actual format)
      const version = view.getUint32(4, true);
      const modelCount = view.getUint32(8, true);
      const textureCount = view.getUint32(12, true);
      const flags = view.getUint32(16, true);
      
      return {
        magic,
        version,
        modelCount,
        textureCount,
        flags
      };
    } catch (error) {
      console.error('Error parsing YFT header:', error);
      return null;
    }
  }

  /**
   * Attempts to parse a .ytd file header
   * This is a basic implementation - you'll need to enhance it
   */
  private parseYTDHeader(buffer: ArrayBuffer): YTDFileHeader | null {
    try {
      const view = new DataView(buffer);
      
      // Check magic number (this is a placeholder - you need the actual GTA V magic)
      const magic = String.fromCharCode(...new Uint8Array(buffer.slice(0, 4)));
      
      if (magic !== 'YTD ' && magic !== 'YTD\0') {
        console.warn('Invalid YTD magic number:', magic);
        return null;
      }
      
      // Parse basic header info (this is simplified - you need the actual format)
      const version = view.getUint32(4, true);
      const textureCount = view.getUint32(8, true);
      const flags = view.getUint32(12, true);
      
      return {
        magic,
        version,
        textureCount,
        flags
      };
    } catch (error) {
      console.error('Error parsing YTD header:', error);
      return null;
    }
  }
}

export default GTAModelLoader;
