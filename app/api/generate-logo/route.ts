import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'No prompt provided' }, { status: 400 })
    }

    const fullPrompt = `Elegant personal signature logo. ${prompt} STYLE RULES (follow exactly): The FIRST NAME is the hero — large, flowing, graceful handwritten SCRIPT with fine delicate strokes, like a real elegant signature. The LAST NAME is supporting — noticeably SMALLER than the first name, set in clean simple SANS-SERIF CAPITAL letters with wide even letter-spacing, placed neatly beneath or tucked under the first name. The first name must always be visually larger and more prominent than the last name; never make the last name bigger. Optional graceful swash or underline stroke flowing from the script. SOLID BLACK ink only, pure black, absolutely no color, no gold, on a transparent background. Refined, minimal, luxury personal-brand feel, generous margins, nothing else in the image. CRITICAL: spell every name EXACTLY as written — double-check and triple-check the spelling letter by letter, add or drop no letters. Correct spelling is the most important requirement.`

    const res = await fetch('https://api.ideogram.ai/v1/ideogram-v3/generate-transparent', {
      method: 'POST',
      headers: {
        'Api-Key': process.env.IDEOGRAM_API_KEY || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: fullPrompt,
        negative_prompt: 'color, colored, gold, brown, blue, last name larger than first name, blocky bold letters, thick heavy strokes, varsity, letterman, athletic, monogram only, single initials, background, frame, border',
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