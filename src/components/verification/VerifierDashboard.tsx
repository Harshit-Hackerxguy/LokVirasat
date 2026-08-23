'use client';

import { useEffect, useState } from 'react';
import {
  ShieldCheck,
  ClipboardCheck,
  Clock3,
  CheckCircle2,
  XCircle,
  MapPin,
  User,
  Calendar,
  FileText,
  Eye,
} from 'lucide-react';

import { HeritageLead } from '@/types';
import VerificationBadge from './VerificationBadge';

const STORAGE_KEY = 'lokvirasat-heritage-leads';

type VerificationFilter =
  | 'pending'
  | 'verified'
  | 'all';

export default function VerifierDashboard() {
  const [leads, setLeads] = useState<HeritageLead[]>([]);
  const [filter, setFilter] =
    useState<VerificationFilter>('pending');

  const [selectedLead, setSelectedLead] =
    useState<HeritageLead | null>(null);

  const [loaded, setLoaded] = useState(false);

  // =========================================================
  // LOAD SHARED CONTRIBUTOR DATA
  // =========================================================

  useEffect(() => {
    try {
      const saved =
        window.localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed =
          JSON.parse(saved) as HeritageLead[];

        if (Array.isArray(parsed)) {
          setLeads(parsed);
        }
      }
    } catch (error) {
      console.error(
        'Failed to load verification data:',
        error
      );
    } finally {
      setLoaded(true);
    }
  }, []);

  // =========================================================
  // SAVE SHARED DATA
  // =========================================================

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

  // =========================================================
  // COUNTS
  // =========================================================

  const pendingCount = leads.filter(
    (lead) => lead.status === 'documented'
  ).length;

  const verifiedCount = leads.filter(
    (lead) => lead.status === 'verified'
  ).length;

  const claimedCount = leads.filter(
    (lead) => lead.status === 'claimed'
  ).length;

  // =========================================================
  // FILTER
  // =========================================================

  const filteredLeads = leads.filter((lead) => {
    switch (filter) {
      case 'pending':
        return lead.status === 'documented';

      case 'verified':
        return lead.status === 'verified';

      default:
        return (
          lead.status === 'documented' ||
          lead.status === 'verified'
        );
    }
  });

  // =========================================================
  // APPROVE
  // =========================================================

  const handleApprove = (lead: HeritageLead) => {
    const verifiedLead: HeritageLead = {
      ...lead,
      status: 'verified',
    };

    setLeads((currentLeads) =>
      currentLeads.map((item) =>
        item.id === lead.id
          ? verifiedLead
          : item
      )
    );

    setSelectedLead(null);
  };

  // =========================================================
  // REJECT
  // =========================================================

  const handleReject = (lead: HeritageLead) => {
    /*
      Prototype behaviour:

      We move the lead back to "claimed" so that
      the contributor can continue documentation.

      In a production system this would also contain
      a rejection reason and reviewer information.
    */

    const rejectedLead: HeritageLead = {
      ...lead,
      status: 'claimed',
    };

    setLeads((currentLeads) =>
      currentLeads.map((item) =>
        item.id === lead.id
          ? rejectedLead
          : item
      )
    );

    setSelectedLead(null);
  };

  // =========================================================
  // STATUS LABEL
  // =========================================================

  const getStatusLabel = (
    status: HeritageLead['status']
  ) => {
    return status
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-600 text-white">
              <ShieldCheck className="h-6 w-6" />
            </div>

            <div>

              <h1 className="text-2xl font-bold text-gray-900">
                Verification Dashboard
              </h1>

              <p className="text-sm text-gray-500">
                Review and verify documented heritage
                contributions.
              </p>

            </div>

          </div>

        </div>

        {/* =================================================
            STATS
        ================================================= */}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* Pending */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-gray-500">
                  Pending Review
                </p>

                <p className="mt-1 text-2xl font-bold text-amber-600">
                  {pendingCount}
                </p>

              </div>

              <Clock3 className="h-6 w-6 text-amber-500" />

            </div>

          </div>

          {/* Verified */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-gray-500">
                  Verified
                </p>

                <p className="mt-1 text-2xl font-bold text-green-600">
                  {verifiedCount}
                </p>

              </div>

              <CheckCircle2 className="h-6 w-6 text-green-500" />

            </div>

          </div>

          {/* Claimed */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-gray-500">
                  In Documentation
                </p>

                <p className="mt-1 text-2xl font-bold text-blue-600">
                  {claimedCount}
                </p>

              </div>

              <FileText className="h-6 w-6 text-blue-500" />

            </div>

          </div>

          {/* Total */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-gray-500">
                  Total Records
                </p>

                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {leads.length}
                </p>

              </div>

              <ClipboardCheck className="h-6 w-6 text-gray-600" />

            </div>

          </div>

        </div>

        {/* =================================================
            FILTERS
        ================================================= */}

        <div className="mb-6 flex flex-wrap gap-2">

          <button
            type="button"
            onClick={() => setFilter('pending')}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              filter === 'pending'
                ? 'bg-amber-600 text-white'
                : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Pending
            <span className="ml-2">
              {pendingCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('verified')}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              filter === 'verified'
                ? 'bg-green-600 text-white'
                : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Verified
            <span className="ml-2">
              {verifiedCount}
            </span>
          </button>

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

        </div>

        {/* =================================================
            LIST HEADER
        ================================================= */}

        <div className="mb-4">

          <h2 className="text-lg font-bold text-gray-900">
            {filter === 'pending'
              ? 'Pending Verification'
              : filter === 'verified'
                ? 'Verified Heritage Records'
                : 'Heritage Records'}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Review documentation submitted by heritage
            contributors.
          </p>

        </div>

        {/* =================================================
            LEADS
        ================================================= */}

        {filteredLeads.length > 0 ? (

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {filteredLeads.map((lead) => {

              const isPending =
                lead.status === 'documented';

              return (
                <article
                  key={lead.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                >

                  {/* Header */}

                  <div className="flex items-start justify-between gap-4">

                    <div className="flex min-w-0 items-start gap-3">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                        <FileText className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">

                        <h3 className="truncate text-base font-bold text-gray-900">
                          {lead.name}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          {lead.category}
                        </p>

                      </div>

                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                        isPending
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {getStatusLabel(lead.status)}
                    </span>

                  </div>

                  {/* Description */}

                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-gray-600">
                    {lead.description}
                  </p>

                  {/* Metadata */}

                  <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">

                    <div className="flex items-center gap-2 text-sm text-gray-500">

                      <MapPin className="h-4 w-4 shrink-0" />

                      <span>
                        {lead.villageOrArea}
                      </span>

                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500">

                      <User className="h-4 w-4 shrink-0" />

                      <span>
                        Contributor:{' '}
                        {lead.assignedContributor ||
                          'Unknown'}
                      </span>

                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500">

                      <Calendar className="h-4 w-4 shrink-0" />

                      <span>
                        Submitted {lead.submittedAt}
                      </span>

                    </div>

                  </div>

                  {/* Verification badge */}

                  <div className="mt-4">

                    <VerificationBadge
                      status={
                        lead.status === 'verified'
                          ? 'authority-verified'
                          : 'reported'
                      }
                      size="sm"
                    />

                  </div>

                  {/* Action */}

                  <div className="mt-5">

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedLead(lead)
                      }
                      className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                        isPending
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >

                      <Eye className="h-4 w-4" />

                      {isPending
                        ? 'Review Submission'
                        : 'View Record'}

                    </button>

                  </div>

                </article>
              );
            })}

          </div>

        ) : (

          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">

            <ClipboardCheck className="mx-auto h-10 w-10 text-gray-300" />

            <h3 className="mt-4 font-semibold text-gray-900">
              No records found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              There are no heritage records in this
              category.
            </p>

          </div>

        )}

      </div>

      {/* =====================================================
          REVIEW MODAL
      ===================================================== */}

      {selectedLead && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 p-4">

          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* Header */}

            <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-green-600">
                  Verification Review
                </p>

                <h2 className="mt-1 text-xl font-bold text-gray-900">
                  {selectedLead.name}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Review the submitted heritage documentation.
                </p>

              </div>

              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close"
              >
                ×
              </button>

            </div>

            {/* Content */}

            <div className="space-y-6 px-6 py-6">

              {/* Status */}

              <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">

                <div>

                  <p className="text-sm font-semibold text-gray-900">
                    Submission Status
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    This record has been documented and is
                    awaiting verification.
                  </p>

                </div>

                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  Documented
                </span>

              </div>

              {/* Site information */}

              <section>

                <h3 className="text-base font-bold text-gray-900">
                  Heritage Information
                </h3>

                <div className="mt-3 rounded-xl border border-gray-200 p-4">

                  <p className="text-sm leading-6 text-gray-600">
                    {selectedLead.description}
                  </p>

                </div>

              </section>

              {/* Location */}

              <section>

                <h3 className="text-base font-bold text-gray-900">
                  Location
                </h3>

                <div className="mt-3 rounded-xl border border-gray-200 p-4">

                  <div className="flex items-center gap-2 text-sm text-gray-600">

                    <MapPin className="h-4 w-4 text-gray-400" />

                    <span>
                      {selectedLead.villageOrArea}
                    </span>

                  </div>

                  <p className="mt-2 text-xs text-gray-400">
                    Approximate coordinates:{' '}
                    {selectedLead.approximateLocation[1].toFixed(4)},
                    {' '}
                    {selectedLead.approximateLocation[0].toFixed(4)}
                  </p>

                </div>

              </section>

              {/* Contributor */}

              <section>

                <h3 className="text-base font-bold text-gray-900">
                  Contributor
                </h3>

                <div className="mt-3 rounded-xl border border-gray-200 p-4">

                  <div className="flex items-center gap-2 text-sm text-gray-600">

                    <User className="h-4 w-4 text-gray-400" />

                    <span>
                      {selectedLead.assignedContributor ||
                        'Unknown Contributor'}
                    </span>

                  </div>

                </div>

              </section>

              {/* =================================================
                  ACTIONS
              ================================================= */}

              {selectedLead.status === 'documented' && (

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                  <button
                    type="button"
                    onClick={() =>
                      handleReject(selectedLead)
                    }
                    className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-700 hover:bg-red-100"
                  >

                    <XCircle className="h-5 w-5" />

                    Reject

                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleApprove(selectedLead)
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700"
                  >

                    <ShieldCheck className="h-5 w-5" />

                    Approve & Verify

                  </button>

                </div>

              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}