'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Studio {
  id: string
  business_name: string
  email: string
  auto_refill: boolean
  stripe_customer_id: string | null
}

interface Code {
  id: string
  code: string
  used: boolean
  used_at: string | null
}

export default function StudioDashboard() {
  const [studioId, setStudioId] = useState<string | null>(null)
  const [studio, setStudio] = useState<Studio | null>(null)
  const [codes, setCodes] = useState<Code[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [buyingCodes, setBuyingCodes] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [togglingRefill, setTogglingRefill] = useState(false)

  const loadData = useCallback(async (id: string) => {
    setLoading(true)
    const [{ data: studioData, error: studioErr }, { data: codesData, error: codesErr }] = await Promise.all([
      supabase.from('studios').select('id, business_name, email, auto_refill, stripe_customer_id').eq('id', id).single(),
      supabase.from('studio_codes').select('id, code, used, used_at').eq('studio_id', id).order('used').order('id'),
    ])
    if (studioErr || !studioData) { setError('Studio not found.'); setLoading(false); return }
    setStudio(studioData)
    setCodes(codesData ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('id')
    if (!id) { setError('No studio ID in URL.'); setLoading(false); return }
    setStudioId(id)
    loadData(id)
  }, [loadData])

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const buyCodes = async () => {
    if (!studioId) return
    setBuyingCodes(true)
    try {
      const res = await fetch('/api/studio-buy-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studioId, origin: window.location.origin }),
      })
      const { url, error: err } = await res.json()
      if (err || !url) { alert(err || 'Checkout failed'); return }
      window.location.href = url
    } finally {
      setBuyingCodes(false)
    }
  }

  const toggleAutoRefill = async () => {
    if (!studio || !studioId) return
    setTogglingRefill(true)
    const newVal = !studio.auto_refill
    await supabase.from('studios').update({ auto_refill: newVal }).eq('id', studioId)
    setStudio(prev => prev ? { ...prev, auto_refill: newVal } : prev)
    setTogglingRefill(false)
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="font-body text-ink/60">Loading…</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <p className="font-body text-red-600">{error}</p>
      </main>
    )
  }

  const unused = codes.filter(c => !c.used)
  const used = codes.filter(c => c.used)

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="max-w-2xl mx-auto space-y-10">

        <div>
          <h1 className="text-4xl font-extrabold text-ink font-display mb-1">{studio?.business_name}</h1>
          <p className="font-body text-ink/60">{studio?.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-bone/80 rounded-2xl p-6 shadow text-center">
            <p className="text-4xl font-extrabold text-emerald font-display">{unused.length}</p>
            <p className="font-body text-ink/60 text-sm mt-1">codes remaining</p>
          </div>
          <div className="bg-bone/80 rounded-2xl p-6 shadow text-center">
            <p className="text-4xl font-extrabold text-ink font-display">{used.length}</p>
            <p className="font-body text-ink/60 text-sm mt-1">clients served</p>
          </div>
        </div>

        {/* Buy more */}
        <div className="bg-bone/80 rounded-2xl p-6 shadow space-y-4">
          <h2 className="font-display font-bold text-xl text-ink">Get more codes</h2>
          <p className="font-body text-ink/70 text-sm">5 codes for $395. Each code is single-use.</p>
          <button onClick={buyCodes} disabled={buyingCodes}
            className="btn-emboss px-6 py-3 rounded-full bg-emerald text-bone font-body font-bold disabled:opacity-50">
            {buyingCodes ? 'Redirecting…' : 'Buy 5 Codes — $395'}
          </button>

          {studio?.stripe_customer_id && (
            <div className="flex items-center gap-3 pt-2">
              <button onClick={toggleAutoRefill} disabled={togglingRefill}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${studio.auto_refill ? 'bg-emerald' : 'bg-black/20'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${studio.auto_refill ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className="font-body text-sm text-ink">
                Auto-refill {studio.auto_refill ? 'on' : 'off'} — automatically buy 5 more when you run out
              </span>
            </div>
          )}
        </div>

        {/* Unused codes */}
        {unused.length > 0 && (
          <div className="bg-bone/80 rounded-2xl p-6 shadow space-y-4">
            <h2 className="font-display font-bold text-xl text-ink">Your codes</h2>
            <p className="font-body text-sm text-ink/60">Share these with clients — each is single-use.</p>
            <div className="space-y-2">
              {unused.map(c => (
                <div key={c.id} className="flex items-center justify-between bg-white/60 rounded-xl px-4 py-3">
                  <span className="font-mono font-bold text-ink tracking-widest">{c.code}</span>
                  <button onClick={() => copyCode(c.code)}
                    className="text-sm font-body text-emerald underline underline-offset-2">
                    {copiedCode === c.code ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Used codes */}
        {used.length > 0 && (
          <div className="bg-bone/80 rounded-2xl p-6 shadow space-y-4">
            <h2 className="font-display font-bold text-xl text-ink">Used codes</h2>
            <div className="space-y-2">
              {used.map(c => (
                <div key={c.id} className="flex items-center justify-between bg-white/40 rounded-xl px-4 py-3 opacity-60">
                  <span className="font-mono text-ink tracking-widest line-through">{c.code}</span>
                  <span className="text-xs font-body text-ink/50">
                    {c.used_at ? new Date(c.used_at).toLocaleDateString() : 'used'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
