export type Coordinates = [longitude: number, latitude: number];

export enum HeritageCategory {
  Monument = 'Monument',
  SacredGrove = 'Sacred Grove',
  FolkloreSite = 'Folklore Site',
  AncientRuins = 'Ancient Ruins',
  TraditionalCraftHub = 'Traditional Craft Hub',
}

/**
 * 4-Tier Heritage Trust Journey
 * community-reported   → user submits a raw tip
 * community-corroborated → multiple community members confirm
 * evidence-supported   → photos / documents uploaded
 * authority-verified   → official expert review completed
 */
export type VerificationStatus =
  | 'community-reported'
  | 'community-corroborated'
  | 'evidence-supported'
  | 'authority-verified';

/** Map old values → display-friendly names */
export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  'community-reported':    'Community Reported',
  'community-corroborated': 'Community Corroborated',
  'evidence-supported':    'Evidence Supported',
  'authority-verified':    'Authority Verified',
};

/** Trust-level colour tokens (Tailwind / CSS variable friendly) */
export const VERIFICATION_STATUS_COLORS: Record<VerificationStatus, string> = {
  'community-reported':    '#eab308', // yellow
  'community-corroborated': '#f97316', // orange
  'evidence-supported':    '#3b82f6', // blue
  'authority-verified':    '#22c55e', // green
};

export interface HeritageSite {
  id: string;
  name: string;
  coordinates: Coordinates;
  description: string;
  category: HeritageCategory;

  zoomLevel: number;
  pitch: number;
  bearing: number;

  verificationStatus?: VerificationStatus;
  lastUpdated?: string;

  images?: string[];

  // Community documentation
  historicalInformation?: string;

  // Location verification
  locationVerified?: boolean;
  verifiedCoordinates?: Coordinates;

  // Recorded oral histories / local stories
  oralStories?: {
    audioUrl: string;
    language: string;
  }[];

  // Documentation metadata
  documentedAt?: string;
  documentedBy?: string;
}

export interface HeritageLead {
  id: string;
  name: string;
  approximateLocation: Coordinates;
  villageOrArea: string;
  category: HeritageCategory;
  description: string;
  submittedBy: string;
  submittedAt: string;

  status:
    | 'needs-documentation'
    | 'claimed'
    | 'documented'
    | 'verified';

  assignedContributor?: string;

  historicalInformation?: string;

  locationVerified?: boolean;

  verifiedCoordinates?: Coordinates;

  photos?: string[];

  oralStories?: {
    audioUrl: string;
    language: string;
  }[];

  documentedAt?: string;

  documentedBy?: string;

  // ── New fields for richer community form submission ───────────────────────
  /** Name of the person who shared or knows this heritage story */
  storytellerName?: string;

  /**
   * Primary language of the oral account or documentation
   * e.g. 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Marathi', 'English'
   */
  language?: string;

  /**
   * Links or notes pointing to supporting evidence
   * (external article URL, document link, archive reference, etc.)
   */
  supportingEvidence?: string;
}


export enum IssueType {
  Damage = 'Damage',
  Cleanliness = 'Cleanliness',
  Infrastructure = 'Infrastructure',
  Accessibility = 'Accessibility',
}

export interface ConditionReport {
  id: string;
  siteId: string;
  issueType: IssueType;
  photoUrl: string;
  exifCoords: Coordinates;
  verified: boolean;
  description: string;
}