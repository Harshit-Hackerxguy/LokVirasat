'use client';

import { useEffect, useRef, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from 'react-leaflet';

import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

import L from 'leaflet';
import 'leaflet.markercluster';

import {
  HeritageSite,
  HeritageLead,
  VERIFICATION_STATUS_COLORS,
  VERIFICATION_STATUS_LABELS,
} from '@/types';

import { useMapStore } from '@/store/useMapStore';
import './MapStyles.css';

// Fix for default marker icon in Next.js + Leaflet
const DefaultIcon = L.icon({
  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',

  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom icon for active marker
const ActiveIcon = L.icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',

  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// ──────────────────────────────────────────────────────────────────────────
// Marker icons — colour encodes TRUST LEVEL, not category
// 🟡 community-reported  →  yellow (#eab308)
// 🟠 community-corroborated → orange (#f97316)
// 🔵 evidence-supported  →  blue  (#3b82f6)
// 🟢 authority-verified  →  green (#22c55e)
// ──────────────────────────────────────────────────────────────────────────
function createMarkerIcon(
  verificationStatus?: string,
  isLead = false,
) {
  // Heritage leads get a distinct cyan colour so they are easy to spot
  const color = isLead
    ? '#38bdf8'
    : (VERIFICATION_STATUS_COLORS[
        verificationStatus as keyof typeof VERIFICATION_STATUS_COLORS
      ] ?? '#eab308');

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
    popupAnchor: [0, -20],
  });
}

/** Returns a colour hex for a given trust status (used in popup badge) */
function trustColor(status?: string): string {
  return (
    VERIFICATION_STATUS_COLORS[
      status as keyof typeof VERIFICATION_STATUS_COLORS
    ] ?? '#eab308'
  );
}

/** Returns a human-readable label for a trust status */
function trustLabel(status?: string): string {
  return (
    VERIFICATION_STATUS_LABELS[
      status as keyof typeof VERIFICATION_STATUS_LABELS
    ] ?? 'Community Reported'
  );
}

function MarkerClusterGroup({
  onMarkerClick,
  heritageSites,
  heritageLeads,
}: {
  onMarkerClick?: (siteId: string) => void;
  heritageSites: HeritageSite[];
  heritageLeads: HeritageLead[];
}) {
  const map = useMap();

  const clusterRef =
    useRef<L.MarkerClusterGroup | null>(null);

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
          iconSize: L.point(40, 40),
        });
      },
    });

    // ------------------------------------------------
    // DOCUMENTED HERITAGE SITES
    // ------------------------------------------------

    // De-duplicate by ID to prevent two markers for the same site
    const seenSiteIds = new Set<string>();
    const uniqueSites = heritageSites.filter((site) => {
      if (seenSiteIds.has(site.id)) return false;
      seenSiteIds.add(site.id);
      return true;
    });

    uniqueSites.forEach((site) => {
      const [lng, lat] = site.coordinates;

      const marker = L.marker([lat, lng], {
        icon: createMarkerIcon(site.verificationStatus),
      });

      const popupContent = document.createElement('div');
      popupContent.className = 'marker-popup-content';

      const tColor = trustColor(site.verificationStatus);
      const tLabel = trustLabel(site.verificationStatus);

      const firstImage =
        site.images && site.images.length > 0 ? site.images[0] : null;

      const imageHtml = firstImage
        ? `<div class="popup-image"><img src="${firstImage}" alt="${site.name}" loading="lazy" /></div>`
        : '';

      // Heritage Passport popup
      popupContent.innerHTML = `
        <div class="popup-inner">
          ${imageHtml}
          <div class="popup-body">

            <div class="popup-header">
              <span class="severity-badge ${site.category}">${site.category}</span>
              <span class="popup-trust-badge" style="background:${tColor}20;color:${tColor};border:1px solid ${tColor}40">
                ${tLabel}
              </span>
            </div>

            <strong class="popup-site-name">${site.name}</strong>

            <p class="popup-description">${site.description || 'No description provided'}</p>

            <div class="popup-passport">
              <div class="popup-passport-row">
                <span class="popup-passport-icon">📍</span>
                <span>${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E</span>
              </div>
              ${site.documentedBy ? `<div class="popup-passport-row"><span class="popup-passport-icon">✍️</span><span>${site.documentedBy}</span></div>` : ''}
              ${site.lastUpdated ? `<div class="popup-passport-row"><span class="popup-passport-icon">🗓</span><span>${site.lastUpdated}</span></div>` : ''}
            </div>

            <div class="popup-trust-track">
              ${['community-reported','community-corroborated','evidence-supported','authority-verified'].map((s) => {
                const active = s === site.verificationStatus;
                const c = trustColor(s);
                return `<div class="popup-trust-step ${active ? 'active' : ''}" style="--tc:${c}" title="${trustLabel(s)}"></div>`;
              }).join('')}
            </div>

          </div>
        </div>
      `;

      const popup = L.popup({
        maxWidth: 340,
        minWidth: 290,
        closeButton: true,
      }).setContent(popupContent);

      marker.bindPopup(popup);

      marker.on('click', () => {
        onMarkerClick?.(site.id);
      });

      cluster.addLayer(marker);
    });

    // ------------------------------------------------
    // HERITAGE LEADS
    // ------------------------------------------------

    heritageLeads.forEach((lead) => {
      const [lng, lat] = lead.approximateLocation;

      const marker = L.marker([lat, lng], {
        icon: createMarkerIcon(undefined, true),
      });

      const popupContent =
        document.createElement('div');

      popupContent.className =
        'marker-popup-content';

      popupContent.innerHTML = `
        <div class="popup-inner">
          <div class="popup-body">

            <div class="popup-header">
              <span class="severity-badge">
                Heritage Lead
              </span>
            </div>

            <strong
              class="block font-bold text-gray-800"
              style="
                font-size: 1.1rem;
                margin-top: 4px;
              "
            >
              ${lead.name}
            </strong>

            <p class="popup-description">
              ${lead.description}
            </p>

            <div class="popup-meta">
              <span>
                📍 ${lead.villageOrArea}
              </span>
            </div>

            <div class="popup-meta">
              <span>
                Submitted by: ${lead.submittedBy}
              </span>
            </div>

            <div class="popup-meta">
              <span>
                Status: ${lead.status.replace('-', ' ')}
              </span>
            </div>

          </div>
        </div>
      `;

      const popup = L.popup({
        maxWidth: 320,
        minWidth: 280,
        closeButton: true,
      }).setContent(popupContent);

      marker.bindPopup(popup);

      marker.on('click', () => {
        onMarkerClick?.(`lead:${lead.id}`);
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
  }, [
    map,
    onMarkerClick,
    heritageSites,
    heritageLeads,
  ]);

  return null;
}

interface MapComponentProps {
  activeSiteId?: string | null;
  onMarkerClick?: (siteId: string) => void;
  heritageSites: HeritageSite[];
  heritageLeads: HeritageLead[];
}

function FlyToActiveSite({
  activeSiteId,
  heritageSites,
}: {
  activeSiteId?: string | null;
  heritageSites: HeritageSite[];
}) {
  const map = useMap();

  useEffect(() => {
    if (!activeSiteId) return;

    const site = heritageSites.find(
      (s) => s.id === activeSiteId
    );

    if (site && site.coordinates) {
      const [lng, lat] = site.coordinates;

      map.flyTo(
        [lat, lng],
        site.zoomLevel || 13,
        {
          duration: 1.5,
        }
      );
    }
  }, [activeSiteId, map, heritageSites]);

  return null;
}

function PinningModeManager() {
  const isPinningMode = useMapStore(
    (state) => state.isPinningMode
  );

  const setDraftLocation = useMapStore(
    (state) => state.setDraftLocation
  );

  useMapEvents({
    click(e) {
      if (isPinningMode) {
        setDraftLocation([
          e.latlng.lng,
          e.latlng.lat,
        ]);
      }
    },
  });

  return null;
}

function DraggableMarker() {
  const isPinningMode = useMapStore(
    (state) => state.isPinningMode
  );

  const draftLocation = useMapStore(
    (state) => state.selectedDraftLocation
  );

  const setDraftLocation = useMapStore(
    (state) => state.setDraftLocation
  );

  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;

        if (marker != null) {
          const latLng =
            marker.getLatLng();

          setDraftLocation([
            latLng.lng,
            latLng.lat,
          ]);
        }
      },
    }),
    [setDraftLocation]
  );

  if (!isPinningMode || !draftLocation) {
    return null;
  }

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={[
        draftLocation[1],
        draftLocation[0],
      ]}
      icon={ActiveIcon}
      ref={markerRef}
    >
      <Popup minWidth={90}>
        <span className="text-black">
          Drag to adjust
        </span>
      </Popup>
    </Marker>
  );
}

