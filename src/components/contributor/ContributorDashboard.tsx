'use client';

import { useEffect, useState } from 'react';
import {
  MapPin,
  ClipboardList,
  CheckCircle,
  Clock,
} from 'lucide-react';

import './ContributorDashboard.css';
import { HeritageLead } from '@/types';
import HeritageLeadCard from './HeritageLeadCard';
import HeritageLeadModal from '@/components/forms/HeritageLeadModal';
import ContributionStatus from './ContributionStatus';

interface ContributorDashboardProps {
  onClaim?: (lead: HeritageLead) => void;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ApiHeritageLead {
  id: string;
  name: string;
  description: string;
  category: HeritageLead['category'];
  approximate_location: [number, number];
  village_or_area: string;
  submitted_by: string;
  submitted_at?: string | null;
  status: HeritageLead['status'];
  assigned_contributor?: string | null;
}

function mapApiLeadToFrontend(
  lead: ApiHeritageLead
): HeritageLead {
  return {
    id: lead.id,
    name: lead.name,
    description: lead.description,
    category: lead.category,
    approximateLocation: lead.approximate_location,
    villageOrArea: lead.village_or_area,
    submittedBy: lead.submitted_by,
    submittedAt:
      lead.submitted_at ||
      new Date().toISOString(),
    status: lead.status,
    assignedContributor:
      lead.assigned_contributor || undefined,
  };
}

export default function ContributorDashboard({
  onClaim,
}: ContributorDashboardProps) {
  const [filter, setFilter] = useState<
    'all' | 'available' | 'claimed' | 'completed'
  >('all');

  const [leads, setLeads] = useState<HeritageLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedLead, setSelectedLead] =
    useState<HeritageLead | null>(null);

  const [progressLead, setProgressLead] =
    useState<HeritageLead | null>(null);

  useEffect(() => {
    const loadLeads = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${API_URL}/api/leads/`,
          {
            cache: 'no-store',
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to load heritage leads (${response.status})`
          );
        }

        const data =
          (await response.json()) as ApiHeritageLead[];

        if (!Array.isArray(data)) {
          throw new Error(
            'Invalid heritage leads response'
          );
        }

