'use client';

import { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { HERITAGE_SITES } from '@/data/heritageSites';
import { useMapStore } from '@/store/useMapStore';
import { Coordinates } from '@/types';

// Fix for default marker icon in Next.js + Leaflet
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom icon for active marker
const ActiveIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapComponentProps {
  activeSiteId?: string | null;
  onMarkerClick?: (siteId: string) => void;
}

function FlyToActiveSite({ activeSiteId }: { activeSiteId?: string | null }) {
  const map = useMap();
  useEffect(() => {
    if (activeSiteId) {
      const site = HERITAGE_SITES.find(s => s.id === activeSiteId);
      if (site && site.coordinates) {
        // maplibre uses [lng, lat], leaflet uses [lat, lng]
        const [lng, lat] = site.coordinates as [number, number];
        map.flyTo([lat, lng], site.zoomLevel || 6, {
          duration: 2
        });
      }
    }
  }, [activeSiteId, map]);
  return null;
}

function PinningModeManager() {
  const isPinningMode = useMapStore((state) => state.isPinningMode);
  const setDraftLocation = useMapStore((state) => state.setDraftLocation);
  
  useMapEvents({
    click(e) {
      if (isPinningMode) {
        setDraftLocation([e.latlng.lng, e.latlng.lat]);
      }
    },
  });

  return null;
}

function DraggableMarker() {
  const isPinningMode = useMapStore((state) => state.isPinningMode);
  const draftLocation = useMapStore((state) => state.selectedDraftLocation);
  const setDraftLocation = useMapStore((state) => state.setDraftLocation);
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latLng = marker.getLatLng();
          setDraftLocation([latLng.lng, latLng.lat]);
        }
      },
    }),
    [setDraftLocation],
  );

  if (!isPinningMode || !draftLocation) return null;

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={[draftLocation[1], draftLocation[0]]}
      icon={ActiveIcon}
      ref={markerRef}
    >
      <Popup minWidth={90}>
        <span>Drag to adjust</span>
      </Popup>
    </Marker>
  );
}

export default function MapComponent({ activeSiteId, onMarkerClick }: MapComponentProps) {
  // Center India [lat, lng]
  const center: [number, number] = [20.5937, 78.9629]; 
  
  const isPinningMode = useMapStore((state) => state.isPinningMode);
  const setPinningMode = useMapStore((state) => state.setPinningMode);
  const setModalOpen = useMapStore((state) => state.setModalOpen);
  
  return (
    <div className="relative w-full h-full" style={{ cursor: isPinningMode ? 'crosshair' : 'default' }}>
      {isPinningMode && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white rounded-md shadow-lg p-4 flex flex-col items-center gap-2">
          <p className="font-semibold text-sm">Click anywhere on the map to set the site location.</p>
          <button 
            onClick={() => {
              setPinningMode(false);
              setModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
          >
            Confirm Location
          </button>
        </div>
      )}
      <MapContainer 
        center={center} 
        zoom={4.5} 
        className="interactive-map-canvas"
        style={{ width: '100%', height: '100%', zIndex: 1 }}
      >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {HERITAGE_SITES.map((site) => {
        const [lng, lat] = site.coordinates as [number, number];
        const isActive = site.id === activeSiteId;
        
        return (
          <Marker 
            key={site.id} 
            position={[lat, lng]} 
            icon={isActive ? ActiveIcon : DefaultIcon}
            eventHandlers={{
              click: () => onMarkerClick?.(site.id)
            }}
          >
            <Popup>
              <div className="marker-popup p-1">
                <strong className="block font-bold text-gray-800">{site.name}</strong>
                <span className="text-gray-600 text-sm">{site.category}</span>
              </div>
            </Popup>
          </Marker>
        );
      })}
      
      
      <FlyToActiveSite activeSiteId={activeSiteId} />
      <PinningModeManager />
      <DraggableMarker />
    </MapContainer>
    </div>
  );
}
