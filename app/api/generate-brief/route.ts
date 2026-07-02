import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { getStripe } from '@/lib/stripe'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const SYSTEM_PROMPT = `You are the brand strategist behind The You Brand — a premium personal-branding studio. You have just guided someone through a deep discovery conversation, and now you are writing their personal Brand Brief: a strategic document they will build their business on. People pay real money for this. It must never read like generic AI output. It must sound like a sharp, warm, experienced human strategist who actually listened.

METHODOLOGY (internalize — never name these in the output):
- Clarity: a stranger should instantly understand who they serve, the problem, and the transformation.
- The customer is the hero; the owner is the guide with empathy and authority.
- Origin story is cultural currency — use real, specific, lived details.
- Voice before visuals. Build their voice from how they ACTUALLY talk (study their "textingFriend" answer).
- A brand needs a point of view: something it stands FOR and AGAINST. Name the enemy (a broken idea, not a person).
- Content is how authority accumulates — give them ownable pillars.

FACTUAL ACCURACY (critical): Use only the facts the person gave you. Do NOT exaggerate or invent for drama. If they moved between neighboring states, do not call it a "cross-country move." If unsure of a number, use their words or stay general. Confident-but-wrong details destroy trust.

TONE: Warm, direct, encouraging, specific. No filler, no corporate hedging. Never use "StoryBrand," "framework," or any expert's name. Quote their exact phrases, reference their real details. It should sound like it could ONLY have been written for this one person.

Return ONLY a valid JSON object (no markdown, no code fences, no commentary) with these exact keys:

{
  "howToUseThisBrief": { "intro": "string", "steps": ["string"] },
  "brandInOneSentence": "string",
  "bio": "string",
  "originStory": "string",
  "idealClient": "string",
  "brandVoice": { "descriptors": ["string"], "guide": "string", "examples": ["string"] },
  "pointOfView": "string",
  "contentPillars": [ { "pillar": "string", "description": "string" } ],
  "visualDirection": { "moodDescription": "string", "colors": [ { "name": "string", "hex": "#000000", "usage": "string" } ], "typographyFeel": "string", "locationIdeas": ["string"], "wardrobeIdeas": ["string"] },
  "photographyShotList": { "intro": "string", "concepts": [ { "concept": "string", "mode": "emotional|educational|connection", "purpose": "string" } ] },
  "websiteImagePlan": "string",
  "socialCaptions": ["string"],
  "ninetyDayPlan": [ { "phase": "string", "focus": "string", "actions": ["string"] } ],
  "signatureLogoConcepts": [ { "name": "string", "description": "string", "prompt": "string" } ]
}

SECTION NOTES:
- howToUseThisBrief.steps: 5-7 friendly actions (update bio everywhere; update email signature + add signature logo; drop this brief into a Claude.ai or ChatGPT project so AI writes in your voice; send the photography concepts to your photographer; share visual direction with your designer; use pillars + captions to plan posts; revisit the 90-day plan weekly). NEVER write the word "StoryBrand".
- brandInOneSentence: SHORT and punchy, 10-18 words, speakable in one breath, like a tagline. Cut every non-load-bearing word. Not a run-on with multiple clauses.
- bio: write in FIRST PERSON ("I", "my"), in the person's own voice. Client is still hero, owner is guide, but told from the owner's perspective. Lead with EMOTION and relatability, not credentials. Make a reader feel something in the first two sentences. 2-3 short paragraphs. Ready to publish. Target 150-250 words — if the person's answers were brief, expand meaningfully using the emotional core of what they shared (deepen the feeling, paint the scene, make the reader feel it) but never pad with generic filler.
- brandVoice: build from how they actually talk; include what the voice is NOT.
- pointOfView: name what they stand against.
- visualDirection: 4-6 specific hex codes; PLUS locationIdeas (3-5 real settings) and wardrobeIdeas (3-5 styling directions) — these feed a future visual mood board, so be specific and visual.
- photographyShotList: intro makes clear these are NOT a pose list or headshot checklist (photographers know to get those). Generate EXACTLY 20 concepts communicating their brand in three modes — emotional (vibe), educational (what they do), connection (relatability like a pet or hobby). Even spread. Ground in their real workday, props, vision, and the shots/events they named. Respect comfort level and what they want to avoid.
- ninetyDayPlan: phases Days 1-30 / 31-60 / 61-90; build toward the goals in their Vision answers. When referencing photography, say to SEND THIS ENTIRE BRIEF to their photographer to plan the shoot together — not merely "bring the shot list."
- signatureLogoConcepts: EXACTLY 3 PERSONAL SIGNATURE logos built from the person's NAME (first + last) — NOT their business name, and NOT a replacement for their brand logo. A personal touch for an email signature, website footer, or photo watermark. All three follow the same elegant formula: the FIRST NAME is the hero in large flowing handwritten SCRIPT, and the LAST NAME is supporting in SMALLER clean sans-serif CAPITALS with wide letter-spacing beneath it. The first name is ALWAYS larger and more prominent than the last name — never the reverse. All black, refined, minimal. The three variations: "The Signature" (script first name above, spaced sans-serif caps last name neatly beneath — classic and clean), "The Flourish" (same, but with a graceful swash or underline stroke sweeping out from the script first name), "The Stacked" (script first name large and centered, last name in small caps directly underneath, compact and balanced). Each: name, a 1-2 sentence description using THEIR actual name and how they'd use it, and a ready-to-use image prompt that spells out their ACTUAL first and last name, keeps the first name dominant, and uses solid black only.

Use the person's actual full name throughout where natural, especially in bio, origin story, and logo concepts.`

