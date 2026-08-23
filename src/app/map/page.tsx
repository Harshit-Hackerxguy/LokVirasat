'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Landmark, Mountain, ChevronRight, Layers } from 'lucide-react';

import { HERITAGE_SITES } from '@/data/heritageSites';
import { HeritageCategory } from '@/types';

// Dynamically import the map to avoid SSR issues with MapLibre WebGL
const InteractiveMap = dynamic(
  () => import('@/components/map/InteractiveMap'),
  { ssr: false },
);

// ─── Helpers ────────────────────────────────────────────────────────────────

function CategoryIcon({ category }: { category: HeritageCategory }) {
  switch (category) {
    case HeritageCategory.Natural:
      return <Mountain size={16} />;
    case HeritageCategory.Monument:
      return <Landmark size={16} />;
    default:
      return <MapPin size={16} />;
  }
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function MapPage() {
  const [activeSiteId, setActiveSiteId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleMarkerClick = useCallback((siteId: string) => {
    setActiveSiteId(siteId);
    setSidebarOpen(true);
  }, []);

  const handleSiteSelect = useCallback((siteId: string) => {
    setActiveSiteId(siteId);
  }, []);

  return (
    <div className="map-page">
      {/* ── Full-screen interactive map ──────────────────────────────────── */}
      <InteractiveMap
        activeSiteId={activeSiteId}
        onMarkerClick={handleMarkerClick}
      />

      {/* ── Sidebar toggle ──────────────────────────────────────────────── */}
      <button
        className={`map-sidebar-toggle ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        <Layers size={20} />
      </button>

      {/* ── Sites sidebar ───────────────────────────────────────────────── */}
      <aside className={`map-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="map-sidebar-header">
          <h2>Heritage Sites</h2>
          <span className="map-sidebar-count">{HERITAGE_SITES.length} sites</span>
        </div>

        <div className="map-sidebar-list">
          {HERITAGE_SITES.map((site) => {
            const isActive = activeSiteId === site.id;
            return (
              <button
                key={site.id}
                className={`map-sidebar-item ${isActive ? 'active' : ''}`}
                onClick={() => handleSiteSelect(site.id)}
              >
                <div className="map-sidebar-item-icon">
                  <CategoryIcon category={site.category} />
                </div>
                <div className="map-sidebar-item-info">
                  <span className="map-sidebar-item-name">{site.name}</span>
                  <span className="map-sidebar-item-category">
                    {site.category}
                  </span>
                </div>
                <ChevronRight size={16} className="map-sidebar-item-arrow" />
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── Active site detail card ─────────────────────────────────────── */}
      {activeSiteId && (
        <div className="map-detail-card">
          {(() => {
            const site = HERITAGE_SITES.find((s) => s.id === activeSiteId);
            if (!site) return null;
            return (
              <>
                <div className="map-detail-header">
                  <div className="map-detail-category">
                    <CategoryIcon category={site.category} />
                    <span>{site.category}</span>
                  </div>
                  <button
                    className="map-detail-close"
                    onClick={() => setActiveSiteId(null)}
                    aria-label="Close detail"
                  >
                    ×
                  </button>
                </div>
                <h3 className="map-detail-title">{site.name}</h3>
                <p className="map-detail-description">{site.description}</p>
                <div className="map-detail-coords">
                  <MapPin size={14} />
                  <span>
                    {site.coordinates[1].toFixed(4)}°N,{' '}
                    {site.coordinates[0].toFixed(4)}°E
                  </span>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
