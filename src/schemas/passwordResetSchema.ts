import { z } from 'zod';

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});