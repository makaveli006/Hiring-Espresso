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
})

export type Filters = z.infer<typeof filterSchema>
