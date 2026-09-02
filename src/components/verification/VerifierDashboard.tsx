'use client';

import './VerifierDashboard.css';
import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock3,
  FileCheck2,
  MapPin,
  ShieldCheck,
  X,
  XCircle,
  Mic,
} from 'lucide-react';

import { ConditionReport, HeritageLead } from '@/types';
import { HERITAGE_LEADS } from '@/data/heritageLeads';

const STORAGE_KEY = 'lokvirasat-heritage-leads';
const CONDITION_REPORTS_KEY = 'lokvirasat-condition-reports';

type Filter =
  | 'all'
  | 'needs-documentation'
  | 'claimed'
  | 'documented'
  | 'verified';

function StatusBadge({
  status,
}: {
  status: HeritageLead['status'];
}) {
  const config = {
    'needs-documentation': {
      label: 'Needs Documentation',
      className: 'status-needs',
    },

    claimed: {
      label: 'Claimed',
      className: 'status-claimed',
    },

    documented: {
      label: 'Pending Verification',
      className: 'status-pending',
    },

    verified: {
      label: 'Verified',
      className: 'status-verified',
    },
  };

  const current = config[status];

  return (
    <span
      className={`status-badge ${current.className}`}
    >
      {current.label}
    </span>
  );
}

export default function VerifierDashboard() {
  const [leads, setLeads] =
    useState<HeritageLead[]>([]);

  const [filter, setFilter] =
    useState<Filter>('all');

  const [selectedLead, setSelectedLead] =
    useState<HeritageLead | null>(null);

  const [rejecting, setRejecting] =
    useState(false);

  const [rejectionReason, setRejectionReason] =
    useState('');

  const [loaded, setLoaded] =
    useState(false);

  const [conditionReports, setConditionReports] =
    useState<ConditionReport[]>([]);

  const [selectedReport, setSelectedReport] =
    useState<ConditionReport | null>(null);

  /* LOAD SHARED CONTRIBUTOR DATA */

  useEffect(() => {
    try {
      const saved =
        window.localStorage.getItem(
          STORAGE_KEY
        );

      if (saved) {
        const parsed =
          JSON.parse(saved) as HeritageLead[];

        if (Array.isArray(parsed)) {
          setLeads(parsed);
        } else {
          setLeads(HERITAGE_LEADS);
        }
      } else {
        setLeads(HERITAGE_LEADS);
      }
    } catch (error) {
      console.error(
        'Failed to load verification data:',
        error
      );

      setLeads(HERITAGE_LEADS);
    } finally {
      setLoaded(true);
    }
  }, []);

  /* LOAD CONDITION REPORTS */

  useEffect(() => {
    try {
      const saved =
        window.localStorage.getItem(
          CONDITION_REPORTS_KEY
        );

      if (saved) {
        const parsed =
          JSON.parse(saved) as ConditionReport[];

        if (Array.isArray(parsed)) {
          setConditionReports(parsed);
        }
      }
    } catch (error) {
      console.error(
        'Failed to load condition reports:',
        error
      );
    }
  }, []);

  /* SAVE SHARED DATA */

  useEffect(() => {
    if (!loaded) return;

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(leads)
      );
    } catch (error) {
      console.error(
        'Failed to save verification data:',
        error
      );
    }
  }, [leads, loaded]);

  /* FILTER */

  const filteredLeads = useMemo(() => {
    if (filter === 'all') {
      return leads;
    }

    return leads.filter(
      (lead) => lead.status === filter
    );
  }, [leads, filter]);

  /* COUNTS */

  const pendingCount = leads.filter(
    (lead) => lead.status === 'documented'
  ).length;

  const verifiedCount = leads.filter(
    (lead) => lead.status === 'verified'
  ).length;

  const claimedCount = leads.filter(
    (lead) => lead.status === 'claimed'
  ).length;

  /* APPROVE */

  const approveLead = (
    lead: HeritageLead
  ) => {
    const updated: HeritageLead = {
      ...lead,
      status: 'verified',
    };

    setLeads((current) =>
      current.map((item) =>
        item.id === lead.id
          ? updated
          : item
      )
    );

    setSelectedLead(null);
    setRejecting(false);
    setRejectionReason('');
  };

  /* REJECT */

  const rejectLead = (
    lead: HeritageLead
  ) => {
    const updated: HeritageLead = {
      ...lead,
      status: 'claimed',
    };

    setLeads((current) =>
      current.map((item) =>
        item.id === lead.id
          ? updated
          : item
      )
    );

    setSelectedLead(null);
    setRejecting(false);
    setRejectionReason('');
  };

  /* OPEN REVIEW */

  const openReview = (
    lead: HeritageLead
  ) => {
    setSelectedLead(lead);
    setRejecting(false);
    setRejectionReason('');
  };

  /* CLOSE / RESOLVE CONDITION REPORT */

  const closeConditionReport = (
    reportId: string
  ) => {
    setConditionReports((current) => {
      const updated = current.filter(
        (report) => report.id !== reportId
      );

      try {
        window.localStorage.setItem(
          CONDITION_REPORTS_KEY,
          JSON.stringify(updated)
        );
      } catch (error) {
        console.error(
          'Failed to save condition report changes:',
          error
        );
      }

      return updated;
    });

    setSelectedReport(null);
  };

  return (
    <main className="verification-page">

      {/* HEADER */}

      <section className="verification-header">

        <div className="verification-header-inner">

          <div className="verification-header-row">

            <div>

              <p className="portal-label">
                Moderator Portal
              </p>

              <h1 className="verification-title">
                Heritage Verification
              </h1>

              <p className="verification-subtitle">
                Review community-documented heritage
                submissions before they become trusted
                LokVirasat records.
              </p>

            </div>

            <div className="moderator-access">

              <ShieldCheck className="h-5 w-5" />

              <div>

                <p className="moderator-access-label">
                  Moderator Access
                </p>

                <p className="moderator-access-title">
                  Verification Dashboard
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* CONTENT */}

      <div className="verification-content">

        {/* STATS */}

        <div className="verification-stats">

          <div className="verification-stat">

            <div className="stat-icon pending">
              <Clock3 className="h-5 w-5" />
            </div>

            <div>

              <p className="stat-label">
                Pending Review
              </p>

              <p className="stat-value">
                {pendingCount}
              </p>

            </div>

          </div>

          <div className="verification-stat">

            <div className="stat-icon claimed">
              <FileCheck2 className="h-5 w-5" />
            </div>

            <div>

              <p className="stat-label">
                Claimed
              </p>

              <p className="stat-value">
                {claimedCount}
              </p>

            </div>

          </div>

          <div className="verification-stat">

            <div className="stat-icon verified">
              <CheckCircle2 className="h-5 w-5" />
            </div>

            <div>

              <p className="stat-label">
                Verified
              </p>

              <p className="stat-value">
                {verifiedCount}
              </p>

            </div>

          </div>

        </div>

        {/* FILTERS */}

        <div className="verification-filters">

          {(
            [
              ['all', 'All'],
              [
                'documented',
                'Pending Verification',
              ],
              ['verified', 'Verified'],
              ['claimed', 'Claimed'],
              [
                'needs-documentation',
                'Needs Documentation',
              ],
            ] as [Filter, string][]
          ).map(
            ([value, label]) => (

              <button
                key={value}
                type="button"
                onClick={() =>
                  setFilter(value)
                }
                className={`verification-filter ${
                  filter === value
                    ? 'active'
                    : ''
                }`}
              >
                {label}
              </button>

            )
          )}

        </div>

        {/* CONDITION REPORTS */}

        {conditionReports.length > 0 && (

          <section className="verification-submissions">

            <div className="mb-5">
              <div className="flex items-center gap-3">
                <div className="stat-icon pending">
                  <MapPin className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Condition Reports
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Review location-verified reports submitted
                    for documented heritage sites.
                  </p>
                </div>
              </div>
            </div>

            {conditionReports.map((report) => {

              const relatedLead =
                leads.find(
                  (lead) => lead.id === report.siteId
                );

              return (
                <article
                  key={report.id}
                  className="submission-card"
                >

                  <div className="submission-layout">

                    <div className="submission-main">

                      <div className="submission-heading">

                        <h2 className="submission-name">
                          {relatedLead?.name ||
                            report.siteId}
                        </h2>

                        <span className="status-badge status-pending">
                          Condition Report
                        </span>

                      </div>

                      <p className="submission-category">
                        {report.issueType}
                      </p>

                      <p className="submission-description">
                        {report.description ||
                          'No additional description provided.'}
                      </p>

                      <div className="submission-meta">

                        <span className="submission-meta-item">
                          <MapPin />
                          GPS Verified
                        </span>

                        <span className="submission-meta-item">
                          Report ID{' '}
                          <strong>{report.id}</strong>
                        </span>

                      </div>

                    </div>

                    <div className="submission-action">

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedReport(report)
                        }
                        className="review-button"
                      >
                        Review Report
                      </button>

                    </div>

                  </div>

                </article>
              );
            })}

          </section>

        )}

        {/* SUBMISSIONS */}

        <div className="verification-submissions">

          {!loaded ? (

            <div className="verification-empty">

              <p>
                Loading verification submissions...
              </p>

            </div>

          ) : filteredLeads.length === 0 ? (

            <div className="verification-empty">

              <div className="empty-icon">
                <FileCheck2 className="h-6 w-6" />
              </div>

              <h2>
                No submissions found
              </h2>

              <p>
                There are no heritage submissions in this
                category right now.
              </p>

            </div>

          ) : (

            filteredLeads.map(
              (lead) => (

                <article
                  key={lead.id}
                  className="submission-card"
                >

                  <div className="submission-layout">

                    <div className="submission-main">

                      <div className="submission-heading">

                        <h2 className="submission-name">
                          {lead.name}
                        </h2>

                        <StatusBadge
                          status={lead.status}
                        />

                      </div>

                      <p className="submission-category">
                        {lead.category}
                      </p>

                      <p className="submission-description">
                        {lead.description}
                      </p>

                      <div className="submission-meta">

                        <span className="submission-meta-item">

                          <MapPin />

                          {lead.villageOrArea}

                        </span>

                        <span className="submission-meta-item">

                          Submitted by{' '}

                          <strong>
                            {lead.submittedBy}
                          </strong>

                        </span>

                        {lead.assignedContributor && (

                          <span className="submission-meta-item">

                            Contributor:{' '}

                            <strong>
                              {lead.assignedContributor}
                            </strong>

                          </span>

                        )}

                        <span className="submission-meta-item">

                          Submitted{' '}
                          {lead.submittedAt}

                        </span>

                      </div>

                    </div>

                    <div className="submission-action">

                      {lead.status ===
                      'documented' ? (

                        <button
                          type="button"
                          onClick={() =>
                            openReview(lead)
                          }
                          className="review-button"
                        >
                          Review Submission
                        </button>

                      ) : lead.status ===
                        'verified' ? (

                        <div className="verified-state">

                          <CheckCircle2 className="h-4 w-4" />

                          Verified

                        </div>

                      ) : (

                        <div className="not-ready">
                          Not ready for review
                        </div>

                      )}

                    </div>

                  </div>

                </article>

              )
            )

          )}

        </div>

      </div>

      {/* =====================================================
          CONDITION REPORT REVIEW MODAL
      ===================================================== */}

      {selectedReport && (

        <div className="verification-modal-overlay">

          <div className="verification-modal">

            <div className="verification-modal-header">

              <div className="verification-modal-title-wrap">

                <p className="verification-modal-label">
                  Condition Report Review
                </p>

                <h2 className="verification-modal-title">
                  {selectedReport.issueType}
                </h2>

                <p className="verification-modal-description">
                  Review the reported condition and evidence
                  before acknowledging or dismissing it.
                </p>

              </div>

              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="verification-modal-close"
                aria-label="Close condition report"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            <div className="verification-modal-body">

              <section className="verification-modal-section">

                <h3 className="verification-section-title">
                  Report Details
                </h3>

                <div className="verification-info-card">

                  <div>
                    <p className="verification-info-label">
                      Issue Type
                    </p>

                    <p className="verification-info-value">
                      {selectedReport.issueType}
                    </p>
                  </div>

                  <div className="verification-description-block">

                    <p className="verification-info-label">
                      Description
                    </p>

                    <p className="verification-info-description">
                      {selectedReport.description ||
                        'No additional description provided.'}
                    </p>

                  </div>

                  <div className="verification-description-block">

                    <p className="verification-info-label">
                      Heritage Site ID
                    </p>

                    <p className="verification-info-description">
                      {selectedReport.siteId}
                    </p>

                  </div>

                </div>

              </section>

              <section className="verification-modal-section">

                <h3 className="verification-section-title">
                  Location Verification
                </h3>

                <div className="verification-info-card">

                  <div className="verification-location">

                    <div className="verification-location-icon">
                      <MapPin className="h-5 w-5" />
                    </div>

                    <div>

                      <p className="verification-info-value">
                        Location verified
                      </p>

                      <p className="verification-info-description">
                        Coordinates:{' '}
                        {selectedReport.exifCoords[1].toFixed(5)}
                        ,{' '}
                        {selectedReport.exifCoords[0].toFixed(5)}
                      </p>

                      <p className="text-sm text-emerald-400 mt-2">
                        ✓ Report passed the location verification
                        check
                      </p>

                    </div>

                  </div>

                </div>

              </section>

              {selectedReport.photoUrl && (

                <section className="verification-modal-section">

                  <h3 className="verification-section-title">
                    Evidence Photo
                  </h3>

                  <div className="verification-info-card">

                    <div className="overflow-hidden rounded-xl border border-blue-500/20 bg-black/20">

                      <img
                        src={selectedReport.photoUrl}
                        alt={`Evidence for ${selectedReport.issueType}`}
                        className="max-h-[420px] w-full object-contain"
                      />

                    </div>

                  </div>

                </section>

              )}

            </div>

            <div className="verification-modal-footer">

              <button
                type="button"
                onClick={() =>
                  closeConditionReport(selectedReport.id)
                }
                className="verification-footer-button verification-footer-reject"
              >
                <XCircle className="h-4 w-4" />
                Dismiss Report
              </button>

              <button
                type="button"
                onClick={() =>
                  closeConditionReport(selectedReport.id)
                }
                className="verification-footer-button verification-footer-approve"
              >
                <CheckCircle2 className="h-4 w-4" />
                Acknowledge & Resolve
              </button>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          REVIEW MODAL
      ===================================================== */}

      {selectedLead && (

        <div className="verification-modal-overlay">

          <div className="verification-modal">

            {/* HEADER */}

            <div className="verification-modal-header">

              <div className="verification-modal-title-wrap">

                <p className="verification-modal-label">
                  Moderator Review
                </p>

                <h2 className="verification-modal-title">
                  {selectedLead.name}
                </h2>

                <p className="verification-modal-description">
                  Review the submitted heritage information
                  before approving it.
                </p>

              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedLead(null);
                  setRejecting(false);
                  setRejectionReason('');
                }}
                className="verification-modal-close"
                aria-label="Close review"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            {/* BODY */}

            <div className="verification-modal-body">

              {/* HERITAGE INFORMATION */}

              <section className="verification-modal-section">

                <h3 className="verification-section-title">
                  Heritage Information
                </h3>

                <div className="verification-info-card">

                  <div>

                    <p className="verification-info-label">
                      Category
                    </p>

                    <p className="verification-info-value">
                      {selectedLead.category}
                    </p>

                  </div>

                  <div className="verification-description-block">

                    <p className="verification-info-label">
                      Description
                    </p>

                    <p className="verification-info-description">
                      {selectedLead.description}
                    </p>

                  </div>

                  {selectedLead.historicalInformation && (

                    <div className="verification-description-block">

                      <p className="verification-info-label">
                        Historical / Cultural Information
                      </p>

                      <p className="verification-info-description">
                        {selectedLead.historicalInformation}
                      </p>

                    </div>

                  )}

                </div>

              </section>

              {/* LOCATION */}

              <section className="verification-modal-section">

                <h3 className="verification-section-title">
                  Location
                </h3>

                <div className="verification-info-card">

                  <div className="verification-location">

                    <div className="verification-location-icon">

                      <MapPin className="h-5 w-5" />

                    </div>

                    <div>

                      <p className="verification-info-value">
                        {selectedLead.villageOrArea}
                      </p>

                      <p className="verification-info-description">

                        Coordinates:{' '}

                        {selectedLead.approximateLocation[1].toFixed(5)}
                        ,{' '}

                        {selectedLead.approximateLocation[0].toFixed(5)}

                      </p>

                      {selectedLead.verifiedCoordinates && (

                        <p className="verification-info-description">

                          GPS Verified Coordinates:{' '}

                          {selectedLead.verifiedCoordinates[1].toFixed(5)}
                          ,{' '}

                          {selectedLead.verifiedCoordinates[0].toFixed(5)}

                        </p>

                      )}

                      {selectedLead.locationVerified && (

                        <p className="text-sm text-emerald-400 mt-2">

                          ✓ Contributor location verified

                        </p>

                      )}

                    </div>

                  </div>

                </div>

              </section>

              {/* CONTRIBUTION DETAILS */}

              <section className="verification-modal-section">

                <h3 className="verification-section-title">
                  Contribution Details
                </h3>

                <div className="verification-grid">

                  <div className="verification-info-card">

                    <p className="verification-info-label">
                      Submitted By
                    </p>

                    <p className="verification-info-value">
                      {selectedLead.submittedBy}
                    </p>

                  </div>

                  <div className="verification-info-card">

                    <p className="verification-info-label">
                      Assigned Contributor
                    </p>

                    <p className="verification-info-value">

                      {selectedLead.assignedContributor ||
                        'Not specified'}

                    </p>

                  </div>

                  <div className="verification-info-card verification-full">

                    <p className="verification-info-label">
                      Submitted
                    </p>

                    <p className="verification-info-value">
                      {selectedLead.submittedAt}
                    </p>

                  </div>

                </div>

              </section>

              {/* =================================================
                  PHOTOS / EVIDENCE
              ================================================= */}

              {selectedLead.photos &&
                selectedLead.photos.length > 0 && (

                  <section className="verification-modal-section">

                    <h3 className="verification-section-title">
                      Evidence & Photos
                    </h3>

                    <div className="verification-info-card">

                      <div className="space-y-3">

                        {selectedLead.photos.map(
                          (photo, index) => (

                            <div
                              key={`${photo}-${index}`}
                              className="flex items-center gap-3 rounded-lg border border-blue-500/20 bg-blue-500/5 px-4 py-3"
                            >

                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">

                                <FileCheck2 className="h-4 w-4 text-blue-400" />

                              </div>

                              <span className="text-sm text-slate-300 truncate">

                                {photo}

                              </span>

                            </div>

                          )
                        )}

                      </div>

                    </div>

                  </section>

                )}

              {/* =================================================
                  LOCAL STORIES
              ================================================= */}

              {selectedLead.oralStories &&
                selectedLead.oralStories.length > 0 && (

                  <section className="verification-modal-section">

                    <h3 className="verification-section-title">

                      Local Stories

                    </h3>

                    <div className="verification-info-card">

                      <div className="space-y-4">

                        {selectedLead.oralStories.map(
                          (story, index) => (

                            <div
                              key={`${story.audioUrl}-${index}`}
                              className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4"
                            >

                              <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">

                                  <Mic className="h-5 w-5" />

                                </div>

                                <div>

                                  <p className="font-semibold text-white">

                                    Local Oral History{' '}
                                    {index + 1}

                                  </p>

                                  <p className="text-sm text-slate-400">

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

                    </div>

                  </section>

                )}

              {/* CURRENT STATE */}

              <section className="verification-modal-section">

                <div className="verification-pending-box">

                  <Clock3 />

                  <div>

                    <p className="verification-pending-title">
                      Pending moderator verification
                    </p>

                    <p className="verification-pending-text">
                      This contribution has completed
                      documentation and is waiting for
                      moderator review.
                    </p>

                  </div>

                </div>

              </section>

              {/* REJECTION */}

              {rejecting && (

                <section className="verification-rejection">

                  <label htmlFor="rejection-reason">
                    Reason for rejection
                  </label>

                  <textarea
                    id="rejection-reason"
                    value={rejectionReason}
                    onChange={(event) =>
                      setRejectionReason(
                        event.target.value
                      )
                    }
                    placeholder="Explain what needs to be improved..."
                    rows={4}
                  />

                </section>

              )}

            </div>

            {/* FOOTER */}

            <div className="verification-modal-footer">

              {!rejecting ? (

                <>

                  <button
                    type="button"
                    onClick={() =>
                      setRejecting(true)
                    }
                    className="verification-footer-button verification-footer-reject"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      approveLead(selectedLead)
                    }
                    className="verification-footer-button verification-footer-approve"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Approve & Verify
                  </button>

                </>

              ) : (

                <>

                  <button
                    type="button"
                    onClick={() => {
                      setRejecting(false);
                      setRejectionReason('');
                    }}
                    className="verification-footer-button verification-footer-cancel"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      rejectLead(selectedLead)
                    }
                    className="verification-footer-button verification-footer-confirm-reject"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject Submission
                  </button>

                </>

              )}

            </div>

          </div>

        </div>

      )}

    </main>
  );
}