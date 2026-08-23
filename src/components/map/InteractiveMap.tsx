'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { HERITAGE_SITES } from '@/data/heritageSites';
import { HeritageSite } from '@/types';

// ─── Configuration ──────────────────────────────────────────────────────────
const MAP_STYLE =
  'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

const INITIAL_VIEW = {
  center: [78.9629, 20.5937] as [number, number],
  zoom: 4.5,
  pitch: 0,
  bearing: 0,
};

const FLY_TO_DURATION = 3000;

// ─── Component ──────────────────────────────────────────────────────────────

interface InteractiveMapProps {
  /** If provided, the map will fly to this site */
  activeSiteId?: string | null;
  /** Callback when a marker is clicked */
  onMarkerClick?: (siteId: string) => void;
}

export default function InteractiveMap({
  activeSiteId,
  onMarkerClick,
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const activeIdRef = useRef<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // ── Fly the map to a heritage site ────────────────────────────────────
  const flyToSite = useCallback((site: HeritageSite) => {
    const map = mapRef.current;
    if (!map) return;

    map.flyTo({
      center: site.coordinates as [number, number],
      zoom: site.zoomLevel,
      pitch: site.pitch,
      bearing: site.bearing,
      duration: FLY_TO_DURATION,
      essential: true,
    });
  }, []);

  // ── Initialize MapLibre ───────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE,
      center: INITIAL_VIEW.center,
      zoom: INITIAL_VIEW.zoom,
      pitch: INITIAL_VIEW.pitch,
      bearing: INITIAL_VIEW.bearing,
      maxPitch: 85,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.on('load', () => {
      setIsLoaded(true);
    });

    // Place markers for each heritage site
    for (const site of HERITAGE_SITES) {
      const el = document.createElement('div');
      el.className = 'map-marker';
      el.setAttribute('data-site-id', site.id);
      el.innerHTML = `
        <div class="marker-pulse"></div>
        <div class="marker-dot"></div>
      `;

      // Handle marker click
      el.addEventListener('click', () => {
        onMarkerClick?.(site.id);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(site.coordinates as [number, number])
        .setPopup(
          new maplibregl.Popup({ offset: 25, closeButton: false }).setHTML(
            `<div class="marker-popup">
              <strong>${site.name}</strong>
              <span>${site.category}</span>
            </div>`,
          ),
        )
        .addTo(map);

      markersRef.current.push(marker);
    }

    mapRef.current = map;

    // ── Cleanup to prevent WebGL context leaks ───────────────────────
    return () => {
      for (const marker of markersRef.current) {
        marker.remove();
      }
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
      setIsLoaded(false);
    };
  }, [onMarkerClick]);

  // ── React to active site changes ──────────────────────────────────────
  useEffect(() => {
    if (!isLoaded) return;
    if (activeSiteId === activeIdRef.current) return;
    activeIdRef.current = activeSiteId ?? null;

    const site = activeSiteId
      ? HERITAGE_SITES.find((s) => s.id === activeSiteId)
      : undefined;

    if (site) {
      flyToSite(site);

      // Highlight the active marker
      for (const marker of markersRef.current) {
        const el = marker.getElement();
        const isActive = el.getAttribute('data-site-id') === activeSiteId;
        el.classList.toggle('marker-active', isActive);
      }
    }
  }, [activeSiteId, flyToSite, isLoaded]);

  return (
    <div className="interactive-map-wrapper">
      <div ref={mapContainerRef} className="interactive-map-canvas" />

      {/* Loading indicator */}
      {!isLoaded && (
        <div className="map-loading-overlay">
          <div className="map-loading-spinner" />
          <span>Loading map…</span>
        </div>
      )}
    </div>
  );
}
