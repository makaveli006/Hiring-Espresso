# hiring.cafe — Reference for Clone (Hiring Espresso)

## What it is
An AI-driven job aggregator that scrapes openings **directly from company websites** (~72,000+ companies). Focused on providing a cleaner, more authentic alternative to LinkedIn/Indeed by removing fake, expired, and agency-posted roles.

## Core Value Proposition
- Jobs come straight from company career pages — not aggregated boards
- Removes noise: no fake, expired, or recruiter/agency listings
- Skews toward remote roles but covers in-person too
- Less saturated than traditional job boards

## Key Features to Clone

### 1. Direct Scraping / Ingestion
- Scrapes jobs from 72,000+ company websites
- AI validates that roles are currently open
- Sources: Greenhouse, Lever, Ashby, Workday, and custom company career pages

### 2. High-Quality Listings
- Millions of jobs aggregated, filtered, and organized
- Primary focus: remote roles
- Deduplication and expiry detection

### 3. AI-Generated Summaries
- Highlights key details: responsibilities, seniority level, salary
- Reduces time spent reading full JD

### 4. Search & Filter
- Filter by job title, skill, years of experience
- Reduces noise / irrelevant results

### 5. Built-in Application Tracker
- Private tracker to manage applied jobs
- Per-user, not shared publicly

### 6. Direct Application
- Always links to official company website to apply
- Never redirects through the platform itself

## Founders / Origin
- **Ali Mir** — former software engineer at Meta, DoorDash, Rippling
- **Hamed Nilforoshan** — Stanford CS PhD
- Advisor: **Jure Leskovec** — Stanford professor, known for personalization/recommendation systems
- Featured by **Business Insider** for tackling fake job listings

## Job Categories Covered
- Software engineering and technical positions
- Data, machine learning, and analytics
- Product management and design
- Marketing, sales, and operations
- Corporate and business functions
- **Not** exclusively remote — includes location-specific roles too

## Pricing Model
- **100% free for job seekers** — no premium tiers, no paywalls
- Revenue from employers: promoted listings + opt-in Talent Network
- Employers cannot see candidate tracker activity by default

## Application Tracker Details
- Users can save roles, mark as applied, add private notes
- Move roles between stages (saved → applied → interviewing etc.)
- Completely private — not visible to employers unless explicitly shared

## Search UX Details
- Feels like a search engine, not a traditional job board
- Returns fewer but more accurate results (relevance over volume)
- Each listing has an AI-generated summary: responsibilities, seniority, role type
- "Apply Now" goes directly to employer's own application system
- Salary transparency: extracted/inferred when available, not always present

## Why Job Seekers Trust It
- Listings sourced from company career pages → lower scam risk vs open-submission boards
- Does not sell candidate data
- No recruiter spam, no duplicated listings
- Career pages scanned **multiple times per day** to keep listings current

## Who It's Best For (target user persona)
- Professionals tired of recruiter-heavy boards
- Prefer relevance over volume
- Tech, product, corporate roles
- Want free application tracking
- Thoughtful searchers, not mass-appliers

## Who It's NOT Ideal For
- Exclusively remote-only job seekers (not a remote-only board)
- High-volume "spray and pray" applicators
- People wanting networking/messaging features
- Mostly entry-level seekers

## Competitors / Alternatives They Mention
LinkedIn, Wellfound, FlexJobs, Contra, Remote100K

## What We Are NOT Cloning (out of scope for now)
- The 72,000+ company scraping scale (we use known ATS providers + search discovery)
- AI expiry detection (we use `is_active` flag + ingestion freshness)
- Talent Network (employer-side opt-in reach-outs)
- Networking / messaging features

## Our Implementation Approach
- ATS fetchers: Greenhouse, Lever (direct API)
- Search discovery: 21 search providers to find job URLs, then scrape
- AI normalization: OpenAI to extract skills, YOE, salary, department
- Frontend: job carousels, filter chips, Clerk auth, saved jobs
