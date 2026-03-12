'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, minHeight: '100vh', background: '#F5F0E8', color: '#3D2C29' }}>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: '#F5F0E8', color: '#3D2C29' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Une erreur est survenue</h2>
          <p style={{ marginBottom: '1.5rem', textAlign: 'center' }}>{error?.message || 'Erreur inconnue'}</p>
          <button onClick={reset} style={{ background: '#3D2C29', color: '#F5F0E8', padding: '0.75rem 1.5rem', borderRadius: '9999px', border: 'none', cursor: 'pointer' }}>
            Réessayer
          </button>
        </div>
      </body>
    </html>
  )
}
