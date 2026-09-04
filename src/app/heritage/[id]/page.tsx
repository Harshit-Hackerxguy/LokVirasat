'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import {
  saveOfflineHeritage,
  getOfflineHeritage,
  savePendingAction,
} from '@/lib/offline/db';

import {
  ArrowLeft,
  MapPin,
  Calendar,
  BookOpen,
  Users,
  ShieldCheck,
  AlertTriangle,
  Download,
  Sparkles,
  Mic,
  X,
  Loader2,
} from 'lucide-react';


import {
  HeritageSite,
  HeritageLead,
  HeritageCategory,
  ConditionReport,
} from '@/types';

import StoryRecorder from '@/components/audio/StoryRecorder';
import ConditionReportModal from '@/components/forms/ConditionReportModal';

import styles from './HeritagePage.module.css';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:8000';

interface ApiHeritageSite {
  id: string;
  name: string;
  description: string;
  category: HeritageSite['category'];

  coordinates: [number, number];

  zoom_level?: number;
  pitch?: number;
  bearing?: number;

  verification_status?: string;
  last_updated?: string;

  images?: string[];
}

interface ApiHeritageLead {
  id: string;
  name: string;
  description: string;
  category: HeritageLead['category'];
  approximate_location: [number, number];
  village_or_area: string;
  submitted_by: string;
  submitted_at?: string | null;
  status: HeritageLead['status'];
  assigned_contributor?: string | null;
}

function normalizeApiSite(
  data: ApiHeritageSite
): HeritageSite {
  let verificationStatus:
    HeritageSite['verificationStatus'] =
    'community-reported';

  if (
    data.verification_status ===
    'authority-verified'
  ) {
    verificationStatus =
      'authority-verified';
  } else if (
    data.verification_status ===
    'community-corroborated'
  ) {
    verificationStatus =
      'community-corroborated';
  } else if (
    data.verification_status ===
    'evidence-supported'
  ) {
    verificationStatus =
      'evidence-supported';
  }


  return {
    id: data.id,
    name: data.name,
    description: data.description,
    category: data.category,
    coordinates: data.coordinates,
    zoomLevel: data.zoom_level ?? 15,
    pitch: data.pitch ?? 45,
    bearing: data.bearing ?? 0,
    verificationStatus,
    lastUpdated:
      data.last_updated
        ? data.last_updated.split('T')[0]
        : new Date()
            .toISOString()
            .split('T')[0],
    images: data.images ?? [],
  };
}

