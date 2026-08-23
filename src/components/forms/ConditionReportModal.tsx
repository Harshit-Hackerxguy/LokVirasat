'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import exifr from 'exifr';
import {
  X,
  Camera,
  Shield,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  Loader2,
  Upload,
  Trash2,
} from 'lucide-react';
import {
  calculateHaversineDistance,
  VERIFICATION_RADIUS_METERS,
  type GeoCoord,
} from '@/utils/geo';
import { IssueType, type ConditionReport, type Coordinates } from '@/types';

/* ═══════════════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════════════ */

interface ConditionReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteId: string;
  onSubmit: (report: ConditionReport) => void;
}

interface FormValues {
  issueType: IssueType | '';
  description: string;
}

type VerificationStatus =
  | 'idle'
  | 'reading-exif'
  | 'requesting-gps'
  | 'verifying'
  | 'verified'
  | 'failed'
  | 'error';

interface VerificationState {
  status: VerificationStatus;
  message: string;
  exifCoords: GeoCoord | null;
  browserCoords: GeoCoord | null;
  distance: number | null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════════════════ */

const ISSUE_CHIPS: { value: IssueType; label: string; icon: string }[] = [
  { value: IssueType.Damage, label: 'Damage', icon: '🏚️' },
  { value: IssueType.Cleanliness, label: 'Cleanliness', icon: '🧹' },
  { value: IssueType.Infrastructure, label: 'Infrastructure', icon: '🏗️' },
  { value: IssueType.Accessibility, label: 'Accessibility', icon: '♿' },
];

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/heic'];

/* ═══════════════════════════════════════════════════════════════════════════
   Animation Variants
   ═══════════════════════════════════════════════════════════════════════════ */

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, damping: 28, stiffness: 380 },
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    y: 30,
    transition: { duration: 0.2 },
  },
};

