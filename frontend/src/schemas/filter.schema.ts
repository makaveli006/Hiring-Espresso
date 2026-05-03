import { z } from 'zod'

export const filterSchema = z.object({
  keyword: z.string().optional(),
  location: z.string().optional(),
  workplace_type: z.array(z.string()).optional(),
  commitment: z.array(z.string()).optional(),
  department: z.array(z.string()).optional(),
  yoe_min: z.number().optional(),
  yoe_max: z.number().optional(),
  salary_min: z.number().optional(),
  salary_minimum_min: z.string().optional(),
  salary_minimum_max: z.string().optional(),
  salary_minimum_frequency: z.string().optional(),
  salary_maximum_min: z.string().optional(),
  salary_maximum_max: z.string().optional(),
  salary_maximum_frequency: z.string().optional(),
  salary_listed_frequency: z.string().optional(),
  salary_currency: z.string().optional(),
})

export type Filters = z.infer<typeof filterSchema>
