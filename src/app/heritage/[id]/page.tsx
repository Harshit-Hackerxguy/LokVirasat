'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

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
} from 'lucide-react';

import { HERITAGE_SITES } from '@/data/heritageSites';

import {
  HeritageSite,
  HeritageLead,
  ConditionReport,
} from '@/types';

import StoryRecorder from '@/components/audio/StoryRecorder';
import ConditionReportModal from '@/components/forms/ConditionReportModal';

import styles from './HeritagePage.module.css';

const STORAGE_KEY =
  'lokvirasat-heritage-leads';

const CONDITION_REPORTS_KEY =
  'lokvirasat-condition-reports';

export default function HeritagePage() {
  const router = useRouter();
  const params = useParams();

  const id = params?.id as string;

  /* ─────────────────────────────────────────────
     UI STATE
  ───────────────────────────────────────────── */

  const [storyOpen, setStoryOpen] =
    useState(false);

  const [conditionReportOpen, setConditionReportOpen] =
    useState(false);

  /* ─────────────────────────────────────────────
     FIND HERITAGE SITE
  ───────────────────────────────────────────── */

  const site = useMemo<HeritageSite | null>(() => {

    /*
     * First check the normal/static heritage sites.
     */
    const normalSite = HERITAGE_SITES.find(
      (item) => item.id === id
    );

    if (normalSite) {
      return normalSite;
    }

    /*
     * Verified community submissions are stored
     * as HeritageLeads in localStorage.
     */
    try {

      const saved =
        window.localStorage.getItem(
          STORAGE_KEY
        );

      if (!saved) return null;

      const parsed =
        JSON.parse(saved) as HeritageLead[];

      if (!Array.isArray(parsed)) {
        return null;
      }

      const lead = parsed.find(
        (item) =>
          item.status === 'verified' &&
          `verified-${item.id}` === id
      );

      if (!lead) {
        return null;
      }

      /*
       * Convert the complete verified lead
       * into a HeritageSite.
       *
       * IMPORTANT:
       * Preserve contributor documentation.
       */

      return {

        id: `verified-${lead.id}`,

        name: lead.name,

        /*
         * Prefer GPS-verified coordinates.
         */
        coordinates:
          lead.verifiedCoordinates ??
          lead.approximateLocation,

        description:
          lead.description,

        category:
          lead.category,

        zoomLevel: 15,

        pitch: 45,

        bearing: 0,

        verificationStatus:
          'community-verified',

        lastUpdated:
          lead.documentedAt
            ? lead.documentedAt.split('T')[0]
            : new Date()
                .toISOString()
                .split('T')[0],

        /*
         * Preserve contributor photos.
         */
        images:
          lead.photos ?? [],

        /*
         * Preserve historical information.
         */
        historicalInformation:
          lead.historicalInformation,

        /*
         * Preserve location verification.
         */
        locationVerified:
          lead.locationVerified,

        verifiedCoordinates:
          lead.verifiedCoordinates,

        /*
         * Preserve recorded local stories.
         */
        oralStories:
          lead.oralStories ?? [],

        /*
         * Preserve documentation metadata.
         */
        documentedAt:
          lead.documentedAt,

        documentedBy:
          lead.documentedBy,
      };

    } catch (error) {

      console.error(
        'Failed to load heritage record:',
        error
      );

      return null;
    }

  }, [id]);

  /* ─────────────────────────────────────────────
     NOT FOUND
  ───────────────────────────────────────────── */

  if (!site) {

    return (
      <main className={styles.page}>

        <div className={styles.notFound}>

          <h1>
            Heritage site not found
          </h1>

          <p>
            This heritage record could not be found.
          </p>

          <button
            className={styles.primaryButton}
            onClick={() =>
              router.push('/map')
            }
          >

            <ArrowLeft size={18} />

            Back to Map

          </button>

        </div>

      </main>
    );
  }

  /* ─────────────────────────────────────────────
     STATUS
  ───────────────────────────────────────────── */

  const isCommunityVerified =
    site.verificationStatus ===
    'community-verified';

  const statusLabel =
    isCommunityVerified
      ? 'Community Verified'
      : 'Reported';

  /* ─────────────────────────────────────────────
     MAP HANDLER
  ───────────────────────────────────────────── */

  const handleViewOnMap = () => {

    router.push(
      `/map?site=${encodeURIComponent(site.id)}`
    );

  };

  /* ─────────────────────────────────────────────
     CONDITION REPORT
  ───────────────────────────────────────────── */

  const handleConditionReport = (
    report: ConditionReport
  ) => {

    try {

      /*
       * Load existing condition reports.
       */
      const saved =
        window.localStorage.getItem(
          CONDITION_REPORTS_KEY
        );

      let existingReports: ConditionReport[] =
        [];

      if (saved) {

        try {

          const parsed =
            JSON.parse(saved);

          if (Array.isArray(parsed)) {
            existingReports = parsed;
          }

        } catch (parseError) {

          console.error(
            'Failed to parse existing condition reports:',
            parseError
          );

        }
      }

      /*
       * Add the new report.
       */
      const updatedReports = [
        ...existingReports,
        report,
      ];

      /*
       * Save it so the moderator dashboard
       * can read it later.
       */
      window.localStorage.setItem(
        CONDITION_REPORTS_KEY,
        JSON.stringify(updatedReports)
      );

      console.log(
        'Condition report submitted:',
        report
      );

      alert(
        'Condition report submitted successfully. It has been sent for review.'
      );

    } catch (error) {

      console.error(
        'Failed to save condition report:',
        error
      );

      alert(
        'Something went wrong while submitting the condition report.'
      );

    }
  };

  return (

    <main className={styles.page}>

      {/* ═══════════════════════════════════════════
          TOP BAR
      ═══════════════════════════════════════════ */}

      <header className={styles.topBar}>

        <button
          className={styles.backButton}
          onClick={() =>
            router.push('/map')
          }
        >

          <ArrowLeft size={20} />

          <span>
            Back to Map
          </span>

        </button>

        <div className={styles.brand}>
          Lok-Virasat
        </div>

      </header>

      {/* ═══════════════════════════════════════════
          CONTENT
      ═══════════════════════════════════════════ */}

      <div className={styles.container}>

        {/* ═════════════════════════════════════════
            HERO
        ═════════════════════════════════════════ */}

        <section className={styles.hero}>

          {/* IMAGE / MEDIA */}

          <div className={styles.heroMedia}>

            {site.images?.[0] ? (

              <img
                src={site.images[0]}
                alt={site.name}
                className={styles.heroImage}
              />

            ) : (

              <div className={styles.noImage}>

                <div
                  className={
                    styles.noImageIcon
                  }
                >

                  <BookOpen size={42} />

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

          {/* HERO INFORMATION */}

          <div className={styles.heroContent}>

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
                  isCommunityVerified
                    ? styles.verifiedBadge
                    : styles.reportedBadge
                }
              >

                <ShieldCheck size={15} />

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

                <MapPin size={17} />

                {site.coordinates[1].toFixed(5)}
                ° N,{' '}

                {site.coordinates[0].toFixed(5)}
                ° E

              </span>

              <span>

                <Calendar size={17} />

                Updated{' '}
                {site.lastUpdated}

              </span>

            </div>

          </div>

        </section>

        {/* ═════════════════════════════════════════
            MAIN GRID
        ═════════════════════════════════════════ */}

        <div
          className={
            styles.contentGrid
          }
        >

          {/* ═══════════════════════════════════════
              LEFT COLUMN
          ═══════════════════════════════════════ */}

          <div
            className={
              styles.mainColumn
            }
          >

            {/* ABOUT */}

            <section
              className={styles.card}
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

                  <BookOpen size={23} />

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

            {/* HISTORICAL / CULTURAL INFORMATION */}

            {site.historicalInformation && (

              <section
                className={styles.card}
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

                    <BookOpen size={23} />

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
                  {site.historicalInformation}
                </p>

              </section>

            )}

            {/* LOCAL STORIES */}

            <section
              className={styles.card}
            >

              <div
                className={
                  styles.sectionHeader
                }
              >

                <div
                  className={`${styles.sectionIcon} ${styles.purpleIcon}`}
                >

                  <Users size={23} />

                </div>

                <h2>
                  Local Stories
                </h2>

              </div>

              {site.oralStories &&
              site.oralStories.length > 0 ? (

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
                      (story, index) => (

                        <div
                          key={`${story.audioUrl}-${index}`}
                          className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50"
                        >

                          <div
                            className="flex items-center gap-3"
                          >

                            <div
                              className={`${styles.sectionIcon} ${styles.purpleIcon}`}
                            >

                              <Mic size={18} />

                            </div>

                            <div>

                              <h3
                                className="font-semibold text-zinc-900 dark:text-white"
                              >
                                Local Oral History{' '}
                                {index + 1}
                              </h3>

                              <p
                                className="text-sm text-zinc-500 dark:text-zinc-400"
                              >
                                Language:{' '}
                                {story.language}
                              </p>

                            </div>

                          </div>

                          <audio
                            controls
                            src={story.audioUrl}
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
                  setStoryOpen(true)
                }
              >

                <Mic size={18} />

                Record a Local Story

              </button>

            </section>

            {/* VERIFICATION JOURNEY */}

            <section
              className={styles.card}
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

                {/* STEP 1 */}

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
                    isCommunityVerified
                      ? styles.completedLine
                      : ''
                  }`}
                />

                {/* STEP 2 */}

                <div
                  className={`${styles.verificationStep} ${
                    isCommunityVerified
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
                  className={
                    styles.stepLine
                  }
                />

                {/* STEP 3 */}

                <div
                  className={`${styles.verificationStep} ${styles.futureStep}`}
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

            {/* AI */}

            <section
              className={styles.aiCard}
            >

              <div
                className={styles.aiIcon}
              >

                <Sparkles size={25} />

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

          {/* ═══════════════════════════════════════
              RIGHT COLUMN
          ═══════════════════════════════════════ */}

          <aside
            className={
              styles.sideColumn
            }
          >

            {/* LOCATION */}

            <section
              className={styles.card}
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

                    {site.coordinates[1].toFixed(5)}
                    ° N

                    <br />

                    {site.coordinates[0].toFixed(5)}
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

                <MapPin size={17} />

                View on Map

              </button>

            </section>

            {/* DOCUMENTATION */}

            <section
              className={styles.card}
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
                      isCommunityVerified
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
                      {site.documentedBy}
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
                  site.oralStories.length > 0 && (

                    <div>

                      <span>
                        Local Stories
                      </span>

                      <strong
                        className={
                          styles.blueValue
                        }
                      >
                        {site.oralStories.length}{' '}
                        recorded
                      </strong>

                    </div>

                  )}

              </div>

            </section>

            {/* ACTIONS */}

            <div
              className={
                styles.sideActions
              }
            >

              <button
                className={
                  styles.downloadButton
                }
                onClick={() => {

                  alert(
                    'Offline download will be enabled with the offline heritage package.'
                  );

                }}
              >

                <Download size={19} />

                Download Offline

              </button>

              <button
                className={
                  styles.conditionButton
                }
                onClick={() =>
                  setConditionReportOpen(true)
                }
              >

                <AlertTriangle size={18} />

                Report Condition

              </button>

            </div>

          </aside>

        </div>

      </div>

      {/* ═══════════════════════════════════════════
          STORY RECORDER MODAL
      ═══════════════════════════════════════════ */}

      {storyOpen && (

        <div
          className={
            styles.modalBackdrop
          }
          onClick={() =>
            setStoryOpen(false)
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
                setStoryOpen(false)
              }
              aria-label="Close"
            >

              <X size={20} />

            </button>

            <StoryRecorder />

          </div>

        </div>

      )}

      {/* ═══════════════════════════════════════════
          CONDITION REPORT
      ═══════════════════════════════════════════ */}

      <ConditionReportModal

        isOpen={
          conditionReportOpen
        }

        onClose={() =>
          setConditionReportOpen(false)
        }

        siteId={site.id}

        onSubmit={
          handleConditionReport
        }

      />

    </main>
  );
}