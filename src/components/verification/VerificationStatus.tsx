'use client';

import {
  Clock3,
  FileCheck2,
  Users,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

import { VerificationStatus as VerificationStatusType } from '@/types';
import VerificationBadge from './VerificationBadge';

interface VerificationStatusProps {
  status: VerificationStatusType;
  submittedAt?: string;
  lastUpdated?: string;
}

const steps = [
  {
    key: 'reported',
    title: 'Contribution Submitted',
    description:
      'The heritage information has been submitted to LokVirasat.',
    icon: FileCheck2,
  },
  {
    key: 'community-verified',
    title: 'Community Review',
    description:
      'Community contributors review the submitted information and evidence.',
    icon: Users,
  },
  {
    key: 'authority-verified',
    title: 'Authority Verification',
    description:
      'The heritage record can be verified by an appropriate local authority.',
    icon: ShieldCheck,
  },
];

const stepOrder: Record<VerificationStatusType, number> = {
  reported: 0,
  'community-verified': 1,
  'authority-verified': 2,
};

export default function VerificationStatus({
  status,
  submittedAt,
  lastUpdated,
}: VerificationStatusProps) {
  const currentStep = stepOrder[status];

  const isCompleted = (stepIndex: number) =>
    currentStep >= stepIndex;

  const isCurrent = (stepIndex: number) =>
    currentStep === stepIndex;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Verification
          </p>

          <h3 className="mt-1 text-lg font-bold text-gray-900">
            Heritage Record Verification
          </h3>

          <p className="mt-1 max-w-xl text-sm leading-5 text-gray-500">
            LokVirasat reviews community contributions before
            presenting them as trusted heritage records.
          </p>
        </div>

        <VerificationBadge status={status} />

      </div>

      {/* Timeline */}
      <div className="mt-7">

        {steps.map((step, index) => {
          const Icon = step.icon;

          const completed = isCompleted(index);
          const current = isCurrent(index);

          return (
            <div key={step.key}>

              <div className="flex items-start gap-4">

                {/* Step icon */}
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    completed
                      ? 'bg-green-100 text-green-600'
                      : current
                        ? 'bg-blue-100 text-blue-600 ring-4 ring-blue-50'
                        : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {completed && index < currentStep ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>

                {/* Step content */}
                <div className="min-w-0 flex-1 pb-2">

                  <div className="flex flex-wrap items-center gap-2">

                    <h4
                      className={`font-semibold ${
                        completed || current
                          ? 'text-gray-900'
                          : 'text-gray-400'
                      }`}
                    >
                      {step.title}
                    </h4>

                    {current && (
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600">
                        Current
                      </span>
                    )}

                    {completed && !current && (
                      <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-600">
                        Complete
                      </span>
                    )}

                  </div>

                  <p
                    className={`mt-1 text-sm leading-5 ${
                      completed || current
                        ? 'text-gray-500'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.description}
                  </p>

                </div>
              </div>

              {/* Connector */}
              {index < steps.length - 1 && (
                <div
                  className={`ml-5 h-7 w-px ${
                    currentStep > index
                      ? 'bg-green-300'
                      : 'bg-gray-200'
                  }`}
                />
              )}

            </div>
          );
        })}

      </div>

      {/* Submitted information */}
      {(submittedAt || lastUpdated) && (
        <div className="mt-6 grid grid-cols-1 gap-3 border-t border-gray-100 pt-5 sm:grid-cols-2">

          {submittedAt && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock3 className="h-4 w-4 text-gray-400" />
              <span>
                Submitted {submittedAt}
              </span>
            </div>
          )}

          {lastUpdated && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock3 className="h-4 w-4 text-gray-400" />
              <span>
                Updated {lastUpdated}
              </span>
            </div>
          )}

        </div>
      )}

      {/* Final verified state */}
      {status === 'authority-verified' && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4">

          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />

          <div>
            <p className="font-semibold text-green-800">
              Heritage record verified
            </p>

            <p className="mt-1 text-sm leading-5 text-green-700">
              This heritage site has completed the
              verification process and can be presented
              as a trusted LokVirasat record.
            </p>
          </div>

        </div>
      )}

    </div>
  );
}