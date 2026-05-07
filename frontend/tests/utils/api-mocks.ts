import type { Page } from '@playwright/test'

const MOCK_ONSITE_JOBS = [
  {
    id: '1',
    title: 'DATA ANALYST L4 (Bengaluru, IND-29, IN,...',
    company: {
      id: 'c1',
      name: 'Wipro',
      logo_url: null,
      ticker: 'WIT',
      exchange: 'NYSE',
      description: 'Global technology services and consulting for digital transformation.',
    },
    location_display: 'Bengaluru, Karnataka, India',
    location_country: 'India',
    workplace_type: 'onsite',
    commitment: 'full_time',
    department: 'Data & Analytics',
    description: '5-8 years of data analysis experience; strong data modeling, dashboards, and data validation skills.',
    skills: ['SQL', 'Excel', 'Tableau', 'Python'],
    yoe_min: 5,
    yoe_max: 8,
    posted_at: new Date(Date.now() - 3 * 3_600_000).toISOString(),
    job_posting_url: 'https://example.com/job/1',
  },
  {
    id: '2',
    title: 'Senior Subcontracts Specialist (Gurugram, HR, IN, 122015)',
    company: {
      id: 'c2',
      name: 'Bechtel',
      logo_url: null,
      ticker: null,
      exchange: null,
      description: 'Designs and constructs large-scale industrial and infrastructure projects.',
    },
    location_display: 'Gurugram, Haryana, India',
    location_country: 'India',
    workplace_type: 'onsite',
    commitment: 'full_time',
    department: 'Legal & Contracts',
    description: "Bachelor's degree; 13-15 years in commercial/contracts; EPC contracts.",
    skills: [],
    yoe_min: 13,
    yoe_max: 15,
    posted_at: new Date(Date.now() - 3 * 3_600_000).toISOString(),
    job_posting_url: 'https://example.com/job/2',
  },
  {
    id: '3',
    title: 'Officer - Customer Operations (Mumbai, IN)',
    company: {
      id: 'c3',
      name: 'Nestlé',
      logo_url: null,
      ticker: 'NESN',
      exchange: 'Swiss Exchange',
      description: 'Produces and sells a wide range of food and beverages.',
    },
    location_display: 'Mumbai, Maharashtra, India',
    location_country: 'India',
    workplace_type: 'onsite',
    commitment: 'full_time',
    department: 'Customer Operations',
    description: 'Strong communication and analytical skills; experience in Modern Trade.',
    skills: [],
    yoe_min: 2,
    yoe_max: 6,
    posted_at: new Date(Date.now() - 4 * 3_600_000).toISOString(),
    job_posting_url: 'https://example.com/job/3',
  },
]

const MOCK_REMOTE_JOBS = [
  {
    id: '4',
    title: 'Senior Performance Testing Expert',
    company: {
      id: 'c4',
      name: 'Cognizant',
      logo_url: null,
      ticker: 'CTSH',
      exchange: 'Nasdaq',
      description: 'Provides global information technology and business process services.',
    },
    location_display: 'India',
    location_country: 'India',
    workplace_type: 'remote',
    commitment: 'full_time',
    department: 'Engineering',
    description: '10-12 years of performance testing experience; hands-on in CI/CD, LoadRunner, JMeter.',
    skills: ['LoadRunner', 'JMeter'],
    yoe_min: 10,
    yoe_max: 12,
    posted_at: new Date(Date.now() - 5 * 3_600_000).toISOString(),
    job_posting_url: 'https://example.com/job/4',
  },
  {
    id: '5',
    title: 'Global Category Manager',
    company: {
      id: 'c5',
      name: 'Valmet',
      logo_url: null,
      ticker: 'VALMT',
      exchange: 'Nasdaq Helsinki',
      description: 'Provides process technologies and automation systems.',
    },
    location_display: 'Pune',
    location_country: 'India',
    workplace_type: 'remote',
    commitment: 'full_time',
    department: 'Procurement',
    description: "Bachelor's in engineering or economics; min. 5 years in Category Management.",
    skills: ['Procurement', 'Sourcing', 'Contract Negotiation'],
    yoe_min: 5,
    posted_at: new Date(Date.now() - 17 * 3_600_000).toISOString(),
    job_posting_url: 'https://example.com/job/5',
  },
  {
    id: '6',
    title: 'Data Modeler',
    company: {
      id: 'c6',
      name: 'Accenture',
      logo_url: null,
      ticker: 'ACN',
      exchange: 'NYSE',
      description: 'Global provider of management consulting and technology services.',
    },
    location_display: 'Indore, Madhya Pradesh, India',
    location_country: 'India',
    workplace_type: 'remote',
    commitment: 'full_time',
    department: 'Data & Analytics',
    description: '7.5+ years data modeling experience; data vault 2.0; data governance.',
    skills: ['Snowflake', 'AWS'],
    yoe_min: 7,
    posted_at: new Date(Date.now() - 17 * 3_600_000).toISOString(),
    job_posting_url: 'https://example.com/job/6',
  },
]

const ALL_MOCK_JOBS = [...MOCK_ONSITE_JOBS, ...MOCK_REMOTE_JOBS]

export async function mockJobsAPI(page: Page): Promise<void> {
  await page.route(/\/api\/v1\/jobs/, async (route) => {
    const url = new URL(route.request().url())
    const workplaceTypes = url.searchParams.getAll('workplace_type')

    let items = ALL_MOCK_JOBS
    if (workplaceTypes.length > 0) {
      items = ALL_MOCK_JOBS.filter((job) => workplaceTypes.includes(job.workplace_type))
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items, next_cursor: null, total: items.length }),
    })
  })
}
