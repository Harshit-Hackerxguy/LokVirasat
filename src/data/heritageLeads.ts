import { HeritageSite, HeritageCategory } from '@/types';

export const HERITAGE_SITES: HeritageSite[] = [
  {
    id: 'ancient-temple-ruins',
    name: 'Ancient Temple Ruins',
    coordinates: [77.5946, 12.9716],
    description:
      'A representative documented heritage record showcasing how lesser-known historic structures can be preserved digitally through location data, cultural documentation, photographs, and community knowledge.',
    category: HeritageCategory.AncientRuins,
    zoomLevel: 15.5,
    pitch: 45,
    bearing: -15,

    verificationStatus: 'authority-verified',
    lastUpdated: '2026-08-23',
    images: [],
  },

  {
    id: 'historic-water-structure',
    name: 'Historic Water Structure',
    coordinates: [73.8567, 18.5204],
    description:
      'A representative heritage record for a traditional water structure demonstrating the documentation of lesser-known architectural and community heritage within LokVirasat.',
    category: HeritageCategory.Monument,
    zoomLevel: 16,
    pitch: 50,
    bearing: 20,

    verificationStatus: 'community-verified',
    lastUpdated: '2026-08-23',
    images: [],
  },

  {
    id: 'traditional-weaving-heritage',
    name: 'Traditional Weaving Heritage',
    coordinates: [69.6669, 23.2420],
    description:
      'A representative cultural heritage record focused on traditional craft practices passed between generations. The record demonstrates how craft knowledge can be connected to a physical location and preserved digitally.',
    category: HeritageCategory.TraditionalCraftHub,
    zoomLevel: 15,
    pitch: 40,
    bearing: 10,

    verificationStatus: 'community-verified',
    lastUpdated: '2026-08-23',
    images: [],
  },

  {
    id: 'folk-tradition-site',
    name: 'Folk Tradition Heritage Site',
    coordinates: [75.8577, 30.9000],
    description:
      'A representative heritage record for a location associated with local folklore and community traditions. Oral histories and supporting documentation can be added to strengthen the record over time.',
    category: HeritageCategory.FolkloreSite,
    zoomLevel: 15.5,
    pitch: 45,
    bearing: -10,

    verificationStatus: 'reported',
    lastUpdated: '2026-08-23',
    images: [],
  },
];