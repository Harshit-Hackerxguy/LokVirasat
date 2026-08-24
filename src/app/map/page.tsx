'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
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
  ShieldCheck,
} from 'lucide-react';

import { HERITAGE_SITES } from '@/data/heritageSites';
import { HERITAGE_LEADS } from '@/data/heritageLeads';

import {
  HeritageCategory,
  HeritageSite,
  HeritageLead,
} from '@/types';

import HeritageSiteDetails from '@/components/heritage/HeritageSiteDetails';
import HeritageLeadDetails from '@/components/heritage/HeritageLeadDetails';
import { useAuthStore } from '@/store/useAuthStore';

const InteractiveMap = dynamic(
  () => import('@/components/map/InteractiveMap'),
  {
    ssr: false,
  }
);

const STORAGE_KEY = 'lokvirasat-heritage-leads';

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

function convertVerifiedLeadToSite(
  lead: HeritageLead
): HeritageSite {
  return {
    id: `verified-${lead.id}`,
    name: lead.name,
    coordinates: lead.approximateLocation,
    description: lead.description,
    category: lead.category,
    zoomLevel: 15,
    pitch: 45,
    bearing: 0,
    verificationStatus: 'community-verified',
    lastUpdated: new Date()
      .toISOString()
      .split('T')[0],
    images: [],
  };
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

  const [detailsLead, setDetailsLead] =
    useState<HeritageLead | null>(null);

  const [leadDetailsOpen, setLeadDetailsOpen] =
    useState(false);

  const [verifiedLeads, setVerifiedLeads] =
    useState<HeritageLead[]>([]);

  /*
   * Load verified contributions from localStorage.
   */
  useEffect(() => {
    try {
      const saved =
        window.localStorage.getItem(STORAGE_KEY);

      if (!saved) {
        setVerifiedLeads([]);
        return;
      }

      const parsed =
        JSON.parse(saved) as HeritageLead[];

      if (Array.isArray(parsed)) {
        setVerifiedLeads(
          parsed.filter(
            (lead) => lead.status === 'verified'
          )
        );
      }
    } catch (error) {
      console.error(
        'Failed to load verified heritage leads:',
        error
      );

      setVerifiedLeads([]);
    }
  }, []);

  /*
   * Combine permanent heritage sites with
   * moderator-verified community submissions.
   */
  const allHeritageSites = useMemo(() => {
    const verifiedSites =
      verifiedLeads.map(
        convertVerifiedLeadToSite
      );

    return [
      ...HERITAGE_SITES,
      ...verifiedSites,
    ];
  }, [verifiedLeads]);

  /*
   * Leads that are NOT verified yet.
   */
  const pendingLeads = useMemo(() => {
    try {
      const saved =
        window.localStorage.getItem(STORAGE_KEY);

      if (!saved) {
        return HERITAGE_LEADS.filter(
          (lead) => lead.status !== 'verified'
        );
      }

      const parsed =
        JSON.parse(saved) as HeritageLead[];

      if (!Array.isArray(parsed)) {
        return HERITAGE_LEADS.filter(
          (lead) => lead.status !== 'verified'
        );
      }

      return parsed.filter(
        (lead) => lead.status !== 'verified'
      );
    } catch {
      return HERITAGE_LEADS.filter(
        (lead) => lead.status !== 'verified'
      );
    }
  }, [verifiedLeads]);

  const handleMarkerClick = useCallback(
    (markerId: string) => {
      /*
       * Normal / verified heritage site
       */
      if (!markerId.startsWith('lead:')) {
        setActiveSiteId(markerId);
        setSidebarOpen(true);

        const site = allHeritageSites.find(
          (item) => item.id === markerId
        );

        if (site) {
          setDetailsSite(site);
          setDetailsOpen(true);
        }

        return;
      }

      /*
       * Heritage lead
       */
      const leadId =
        markerId.replace('lead:', '');

      const lead = pendingLeads.find(
        (item) => item.id === leadId
      );

      if (lead) {
        setActiveSiteId(null);
        setSidebarOpen(true);
        setDetailsLead(lead);
        setLeadDetailsOpen(true);
      }
    },
    [allHeritageSites, pendingLeads]
  );

  const handleSiteSelect = useCallback(
    (siteId: string) => {
      setActiveSiteId(siteId);

      const site = allHeritageSites.find(
        (item) => item.id === siteId
      );

      if (site) {
        setDetailsSite(site);
        setDetailsOpen(true);
      }
    },
    [allHeritageSites]
  );

  const handleCloseDetails = useCallback(() => {
    setDetailsOpen(false);
    setDetailsSite(null);
  }, []);

  const handleCloseLeadDetails = useCallback(() => {
    setLeadDetailsOpen(false);
    setDetailsLead(null);
  }, []);

  return (
    <div className="map-page">

      {/* Full-screen interactive map */}
      <InteractiveMap
        activeSiteId={activeSiteId}
        onMarkerClick={handleMarkerClick}
        heritageSites={allHeritageSites}
        heritageLeads={pendingLeads}
      />

      {/* Sidebar toggle */}
      <button
        className={`map-sidebar-toggle ${
          sidebarOpen ? 'open' : ''
        }`}
        onClick={() =>
          setSidebarOpen(!sidebarOpen)
        }
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
              {allHeritageSites.length} documented sites
            </span>
          </div>
        </div>

        <div className="map-sidebar-list">

          {/* Documented + verified heritage sites */}
          {allHeritageSites.map((site) => {
            const isActive =
              activeSiteId === site.id;

            const isCommunityVerified =
              site.verificationStatus ===
              'community-verified';

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

                  {isCommunityVerified && (
                    <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-blue-600">
                      <ShieldCheck size={12} />
                      Community Verified
                    </span>
                  )}

                </div>

                <ChevronRight
                  size={16}
                  className="map-sidebar-item-arrow"
                />
              </button>
            );
          })}

          {/* Heritage leads */}
          {pendingLeads.length > 0 && (
            <>
              <div className="px-4 pt-5 pb-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Needs Documentation
                </div>
              </div>

              {pendingLeads.map((lead) => (
                <button
                  key={lead.id}
                  type="button"
                  className="map-sidebar-item"
                  onClick={() => {
                    setDetailsLead(lead);
                    setLeadDetailsOpen(true);
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
            // Condition report feature – coming soon
          }}
        />
      )}

      {/* Heritage lead details */}
      {leadDetailsOpen && detailsLead && (
        <HeritageLeadDetails
          lead={detailsLead}
          onClose={handleCloseLeadDetails}
        />
      )}

    </div>
  );
}