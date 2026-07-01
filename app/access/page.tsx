export default function AccessPage({
  searchParams,
}: {
  searchParams: { error?: string; redirect?: string }
}) {
  const redirect = searchParams.redirect || '/'
  const hasError = searchParams.error === '1'

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf9f6' }}>
      <div style={{ width: '100%', maxWidth: 380, padding: '2.5rem', background: '#fff', borderRadius: '1rem', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <h1 style={{ fontFamily: 'serif', fontSize: '1.75rem', fontWeight: 800, color: '#1a1a1a', marginBottom: '0.5rem' }}>
          The <em style={{ color: '#d95f3b' }}>you</em> brand
        </h1>
        <p style={{ fontSize: '0.95rem', color: '#666', marginBottom: '1.75rem' }}>
          Enter your access code to continue.
        </p>
        {hasError && (
          <p style={{ fontSize: '0.875rem', color: '#c0392b', marginBottom: '1rem' }}>
            That code wasn&apos;t right. Please try again.
          </p>
        )}
        <form method="POST" action="/api/verify-access" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <input type="hidden" name="redirect" value={redirect} />
          <input
            type="password"
            name="code"
            placeholder="Access code"
            autoFocus
            required
            style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #ddd', fontSize: '1rem', outline: 'none' }}
          />
          <button
            type="submit"
            style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', background: '#0F8366', color: '#fff', fontWeight: 700, fontSize: '1rem', border: 'none', cursor: 'pointer' }}
          >
            Enter
          </button>
        </form>
      </div>
    </main>
  )
}
