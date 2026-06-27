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

    const prompt = `An elegant editorial brand mood board collage, magazine-style, arranged as a clean grid of rectangular photo tiles on a soft off-white background. The mood board visually expresses this brand: ${mood}. Include atmospheric lifestyle imagery evoking these settings: ${locations}. Include styling and wardrobe imagery: ${wardrobe}. The overall color palette throughout should be: ${colors}. Sophisticated, aspirational, Pinterest-style brand aesthetic board. Soft natural light, cohesive tones, premium and intentional. No text, no words, no labels, no logos — purely photographic imagery and color.`

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