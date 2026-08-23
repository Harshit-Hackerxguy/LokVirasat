import { create } from 'zustand';
import { Coordinates } from '@/types';

interface MapStoreState {
  activeSiteId: string | null;
  userLocation: Coordinates | null;
  isMapLoaded: boolean;
  setActiveSite: (siteId: string | null) => void;
  setUserLocation: (location: Coordinates | null) => void;
  setMapLoaded: (loaded: boolean) => void;
}

export const useMapStore = create<MapStoreState>((set) => ({
  activeSiteId: null,
  userLocation: null,
  isMapLoaded: false,
  setActiveSite: (siteId) => set({ activeSiteId: siteId }),
  setUserLocation: (location) => set({ userLocation: location }),
  setMapLoaded: (loaded) => set({ isMapLoaded: loaded }),
}));
