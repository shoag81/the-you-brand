'use client'

import { useState, useEffect } from 'react'
import BrandBrief from './BrandBrief'

const sections = [
  { title: 'Your Origin Story' },
  { title: "Your Client's Story" },
  { title: 'Your Voice' },
  { title: 'Your Vision' },
  { title: 'Your Style' },
  { title: 'Your Photography' },
]

const fieldClass =
  'w-full border border-black/10 rounded-xl p-4 text-ink bg-white/70 font-body focus:outline-none focus:border-emerald resize-none'
const labelClass = 'block text-base font-bold text-ink mb-1 font-body'
const helpClass = 'text-sm text-ink/60 mb-3 font-body leading-relaxed'
const inputClass =
  'w-full border border-black/10 rounded-xl p-4 text-ink bg-white/70 font-body focus:outline-none focus:border-emerald'

function Field({ label, help, rows = 4, value, onChange, placeholder }:
  { label: string; help: string; rows?: number; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <p className={helpClass}>{help}</p>
      <textarea className={fieldClass} rows={rows} placeholder={placeholder}
        value={value} onChange={e => onChange(e.target.value)} />
    </div>
  )
}

export default function Questionnaire() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [fullName, setFullName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [hasBrand, setHasBrand] = useState<'existing' | 'fresh' | null>(null)
  const [generating, setGenerating] = useState(false)
  const [brief, setBrief] = useState<Record<string, unknown> | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step])

  const f = (key: string) => ({
    value: answers[key] || '',
    onChange: (v: string) => setAnswers(prev => ({ ...prev, [key]: v })),
  })

  const generateBrief = async () => {
    setGenerating(true)
    try {
      const payload = { fullName, businessName, hasBrand, ...answers }
      const res = await fetch('/api/generate-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      setBrief(data.brief)
      setSessionId(data.sessionId || null)
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const progress = (step / sections.length) * 100

  if (brief) {
    return <BrandBrief brief={brief} name={fullName.split(' ')[0]} fullName={fullName} sessionId={sessionId} onBack={() => setBrief(null)} />
  }

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="max-w-2xl mx-auto">

        {step > 0 && (
          <>
            <h1 className="text-4xl font-extrabold text-ink mb-2 font-display">
              Discover the <span className="italic text-coral">you</span> brand.
            </h1>
            <p className="text-emerald mb-8 font-body">
              {sections[step - 1].title} — Section {step} of {sections.length}
            </p>
            <div className="w-full bg-black/10 rounded-full h-2 mb-10">
              <div className="bg-coral h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }} />
            </div>
          </>
        )}

        <div className="bg-bone/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg space-y-8">

          {step === 0 && (
            <div className="space-y-6">
              <h1 className="text-4xl font-extrabold text-ink font-display leading-tight">
                Welcome. Let&apos;s uncover the <span className="italic text-coral">you</span> brand.
              </h1>
              <p className="font-body text-ink/80 leading-relaxed">
                This isn&apos;t a form — it&apos;s closer to a conversation. Over the next few sections,
                I&apos;ll ask you about your story, the people you serve, your voice, your vision, your
                style, and how you want to show up. Think of it as career therapy: the more you share,
                the more your brand will sound like <em>you</em>.
              </p>
              <p className="font-body text-ink/80 leading-relaxed">
                There are no right answers. Don&apos;t write what sounds impressive — write what&apos;s
                true. The unexpected, personal details are usually the ones that make people fall in love
                with a brand. Nothing is too small to mention.
              </p>
              <p className="font-body text-ink/80 leading-relaxed">
                And if you&apos;re not quite in the role you want yet — answer as the version of you who
                already is. That&apos;s how you start to become her.
              </p>
              <div className="pt-2 space-y-4">
                <div>
                  <label className={labelClass}>What&apos;s your full name?</label>
                  <p className={helpClass}>We&apos;ll use this to personalize your brand brief and signature logo concepts.</p>
                  <input className={inputClass} placeholder="Jane Rivera"
                    value={fullName} onChange={e => setFullName(e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>What&apos;s your business or brand name? (optional)</label>
                  <p className={helpClass}>If you have one. If not, no worries — we&apos;ll help you find it.</p>
                  <input className={inputClass} placeholder="Rivera Creative Co."
                    value={businessName} onChange={e => setBusinessName(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <>
              <p className="font-body text-ink/70 leading-relaxed italic">
                Let&apos;s start with you. Your backstory is the one thing no competitor can copy — the
                specific journey that brought you here. Be generous with the details; this is the soul of
                your brand.
              </p>
              <Field {...f('before')} label="Where did your story begin?"
                help="What were you doing before this work? What chapter came before the one you're in now?"
                placeholder="Before this I spent twelve years in corporate marketing..." />
              <Field {...f('turningPoint')} label="What was the turning point?"
                help="Every great origin story has a moment — a decision, a loss, a conversation, a realization. What was yours? The more specific you can be, the better."
                placeholder="The week I got passed over for a promotion, I photographed a brand shoot for a friend. She booked four clients. Something clicked..." />
              <Field {...f('hardWay')} label="What did you have to figure out the hard way?"
                help="What did you struggle with that your clients are struggling with now? The empathy in your brand comes from having been where they are."
                placeholder="I spent two years undercharging because I didn't believe my work was worth more..." />
              <Field {...f('life')} label="Tell me about your life." rows={6}
                help="Where do you live? Are you married? Do you have kids? Pets? What do you do when you're not working — hobbies, obsessions, guilty pleasures? What would surprise people about you? Nothing is too small or too personal."
                placeholder="I live in Scottsdale with my husband and our two golden retrievers, Biscuit and Gravy. I'm a wine nerd and aggressively competitive at pickleball..." />
            </>
          )}

          {step === 2 && (
            <>
              <p className="font-body text-ink/70 leading-relaxed italic">
                Here&apos;s a secret most people get backwards: your brand isn&apos;t really about you —
                it&apos;s about the person you serve. They&apos;re the hero of the story. You&apos;re the
                guide who helps them win. Let&apos;s get crystal clear on who they are.
              </p>
              <Field {...f('hero')} label="Who is the person you most want to help?"
                help="Picture one real person, not a demographic. The more specific you get, the stronger your brand becomes."
                placeholder="She's a coach in her late 30s who's brilliant at what she does but invisible online..." />
              <Field {...f('want')} label="What do they want?"
                help="What are they actively trying to achieve or become?"
                placeholder="She wants to be seen as the go-to expert in her field..." />
              <Field {...f('externalProblem')} label="What problem do you solve for them — the obvious one?"
                help="The visible, practical problem. The thing they'd name out loud."
                placeholder="Her website and social media don't reflect how good she actually is..." />
              <Field {...f('internalProblem')} label="And how does that problem make them feel?"
                help="The deeper, internal struggle underneath the surface problem. This is where real connection lives."
                placeholder="She feels like a fraud — like everyone else figured out this 'visibility' thing and she missed the memo..." />
              <Field {...f('stakes')} label="What's at stake if nothing changes?"
                help="What does it cost them to stay stuck? What do they miss out on?"
                placeholder="She keeps watching less-talented people get the clients and recognition..." />
              <Field {...f('after')} label="What does their life look like after working with you?"
                help="Paint the transformation. Who do they become? How do they feel?"
                placeholder="She finally has a brand that looks as good as her work is. Clients find her and trust her before the first call..." />
            </>
          )}

          {step === 3 && (
            <>
              <p className="font-body text-ink/70 leading-relaxed italic">
                Your voice is your personality made visible in words. The test: could someone read your
                content with your name removed and still know it&apos;s you? Let&apos;s find that voice.
              </p>
              <Field {...f('personalityWords')} label="Pick a few words that describe your brand personality." rows={2}
                help="Not what sounds good — what's actually true to how you show up. Three to five words."
                placeholder="Warm, direct, a little irreverent, deeply encouraging..." />
              <Field {...f('textingFriend')} label="Text a friend about what you do — for real." rows={5}
                help="Imagine a good friend just asked 'wait, what do you actually do?' Type your reply exactly how you'd text it — casual, real, however you actually talk. Don't clean it up."
                placeholder="ok so basically i help people who are amazing at their job but terrible at talking about themselves lol..." />
              <Field {...f('standAgainst')} label="What do you stand against?"
                help="Every strong brand has an enemy — not a person, but an idea or a broken way of doing things. What do you push back on?"
                placeholder="I stand against the idea that you have to be loud or fake to be visible..." />
              <Field {...f('existingContent')} label="Paste a piece of content you've written that felt like you." rows={5}
                help="A post, email, caption, anything that sounded authentically like you. If you don't have one, skip it."
                placeholder="Paste anything here, or leave blank..." />
            </>
          )}

          {step === 4 && (
            <>
              <p className="font-body text-ink/70 leading-relaxed italic">
                Let&apos;s look forward for a moment. Your brand isn&apos;t just where you&apos;ve been —
                it&apos;s where you&apos;re going. Your goals shape the look, the content, and everything
                we build from here.
              </p>
              <Field {...f('howSeen')} label="How do you want to be seen in your industry?"
                help="When people in your field think of you, what do you want them to think? What do you want to be known for?"
                placeholder="I want to be the go-to interior designer for warm, livable homes — known for spaces that feel collected, not staged..." />
              <Field {...f('accomplish')} label="What do you want to accomplish?"
                help="Think near-term and long-term. Goals, dreams, the big vision — revenue, reach, impact, lifestyle."
                placeholder="In the next year: a fully booked client roster and a waitlist. Long-term: a book, a podcast, and speaking on bigger stages..." />
              <Field {...f('horizon')} label="Is there anything specific on the horizon?" rows={3}
                help="A launch, a milestone, a pivot, a big goal with a date on it? This helps us plan your visuals and content around what's coming."
                placeholder="I'm launching a group program in the fall and celebrating 10 years in business next spring..." />
            </>
          )}

          {step === 5 && (
            <>
              <p className="font-body text-ink/70 leading-relaxed italic">
                Now the look and feel. Voice comes before visuals — which is why we did that first. Your
                style should express the brand we&apos;ve already uncovered.
              </p>

              {hasBrand === null && (
                <div className="space-y-4">
                  <p className="font-body text-ink font-bold">
                    Do you already have brand visuals (logo, colors, website), or are you starting fresh?
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={() => setHasBrand('existing')}
                      className="btn-emboss flex-1 px-6 py-4 rounded-xl bg-bone border border-ink/20 text-ink font-body font-medium">
                      I have an existing brand
                    </button>
                    <button onClick={() => setHasBrand('fresh')}
                      className="btn-emboss flex-1 px-6 py-4 rounded-xl bg-bone border border-ink/20 text-ink font-body font-medium">
                      I&apos;m starting fresh
                    </button>
                  </div>
                </div>
              )}

              {hasBrand === 'existing' && (
                <>
                  <button onClick={() => setHasBrand(null)} className="text-sm text-emerald font-body underline">← switch answer</button>
                  <Field {...f('existingDescribe')} label="Describe your current brand."
                    help="Colors, fonts, overall vibe, where it lives. Drop links if you have them."
                    placeholder="Warm neutrals, a serif logo, my website is at..." />
                  <Field {...f('existingWorking')} label="What's working about it?"
                    help="What do you love? What gets compliments?"
                    placeholder="People always say my photos feel warm and approachable..." />
                  <Field {...f('existingNotWorking')} label="What feels off, or could be stronger?"
                    help="Be honest. Where does it fall short of how good you actually are?"
                    placeholder="My logo feels dated and my colors don't feel like 'me' anymore..." />
                </>
              )}

              {hasBrand === 'fresh' && (
                <>
                  <button onClick={() => setHasBrand(null)} className="text-sm text-emerald font-body underline">← switch answer</button>
                  <Field {...f('brandReferences')} label="Whose brand or aesthetic do you admire?"
                    help="Brands, people, accounts — in any industry. What draws you to them?"
                    placeholder="I love the warmth of Magnolia, the editorial feel of Kinfolk, the boldness of Glossier..." />
                  <Field {...f('hospitality')} label="If your brand were a hotel or restaurant, what would it be?"
                    help="This unlocks a feeling fast. A cozy wine bar? A sleek minimalist spa? A sunlit coastal cafe?"
                    placeholder="A sun-drenched Mediterranean villa — relaxed but elevated..." />
                  <Field {...f('colors')} label="What colors feel most like you?" rows={2}
                    help="Go with your gut. What would you wear, decorate with, be drawn to in a store?"
                    placeholder="Warm terracotta, deep forest green, soft cream, a little gold..." />
                </>
              )}

              <Field {...f('wardrobe')} label="How would you describe your personal style?"
                help="What you wear, how you present yourself. This shapes your photography and overall vibe."
                placeholder="Elevated casual — great denim, neutral knits, gold jewelry, never fussy..." />
              <Field {...f('spaces')} label="What spaces or settings feel like you?"
                help="Where do you feel most yourself? This helps us plan where and how you show up visually."
                placeholder="Bright, plant-filled rooms, coffee shops with character, anywhere near the water..." />
            </>
          )}

          {step === 6 && (
            <>
              <div className="font-body text-ink/70 leading-relaxed italic space-y-3">
                <p>
                  One more thing before we talk photos — and this matters. A lot of people (especially
                  women) feel uncomfortable being in front of the camera. They worry it&apos;s vain,
                  &quot;look at me.&quot;
                </p>
                <p>
                  It isn&apos;t. Your photoshoot isn&apos;t about you. It&apos;s about showing up
                  <em> for</em> the people who need what you have — so they can find you, trust you, and
                  let you help them. Being visible is an act of service. Let&apos;s make it feel like you.
                </p>
              </div>
              <Field {...f('cameraComfort')} label="How do you feel about being photographed?" rows={3}
                help="Totally honest. Love it? Dread it? Somewhere in between? There's no wrong answer."
                placeholder="Honestly it makes me nervous. I never know what to do with my hands..." />
              <Field {...f('workday')} label="Walk me through a real workday."
                help="What do you actually do, hour to hour? The little rituals and tools are gold for authentic photos."
                placeholder="I start with coffee and journaling, then client calls in the morning, editing with my dog at my feet..." />
              <Field {...f('props')} label="What objects or props represent your work?" rows={2}
                help="The tools of your trade, things you're always holding, items that tell your story."
                placeholder="My camera, a worn leather journal, my favorite mug, fresh flowers..." />
              <Field {...f('specificShots')} label="Any specific shots or images you know you need?"
                help="Think about what's coming up — a launch, an event, an anniversary, a new service to promote."
                placeholder="A new offer launching this spring, my 10-year business anniversary, headshots for a podcast tour..." />
              <Field {...f('avoid')} label="Anything you want to avoid?" rows={2}
                help="Be honest — angles, sides, or styles you don't love. Maybe a profile you hate, a pose that feels unnatural."
                placeholder="Please not my left profile, nothing too posed or corporate..." />
              <Field {...f('anythingElse')} label="Anything else you want to add?" rows={4}
                help="This is your space. Is there anything we didn't ask that you think we should know? Sometimes the last thing you share is the most important."
                placeholder="Honestly, the thing that matters most to me is..." />
            </>
          )}

        </div>

        <div className="flex justify-between mt-8">
          <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
            className="btn-emboss px-6 py-3 rounded-full border border-ink/20 bg-bone text-ink font-body font-medium disabled:opacity-30">
            Back
          </button>
          {step < sections.length ? (
            <button onClick={() => setStep(s => s + 1)}
              className="btn-emboss px-6 py-3 rounded-full bg-coral text-bone font-body font-medium">
              {step === 0 ? 'Begin' : 'Next'}
            </button>
          ) : (
            <button onClick={generateBrief} disabled={generating}
              className="btn-emboss px-6 py-3 rounded-full bg-emerald text-bone font-body font-bold disabled:opacity-50">
              {generating ? 'Creating your brief…' : 'Generate My Brand Brief →'}
            </button>
          )}
        </div>

      </div>
    </main>
  )
}
