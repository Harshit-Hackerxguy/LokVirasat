'use client';

import React, {
  useState,
  useCallback,
  useEffect,
} from 'react';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  motion,
  AnimatePresence,
} from 'framer-motion';

import {
  MapPin,
  Navigation,
  X,
  Loader2,
  UploadCloud,
  CheckCircle,
} from 'lucide-react';

import { useMapStore } from '@/store/useMapStore';

import {
  heritageSchema,
  HeritageFormValues,
  SUPPORTED_LANGUAGES,
} from '@/utils/validations/heritage';

import {
  HeritageCategory,
  HeritageLead,
} from '@/types';

const STORAGE_KEY =
  'lokvirasat-heritage-leads';

export default function AddHeritageModal() {
  const isModalOpen = useMapStore(
    (state) => state.isModalOpen
  );

  const setModalOpen = useMapStore(
    (state) => state.setModalOpen
  );

  const setPinningMode = useMapStore(
    (state) => state.setPinningMode
  );

  const draftLocation = useMapStore(
    (state) => state.selectedDraftLocation
  );

  const [isLocating, setIsLocating] =
    useState(false);

  const [imageFiles, setImageFiles] =
    useState<File[]>([]);

  const [previewUrls, setPreviewUrls] =
    useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<HeritageFormValues>({
    resolver: zodResolver(heritageSchema),

    defaultValues: {
      name: '',
      category: '',
      description: '',
    },
  });

  // =========================================================
  // SET LOCATION
  // =========================================================

  useEffect(() => {
    if (draftLocation) {
      setValue(
        'coordinates',
        draftLocation,
        {
          shouldValidate: true,
        }
      );
    }
  }, [
    draftLocation,
    setValue,
  ]);

  // =========================================================
  // CLEAN IMAGE PREVIEWS
  // =========================================================

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) =>
        URL.revokeObjectURL(url)
      );
    };
  }, [previewUrls]);

  // =========================================================
  // LIVE LOCATION
  // =========================================================

  const handleUseLiveLocation = () => {
    setIsLocating(true);

    if (!('geolocation' in navigator)) {
      alert(
        'Geolocation is not supported by your browser.'
      );

      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [
          number,
          number
        ] = [
          position.coords.longitude,
          position.coords.latitude,
        ];

        setValue(
          'coordinates',
          coords,
          {
            shouldValidate: true,
          }
        );

        useMapStore
          .getState()
          .setDraftLocation(coords);

        setIsLocating(false);
      },

      (error) => {
        console.error(
          'Error getting location:',
          error
        );

        alert(
          'Could not get your location. Please check permissions or use map pinning.'
        );

        setIsLocating(false);
      },

      {
        enableHighAccuracy: true,
      }
    );
  };

  // =========================================================
  // PICK LOCATION ON MAP
  // =========================================================

  const handlePickOnMap = () => {
    setModalOpen(false);
    setPinningMode(true);
  };

  // =========================================================
  // IMAGE HANDLING
  // =========================================================

  const handleImageDrop = useCallback(
    (
      e: React.DragEvent<HTMLDivElement>
    ) => {
      e.preventDefault();

      if (
        e.dataTransfer.files &&
        e.dataTransfer.files.length > 0
      ) {
        handleFiles(
          Array.from(
            e.dataTransfer.files
          )
        );
      }
    },
    [imageFiles]
  );

  const handleFileInput = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (
      e.target.files &&
      e.target.files.length > 0
    ) {
      handleFiles(
        Array.from(
          e.target.files
        )
      );
    }
  };

  const handleFiles = (
    newFiles: File[]
  ) => {
    const validFiles =
      newFiles.filter((file) =>
        file.type.startsWith('image/')
      );

    const combined = [
      ...imageFiles,
      ...validFiles,
    ].slice(0, 5);

    setImageFiles(combined);

    setValue(
      'images',
      combined,
      {
        shouldValidate: true,
      }
    );

    const newUrls =
      validFiles.map((file) =>
        URL.createObjectURL(file)
      );

    setPreviewUrls((prev) =>
      [
        ...prev,
        ...newUrls,
      ].slice(0, 5)
    );
  };

  const removeImage = (
    index: number
  ) => {
    const updatedFiles = [
      ...imageFiles,
    ];

    updatedFiles.splice(index, 1);

    setImageFiles(updatedFiles);

    setValue(
      'images',
      updatedFiles,
      {
        shouldValidate: true,
      }
    );

    const updatedUrls = [
      ...previewUrls,
    ];

    if (updatedUrls[index]) {
      URL.revokeObjectURL(
        updatedUrls[index]
      );
    }

    updatedUrls.splice(index, 1);

    setPreviewUrls(updatedUrls);
  };

  // =========================================================
  // SUBMIT CONTRIBUTION
  // =========================================================

  const onSubmit = async (
    data: HeritageFormValues
  ) => {
    try {
      // -------------------------------------------------------
      // Make sure we actually have a location
      // -------------------------------------------------------

      if (!data.coordinates) {
        alert(
          'Please select a location before submitting.'
        );

        return;
      }

      // -------------------------------------------------------
      // Create a new Heritage Lead
      // -------------------------------------------------------

      const newLead: HeritageLead = {
        id: `lead-community-${Date.now()}`,

        name: data.name,

        category:
          data.category as HeritageCategory,

        description:
          data.description,

        villageOrArea:
          'Community Reported Location',

        submittedBy:
          'Local Community',

        submittedAt:
          new Date()
            .toISOString()
            .split('T')[0],

        // This is what makes it appear
        // under Contributor → Available.
        status:
          'needs-documentation',

        assignedContributor:
          undefined,

        approximateLocation:
          data.coordinates,

        // New community submission fields
        storytellerName:
          data.storytellerName || undefined,

        language:
          data.language || undefined,

        supportingEvidence:
          data.supportingEvidence || undefined,
      };

      // -------------------------------------------------------
      // Read existing contributor leads
      // -------------------------------------------------------

      const existingData =
        window.localStorage.getItem(
          STORAGE_KEY
        );

      let existingLeads: HeritageLead[] =
        [];

      if (existingData) {
        try {
          const parsed =
            JSON.parse(
              existingData
            );

          if (
            Array.isArray(parsed)
          ) {
            existingLeads =
              parsed;
          }
        } catch (error) {
          console.error(
            'Could not parse stored heritage leads:',
            error
          );

          existingLeads = [];
        }
      }

      // -------------------------------------------------------
      // Add the new lead
      // -------------------------------------------------------

      const updatedLeads = [
        ...existingLeads,
        newLead,
      ];

      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          updatedLeads
        )
      );

      // -------------------------------------------------------
      // Verify storage immediately
      // -------------------------------------------------------

      const savedData =
        window.localStorage.getItem(
          STORAGE_KEY
        );

      console.log(
        'Heritage lead created:',
        newLead
      );

      console.log(
        'Saved contributor leads:',
        savedData
      );

      // -------------------------------------------------------
      // Small submission delay
      // -------------------------------------------------------

      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            500
          )
      );

      // -------------------------------------------------------
      // Reset form
      // -------------------------------------------------------

      reset();

      setImageFiles([]);

      setPreviewUrls([]);

      // -------------------------------------------------------
      // Clear map draft location
      // -------------------------------------------------------

      useMapStore
        .getState()
        .setDraftLocation(null);

      // -------------------------------------------------------
      // Close modal
      // -------------------------------------------------------

      setModalOpen(false);

      alert(
        'Heritage site submitted successfully! It is now available for contributors to document.'
      );

    } catch (error) {
      console.error(
        'Failed to submit heritage contribution:',
        error
      );

      alert(
        'Something went wrong while submitting the heritage site.'
      );
    }
  };

  // =========================================================
  // MODAL
  // =========================================================

  if (!isModalOpen) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        exit={{
          opacity: 0,
        }}
      >

        <motion.div
          className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white text-gray-900 shadow-2xl"
          initial={{
            y: 50,
            opacity: 0,
            scale: 0.95,
          }}
          animate={{
            y: 0,
            opacity: 1,
            scale: 1,
          }}
          exit={{
            y: 20,
            opacity: 0,
            scale: 0.95,
          }}
          transition={{
            duration: 0.3,
            ease: 'easeOut',
          }}
        >

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="flex shrink-0 items-center justify-between border-b border-gray-100 bg-gray-50/50 p-6">

            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Contribute Heritage Site
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Report a lesser-known heritage location
                for documentation.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setModalOpen(false)
              }
              className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-800"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

          </div>

          {/* =================================================
              BODY
          ================================================= */}

          <div className="custom-scrollbar overflow-y-auto p-6">

            <form
              onSubmit={handleSubmit(
                onSubmit
              )}
              className="space-y-6"
            >

              {/* =================================================
                  LOCATION
              ================================================= */}

              <div className="space-y-3">

                <label className="block text-sm font-semibold text-gray-700">
                  Site Location *
                </label>

                {draftLocation ? (

                  <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 p-4">

                    <div className="flex items-center gap-3">

                      <div className="rounded-lg bg-green-100 p-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                      </div>

                      <div>

                        <p className="font-medium text-green-800">
                          Location Selected
                        </p>

                        <p className="text-sm text-green-600">
                          {draftLocation[1].toFixed(5)}
                          {', '}
                          {draftLocation[0].toFixed(5)}
                        </p>

                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={
                        handlePickOnMap
                      }
                      className="px-2 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      Re-pick on map
                    </button>

                  </div>

                ) : (

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                    <button
                      type="button"
                      onClick={
                        handleUseLiveLocation
                      }
                      disabled={
                        isLocating
                      }
                      className="group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white p-6 transition-all hover:border-blue-400 hover:bg-blue-50"
                    >

                      {isLocating ? (
                        <Loader2 className="mb-3 h-8 w-8 animate-spin text-blue-500" />
                      ) : (
                        <Navigation className="mb-3 h-8 w-8 text-gray-400 transition-colors group-hover:text-blue-500" />
                      )}

                      <span className="font-medium text-gray-700 group-hover:text-blue-700">
                        Use Live Location
                      </span>

                      <span className="mt-1 text-xs text-gray-400">
                        Requires GPS permission
                      </span>

                    </button>

                    <button
                      type="button"
                      onClick={
                        handlePickOnMap
                      }
                      className="group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white p-6 transition-all hover:border-blue-400 hover:bg-blue-50"
                    >

                      <MapPin className="mb-3 h-8 w-8 text-gray-400 transition-colors group-hover:text-blue-500" />

                      <span className="font-medium text-gray-700 group-hover:text-blue-700">
                        Pick on Map
                      </span>

                      <span className="mt-1 text-xs text-gray-400">
                        Interactive map pinning
                      </span>

                    </button>

                  </div>
                )}

                {errors.coordinates && (
                  <p className="mt-1 text-sm text-red-500">
                    {
                      errors
                        .coordinates
                        .message
                    }
                  </p>
                )}

              </div>

              {/* =================================================
                  SITE DETAILS
              ================================================= */}

              <div className="space-y-4">

                <div>

                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    Site Name *
                  </label>

                  <input
                    type="text"
                    {...register(
                      'name'
                    )}
                    placeholder="e.g. Ancient Banyan Tree"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />

                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">
                      {
                        errors
                          .name
                          .message
                      }
                    </p>
                  )}

                </div>

                <div>

                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    Category *
                  </label>

                  <select
                    {...register(
                      'category'
                    )}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  >

                    <option
                      value=""
                      className="text-gray-500"
                    >
                      Select a category
                    </option>

                    {Object.values(
                      HeritageCategory
                    ).map(
                      (cat) => (
                        <option
                          key={cat}
                          value={cat}
                          className="text-gray-900"
                        >
                          {cat}
                        </option>
                      )
                    )}

                  </select>

                  {errors.category && (
                    <p className="mt-1 text-sm text-red-500">
                      {
                        errors
                          .category
                          .message
                      }
                    </p>
                  )}

                </div>

                <div>

                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    Description / History *
                  </label>

                  <textarea
                    {...register(
                      'description'
                    )}
                    rows={4}
                    placeholder="Describe the historical or cultural significance..."
                    className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />

                  {errors.description && (
                    <p className="mt-1 text-sm text-red-500">
                      {
                        errors
                          .description
                          .message
                      }
                    </p>
                  )}

                </div>

              </div>

              {/* =================================================
                  PHOTOS
              ================================================= */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Photos (Up to 5)
                </label>

                <div
                  className="relative w-full cursor-pointer rounded-xl border-2 border-dashed border-gray-200 bg-white p-8 text-center transition-colors hover:bg-gray-50"
                  onDragOver={(e) =>
                    e.preventDefault()
                  }
                  onDrop={
                    handleImageDrop
                  }
                >

                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    onChange={
                      handleFileInput
                    }
                  />

                  <UploadCloud className="mx-auto mb-3 h-10 w-10 text-gray-400" />

                  <p className="font-medium text-gray-600">
                    Drag & drop images or click to browse
                  </p>

                  <p className="mt-1 text-sm text-gray-400">
                    PNG, JPG up to 10MB each
                  </p>

                </div>

                {errors.images && (
                  <p className="mt-1 text-sm text-red-500">
                    {
                      errors.images
                        ?.message as string
                    }
                  </p>
                )}

                {previewUrls.length > 0 && (

                  <div className="mt-4 grid grid-cols-5 gap-4">

                    {previewUrls.map(
                      (
                        url,
                        index
                      ) => (

                        <div
                          key={index}
                          className="group relative aspect-square overflow-hidden rounded-lg"
                        >

                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="h-full w-full object-cover"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              removeImage(
                                index
                              )
                            }
                            className="absolute right-1 top-1 rounded-full bg-red-500/80 p-1 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                            aria-label={`Remove image ${index + 1}`}
                          >
                            <X className="h-3 w-3" />
                          </button>

                        </div>

                      )
                    )}

                  </div>

                )}

              </div>

              {/* =================================================
                  ORAL HERITAGE DETAILS (NEW)
              ================================================= */}

              <div className="space-y-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                <p className="text-sm font-semibold text-blue-900">
                  🗣 Oral Heritage Details <span className="font-normal text-blue-600">(optional)</span>
                </p>

                {/* Storyteller Name */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Storyteller / Source Name
                  </label>
                  <input
                    {...register('storytellerName')}
                    type="text"
                    placeholder="e.g. Ramesh Kumar, village elder"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Name of the person who shared this heritage story.
                  </p>
                </div>

                {/* Language */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Primary Language of Account
                  </label>
                  <select
                    {...register('language')}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    defaultValue=""
                  >
                    <option value="">Select language...</option>
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                  {errors.language && (
                    <p className="mt-1 text-sm text-red-500">{errors.language.message}</p>
                  )}
                </div>

                {/* Supporting Evidence */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Supporting Evidence URL
                  </label>
                  <input
                    {...register('supportingEvidence')}
                    type="url"
                    placeholder="https://example.com/article-or-document"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.supportingEvidence && (
                    <p className="mt-1 text-sm text-red-500">{errors.supportingEvidence.message}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">
                    Link to an article, document, or archive that supports this heritage claim.
                  </p>
                </div>
              </div>

              {/* =================================================
                  SUBMIT
              ================================================= */}

              <div className="border-t border-gray-100 pt-4">

                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !draftLocation
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 font-semibold text-white transition-colors hover:bg-blue-700 disabled:bg-blue-300"
                >

                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Contribution'
                  )}

                </button>

                {!draftLocation && (
                  <p className="mt-2 text-center text-xs text-gray-400">
                    Select a site location before submitting.
                  </p>
                )}

              </div>

            </form>

          </div>

        </motion.div>

      </motion.div>
    </AnimatePresence>
  );
}