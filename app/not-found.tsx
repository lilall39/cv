import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: '#F5F0E8', color: '#3D2C29' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Page non trouvée</h2>
      <p style={{ marginBottom: '1.5rem' }}>Cette page n&apos;existe pas.</p>
      <Link href="/" style={{ background: '#3D2C29', color: '#F5F0E8', padding: '0.75rem 1.5rem', borderRadius: '9999px', textDecoration: 'none' }}>
        Retour à l&apos;accueil
      </Link>
    </div>
  )
}
