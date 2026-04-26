import { api } from './client'
import type { Filters } from '@/schemas/filter.schema'
import { jobListResponseSchema, jobSchema, type Job, type JobListResponse } from '@/schemas/job.schema'

function buildQuery(filters: Filters, cursor?: string, limit = 20): string {
  const params = new URLSearchParams()
  if (filters.keyword) params.set('keyword', filters.keyword)
  if (filters.location) params.set('location', filters.location)
  filters.workplace_type?.forEach((t) => params.append('workplace_type', t))
  filters.commitment?.forEach((c) => params.append('commitment', c))
  filters.department?.forEach((d) => params.append('department', d))
  if (filters.yoe_min != null) params.set('yoe_min', String(filters.yoe_min))
  if (filters.yoe_max != null) params.set('yoe_max', String(filters.yoe_max))
  if (filters.salary_min != null) params.set('salary_min', String(filters.salary_min))
  if (cursor) params.set('cursor', cursor)
  params.set('limit', String(limit))
  return params.toString()
}

export async function fetchJobs(filters: Filters, cursor?: string): Promise<JobListResponse> {
  const query = buildQuery(filters, cursor)
  const raw = await api.get<unknown>(`/api/v1/jobs?${query}`)
  return jobListResponseSchema.parse(raw)
}

export async function fetchJob(id: string): Promise<Job> {
  const raw = await api.get<unknown>(`/api/v1/jobs/${id}`)
  return jobSchema.parse(raw)
}

export async function saveJob(id: string): Promise<void> {
  await api.post(`/api/v1/jobs/${id}/save`)
}

export async function unsaveJob(id: string): Promise<void> {
  await api.delete(`/api/v1/jobs/${id}/save`)
}

export async function hideJob(id: string): Promise<void> {
  await api.post(`/api/v1/jobs/${id}/hide`)
}
