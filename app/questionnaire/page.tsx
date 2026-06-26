'use client'

import { useState, useEffect } from 'react'

const steps = [
  { number: 1, title: 'Your Story' },
  { number: 2, title: 'Your Personality' },
  { number: 3, title: 'Your Visual Style' },
  { number: 4, title: 'Your Content' },
  { number: 5, title: 'Your Goals' },
]

export default function Questionnaire() {
  const [currentStep, setCurrentStep] = useState(1)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStep])

  const update = (key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }))
  }

  const fieldClass =
    'w-full border border-black/10 rounded-xl p-4 text-ink bg-white/70 font-body focus:outline-none focus:border-emerald resize-none'
  const labelClass =
    'block text-sm font-bold text-ink uppercase tracking-wide mb-2 font-body'
  const helpClass = 'text-sm text-ink/60 mb-3 font-body'

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="max-w-2xl mx-auto">

        <h1 className="text-4xl font-extrabold text-ink mb-2 font-display">
          Discover the <span className="italic text-coral">you</span> brand.
        </h1>
        <p className="text-emerald mb-10 font-body">
          Step {currentStep} of {steps.length} — {steps[currentStep - 1].title}
        </p>

        <div className="w-full bg-black/10 rounded-full h-2 mb-10">
          <div
            className="bg-coral h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>

        <div className="bg-bone/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg space-y-8">

          {currentStep === 1 && (
            <>
              <div>
                <label className={labelClass}>What do you do?</label>
                <p className={helpClass}>Describe your work in plain language — not your job title, but what you actually help people with.</p>
                <textarea className={fieldClass} rows={3} placeholder="I help coaches build their online presence..." value={answers.whatYouDo || ''} onChange={e => update('whatYouDo', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Who do you serve?</label>
                <p className={helpClass}>Be specific. The more clearly you can picture one person, the stronger your brand will be.</p>
                <textarea className={fieldClass} rows={3} placeholder="Female entrepreneurs in their 30s and 40s..." value={answers.whoYouServe || ''} onChange={e => update('whoYouServe', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>What&apos;s your origin story?</label>
                <p className={helpClass}>What experience in your own life led you to this work? The more personal, the better.</p>
                <textarea className={fieldClass} rows={4} placeholder="After 10 years in corporate marketing, I burned out completely..." value={answers.originStory || ''} onChange={e => update('originStory', e.target.value)} />
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div>
                <label className={labelClass}>How would your best clients describe you?</label>
                <p className={helpClass}>Think about the words they actually use — in testimonials, texts, or conversations.</p>
                <textarea className={fieldClass} rows={3} placeholder="They say I'm direct but warm, like a best friend who also has an MBA..." value={answers.clientWords || ''} onChange={e => update('clientWords', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Pick 3 words that describe your brand personality.</label>
                <p className={helpClass}>Not what you think sounds good — what actually feels true to how you show up.</p>
                <textarea className={fieldClass} rows={2} placeholder="Bold, nurturing, no-fluff..." value={answers.personalityWords || ''} onChange={e => update('personalityWords', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>What do you stand against?</label>
                <p className={helpClass}>Every strong brand has an enemy — not a person, but an idea or a broken way of doing things. What&apos;s yours?</p>
                <textarea className={fieldClass} rows={3} placeholder="I stand against the idea that you have to choose between being authentic and being profitable..." value={answers.standAgainst || ''} onChange={e => update('standAgainst', e.target.value)} />
              </div>
            </>
          )}

          {currentStep === 3 && (
            <>
              <div>
                <label className={labelClass}>Describe your visual style in 3 words.</label>
                <p className={helpClass}>Think about the aesthetic you&apos;re drawn to — in design, fashion, interiors, anywhere.</p>
                <textarea className={fieldClass} rows={2} placeholder="Warm, editorial, minimal..." value={answers.visualWords || ''} onChange={e => update('visualWords', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Are there any brands, people, or accounts whose visual style you admire?</label>
                <p className={helpClass}>These don&apos;t have to be in your industry — just visuals that resonate with you.</p>
                <textarea className={fieldClass} rows={3} placeholder="I love the warmth of Anthropologie, the boldness of Glossier, and the editorial feel of The New York Times..." value={answers.visualInspo || ''} onChange={e => update('visualInspo', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>What colors feel most like you?</label>
                <p className={helpClass}>Don&apos;t overthink it — go with your gut. What colors would you wear, decorate with, or be drawn to in a store?</p>
                <textarea className={fieldClass} rows={2} placeholder="Warm terracotta, deep forest green, soft cream..." value={answers.colors || ''} onChange={e => update('colors', e.target.value)} />
              </div>
            </>
          )}

          {currentStep === 4 && (
            <>
              <div>
                <label className={labelClass}>What topics could you talk about forever?</label>
                <p className={helpClass}>These become your content pillars — the themes your brand will consistently show up around.</p>
                <textarea className={fieldClass} rows={3} placeholder="Building a business that fits your life, the psychology of pricing, what no one tells you about going solo..." value={answers.contentTopics || ''} onChange={e => update('contentTopics', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Where does your audience hang out online?</label>
                <p className={helpClass}>Where are they most likely to find you and engage with your content?</p>
                <textarea className={fieldClass} rows={2} placeholder="LinkedIn and Instagram mostly, some YouTube..." value={answers.platforms || ''} onChange={e => update('platforms', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>What&apos;s a piece of content you&apos;ve made that really resonated?</label>
                <p className={helpClass}>A post, email, talk, or conversation that people responded to strongly. What made it work?</p>
                <textarea className={fieldClass} rows={3} placeholder="I wrote a LinkedIn post about firing my biggest client and it got 50k views..." value={answers.bestContent || ''} onChange={e => update('bestContent', e.target.value)} />
              </div>
            </>
          )}

          {currentStep === 5 && (
            <>
              <div>
                <label className={labelClass}>What does success look like in 12 months?</label>
                <p className={helpClass}>Be specific and honest — revenue, clients, lifestyle, impact. What would make this year feel like a win?</p>
                <textarea className={fieldClass} rows={3} placeholder="10 retainer clients, a waitlist, and working 4 days a week..." value={answers.successVision || ''} onChange={e => update('successVision', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>What&apos;s the biggest thing holding your brand back right now?</label>
                <p className={helpClass}>Be honest. This helps us identify what your brand needs most.</p>
                <textarea className={fieldClass} rows={3} placeholder="I don't have a clear message. I can't explain what I do in a way that makes people want to hire me..." value={answers.biggestBlock || ''} onChange={e => update('biggestBlock', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Anything else you want your brand to know about you?</label>
                <p className={helpClass}>This is your space. Share anything — personal, professional, weird, wonderful. The unexpected details are often the most powerful.</p>
                <textarea className={fieldClass} rows={4} placeholder="I'm a mom of three, I trained as a chef before pivoting to business, I swear more than people expect..." value={answers.anythingElse || ''} onChange={e => update('anythingElse', e.target.value)} />
              </div>
            </>
          )}

        </div>

        <div className="flex justify-between mt-8">
          <button onClick={() => setCurrentStep(s => Math.max(1, s - 1))} disabled={currentStep === 1} className="btn-emboss px-6 py-3 rounded-full border border-ink/20 bg-bone text-ink font-body font-medium disabled:opacity-30">Back</button>
          {currentStep < steps.length ? (
            <button onClick={() => setCurrentStep(s => s + 1)} className="btn-emboss px-6 py-3 rounded-full bg-coral text-bone font-body font-medium">Next</button>
          ) : (
            <button className="btn-emboss px-6 py-3 rounded-full bg-emerald text-bone font-body font-bold">Generate My Brand Brief →</button>
          )}
        </div>

      </div>
    </main>
  )
}