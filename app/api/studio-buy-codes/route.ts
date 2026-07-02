import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const { studioId, origin } = await req.json()
    if (!studioId) return NextResponse.json({ error: 'studioId required' }, { status: 400 })

    const base = origin || 'https://theyoubrand.ai'
    const stripe = getStripe()

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_intent_data: { setup_future_usage: 'off_session' },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: 39500,
            product_data: {
              name: 'Studio Code Pack — 5 Brand Briefs',
              description: '5 single-use client codes for The You Brand. Auto-refill available.',
            },
          },
          quantity: 1,
        },
      ],
      metadata: { studioId },
      success_url: `${base}/studio/dashboard?id=${studioId}&purchased=1`,
      cancel_url: `${base}/studio/dashboard?id=${studioId}`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Studio checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
