'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Camera,
  Shield,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Upload,
  Trash2,
} from 'lucide-react';

import {
  IssueType,
  type ConditionReport,
} from '@/types';

/* ═══════════════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════════════ */

interface ConditionReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteId: string;

  /*
   * The actual File is passed along with the report.
   *
   * The second parameter is optional so the existing parent
   * handler remains compatible until we update it for the
   * offline queue.
   */
  onSubmit: (
    report: ConditionReport,
    photoFile?: File
  ) => void;
}

interface FormValues {
  issueType: IssueType | '';
  description: string;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════════════════ */

const ISSUE_CHIPS: {
  value: IssueType;
  label: string;
  icon: string;
}[] = [
  {
    value: IssueType.Damage,
    label: 'Damage',
    icon: '🏚️',
  },
  {
    value: IssueType.Cleanliness,
    label: 'Cleanliness',
    icon: '🧹',
  },
  {
    value: IssueType.Infrastructure,
    label: 'Infrastructure',
    icon: '🏗️',
  },
  {
    value: IssueType.Accessibility,
    label: 'Accessibility',
    icon: '♿',
  },
];

const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/heic',
];

/* ═══════════════════════════════════════════════════════════════════════════
   Animation Variants
   ═══════════════════════════════════════════════════════════════════════════ */

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.92,
    y: 30,
  },

  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      damping: 28,
      stiffness: 380,
    },
  },

  exit: {
    opacity: 0,
    scale: 0.92,
    y: 30,
    transition: {
      duration: 0.2,
    },
  },
};

const toastVariants = {
  hidden: {
    opacity: 0,
    y: -20,
    scale: 0.95,
  },

  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      damping: 22,
      stiffness: 400,
    },
  },

  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: {
      duration: 0.2,
    },
  },
};

