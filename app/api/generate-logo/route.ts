import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'No prompt provided' }, { status: 400 })
    }

    const fullPrompt = `${prompt}. Clean professional signature logo, black lettering, crisp sharp typography, centered, generous margins, nothing else in the image. CRITICAL: spell every name and word EXACTLY as written in the prompt — double-check and triple-check the spelling letter by letter. Do not add, drop, swap, or invent any letters. Accurate, legible, correctly-spelled text is the single most important requirement.`

    const res = await fetch('https://api.ideogram.ai/v1/ideogram-v3/generate-transparent', {
      method: 'POST',
      headers: {
        'Api-Key': process.env.IDEOGRAM_API_KEY || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: fullPrompt,
        rendering_speed: 'DEFAULT',
        aspect_ratio: '2x1',
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('Ideogram logo error:', res.status, errText)
      return NextResponse.json({ error: 'Logo generation failed' }, { status: 500 })
    }

    const data = await res.json()
    const imageUrl = data?.data?.[0]?.url

    if (!imageUrl) {
      return NextResponse.json({ error: 'No image returned' }, { status: 500 })
    }

    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error('Logo error:', error)
    return NextResponse.json({ error: 'Failed to generate logo' }, { status: 500 })
  }
}