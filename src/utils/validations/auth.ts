import { z } from 'zod';

export const adminSchema = z.object({
  username: z.string().min(2, { message: 'Username must be at least 2 characters.' }),
  adminId: z.string().min(4, { message: 'Admin ID must be at least 4 characters.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export const contributorSchema = z.object({
  username: z.string().min(2, { message: 'Username must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export type AdminFormValues = z.infer<typeof adminSchema>;
export type ContributorFormValues = z.infer<typeof contributorSchema>;

// ── Legacy aliases (keep for backward compat if referenced elsewhere) ─────────
export const visitorSchema = contributorSchema;
export const authoritySchema = adminSchema;
export type VisitorFormValues = ContributorFormValues;
export type AuthorityFormValues = AdminFormValues;
