'use client';

import { useEffect, useState } from 'react';
import {
  X,
  MapPin,
  Camera,
  Mic,
  CheckCircle,
  Upload,
  FileText,
  ShieldCheck,
  Trash2,
  Loader2,
  Navigation,
} from 'lucide-react';

import {
  HeritageCategory,
  HeritageLead,
} from '@/types';

import StoryRecorder, {
  RecordedStory,
} from '@/components/audio/StoryRecorder';

import './HeritageLeadModal.css';

interface HeritageLeadModalProps {
  lead: HeritageLead | null;
  onClose: () => void;
  onSubmit: (
    lead: HeritageLead,
    documentation: {
      historical_information: string;
      cultural_significance: string;
      sources?: string;
      latitude: number;
      longitude: number;
    }
  ) => void;
}

const LOCATION_TOLERANCE_METERS = 500;

function calculateDistanceMeters(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number
) {
  const earthRadius = 6371000;

  const toRadians = (degrees: number) =>
    (degrees * Math.PI) / 180;

  const dLatitude = toRadians(
    latitude2 - latitude1
  );

  const dLongitude = toRadians(
    longitude2 - longitude1
  );

  const a =
    Math.sin(dLatitude / 2) ** 2 +
    Math.cos(toRadians(latitude1)) *
      Math.cos(toRadians(latitude2)) *
      Math.sin(dLongitude / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return earthRadius * c;
}

export default function HeritageLeadModal({
  lead,
  onClose,
  onSubmit,
}: HeritageLeadModalProps) {
  // =========================================================
  // FORM STATE
  // =========================================================

  const [siteName, setSiteName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] =
    useState<HeritageCategory | ''>('');
  const [history, setHistory] = useState('');
  const [culturalSignificance, setCulturalSignificance] = useState('');
  const [sources, setSources] = useState('');
  // =========================================================
  // DRAFT STATE
  // =========================================================

  const [draftLoaded, setDraftLoaded] =
    useState(false);

  // =========================================================
  // LOCATION
  // =========================================================

  const [locationVerified, setLocationVerified] =
    useState(false);

  const [verifiedCoordinates, setVerifiedCoordinates] =
    useState<[number, number] | undefined>();

  const [isVerifyingLocation, setIsVerifyingLocation] =
    useState(false);

  const [locationError, setLocationError] =
    useState('');

  const [locationDistance, setLocationDistance] =
    useState<number | null>(null);

  // =========================================================
  // PHOTOS
  // =========================================================

  const [photos, setPhotos] = useState<File[]>([]);

  const [existingPhotoNames, setExistingPhotoNames] =
    useState<string[]>([]);

  // =========================================================
  // ORAL STORIES
  // =========================================================

  const [oralStories, setOralStories] =
    useState<
      NonNullable<HeritageLead['oralStories']>
    >([]);

  const [showStoryRecorder, setShowStoryRecorder] =
    useState(false);

  // =========================================================
  // SUBMISSION
  // =========================================================

  const [submitted, setSubmitted] =
    useState(false);

  // =========================================================
  // LOAD / RESUME DRAFT
  // =========================================================

  useEffect(() => {
    if (!lead) return;

    setDraftLoaded(false);

    const draftKey =
      `lokvirasat-documentation-draft-${lead.id}`;

    try {
      const savedDraft =
        window.localStorage.getItem(draftKey);

      if (savedDraft) {
        const draft =
          JSON.parse(savedDraft);

        setSiteName(
          draft.siteName ?? lead.name ?? ''
        );

        setDescription(
          draft.description ??
            lead.description ??
            ''
        );

        setCategory(
          draft.category ??
            lead.category ??
            ''
        );

        setHistory(
          draft.history ??
            lead.historicalInformation ??
            ''
        );

        setCulturalSignificance(
          draft.culturalSignificance ??
            ''
        );

        setSources(
          draft.sources ??
            ''
        );

        setLocationVerified(
          draft.locationVerified ??
            lead.locationVerified ??
            false
        );

        setVerifiedCoordinates(
          draft.verifiedCoordinates ??
            lead.verifiedCoordinates
        );

        setExistingPhotoNames(
          draft.photoNames ??
            lead.photos ??
            []
        );

        setOralStories(
          draft.oralStories ??
            lead.oralStories ??
            []
        );
      } else {
        setSiteName(
          lead.name ?? ''
        );

        setDescription(
          lead.description ?? ''
        );

        setCategory(
          lead.category ?? ''
        );

        setHistory(
          lead.historicalInformation ?? ''
        );

        setCulturalSignificance('');
        setSources('');

        setLocationVerified(
          lead.locationVerified ?? false
        );

        setVerifiedCoordinates(
          lead.verifiedCoordinates
        );

        setExistingPhotoNames(
          lead.photos ?? []
        );

        setOralStories(
          lead.oralStories ?? []
        );
      }

      setPhotos([]);
      setSubmitted(false);
      setLocationError('');
      setLocationDistance(null);

      // IMPORTANT:
      // Allow saving only AFTER the draft has loaded.
      setDraftLoaded(true);

    } catch (error) {
      console.error(
        'Failed to restore documentation draft:',
        error
      );

      setSiteName(
        lead.name ?? ''
      );

      setDescription(
        lead.description ?? ''
      );

      setCategory(
        lead.category ?? ''
      );

      setHistory(
        lead.historicalInformation ?? ''
      );

      setCulturalSignificance('');
      setSources('');

      setLocationVerified(
        lead.locationVerified ?? false
      );

      setVerifiedCoordinates(
        lead.verifiedCoordinates
      );

      setExistingPhotoNames(
        lead.photos ?? []
      );

      setOralStories(
        lead.oralStories ?? []
      );

      setPhotos([]);
      setSubmitted(false);
      setLocationError('');
      setLocationDistance(null);

      setDraftLoaded(true);
    }
  }, [lead]);

  // =========================================================
  // SAVE DRAFT
  // =========================================================

  useEffect(() => {
    /*
     * Do not save until the initial draft has been loaded.
     *
     * This prevents the initial empty React state from
     * overwriting an existing saved draft.
     */

    if (!lead || !draftLoaded) return;

    const draftKey =
      `lokvirasat-documentation-draft-${lead.id}`;

    const draft = {
      siteName,
      description,
      category,
      history,
      culturalSignificance,
      sources,
      locationVerified,
      verifiedCoordinates,
      photoNames: existingPhotoNames,
      oralStories,
    };

    try {
      window.localStorage.setItem(
        draftKey,
        JSON.stringify(draft)
      );
    } catch (error) {
      console.error(
        'Failed to save documentation draft:',
        error
      );
    }
  }, [
    lead,
    draftLoaded,
    siteName,
    description,
    category,
    history,
    culturalSignificance,
    sources,
    locationVerified,
    verifiedCoordinates,
    existingPhotoNames,
    oralStories,
  ]);

  if (!lead) return null;

  // =========================================================
  // PHOTO HANDLING
  // =========================================================

  const handlePhotoChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files) return;

    const selectedFiles =
      Array.from(event.target.files);

    const currentTotal =
      existingPhotoNames.length +
      photos.length;

    const remainingSlots =
      5 - currentTotal;

    if (remainingSlots <= 0) {
      alert(
        'You can upload a maximum of 5 photos.'
      );
      return;
    }

    const filesToAdd =
      selectedFiles.slice(
        0,
        remainingSlots
      );

    if (
      selectedFiles.length >
      remainingSlots
    ) {
      alert(
        `Only ${remainingSlots} more photo${
          remainingSlots === 1 ? '' : 's'
        } can be added.`
      );
    }

    setPhotos((currentPhotos) => [
      ...currentPhotos,
      ...filesToAdd,
    ]);

    event.target.value = '';
  };

  const removeNewPhoto = (
    index: number
  ) => {
    setPhotos((currentPhotos) =>
      currentPhotos.filter(
        (_, photoIndex) =>
          photoIndex !== index
      )
    );
  };

  // =========================================================
  // REAL GPS VERIFICATION
  // =========================================================

  const handleVerifyLocation = () => {
    setLocationError('');
    setLocationDistance(null);

    if (!navigator.geolocation) {
      setLocationError(
        'Geolocation is not supported by this browser.'
      );
      return;
    }

    setIsVerifyingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentLatitude =
          position.coords.latitude;

        const currentLongitude =
          position.coords.longitude;

        /*
         * LokVirasat coordinates are:
         *
         * [longitude, latitude]
         */

        const [
          leadLongitude,
          leadLatitude,
        ] = lead.approximateLocation;

        const distance =
          calculateDistanceMeters(
            currentLatitude,
            currentLongitude,
            leadLatitude,
            leadLongitude
          );

        setLocationDistance(distance);

        if (
          distance <=
          LOCATION_TOLERANCE_METERS
        ) {
          setLocationVerified(true);

          setVerifiedCoordinates([
            currentLongitude,
            currentLatitude,
          ]);

          setLocationError('');
        } else {
          setLocationVerified(false);

          setVerifiedCoordinates(
            undefined
          );

          setLocationError(
            `You are approximately ${Math.round(
              distance
            )}m away from the reported location. Move closer to the site and try again.`
          );
        }

        setIsVerifyingLocation(false);
      },

      (error) => {
        console.error(
          'Location verification error:',
          error
        );

        setIsVerifyingLocation(false);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError(
              'Location permission was denied. Please allow location access and try again.'
            );
            break;

          case error.POSITION_UNAVAILABLE:
            setLocationError(
              'Your current location could not be determined. Please try again.'
            );
            break;

          case error.TIMEOUT:
            setLocationError(
              'Location request timed out. Please try again.'
            );
            break;

          default:
            setLocationError(
              'Unable to verify your location. Please try again.'
            );
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  // =========================================================
  // STORY HANDLING
  // =========================================================

  const handleStoryRecorded = (
    story: RecordedStory
  ) => {
    setOralStories(
      (currentStories) => [
        ...currentStories,
        {
          audioUrl: story.audioUrl,
          language: story.language,
        },
      ]
    );

    setShowStoryRecorder(false);
  };

  // =========================================================
  // SUBMIT DOCUMENTATION
  // =========================================================

  const handleSubmit = () => {
    if (!siteName.trim()) {
      alert(
        'Please enter the heritage site name.'
      );
      return;
    }

    if (!category) {
      alert(
        'Please select a heritage category.'
      );
      return;
    }

    if (!description.trim()) {
      alert(
        'Please provide a description.'
      );
      return;
    }

    if (!locationVerified) {
      alert(
        'Please verify that you are physically near the heritage site.'
      );
      return;
    }

    const newPhotoNames =
      photos.map(
        (photo) => photo.name
      );

    const allPhotoNames = [
      ...existingPhotoNames,
      ...newPhotoNames,
    ].slice(0, 5);

    const documentedLead: HeritageLead = {
      ...lead,

      name: siteName.trim(),

      category,

      description:
        description.trim(),

      historicalInformation:
        history.trim(),

      photos:
        allPhotoNames.length > 0
          ? allPhotoNames
          : undefined,

      locationVerified: true,

      verifiedCoordinates,

      oralStories:
        oralStories.length > 0
          ? oralStories
          : undefined,

      status: 'documented',

      documentedAt:
        new Date().toISOString(),

      documentedBy:
        lead.assignedContributor,
    };

    // Documentation is complete,
    // so remove the saved draft.

    try {
      window.localStorage.removeItem(
        `lokvirasat-documentation-draft-${lead.id}`
      );
    } catch (error) {
      console.error(
        'Failed to remove documentation draft:',
        error
      );
    }

    setSubmitted(true);

    onSubmit(
      documentedLead,
      {
        historical_information:
          history.trim(),

        cultural_significance:
          culturalSignificance.trim(),

        sources:
          sources.trim(),

        latitude:
          verifiedCoordinates![1],

        longitude:
          verifiedCoordinates![0],
      }
    );
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="heritage-modal-overlay">

      <div className="heritage-modal">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="heritage-modal-header">

          <div className="heritage-modal-title-area">

            <div className="heritage-modal-title-icon">
              <FileText className="h-5 w-5" />
            </div>

            <div>

              <h2 className="heritage-modal-title">
                Document Heritage Site
              </h2>

              <p className="heritage-modal-subtitle">
                Turn a community-reported lead into a verified
                heritage record.
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="heritage-modal-close"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

        </div>

        {/* =====================================================
            BODY
        ===================================================== */}

        <div className="heritage-modal-body">

          {/* COMMUNITY LEAD */}

          <section className="heritage-section">

            <div className="heritage-lead-label-row">

              <span className="heritage-lead-label">
                Community Lead
              </span>

              <span className="heritage-status-pill">
                {lead.status === 'claimed'
                  ? 'In Documentation'
                  : 'Needs Documentation'}
              </span>

            </div>

            <div className="heritage-lead-card">

              <div className="heritage-lead-main">

                <div className="heritage-lead-icon">
                  <MapPin className="h-5 w-5" />
                </div>

                <div>

                  <h3 className="heritage-lead-name">
                    {lead.name}
                  </h3>

                  <p className="heritage-lead-location">
                    {lead.villageOrArea}
                  </p>

                  <p className="heritage-lead-meta">
                    Reported by {lead.submittedBy} ·{' '}
                    {lead.submittedAt}
                  </p>

                </div>

              </div>

              <p className="heritage-lead-description">
                {lead.description}
              </p>

            </div>

          </section>

          {/* SITE INFORMATION */}

          <section className="heritage-section">

            <div className="heritage-section-heading">

              <div className="heritage-section-icon">
                <FileText className="h-4 w-4" />
              </div>

              <div>

                <h3 className="heritage-section-title">
                  Site Information
                </h3>

                <p className="heritage-section-description">
                  Add the verified details of the heritage site.
                </p>

              </div>

            </div>

            <div className="heritage-form-grid">

              <div className="heritage-field">

                <label className="heritage-label">
                  Heritage Site Name
                </label>

                <input
                  type="text"
                  value={siteName}
                  onChange={(e) =>
                    setSiteName(
                      e.target.value
                    )
                  }
                  placeholder={lead.name}
                  className="heritage-input"
                />

              </div>

              <div className="heritage-field">

                <label className="heritage-label">
                  Heritage Category
                </label>

                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(
                      e.target.value as HeritageCategory
                    )
                  }
                  className="heritage-select"
                >

                  <option value="">
                    Select category
                  </option>

                  <option
                    value={
                      HeritageCategory.Monument
                    }
                  >
                    Monument
                  </option>

                  <option
                    value={
                      HeritageCategory.SacredGrove
                    }
                  >
                    Sacred Grove
                  </option>

                  <option
                    value={
                      HeritageCategory.FolkloreSite
                    }
                  >
                    Folklore Site
                  </option>

                  <option
                    value={
                      HeritageCategory.AncientRuins
                    }
                  >
                    Ancient Ruins
                  </option>

                  <option
                    value={
                      HeritageCategory.TraditionalCraftHub
                    }
                  >
                    Traditional Craft Hub
                  </option>

                </select>

              </div>

              <div className="heritage-field heritage-form-full">

                <label className="heritage-label">
                  Site Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                  placeholder="Describe the site's appearance, architecture, significance, traditions, or other useful information."
                  className="heritage-textarea"
                  rows={3}
                />

              </div>

              <div className="heritage-field heritage-form-full">

                <label className="heritage-label">
                  Historical / Cultural Information
                </label>

                <textarea
                  value={history}
                  onChange={(e) =>
                    setHistory(
                      e.target.value
                    )
                  }
                  placeholder="Add information collected from local residents, historians, community members, or available records."
                  className="heritage-textarea"
                  rows={3}
                />

              </div>

            </div>

            <div className="heritage-field heritage-form-full">

  <label className="heritage-label">
    Cultural Significance
  </label>

  <textarea
    value={culturalSignificance}
    onChange={(e) =>
      setCulturalSignificance(
        e.target.value
      )
    }
    placeholder="Explain why this heritage site is culturally important."
    className="heritage-textarea"
    rows={3}
  />

</div>


<div className="heritage-field heritage-form-full">

  <label className="heritage-label">
    Sources / References
  </label>

  <textarea
    value={sources}
    onChange={(e) =>
      setSources(
        e.target.value
      )
    }
    placeholder="Mention local records, books, oral sources, community references, etc."
    className="heritage-textarea"
    rows={2}
  />

</div>
          </section>

          {/* EVIDENCE & VERIFICATION */}

          <section className="heritage-section">

            <div className="heritage-section-heading">

              <div className="heritage-section-icon">
                <ShieldCheck className="h-4 w-4" />
              </div>

              <div>

                <h3 className="heritage-section-title">
                  Evidence & Verification
                </h3>

                <p className="heritage-section-description">
                  Provide evidence that supports the
                  documentation.
                </p>

              </div>

            </div>

            <div className="heritage-evidence-grid">

              {/* PHOTOS */}

              <div className="heritage-upload">

                <div className="heritage-upload-icon">
                  <Camera className="h-5 w-5" />
                </div>

                <span className="heritage-upload-title">
                  Upload photographs
                </span>

                <span className="heritage-upload-description">
                  Structure, surroundings, artifacts or
                  cultural activity
                </span>

                <label className="heritage-action-button">

                  <Upload className="h-4 w-4" />

                  Choose Photos

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoChange}
                    className="hidden"
                  />

                </label>

                <p className="text-xs text-zinc-500 mt-2">
                  {existingPhotoNames.length +
                    photos.length}
                  /5 photos
                </p>

                {existingPhotoNames.length >
                  0 && (

                  <div className="mt-3 w-full">

                    <p className="text-xs font-semibold text-zinc-500 mb-2">
                      Previously added
                    </p>

                    <div className="space-y-2">

                      {existingPhotoNames.map(
                        (photoName, index) => (

                          <div
                            key={`${photoName}-${index}`}
                            className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300"
                          >

                            <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />

                            <span className="truncate">
                              {photoName}
                            </span>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                )}

                {photos.length > 0 && (

                  <div className="mt-3 w-full">

                    <p className="text-xs font-semibold text-zinc-500 mb-2">
                      New photos
                    </p>

                    <div className="space-y-2">

                      {photos.map(
                        (photo, index) => (

                          <div
                            key={`${photo.name}-${index}`}
                            className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700"
                          >

                            <div className="flex items-center gap-2 min-w-0">

                              <Camera className="h-4 w-4 text-indigo-500 shrink-0" />

                              <span className="text-sm truncate">
                                {photo.name}
                              </span>

                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                removeNewPhoto(
                                  index
                                )
                              }
                              className="text-red-500 hover:text-red-600 shrink-0"
                              aria-label={`Remove ${photo.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                )}

              </div>

              {/* LOCATION */}

              <div className="heritage-verification-card">

                <div className="heritage-verification-icon">

                  {locationVerified ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Navigation className="h-5 w-5" />
                  )}

                </div>

                <div className="heritage-verification-content">

                  <h3 className="heritage-verification-title">

                    Location Verification

                    {locationVerified && (

                      <span className="heritage-verified-pill">
                        VERIFIED
                      </span>

                    )}

                  </h3>

                  <p className="heritage-verification-description">
                    Confirm that you are physically near
                    the heritage site while documenting it.
                  </p>

                  {locationDistance !== null && (

                    <p className="text-xs text-zinc-500 mt-2">
                      Distance from reported location:{' '}
                      <strong>
                        {Math.round(
                          locationDistance
                        )}m
                      </strong>
                    </p>

                  )}

                  {locationError && (

                    <div className="mt-3 px-3 py-2 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs">
                      {locationError}
                    </div>

                  )}

                  <button
                    type="button"
                    onClick={
                      handleVerifyLocation
                    }
                    disabled={
                      isVerifyingLocation
                    }
                    className={`heritage-action-button ${
                      locationVerified
                        ? 'verified'
                        : ''
                    }`}
                  >

                    {isVerifyingLocation ? (

                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Checking Location...
                      </>

                    ) : locationVerified ? (

                      <>
                        <CheckCircle className="h-4 w-4" />
                        Location Verified
                      </>

                    ) : (

                      <>
                        <MapPin className="h-4 w-4" />
                        Verify Location
                      </>

                    )}

                  </button>

                  {locationVerified && (

                    <p className="text-xs text-emerald-600 mt-2">
                      GPS location verified within{' '}
                      {LOCATION_TOLERANCE_METERS}m of the
                      reported location.
                    </p>

                  )}

                </div>

              </div>

            </div>

          </section>

          {/* INTANGIBLE HERITAGE */}

          <section className="heritage-section">

            <div className="heritage-section-heading">

              <div className="heritage-section-icon">
                <Mic className="h-4 w-4" />
              </div>

              <div>

                <h3 className="heritage-section-title">
                  Intangible Heritage
                </h3>

                <p className="heritage-section-description">
                  Preserve stories, folklore and traditions
                  from the local community.
                </p>

              </div>

            </div>

            <div className="heritage-story-card">

              <div className="heritage-story-left">

                <div className="heritage-story-icon">
                  <Mic className="h-5 w-5" />
                </div>

                <div>

                  <h3 className="heritage-story-title">
                    Local Story & Oral History
                  </h3>

                  <p className="heritage-story-description">
                    Record a story, folklore or historical
                    account in the local language.
                  </p>

                </div>

              </div>

              <button
                type="button"
                className="heritage-story-button"
                onClick={() =>
                  setShowStoryRecorder(true)
                }
              >

                <Mic className="h-4 w-4" />

                Record Story

              </button>

            </div>

            {oralStories.length > 0 && (

              <div className="heritage-success">

                <CheckCircle className="heritage-success-icon h-5 w-5" />

                <div>

                  <p className="heritage-success-title">
                    {oralStories.length}{' '}
                    oral stor
                    {oralStories.length === 1
                      ? 'y'
                      : 'ies'}{' '}
                    recorded
                  </p>

                  <p className="heritage-success-text">
                    The story will be included with this
                    heritage documentation.
                  </p>

                </div>

              </div>

            )}

          </section>

          {/* SUBMISSION RESULT */}

          {submitted && (

            <section className="heritage-section">

              <div className="heritage-success">

                <CheckCircle
                  className="heritage-success-icon h-5 w-5"
                />

                <div>

                  <p className="heritage-success-title">
                    Documentation submitted
                  </p>

                  <p className="heritage-success-text">
                    The contribution is now ready for
                    verification and moderation.
                  </p>

                </div>

              </div>

            </section>

          )}

        </div>

        {/* FOOTER */}

        <div className="heritage-modal-footer">

          <div className="heritage-footer-note">

            <ShieldCheck className="h-4 w-4" />

            Contribution will be reviewed before publication.

          </div>

          <div className="heritage-footer-actions">

            <button
              type="button"
              onClick={onClose}
              className="heritage-cancel-button"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                submitted ||
                isVerifyingLocation
              }
              className="heritage-submit-button"
            >

              <Upload className="h-4 w-4" />

              {submitted
                ? 'Submitted'
                : 'Submit for Verification'}

            </button>

          </div>

        </div>

      </div>

      {/* STORY RECORDER */}

      {showStoryRecorder && (

        <div
          className="heritage-modal-overlay"
          style={{
            zIndex: 1000,
          }}
        >

          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '520px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >

            <StoryRecorder
              onStoryRecorded={
                handleStoryRecorded
              }
              onClose={() =>
                setShowStoryRecorder(false)
              }
            />

          </div>

        </div>

      )}

    </div>
  );
}