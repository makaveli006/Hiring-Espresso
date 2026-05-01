import React from 'react'
import { Globe } from 'lucide-react'

const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'

function LinkedinIcon({ size = 18, style, className }: { size?: number; style?: React.CSSProperties; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={style} className={className}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

function YoutubeIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.41 19.1C5.12 19.56 12 19.56 12 19.56s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon fill="white" points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
    </svg>
  )
}

function RedditIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <circle cx="10" cy="10" r="10" fill="#FF4500" />
      <path
        fill="white"
        d="M16.67 10a1.46 1.46 0 0 0-2.47-1 7.12 7.12 0 0 0-3.85-1.23l.65-3.07 2.13.45a1 1 0 1 0 1-.97 1 1 0 0 0-.95.68l-2.38-.5a.15.15 0 0 0-.18.11l-.73 3.44a7.14 7.14 0 0 0-3.89 1.23 1.46 1.46 0 1 0-1.61 2.39 2.87 2.87 0 0 0 0 .44c0 2.24 2.61 4.06 5.83 4.06s5.83-1.82 5.83-4.06a2.87 2.87 0 0 0 0-.44 1.46 1.46 0 0 0 .62-1.53zM7.27 11a1 1 0 1 1 1 1 1 1 0 0 1-1-1zm5.58 2.71a3.58 3.58 0 0 1-2.85.71 3.58 3.58 0 0 1-2.85-.71.15.15 0 0 1 .21-.21 3.27 3.27 0 0 0 2.64.56 3.27 3.27 0 0 0 2.64-.56.15.15 0 0 1 .21.21zm-.13-1.71a1 1 0 1 1 1-1 1 1 0 0 1-1 1z"
      />
    </svg>
  )
}

const team = [
  {
    emoji: '🧑‍💼',
    name: 'Riley Parker',
    role: 'Product development and marketing.',
    note: 'ex-SWE at Meta, Doordash, Rippling',
    icon: 'linkedin' as const,
  },
  {
    emoji: '👩‍💻',
    name: 'Priya Sharma',
    role: 'Data science, machine learning, & strategy.',
    note: 'CS PhD at Stanford',
    icon: 'globe',
  },
  {
    emoji: '👨‍🔬',
    name: 'Marcus Chen',
    role: 'Personalization and recommendation systems.',
    note: 'Professor of Computer Science at Stanford University',
    icon: 'globe',
  },
]

