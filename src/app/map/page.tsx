'use client';

import {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';

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

import {
  getAllOfflineHeritage,
  getPendingActions,
} from '@/lib/offline/db';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:8000';

import {
  HeritageCategory,
  HeritageSite,
  HeritageLead,
} from '@/types';

import HeritageLeadDetails from '@/components/heritage/HeritageLeadDetails';

const InteractiveMap = dynamic(
  () =>
    import('@/components/map/InteractiveMap'),
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

    coordinates:
      lead.approximateLocation,

    description:
      lead.description,

    category:
      lead.category,

    zoomLevel: 15,

    pitch: 45,

    bearing: 0,
    verificationStatus:
      'community-corroborated',

    lastUpdated:
      new Date()
        .toISOString()
        .split('T')[0],
    images: [],
  };
}

export default function MapPage() {
  const router = useRouter();

  const [apiSites, setApiSites] =
    useState<HeritageSite[]>([]);

  const [apiLeads, setApiLeads] =
    useState<HeritageLead[]>([]);

  const [dataLoading, setDataLoading] =
    useState(true);
  const [dataError, setDataError] =
    useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] =
    useState(false);
  const [pendingActionCount, setPendingActionCount] =
    useState(0);
  const hasFetched = useRef(false);

  const refreshPendingActionCount =
    useCallback(async () => {
      try {
        const actions =
          await getPendingActions();

        setPendingActionCount(
          actions.length
        );
      } catch (error) {
        console.warn(
          'Could not read offline pending actions:',
          error
        );
      }
    }, []);

  const loadData = useCallback(
    async () => {
      setDataLoading(true);
      setDataError(null);
      let apiSitesLoaded = false;

      try {
        const [
          sitesRes,
          leadsRes,
        ] = await Promise.all([
          fetch(
            `${API_URL}/api/sites/`,
            {
              cache: 'no-store',
            }
          ),

          fetch(
            `${API_URL}/api/leads/`,
            {
              cache: 'no-store',
            }
          ),
        ]);

        if (sitesRes.ok) {
  const raw = await sitesRes.json();

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
    verificationStatus:
      s.verification_status as HeritageSite['verificationStatus'],
    lastUpdated:
      s.last_updated ?? undefined,
    images: s.images ?? [],
  }));

  setApiSites(mapped);
  apiSitesLoaded = true;
  setIsOfflineMode(false);

  // Automatically cache lightweight site data
  try {
    const { saveOfflineHeritage } =
      await import('@/lib/offline/db');

    await Promise.all(
      mapped.map((site) =>
        saveOfflineHeritage(site)
      )
    );
  } catch (cacheError) {
    console.warn(
      'Could not cache heritage sites:',
      cacheError
    );
  }
        }

        if (leadsRes.ok) {
          const raw =
            await leadsRes.json();

          const mapped:
            HeritageLead[] =
            raw.map(
              (l: {
                id: string;
                name: string;
                description: string;
                category: HeritageCategory;
                approximate_location:
                  [number, number];
                village_or_area:
                  string;
                submitted_by:
                  string;
                submitted_at:
                  string;
                status:
                  HeritageLead['status'];
                assigned_contributor?:
                  string;
              }) => ({
                id: l.id,

                name: l.name,

                description:
                  l.description,

                category:
                  l.category,

                approximateLocation:
                  l.approximate_location,

                villageOrArea:
                  l.village_or_area,

                submittedBy:
                  l.submitted_by,

                submittedAt:
                  l.submitted_at,

                status:
                  l.status,

                assignedContributor:
                  l.assigned_contributor,
              })
            );

          setApiLeads(mapped);
        } else {
          setApiLeads([]);
        }

      } catch (error) {

        console.warn(
          'Backend unavailable. Loading downloaded heritage sites from IndexedDB.',
          error
        );
      }

      if (!apiSitesLoaded) {
        try {
          const offlineSites =
            await getAllOfflineHeritage();

          setApiSites(
            offlineSites
          );
          setApiLeads([]);

          setIsOfflineMode(true);

          console.log(
            `Offline mode: loaded ${offlineSites.length} downloaded heritage site(s).`
          );
        } catch (offlineError) {
          console.error(
            'Failed to load offline heritage sites:',
            offlineError
          );

          setApiSites([]);

          setApiLeads([]);

          setIsOfflineMode(true);
          setDataError(
            'No downloaded heritage sites are available.'
          );
        }
      }

      setDataLoading(false);
    },
    []
  );

  useEffect(() => {
    if (hasFetched.current) {
      return;
    }

    hasFetched.current = true;

    loadData();
    refreshPendingActionCount();
  }, [
    loadData,
    refreshPendingActionCount,
  ]);

  useEffect(() => {
    const handleOnline = () => {
      console.log(
        'Network connection restored. Refreshing heritage data...'
      );

      loadData();
      refreshPendingActionCount();
    };
    const handleOffline =
      async () => {
        console.log(
          'Network connection lost. Loading downloaded heritage data...'
        );

        try {
          setDataLoading(true);

          const offlineSites =
            await getAllOfflineHeritage();

          setApiSites(
            offlineSites
          );

          setApiLeads([]);

          setIsOfflineMode(true);
          await refreshPendingActionCount();
        } catch (error) {
          console.error(
            'Failed to load offline heritage sites:',
            error
          );

          setApiSites([]);

          setApiLeads([]);

          setIsOfflineMode(true);
        } finally {
          setDataLoading(false);
        }
      };

    window.addEventListener(
      'online',
      handleOnline
    );

    window.addEventListener(
      'offline',
      handleOffline
    );

    return () => {
      window.removeEventListener(
        'online',
        handleOnline
      );

      window.removeEventListener(
        'offline',
        handleOffline
      );
    };
  }, [
    loadData,
    refreshPendingActionCount,
  ]);

  useEffect(() => {
    const interval =
      window.setInterval(
        refreshPendingActionCount,
        3000
      );

    return () =>
      window.clearInterval(
        interval
      );
  }, [
    refreshPendingActionCount,
  ]);

  const [activeSiteId, setActiveSiteId] =
    useState<string | null>(null);

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [detailsLead, setDetailsLead] =
    useState<HeritageLead | null>(null);

  const [leadDetailsOpen, setLeadDetailsOpen] =
    useState(false);

  const allHeritageSites =
    useMemo(() => {
      if (isOfflineMode) {
        return apiSites;
      }
      const promotedSites =
        apiLeads
          .filter(
            (l) =>
              l.status ===
              'verified'
          )
          .map(
            convertVerifiedLeadToSite
          );

      return [
        ...apiSites,
        ...promotedSites,
      ];
    }, [
      apiSites,
      apiLeads,
      isOfflineMode,
    ]);

  const pendingLeads =
    useMemo(() => {
      if (isOfflineMode) {
        return [];
      }

      return apiLeads.filter(
        (l) =>
          l.status !==
          'verified'
      );
    }, [
      apiLeads,
      isOfflineMode,
    ]);

  const handleMarkerClick =
    useCallback(
      (markerId: string) => {
        if (
          !markerId.startsWith(
            'lead:'
          )
        ) {
          setActiveSiteId(
            markerId
          );

          router.push(
            `/heritage/${markerId}`
          );

          return;
        }
        const leadId =
          markerId.replace(
            'lead:',
            ''
          );

        const lead =
          pendingLeads.find(
            (item) =>
              item.id ===
              leadId
          );

        if (lead) {
          setActiveSiteId(
            null
          );

          setSidebarOpen(
            true
          );

          setDetailsLead(
            lead
          );

          setLeadDetailsOpen(
            true
          );
        }
      },
      [
        router,
        pendingLeads,
      ]
    );

  const handleSiteSelect =
    useCallback(
      (siteId: string) => {
        setActiveSiteId(
          siteId
        );

        router.push(
          `/heritage/${siteId}`
        );
      },
      [router]
    );

  const handleCloseLeadDetails =
    useCallback(() => {
      setLeadDetailsOpen(
        false
      );

      setDetailsLead(
        null
      );
    }, []);

  return (
    <div className="map-page">

      {/* ═══════════════════════════════════════
          LOADING OVERLAY
      ═══════════════════════════════════════ */}

      {dataLoading && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-gray-950/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">

            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />

            <p className="text-white text-sm font-medium">
              Loading heritage sites…
            </p>

          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          OFFLINE INDICATOR
      ═══════════════════════════════════════ */}

      {isOfflineMode && (
        <div className="fixed top-20 left-1/2 z-[2000] flex -translate-x-1/2 flex-col items-center gap-1.5 rounded-2xl bg-gray-900/95 px-5 py-3 text-center text-white shadow-lg backdrop-blur-sm">
          <span className="text-sm font-semibold">
            Offline · Showing{' '}
            {allHeritageSites.length}{' '}
            downloaded{' '}
            {allHeritageSites.length ===
            1
              ? 'site'
              : 'sites'}
          </span>

          {pendingActionCount > 0 && (
            <span className="text-xs font-medium text-gray-300">
              {pendingActionCount}{' '}
              {pendingActionCount ===
              1
                ? 'report'
                : 'reports'}{' '}
              waiting to sync
            </span>
          )}
        </div>
      )}
<div className="fixed text-center top-20 right-5 z-[1900] w-[320px] max-w-[calc(100vw-2rem)] rounded-2xl bg-gray-900/95 px-4 py-4 shadow-xl backdrop-blur-sm">
  <p className="mb-3 text-center text-sm font-bold uppercase tracking-wide text-gray-200">
    Heritage Trust Level
  </p>

  <div className="flex flex-col gap-2.5 text-sm font-semibold text-gray-100">
    <div className="flex min-w-0 items-center gap-3">
      <span className="h-3.5 w-3.5 shrink-0 rounded-full bg-yellow-400" />
      <span className="min-w-0 break-words">
        Community Reported
      </span>
    </div>

    <div className="flex min-w-0 items-center gap-3">
      <span className="h-3.5 w-3.5 shrink-0 rounded-full bg-orange-500" />
      <span className="min-w-0 break-words">
        Community Verified
      </span>
    </div>

    <div className="flex min-w-0 items-center gap-3">
      <span className="h-3.5 w-3.5 shrink-0 rounded-full bg-green-500" />
      <span className="min-w-0 break-words">
        Authority Verified
      </span>
    </div>
  </div>
</div>

      {/* ═══════════════════════════════════════
          FULL-SCREEN INTERACTIVE MAP
      ═══════════════════════════════════════ */}

      {!dataLoading &&
        !isOfflineMode &&
        allHeritageSites.length ===
          0 && (
          <div className="fixed inset-0 z-[1800] flex items-center justify-center bg-gray-950/30 px-4 backdrop-blur-[2px]">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl dark:bg-gray-900">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <MapPin size={24} />
              </div>

              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                No heritage records available
              </h2>

              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                We couldn't load any heritage sites right now.
                Please try again.
              </p>

              <button
                type="button"
                onClick={loadData}
                className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

      {dataError &&
        isOfflineMode &&
        allHeritageSites.length === 0 && (
          <div className="fixed top-20 left-1/2 z-[2000] w-[min(92vw,420px)] -translate-x-1/2 rounded-2xl bg-gray-900/95 px-5 py-4 text-center text-white shadow-xl backdrop-blur-sm">
            <p className="text-sm font-semibold">
              No offline heritage records available
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Download heritage records while online to access them offline.
            </p>
          </div>
        )}

      <InteractiveMap
        activeSiteId={
          activeSiteId
        }
        onMarkerClick={
          handleMarkerClick
        }
        heritageSites={
          allHeritageSites
        }
        heritageLeads={
          pendingLeads
        }
      />

      {/* ═══════════════════════════════════════
          SIDEBAR TOGGLE
      ═══════════════════════════════════════ */}

      <button
        className={`map-sidebar-toggle ${
          sidebarOpen
            ? 'open'
            : ''
        }`}
        onClick={() =>
          setSidebarOpen(
            !sidebarOpen
          )
        }
        aria-label={
          sidebarOpen
            ? 'Close sidebar'
            : 'Open sidebar'
        }
      >
        <Layers size={20} />
      </button>

      {/* ═══════════════════════════════════════
          SIDEBAR
      ═══════════════════════════════════════ */}

      <aside
        className={`map-sidebar ${
          sidebarOpen
            ? 'open'
            : ''
        }`}
      >

        <div className="map-sidebar-header">

          <div>

            <h2>
              Heritage Sites
            </h2>

            <span className="map-sidebar-count">

              {allHeritageSites.length}{' '}

              {isOfflineMode
                ? 'downloaded sites'
                : 'documented sites'}

            </span>

          </div>

        </div>

        <div className="map-sidebar-list">

          {/* ═══════════════════════════════════
              DOCUMENTED / DOWNLOADED SITES
          ═══════════════════════════════════ */}

          {allHeritageSites.map(
            (site) => {
              const isActive =
                activeSiteId ===
                site.id;

              const isCommunityVerified =
                site.verificationStatus ===
                  'community-corroborated' ||
                site.verificationStatus ===
                  'evidence-supported';

              const isAuthorityVerified =
                site.verificationStatus ===
                'authority-verified';

              return (
                <button
                  key={site.id}
                  className={`map-sidebar-item ${
                    isActive
                      ? 'active'
                      : ''
                  }`}
                  onClick={() =>
                    handleSiteSelect(
                      site.id
                    )
                  }
                >

                  <div className="map-sidebar-item-icon">

                    <CategoryIcon
                      category={
                        site.category
                      }
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

                        <ShieldCheck
                          size={12}
                        />

                        Community Verified

                      </span>
                    )}

                    {isAuthorityVerified && (
                      <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-blue-600">

                        <ShieldCheck
                          size={12}
                        />

                        Authority Verified

                      </span>
                    )}

                    {isOfflineMode && (
                      <span className="mt-1 text-xs font-medium text-gray-400">
                        Available Offline
                      </span>
                    )}

                  </div>

                  <ChevronRight
                    size={16}
                    className="map-sidebar-item-arrow"
                  />

                </button>
              );
            }
          )}

          {/* ═══════════════════════════════════
              EMPTY OFFLINE STATE
          ═══════════════════════════════════ */}

          {isOfflineMode &&
            allHeritageSites.length ===
              0 && (
              <div className="px-5 py-8 text-center">

                <div className="mb-3 text-gray-400">
                  <MapPin
                    size={28}
                    className="mx-auto"
                  />
                </div>

                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  No downloaded sites
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Download heritage records
                  while online to access them
                  here without an internet
                  connection.
                </p>

              </div>
            )}

          {/* ═══════════════════════════════════
              ONLINE HERITAGE LEADS
          ═══════════════════════════════════ */}

          {!isOfflineMode &&
            pendingLeads.length >
              0 && (
              <>
                <div className="px-4 pt-5 pb-2">

                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Needs Documentation
                  </div>

                </div>

                {pendingLeads.map(
                  (lead) => (
                    <button
                      key={
                        lead.id
                      }
                      type="button"
                      className="map-sidebar-item"
                      onClick={() => {
                        setDetailsLead(
                          lead
                        );

                        setLeadDetailsOpen(
                          true
                        );
                      }}
                    >

                      <div className="map-sidebar-item-icon">

                        <MapPin
                          size={16}
                        />

                      </div>

                      <div className="map-sidebar-item-info">

                        <span className="map-sidebar-item-name">
                          {lead.name}
                        </span>

                        <span className="map-sidebar-item-category">
                          Heritage Lead ·{' '}
                          {
                            lead.villageOrArea
                          }
                        </span>

                      </div>

                      <ChevronRight
                        size={16}
                        className="map-sidebar-item-arrow"
                      />

                    </button>
                  )
                )}
              </>
            )}

        </div>
      </aside>

      {/* ═══════════════════════════════════════
          HERITAGE LEAD DETAILS
      ═══════════════════════════════════════ */}

      {leadDetailsOpen &&
        detailsLead && (
          <HeritageLeadDetails
            lead={
              detailsLead
            }
            onClose={
              handleCloseLeadDetails
            }
          />
        )}

    </div>
  );
}
