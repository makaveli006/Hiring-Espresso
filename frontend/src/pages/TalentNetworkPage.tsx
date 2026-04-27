import { useUIStore } from '@/store/useUIStore'
import { useAuth } from '@clerk/clerk-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

function LobsterCuttingStone() {
  return (
    <svg
      width="140"
      height="140"
      viewBox="0 0 140 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <style>{`
        @keyframes hammerSwing {
          0%, 20%  { transform: rotate(-38deg); }
          48%, 56% { transform: rotate(28deg); }
          80%, 100%{ transform: rotate(-38deg); }
        }
        @keyframes stoneShake {
          0%, 43%, 68%, 100% { transform: translateX(0); }
          49% { transform: translateX(-4px); }
          55% { transform: translateX(4px); }
          61% { transform: translateX(-2px); }
          67% { transform: translateX(0); }
        }
        @keyframes sparkFlash {
          0%, 42%, 70%, 100% { opacity: 0; transform: scale(0.5); }
          50%, 60%            { opacity: 1; transform: scale(1.2); }
        }
        @keyframes bodyBob {
          0%, 45%, 65%, 100% { transform: translateY(0); }
          52% { transform: translateY(2px); }
        }
        .lob-hammer { animation: hammerSwing 1s cubic-bezier(0.4,0,0.2,1) infinite; transform-origin: 84px 70px; }
        .lob-stone  { animation: stoneShake  1s ease-in-out infinite; transform-origin: 85px 107px; }
        .lob-sparks { animation: sparkFlash  1s ease-in-out infinite; }
        .lob-body   { animation: bodyBob     1s ease-in-out infinite; }
      `}</style>

      {/* Stone (shakes on impact) */}
      <g className="lob-stone">
        <ellipse cx="85" cy="115" rx="38" ry="16" fill="#9ca3af" />
        <path
          d="M52 100 Q55 82 70 78 Q90 74 110 82 Q122 88 123 100 Q122 112 108 116 Q90 121 70 118 Q54 114 52 100Z"
          fill="#6b7280"
        />
        <path d="M82 84 L86 96 L80 104" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* Lobster body — bobs slightly on impact */}
      <g className="lob-body">
        {/* Body */}
        <ellipse cx="68" cy="72" rx="18" ry="26" fill="#ef4444" />
        <path d="M52 68 Q68 64 84 68" stroke="#dc2626" strokeWidth="1.5" fill="none" />
        <path d="M52 76 Q68 72 84 76" stroke="#dc2626" strokeWidth="1.5" fill="none" />
        <path d="M53 84 Q68 80 83 84" stroke="#dc2626" strokeWidth="1.5" fill="none" />

        {/* Tail fan */}
        <path d="M55 94 Q50 104 44 108 Q48 110 55 104Z" fill="#ef4444" />
        <path d="M62 96 Q60 108 56 114 Q60 115 65 108Z" fill="#f87171" />
        <path d="M68 97 Q68 110 68 116 Q72 116 72 110Z" fill="#ef4444" />
        <path d="M74 96 Q76 108 80 114 Q84 113 82 106Z" fill="#f87171" />
        <path d="M80 93 Q86 102 90 106 Q94 104 90 97Z" fill="#ef4444" />

        {/* Head */}
        <ellipse cx="68" cy="50" rx="14" ry="12" fill="#ef4444" />
        <circle cx="62" cy="46" r="3.5" fill="white" />
        <circle cx="74" cy="46" r="3.5" fill="white" />
        <circle cx="63" cy="46" r="2" fill="#1f2937" />
        <circle cx="75" cy="46" r="2" fill="#1f2937" />
        <circle cx="64" cy="45" r="0.7" fill="white" />
        <circle cx="76" cy="45" r="0.7" fill="white" />
        <path d="M63 53 Q68 57 73 53" stroke="#1f2937" strokeWidth="1.2" strokeLinecap="round" fill="none" />

        {/* Antennae */}
        <path d="M60 40 Q50 28 38 22" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M76 40 Q86 28 98 22" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M62 40 Q56 32 52 24" stroke="#f87171" strokeWidth="1" strokeLinecap="round" />
        <path d="M74 40 Q80 32 84 24" stroke="#f87171" strokeWidth="1" strokeLinecap="round" />

        {/* Party hat */}
        <path d="M60 40 L68 14 L76 40Z" fill="#f59e0b" />
        <path d="M60 40 L68 14 L76 40Z" fill="none" stroke="#d97706" strokeWidth="0.5" />
        <path d="M60 40 Q68 43 76 40" fill="#fbbf24" />
        <path d="M63 34 L73 34" stroke="#d97706" strokeWidth="0.8" />
        <path d="M65 27 L71 27" stroke="#d97706" strokeWidth="0.8" />
        <text x="64" y="22" fontSize="8" fill="#fef3c7">★</text>

        {/* Left claw arm + claw (static — holds chisel steady) */}
        <path d="M52 60 Q38 55 28 50" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" />
        <ellipse cx="22" cy="47" rx="9" ry="6" fill="#dc2626" transform="rotate(-20 22 47)" />
        <path d="M16 42 Q22 40 28 44" stroke="#b91c1c" strokeWidth="1.5" strokeLinecap="round" />

        {/* Right arm — holds chisel on stone (static) */}
        <path d="M84 62 Q96 56 102 62" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" />
        <rect x="99" y="58" width="5" height="22" rx="1.5" fill="#78716c" transform="rotate(15 99 58)" />
        <path d="M104 78 L114 83 L110 87 L100 82Z" fill="#57534e" />
      </g>

      {/* Hammer arm (swings — pivot at right shoulder 84,70) */}
      <g className="lob-hammer">
        <path d="M84 70 Q100 72 108 70" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" />
        <rect x="106" y="62" width="4" height="20" rx="2" fill="#92400e" transform="rotate(-10 106 62)" />
        <rect x="108" y="56" width="16" height="9" rx="2.5" fill="#44403c" transform="rotate(-10 108 56)" />
      </g>

      {/* Sparks (flash at impact) */}
      <g className="lob-sparks">
        <circle cx="96" cy="90" r="1.5" fill="#fbbf24" />
        <circle cx="100" cy="84" r="1" fill="#f59e0b" />
        <circle cx="92" cy="86" r="1" fill="#fbbf24" />
        <circle cx="104" cy="93" r="1" fill="#fef08a" />
        <path d="M94 88 L97 82" stroke="#fbbf24" strokeWidth="1" strokeLinecap="round" />
        <path d="M99 88 L103 80" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round" />
      </g>
    </svg>
  )
}

const faqs = [
  {
    question: 'What is HiringEspresso Talent Network?',
    answer:
      'Our talent network allows companies to reach out to you directly on HiringEspresso. You can go live anytime, and you can hide your profile anytime. Your identity is always private and secure - companies are only able to access your personal information after you accept their intro request.',
  },
  {
    question: 'How does it work?',
    answer:
      "After you submit your resume, our system will fetch your work experience and education (via ChatGPT's API) and make it available for companies. Your identity and contact information is only revealed when you accept their intro request. With HiringEspresso, you'll never have to worry about spam or unsolicited messages.",
  },
  {
    question: 'Is it free?',
    answer: "It's 100% free for job seekers, but not for companies 🤩.",
  },
  {
    question: 'What information will be shared with companies?',
    answer:
      "They'll be able to view your work experience, education history, salary expectation, and location preferences. Your name and contact information will remain hidden. They can access your identity if you decide to accept their intro request. You can reject their intro request anonymously. Your account activity such as intro requests, messages, jobs applied, profile views, and etc will always remain private and secure.",
  },
  {
    question: "Can they see what jobs I've applied to?",
    answer:
      'No, absolutely not. Your account activity is always private and secure and will never be shared with companies.',
  },
  {
    question: 'Can I hide my profile?',
    answer:
      'Yes, you can hide your profile at any time. Simply toggle the switch in your account settings.',
  },
  {
    question: 'Can I hide my profile from specific companies?',
    answer:
      'Yes, you can hide your profile from specific companies in your account settings.',
  },
  {
    question: 'Do I have to accept requests?',
    answer:
      'No, you can accept or decline any number of requests. Your account will remain live until you hide your profile, and your account will not be affected by declining requests.',
  },
  {
    question: 'What do I need to do to join HiringEspresso Talent Network?',
    answer:
      "Just add your resume and your current location. If you want, you can add additional information (salary expectation, etc). It's really that simple! Behind the scenes, we'll use AI/ML/[insert other buzzwords here] to match you with the right companies.",
  },
]

export function TalentNetworkPage() {
  const { isSignedIn } = useAuth()
  const setAuthModalOpen = useUIStore((s) => s.setAuthModalOpen)

  function handleGetStarted() {
    if (!isSignedIn) {
      setAuthModalOpen(true, 'signUp')
    }
  }

  return (
    <div
      className="flex flex-col items-center text-center antialiased"
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
        textRendering: 'optimizeLegibility',
        lineHeight: '1.5',
      }}
    >
      {/* Illustration */}
      <div className="mb-6 mt-2">
        <LobsterCuttingStone />
      </div>

      {/* Badge */}
      <span className="inline-block bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-medium px-3 py-1 rounded-full mb-4">
        HiringEspresso Private Talent Network
      </span>

      {/* Heading */}
      <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">
        Let Companies Apply to You
      </h1>

      {/* Description */}
      <p className="text-sm max-w-sm mb-6 leading-relaxed text-gray-600 dark:text-gray-200">
        Submit your resume and let companies apply to you directly on HiringEspresso. Go live anytime, and hide your
        profile whenever you want. Your identity is only revealed when you accept their intro request. Never worry about
        spam again!
      </p>

      {/* CTA */}
      <button
        onClick={handleGetStarted}
        className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-400 text-white font-semibold px-8 py-3 rounded-lg text-base transition-colors mb-2"
      >
        Get Started Now
      </button>
      <p className="text-xs mb-12 text-gray-500 dark:text-gray-400">
        It takes 30 seconds, and it's 100% free!
      </p>

      {/* FAQ */}
      <div className="w-full text-left">
        <h2 className="text-base font-bold mb-4 text-orange-500 dark:text-orange-400">
          Frequently Asked Questions
        </h2>
        <Accordion className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-gray-200 dark:border-gray-700">
              <AccordionTrigger className="text-sm font-normal text-left text-gray-700 dark:text-white">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-gray-600 dark:text-gray-200">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  )
}
