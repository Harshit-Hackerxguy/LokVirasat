'use client';

import { useState } from 'react';
import {
  X,
  MapPin,
  Camera,
  Mic,
  CheckCircle,
  Upload,
  FileText,
  ShieldCheck,
} from 'lucide-react';

import {
  HeritageCategory,
  HeritageLead,
} from '@/types';

import './HeritageLeadModal.css';

interface HeritageLeadModalProps {
  lead: HeritageLead | null;
  onClose: () => void;
  onSubmit: (lead: HeritageLead) => void;
}

export default function HeritageLeadModal({
  lead,
  onClose,
  onSubmit,
}: HeritageLeadModalProps) {
  const [siteName, setSiteName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] =
    useState<HeritageCategory | ''>('');
  const [history, setHistory] = useState('');
  const [locationVerified, setLocationVerified] =
    useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);

  if (!lead) return null;

  const handlePhotoChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files) return;

    setPhotos(Array.from(event.target.files));
  };

  const handleSubmit = () => {
    if (!siteName.trim()) {
      alert('Please enter the heritage site name.');
      return;
    }

    if (!category) {
      alert('Please select a heritage category.');
      return;
    }

    if (!description.trim()) {
      alert('Please provide a description.');
      return;
    }

    if (!locationVerified) {
      alert('Please verify the site location.');
      return;
    }

    setSubmitted(true);

    // Prototype submission
    onSubmit({
      ...lead,
      name: siteName,
      category,
      description,
      status: 'documented',
    });
  };

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
            SCROLLABLE BODY
        ===================================================== */}

        <div className="heritage-modal-body">

          {/* =================================================
              COMMUNITY LEAD
          ================================================= */}

          <section className="heritage-section">

            <div className="heritage-lead-label-row">
              <span className="heritage-lead-label">
                Community Lead
              </span>

              <span className="heritage-status-pill">
                Needs Documentation
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

          {/* =================================================
              SITE INFORMATION
          ================================================= */}

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

              {/* Site name */}
              <div className="heritage-field">

                <label className="heritage-label">
                  Heritage Site Name
                </label>

                <input
                  type="text"
                  value={siteName}
                  onChange={(e) =>
                    setSiteName(e.target.value)
                  }
                  placeholder={lead.name}
                  className="heritage-input"
                />

              </div>

              {/* Category */}
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

                  <option value={HeritageCategory.Monument}>
                    Monument
                  </option>

                  <option
                    value={HeritageCategory.SacredGrove}
                  >
                    Sacred Grove
                  </option>

                  <option
                    value={HeritageCategory.FolkloreSite}
                  >
                    Folklore Site
                  </option>

                  <option
                    value={HeritageCategory.AncientRuins}
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

              {/* Description */}
              <div className="heritage-field heritage-form-full">

                <label className="heritage-label">
                  Site Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  placeholder="Describe the site's appearance, architecture, significance, traditions, or other useful information."
                  className="heritage-textarea"
                  rows={3}
                />

              </div>

              {/* Historical information */}
              <div className="heritage-field heritage-form-full">

                <label className="heritage-label">
                  Historical / Cultural Information
                </label>

                <textarea
                  value={history}
                  onChange={(e) =>
                    setHistory(e.target.value)
                  }
                  placeholder="Add information collected from local residents, historians, community members, or available records."
                  className="heritage-textarea"
                  rows={3}
                />

              </div>

            </div>

          </section>

          {/* =================================================
              EVIDENCE & VERIFICATION
          ================================================= */}

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

              {/* Photos */}
              <label className="heritage-upload">

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

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                />

                {photos.length > 0 && (
                  <span className="heritage-upload-success">
                    <CheckCircle className="h-3.5 w-3.5" />

                    {photos.length} photo
                    {photos.length !== 1 ? 's' : ''} selected
                  </span>
                )}

              </label>

              {/* Location verification */}
              <div className="heritage-verification-card">

                <div className="heritage-verification-icon">
                  <MapPin className="h-5 w-5" />
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

                  <button
                    type="button"
                    onClick={() =>
                      setLocationVerified(true)
                    }
                    className={`heritage-action-button ${
                      locationVerified ? 'verified' : ''
                    }`}
                  >
                    {locationVerified ? (
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

                </div>

              </div>

            </div>

          </section>

          {/* =================================================
              INTANGIBLE HERITAGE
          ================================================= */}

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
                onClick={() => {
                  alert(
                    'StoryRecorder will be connected here next.'
                  );
                }}
              >
                <Mic className="h-4 w-4" />
                Record Story
              </button>

            </div>

          </section>

          {/* =================================================
              SUBMISSION RESULT
          ================================================= */}

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

        {/* =====================================================
            FOOTER
        ===================================================== */}

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
              disabled={submitted}
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
    </div>
  );
}