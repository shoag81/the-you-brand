import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { sessionId, dataUrl, path, column } = await req.json()

    if (!sessionId || !dataUrl || !path || !column) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const base64 = dataUrl.split(',')[1]
    const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
    const blob = new Blob([bytes], { type: 'image/png' })

    const { error: uploadError } = await supabase.storage
      .from('brand-assets')
      .upload(path, blob, { upsert: true, contentType: 'image/png' })

    if (uploadError) {
      console.error('Storage upload error:', { column, path, uploadError })
      return NextResponse.json({ error: 'Storage upload failed' }, { status: 500 })
    }

    const { error: updateError } = await supabase
      .from('brand_sessions')
      .update({ [column]: path })
      .eq('id', sessionId)

    if (updateError) {
      console.error('Session update error:', { column, sessionId, updateError })
      return NextResponse.json({ error: 'Session update failed' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Upload asset error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
