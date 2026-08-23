'use client';

import { useState } from 'react';
import {
  MapPin,
  ClipboardList,
  CheckCircle,
  Clock,
} from 'lucide-react';

import { HERITAGE_LEADS } from '@/data/heritageLeads';
import { HeritageLead } from '@/types';
import HeritageLeadCard from './HeritageLeadCard';

interface ContributorDashboardProps {
  onClaim?: (lead: HeritageLead) => void;
}

export default function ContributorDashboard({
  onClaim,
}: ContributorDashboardProps) {
  const [filter, setFilter] = useState<
    'all' | 'available' | 'claimed' | 'completed'
  >('all');

  const availableCount = HERITAGE_LEADS.filter(
    (lead) => lead.status === 'needs-documentation'
  ).length;

  const claimedCount = HERITAGE_LEADS.filter(
    (lead) => lead.status === 'claimed'
  ).length;

  const completedCount = HERITAGE_LEADS.filter(
    (lead) =>
      lead.status === 'documented' ||
      lead.status === 'verified'
  ).length;

  const filteredLeads = HERITAGE_LEADS.filter(
    (lead) => {
      switch (filter) {
        case 'available':
          return lead.status === 'needs-documentation';

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
    }
  );

  const handleClaim = (lead: HeritageLead) => {
    if (onClaim) {
      onClaim(lead);
      return;
    }

    console.log('Claiming heritage lead:', lead);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
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

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Total Leads
                </p>

                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {HERITAGE_LEADS.length}
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

        {/* Filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              filter === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
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
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
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
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
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
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            Completed
          </button>
        </div>

        {/* Lead list */}
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            Heritage Leads
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Community-reported locations awaiting
            documentation or verification.
          </p>
        </div>

        {filteredLeads.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {filteredLeads.map((lead) => (
              <HeritageLeadCard
                key={lead.id}
                lead={lead}
                onClaim={handleClaim}
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
    </div>
  );
}