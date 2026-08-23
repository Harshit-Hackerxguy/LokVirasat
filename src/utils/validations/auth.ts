import { z } from 'zod';

export const visitorSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long.' }),
});

export const authoritySchema = z.object({
  authorityId: z.string().min(5, { message: 'Authority ID must be at least 5 characters long.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export type VisitorFormValues = z.infer<typeof visitorSchema>;
export type AuthorityFormValues = z.infer<typeof authoritySchema>;
