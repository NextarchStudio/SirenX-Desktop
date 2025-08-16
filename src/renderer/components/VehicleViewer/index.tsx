import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { VehicleData } from '../../stores/vehicleStore';
import { useLightingStore } from '../../stores/lightingStore';
import GTAModelLoader from '../../utils/gtavModelLoader';
import './VehicleViewer.css';

interface VehicleViewerProps {
  vehicle: VehicleData;
}

// Test Cube Component to verify 3D rendering
function TestCube() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });
  
  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}

// Simplified GTA V Vehicle Model Component
function GTAVehicleModel({ vehicle, setLoadingStatus }: { vehicle: VehicleData; setLoadingStatus: (status: string) => void }) {
  const { scene } = useThree();
  const [modelLoaded, setModelLoaded] = useState(false);
  
  useEffect(() => {
    try {
      console.log('Loading vehicle model for:', vehicle.folderPath);
      console.log('Available models:', vehicle.models);
      
      // Check if we have actual .yft/.ytd files
      const yftFiles = vehicle.models.filter(m => m.type === '.yft');
      const ytdFiles = vehicle.models.filter(m => m.type === '.ytd');
      
      if (yftFiles.length > 0) {
        setLoadingStatus(`Found ${yftFiles.length} .yft model files`);
        console.log('YFT files found:', yftFiles.map(f => f.relativePath || f.name));
        
        // TODO: Implement actual .yft/.ytd loading here
        // For now, we'll use the fallback model but show what we found
        
        // Get the GTA V model loader instance
        const modelLoader = GTAModelLoader.getInstance();
        
        // Create a realistic vehicle model based on the vehicle folder name
        const vehicleName = vehicle.folderPath.split('\\').pop() || 'vehicle';
        console.log('Creating fallback model for:', vehicleName);
        
        const vehicleModel = modelLoader.createFallbackVehicleModel(vehicleName);
        
        // Add the vehicle model to the scene
        scene.add(vehicleModel);
        console.log('Vehicle model added to scene');
        
        setModelLoaded(true);
        setLoadingStatus(`Using fallback model (${yftFiles.length} .yft files detected)`);
        
        // Cleanup function
        return () => {
          scene.remove(vehicleModel);
          console.log('Vehicle model removed from scene');
        };
      } else {
        setLoadingStatus('No .yft/.ytd files found - using fallback model');
        
        // Get the GTA V model loader instance
        const modelLoader = GTAModelLoader.getInstance();
        
        // Create a realistic vehicle model based on the vehicle folder name
        const vehicleName = vehicle.folderPath.split('\\').pop() || 'vehicle';
        console.log('Creating fallback model for:', vehicleName);
        
        const vehicleModel = modelLoader.createFallbackVehicleModel(vehicleName);
        
        // Add the vehicle model to the scene
        scene.add(vehicleModel);
        console.log('Vehicle model added to scene');
        
        setModelLoaded(true);
        
        // Cleanup function
        return () => {
          scene.remove(vehicleModel);
          console.log('Vehicle model removed from scene');
        };
      }
      
    } catch (err) {
      console.error('Error loading vehicle model:', err);
      setLoadingStatus(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [vehicle, scene, setLoadingStatus]);
  
  return null; // The model is added directly to the scene
}

// Simple Lighting Component
function SimpleLighting() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
    </>
  );
}

// Main Vehicle Viewer Component
export function VehicleViewer({ vehicle }: VehicleViewerProps) {
  const [cameraPosition] = useState<[number, number, number]>([5, 3, 5]);
  const [showTestCube, setShowTestCube] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('Initializing...');
  
  return (
    <div className="vehicle-viewer">
      <div className="viewer-controls">
        <h3>3D Vehicle Preview - {vehicle.folderPath.split('\\').pop()}</h3>
        <div className="camera-controls">
          <button onClick={() => setShowTestCube(!showTestCube)}>
            {showTestCube ? 'Hide' : 'Show'} Test Cube
          </button>
          <button>Front View</button>
          <button>Side View</button>
          <button>Top View</button>
        </div>
      </div>
      
      <div className="canvas-container">
        <Canvas
          camera={{ position: cameraPosition, fov: 60 }}
          gl={{ antialias: true }}
          style={{ background: '#1a1a1a' }}
        >
          {/* Simple Lighting */}
          <SimpleLighting />
          
          {/* Test Cube to verify 3D rendering */}
          {showTestCube && <TestCube />}
          
          {/* GTA V Vehicle Model */}
          <GTAVehicleModel vehicle={vehicle} setLoadingStatus={setLoadingStatus} />
          
          {/* Basic Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={20}
          />
        </Canvas>
      </div>
      
      <div className="viewer-info">
        <p>Vehicle: {vehicle.folderPath.split('\\').pop()}</p>
        <p>Files: {vehicle.files.length}</p>
        <p>Models: {vehicle.models.length}</p>
        {vehicle.carcols && <p>✓ carcols.meta loaded</p>}
        <p>Status: {loadingStatus}</p>
        <p>Debug: Test cube {showTestCube ? 'visible' : 'hidden'}</p>
        {vehicle.models.length > 0 && (
          <div style={{ marginTop: '10px', padding: '8px', background: '#2a2a2a', borderRadius: '4px' }}>
            <p style={{ fontSize: '12px', color: '#00ff00', margin: '0 0 5px 0' }}>Found Model Files:</p>
            {vehicle.models.map((model, index) => (
              <p key={index} style={{ fontSize: '11px', color: '#ccc', margin: '2px 0' }}>
                {model.relativePath || model.name} ({model.type})
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
