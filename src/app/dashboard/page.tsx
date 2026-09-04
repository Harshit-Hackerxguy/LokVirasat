'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import {
  MapPin, Users, ShieldCheck, AlertTriangle, TrendingUp,
  Clock, CheckCircle2, FileText, LogOut, Settings,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

interface Stats {
  totalSites:    number;
  pendingLeads:  number;
  verifiedSites: number;
  reportedIssues: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, role, username, logout } = useAuthStore();
  const [stats, setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  // Fetch stats from the FastAPI backend
  useEffect(() => {
    if (!isAuthenticated) return;

    async function fetchStats() {
      try {
        const [sitesRes, leadsRes] = await Promise.all([
          fetch(`${API_URL}/api/sites/`),
          fetch(`${API_URL}/api/leads/`),
        ]);

        const sites = sitesRes.ok ? await sitesRes.json() : [];
        const leads = leadsRes.ok ? await leadsRes.json() : [];

        setStats({
          totalSites:    Array.isArray(sites) ? sites.length : 0,
          pendingLeads:  Array.isArray(leads)
            ? leads.filter((l: { status: string }) => l.status === 'needs-documentation' || l.status === 'documented').length
            : 0,
          verifiedSites: Array.isArray(sites)
            ? sites.filter((s: { verification_status: string }) => s.verification_status === 'authority-verified').length
            : 0,
          reportedIssues: 0, // placeholder until condition-reports API exists
        });
      } catch {
        // Backend not available — show zeros
        setStats({ totalSites: 0, pendingLeads: 0, verifiedSites: 0, reportedIssues: 0 });
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  const STAT_CARDS = [
    { icon: <MapPin size={22} />,       label: 'Total Heritage Sites', value: stats?.totalSites,    color: '#3b82f6' },
    { icon: <Clock size={22} />,        label: 'Pending Verification',  value: stats?.pendingLeads,  color: '#f97316' },
    { icon: <ShieldCheck size={22} />,  label: 'Authority Verified',    value: stats?.verifiedSites, color: '#22c55e' },
    { icon: <AlertTriangle size={22} />,label: 'Condition Reports',     value: stats?.reportedIssues,color: '#eab308' },
  ];

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-inner">
          <div>
            <p className="dashboard-label">Admin Portal</p>
            <h1 className="dashboard-title">LokVirasat Dashboard</h1>
            <p className="dashboard-subtitle">
              Welcome back, <strong>{username ?? 'Admin'}</strong>
            </p>
          </div>
          <div className="dashboard-header-actions">
            <button
              onClick={() => router.push('/verification')}
              className="dashboard-action-btn dashboard-action-btn--primary"
            >
              <ShieldCheck size={18} />
              Verification Portal
            </button>
            <button
              onClick={() => { logout(); router.replace('/login'); }}
              className="dashboard-action-btn"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-body">

        {/* Stats grid */}
        <div className="dashboard-stats-grid">
          {STAT_CARDS.map((card) => (
            <div key={card.label} className="dashboard-stat-card">
              <div className="dashboard-stat-icon" style={{ color: card.color, background: `${card.color}18` }}>
                {card.icon}
              </div>
              <div>
                <p className="dashboard-stat-label">{card.label}</p>
                <p className="dashboard-stat-value" style={{ color: card.color }}>
                  {loading ? '—' : (card.value ?? 0)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="dashboard-sections">

          <div className="dashboard-section">
            <h2 className="dashboard-section-title">
              <TrendingUp size={18} /> Quick Actions
            </h2>
            <div className="dashboard-quick-links">
              {[
                { icon: <MapPin size={16}/>,       label: 'Explore Map',           href: '/map' },
                { icon: <ShieldCheck size={16}/>,  label: 'Verify Leads',          href: '/verification' },
                { icon: <FileText size={16}/>,     label: 'Condition Reports',     href: '/map' },
                { icon: <Users size={16}/>,        label: 'Contributor Dashboard', href: '/contributor' },
              ].map((link) => (
                <button
                  key={link.label}
                  onClick={() => router.push(link.href)}
                  className="dashboard-quick-link"
                >
                  {link.icon}
                  <span>{link.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="dashboard-section">
            <h2 className="dashboard-section-title">
              <Settings size={18} /> System Status
            </h2>
            <div className="dashboard-status-list">
              {[
                { label: 'FastAPI Backend',      ok: !loading && (stats?.totalSites ?? 0) > 0 },
                { label: 'PostgreSQL Database',  ok: !loading && (stats?.totalSites ?? 0) > 0 },
                { label: 'Gemini AI Assistant',  ok: false }, // Placeholder
                { label: 'Image Upload Service', ok: true  },
              ].map((item) => (
                <div key={item.label} className="dashboard-status-item">
                  {item.ok
                    ? <CheckCircle2 size={16} style={{ color: '#22c55e' }} />
                    : <AlertTriangle size={16} style={{ color: '#eab308' }} />
                  }
                  <span className="dashboard-status-label">{item.label}</span>
                  <span className={`dashboard-status-pill ${item.ok ? 'dashboard-status-pill--ok' : 'dashboard-status-pill--warn'}`}>
                    {item.ok ? 'Online' : (item.label.includes('AI') ? 'Not configured' : loading ? 'Checking…' : 'Offline')}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
