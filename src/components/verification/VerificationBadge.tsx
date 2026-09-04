'use client';

import {
  ShieldCheck,
  Clock3,
  CheckCircle2,
} from 'lucide-react';

import { VerificationStatus } from '@/types';

interface VerificationBadgeProps {
  status: VerificationStatus;
  size?: 'sm' | 'md';
}

export default function VerificationBadge({
  status,
  size = 'md',
}: VerificationBadgeProps) {
  const config: Record<VerificationStatus, { label: string; description: string; icon: typeof Clock3; className: string }> = {
    'community-reported': {
      label: 'Community Reported',
      description: 'Raw community tip submitted',
      icon: Clock3,
      className: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    'community-corroborated': {
      label: 'Community Corroborated',
      description: 'Confirmed by multiple community members',
      icon: CheckCircle2,
      className: 'bg-orange-50 text-orange-700 border-orange-200',
    },
    'evidence-supported': {
      label: 'Evidence Supported',
      description: 'Supporting photos and documents reviewed',
      icon: ShieldCheck,
      className: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    'authority-verified': {
      label: 'Authority Verified',
      description: 'Verified by an authorized authority',
      icon: ShieldCheck,
      className: 'bg-green-50 text-green-700 border-green-200',
    },
  };

  const current = config[status];
  const Icon = current.icon;

  if (size === 'sm') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${current.className}`}
        title={current.description}
      >
        <Icon className="h-3.5 w-3.5" />
        {current.label}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${current.className}`}
      title={current.description}
    >
      <Icon className="h-4 w-4" />
      {current.label}
    </span>
  );
}