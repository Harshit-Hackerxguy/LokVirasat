import { HeritageCategory } from '@/types';

export interface HeritageLead {
  id: string;
  name: string;
  approximateLocation: [number, number];
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
}

export const HERITAGE_LEADS: HeritageLead[] = [
  {
    id: 'lead-rampur-stepwell',
    name: 'Old Village Stepwell',
    approximateLocation: [73.8567, 18.5204],
    villageOrArea: 'Rampur Village',
    category: HeritageCategory.Monument,
    description:
      'A locally known old stepwell believed to have historical and cultural significance. The site has not yet been fully documented on LokVirasat.',
    submittedBy: 'Local Community',
    submittedAt: '2026-08-20',
    status: 'needs-documentation',
  },

  {
    id: 'lead-bhuj-folk-shrine',
    name: 'Traditional Village Shrine',
    approximateLocation: [69.6669, 23.2420],
    villageOrArea: 'Bhuj Rural Area',
    category: HeritageCategory.SacredGrove,
    description:
      'A locally significant shrine associated with community traditions and oral stories. Further documentation and verification are required.',
    submittedBy: 'Community Representative',
    submittedAt: '2026-08-21',
    status: 'needs-documentation',
  },

  {
    id: 'lead-old-fort',
    name: 'Forgotten Village Fort',
    approximateLocation: [75.8577, 30.9000],
    villageOrArea: 'Village Heritage Zone',
    category: HeritageCategory.Monument,
    description:
      'An old fortified structure known locally but lacking a complete digital heritage record. A contributor is required to document the site and collect local history.',
    submittedBy: 'Local Teacher',
    submittedAt: '2026-08-18',
    status: 'claimed',
    assignedContributor: 'Heritage Volunteer',
  },

  {
    id: 'lead-traditional-craft-site',
    name: 'Traditional Craft Heritage Site',
    approximateLocation: [77.5946, 12.9716],
    villageOrArea: 'Rural Craft Community',
    category: HeritageCategory.TraditionalCraftHub,
    description:
      'A community-associated location where traditional craft practices have been passed between generations. Documentation of the practice and oral history is pending.',
    submittedBy: 'Community Worker',
    submittedAt: '2026-08-22',
    status: 'needs-documentation',
  },
];