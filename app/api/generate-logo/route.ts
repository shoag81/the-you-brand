import { NextRequest, NextResponse } from 'next/server'
import { SIGNATURE_REFERENCES, MONOGRAM_REFERENCES } from '@/lib/logo-references'

export const maxDuration = 60

type LogoType = 'signature' | 'monogram'

interface LogoRequestBody {
  type: LogoType
  name?: string
  style?: {
    typographyFeel?: string
    wardrobeIdeas?: string[]
    moodDescription?: string
  }
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/)
  const first = parts[0] || ''
  const last = parts.slice(1).join(' ') || ''
  return { first, last }
}

function buildPrompt(type: LogoType, fullName: string, style?: LogoRequestBody['style']) {
  const { first, last } = splitName(fullName)
  const styleHint = [
    style?.typographyFeel ? `Typography feel to lean into: ${style.typographyFeel}.` : '',
    style?.moodDescription ? `Overall mood: ${style.moodDescription}.` : '',
  ].filter(Boolean).join(' ')

  const spelledFirst = first.split('').join('-')
  const spelledLast = last.split('').join('-')

  if (type === 'signature') {
    return `Generate an original personal signature logo, in the exact design style of the attached reference images. These references are for stroke weight, layout, and overall styling guidance only — do not copy any reference directly, and do not reuse any reference's actual name.

This is a real, professionally designed wordmark logo for a real person, not a concept sketch or AI illustration. Treat it the way a logo designer would treat a finished client deliverable.

Layout: the first name "${first}" (spelled letter by letter: ${spelledFirst}) is rendered LARGE in flowing, connected cursive script — confident, hand-lettered feel, varying stroke weight, a natural connecting flourish or underline is welcome. Directly below or beside it, the last name "${last}" (spelled letter by letter: ${spelledLast}) appears much SMALLER, in clean spaced sans-serif capital letters, evenly letter-spaced. The first name must always be the dominant visual element; the last name is a quiet supporting line.

${styleHint}

The ONLY text allowed anywhere in the image is the person's first and last name as described above. Do not add taglines, descriptor words (no "Photography", "Studio", "Co", etc.), dates, symbols, or any other text or labels of any kind.

Color: solid black logo only. Background: fully transparent. No color, no gradient, no drop shadow, no outline, no frame, no border, no extra graphic elements, no clip art. Output should look like a real exported brand asset — crisp vector-like edges, nothing photographic, nothing 3D.`
  }

  return `Generate an original personal monogram logo, in the exact design style of the attached reference images. These references are for stroke weight, layout, and overall styling guidance only — do not copy any reference directly, and do not reuse any reference's actual initials or names.

This is a real, professionally designed monogram logo for a real person, not a concept sketch or AI illustration. Treat it the way a logo designer would treat a finished client deliverable.

Layout: two large, bold serif capital initials — "${first.charAt(0)}" and "${last.charAt(0)}" — interlocked or overlapping in the center as equal-weight partners, sharing visual weight roughly 50/50, with elegant serif detailing (subtle ligature-style connections between the letterforms are welcome). Running vertically alongside each initial, in small delicate cursive script, the corresponding full name: "${first}" (spelled letter by letter: ${spelledFirst}) next to its initial, and "${last}" (spelled letter by letter: ${spelledLast}) next to its initial.

${styleHint}

The ONLY text allowed anywhere in the image is the person's first and last name as described above. Do not add taglines, descriptor words (no "Photography", "Studio", "Co", etc.), dates, symbols, or any other text or labels of any kind.

Color: solid black logo only. Background: fully transparent. No color, no gradient, no drop shadow, no outline, no frame, no border, no extra graphic elements, no clip art. Output should look like a real exported brand asset — crisp vector-like edges, nothing photographic, nothing 3D.`
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',')
  const mimeMatch = header.match(/data:(.*?);base64/)
  const mime = mimeMatch ? mimeMatch[1] : 'image/png'
  const bytes = Buffer.from(base64, 'base64')
  return new Blob([bytes], { type: mime })
}

export async function POST(req: NextRequest) {
  try {
    const body: LogoRequestBody = await req.json()
    const { type, name, style } = body

    if (!type || (type !== 'signature' && type !== 'monogram')) {
      return NextResponse.json({ error: 'Invalid logo type' }, { status: 400 })
    }
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const references = type === 'signature' ? SIGNATURE_REFERENCES : MONOGRAM_REFERENCES
    const prompt = buildPrompt(type, name, style)

    const formData = new FormData()
    formData.append('model', 'gpt-image-1')
    formData.append('prompt', prompt)
    formData.append('size', '1536x1024')
    formData.append('quality', 'high')
    formData.append('background', 'transparent')

    references.forEach((ref, i) => {
      const blob = dataUrlToBlob(ref)
      formData.append('image[]', blob, `reference-${i}.png`)
    })

    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('OpenAI logo error:', errText)
      return NextResponse.json({ error: 'Failed to generate logo' }, { status: 500 })
    }

    const data = await response.json()
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
