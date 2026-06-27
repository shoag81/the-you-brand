'use client'

type Brief = {
  howToUseThisBrief?: { intro?: string; steps?: string[] }
  brandInOneSentence?: string
  bio?: string
  originStory?: string
  idealClient?: string
  brandVoice?: { descriptors?: string[]; guide?: string; examples?: string[] }
  pointOfView?: string
  contentPillars?: { pillar?: string; description?: string }[]
  visualDirection?: {
    moodDescription?: string
    colors?: { name?: string; hex?: string; usage?: string }[]
    typographyFeel?: string
    locationIdeas?: string[]
    wardrobeIdeas?: string[]
  }
  photographyShotList?: {
    intro?: string
    concepts?: { concept?: string; mode?: string; purpose?: string }[]
  }
  websiteImagePlan?: string
  socialCaptions?: string[]
  ninetyDayPlan?: { phase?: string; focus?: string; actions?: string[] }[]
  signatureLogoConcepts?: { name?: string; description?: string; prompt?: string }[]
}

const paras = (text?: string) =>
  (text || '').split('\n').filter(Boolean).map((p, i) => (
    <p key={i} className="font-body text-ink/85 leading-relaxed mb-3 last:mb-0">{p}</p>
  ))

function Section({ number, title, children }:
  { number: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <div className="flex items-baseline gap-3 mb-4">
        <span className="font-body text-sm font-bold text-coral tracking-widest">{number}</span>
        <h2 className="font-display text-2xl md:text-3xl font-extrabold text-ink">{title}</h2>
      </div>
      <div className="bg-bone/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg">
        {children}
      </div>
    </section>
  )
}

const modeStyle: Record<string, string> = {
  emotional: 'bg-blush/40 text-ink',
  educational: 'bg-emerald/15 text-emerald',
  connection: 'bg-golden/30 text-ink',
}