export default function MapComponent({
  activeSiteId,
  onMarkerClick,
  heritageSites,
  heritageLeads,
}: MapComponentProps) {
  const center: [number, number] = [
    22.5,
    78.9,
  ];

  const isPinningMode = useMapStore(
    (state) => state.isPinningMode
  );

  const setPinningMode = useMapStore(
    (state) => state.setPinningMode
  );

  const setModalOpen = useMapStore(
    (state) => state.setModalOpen
  );

  return (
    <div
      className="relative w-full h-full map-container"
      style={{
        cursor: isPinningMode
          ? 'crosshair'
          : 'default',
      }}
    >
      {isPinningMode && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white rounded-md shadow-lg p-4 flex flex-col items-center gap-2">
          <p className="font-semibold text-sm text-black">
            Click anywhere on the map to set
            the site location.
          </p>

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
        style={{
          width: '100%',
          height: '100%',
          zIndex: 1,
        }}
      >
        <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {!isPinningMode && (
          <MarkerClusterGroup
            onMarkerClick={onMarkerClick}
            heritageSites={heritageSites}
            heritageLeads={heritageLeads}
          />
        )}

        <FlyToActiveSite
          activeSiteId={activeSiteId}
          heritageSites={heritageSites}
        />

        <PinningModeManager />

        <DraggableMarker />
      </MapContainer>
    </div>
  );
}