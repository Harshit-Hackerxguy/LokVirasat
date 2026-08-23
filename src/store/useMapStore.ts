import { create } from 'zustand';
import { Coordinates } from '@/types';

interface MapStoreState {
  activeSiteId: string | null;
  userLocation: Coordinates | null;
  isMapLoaded: boolean;
  isPinningMode: boolean;
  selectedDraftLocation: Coordinates | null;
  isModalOpen: boolean;
  setActiveSite: (siteId: string | null) => void;
  setUserLocation: (location: Coordinates | null) => void;
  setMapLoaded: (loaded: boolean) => void;
  setPinningMode: (isPinning: boolean) => void;
  setDraftLocation: (location: Coordinates | null) => void;
  setModalOpen: (isOpen: boolean) => void;
}

export const useMapStore = create<MapStoreState>((set) => ({
  activeSiteId: null,
  userLocation: null,
  isMapLoaded: false,
  isPinningMode: false,
  selectedDraftLocation: null,
  isModalOpen: false,
  setActiveSite: (siteId) => set({ activeSiteId: siteId }),
  setUserLocation: (location) => set({ userLocation: location }),
  setMapLoaded: (loaded) => set({ isMapLoaded: loaded }),
  setPinningMode: (isPinning) => set({ isPinningMode: isPinning }),
  setDraftLocation: (location) => set({ selectedDraftLocation: location }),
  setModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
}));
