import { z } from 'zod'

export const querySchema = z.object({
  content: z
    .string()
    .min(10, { message: 'Query must be at least 10 characters.' })
    .max(300, { message: 'Query must not be longer than 300 characters.' }),
  category: z
    .enum(['Technical', 'General', 'Feedback', 'Other'])
    .default('General'),
  senderEmail: z
    .string()
    .email({ message: 'Please enter a valid email address.' })
    .optional()
    .or(z.literal('')),
});

export const queryReplySchema = z.object({
  content: z
    .string()
    .min(1, { message: 'Reply cannot be empty.' })
    .max(500, { message: 'Reply must not be longer than 500 characters.' }),
});

export type QueryFormData = z.infer<typeof querySchema>;
export type QueryReplyFormData = z.infer<typeof queryReplySchema>;