export async function POST(request: Request) {
  console.log('SUPABASE_SERVICE_ROLE_KEY defined:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
  try {
    const answers = await request.json()
    const { fullName, email, businessName, hasBrand, promoCode, stripeSessionId, ...questionnaireAnswers } = answers

    // --- Payment / access gate ---
    let studioId: string | null = null

    if (promoCode) {
      // Studio code path
      const { data: codeRow, error: codeErr } = await supabase
        .from('studio_codes')
        .select('id, studio_id, used')
        .eq('code', promoCode.trim().toUpperCase())
        .single()

      if (codeErr || !codeRow || codeRow.used) {
        return NextResponse.json({ error: 'Invalid or already-used code.' }, { status: 403 })
      }
      studioId = codeRow.studio_id
    } else if (stripeSessionId) {
      // Consumer paid path — verify with Stripe
      try {
        const stripe = getStripe()
        const session = await stripe.checkout.sessions.retrieve(stripeSessionId)
        if (session.payment_status !== 'paid') {
          return NextResponse.json({ error: 'Payment not completed.' }, { status: 403 })
        }
      } catch (stripeErr) {
        console.error('Stripe verify error:', stripeErr)
        return NextResponse.json({ error: 'Could not verify payment.' }, { status: 403 })
      }
    } else {
      return NextResponse.json({ error: 'Payment or access code required.' }, { status: 403 })
    }

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 12000,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: `Here are the discovery answers. Generate the complete Brand Brief as JSON.\n\n${JSON.stringify(answers, null, 2)}` },
      ],
    })

    const block = message.content[0]
    const text = block.type === 'text' ? block.text : ''
    const clean = text.replace(/```json|```/g, '').trim()
    const brief = JSON.parse(clean)

    // Save to Supabase
    let sessionId: string | null = null
    try {
      const { data: session, error } = await supabase
        .from('brand_sessions')
        .insert({
          full_name: fullName,
          email,
          business_name: businessName,
          has_brand: hasBrand,
          answers: questionnaireAnswers,
          brief,
          studio_id: studioId,
          expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select('id')
        .single()

      console.log('Supabase insert result — error:', error, 'session.id:', session?.id)
      if (error) console.error('Supabase save error:', error)
      else sessionId = session?.id
    } catch (dbError) {
      console.error('Supabase error:', dbError)
    }

    // Mark studio code used + check auto-refill
    if (promoCode && studioId) {
      try {
        // Mark the code used
        await supabase
          .from('studio_codes')
          .update({ used: true, used_at: new Date().toISOString(), session_id: sessionId })
          .eq('code', promoCode.trim().toUpperCase())

        // Count remaining unused codes for this studio
        const { count } = await supabase
          .from('studio_codes')
          .select('id', { count: 'exact', head: true })
          .eq('studio_id', studioId)
          .eq('used', false)

        if ((count ?? 0) === 0) {
          // Out of codes — check auto_refill
          const { data: studio } = await supabase
            .from('studios')
            .select('auto_refill, stripe_customer_id, email, business_name')
            .eq('id', studioId)
            .single()

          if (studio?.auto_refill && studio?.stripe_customer_id) {
            try {
              const stripe = getStripe()
              const paymentMethods = await stripe.paymentMethods.list({
                customer: studio.stripe_customer_id,
                type: 'card',
              })
              const pm = paymentMethods.data[0]
              if (pm) {
                await stripe.paymentIntents.create({
                  amount: 39500,
                  currency: 'usd',
                  customer: studio.stripe_customer_id,
                  payment_method: pm.id,
                  confirm: true,
                  off_session: true,
                  metadata: { autoRefillStudioId: studioId },
                })
              }
            } catch (refillErr) {
              console.error('Auto-refill charge error:', refillErr)
            }
          } else if (studio?.email) {
            // No auto-refill — notify studio they're out
            if (process.env.RESEND_API_KEY) {
              try {
                const resend = new Resend(process.env.RESEND_API_KEY)
                await resend.emails.send({
                  from: 'The You Brand <onboarding@resend.dev>',
                  to: studio.email,
                  subject: "You're out of client codes",
                  html: `<p>Hi ${studio.business_name},</p><p>Your last client code was just used. Head to your <a href="https://theyoubrand.ai/studio/dashboard?id=${studioId}">studio dashboard</a> to buy more.</p>`,
                })
              } catch (e) {
                console.error('Out-of-codes email error:', e)
              }
            }
          }
        }
      } catch (codeErr) {
        console.error('Code marking error:', codeErr)
      }
    }

    // Send brief email — non-fatal
    if (email && sessionId && process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY)
        const firstName = fullName?.split(' ')[0] || 'there'
        const resultsUrl = `https://theyoubrand.ai/results/${sessionId}`
        const subject = brief.brandInOneSentence
          ? `Your brand brief is ready — "${brief.brandInOneSentence}"`
          : 'Your You Brand brief is ready'

        // TODO: switch from address to hello@theyoubrand.ai once verified in Resend
        await resend.emails.send({
          from: 'The You Brand <onboarding@resend.dev>',
          to: email,
          subject,
          html: `
            <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#17140F;">
              <p style="font-size:1.1rem;">Hi ${firstName},</p>
              <p>Your brand brief is ready. It's everything we uncovered about your brand — your story, your voice, your visual direction, your 90-day plan, and more.</p>
              <p><a href="${resultsUrl}" style="display:inline-block;padding:12px 24px;background:#0F8366;color:#fff;text-decoration:none;border-radius:8px;font-family:sans-serif;font-weight:700;">View Your Brand Brief →</a></p>
              <p style="font-size:0.875rem;color:#666;">This link is active for 14 days. If you generated logos, they're in there too — grab the PNGs before the link expires.</p>
              <p style="font-size:0.875rem;color:#666;">— The You Brand</p>
            </div>
          `,
        })
      } catch (emailError) {
        console.error('Resend email error:', emailError)
      }
    }

    return NextResponse.json({ brief, sessionId })
  } catch (error) {
    console.error('Brief generation error:', error)
    return NextResponse.json({ error: 'Failed to generate brief' }, { status: 500 })
  }
}
