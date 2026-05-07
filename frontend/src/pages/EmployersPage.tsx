import { BriefcaseBusiness, Megaphone } from 'lucide-react'

export function EmployersPage() {
  return (
    <div
      className="mx-auto max-w-[920px] px-6 pb-24 pt-32 text-foreground"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif' }}
    >
      <h1 className="mb-14 text-[44px] font-bold leading-[1.05] tracking-tight">HiringCafe for Employers</h1>

      <div className="space-y-5 text-[10px] leading-relaxed">
        <p className="flex items-center gap-3">
          <BriefcaseBusiness className="h-5 w-5 text-rose-700" />
          <span className="font-semibold">Job seeker?</span>
          <a href="/" className="text-blue-600 underline">
            Click here
          </a>
        </p>

        <p className="flex items-center gap-3">
          <Megaphone className="h-5 w-5 text-amber-500" />
          <span className="font-semibold">Please read</span>
          <a href="#" className="text-blue-600 underline">
            this announcement
          </a>
          <span className="font-semibold">before continuing. Thank you!</span>
        </p>
      </div>

      <section className="mt-10">
        <h2 className="mb-6 text-[24px] font-semibold leading-tight">What services are you interested in? *</h2>
        <div className="space-y-3 text-[20px] leading-snug">
          {[
            'Job Postings (Always free, forever)',
            'Manage listings (Always free, forever)',
            'Job Advertisement',
            'Talent Network',
          ].map((label) => (
            <label key={label} className="flex items-center gap-3">
              <input type="checkbox" className="h-7 w-7 rounded border-gray-300" />
              <span>{label}</span>
            </label>
          ))}
        </div>

        <p className="mt-7 text-[16px] leading-relaxed text-gray-700 dark:text-gray-300">
          Our{' '}
          <a href="#" className="text-blue-600 underline">
            talent network
          </a>{' '}
          program allows you to connect with job seekers who opt-in to share their profiles. We will
          schedule a Zoom call and walk you through the process should you be interested in this
          service.
        </p>
      </section>

      <form className="mt-12 space-y-9">
        {[
          { label: 'Your Full Name *', placeholder: '' },
          { label: 'Your Email *', placeholder: '' },
          { label: 'Your Phone Number *', placeholder: '' },
          { label: 'Your Personal LinkedIn *', placeholder: '' },
          { label: 'Company Name *', placeholder: '' },
          { label: 'Company Website *', placeholder: '' },
        ].map((field) => (
          <div key={field.label}>
            <label className="mb-2 block text-[24px] font-semibold leading-tight">{field.label}</label>
            <input
              type="text"
              placeholder={field.placeholder}
              className="h-16 w-full rounded-xl border border-gray-300 bg-white px-4 text-[10px] outline-none focus:border-gray-500 dark:bg-background"
            />
          </div>
        ))}

        <div>
          <label className="mb-2 block text-[24px] font-semibold leading-tight">Company Career Page</label>
          <p className="mb-3 text-[14px] leading-relaxed text-gray-700 dark:text-gray-300">
            If you would like us to scrape your jobs, please be sure to enter the URL of your career
            page.
          </p>
          <input
            type="text"
            className="h-16 w-full rounded-xl border border-gray-300 bg-white px-4 text-[10px] outline-none focus:border-gray-500 dark:bg-background"
          />
        </div>

        <button
          type="button"
          className="mt-5 inline-flex items-center rounded-xl bg-black px-6 py-3 text-[14px] font-semibold text-white"
        >
          Submit
        </button>
      </form>
    </div>
  )
}
