import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { type, name, style } = await request.json()
    // type: 'signature' | 'monogram'
    // name: full name string
    // style: { typographyFeel, wardrobeIdeas, moodDescription }

    if (!name) {
      return NextResponse.json({ error: 'No name provided' }, { status: 400 })
    }

    const parts = name.trim().split(/\s+/)
    const first = parts[0] || name
    const last = parts.length > 1 ? parts[parts.length - 1] : ''
    const initials = (first[0] || '') + (last[0] || '')

    const styleHint = [
      style?.typographyFeel ? `Typography feeling: ${style.typographyFeel}.` : '',
      style?.moodDescription ? `Overall brand mood: ${style.moodDescription}.` : '',
      style?.wardrobeIdeas?.length ? `Personal style cues: ${style.wardrobeIdeas.join(', ')}.` : '',
    ].filter(Boolean).join(' ')

    let prompt = ''
    if (type === 'monogram') {
      prompt = `A refined, elegant personal monogram logo using only the two initials "${initials}" (for ${first} ${last}). The initials are interlocking or overlapping in a sophisticated serif style with fine, delicate strokes and generous negative space — timeless and minimal, like a luxury fashion house monogram. Solid pure black on a plain white background. Centered, lots of margin, nothing else in the image — no extra text, no name spelled out, no decoration, no frame. ${styleHint} Spell the initials exactly as "${initials}".`
    } else {
      prompt = `A refined, elegant personal signature logo. The first name "${first}" is the hero — large, flowing, graceful handwritten modern calligraphy script with thin elegant even strokes, like a beautiful real signature. The last name "${last}" sits beneath it, much smaller, in clean simple sans-serif CAPITAL letters with wide even letter-spacing. The first name must always be clearly larger and more prominent than the last name. Solid pure black on a plain white background. Centered, generous margins, minimal, nothing else in the image — no decoration, no frame, no tagline. ${styleHint} CRITICAL: spell the names exactly as "${first}" and "${last}" — check every letter, do not add or drop letters.`
    }

    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY || ''}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt,
        size: '1536x1024',
        quality: 'high',
        background: 'transparent',
        n: 1,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('OpenAI logo error:', res.status, errText)
      return NextResponse.json({ error: 'Logo generation failed' }, { status: 500 })
    }

    const data = await res.json()
    const b64 = data?.data?.[0]?.b64_json

    if (!b64) {
      return NextResponse.json({ error: 'No image returned' }, { status: 500 })
    }

    const imageUrl = `data:image/png;base64,${b64}`
    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error('Logo error:', error)
    return NextResponse.json({ error: 'Failed to generate logo' }, { status: 500 })
  }
}