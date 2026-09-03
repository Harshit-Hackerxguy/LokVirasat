'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
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

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

import {
  HeritageCategory,
  HeritageSite,
  HeritageLead,
} from '@/types';

import HeritageLeadDetails from '@/components/heritage/HeritageLeadDetails';

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
    verificationStatus: 'community-corroborated',
    lastUpdated: new Date()
      .toISOString()
      .split('T')[0],
    images: [],
  };
}

export default function MapPage() {
  const router = useRouter();

  // ── API Data ────────────────────────────────────────────────────────────
  const [apiSites, setApiSites] = useState<HeritageSite[]>([]);
  const [apiLeads, setApiLeads] = useState<HeritageLead[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    async function fetchData() {
      setDataLoading(true);
      try {
        const [sitesRes, leadsRes] = await Promise.all([
          fetch(`${API_URL}/api/sites/`),
          fetch(`${API_URL}/api/leads/`),
        ]);

        if (sitesRes.ok) {
          const raw = await sitesRes.json();
          // Map snake_case API fields → camelCase frontend types
          const mapped: HeritageSite[] = raw.map((s: {
            id: string;
            name: string;
            description: string;
            category: HeritageCategory;
            coordinates: [number, number];
            zoom_level: number;
            pitch: number;
            bearing: number;
            verification_status: string;
            last_updated: string | null;
            images: string[];
          }) => ({
            id: s.id,
            name: s.name,
            description: s.description,
            category: s.category,
            coordinates: s.coordinates,
            zoomLevel: s.zoom_level,
            pitch: s.pitch,
            bearing: s.bearing,
            verificationStatus: s.verification_status as HeritageSite['verificationStatus'],
            lastUpdated: s.last_updated ?? undefined,
            images: s.images ?? [],
          }));
          setApiSites(mapped);
        }

        if (leadsRes.ok) {
          const raw = await leadsRes.json();
          const mapped: HeritageLead[] = raw.map((l: {
            id: string;
            name: string;
            description: string;
            category: HeritageCategory;
            approximate_location: [number, number];
            village_or_area: string;
            submitted_by: string;
            submitted_at: string;
            status: HeritageLead['status'];
            assigned_contributor?: string;
          }) => ({
            id: l.id,
            name: l.name,
            description: l.description,
            category: l.category,
            approximateLocation: l.approximate_location,
            villageOrArea: l.village_or_area,
            submittedBy: l.submitted_by,
            submittedAt: l.submitted_at,
            status: l.status,
            assignedContributor: l.assigned_contributor,
          }));
          setApiLeads(mapped);
        }
      } catch (err) {
        console.error('Failed to load heritage data from API:', err);
      } finally {
        setDataLoading(false);
      }
    }

    fetchData();
  }, []);

  const [activeSiteId, setActiveSiteId] =
    useState<string | null>(null);

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [detailsLead, setDetailsLead] =
    useState<HeritageLead | null>(null);

  const [leadDetailsOpen, setLeadDetailsOpen] =
    useState(false);

  /*
   * Sites come directly from the API.
   * Verified leads (from API status='verified') are promoted to sites.
   */
  const allHeritageSites = useMemo(() => {
    const promotedSites = apiLeads
      .filter((l) => l.status === 'verified')
      .map(convertVerifiedLeadToSite);
    return [...apiSites, ...promotedSites];
  }, [apiSites, apiLeads]);

  /*
   * Leads that are NOT verified yet – shown as unconfirmed pins.
   */
  const pendingLeads = useMemo(
    () => apiLeads.filter((l) => l.status !== 'verified'),
    [apiLeads]
  );

  /*
   * Marker click handling
   *
   * Documented / verified heritage:
   *     → Dedicated heritage page
   *
   * Pending heritage lead:
   *     → Existing lead modal
   */
  const handleMarkerClick = useCallback(
    (markerId: string) => {
      // Normal / verified heritage site
      if (!markerId.startsWith('lead:')) {
        setActiveSiteId(markerId);
        router.push(`/heritage/${markerId}`);
        return;
      }

      // Heritage lead
      const leadId = markerId.replace('lead:', '');

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
    [router, pendingLeads]
  );

  /*
   * Clicking a documented site in the sidebar
   * opens its dedicated page.
   */
  const handleSiteSelect = useCallback(
    (siteId: string) => {
      setActiveSiteId(siteId);
      router.push(`/heritage/${siteId}`);
    },
    [router]
  );

  /*
   * Close heritage lead modal.
   */
  const handleCloseLeadDetails = useCallback(() => {
    setLeadDetailsOpen(false);
    setDetailsLead(null);
  }, []);

  return (
    <div className="map-page">

      {/* Loading overlay while API data is being fetched */}
      {dataLoading && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-gray-950/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-white text-sm font-medium">Loading heritage sites…</p>
          </div>
        </div>
      )}

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
              site.verificationStatus === 'community-corroborated'
              || site.verificationStatus === 'evidence-supported'
              || site.verificationStatus === 'authority-verified';

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