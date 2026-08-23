'use client';

import { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import L from 'leaflet';
import 'leaflet.markercluster';
import { HERITAGE_SITES } from '@/data/heritageSites';
import { useMapStore } from '@/store/useMapStore';
import './MapStyles.css';

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

// Custom icon for active marker (pinning mode)
const ActiveIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom marker icons based on category (migrated from CleanCity's severity)
function createMarkerIcon(category: string) {
  const colors: Record<string, string> = {
    'Natural': '#00ff88',
    'Monument': '#ff8800',
    'Cultural': '#ff3355'
  };
  const color = colors[category] || colors['Monument'];
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="marker-pin" style="--marker-color: ${color}">
        <div class="marker-dot"></div>
      </div>
      <div class="marker-pulse" style="--marker-color: ${color}"></div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -20]
  });
}

function MarkerClusterGroup({ onMarkerClick }: { onMarkerClick?: (siteId: string) => void }) {
  const map = useMap();
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    if (clusterRef.current) {
      map.removeLayer(clusterRef.current);
    }

    const cluster = L.markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction: (clstr) => {
        const count = clstr.getChildCount();
        let size = 'small';
        if (count > 10) size = 'medium';
        if (count > 50) size = 'large';
        return L.divIcon({
          html: `<div><span>${count}</span></div>`,
          className: `marker-cluster marker-cluster-${size}`,
          iconSize: L.point(40, 40)
        });
      }
    });

    HERITAGE_SITES.forEach(site => {
      const [lng, lat] = site.coordinates as [number, number];
      const marker = L.marker([lat, lng], {
        icon: createMarkerIcon(site.category)
      });

      const popupContent = document.createElement('div');
      popupContent.className = 'marker-popup-content';
      
      popupContent.innerHTML = `
        <div class="popup-inner">
          <div class="popup-body">
            <div class="popup-header">
              <span class="severity-badge ${site.category}">${site.category}</span>
            </div>
            <strong class="block font-bold text-gray-800" style="font-size: 1.1rem; margin-top: 4px;">${site.name}</strong>
            <p class="popup-description">${site.description || 'No description provided'}</p>
            <div class="popup-meta">
              <span>📍 ${lat.toFixed(4)}, ${lng.toFixed(4)}</span>
            </div>
            <div class="popup-actions" id="popup-actions-${site.id}"></div>
          </div>
        </div>
      `;

      const popup = L.popup({ maxWidth: 320, minWidth: 280, closeButton: true }).setContent(popupContent);
      marker.bindPopup(popup);

      marker.on('click', () => {
        onMarkerClick?.(site.id);
      });

      cluster.addLayer(marker);
    });

    map.addLayer(cluster);
    clusterRef.current = cluster;

    return () => {
      if (clusterRef.current) {
        map.removeLayer(clusterRef.current);
      }
    };
  }, [map, onMarkerClick]);

  return null;
}

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
        const [lng, lat] = site.coordinates as [number, number];
        map.flyTo([lat, lng], site.zoomLevel || 13, {
          duration: 1.5
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
        <span className="text-black">Drag to adjust</span>
      </Popup>
    </Marker>
  );
}

export default function MapComponent({ activeSiteId, onMarkerClick }: MapComponentProps) {
  // Center India [lat, lng] (from CleanCity)
  const center: [number, number] = [22.5, 78.9]; 
  
  const isPinningMode = useMapStore((state) => state.isPinningMode);
  const setPinningMode = useMapStore((state) => state.setPinningMode);
  const setModalOpen = useMapStore((state) => state.setModalOpen);
  
  return (
    <div className="relative w-full h-full map-container" style={{ cursor: isPinningMode ? 'crosshair' : 'default' }}>
      {isPinningMode && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white rounded-md shadow-lg p-4 flex flex-col items-center gap-2">
          <p className="font-semibold text-sm text-black">Click anywhere on the map to set the site location.</p>
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
        zoom={5} 
        zoomControl={true}
        attributionControl={false}
        className="interactive-map-canvas map-container"
        style={{ width: '100%', height: '100%', zIndex: 1 }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        
        {!isPinningMode && <MarkerClusterGroup onMarkerClick={onMarkerClick} />}
        
        <FlyToActiveSite activeSiteId={activeSiteId} />
        <PinningModeManager />
        <DraggableMarker />
      </MapContainer>
    </div>
  );
}