export default function HeritagePage() {
  const router = useRouter();
  const params = useParams();

  const id =
    params?.id as string;

  const [storyOpen, setStoryOpen] =
    useState(false);

  const [
    conditionReportOpen,
    setConditionReportOpen,
  ] = useState(false);

  const [
    isOfflineDownloaded,
    setIsOfflineDownloaded,
  ] = useState(false);

  const [
    isDownloading,
    setIsDownloading,
  ] = useState(false);

  const [
    site,
    setSite,
  ] = useState<HeritageSite | null>(null);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function loadHeritageSite() {
      setIsLoading(true);
      setSite(null);

      try {
        const response =
          await fetch(
            `${API_URL}/api/sites/`,
            {
              cache: 'no-store',
            }
          );


        if (response.ok) {
          const sites =
            await response.json();

          if (
            Array.isArray(sites)
          ) {
            const apiSite =
              sites.find(
                (item: ApiHeritageSite) =>
                  item.id === id
              );

            if (apiSite) {
              const normalizedSite =
                normalizeApiSite(
                  apiSite
                );

              if (!cancelled) {
                setSite(
                  normalizedSite
                );

                setIsLoading(
                  false
                );
              }

              return;
            }
          }
        }

        console.warn(
          'Heritage site was not found in API:',
          id
        );
      } catch (error) {
        console.warn(
          'Could not load heritage site from API:',
          error
        );
      }

      try {
        const offlineSite =
          await getOfflineHeritage(
            id
          );

        if (
          offlineSite &&
          !cancelled
        ) {
          setSite(
            offlineSite
          );

          setIsLoading(
            false
          );

          return;
        }
      } catch (error) {
        console.warn(
          'Could not load offline heritage record:',
          error
        );
      }

      try {
        const response =
          await fetch(
            `${API_URL}/api/leads/`,
            {
              cache: 'no-store',
            }
          );

        if (response.ok) {
          const leads =
            (await response.json()) as ApiHeritageLead[];

          if (
            Array.isArray(leads)
          ) {
            const lead =
              leads.find(
                (item) =>
                  item.status ===
                    'verified' &&
                  `verified-${item.id}` ===
                    id
              );

            if (
              lead &&
              !cancelled
            ) {
              const communitySite:
                HeritageSite = {
                id:
                  `verified-${lead.id}`,

                name:
                  lead.name,

                coordinates:
                  lead.approximate_location,

                description:
                  lead.description,

                category:
                  lead.category,

                zoomLevel:
                  15,

                pitch:
                  45,

                bearing:
                  0,

                verificationStatus:
                  'community-corroborated',

                lastUpdated:
                  lead.submitted_at
                    ? lead.submitted_at
                        .split('T')[0]
                    : new Date()
                        .toISOString()
                        .split('T')[0],

                images:
                  [],
              };

              setSite(
                communitySite
              );

              setIsLoading(
                false
              );

              return;
            }
          }
        }
      } catch (error) {
        console.warn(
          'Could not load community heritage lead from API:',
          error
        );
      }

      if (!cancelled) {
        setSite(null);
        setIsLoading(false);
      }
    }

    loadHeritageSite();


    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!site) return;

    const siteId =
      site.id;

    let cancelled = false;

    async function checkOfflineStatus() {
      try {
        const offlineSite =
          await getOfflineHeritage(
            siteId
          );

        if (!cancelled) {
          setIsOfflineDownloaded(
            !!offlineSite
          );
        }
      } catch (error) {
        console.error(
          'Failed to check offline status:',
          error
        );
      }
    }

    checkOfflineStatus();

    return () => {
      cancelled = true;
    };
  }, [site]);

  const handleDownloadOffline =
    async () => {
      if (
        !site ||
        isDownloading
      ) {
        return;
      }

      setIsDownloading(
        true
      );

      try {
        await saveOfflineHeritage(
          site
        );

        setIsOfflineDownloaded(
          true
        );

        alert(
          'Heritage record downloaded for offline use.'
        );
      } catch (error) {
        console.error(
          'Failed to save heritage record offline:',
          error
        );


        alert(
          'Failed to save this heritage record offline.'
        );
      } finally {
        setIsDownloading(
          false
        );
      }
    };

  if (isLoading) {
    return (
      <main
        className={
          styles.page
        }
      >
        <div
          className={
            styles.notFound
          }
        >
          <h1>
            Loading heritage record...
          </h1>

          <p>
            Fetching the latest
            heritage documentation.
          </p>
        </div>
      </main>
    );
  }

  if (!site) {
    return (
      <main
        className={
          styles.page
        }
      >
        <div
          className={
            styles.notFound
          }
        >
          <h1>
            Heritage site not found
          </h1>

          <p>
            This heritage record
            could not be found.
          </p>

          <button
            className={
              styles.primaryButton
            }
            onClick={() =>
              router.push(
                '/map'
              )
            }
          >
            <ArrowLeft
              size={18}
            />

            Back to Map
          </button>
        </div>
      </main>
    );
  }

  const isCommunityVerified =
    site.verificationStatus === 'community-corroborated'
    || site.verificationStatus === 'evidence-supported'
    || site.verificationStatus === 'authority-verified';

  const isAuthorityVerified =
    site.verificationStatus ===
    'authority-verified';

  const statusLabel =
    isAuthorityVerified
      ? 'Authority Verified'
      : isCommunityVerified
        ? 'Community Verified'
        : 'Reported';

  const handleViewOnMap =
    () => {
      router.push(
        `/map?site=${encodeURIComponent(
          site.id
        )}`
      );
    };

  const handleConditionReport = async (
  report: ConditionReport,
  photoFile?: File
) => {
  try {
    /*
     * Step 1: Upload the actual image to Cloudinary
     */
    if (!photoFile) {
      throw new Error(
        'No condition-report photo was provided.'
      );
    }

    const uploadFormData = new FormData();

    uploadFormData.append(
      'file',
      photoFile
    );

    const uploadResponse =
      await fetch(
        `${API_URL}/api/condition-reports/upload`,
        {
          method: 'POST',
          body: uploadFormData,
        }
      );

    if (!uploadResponse.ok) {
      let errorMessage =
        `Image upload failed (${uploadResponse.status})`;

      try {
        const errorData =
          await uploadResponse.json();

        if (errorData?.detail) {
          errorMessage =
            errorData.detail;
        }
      } catch {
        // Keep default error message.
      }

      throw new Error(
        errorMessage
      );
    }

    const uploadResult =
      await uploadResponse.json();

    const cloudinaryUrl =
      uploadResult.url;

    if (!cloudinaryUrl) {
      throw new Error(
        'Cloudinary did not return an image URL.'
      );
    }

    console.log(
      'Condition report photo uploaded:',
      cloudinaryUrl
    );

    /*
     * Step 2: Create the condition report
     * using the permanent Cloudinary URL.
     */
    const response =
      await fetch(
        `${API_URL}/api/condition-reports/`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            id: report.id,

            site_id:
              report.siteId,

            issue_type:
              report.issueType,

            photo_url:
              cloudinaryUrl,

            verified:
              report.verified,

            description:
              report.description,
          }),
        }
      );

    if (!response.ok) {
      let errorMessage =
        `Backend returned ${response.status}`;

      try {
        const errorData =
          await response.json();

        if (errorData?.detail) {
          errorMessage =
            errorData.detail;
        }
      } catch {
        // Keep default error message.
      }

      throw new Error(
        errorMessage
      );
    }

    const savedReport =
      await response.json();

    console.log(
      'Condition report submitted to backend:',
      savedReport
    );

    alert(
      'Condition report submitted successfully. It has been sent for review.'
    );

  } catch (error) {
    console.error(
      'Backend submission failed:',
      error
    );

    /*
     * If anything fails, preserve the existing
     * offline queue behavior.
     */
    try {
      await savePendingAction({
        type: 'condition-report',
        payload: {
          report,
          photoFile:
            photoFile ?? null,
        },
      });

      console.log(
        'Condition report added to offline queue:',
        {
          report,
          photoFile,
        }
      );

      alert(
        'You are offline. The condition report has been saved and will be synced when the connection is restored.'
      );

    } catch (queueError) {
      console.error(
        'Failed to save condition report to offline queue:',
        queueError
      );

      alert(
        'Something went wrong while saving the condition report offline.'
      );
    }
  }
};
  return (
    <main
      className={
        styles.page
      }
    >
      <header
        className={
          styles.topBar
        }
      >
        <button
          className={
            styles.backButton
          }
          onClick={() =>
            router.push(
              '/map'
            )
          }
        >
          <ArrowLeft
            size={20}
          />

          <span>
            Back to Map
          </span>
        </button>

        <div
          className={
            styles.brand
          }
        >
          Lok-Virasat
        </div>
      </header>

      <div
        className={
          styles.container
        }
      >
        <section
          className={
            styles.hero
          }
        >
          <div
            className={
              styles.heroMedia
            }
          >
            {site.images?.[0] ? (
              <img
                src={
                  site.images[0]
                }
                alt={
                  site.name
                }
                className={
                  styles.heroImage
                }
              />
            ) : (
              <div
                className={
                  styles.noImage
                }
              >
                <div
                  className={
                    styles.noImageIcon
                  }
                >
                  <BookOpen
                    size={42}
                  />
                </div>

                <span>
                  No images uploaded yet
                </span>

                <small>
                  Community documentation
                  will appear here.
                </small>
              </div>
            )}
          </div>

          <div
            className={
              styles.heroContent
            }
          >
            <div
              className={
                styles.heroBadges
              }
            >
              <span
                className={
                  styles.categoryBadge
                }
              >
                {site.category}
              </span>

              <span
                className={
                  isCommunityVerified ||
                  isAuthorityVerified
                    ? styles.verifiedBadge
                    : styles.reportedBadge
                }
              >
                <ShieldCheck
                  size={15}
                />

                {statusLabel}
              </span>
            </div>

            <h1
              className={
                styles.heroTitle
              }
            >
              {site.name}
            </h1>

            <div
              className={
                styles.heroMeta
              }
            >
              <span>
                <MapPin
                  size={17}
                />

                {site.coordinates[1].toFixed(
                  5
                )}
                ° N,{' '}

                {site.coordinates[0].toFixed(
                  5
                )}
                ° E
              </span>

              <span>
                <Calendar
                  size={17}
                />

                Updated{' '}

                {site.lastUpdated}
              </span>
            </div>
          </div>
        </section>

        <div
          className={
            styles.contentGrid
          }
        >
          <div
            className={
              styles.mainColumn
            }
          >
            <section
              className={
                styles.card
              }
            >
              <div
                className={
                  styles.sectionHeader
                }
              >
                <div
                  className={
                    styles.sectionIcon
                  }
                >
                  <BookOpen
                    size={23}
                  />
                </div>

                <h2>
                  About this Heritage
                </h2>
              </div>

              <p
                className={
                  styles.sectionText
                }
              >
                {site.description}
              </p>
            </section>

            {site.historicalInformation && (
              <section
                className={
                  styles.card
                }
              >
                <div
                  className={
                    styles.sectionHeader
                  }
                >
                  <div
                    className={
                      styles.sectionIcon
                    }
                  >
                    <BookOpen
                      size={23}
                    />
                  </div>

                  <h2>
                    Historical & Cultural Information
                  </h2>
                </div>

                <p
                  className={
                    styles.sectionText
                  }
                >
                  {
                    site.historicalInformation
                  }
                </p>
              </section>
            )}

            <section
              className={
                styles.card
              }
            >
              <div
                className={
                  styles.sectionHeader
                }
              >
                <div
                  className={`${styles.sectionIcon} ${styles.purpleIcon}`}
                >
                  <Users
                    size={23}
                  />
                </div>

                <h2>
                  Local Stories
                </h2>
              </div>

              {site.oralStories &&
              site.oralStories.length >
                0 ? (
                <>
                  <p
                    className={
                      styles.sectionText
                    }
                  >
                    Oral histories and local
                    knowledge recorded during
                    community documentation.
                  </p>

                  <div className="space-y-4">
                    {site.oralStories.map(
                      (
                        story,
                        index
                      ) => (
                        <div
                          key={`${story.audioUrl}-${index}`}
                          className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`${styles.sectionIcon} ${styles.purpleIcon}`}
                            >
                              <Mic
                                size={18}
                              />
                            </div>

                            <div>
                              <h3 className="font-semibold text-zinc-900 dark:text-white">
                                Local Oral History{' '}
                                {index +
                                  1}
                              </h3>

                              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                Language:{' '}
                                {
                                  story.language
                                }
                              </p>
                            </div>
                          </div>

                          <audio
                            controls
                            src={
                              story.audioUrl
                            }
                            className="mt-4 w-full"
                          />
                        </div>
                      )
                    )}
                  </div>
                </>
              ) : (
                <p
                  className={
                    styles.sectionText
                  }
                >
                  Community-recorded folklore,
                  oral histories, traditions and
                  local knowledge associated with
                  this heritage site will appear here.
                </p>
              )}

              <button
                className={
                  styles.outlineButton
                }
                onClick={() =>
                  setStoryOpen(
                    true
                  )
                }
              >
                <Mic
                  size={18}
                />

                Record a Local Story
              </button>
            </section>

            <section
              className={
                styles.card
              }
            >
              <div
                className={
                  styles.sectionHeader
                }
              >
                <h2>
                  Verification Journey
                </h2>
              </div>

              <p
                className={
                  styles.sectionText
                }
              >
                Building trust through progressive
                verification.
              </p>

              <div
                className={
                  styles.verificationJourney
                }
              >
                <div
                  className={`${styles.verificationStep} ${styles.completedStep}`}
                >
                  <div
                    className={`${styles.stepCircle} ${styles.stepReported}`}
                  >
                    1
                  </div>

                  <span>
                    Reported
                  </span>
                </div>

                <div
                  className={`${styles.stepLine} ${
                    isCommunityVerified ||
                    isAuthorityVerified
                      ? styles.completedLine
                      : ''
                  }`}
                />

                <div
                  className={`${styles.verificationStep} ${
                    isCommunityVerified ||
                    isAuthorityVerified
                      ? styles.completedStep
                      : ''
                  }`}
                >
                  <div
                    className={`${styles.stepCircle} ${styles.stepCommunity}`}
                  >
                    2
                  </div>

                  <span>
                    Community Verified
                  </span>
                </div>

                <div
                  className={`${styles.stepLine} ${
                    isAuthorityVerified
                      ? styles.completedLine
                      : ''
                  }`}
                />

                <div
                  className={`${styles.verificationStep} ${
                    isAuthorityVerified
                      ? styles.completedStep
                      : styles.futureStep
                  }`}
                >
                  <div
                    className={`${styles.stepCircle} ${styles.stepAuthority}`}
                  >
                    3
                  </div>

                  <span>
                    Authority Verified
                  </span>
                </div>
              </div>
            </section>

            <section
              className={
                styles.aiCard
              }
            >
              <div
                className={
                  styles.aiIcon
                }
              >
                <Sparkles
                  size={25}
                />
              </div>

              <div
                className={
                  styles.aiContent
                }
              >
                <h2>
                  Explore with Lok-Virasat AI
                </h2>

                <p>
                  Ask questions about this
                  heritage site's history,
                  cultural significance,
                  traditions and local stories.
                </p>

                <button
                  className={
                    styles.aiButton
                  }
                  onClick={() => {
                    alert(
                      'Lok-Virasat AI will be available here.'
                    );
                  }}
                >
                  Ask about this heritage

                  <span>
                    →
                  </span>
                </button>
              </div>
            </section>
          </div>

          <aside
            className={
              styles.sideColumn
            }
          >
            <section
              className={
                styles.card
              }
            >
              <h3
                className={
                  styles.sideTitle
                }
              >
                Location
              </h3>

              <div
                className={
                  styles.locationBox
                }
              >
                <MapPin
                  size={21}
                  className={
                    styles.locationIcon
                  }
                />

                <div>
                  <strong>
                    Heritage Coordinates
                  </strong>

                  <p>
                    {
                      site.coordinates[1].toFixed(
                        5
                      )
                    }
                    ° N

                    <br />

                    {
                      site.coordinates[0].toFixed(
                        5
                      )
                    }
                    ° E
                  </p>
                </div>
              </div>

              <button
                className={
                  styles.mapButton
                }
                onClick={
                  handleViewOnMap
                }
              >
                <MapPin
                  size={17}
                />

                View on Map
              </button>
            </section>

            <section
              className={
                styles.card
              }
            >
              <h3
                className={
                  styles.sideTitle
                }
              >
                Documentation
              </h3>

              <div
                className={
                  styles.documentationList
                }
              >
                <div>
                  <span>
                    Category
                  </span>

                  <strong>
                    {site.category}
                  </strong>
                </div>

                <div>
                  <span>
                    Status
                  </span>

                  <strong
                    className={
                      isCommunityVerified ||
                      isAuthorityVerified
                        ? styles.blueValue
                        : styles.orangeValue
                    }
                  >
                    {statusLabel}
                  </strong>
                </div>

                <div>
                  <span>
                    Last Updated
                  </span>

                  <strong>
                    {site.lastUpdated}
                  </strong>
                </div>

                {site.documentedBy && (
                  <div>
                    <span>
                      Documented By
                    </span>

                    <strong>
                      {
                        site.documentedBy
                      }
                    </strong>
                  </div>
                )}

                {site.locationVerified && (
                  <div>
                    <span>
                      Location
                    </span>

                    <strong
                      className={
                        styles.blueValue
                      }
                    >
                      GPS Verified
                    </strong>
                  </div>
                )}

                {site.oralStories &&
                  site.oralStories.length >
                    0 && (
                    <div>
                      <span>
                        Local Stories
                      </span>

                      <strong
                        className={
                          styles.blueValue
                        }
                      >
                        {
                          site
                            .oralStories
                            .length
                        }{' '}
                        recorded
                      </strong>
                    </div>
                  )}
              </div>
            </section>

            <div
              className={
                styles.sideActions
              }
            >
              <button
                className={
                  styles.downloadButton
                }
                onClick={
                  handleDownloadOffline
                }
                disabled={
                  isDownloading
                }
              >
                <Download
                  size={19}
                />

                {isDownloading
                  ? 'Downloading...'
                  : isOfflineDownloaded
                    ? 'Available Offline'
                    : 'Download Offline'}
              </button>

              <button
                className={
                  styles.conditionButton
                }
                onClick={() =>
                  setConditionReportOpen(
                    true
                  )
                }
              >
                <AlertTriangle
                  size={18}
                />

                Report Condition
              </button>
            </div>
          </aside>
        </div>
      </div>

      {storyOpen && (
        <div
          className={
            styles.modalBackdrop
          }
          onClick={() =>
            setStoryOpen(
              false
            )
          }
        >
          <div
            className={
              styles.storyModal
            }
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <button
              className={
                styles.modalClose
              }
              onClick={() =>
                setStoryOpen(
                  false
                )
              }
              aria-label="Close"
            >
              <X
                size={20}
              />
            </button>

            <StoryRecorder />
          </div>
        </div>
      )}

      <ConditionReportModal
        isOpen={
          conditionReportOpen
        }
        onClose={() =>
          setConditionReportOpen(
            false
          )
        }
        siteId={
          site.id
        }
        onSubmit={
          handleConditionReport
        }
      />
    </main>
  );
}