'use client';

import {
  X,
  MapPin,
  User,
  Calendar,
  Clock,
  Tag,
  FileText,
} from 'lucide-react';

import { HeritageLead } from '@/types';

interface HeritageLeadDetailsProps {
  lead: HeritageLead;
  onClose: () => void;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; dot: string }
> = {
  'needs-documentation': {
    label: 'Needs Documentation',
    color: 'bg-yellow-100 text-yellow-800',
    dot: 'bg-yellow-500',
  },
  claimed: {
    label: 'Claimed',
    color: 'bg-blue-100 text-blue-800',
    dot: 'bg-blue-500',
  },
  documented: {
    label: 'Documented',
    color: 'bg-purple-100 text-purple-800',
    dot: 'bg-purple-500',
  },
  verified: {
    label: 'Verified',
    color: 'bg-green-100 text-green-800',
    dot: 'bg-green-500',
  },
};

const CATEGORY_COLOR: Record<string, string> = {
  Monument: 'bg-orange-100 text-orange-700',
  'Sacred Grove': 'bg-green-100 text-green-700',
  'Folklore Site': 'bg-purple-100 text-purple-700',
  'Ancient Ruins': 'bg-yellow-100 text-yellow-700',
  'Traditional Craft Hub': 'bg-pink-100 text-pink-700',
};

export default function HeritageLeadDetails({
  lead,
  onClose,
}: HeritageLeadDetailsProps) {
  const statusCfg =
    STATUS_CONFIG[lead.status] ?? {
      label: lead.status.replace('-', ' '),
      color: 'bg-gray-100 text-gray-800',
      dot: 'bg-gray-500',
    };

  const formattedDate = lead.submittedAt
    ? new Date(lead.submittedAt).toLocaleDateString(
        'en-IN',
        {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }
      )
    : null;

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">

        {/* ── Header banner ── */}
        <div className="rounded-t-2xl bg-gradient-to-br from-sky-500 to-indigo-600 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/30 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {/* "Heritage Lead" pill */}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
            <span
              className={`h-2 w-2 rounded-full ${statusCfg.dot}`}
            />
            Heritage Lead
          </span>

          <h2 className="mt-3 text-2xl font-bold leading-snug">
            {lead.name}
          </h2>

          {/* Location */}
          <div className="mt-2 flex items-center gap-2 text-sm text-sky-100">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            {lead.villageOrArea}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="p-6 space-y-5">

          {/* Status + Category badges */}
          <div className="flex flex-wrap gap-2">
            <span
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${statusCfg.color}`}
            >
              <span
                className={`h-2 w-2 rounded-full ${statusCfg.dot}`}
              />
              {statusCfg.label}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                CATEGORY_COLOR[lead.category] ??
                'bg-gray-100 text-gray-700'
              }`}
            >
              <Tag className="inline h-3.5 w-3.5 mr-1" />
              {lead.category}
            </span>
          </div>

          {/* Description */}
          <section>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wide">
              <FileText className="h-4 w-4" />
              Description
            </h3>
            <p className="mt-2 leading-7 text-gray-700">
              {lead.description}
            </p>
          </section>

          {/* Meta grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-xl bg-gray-50 p-4">

            <div className="flex items-start gap-3">
              <User className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                  Submitted by
                </p>
                <p className="mt-0.5 text-sm font-semibold text-gray-800">
                  {lead.submittedBy}
                </p>
              </div>
            </div>

            {formattedDate && (
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                    Submitted on
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-gray-800">
                    {formattedDate}
                  </p>
                </div>
              </div>
            )}

            {lead.assignedContributor && (
              <div className="flex items-start gap-3 sm:col-span-2">
                <Clock className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                    Assigned contributor
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-gray-800">
                    {lead.assignedContributor}
                  </p>
                </div>
              </div>
            )}

          </div>

          {/* Call to action */}
          {(lead.status === 'needs-documentation' ||
            lead.status === 'claimed') && (
            <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-800">
              <strong>This site needs a contributor.</strong>{' '}
              If you have knowledge of this heritage location,
              consider claiming it and documenting the site
              for LokVirasat.
            </div>
          )}

          {/* Close */}
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-gray-100 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Close
          </button>

        </div>
      </div>
    </div>
  );
}
