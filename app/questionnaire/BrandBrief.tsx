import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { visualDirection } = await request.json()

    const colors = (visualDirection?.colors || [])
      .map((c: { name?: string; hex?: string }) => `${c.name} (${c.hex})`)
      .join(', ')
    const locations = (visualDirection?.locationIdeas || []).join(', ')
    const wardrobe = (visualDirection?.wardrobeIdeas || []).join(', ')
    const mood = visualDirection?.moodDescription || ''

    const prompt = `An elegant editorial brand mood board collage, magazine-style, arranged as a clean grid of rectangular photo tiles on a soft off-white background. The board expresses this brand mood: ${mood}. Show: architectural spaces and interiors evoking ${locations}; flat-lay textures, fabrics, and wardrobe materials evoking ${wardrobe}; close-up texture details; and color swatches in this palette: ${colors}. You may include stylish lifestyle and wardrobe imagery (people styled in the wardrobe direction, fashion and outfit shots, editorial lifestyle moments) alongside the spaces and textures. IMPORTANT: do NOT include any animals, pets, or dogs — those render poorly. No animals of any kind. Sophisticated, aspirational, Pinterest-style brand aesthetic board. Soft natural light, cohesive warm tones, premium and intentional. No text, no words, no labels, no logos.`

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