import { z } from 'zod';

export const adminSchema = z.object({
  adminId: z.string().min(4, { message: 'Admin ID must be at least 4 characters.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
});

export const contributorSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
});

export type AdminFormValues = z.infer<typeof adminSchema>;
export type ContributorFormValues = z.infer<typeof contributorSchema>;

// ── Legacy aliases (keep for backward compat if referenced elsewhere) ─────────
export const visitorSchema = contributorSchema;
export const authoritySchema = adminSchema;
export type VisitorFormValues = ContributorFormValues;
export type AuthorityFormValues = AdminFormValues;
