import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { visualDirection, name } = await request.json()

    const colors = (visualDirection?.colors || [])
      .map((c: { name?: string; hex?: string }) => `${c.name} (${c.hex})`)
      .join(', ')
    const locations = (visualDirection?.locationIdeas || []).join(', ')
    const wardrobe = (visualDirection?.wardrobeIdeas || []).join(', ')
    const mood = visualDirection?.moodDescription || ''

    const prompt = `CRITICAL: Zero text anywhere in this image — no letters, no words, no numbers, no typography, no abstract lettering, not even illegible marks that resemble writing. This is a non-negotiable constraint.

An elegant editorial brand mood board collage, magazine-style, arranged as a clean grid of 9–12 rectangular photo tiles on a soft off-white background. The mood board visually expresses this brand: ${mood}.

Every single tile must be visually distinct — different subject, different scene, different composition. No repeated images, no near-duplicate shots, no two tiles showing similar scenes (for example, if the brand relates to transportation, include at most one vehicle image — never two or three similar shots). Variety is essential.

Include 4–6 tiles of atmospheric lifestyle and location imagery evoking these settings: ${locations}. Include exactly 1–2 tiles of wardrobe and styling imagery — clothing flat-lays, draped fabric, accessories, or garment detail shots — even if the locations or mood don't obviously suggest fashion. Style references are always relevant to a personal brand.

No visible faces anywhere. People should appear from behind, from the side with no face visible, or cropped at the neck or below — the viewer should picture themselves in the scene, not look at someone else's face. If children appear, show them from behind or walking/running away from camera only.

The overall color palette throughout the board should reflect: ${colors}. Soft natural light, cohesive tones, sophisticated and aspirational. Pinterest-quality editorial photography.

REMINDER: Absolutely no text, letters, or typography anywhere in the image — not in signage, not in props, not abstracted or blurred. Purely photographic imagery and color.`

    const res = await fetch('https://api.ideogram.ai/v1/ideogram-v3/generate', {
      method: 'POST',
      headers: {
        'Api-Key': process.env.IDEOGRAM_API_KEY || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        rendering_speed: 'DEFAULT',
        aspect_ratio: '1x1',
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('Ideogram error:', res.status, errText)
      return NextResponse.json({ error: 'Image generation failed' }, { status: 500 })
    }

    const data = await res.json()
    const imageUrl = data?.data?.[0]?.url

    if (!imageUrl) {
      return NextResponse.json({ error: 'No image returned' }, { status: 500 })
    }

    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error('Mood board error:', error)
    return NextResponse.json({ error: 'Failed to generate mood board' }, { status: 500 })
  }
}