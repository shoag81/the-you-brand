import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function generateCode(): string {
  return Math.random().toString(36).substring(2, 7).toUpperCase() +
    '-' + Math.random().toString(36).substring(2, 7).toUpperCase()
}

async function provisionCodes(studioId: string, count: number) {
  const codes = Array.from({ length: count }, () => ({
    studio_id: studioId,
    code: generateCode(),
    used: false,
  }))
  await supabase.from('studio_codes').insert(codes)
}

export async function POST(req: NextRequest) {
  const stripe = getStripe()
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') ?? ''

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature error:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as import('stripe').Stripe.Checkout.Session
    const studioId = session.metadata?.studioId
    if (!studioId) return NextResponse.json({ ok: true })

    // Save stripe_customer_id on studio for future auto-refill
    if (session.customer) {
      await supabase
        .from('studios')
        .update({ stripe_customer_id: session.customer as string })
        .eq('id', studioId)
    }

    await provisionCodes(studioId, 5)
    console.log(`Provisioned 5 codes for studio ${studioId}`)
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as import('stripe').Stripe.PaymentIntent
    // Auto-refill payments triggered in generate-brief
    const studioId = pi.metadata?.autoRefillStudioId
    if (studioId) {
      await provisionCodes(studioId, 5)
      console.log(`Auto-refill: provisioned 5 codes for studio ${studioId}`)

      // Notify studio by email
      if (process.env.RESEND_API_KEY) {
        try {
          const { data: studio } = await supabase
            .from('studios')
            .select('email, business_name')
            .eq('id', studioId)
            .single()
          if (studio?.email) {
            const resend = new Resend(process.env.RESEND_API_KEY)
            // TODO: switch to hello@theyoubrand.ai once verified in Resend
            await resend.emails.send({
              from: 'The You Brand <onboarding@resend.dev>',
              to: studio.email,
              subject: '5 new client codes added to your studio',
              html: `<p>Hi ${studio.business_name},</p><p>Your auto-refill ran — 5 new client codes are ready in your <a href="https://theyoubrand.ai/studio/dashboard?id=${studioId}">studio dashboard</a>.</p>`,
            })
          }
        } catch (e) {
          console.error('Auto-refill email error:', e)
        }
      }
    }
  }

  return NextResponse.json({ ok: true })
}