export function AboutPage() {
  return (
    <div
      className="antialiased text-foreground"
      style={{
        fontFamily: FONT,
        textRendering: 'optimizeLegibility',
        lineHeight: '1.5',
      }}
    >
      {/* Social icons */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
          <LinkedinIcon size={20} />
        </a>
        <a href="https://reddit.com" target="_blank" rel="noopener noreferrer">
          <RedditIcon size={20} />
        </a>
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
          <LinkedinIcon size={20} />
        </a>
        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
          <YoutubeIcon size={20} />
        </a>
      </div>

      {/* Blog link */}
      <div className="text-center mb-10">
        <a
          href="#"
          className="text-sm font-medium text-[#319795] dark:text-teal-400 transition-colors"
        >
          Curious about HiringEspresso? Read this post!
        </a>
      </div>

      {/* Our Team */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-1 text-foreground">
          Our Team
        </h2>
        <p className="text-sm mb-6 text-muted-foreground">
          Building a job search engine that we would want to use ourselves.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {team.map((member) => (
            <div
              key={member.name}
              className="border border-border rounded-lg p-5 flex flex-col items-center text-center shadow-sm"
            >
              {/* Avatar placeholder — emoji */}
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-3 bg-gray-100 dark:bg-gray-700">
                {member.emoji}
              </div>

              <p className="font-bold text-sm mb-1 text-foreground">
                {member.name}
              </p>
              <p className="text-xs mb-1 text-muted-foreground">
                {member.role}
              </p>
              <p className="text-xs italic mb-3 text-muted-foreground/60">
                {member.note}
              </p>

              {member.icon === 'linkedin' ? (
                <LinkedinIcon size={16} className="text-[#DD6B20] dark:text-orange-400" />
              ) : (
                <Globe size={16} className="text-[#DD6B20]" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Why we started */}
      <section>
        <h2 className="text-2xl font-bold mb-3 text-foreground">
          Why we started HiringEspresso
        </h2>

        <p className="text-sm mb-4 text-muted-foreground leading-relaxed">
          To learn more about our journey, read this post:{' '}
          <a href="#" className="font-medium text-[#DD6B20]">
            HiringEspresso is ready for this moment
          </a>
        </p>

        <p className="text-sm mb-4 text-muted-foreground leading-relaxed">
          Try this experiment—go to any job board, from Indeed to LinkedIn, and search for a job.
          You'll encounter plenty of job postings, but the user experience is so poor that you'll
          likely lose interest after a few searches.
        </p>

        <p className="text-sm mb-4 text-muted-foreground leading-relaxed">
          From irrelevant search results to outdated job postings, to full-on scams and jobs posted
          by agencies on behalf of other companies, it's a complete mess. So, we decided to build a
          job site that we would want to use ourselves. A job site that delivers near-perfect search
          results, has super advanced search filters, and is free of scams.
        </p>

        <p className="text-sm mb-4 text-muted-foreground leading-relaxed">
          After several weeks of iteration, we launched our first version on Blind (
          <a href="#" className="underline text-muted-foreground">view post</a>) and Reddit (
          <a href="#" className="underline text-muted-foreground">view post</a>). Our post on
          Blind brought us to the front page of the app, and our Reddit post reached the top of the
          r/ChatGPT subreddit. We gained so much traction that our systems crashed, and we had to
          shut down for a few weeks to redesign our architecture. We hadn't anticipated such a
          response, but we were thrilled to see it!
        </p>

        <p className="text-sm mb-10 text-muted-foreground leading-relaxed">
          Since then, we've been iterating constantly and consistently delivering a product that is
          one step closer to our vision. We've developed a platform that we're proud of, and we're
          excited to share it with you!
        </p>

        {/* Popularity */}
        <div>
          <p className="font-semibold text-sm mb-2 text-foreground">
            Popularity
          </p>
          <p className="text-sm mb-2 text-muted-foreground">
            100% word-of-mouth, organic growth.
          </p>
          <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
            <li>
              <a href="#" className="underline text-muted-foreground">Featured on Business Insider</a>
            </li>
            <li>
              Our Reddit launches:{' '}
              {['Link', 'Link', 'Link'].map((l, i) => (
                <span key={i}>{i > 0 && ' | '}<a href="#" className="underline text-muted-foreground">{l}</a></span>
              ))}
            </li>
            <li>
              LinkedIn:{' '}
              {['Post', 'Post', 'Post', 'Post', 'Post', 'Post', 'Post', 'Post'].map((l, i) => (
                <span key={i}>{i > 0 && ' | '}<a href="#" className="underline text-muted-foreground">{l}</a></span>
              ))}
            </li>
            <li>
              TikTok:{' '}
              {['Video', 'Video', 'Video', 'Video', 'Video', 'Video', 'Video'].map((l, i) => (
                <span key={i}>{i > 0 && ' | '}<a href="#" className="underline text-muted-foreground">{l}</a></span>
              ))}
            </li>
            <li><a href="#" className="underline text-muted-foreground">Blind launch</a></li>
            <li>
              Reviews:{' '}
              <a href="#" className="underline text-muted-foreground">Bridged</a>{' | '}
              <a href="#" className="underline text-muted-foreground">Elpha</a>
            </li>
            <li>
              Twitter:{' '}
              {['Post', 'Post', 'Post'].map((l, i) => (
                <span key={i}>{i > 0 && ' | '}<a href="#" className="underline text-muted-foreground">{l}</a></span>
              ))}
            </li>
            <li>
              Youtube: <a href="#" className="underline text-muted-foreground">Video</a>
            </li>
          </ul>
        </div>
      </section>
    </div>
  )
}