const chipVariants = {
  idle: {
    scale: 1,
  },

  tap: {
    scale: 0.95,
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════════════════ */

export default function ConditionReportModal({
  isOpen,
  onClose,
  siteId,
  onSubmit,
}: ConditionReportModalProps) {
  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);

  const [locationVerified, setLocationVerified] =
    useState<boolean>(false);

  const [toast, setToast] =
    useState<{
      type: 'error' | 'success';
      message: string;
    } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      issueType: '',
      description: '',
    },
  });

  const selectedIssueType =
    watch('issueType');

  /* ─────────────────────────────────────────
     CLEANUP PREVIEW URL
  ───────────────────────────────────────── */

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  /* ─────────────────────────────────────────
     AUTO-DISMISS TOAST
  ───────────────────────────────────────── */

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(
      () => setToast(null),
      6000
    );

    return () =>
      clearTimeout(timer);
  }, [toast]);

  /* ─────────────────────────────────────────
     RESET STATE WHEN MODAL CLOSES
  ───────────────────────────────────────── */

  useEffect(() => {
    if (!isOpen) {
      reset();

      setSelectedFile(null);
      setPreviewUrl(null);
      setToast(null);
      setLocationVerified(false);
    }
  }, [isOpen, reset]);

  /* ─────────────────────────────────────────
     FILE CHANGE HANDLER
  ───────────────────────────────────────── */

  const handleFileChange =
    useCallback(
      async (
        e: React.ChangeEvent<HTMLInputElement>
      ) => {
        const file =
          e.target.files?.[0];

        if (!file) return;

        if (
          !ACCEPTED_TYPES.includes(
            file.type
          )
        ) {
          setToast({
            type: 'error',
            message:
              'Invalid file type. Please upload a JPEG, PNG, or HEIC image.',
          });

          return;
        }

        /* Revoke old preview */

        if (previewUrl) {
          URL.revokeObjectURL(
            previewUrl
          );
        }

        setSelectedFile(file);
        setLocationVerified(false); // Uncheck when new image is selected

        setPreviewUrl(
          URL.createObjectURL(file)
        );
      },
      [previewUrl]
    );

  /* ─────────────────────────────────────────
     CLEAR FILE
  ───────────────────────────────────────── */

  const clearFile =
    useCallback(() => {
      if (previewUrl) {
        URL.revokeObjectURL(
          previewUrl
        );
      }

      setSelectedFile(null);
      setPreviewUrl(null);
      setLocationVerified(false); // Reset checkbox when removed

      if (fileInputRef.current) {
        fileInputRef.current.value =
          '';
      }
    }, [previewUrl]);

  /* ─────────────────────────────────────────
     FORM SUBMISSION
  ───────────────────────────────────────── */

  const onFormSubmit =
    useCallback(
      (data: FormValues) => {
        if (!data.issueType) {
          setToast({
            type: 'error',
            message:
              'Please select an issue type.',
          });

          return;
        }

        if (!selectedFile) {
          setToast({
            type: 'error',
            message:
              'Please upload a photo.',
          });

          return;
        }

        if (!locationVerified) {
          setToast({
            type: 'error',
            message:
              'Photo location must be verified before submitting.',
          });

          return;
        }

        const report: ConditionReport =
          {
            id: crypto.randomUUID(),

            siteId,

            issueType:
              data.issueType as IssueType,

            /*
             * This URL is still used by the current
             * online dashboard for preview purposes.
             *
             * The actual File is now also passed to
             * the parent for offline persistence.
             */
            photoUrl:
              previewUrl ?? '',

            verified: true,

            description:
              data.description,
          };

        /*
         * IMPORTANT:
         *
         * Pass BOTH:
         * 1. ConditionReport metadata
         * 2. Actual image File
         *
         * The parent can now store the File in
         * IndexedDB if the backend is unavailable.
         */
        onSubmit(
          report,
          selectedFile
        );

        onClose();
      },
      [
        selectedFile,
        locationVerified,
        siteId,
        previewUrl,
        onSubmit,
        onClose,
      ]
    );

  /* ═══════════════════════════════════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════════════════════════════════ */

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-backdrop"
          variants={
            backdropVariants
          }
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          {/* ── Toast ── */}

          <AnimatePresence>
            {toast && (
              <motion.div
                className={`report-toast report-toast--${toast.type}`}
                variants={
                  toastVariants
                }
                initial="hidden"
                animate="visible"
                exit="exit"
                role="alert"
              >
                {toast.type ===
                'error' ? (
                  <ShieldAlert
                    size={18}
                  />
                ) : (
                  <CheckCircle2
                    size={18}
                  />
                )}

                <span>
                  {toast.message}
                </span>

                <button
                  className="toast-dismiss"
                  onClick={() =>
                    setToast(null)
                  }
                  aria-label="Dismiss"
                >
                  <X size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Modal ── */}

          <motion.div
            className="report-modal"
            variants={
              modalVariants
            }
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            {/* Header */}

            <div className="report-modal__header">
              <div className="report-modal__title-group">
                <Camera size={20} />

                <h2 className="report-modal__title">
                  Report Condition
                </h2>
              </div>

              <button
                className="report-modal__close"
                onClick={onClose}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit(
                onFormSubmit
              )}
            >
              {/* Issue Type Chips */}

              <fieldset className="report-fieldset">
                <legend className="report-label">
                  Issue Type
                </legend>

                <div className="issue-chips">
                  {ISSUE_CHIPS.map(
                    (chip) => (
                      <motion.button
                        key={
                          chip.value
                        }
                        type="button"
                        className={`issue-chip ${
                          selectedIssueType ===
                          chip.value
                            ? 'issue-chip--active'
                            : ''
                        }`}
                        variants={
                          chipVariants
                        }
                        whileTap="tap"
                        onClick={() =>
                          setValue(
                            'issueType',
                            chip.value,
                            {
                              shouldValidate:
                                true,
                            }
                          )
                        }
                      >
                        <span className="issue-chip__icon">
                          {
                            chip.icon
                          }
                        </span>

                        <span>
                          {
                            chip.label
                          }
                        </span>
                      </motion.button>
                    )
                  )}
                </div>

                <input
                  type="hidden"
                  {...register(
                    'issueType',
                    {
                      required:
                        'Please select an issue type',
                    }
                  )}
                />

                {errors.issueType && (
                  <p className="field-error">
                    {
                      errors
                        .issueType
                        .message
                    }
                  </p>
                )}
              </fieldset>

              {/* Photo Upload */}

              <fieldset className="report-fieldset">
                <legend className="report-label">
                  <Camera size={14} />
                  Photo Evidence
                </legend>

                {!selectedFile ? (
                  <motion.label
                    className="upload-zone"
                    whileHover={{
                      borderColor:
                        'rgba(96, 165, 250, 0.6)',
                    }}
                    whileTap={{
                      scale: 0.99,
                    }}
                  >
                    <Upload
                      size={28}
                      className="upload-zone__icon"
                    />

                    <span className="upload-zone__title">
                      Upload a photo
                    </span>

                    <span className="upload-zone__subtitle">
                      JPEG, PNG, or HEIC
                    </span>

                    <input
                      ref={
                        fileInputRef
                      }
                      type="file"
                      accept="image/jpeg, image/png, image/heic"
                      className="upload-zone__input"
                      onChange={
                        handleFileChange
                      }
                    />
                  </motion.label>
                ) : (
                  <div className="upload-preview">
                    {previewUrl && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={
                          previewUrl
                        }
                        alt="Uploaded evidence"
                        className="upload-preview__image"
                      />
                    )}

                    <div className="upload-preview__info">
                      <span className="upload-preview__name">
                        {
                          selectedFile.name
                        }
                      </span>

                      <span className="upload-preview__size">
                        {(
                          selectedFile.size /
                          1024
                        ).toFixed(
                          1
                        )}{' '}
                        KB
                      </span>
                    </div>

                    <button
                      type="button"
                      className="upload-preview__remove"
                      onClick={
                        clearFile
                      }
                      aria-label="Remove file"
                    >
                      <Trash2
                        size={16}
                      />
                    </button>
                  </div>
                )}
              </fieldset>

              {/* Verification Status */}

              {selectedFile && (
                <div style={{ marginTop: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    id="location-verified"
                    checked={locationVerified}
                    onChange={(e) => setLocationVerified(e.target.checked)}
                    required
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  <label htmlFor="location-verified" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>
                    I verify that this image was taken at this heritage site's location.
                  </label>
                </div>
              )}

              {/* Description */}

              <fieldset className="report-fieldset">
                <legend className="report-label">
                  Description
                </legend>

                <textarea
                  className="report-textarea"
                  placeholder="Describe the issue in detail…"
                  rows={4}
                  {...register(
                    'description',
                    {
                      required:
                        'Please describe the issue',
                      minLength: {
                        value: 10,
                        message:
                          'Description must be at least 10 characters',
                      },
                    }
                  )}
                />

                {errors.description && (
                  <p className="field-error">
                    {
                      errors
                        .description
                        .message
                    }
                  </p>
                )}
              </fieldset>

              {/* Actions */}

              <div className="report-modal__actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={onClose}
                >
                  Cancel
                </button>

                <motion.button
                  type="submit"
                  className="btn-primary"
                  disabled={
                    !locationVerified || !selectedFile
                  }
                  whileHover={
                    locationVerified && selectedFile
                      ? {
                          scale: 1.02,
                        }
                      : {}
                  }
                  whileTap={
                    locationVerified && selectedFile
                      ? {
                          scale: 0.98,
                        }
                      : {}
                  }
                >
                  {locationVerified ? (
                    <>
                      <ShieldCheck
                        size={16}
                      />

                      Submit Report
                    </>
                  ) : (
                    <>
                      <Shield
                        size={16}
                      />

                      Submit Report
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}