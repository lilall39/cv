import Link from 'next/link'

export default function Home() {
  const features = [
    {
      icon: '✏️',
      title: 'Créez votre CV en direct',
      desc: 'Modifiez toutes les sections de votre CV : identité, profil, expériences, formation, compétences et centres d\'intérêt. Les changements s\'affichent immédiatement.',
    },
    {
      icon: '📄',
      title: 'Téléchargez en PDF',
      desc: 'Téléchargez votre CV au format PDF, parfait pour l\'envoi par email ou l\'impression. Mise en page A4 optimisée.',
    },
    {
      icon: '🖨️',
      title: 'Impression',
      desc: 'Imprimez directement votre CV depuis le navigateur avec une qualité professionnelle.',
    },
    {
      icon: '💾',
      title: 'Sauvegarde des données',
      desc: 'Téléchargez vos données en JSON pour les réimporter plus tard sur l\'application. Reprenez votre CV où vous l\'aviez laissé.',
    },
    {
      icon: '📥',
      title: 'Import',
      desc: 'Réimportez un CV précédemment sauvegardé (fichier .json) pour continuer à l\'éditer.',
    },
    {
      icon: '👁️',
      title: 'Aperçu',
      desc: 'Visualisez votre CV en plein écran sans les éléments d\'édition, tel qu\'il apparaîtra au final.',
    },
    {
      icon: '🎨',
      title: 'Palettes de couleurs',
      desc: 'Choisissez parmi plusieurs palettes pour personnaliser l\'apparence globale de votre CV.',
    },
    {
      icon: '🌈',
      title: 'Couleurs par bloc',
      desc: 'Personnalisez chaque section (Contact, Profil, Expériences...) avec sa propre couleur grâce au sélecteur de couleur ( petits rectangles )',
    },
    {
      icon: '🆕',
      title: 'Nouveau CV',
      desc: 'Commencez un nouveau CV à tout moment. Sauvegardez l\'actuel en PDF ou en données avant de continuer.',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F5F0E8', color: '#3D2C29' }}>
      <header className="border-b border-warm/30 bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400 shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white drop-shadow-sm">
            Mon CV
          </h1>
          <p className="text-white/90 mt-4 font-medium text-xl sm:text-2xl">
            Créez et éditez votre CV en ligne, gratuitement et sans inscription
          </p>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12">
        <section className="mb-16">
          <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent leading-relaxed mb-8">
            Une application simple pour créer, personnaliser et exporter votre CV.
            Vos données sont stockées localement dans votre navigateur — aucune
            inscription requise.
          </p>
          <Link
            href="/editer"
            className="inline-flex items-center gap-2 bg-espresso text-cream px-8 py-4 rounded-full font-medium hover:bg-mocha transition-colors shadow-lg"
          >
            Créer ou éditer mon CV
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-espresso mb-6">
            Fonctions de l&apos;application
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {features.map((f, i) => (
              <li key={i}>
                <details className="group p-5 rounded-xl bg-oat border border-sand hover:border-warm/50 transition-all cursor-pointer">
                  <summary className="list-none flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{f.icon}</span>
                      <h3 className="font-display font-semibold text-espresso">
                        {f.title}
                      </h3>
                    </div>
                    <svg 
                      className="w-5 h-5 text-mocha group-open:rotate-180 transition-transform" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="text-sm text-mocha leading-relaxed mt-4 pt-4 border-t border-sand/50">
                    {f.desc}
                  </p>
                </details>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="border-t border-warm/30 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-mocha">
          Vos données restent sur votre appareil. Aucun serveur ne les stocke.
        </div>
      </footer>
    </div>
  )
}
