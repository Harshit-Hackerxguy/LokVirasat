import { z } from 'zod';

export const SUPPORTED_LANGUAGES = [
  'English',
  'Hindi',
  'Tamil',
  'Telugu',
  'Kannada',
  'Bengali',
  'Marathi',
  'Gujarati',
  'Punjabi',
  'Malayalam',
  'Odia',
  'Urdu',
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const heritageSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters long.' }),
  coordinates: z.tuple([z.number(), z.number()], {
    error: 'Coordinates are required.',
  }),
  category: z.string().min(1, { message: 'Category is required.' }),
  description: z.string().min(20, { message: 'Description must be at least 20 characters long.' }),
  images: z
    .any()
    .refine((files) => !files || files.length <= 5, {
      message: 'You can upload a maximum of 5 images.',
    })
    .optional(),

  // ── New fields ────────────────────────────────────────────────────────────
  storytellerName: z.string().optional(),
  language: z.enum(SUPPORTED_LANGUAGES).optional(),
  supportingEvidence: z
    .string()
    .url({ message: 'Please enter a valid URL.' })
    .optional()
    .or(z.literal('')),
});

export type HeritageFormValues = z.infer<typeof heritageSchema>;

