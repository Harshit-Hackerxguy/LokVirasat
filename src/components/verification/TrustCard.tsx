'use client';

import React from 'react';
import { CheckCircle2, Circle, Clock, ShieldCheck } from 'lucide-react';
import {
  VerificationStatus,
  VERIFICATION_STATUS_LABELS,
  VERIFICATION_STATUS_COLORS,
} from '@/types';

// ── Step definitions ─────────────────────────────────────────────────────────

interface TrustStep {
  status: VerificationStatus;
  description: string;
}

const TRUST_STEPS: TrustStep[] = [
  {
    status: 'community-reported',
    description: 'A community member has submitted a raw tip about this heritage location.',
  },
  {
    status: 'community-corroborated',
    description: 'Multiple community members have independently confirmed the existence of this site.',
  },
  {
    status: 'evidence-supported',
    description: 'Supporting photographs, documents, or recordings have been reviewed and linked.',
  },
  {
    status: 'authority-verified',
    description: 'A domain expert or government authority has officially verified this heritage site.',
  },
];

// ── Component ────────────────────────────────────────────────────────────────

interface TrustCardProps {
  currentStatus?: VerificationStatus;
  className?: string;
}

export default function TrustCard({ currentStatus, className = '' }: TrustCardProps) {
  const activeIndex = TRUST_STEPS.findIndex((s) => s.status === currentStatus);

  const StepIcon = ({ i }: { i: number }) => {
    if (i < activeIndex) return <CheckCircle2 size={18} />;
    if (i === activeIndex) return <ShieldCheck size={18} />;
    return <Circle size={18} />;
  };

  return (
    <div className={`trust-card ${className}`}>
      <div className="trust-card-header">
        <ShieldCheck size={16} />
        <span>Heritage Trust Journey</span>
      </div>

      <div className="trust-card-track">
        {TRUST_STEPS.map((step, i) => {
          const isCompleted = i < activeIndex;
          const isActive    = i === activeIndex;
          const isPending   = i > activeIndex;

          const color = VERIFICATION_STATUS_COLORS[step.status];

          return (
            <React.Fragment key={step.status}>
              {/* Step node */}
              <div
                className={[
                  'trust-step',
                  isCompleted ? 'trust-step--completed' : '',
                  isActive    ? 'trust-step--active'    : '',
                  isPending   ? 'trust-step--pending'   : '',
                ].filter(Boolean).join(' ')}
              >
                <div
                  className="trust-step-icon"
                  style={{
                    background: isCompleted || isActive ? `${color}20` : undefined,
                    color:      isCompleted || isActive ? color          : undefined,
                    border:     `2px solid ${isCompleted || isActive ? color : '#374151'}`,
                  }}
                >
                  <StepIcon i={i} />
                </div>

                <div className="trust-step-body">
                  <span
                    className="trust-step-label"
                    style={{ color: isCompleted || isActive ? color : undefined }}
                  >
                    {VERIFICATION_STATUS_LABELS[step.status]}
                    {isActive && (
                      <span className="trust-step-current-pill" style={{ background: color }}>
                        Current
                      </span>
                    )}
                  </span>
                  <p className="trust-step-desc">{step.description}</p>
                </div>
              </div>

              {/* Connector line between steps */}
              {i < TRUST_STEPS.length - 1 && (
                <div
                  className="trust-connector"
                  style={{
                    background: i < activeIndex
                      ? `linear-gradient(to bottom, ${VERIFICATION_STATUS_COLORS[TRUST_STEPS[i].status]}, ${VERIFICATION_STATUS_COLORS[TRUST_STEPS[i + 1].status]})`
                      : undefined,
                    opacity: i < activeIndex ? 1 : 0.2,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
