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
      prompt = `A polished, real, professional luxury personal-brand monogram logo — the kind already in use by a high-end lifestyle or fashion brand. On a plain solid white background. The mark is built from only the two initials "${initials}" (for ${first} ${last}), elegantly interlocking and overlapping into one refined symbol. Fine, thin, high-contrast serif letterforms with graceful tapering and generous balanced negative space. Solid pure black. Single centered mark, generous even padding, perfectly clean edges. ${styleHint} Spell the initials exactly as the letters "${initials.split('').join('" "')}". Constraints: minimal and timeless, no extra text, no name spelled out, no decorative flourishes, no clip art, no gradients, no shadows, no frame, no border, nothing generic or overdesigned.`
    } else {
      prompt = `A polished, real, professional luxury personal signature logo — the kind already in use by a high-end lifestyle photographer or fashion brand. On a plain solid white background. Two parts, stacked and centered: on top, the first name "${first}" as the hero in large, flowing, graceful modern calligraphy script with thin elegant even monoline strokes, like a beautiful real handwritten signature; directly below it, the last name "${last}" in a clean minimal sans-serif, ALL CAPS, much smaller, with wide even letter-spacing. The first name is clearly larger and dominant; the last name is small and understated. Solid pure black, generous padding, perfectly clean edges, plenty of negative space. ${styleHint} CRITICAL spelling — the script must read exactly "${first}" spelled "${first.split('').join('" "')}", and the caps must read exactly "${last}". Do not add, drop, or alter any letters. Constraints: refined, minimal, timeless, no decorative flourishes beyond a single subtle signature swash, no clip art, no gradients, no shadows, no frame, no border, no tagline, nothing generic or overdesigned.`
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