        setLeads(
          data.map(mapApiLeadToFrontend)
        );
      } catch (error) {
        console.error(
          'Failed to load heritage leads:',
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : 'Failed to load heritage leads.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadLeads();
  }, []);

  const updateLeadStatus = async (
    leadId: string,
    status: HeritageLead['status'],
    assignedContributor?: string
  ) => {
    const response = await fetch(
      `${API_URL}/api/leads/${leadId}/status`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          assigned_contributor:
            assignedContributor || null,
        }),
      }
    );

    if (!response.ok) {
      let detail = `Failed to update lead (${response.status})`;

      try {
        const data = await response.json();

        if (data?.detail) {
          detail =
            typeof data.detail === 'string'
              ? data.detail
              : detail;
        }
      } catch {
        // Keep the default error message.
      }

      throw new Error(detail);
    }

    const updated =
      (await response.json()) as ApiHeritageLead;

    return mapApiLeadToFrontend(updated);
  };

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

  const handleClaim = async (
    lead: HeritageLead
  ) => {
    try {
      const contributor =
        lead.assignedContributor ||
        'Current Contributor';

      const updatedLead =
        await updateLeadStatus(
          lead.id,
          'claimed',
          contributor
        );

      setLeads((currentLeads) =>
        currentLeads.map((item) =>
          item.id === updatedLead.id
            ? updatedLead
            : item
        )
      );

      setSelectedLead(updatedLead);

      onClaim?.(updatedLead);
    } catch (error) {
      console.error(
        'Failed to claim heritage lead:',
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : 'Failed to claim heritage lead.'
      );
    }
  };

  const handleContinueDocumentation = (
    lead: HeritageLead
  ) => {
    setSelectedLead(lead);
  };

  const handleDocumentationSubmit = async (
    documentedLead: HeritageLead,
    documentation: {
      historical_information: string;
      cultural_significance: string;
      sources?: string;
      latitude: number;
      longitude: number;
    }
  ) => {
    try {
      const contributor =
        documentedLead.assignedContributor ||
        'Current Contributor';

      const documentationResponse =
        await fetch(
          `${API_URL}/api/documentation/`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: crypto.randomUUID(),

              lead_id:
                documentedLead.id,

              contributor_id:
                contributor,

              historical_information:
                documentation.historical_information,

              cultural_significance:
                documentation.cultural_significance,

              sources:
                documentation.sources,

              latitude:
                documentation.latitude,

              longitude:
                documentation.longitude,

              status:
                'submitted',
            }),
          }
        );

      if (!documentationResponse.ok) {
        throw new Error(
          'Failed to save heritage documentation.'
        );
      }

      const updatedLead =
        await updateLeadStatus(
          documentedLead.id,
          'documented',
          contributor
        );

      setLeads((currentLeads) =>
        currentLeads.map((item) =>
          item.id === updatedLead.id
            ? updatedLead
            : item
        )
      );

      setSelectedLead(null);
    } catch (error) {
      console.error(
        'Failed to submit documentation:',
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : 'Failed to submit documentation.'
      );
    }
  };

  const handleViewProgress = (
    lead: HeritageLead
  ) => {
    setProgressLead(lead);
  };

  const handleCloseDocumentation = () => {
    setSelectedLead(null);
  };

  const handleCloseProgress = () => {
    setProgressLead(null);
  };

  return (
    <div className="contributor-page">
      <div className="contributor-container">
        <section className="contributor-hero">
          <div className="contributor-hero-content">
            <div className="contributor-eyebrow">
              CONTRIBUTOR PORTAL
            </div>

            <h1 className="contributor-title">
              Preserve India&apos;s
              <span> Living Heritage</span>
            </h1>

            <p className="contributor-subtitle">
              Help document India&apos;s lesser-known
              heritage by collecting stories, evidence,
              and local knowledge.
            </p>
          </div>

          <div className="contributor-hero-badge">
            <MapPin className="h-5 w-5" />

            <div>
              <span>
                Contributor Access
              </span>

              <strong>
                Heritage Documentation
              </strong>
            </div>
          </div>
        </section>

        <section className="contributor-stats">
          <div className="contributor-stat-card">
            <div className="contributor-stat-content">
              <span className="contributor-stat-label">
                Total Leads
              </span>

              <span className="contributor-stat-value">
                {leads.length}
              </span>

              <span className="contributor-stat-description">
                Community-reported heritage
              </span>
            </div>

            <div className="contributor-stat-icon blue">
              <ClipboardList className="h-5 w-5" />
            </div>
          </div>

          <div className="contributor-stat-card">
            <div className="contributor-stat-content">
              <span className="contributor-stat-label">
                Available
              </span>

              <span className="contributor-stat-value blue-text">
                {availableCount}
              </span>

              <span className="contributor-stat-description">
                Ready to document
              </span>
            </div>

            <div className="contributor-stat-icon blue">
              <Clock className="h-5 w-5" />
            </div>
          </div>

          <div className="contributor-stat-card">
            <div className="contributor-stat-content">
              <span className="contributor-stat-label">
                Claimed
              </span>

              <span className="contributor-stat-value blue-text">
                {claimedCount}
              </span>

              <span className="contributor-stat-description">
                Currently being documented
              </span>
            </div>

            <div className="contributor-stat-icon blue">
              <MapPin className="h-5 w-5" />
            </div>
          </div>

          <div className="contributor-stat-card">
            <div className="contributor-stat-content">
              <span className="contributor-stat-label">
                Completed
              </span>

              <span className="contributor-stat-value green">
                {completedCount}
              </span>

              <span className="contributor-stat-description">
                Documentation submitted
              </span>
            </div>

            <div className="contributor-stat-icon green">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
        </section>

        <section className="contributor-controls">
          <div className="contributor-filter-group">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`contributor-filter ${
                filter === 'all' ? 'active' : ''
              }`}
            >
              All
            </button>

            <button
              type="button"
              onClick={() => setFilter('available')}
              className={`contributor-filter ${
                filter === 'available'
                  ? 'active'
                  : ''
              }`}
            >
              Available
            </button>

            <button
              type="button"
              onClick={() => setFilter('claimed')}
              className={`contributor-filter ${
                filter === 'claimed'
                  ? 'active'
                  : ''
              }`}
            >
              Claimed
            </button>

            <button
              type="button"
              onClick={() => setFilter('completed')}
              className={`contributor-filter ${
                filter === 'completed'
                  ? 'active'
                  : ''
              }`}
            >
              Completed
            </button>
          </div>
        </section>

        <section className="contributor-leads-header">
          <div>
            <h2>
              Heritage Leads
            </h2>

            <p>
              Community-reported locations awaiting
              documentation or verification.
            </p>
          </div>

          <span className="contributor-result-count">
            {filteredLeads.length} leads
          </span>
        </section>

        {loading ? (
          <div className="contributor-empty">
            <div className="contributor-empty-icon">
              <Clock className="h-6 w-6" />
            </div>

            <h3>
              Loading heritage leads
            </h3>

            <p>
              Fetching the latest community reports.
            </p>
          </div>
        ) : error ? (
          <div className="contributor-empty">
            <div className="contributor-empty-icon">
              <ClipboardList className="h-6 w-6" />
            </div>

            <h3>
              Unable to load leads
            </h3>

            <p>
              {error}
            </p>
          </div>
        ) : filteredLeads.length > 0 ? (
          <div className="contributor-leads-grid">
            {filteredLeads.map((lead) => (
              <HeritageLeadCard
                key={lead.id}
                lead={lead}
                onClaim={handleClaim}
                onContinueDocumentation={
                  handleContinueDocumentation
                }
                onViewProgress={
                  handleViewProgress
                }
              />
            ))}
          </div>
        ) : (
          <div className="contributor-empty">
            <div className="contributor-empty-icon">
              <ClipboardList className="h-6 w-6" />
            </div>

            <h3>
              No leads found
            </h3>

            <p>
              There are no heritage leads in this
              category.
            </p>
          </div>
        )}
      </div>

      {selectedLead && (
        <HeritageLeadModal
          lead={selectedLead}
          onClose={handleCloseDocumentation}
          onSubmit={handleDocumentationSubmit}
        />
      )}

      {progressLead && (
        <ContributionStatus
          lead={progressLead}
          onClose={handleCloseProgress}
        />
      )}
    </div>
  );
}