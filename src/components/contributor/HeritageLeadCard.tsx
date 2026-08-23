'use client';

import {
  MapPin,
  User,
  Calendar,
  ChevronRight,
  FileText,
  CheckCircle,
} from 'lucide-react';

import { HeritageLead } from '@/types';

interface HeritageLeadCardProps {
  lead: HeritageLead;
  onClaim: (lead: HeritageLead) => void;
  onViewProgress?: (lead: HeritageLead) => void;
}

export default function HeritageLeadCard({
  lead,
  onClaim,
  onViewProgress,
}: HeritageLeadCardProps) {

  const statusLabel = lead.status
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );

  const isAvailable =
    lead.status === 'needs-documentation';

  const isCompleted =
    lead.status === 'documented' ||
    lead.status === 'verified';

  return (
    <article className="heritage-lead-card">

      {/* =====================================================
          CARD HEADER
      ===================================================== */}

      <div className="heritage-card-header">

        <div className="heritage-card-title-area">

          <div className="heritage-card-icon">
            <FileText className="h-5 w-5" />
          </div>

          <div className="heritage-card-heading">

            <h3>
              {lead.name}
            </h3>

            <span>
              {lead.category}
            </span>

          </div>

        </div>

        <span
          className={`heritage-card-status ${
            isAvailable
              ? 'available'
              : lead.status === 'claimed'
                ? 'claimed'
                : isCompleted
                  ? 'completed'
                  : ''
          }`}
        >
          {isCompleted && (
            <CheckCircle className="h-3.5 w-3.5" />
          )}

          {statusLabel}
        </span>

      </div>

      {/* =====================================================
          DESCRIPTION
      ===================================================== */}

      <p className="heritage-card-description">
        {lead.description}
      </p>

      {/* =====================================================
          METADATA
      ===================================================== */}

      <div className="heritage-card-meta">

        <div className="heritage-meta-item">
          <MapPin className="h-4 w-4" />
          <span>{lead.villageOrArea}</span>
        </div>

        <div className="heritage-meta-item">
          <User className="h-4 w-4" />
          <span>
            Reported by {lead.submittedBy}
          </span>
        </div>

        <div className="heritage-meta-item">
          <Calendar className="h-4 w-4" />
          <span>
            Submitted {lead.submittedAt}
          </span>
        </div>

      </div>

      {/* =====================================================
          ASSIGNED CONTRIBUTOR
      ===================================================== */}

      {lead.assignedContributor && (
        <div className="heritage-assignment">

          <MapPin className="h-4 w-4" />

          <span>
            Assigned to{' '}
            <strong>
              {lead.assignedContributor}
            </strong>
          </span>

        </div>
      )}

      {/* =====================================================
          ACTION
      ===================================================== */}

      <div className="heritage-card-action">

        {isAvailable ? (

          <button
            type="button"
            onClick={() => onClaim(lead)}
            className="heritage-claim-button"
          >
            Claim & Document

            <ChevronRight className="h-4 w-4" />
          </button>

        ) : (

          <button
            type="button"
            onClick={() => onViewProgress?.(lead)}
            className={`heritage-claim-button ${
              isCompleted
                ? 'completed-button'
                : ''
            }`}
          >
            View Contribution Progress

            <ChevronRight className="h-4 w-4" />
          </button>

        )}

      </div>

    </article>
  );
}