export default function BrandBrief({ brief, name, onBack }:
  { brief: Brief; name?: string; onBack: () => void }) {
  return (
    <main className="min-h-screen px-6 py-12">
      <div className="max-w-3xl mx-auto">

        <div className="text-center mb-12">
          <p className="font-body text-emerald tracking-widest text-sm mb-3">YOUR BRAND BRIEF</p>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-ink leading-tight">
            {name ? `${name}, this is the` : 'This is the'}{' '}
            <span className="italic text-coral">you</span> brand.
          </h1>
        </div>

        {brief.brandInOneSentence && (
          <div className="bg-ink rounded-2xl p-8 md:p-10 mb-12 shadow-lg">
            <p className="font-body text-xs tracking-widest text-golden mb-3">YOUR BRAND IN ONE SENTENCE</p>
            <p className="font-display text-xl md:text-2xl text-bone leading-snug">
              {brief.brandInOneSentence}
            </p>
          </div>
        )}

        {brief.howToUseThisBrief && (
          <Section number="00" title="How to Use This Brief">
            {paras(brief.howToUseThisBrief.intro)}
            <ul className="mt-4 space-y-3">
              {brief.howToUseThisBrief.steps?.map((s, i) => (
                <li key={i} className="flex gap-3 font-body text-ink/85 leading-relaxed">
                  <span className="font-bold text-coral shrink-0">{i + 1}.</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {brief.bio && (
          <Section number="01" title="Your Bio">{paras(brief.bio)}</Section>
        )}

        {brief.originStory && (
          <Section number="02" title="Your Origin Story">{paras(brief.originStory)}</Section>
        )}

        {brief.idealClient && (
          <Section number="03" title="Your Ideal Client">{paras(brief.idealClient)}</Section>
        )}

        {brief.brandVoice && (
          <Section number="04" title="Your Brand Voice">
            {brief.brandVoice.descriptors && (
              <div className="flex flex-wrap gap-2 mb-5">
                {brief.brandVoice.descriptors.map((d, i) => (
                  <span key={i} className="font-body text-sm bg-emerald/15 text-emerald rounded-full px-3 py-1">
                    {d}
                  </span>
                ))}
              </div>
            )}
            {paras(brief.brandVoice.guide)}
            {brief.brandVoice.examples && (
              <div className="mt-5 space-y-2">
                <p className="font-body text-xs tracking-widest text-ink/50">IN YOUR VOICE</p>
                {brief.brandVoice.examples.map((ex, i) => (
                  <p key={i} className="font-display italic text-ink/80 border-l-2 border-coral pl-4">
                    &ldquo;{ex}&rdquo;
                  </p>
                ))}
              </div>
            )}
          </Section>
        )}

        {brief.pointOfView && (
          <Section number="05" title="Your Point of View">{paras(brief.pointOfView)}</Section>
        )}

        {brief.contentPillars && (
          <Section number="06" title="Your Content Pillars">
            <div className="space-y-5">
              {brief.contentPillars.map((p, i) => (
                <div key={i}>
                  <h3 className="font-display text-lg font-bold text-ink mb-1">{p.pillar}</h3>
                  <p className="font-body text-ink/80 leading-relaxed">{p.description}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {brief.visualDirection && (
          <Section number="07" title="Your Visual Direction">
            {paras(brief.visualDirection.moodDescription)}
            {brief.visualDirection.colors && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-5">
                {brief.visualDirection.colors.map((c, i) => (
                  <div key={i} className="rounded-xl overflow-hidden border border-black/5">
                    <div className="h-16" style={{ backgroundColor: c.hex }} />
                    <div className="p-3 bg-white/60">
                      <p className="font-body text-sm font-bold text-ink">{c.name}</p>
                      <p className="font-body text-xs text-ink/50">{c.hex}</p>
                      <p className="font-body text-xs text-ink/70 mt-1 leading-snug">{c.usage}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {brief.visualDirection.typographyFeel && (
              <div className="mt-5">
                <p className="font-body text-xs tracking-widest text-ink/50 mb-1">TYPOGRAPHY</p>
                <p className="font-body text-ink/80 leading-relaxed">{brief.visualDirection.typographyFeel}</p>
              </div>
            )}
            {brief.visualDirection.locationIdeas && (
              <div className="mt-5">
                <p className="font-body text-xs tracking-widest text-ink/50 mb-2">LOCATION IDEAS</p>
                <div className="flex flex-wrap gap-2">
                  {brief.visualDirection.locationIdeas.map((l, i) => (
                    <span key={i} className="font-body text-sm bg-white/60 text-ink/80 rounded-full px-3 py-1">{l}</span>
                  ))}
                </div>
              </div>
            )}
            {brief.visualDirection.wardrobeIdeas && (
              <div className="mt-4">
                <p className="font-body text-xs tracking-widest text-ink/50 mb-2">WARDROBE & STYLING</p>
                <div className="flex flex-wrap gap-2">
                  {brief.visualDirection.wardrobeIdeas.map((w, i) => (
                    <span key={i} className="font-body text-sm bg-white/60 text-ink/80 rounded-full px-3 py-1">{w}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-5 rounded-xl bg-emerald/10 border border-emerald/20 p-4">
              <p className="font-body text-sm text-emerald leading-relaxed">
                A full visual mood board — your colors, locations, and styling rendered together — is coming soon as a downloadable board.
              </p>
            </div>
          </Section>
        )}

        {brief.photographyShotList && (
          <Section number="08" title="Your Photography Concepts">
            {paras(brief.photographyShotList.intro)}
            <div className="mt-5 space-y-4">
              {brief.photographyShotList.concepts?.map((c, i) => (
                <div key={i} className="border-b border-black/5 pb-4 last:border-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display text-lg font-bold text-ink">{c.concept}</h3>
                    {c.mode && (
                      <span className={`font-body text-xs rounded-full px-2 py-0.5 ${modeStyle[c.mode] || 'bg-ink/10 text-ink'}`}>
                        {c.mode}
                      </span>
                    )}
                  </div>
                  <p className="font-body text-ink/80 leading-relaxed">{c.purpose}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {brief.websiteImagePlan && (
          <Section number="09" title="Your Website Image Plan">{paras(brief.websiteImagePlan)}</Section>
        )}

        {brief.socialCaptions && (
          <Section number="10" title="Ready-to-Post Captions">
            <div className="space-y-4">
              {brief.socialCaptions.map((cap, i) => (
                <div key={i} className="bg-white/60 rounded-xl p-4 font-body text-ink/85 leading-relaxed whitespace-pre-wrap">
                  {cap}
                </div>
              ))}
            </div>
          </Section>
        )}

        {brief.ninetyDayPlan && (
          <Section number="11" title="Your 90-Day Plan">
            <div className="space-y-6">
              {brief.ninetyDayPlan.map((phase, i) => (
                <div key={i}>
                  <h3 className="font-display text-lg font-bold text-emerald mb-1">{phase.phase}</h3>
                  <p className="font-body text-ink/70 italic mb-3">{phase.focus}</p>
                  <ul className="space-y-2">
                    {phase.actions?.map((a, j) => (
                      <li key={j} className="flex gap-3 font-body text-ink/85 leading-relaxed">
                        <span className="text-coral shrink-0">→</span>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>
        )}

        {brief.signatureLogoConcepts && (
          <Section number="12" title="Signature Logo Concepts">
            <div className="space-y-6">
              {brief.signatureLogoConcepts.map((logo, i) => (
                <div key={i}>
                  <h3 className="font-display text-lg font-bold text-ink mb-1">{logo.name}</h3>
                  <p className="font-body text-ink/80 leading-relaxed mb-2">{logo.description}</p>
                  {logo.prompt && (
                    <div className="bg-white/60 rounded-xl p-3">
                      <p className="font-body text-xs tracking-widest text-ink/50 mb-1">AI IMAGE PROMPT</p>
                      <p className="font-body text-sm text-ink/70 leading-relaxed">{logo.prompt}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8 no-print">
          <button onClick={() => window.print()}
            className="btn-emboss px-6 py-3 rounded-full bg-emerald text-bone font-body font-bold">
            Download / Save as PDF
          </button>
          <button onClick={onBack}
            className="btn-emboss px-6 py-3 rounded-full border border-ink/20 bg-bone text-ink font-body font-medium">
            ← Back to questionnaire
          </button>
        </div>

      </div>
    </main>
  )
}