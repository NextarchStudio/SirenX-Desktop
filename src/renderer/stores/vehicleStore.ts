import { create } from 'zustand';

export interface VehicleFile {
  name: string;
  path: string;
  size: number;
  isDirectory: boolean;
  relativePath?: string;
}

export interface VehicleModel {
  name: string;
  path: string;
  type: string;
  relativePath?: string;
}

export interface VehicleData {
  folderPath: string;
  files: VehicleFile[];
  carcols: string | null;
  models: VehicleModel[];
}

interface VehicleStore {
  vehicleData: VehicleData | null;
  setVehicleData: (data: VehicleData) => void;
  clearVehicleData: () => void;
  updateCarcols: (content: string) => void;
}

export const useVehicleStore = create<VehicleStore>((set) => ({
  vehicleData: null,
  setVehicleData: (data) => set({ vehicleData: data }),
  clearVehicleData: () => set({ vehicleData: null }),
  updateCarcols: (content) => set((state) => ({
    vehicleData: state.vehicleData ? {
      ...state.vehicleData,
      carcols: content
    } : null
  }))
}));
