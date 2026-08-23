'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  MapPin,
  Landmark,
  Trees,
  BookOpen,
  Castle,
  Palette,
  ChevronRight,
  Layers,
} from 'lucide-react';

import { HERITAGE_SITES } from '@/data/heritageSites';
import { HERITAGE_LEADS } from '@/data/heritageLeads';
import {
  HeritageCategory,
  HeritageSite,
} from '@/types';

import HeritageSiteDetails from '@/components/heritage/HeritageSiteDetails';

const InteractiveMap = dynamic(
  () => import('@/components/map/InteractiveMap'),
  {
    ssr: false,
  }
);

function CategoryIcon({
  category,
}: {
  category: HeritageCategory;
}) {
  switch (category) {
    case HeritageCategory.Monument:
      return <Landmark size={16} />;

    case HeritageCategory.SacredGrove:
      return <Trees size={16} />;

    case HeritageCategory.FolkloreSite:
      return <BookOpen size={16} />;

    case HeritageCategory.AncientRuins:
      return <Castle size={16} />;

    case HeritageCategory.TraditionalCraftHub:
      return <Palette size={16} />;

    default:
      return <MapPin size={16} />;
  }
}

export default function MapPage() {
  const [activeSiteId, setActiveSiteId] =
    useState<string | null>(null);

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [detailsSite, setDetailsSite] =
    useState<HeritageSite | null>(null);

  const [detailsOpen, setDetailsOpen] =
    useState(false);

  const handleMarkerClick = useCallback(
    (markerId: string) => {
      // Normal heritage site
      if (!markerId.startsWith('lead:')) {
        setActiveSiteId(markerId);
        setSidebarOpen(true);

        const site = HERITAGE_SITES.find(
          (item) => item.id === markerId
        );

        if (site) {
          setDetailsSite(site);
          setDetailsOpen(true);
        }

        return;
      }

      // Heritage lead
      const leadId = markerId.replace('lead:', '');

      const lead = HERITAGE_LEADS.find(
        (item) => item.id === leadId
      );

      if (lead) {
        setActiveSiteId(null);
        setSidebarOpen(true);

        window.alert(
          `${lead.name}\n\n` +
            `Heritage Lead\n` +
            `Location: ${lead.villageOrArea}\n` +
            `Submitted by: ${lead.submittedBy}\n\n` +
            `Status: ${lead.status.replace('-', ' ')}\n\n` +
            `This lead requires documentation by a contributor.`
        );
      }
    },
    []
  );

  const handleSiteSelect = useCallback(
    (siteId: string) => {
      setActiveSiteId(siteId);

      const site = HERITAGE_SITES.find(
        (item) => item.id === siteId
      );

      if (site) {
        setDetailsSite(site);
        setDetailsOpen(true);
      }
    },
    []
  );

  const handleCloseDetails = useCallback(() => {
    setDetailsOpen(false);
    setDetailsSite(null);
  }, []);

  return (
    <div className="map-page">

      {/* Full-screen interactive map */}
      <InteractiveMap
        activeSiteId={activeSiteId}
        onMarkerClick={handleMarkerClick}
      />

      {/* Sidebar toggle */}
      <button
        className={`map-sidebar-toggle ${
          sidebarOpen ? 'open' : ''
        }`}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={
          sidebarOpen
            ? 'Close sidebar'
            : 'Open sidebar'
        }
      >
        <Layers size={20} />
      </button>

      {/* Sidebar */}
      <aside
        className={`map-sidebar ${
          sidebarOpen ? 'open' : ''
        }`}
      >
        <div className="map-sidebar-header">
          <div>
            <h2>Heritage Sites</h2>

            <span className="map-sidebar-count">
              {HERITAGE_SITES.length} documented sites
            </span>
          </div>
        </div>

        <div className="map-sidebar-list">

          {/* Documented heritage sites */}
          {HERITAGE_SITES.map((site) => {
            const isActive =
              activeSiteId === site.id;

            return (
              <button
                key={site.id}
                className={`map-sidebar-item ${
                  isActive ? 'active' : ''
                }`}
                onClick={() =>
                  handleSiteSelect(site.id)
                }
              >
                <div className="map-sidebar-item-icon">
                  <CategoryIcon
                    category={site.category}
                  />
                </div>

                <div className="map-sidebar-item-info">
                  <span className="map-sidebar-item-name">
                    {site.name}
                  </span>

                  <span className="map-sidebar-item-category">
                    {site.category}
                  </span>
                </div>

                <ChevronRight
                  size={16}
                  className="map-sidebar-item-arrow"
                />
              </button>
            );
          })}

          {/* Heritage leads */}
          {HERITAGE_LEADS.length > 0 && (
            <>
              <div className="px-4 pt-5 pb-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Needs Documentation
                </div>
              </div>

              {HERITAGE_LEADS.map((lead) => (
                <button
                  key={lead.id}
                  type="button"
                  className="map-sidebar-item"
                  onClick={() => {
                    window.alert(
                      `${lead.name}\n\n` +
                        `Heritage Lead\n` +
                        `Location: ${lead.villageOrArea}\n` +
                        `Submitted by: ${lead.submittedBy}\n\n` +
                        `Status: ${lead.status.replace('-', ' ')}`
                    );
                  }}
                >
                  <div className="map-sidebar-item-icon">
                    <MapPin size={16} />
                  </div>

                  <div className="map-sidebar-item-info">
                    <span className="map-sidebar-item-name">
                      {lead.name}
                    </span>

                    <span className="map-sidebar-item-category">
                      Heritage Lead · {lead.villageOrArea}
                    </span>
                  </div>

                  <ChevronRight
                    size={16}
                    className="map-sidebar-item-arrow"
                  />
                </button>
              ))}
            </>
          )}

        </div>
      </aside>

      {/* Heritage site details */}
      {detailsOpen && detailsSite && (
        <HeritageSiteDetails
          site={detailsSite}
          onClose={handleCloseDetails}
          onReportCondition={() => {
            console.log(
              'Open condition report for:',
              detailsSite.id
            );
          }}
        />
      )}

    </div>
  );
}