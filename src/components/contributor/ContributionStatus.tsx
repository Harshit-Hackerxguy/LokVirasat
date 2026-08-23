'use client';

import {
  CheckCircle2,
  Clock3,
  FileCheck2,
  ShieldCheck,
  X,
} from 'lucide-react';

import { HeritageLead } from '@/types';

interface ContributionStatusProps {
  lead: HeritageLead;
  onClose?: () => void;
}

const steps = [
  {
    key: 'claimed',
    label: 'Claimed',
    description: 'Contributor accepted this heritage lead.',
    icon: Clock3,
  },
  {
    key: 'documented',
    label: 'Documented',
    description: 'Site information and evidence submitted.',
    icon: FileCheck2,
  },
  {
    key: 'verified',
    label: 'Verified',
    description: 'Contribution reviewed and approved.',
    icon: ShieldCheck,
  },
];

function getStepState(
  status: HeritageLead['status'],
  step: string
) {
  const order = {
    'needs-documentation': 0,
    claimed: 1,
    documented: 2,
    verified: 3,
  };

  const current = order[status];

  const target =
    step === 'claimed'
      ? 1
      : step === 'documented'
        ? 2
        : 3;

  if (current >= target) {
    return 'complete';
  }

  if (
    step === 'verified' &&
    status === 'documented'
  ) {
    return 'current';
  }

  if (
    step === 'documented' &&
    status === 'claimed'
  ) {
    return 'current';
  }

  if (
    step === 'claimed' &&
    status === 'claimed'
  ) {
    return 'current';
  }

  return 'upcoming';
}

export default function ContributionStatus({
  lead,
  onClose,
}: ContributionStatusProps) {

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 p-4">

      {/* Modal */}
      <div className="flex w-full max-w-2xl max-h-[88vh] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="flex shrink-0 items-start justify-between border-b border-gray-100 px-6 py-5">

          <div className="min-w-0 pr-4">

            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Contribution Progress
            </p>

            <h2 className="mt-1 truncate text-xl font-bold text-gray-900">
              {lead.name}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Track the documentation and verification status.
            </p>

          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          )}

        </div>

        {/* =====================================================
            CONTENT
        ===================================================== */}

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">

          {/* Progress steps */}

          <div className="space-y-6">

            {steps.map((step, index) => {
              const Icon = step.icon;

              const state = getStepState(
                lead.status,
                step.key
              );

              const isLast =
                index === steps.length - 1;

              return (
                <div
                  key={step.key}
                  className="relative flex gap-4"
                >

                  {/* Connector */}
                  {!isLast && (
                    <div
                      className={`absolute left-5 top-11 h-[calc(100%+1.5rem)] w-px ${
                        state === 'complete'
                          ? 'bg-green-200'
                          : 'bg-gray-200'
                      }`}
                    />
                  )}

                  {/* Icon */}
                  <div
                    className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      state === 'complete'
                        ? 'bg-green-100 text-green-600'
                        : state === 'current'
                          ? 'bg-blue-100 text-blue-600 ring-4 ring-blue-50'
                          : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {state === 'complete' ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>

                  {/* Text */}
                  <div className="min-w-0 flex-1 pt-0.5">

                    <div className="flex flex-wrap items-center gap-2">

                      <h3
                        className={`text-base font-semibold ${
                          state === 'upcoming'
                            ? 'text-gray-400'
                            : 'text-gray-900'
                        }`}
                      >
                        {step.label}
                      </h3>

                      {state === 'complete' && (
                        <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-600">
                          Complete
                        </span>
                      )}

                      {state === 'current' && (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600">
                          Current
                        </span>
                      )}

                    </div>

                    <p
                      className={`mt-1 text-sm leading-5 ${
                        state === 'upcoming'
                          ? 'text-gray-400'
                          : 'text-gray-500'
                      }`}
                    >
                      {step.description}
                    </p>

                  </div>

                </div>
              );
            })}

          </div>

          {/* ===================================================
              DOCUMENTED
          =================================================== */}

          {lead.status === 'documented' && (
            <div className="mt-7 rounded-xl border border-purple-100 bg-purple-50 p-4">

              <div className="flex items-start gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                  <FileCheck2 className="h-5 w-5" />
                </div>

                <div className="min-w-0">

                  <p className="font-semibold text-purple-900">
                    Awaiting verification
                  </p>

                  <p className="mt-1 text-sm leading-5 text-purple-700">
                    Your documentation has been submitted
                    and is waiting for review.
                  </p>

                </div>

              </div>

            </div>
          )}

          {/* ===================================================
              VERIFIED
          =================================================== */}

          {lead.status === 'verified' && (
            <div className="mt-7 rounded-xl border border-green-100 bg-green-50 p-4">

              <div className="flex items-start gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <div className="min-w-0">

                  <p className="font-semibold text-green-900">
                    Heritage site verified
                  </p>

                  <p className="mt-1 text-sm leading-5 text-green-700">
                    This contribution has been reviewed
                    and approved for the LokVirasat heritage archive.
                  </p>

                </div>

              </div>

            </div>
          )}

        </div>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <div className="flex shrink-0 items-center justify-between border-t border-gray-100 bg-gray-50 px-6 py-4">

          <div className="text-sm text-gray-500">
            Current status:{' '}
            <span className="font-semibold text-gray-700">
              {lead.status
                .replace(/-/g, ' ')
                .replace(/\b\w/g, (char) =>
                  char.toUpperCase()
                )}
            </span>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Done
            </button>
          )}

        </div>

      </div>
    </div>
  );
}