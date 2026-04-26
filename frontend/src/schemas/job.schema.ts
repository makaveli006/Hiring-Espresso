import { z } from 'zod'

export const companySchema = z.object({
  id: z.string(),
  name: z.string(),
  logo_url: z.string().nullable().optional(),
  ticker: z.string().nullable().optional(),
  exchange: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
})

export const jobSchema = z.object({
  id: z.string(),
  title: z.string(),
  company: companySchema,
  location_display: z.string().nullable().optional(),
  location_city: z.string().nullable().optional(),
  location_country: z.string().nullable().optional(),
  workplace_type: z.string().nullable().optional(),
  commitment: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  skills: z.array(z.string()).nullable().optional(),
  yoe_min: z.number().nullable().optional(),
  yoe_max: z.number().nullable().optional(),
  salary_min: z.number().nullable().optional(),
  salary_max: z.number().nullable().optional(),
  salary_currency: z.string().nullable().optional(),
  job_posting_url: z.string().nullable().optional(),
  posted_at: z.string(),
})

export const jobListResponseSchema = z.object({
  items: z.array(jobSchema),
  next_cursor: z.string().nullable().optional(),
  total: z.number().nullable().optional(),
})

export type Company = z.infer<typeof companySchema>
export type Job = z.infer<typeof jobSchema>
export type JobListResponse = z.infer<typeof jobListResponseSchema>