const toastVariants = {
  hidden: { opacity: 0, y: -20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, damping: 22, stiffness: 400 },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

const chipVariants = {
  idle: { scale: 1 },
  tap: { scale: 0.95 },
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    type: 'error' | 'success';
    message: string;
  } | null>(null);

  const [verification, setVerification] = useState<VerificationState>({
    status: 'idle',
    message: '',
    exifCoords: null,
    browserCoords: null,
    distance: null,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { issueType: '', description: '' },
  });

  const selectedIssueType = watch('issueType');

  // ── Cleanup preview URL on unmount ──
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // ── Auto-dismiss toast ──
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(timer);
  }, [toast]);

  // ── Reset state when modal closes ──
  useEffect(() => {
    if (!isOpen) {
      reset();
      setSelectedFile(null);
      setPreviewUrl(null);
      setToast(null);
      setVerification({
        status: 'idle',
        message: '',
        exifCoords: null,
        browserCoords: null,
        distance: null,
      });
    }
  }, [isOpen, reset]);

  /* ── Browser geolocation wrapper ──────────────────────────────────────── */
  const getBrowserLocation = useCallback((): Promise<GeoCoord> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation API is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              reject(
                new Error(
                  'Location permission denied. Please enable location access in your browser settings to verify reports.',
                ),
              );
              break;
            case error.POSITION_UNAVAILABLE:
              reject(
                new Error(
                  'Location information is unavailable. Please ensure GPS is enabled on your device.',
                ),
              );
              break;
            case error.TIMEOUT:
              reject(
                new Error(
                  'Location request timed out. Please try again in an area with better signal.',
                ),
              );
              break;
            default:
              reject(
                new Error(`An unknown geolocation error occurred (code: ${error.code}).`),
              );
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 15_000,
          maximumAge: 0,
        },
      );
    });
  }, []);

  /* ── EXIF GPS extraction ──────────────────────────────────────────────── */
  const extractExifGps = useCallback(
    async (file: File): Promise<GeoCoord> => {
      try {
        const gps = await exifr.gps(file);

        if (!gps || gps.latitude == null || gps.longitude == null) {
          throw new Error(
            'No GPS data found in the photo\'s EXIF metadata. Please upload a photo taken with location services enabled.',
          );
        }

        return { latitude: gps.latitude, longitude: gps.longitude };
      } catch (err) {
        if (err instanceof Error && err.message.includes('No GPS data')) {
          throw err;
        }
        throw new Error(
          'Could not read photo metadata. The file may be corrupted or in an unsupported format.',
        );
      }
    },
    [],
  );

  /* ── Full verification pipeline ───────────────────────────────────────── */
  const runVerification = useCallback(
    async (file: File) => {
      // Step 1: Read EXIF
      setVerification((prev) => ({
        ...prev,
        status: 'reading-exif',
        message: 'Extracting GPS data from photo…',
      }));

      let exifCoords: GeoCoord;
      try {
        exifCoords = await extractExifGps(file);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Failed to read EXIF data.';
        setVerification({
          status: 'error',
          message: msg,
          exifCoords: null,
          browserCoords: null,
          distance: null,
        });
        setToast({ type: 'error', message: msg });
        return;
      }

      // Step 2: Get browser location
      setVerification((prev) => ({
        ...prev,
        status: 'requesting-gps',
        message: 'Requesting your current location…',
        exifCoords,
      }));

      let browserCoords: GeoCoord;
      try {
        browserCoords = await getBrowserLocation();
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : 'Failed to get browser location.';
        setVerification({
          status: 'error',
          message: msg,
          exifCoords,
          browserCoords: null,
          distance: null,
        });
        setToast({ type: 'error', message: msg });
        return;
      }

      // Step 3: Calculate distance
      setVerification((prev) => ({
        ...prev,
        status: 'verifying',
        message: 'Calculating distance…',
        browserCoords,
      }));

      let distance: number;
      try {
        distance = calculateHaversineDistance(exifCoords, browserCoords);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Distance calculation failed.';
        setVerification({
          status: 'error',
          message: msg,
          exifCoords,
          browserCoords,
          distance: null,
        });
        setToast({ type: 'error', message: msg });
        return;
      }

      // Step 4: Verdict
      if (distance > VERIFICATION_RADIUS_METERS) {
        setVerification({
          status: 'failed',
          message: `Verification Failed: Photo location does not match your current location. Distance: ${Math.round(distance)}m (max: ${VERIFICATION_RADIUS_METERS}m).`,
          exifCoords,
          browserCoords,
          distance,
        });
        setToast({
          type: 'error',
          message:
            'Verification Failed: Photo location does not match your current location.',
        });
      } else {
        setVerification({
          status: 'verified',
          message: `Location verified! Distance: ${Math.round(distance)}m.`,
          exifCoords,
          browserCoords,
          distance,
        });
        setToast({
          type: 'success',
          message: `Photo location verified (${Math.round(distance)}m away).`,
        });
      }
    },
    [extractExifGps, getBrowserLocation],
  );

  /* ── File change handler ──────────────────────────────────────────────── */
  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setToast({
          type: 'error',
          message: 'Invalid file type. Please upload a JPEG, PNG, or HEIC image.',
        });
        return;
      }

      // Revoke old preview
      if (previewUrl) URL.revokeObjectURL(previewUrl);

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));

      await runVerification(file);
    },
    [previewUrl, runVerification],
  );

  /* ── Clear file ───────────────────────────────────────────────────────── */
  const clearFile = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setVerification({
      status: 'idle',
      message: '',
      exifCoords: null,
      browserCoords: null,
      distance: null,
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [previewUrl]);

  /* ── Form submission ──────────────────────────────────────────────────── */
  const onFormSubmit = useCallback(
    (data: FormValues) => {
      if (!data.issueType) {
        setToast({ type: 'error', message: 'Please select an issue type.' });
        return;
      }

      if (!selectedFile) {
        setToast({ type: 'error', message: 'Please upload a photo.' });
        return;
      }

      if (verification.status !== 'verified') {
        setToast({
          type: 'error',
          message: 'Photo location must be verified before submitting.',
        });
        return;
      }

      const report: ConditionReport = {
        id: crypto.randomUUID(),
        siteId,
        issueType: data.issueType as IssueType,
        photoUrl: previewUrl ?? '',
        exifCoords: [
          verification.exifCoords!.longitude,
          verification.exifCoords!.latitude,
        ] as Coordinates,
        verified: true,
        description: data.description,
      };

      onSubmit(report);
      onClose();
    },
    [selectedFile, verification, siteId, previewUrl, onSubmit, onClose],
  );

  /* ── Verification status indicator ────────────────────────────────────── */
  const renderVerificationBadge = () => {
    const { status, message, distance } = verification;

    const configs: Record<
      VerificationStatus,
      {
        icon: React.ReactNode;
        className: string;
      }
    > = {
      idle: {
        icon: <Shield size={16} />,
        className: 'verification-badge--idle',
      },
      'reading-exif': {
        icon: <Loader2 size={16} className="spin" />,
        className: 'verification-badge--loading',
      },
      'requesting-gps': {
        icon: <Loader2 size={16} className="spin" />,
        className: 'verification-badge--loading',
      },
      verifying: {
        icon: <Loader2 size={16} className="spin" />,
        className: 'verification-badge--loading',
      },
      verified: {
        icon: <ShieldCheck size={16} />,
        className: 'verification-badge--verified',
      },
      failed: {
        icon: <ShieldAlert size={16} />,
        className: 'verification-badge--failed',
      },
      error: {
        icon: <AlertTriangle size={16} />,
        className: 'verification-badge--error',
      },
    };

    const config = configs[status];

    return (
      <motion.div
        className={`verification-badge ${config.className}`}
        layout
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        transition={{ duration: 0.3 }}
      >
        <div className="verification-badge__header">
          {config.icon}
          <span className="verification-badge__label">
            {status === 'idle'
              ? 'Location Verification'
              : status === 'verified'
                ? 'Verified'
                : status === 'failed'
                  ? 'Verification Failed'
                  : status === 'error'
                    ? 'Error'
                    : 'Verifying…'}
          </span>
        </div>
        {message && (
          <p className="verification-badge__message">{message}</p>
        )}
        {distance != null && status !== 'idle' && (
          <div className="verification-badge__distance">
            <MapPin size={12} />
            <span>{Math.round(distance)}m distance</span>
            <span className="verification-badge__threshold">
              / {VERIFICATION_RADIUS_METERS}m max
            </span>
          </div>
        )}
      </motion.div>
    );
  };

  /* ═══════════════════════════════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════════════════════════════ */

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-backdrop"
          variants={backdropVariants}
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
                variants={toastVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                role="alert"
              >
                {toast.type === 'error' ? (
                  <ShieldAlert size={18} />
                ) : (
                  <CheckCircle2 size={18} />
                )}
                <span>{toast.message}</span>
                <button
                  className="toast-dismiss"
                  onClick={() => setToast(null)}
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
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="report-modal__header">
              <div className="report-modal__title-group">
                <Camera size={20} />
                <h2 className="report-modal__title">Report Condition</h2>
              </div>
              <button
                className="report-modal__close"
                onClick={onClose}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onFormSubmit)}>
              {/* Issue Type Chips */}
              <fieldset className="report-fieldset">
                <legend className="report-label">Issue Type</legend>
                <div className="issue-chips">
                  {ISSUE_CHIPS.map((chip) => (
                    <motion.button
                      key={chip.value}
                      type="button"
                      className={`issue-chip ${
                        selectedIssueType === chip.value
                          ? 'issue-chip--active'
                          : ''
                      }`}
                      variants={chipVariants}
                      whileTap="tap"
                      onClick={() =>
                        setValue('issueType', chip.value, {
                          shouldValidate: true,
                        })
                      }
                    >
                      <span className="issue-chip__icon">{chip.icon}</span>
                      <span>{chip.label}</span>
                    </motion.button>
                  ))}
                </div>
                <input
                  type="hidden"
                  {...register('issueType', {
                    required: 'Please select an issue type',
                  })}
                />
                {errors.issueType && (
                  <p className="field-error">{errors.issueType.message}</p>
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
                    whileHover={{ borderColor: 'rgba(96, 165, 250, 0.6)' }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Upload size={28} className="upload-zone__icon" />
                    <span className="upload-zone__title">
                      Upload a geotagged photo
                    </span>
                    <span className="upload-zone__subtitle">
                      JPEG, PNG, or HEIC • Must contain GPS EXIF data
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg, image/png, image/heic"
                      className="upload-zone__input"
                      onChange={handleFileChange}
                    />
                  </motion.label>
                ) : (
                  <div className="upload-preview">
                    {previewUrl && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={previewUrl}
                        alt="Uploaded evidence"
                        className="upload-preview__image"
                      />
                    )}
                    <div className="upload-preview__info">
                      <span className="upload-preview__name">
                        {selectedFile.name}
                      </span>
                      <span className="upload-preview__size">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    <button
                      type="button"
                      className="upload-preview__remove"
                      onClick={clearFile}
                      aria-label="Remove file"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </fieldset>

              {/* Verification Status */}
              {verification.status !== 'idle' && renderVerificationBadge()}

              {/* Description */}
              <fieldset className="report-fieldset">
                <legend className="report-label">Description</legend>
                <textarea
                  className="report-textarea"
                  placeholder="Describe the issue in detail…"
                  rows={4}
                  {...register('description', {
                    required: 'Please describe the issue',
                    minLength: {
                      value: 10,
                      message: 'Description must be at least 10 characters',
                    },
                  })}
                />
                {errors.description && (
                  <p className="field-error">{errors.description.message}</p>
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
                  disabled={verification.status !== 'verified'}
                  whileHover={
                    verification.status === 'verified' ? { scale: 1.02 } : {}
                  }
                  whileTap={
                    verification.status === 'verified' ? { scale: 0.98 } : {}
                  }
                >
                  {verification.status === 'verified' ? (
                    <>
                      <ShieldCheck size={16} />
                      Submit Report
                    </>
                  ) : verification.status === 'reading-exif' ||
                    verification.status === 'requesting-gps' ||
                    verification.status === 'verifying' ? (
                    <>
                      <Loader2 size={16} className="spin" />
                      Verifying…
                    </>
                  ) : (
                    <>
                      <Shield size={16} />
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
