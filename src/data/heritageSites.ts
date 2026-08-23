import { HeritageSite, HeritageCategory } from '@/types';

export const HERITAGE_SITES: HeritageSite[] = [
  {
    id: 'taj-mahal',
    name: 'Taj Mahal',
    coordinates: [78.0421, 27.1751],
    description:
      'A masterpiece of Mughal architecture, the Taj Mahal stands as an eternal testament to love. Built by Emperor Shah Jahan in memory of his wife Mumtaz Mahal, this ivory-white marble mausoleum took 22 years and 20,000 artisans to complete. Its perfect symmetry, intricate pietra dura inlays, and the way it changes color with the shifting light make it one of the most photographed structures on Earth.',
    category: HeritageCategory.Monument,
    zoomLevel: 16.5,
    pitch: 55,
    bearing: -30,

    verificationStatus: 'authority-verified',
    lastUpdated: '2026-08-23',
    images: [],
  },

  {
    id: 'hampi',
    name: 'Hampi — Ruins of Vijayanagara',
    coordinates: [76.4601, 15.335],
    description:
      "Scattered across a surreal landscape of giant granite boulders, the ruins of Hampi whisper tales of a once-magnificent empire. The Vijayanagara Empire's capital was among the richest and largest cities in the world during the 14th–16th centuries. Today, over 1,600 surviving remains — temples, palaces, market streets, and aquatic structures — sprawl across 4,100 hectares, blending seamlessly with the otherworldly terrain.",
    category: HeritageCategory.Monument,
    zoomLevel: 14.8,
    pitch: 45,
    bearing: 20,

    verificationStatus: 'authority-verified',
    lastUpdated: '2026-08-23',
    images: [],
  },

  {
    id: 'konark-sun-temple',
    name: 'Konark Sun Temple',
    coordinates: [86.0945, 19.8876],
    description:
      'Conceived as the colossal chariot of Surya, the Sun God, the Konark temple is an architectural marvel of the 13th-century Eastern Ganga dynasty. Twelve pairs of exquisitely carved stone wheels — each 3 meters in diameter — serve as functional sundials, while seven mighty horses strain forward as if pulling the temple toward the dawn. Its walls are an encyclopedia of medieval life, adorned with sculptures depicting celestial musicians, mythical creatures, and scenes of daily existence.',
    category: HeritageCategory.Monument,
    zoomLevel: 17,
    pitch: 50,
    bearing: 60,

    verificationStatus: 'authority-verified',
    lastUpdated: '2026-08-23',
    images: [],
  },

  {
    id: 'khajuraho',
    name: 'Khajuraho Temples',
    coordinates: [79.9199, 24.8318],
    description:
      "Rising from the plains of Madhya Pradesh, the Khajuraho temple complex represents the pinnacle of Chandela dynasty artistry. Of the original 85 temples built between 950 and 1050 CE, 25 survive in remarkable condition — their sandstone surfaces alive with thousands of sculptures celebrating love, spirituality, and the rhythms of courtly life. The temples' nagara-style shikhara towers soar upward in cascading tiers, creating a silhouette that mirrors the sacred Himalayan peaks.",
    category: HeritageCategory.Monument,
    zoomLevel: 15.5,
    pitch: 40,
    bearing: -15,

    verificationStatus: 'authority-verified',
    lastUpdated: '2026-08-23',
    images: [],
  },
];