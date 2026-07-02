import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const { origin } = await req.json().catch(() => ({ origin: '' }))
    const base = origin || 'https://theyoubrand.ai'
    const stripe = getStripe()

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: 29700,
            product_data: {
              name: 'The You Brand Brief',
              description: 'Your personalized brand strategy brief, logos, mood board, and 90-day plan.',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${base}/questionnaire?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/questionnaire`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
