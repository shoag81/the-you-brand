'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const inputClass =
  'w-full border border-black/10 rounded-xl p-4 text-ink bg-white/70 font-body focus:outline-none focus:border-emerald'
const labelClass = 'block text-base font-bold text-ink mb-1 font-body'
const helpClass = 'text-sm text-ink/60 mb-3 font-body'

export default function StudioSignup() {
  const [businessName, setBusinessName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!businessName.trim() || !email.trim()) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { data, error: dbErr } = await supabase
        .from('studios')
        .insert({ business_name: businessName.trim(), email: email.trim() })
        .select('id')
        .single()

      if (dbErr) throw dbErr

      // Redirect to buy first pack of codes
      const res = await fetch('/api/studio-buy-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studioId: data.id, origin: window.location.origin }),
      })
      const { url, error: checkoutErr } = await res.json()
      if (checkoutErr || !url) throw new Error(checkoutErr || 'Checkout failed')
      window.location.href = url
    } catch (err: unknown) {
      console.error(err)
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  if (done) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-3xl font-extrabold text-ink font-display">You&apos;re in.</h1>
          <p className="font-body text-ink/70">Check your email for your studio dashboard link.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="max-w-xl mx-auto">
        <h1 className="text-4xl font-extrabold text-ink font-display mb-2">Studio signup</h1>
        <p className="font-body text-ink/70 mb-10">
          Get a pack of 5 client codes for $395. Each code gives one client access to their full You Brand brief, logos, and mood board.
        </p>

        <form onSubmit={handleSubmit} className="bg-bone/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg space-y-6">
          <div>
            <label className={labelClass}>Studio or business name</label>
            <p className={helpClass}>How your studio will appear in client emails.</p>
            <input className={inputClass} placeholder="Bloom Creative Studio"
              value={businessName} onChange={e => setBusinessName(e.target.value)} required />
          </div>
          <div>
            <label className={labelClass}>Your email address</label>
            <p className={helpClass}>We&apos;ll send code-refill notifications here.</p>
            <input className={inputClass} type="email" placeholder="hello@yourstudio.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          {error && <p className="text-red-600 font-body text-sm">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full btn-emboss px-6 py-4 rounded-full bg-emerald text-bone font-body font-bold disabled:opacity-50">
            {loading ? 'Setting up…' : 'Get 5 Client Codes — $395 →'}
          </button>
        </form>
      </div>
    </main>
  )
}
