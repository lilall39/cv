import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mon CV',
  description: 'Créez et éditez votre CV en ligne',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="bg-cream font-body text-espresso min-h-screen" style={{ backgroundColor: '#F5F0E8', color: '#3D2C29' }}>
        {children}
      </body>
    </html>
  )
}
