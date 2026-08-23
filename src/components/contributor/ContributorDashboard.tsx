'use client';

import { useEffect, useState } from 'react';
import {
  MapPin,
  ClipboardList,
  CheckCircle,
  Clock,
} from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50 p-6">

      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
              <MapPin className="h-6 w-6" />
            </div>

            <div>

              <h1 className="text-2xl font-bold text-gray-900">
                Heritage Contributor
              </h1>

              <p className="text-sm text-gray-500">
                Help document India's lesser-known heritage.
              </p>

            </div>

          </div>

        </div>

        {/* =================================================
            STATS
        ================================================= */}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-gray-500">
                  Total Leads
                </p>

                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {leads.length}
                </p>

              </div>

              <ClipboardList className="h-6 w-6 text-blue-600" />

            </div>

          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-gray-500">
                  Available
                </p>

                <p className="mt-1 text-2xl font-bold text-amber-600">
                  {availableCount}
                </p>

              </div>

              <Clock className="h-6 w-6 text-amber-500" />

            </div>

          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-gray-500">
                  Claimed
                </p>

                <p className="mt-1 text-2xl font-bold text-blue-600">
                  {claimedCount}
                </p>

              </div>

              <MapPin className="h-6 w-6 text-blue-500" />

            </div>

          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-gray-500">
                  Completed
                </p>

                <p className="mt-1 text-2xl font-bold text-green-600">
                  {completedCount}
                </p>

              </div>

              <CheckCircle className="h-6 w-6 text-green-500" />

            </div>

          </div>

        </div>

        {/* =================================================
            FILTERS
        ================================================= */}

        <div className="mb-6 flex flex-wrap gap-2">

          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              filter === 'all'
                ? 'bg-gray-900 text-white'
                : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            All
          </button>

          <button
            type="button"
            onClick={() => setFilter('available')}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              filter === 'available'
                ? 'bg-blue-600 text-white'
                : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Available
          </button>

          <button
            type="button"
            onClick={() => setFilter('claimed')}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              filter === 'claimed'
                ? 'bg-blue-600 text-white'
                : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Claimed
          </button>

          <button
            type="button"
            onClick={() => setFilter('completed')}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              filter === 'completed'
                ? 'bg-green-600 text-white'
                : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Completed
          </button>

        </div>

        {/* =================================================
            LEADS HEADER
        ================================================= */}

        <div className="mb-4">

          <h2 className="text-lg font-bold text-gray-900">
            Heritage Leads
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Community-reported locations awaiting
            documentation or verification.
          </p>

        </div>

        {/* =================================================
            LEAD GRID
        ================================================= */}

        {filteredLeads.length > 0 ? (

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

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

          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">

            <ClipboardList className="mx-auto h-10 w-10 text-gray-300" />

            <h3 className="mt-4 font-semibold text-gray-900">
              No leads found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              There are no heritage leads in this category.
            </p>

          </div>

        )}

      </div>

      {/* =====================================================
          DOCUMENTATION MODAL
      ===================================================== */}

      {selectedLead && (
        <HeritageLeadModal
          lead={selectedLead}
          onClose={handleCloseDocumentation}
          onSubmit={handleDocumentationSubmit}
        />
      )}

      {/* =====================================================
          CONTRIBUTION PROGRESS MODAL
      ===================================================== */}

      {progressLead && (
        <ContributionStatus
          lead={progressLead}
          onClose={handleCloseProgress}
        />
      )}

    </div>
  );
}