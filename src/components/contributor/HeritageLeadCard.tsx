'use client';

import {
  MapPin,
  User,
  Calendar,
  ChevronRight,
  FileText,
} from 'lucide-react';

import { HeritageLead } from '@/types';

interface HeritageLeadCardProps {
  lead: HeritageLead;
  onClaim: (lead: HeritageLead) => void;
}

export default function HeritageLeadCard({
  lead,
  onClaim,
}: HeritageLeadCardProps) {
  const statusLabel = lead.status
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

  const isClaimed =
    lead.status !== 'needs-documentation';

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
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

        {/* Status */}
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
            lead.status === 'needs-documentation'
              ? 'bg-amber-100 text-amber-700'
              : lead.status === 'claimed'
                ? 'bg-blue-100 text-blue-700'
                : lead.status === 'documented'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-green-100 text-green-700'
          }`}
        >
          {statusLabel}
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
          <span>{lead.villageOrArea}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <User className="h-4 w-4 shrink-0" />
          <span>
            Reported by {lead.submittedBy}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4 shrink-0" />
          <span>
            Submitted {lead.submittedAt}
          </span>
        </div>

      </div>

      {/* Assigned contributor */}
      {lead.assignedContributor && (
        <div className="mt-4 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
          Assigned to:{' '}
          <span className="font-semibold">
            {lead.assignedContributor}
          </span>
        </div>
      )}

      {/* Action */}
      <div className="mt-5">
        <button
          type="button"
          disabled={isClaimed}
          onClick={() => onClaim(lead)}
          className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
            isClaimed
              ? 'cursor-not-allowed bg-gray-100 text-gray-400'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isClaimed
            ? 'Already Claimed'
            : 'Claim & Document'}

          {!isClaimed && (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}