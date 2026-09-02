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
    color: 'bg-amber-50 text-amber-700 border border-amber-200',
    dot: 'bg-amber-500',
  },
  claimed: {
    label: 'Claimed',
    color: 'bg-blue-50 text-blue-700 border border-blue-200',
    dot: 'bg-blue-500',
  },
  documented: {
    label: 'Documented',
    color: 'bg-purple-50 text-purple-700 border border-purple-200',
    dot: 'bg-purple-500',
  },
  verified: {
    label: 'Verified',
    color: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    dot: 'bg-emerald-500',
  },
};

const CATEGORY_COLOR: Record<string, string> = {
  Monument:
    'bg-orange-50 text-orange-700 border border-orange-200',
  'Sacred Grove':
    'bg-green-50 text-green-700 border border-green-200',
  'Folklore Site':
    'bg-purple-50 text-purple-700 border border-purple-200',
  'Ancient Ruins':
    'bg-amber-50 text-amber-700 border border-amber-200',
  'Traditional Craft Hub':
    'bg-pink-50 text-pink-700 border border-pink-200',
};

export default function HeritageLeadDetails({
  lead,
  onClose,
}: HeritageLeadDetailsProps) {
  const statusCfg =
    STATUS_CONFIG[lead.status] ?? {
      label: lead.status.replace('-', ' '),
      color: 'bg-gray-50 text-gray-700 border border-gray-200',
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
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* MODAL */}
      <div className="relative flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_rgba(0,0,0,0.4)]">

        {/* ================= HEADER ================= */}

        <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 px-8 pb-7 pt-7 text-white">

          {/* Decorative glow */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="relative">

            {/* Close */}
            <button
              onClick={onClose}
              className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            {/* Label */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] backdrop-blur-sm">
              <span
                className={`h-2 w-2 rounded-full ${statusCfg.dot}`}
              />
              Heritage Lead
            </div>

            {/* Title */}
            <h2 className="mt-5 max-w-[85%] text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              {lead.name}
            </h2>

            {/* Location */}
            <div className="mt-3 flex items-center gap-2 text-sm font-medium text-blue-50">
              <MapPin size={18} />
              <span>{lead.villageOrArea}</span>
            </div>

          </div>
        </div>

        {/* ================= SCROLLABLE BODY ================= */}

        <div className="overflow-y-auto">

          <div className="space-y-6 p-7 sm:p-8">

            {/* ================= BADGES ================= */}

            <div className="flex flex-wrap gap-2.5">

              <span
                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold ${statusCfg.color}`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${statusCfg.dot}`}
                />
                {statusCfg.label}
              </span>

              <span
                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold ${
                  CATEGORY_COLOR[lead.category] ??
                  'bg-gray-50 text-gray-700 border border-gray-200'
                }`}
              >
                <Tag size={14} />
                {lead.category}
              </span>

            </div>

            {/* ================= DESCRIPTION ================= */}

            <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <FileText size={20} />
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Documentation
                  </p>

                  <h3 className="mt-0.5 text-lg font-bold text-slate-900">
                    Description
                  </h3>
                </div>

              </div>

              <p className="mt-5 text-[15px] leading-7 text-slate-600">
                {lead.description}
              </p>

            </section>

            {/* ================= METADATA ================= */}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">

              <div className="grid grid-cols-1 sm:grid-cols-2">

                {/* Submitted by */}
                <div className="flex items-start gap-3 border-b border-slate-200 p-5 sm:border-r">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500">
                    <User size={18} />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                      Submitted by
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {lead.submittedBy}
                    </p>
                  </div>
                </div>

                {/* Submitted on */}
                {formattedDate && (
                  <div className="flex items-start gap-3 border-b border-slate-200 p-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500">
                      <Calendar size={18} />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                        Submitted on
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-800">
                        {formattedDate}
                      </p>
                    </div>
                  </div>
                )}

                {/* Assigned contributor */}
                {lead.assignedContributor && (
                  <div className="flex items-start gap-3 p-5 sm:col-span-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500">
                      <Clock size={18} />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                        Assigned contributor
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-800">
                        {lead.assignedContributor}
                      </p>
                    </div>
                  </div>
                )}

              </div>

            </section>

            {/* ================= CTA ================= */}

            {(lead.status === 'needs-documentation' ||
              lead.status === 'claimed') && (
              <div className="flex items-start gap-4 rounded-2xl border border-blue-200 bg-gradient-to-br from-sky-50 to-blue-50 p-5">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                  <MapPin size={20} />
                </div>

                <div>
                  <p className="font-bold text-blue-900">
                    This site needs a contributor.
                  </p>

                  <p className="mt-1 text-sm leading-6 text-blue-700">
                    If you have knowledge of this heritage
                    location, consider claiming it and
                    documenting the site for LokVirasat.
                  </p>
                </div>

              </div>
            )}

            {/* ================= CLOSE ================= */}

            <button
              onClick={onClose}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
            >
              Close
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}