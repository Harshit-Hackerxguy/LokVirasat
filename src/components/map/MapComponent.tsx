'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { HERITAGE_SITES } from '@/data/heritageSites';

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

export default function MapComponent({ activeSiteId, onMarkerClick }: MapComponentProps) {
  // Center India [lat, lng]
  const center: [number, number] = [20.5937, 78.9629]; 
  
  return (
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
    </MapContainer>
  );
}
