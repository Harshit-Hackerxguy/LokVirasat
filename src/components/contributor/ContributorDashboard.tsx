'use client';

import { useEffect, useState } from 'react';
import {
  MapPin,
  ClipboardList,
  CheckCircle,
  Clock,
} from 'lucide-react';

import './ContributorDashboard.css';
import { HERITAGE_LEADS } from '@/data/heritageLeads';
import { HeritageLead } from '@/types';
import HeritageLeadCard from './HeritageLeadCard';
import HeritageLeadModal from '@/components/forms/HeritageLeadModal';
import ContributionStatus from './ContributionStatus';

interface ContributorDashboardProps {
  onClaim?: (lead: HeritageLead) => void;
}

const STORAGE_KEY = 'lokvirasat-heritage-leads';

export default function ContributorDashboard({
  onClaim,
}: ContributorDashboardProps) {
  const [filter, setFilter] = useState<
    'all' | 'available' | 'claimed' | 'completed'
  >('all');

  // =========================================================
  // LEADS STATE
  // =========================================================

  const [leads, setLeads] =
    useState<HeritageLead[]>(HERITAGE_LEADS);

  const [storageLoaded, setStorageLoaded] =
    useState(false);

  // =========================================================
  // DOCUMENTATION MODAL
  // =========================================================

  const [selectedLead, setSelectedLead] =
    useState<HeritageLead | null>(null);

  // =========================================================
  // PROGRESS MODAL
  // =========================================================

  const [progressLead, setProgressLead] =
    useState<HeritageLead | null>(null);

  // =========================================================
  // LOAD FROM LOCAL STORAGE
  // =========================================================

  useEffect(() => {
    try {
      const savedLeads =
        window.localStorage.getItem(STORAGE_KEY);

      if (savedLeads) {
        const parsedLeads =
          JSON.parse(savedLeads) as HeritageLead[];

        if (Array.isArray(parsedLeads)) {
          setLeads(parsedLeads);
        }
      }
    } catch (error) {
      console.error(
        'Failed to load heritage leads from localStorage:',
        error
      );
    } finally {
      setStorageLoaded(true);
    }
  }, []);

  // =========================================================
  // SAVE TO LOCAL STORAGE
  // =========================================================

  useEffect(() => {
    if (!storageLoaded) return;

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(leads)
      );
    } catch (error) {
      console.error(
        'Failed to save heritage leads to localStorage:',
        error
      );
    }
  }, [leads, storageLoaded]);

  // =========================================================
  // COUNTS
  // =========================================================

  const availableCount = leads.filter(
    (lead) =>
      lead.status === 'needs-documentation'
  ).length;

  const claimedCount = leads.filter(
    (lead) => lead.status === 'claimed'
  ).length;

  const completedCount = leads.filter(
    (lead) =>
      lead.status === 'documented' ||
      lead.status === 'verified'
  ).length;

  // =========================================================
  // FILTER
  // =========================================================

  const filteredLeads = leads.filter((lead) => {
    switch (filter) {
      case 'available':
        return (
          lead.status === 'needs-documentation'
        );

      case 'claimed':
        return lead.status === 'claimed';

      case 'completed':
        return (
          lead.status === 'documented' ||
          lead.status === 'verified'
        );

      default:
        return true;
    }
  });

  // =========================================================
  // CLAIM LEAD
  // =========================================================

  const handleClaim = (lead: HeritageLead) => {
    const claimedLead: HeritageLead = {
      ...lead,
      status: 'claimed',
      assignedContributor:
        lead.assignedContributor ||
        'Current Contributor',
    };

    setLeads((currentLeads) =>
      currentLeads.map((item) =>
        item.id === lead.id
          ? claimedLead
          : item
      )
    );

    // Open documentation modal
    setSelectedLead(claimedLead);

    onClaim?.(claimedLead);
  };

  // =========================================================
  // SUBMIT DOCUMENTATION
  // =========================================================

  const handleDocumentationSubmit = (
    documentedLead: HeritageLead
  ) => {
    const updatedLead: HeritageLead = {
      ...documentedLead,
      status: 'documented',
      assignedContributor:
        documentedLead.assignedContributor ||
        'Current Contributor',
    };

    setLeads((currentLeads) =>
      currentLeads.map((item) =>
        item.id === updatedLead.id
          ? updatedLead
          : item
      )
    );

    // Close documentation modal
    setSelectedLead(null);
  };

  // =========================================================
  // VIEW CONTRIBUTION PROGRESS
  // =========================================================

  const handleViewProgress = (
    lead: HeritageLead
  ) => {
    setProgressLead(lead);
  };

  // =========================================================
  // CLOSE DOCUMENTATION MODAL
  // =========================================================

  const handleCloseDocumentation = () => {
    setSelectedLead(null);
  };

  // =========================================================
  // CLOSE PROGRESS MODAL
  // =========================================================

  const handleCloseProgress = () => {
    setProgressLead(null);
  };

    return (
    <div className="contributor-page">

      <div className="contributor-container">

        {/* HEADER */}
        <section className="contributor-hero">

          <div className="contributor-hero-content">

            <div className="contributor-eyebrow">
              CONTRIBUTOR PORTAL
            </div>

            <h1 className="contributor-title">
              Preserve India&apos;s
              <span> Living Heritage</span>
            </h1>

            <p className="contributor-subtitle">
              Help document India&apos;s lesser-known heritage
              by collecting stories, evidence, and local knowledge.
            </p>

          </div>

          <div className="contributor-hero-badge">
            <MapPin className="h-5 w-5" />

            <div>
              <span>Contributor Access</span>
              <strong>Heritage Documentation</strong>
            </div>
          </div>

        </section>


        {/* STATS */}
        <section className="contributor-stats">

          <div className="contributor-stat-card">

            <div className="contributor-stat-content">
              <span className="contributor-stat-label">
                Total Leads
              </span>

              <span className="contributor-stat-value">
                {leads.length}
              </span>

              <span className="contributor-stat-description">
                Community-reported heritage
              </span>
            </div>

            <div className="contributor-stat-icon blue">
              <ClipboardList className="h-5 w-5" />
            </div>

          </div>


          <div className="contributor-stat-card">

            <div className="contributor-stat-content">
              <span className="contributor-stat-label">
                Available
              </span>

              <span className="contributor-stat-value blue-text">
                {availableCount}
              </span>

              <span className="contributor-stat-description">
                Ready to document
              </span>
            </div>

            <div className="contributor-stat-icon blue">
              <Clock className="h-5 w-5" />
            </div>

          </div>


          <div className="contributor-stat-card">

            <div className="contributor-stat-content">
              <span className="contributor-stat-label">
                Claimed
              </span>

              <span className="contributor-stat-value blue-text">
                {claimedCount}
              </span>

              <span className="contributor-stat-description">
                Currently being documented
              </span>
            </div>

            <div className="contributor-stat-icon blue">
              <MapPin className="h-5 w-5" />
            </div>

          </div>


          <div className="contributor-stat-card">

            <div className="contributor-stat-content">
              <span className="contributor-stat-label">
                Completed
              </span>

              <span className="contributor-stat-value green">
                {completedCount}
              </span>

              <span className="contributor-stat-description">
                Documentation submitted
              </span>
            </div>

            <div className="contributor-stat-icon green">
              <CheckCircle className="h-5 w-5" />
            </div>

          </div>

        </section>


        {/* FILTERS */}
        <section className="contributor-controls">

          <div className="contributor-filter-group">

            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`contributor-filter ${
                filter === 'all' ? 'active' : ''
              }`}
            >
              All
            </button>

            <button
              type="button"
              onClick={() => setFilter('available')}
              className={`contributor-filter ${
                filter === 'available' ? 'active' : ''
              }`}
            >
              Available
            </button>

            <button
              type="button"
              onClick={() => setFilter('claimed')}
              className={`contributor-filter ${
                filter === 'claimed' ? 'active' : ''
              }`}
            >
              Claimed
            </button>

            <button
              type="button"
              onClick={() => setFilter('completed')}
              className={`contributor-filter ${
                filter === 'completed' ? 'active' : ''
              }`}
            >
              Completed
            </button>

          </div>

        </section>


        {/* LEADS HEADER */}
        <section className="contributor-leads-header">

          <div>
            <h2>Heritage Leads</h2>

            <p>
              Community-reported locations awaiting
              documentation or verification.
            </p>
          </div>

          <span className="contributor-result-count">
            {filteredLeads.length} leads
          </span>

        </section>


        {/* LEADS */}
        {filteredLeads.length > 0 ? (

          <div className="contributor-leads-grid">

            {filteredLeads.map((lead) => (
              <HeritageLeadCard
                key={lead.id}
                lead={lead}
                onClaim={handleClaim}
                onViewProgress={handleViewProgress}
              />
            ))}

          </div>

        ) : (

          <div className="contributor-empty">

            <div className="contributor-empty-icon">
              <ClipboardList className="h-6 w-6" />
            </div>

            <h3>
              No leads found
            </h3>

            <p>
              There are no heritage leads in this category.
            </p>

          </div>

        )}

      </div>


      {/* DOCUMENTATION MODAL */}
      {selectedLead && (
        <HeritageLeadModal
          lead={selectedLead}
          onClose={handleCloseDocumentation}
          onSubmit={handleDocumentationSubmit}
        />
      )}


      {/* CONTRIBUTION PROGRESS MODAL */}
      {progressLead && (
        <ContributionStatus
          lead={progressLead}
          onClose={handleCloseProgress}
        />
      )}

    </div>
  );
}