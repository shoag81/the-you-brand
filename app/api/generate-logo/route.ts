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
    return `Study the attached reference logo images closely — their exact stroke weight, letterform proportions, flourish style, and overall hand-lettered character. Generate an original signature logo for a different person, in that same designer's hand and style, the way the same calligrapher might letter a new client's name.

Person's name: first name "${first}" (spelled: ${spelledFirst}), last name "${last}" (spelled: ${spelledLast}). The first name should be the dominant, larger element; the last name supports it, smaller, beneath or beside it.

${styleHint}

The only text in the image is this person's name — no taglines, no extra words, no labels. Solid black ink only, fully transparent background, no color, no shadow, no outline, no clip art.`
  }

  return `Study the attached reference monogram logo images closely — their exact letterform style, weight, interlocking structure, and the way the small script names are placed. Generate an original monogram logo for a different person, in that same designer's hand and style, the way the same designer might create a new client's mark.

Person's name: first name "${first}" (spelled: ${spelledFirst}), last name "${last}" (spelled: ${spelledLast}), initials "${first.charAt(0)}" and "${last.charAt(0)}".

${styleHint}

The only text in the image is this person's name and initials — no taglines, no extra words, no labels. Solid black ink only, fully transparent background, no color, no shadow, no outline, no clip art.`
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
    formData.append('input_fidelity', 'high')

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
