import { z } from 'zod'

export const uploadSchema = z.object({
  resume: z
    .instanceof(File)
    .refine((f) => f.type === 'application/pdf', 'Only PDF files are accepted.')
    .refine((f) => f.size <= 5 * 1024 * 1024, 'File must be 5 MB or less.'),
})

export const analyzeSchema = z.object({
  resumeText: z.string().min(100, 'Resume text is too short to analyze.'),
  jobDescription: z
    .string()
    .min(100, 'Job description must be at least 100 characters.'),
  jobTitle: z.string().optional(),
  companyName: z.string().optional(),
  storagePath: z.string().optional(),
  filename: z.string().min(1, 'Filename is required.'),
})

export const signUpSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
    .regex(/[0-9]/, 'Password must contain at least one number.'),
})

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
})

export type UploadInput = z.infer<typeof uploadSchema>
export type AnalyzeInput = z.infer<typeof analyzeSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
export type LoginInput = z.infer<typeof loginSchema>
