import Link from 'next/link'

export default function Home() {
  const features = [
    {
      icon: '✏️',
      title: 'Édition en direct',
      desc: 'Modifiez toutes les sections de votre CV : identité, profil, expériences, formation, compétences et centres d\'intérêt. Les changements s\'affichent immédiatement.',
    },
    {
      icon: '📄',
      title: 'Export PDF',
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
      desc: 'Choisissez parmi plusieurs palettes pour personnaliser l\'apparence de votre CV.',
    },
    {
      icon: '🆕',
      title: 'Nouveau CV',
      desc: 'Commencez un nouveau CV à tout moment. Sauvegardez l\'actuel en PDF ou en données avant de continuer.',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-warm/30 bg-oat/50">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-espresso">
            Mon CV
          </h1>
          <p className="text-mocha mt-1">
            Créez et éditez votre CV en ligne, gratuitement
          </p>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12">
        <section className="mb-16">
          <p className="text-lg text-mocha leading-relaxed mb-8">
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
          <ul className="grid gap-6 sm:grid-cols-2">
            {features.map((f, i) => (
              <li
                key={i}
                className="p-5 rounded-xl bg-oat border border-sand hover:border-warm/50 transition-colors"
              >
                <span className="text-2xl mb-3 block">{f.icon}</span>
                <h3 className="font-display font-semibold text-espresso mb-1">
                  {f.title}
                </h3>
                <p className="text-sm text-mocha leading-relaxed">{f.desc}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="border-t border-warm/30 py-6 mt-12">
        <div className="max-w-4xl mx-auto px-6 text-center text-sm text-mocha">
          Vos données restent sur votre appareil. Aucun serveur ne les stocke.
        </div>
      </footer>
    </div>
  )
}
