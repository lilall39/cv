'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useCvData } from '@/lib/useCvData'
import { Modal } from './Modal'
import { ResizeHandle } from './ResizeHandle'
import type { Experience } from '@/types/cv'
import { PALETTES } from '@/types/cv'

export default function CvPage() {
  const {
    data,
    mounted,
    updateHeader,
    updateProfile,
    addExperience,
    updateExperience,
    deleteExperience,
    updateEducation,
    updateSkills,
    updateInterests,
    updateColors,
    moveSectionUp,
    moveSectionDown,
    setSectionHeight,
  } = useCvData()

  const [modal, setModal] = useState<{
    title: string
    content: React.ReactNode
    onSave: () => void
  } | null>(null)
  const [previewMode, setPreviewMode] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const cvContentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const c = data.colors || {
      sidebar: '#E8E2D8',
      main: '#FAF8F5',
      experienceCard: '#F5F0E8',
    }
    const sidebar = document.getElementById('cv-sidebar')
    const card = document.getElementById('cv-card')
    if (sidebar) sidebar.style.background = c.sidebar
    if (card) card.style.background = c.main
  }, [data.colors])

  useEffect(() => {
    const container = document.getElementById('main-sections')
    if (!container) return
    const order = data.sectionOrder || ['header', 'profile', 'experience']
    order.forEach((id) => {
      const el = document.getElementById(`section-${id}`)
      if (el) container.appendChild(el)
    })
  }, [data.sectionOrder])

  useEffect(() => {
    const heights = data.sectionHeights || {}
    ;['header', 'profile', 'contact', 'formation', 'interests'].forEach(
      (id) => {
        const body = document.getElementById(`body-${id}`)
        const h = heights[id]
        if (body) {
          if (h) body.style.maxHeight = h + 'px'
          else body.style.maxHeight = ''
        }
      }
    )
    const skillsBody = document.getElementById('body-skills')
    if (skillsBody) {
      skillsBody.style.maxHeight = ''
    }
    const expBody = document.getElementById('body-experience')
    if (expBody) {
      expBody.style.maxHeight = ''
      expBody.style.overflow = 'visible'
    }
  }, [data.sectionHeights])

  const openModal = useCallback(
    (title: string, content: React.ReactNode, onSave: () => void) => {
      setModal({ title, content, onSave })
    },
    []
  )

  const closeModal = useCallback(() => setModal(null), [])

  const editJobTitle = useCallback(() => {
    openModal(
      'Poste recherché',
      <JobTitleForm
        value={data.header.jobTitle || ''}
        onSave={(val) => {
          updateHeader({ jobTitle: val || 'Poste recherché' })
          closeModal()
        }}
      />,
      () => {
        const input = document.getElementById('input-job-title') as HTMLInputElement
        if (input) updateHeader({ jobTitle: input.value.trim() || 'Poste recherché' })
        closeModal()
      }
    )
  }, [data.header.jobTitle, openModal, closeModal, updateHeader])

  const editHeader = useCallback(() => {
    openModal(
      'Informations personnelles',
      <HeaderForm data={data} />,
      () => {
        const h = {
          name: (document.getElementById('input-name') as HTMLInputElement)?.value || '',
          jobTitle:
            (document.getElementById('input-job-title') as HTMLInputElement)?.value ||
            'Poste recherché',
          address: (document.getElementById('input-address') as HTMLInputElement)?.value || '',
          email: (document.getElementById('input-email') as HTMLInputElement)?.value || '',
          phone: (document.getElementById('input-phone') as HTMLInputElement)?.value || '',
        }
        updateHeader(h)
        closeModal()
      }
    )
  }, [data, openModal, closeModal, updateHeader])

  const editProfile = useCallback(() => {
    openModal(
      'Profil',
      <TextAreaForm
        id="input-profile"
        value={data.profile}
        rows={6}
        label="Résumé professionnel"
      />,
      () => {
        const val = (document.getElementById('input-profile') as HTMLTextAreaElement)?.value || ''
        updateProfile(val)
        closeModal()
      }
    )
  }, [data.profile, openModal, closeModal, updateProfile])

  const editExperience = useCallback(
    (id: string) => {
      const exp = data.experiences.find((e) => e.id === id)
      if (!exp) return
      openModal(
        "Modifier l'expérience",
        <ExperienceForm exp={exp} />,
        () => {
          const idx = data.experiences.findIndex((e) => e.id === id)
          if (idx >= 0) {
            updateExperience(id, {
              title: (document.getElementById('input-title') as HTMLInputElement)?.value || '',
              company: (document.getElementById('input-company') as HTMLInputElement)?.value || '',
              location: (document.getElementById('input-location') as HTMLInputElement)?.value || '',
              startYear: (document.getElementById('input-start') as HTMLInputElement)?.value || '',
              endYear: (document.getElementById('input-end') as HTMLInputElement)?.value || '',
              description:
                (document.getElementById('input-description') as HTMLTextAreaElement)?.value || '',
            })
          }
          closeModal()
        }
      )
    },
    [data.experiences, openModal, closeModal, updateExperience]
  )

  const handleAddExperience = useCallback(() => {
    const id = addExperience()
    setTimeout(() => editExperience(id), 0)
  }, [addExperience, editExperience])

  const editEducation = useCallback(() => {
    openModal(
      'Formation',
      <TextAreaForm
        id="input-education"
        value={data.education}
        rows={6}
        label="Formation (une ligne par diplôme)"
      />,
      () => {
        const val = (document.getElementById('input-education') as HTMLTextAreaElement)?.value || ''
        updateEducation(val)
        closeModal()
      }
    )
  }, [data.education, openModal, closeModal, updateEducation])

  const editSkills = useCallback(() => {
    openModal(
      'Compétences',
      <TextAreaForm
        id="input-skills"
        value={data.skills.join(', ')}
        rows={1}
        label="Compétences (séparées par des virgules)"
        asInput
      />,
      () => {
        const val = (document.getElementById('input-skills') as HTMLInputElement)?.value || ''
        updateSkills(val.split(',').map((s) => s.trim()).filter(Boolean))
        closeModal()
      }
    )
  }, [data.skills, openModal, closeModal, updateSkills])

  const editInterests = useCallback(() => {
    openModal(
      "Centres d'intérêt",
      <TextAreaForm
        id="input-interests"
        value={data.interests}
        rows={4}
        label="Centres d'intérêt"
      />,
      () => {
        const val = (document.getElementById('input-interests') as HTMLTextAreaElement)?.value || ''
        updateInterests(val)
        closeModal()
      }
    )
  }, [data.interests, openModal, closeModal, updateInterests])

  const editColors = useCallback(() => {
    const c = data.colors || {
      sidebar: '#E8E2D8',
      main: '#FAF8F5',
      experienceCard: '#F5F0E8',
    }
    const content = (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[60vh] overflow-y-auto">
        {PALETTES.map((p, i) => {
          const selected =
            (c.sidebar === p.sidebar && c.main === p.main && c.experienceCard === p.experienceCard) ||
            (!data.colors && i === 0)
          return (
            <button
              key={p.name}
              type="button"
              data-palette-index={i}
              className={`palette-btn w-full p-3 rounded-xl border-2 text-left transition-all hover:border-mocha ${
                selected ? 'border-espresso ring-2 ring-warm' : 'border-sand'
              }`}
              onClick={(e) => {
                document
                  .querySelectorAll('.palette-btn')
                  .forEach((b) => {
                    b.classList.remove('border-espresso', 'ring-2', 'ring-warm')
                    b.classList.add('border-sand')
                  })
                ;(e.currentTarget as HTMLElement).classList.add('border-espresso', 'ring-2', 'ring-warm')
                ;(e.currentTarget as HTMLElement).classList.remove('border-sand')
              }}
            >
              <div className="flex gap-1.5 mb-2">
                <span
                  className="w-8 h-8 rounded-lg shrink-0"
                  style={{
                    background: p.sidebar,
                    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)',
                  }}
                />
                <span
                  className="w-8 h-8 rounded-lg shrink-0"
                  style={{
                    background: p.main,
                    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)',
                  }}
                />
                <span
                  className="w-8 h-8 rounded-lg shrink-0"
                  style={{
                    background: p.experienceCard,
                    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)',
                  }}
                />
              </div>
              <span className="text-sm font-medium text-espresso">{p.name}</span>
            </button>
          )
        })}
      </div>
    )
    openModal(
      'Palette de couleurs',
      <>
        {content}
        <p className="text-xs text-mocha mt-3">
          Cliquez sur une palette pour l&apos;appliquer puis Enregistrer.
        </p>
      </>,
      () => {
        const btn = document.querySelector('.palette-btn.border-espresso')
        if (btn && btn instanceof HTMLElement) {
          const idx = btn.dataset.paletteIndex
          if (idx !== undefined) {
            const p = PALETTES[parseInt(idx, 10)]
            if (p) updateColors(p)
          }
        }
        closeModal()
      }
    )
  }, [data.colors, openModal, closeModal, updateColors])

  const exportPDF = useCallback(() => {
    if (typeof window === 'undefined') return
    const cvContent = document.getElementById('cv-content')
    if (!cvContent) return
    const clone = cvContent.cloneNode(true) as HTMLElement
    clone.querySelectorAll('.no-print').forEach((el) => el.remove())
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      window.print()
      return
    }
    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>CV - ${(data.header?.name || 'mon-cv').replace(/</g, '&lt;')}</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"><\/script>
<script>tailwind.config={theme:{extend:{colors:{cream:'#F5F0E8',sand:'#E8E2D8',warm:'#D4C4B0',espresso:'#3D2C29',mocha:'#5C4A47',oat:'#FAF8F5'},fontFamily:{display:['Cormorant Garamond'],body:['Outfit']}}}}<\/script>
<style>
body{font-family:Outfit,sans-serif;background:#fff;color:#3D2C29;margin:0;padding:1rem;min-height:100%}
.section-body{overflow:visible!important}
#body-skills{overflow:visible!important;max-height:none!important}
#cv-content,#cv-sidebar{border:none!important;box-shadow:none!important}#cv-card{border:2px solid #5C4A47!important;box-shadow:none!important}
@media print{@page{size:A4;margin:10mm}body{padding:0;background:#fff}}
<\/style></head>
<body>${clone.outerHTML}</body></html>`
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus()
        printWindow.print()
        printWindow.onafterprint = () => printWindow.close()
      }, 250)
    }
  }, [data.header?.name])

  const togglePreview = useCallback(() => {
    const iframe = iframeRef.current
    setPreviewMode((prev) => {
      const next = !prev
      if (next) {
        document.body.classList.add('preview-mode')
        const cvContent = document.getElementById('cv-content')
        if (cvContent && iframe) {
          const clone = cvContent.cloneNode(true) as HTMLElement
          clone.querySelectorAll('.no-print').forEach((el) => el.remove())
          const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><script src="https://cdn.tailwindcss.com"><\/script>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet">
<script>tailwind.config={theme:{extend:{colors:{cream:'#F5F0E8',sand:'#E8E2D8',warm:'#D4C4B0',espresso:'#3D2C29',mocha:'#5C4A47',oat:'#FAF8F5'},fontFamily:{display:['Cormorant Garamond'],body:['Outfit']}}}}<\/script>
<style>body{font-family:Outfit,sans-serif;background:#F5F0E8;color:#3D2C29;margin:0;padding:2rem;min-height:100%}.section-body{overflow:visible!important}#body-skills{overflow:visible!important;max-height:none!important}#cv-content,#cv-sidebar{border:none!important;box-shadow:none!important}#cv-card{border:2px solid #5C4A47!important;box-shadow:none!important}</style></head>
<body>${clone.outerHTML}</body></html>`
          iframe.srcdoc = html
        }
      } else {
        document.body.classList.remove('preview-mode')
        if (iframe) iframe.srcdoc = ''
      }
      return next
    })
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && previewMode) togglePreview()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [previewMode, togglePreview])

  if (!mounted) {
    return (
      <div className="w-full max-w-[900px] mx-auto px-4 py-12 animate-pulse">
        <div className="h-96 bg-sand rounded-2xl" />
      </div>
    )
  }

  const bgMain = data.colors?.main ?? '#FAF8F5'

  return (
    <div className="min-h-screen flex flex-col items-center py-8 md:py-12" style={{ background: bgMain }}>
      <div
        id="cv-content"
        ref={cvContentRef}
        className="w-full max-w-[900px] pl-4 pr-0 shadow-none"
        style={{ background: bgMain }}
      >
        <div id="cv-card" className="flex flex-col lg:flex-row gap-0 overflow-hidden shadow-none">
          <aside
            id="cv-sidebar"
            className="lg:w-60 shrink-0 text-espresso p-6 md:p-8 order-2 lg:order-1"
          >
            <div className="mb-10 mt-20 relative">
              <div id="body-contact" className="section-body">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h1 className="font-display text-lg md:text-xl font-bold text-espresso">
                      {data.header.name}
                    </h1>
                    <button
                      onClick={editHeader}
                      className="no-print text-sm text-mocha hover:text-espresso underline transition-colors"
                    >
                      Modifier
                    </button>
                  </div>
                </div>
                <h2 className="font-display text-sm font-bold uppercase tracking-wider text-black mb-4">
                  Contact
                </h2>
                <div className="space-y-3 text-sm text-espresso">
                  <p className="flex items-start gap-2">{data.header.address}</p>
                  <a
                    href={`mailto:${data.header.email}`}
                    className="flex items-start gap-2 text-espresso hover:text-mocha transition-colors break-all"
                  >
                    {data.header.email}
                  </a>
                  <a
                    href={`tel:${data.header.phone.replace(/\s/g, '')}`}
                    className="flex items-start gap-2 text-espresso hover:text-mocha transition-colors"
                  >
                    {data.header.phone}
                  </a>
                </div>
                <button
                  onClick={editHeader}
                  className="no-print mt-4 text-xs text-mocha hover:text-espresso underline transition-colors"
                >
                  Modifier
                </button>
              </div>
              <ResizeHandle sectionId="contact" onResize={setSectionHeight} />
            </div>

            <div className="mb-10 relative">
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-black mb-4">
                Compétences
              </h2>
              <div id="body-skills" className="section-body">
                <div className="flex flex-wrap gap-2">
                  {data.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-espresso text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <button
                  onClick={editSkills}
                  className="no-print mt-3 text-xs text-mocha hover:text-espresso underline transition-colors"
                >
                  Modifier
                </button>
              </div>
            </div>

            <div className="mb-10 relative">
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-black mb-4">
                Formation
              </h2>
              <div id="body-formation" className="section-body">
                <p
                  className="text-[12px] text-espresso leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: data.education.replace(/\n/g, '<br>'),
                  }}
                />
                <button
                  onClick={editEducation}
                  className="no-print mt-3 text-xs text-mocha hover:text-espresso underline transition-colors"
                >
                  Modifier
                </button>
              </div>
              <ResizeHandle sectionId="formation" onResize={setSectionHeight} />
            </div>

            <div className="relative">
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-black mb-4">
                Centres d&apos;intérêt
              </h2>
              <div id="body-interests" className="section-body">
                <p className="text-[12px] text-espresso leading-relaxed">{data.interests}</p>
                <button
                  onClick={editInterests}
                  className="no-print mt-3 text-xs text-mocha hover:text-espresso underline transition-colors"
                >
                  Modifier
                </button>
              </div>
              <ResizeHandle sectionId="interests" onResize={setSectionHeight} />
            </div>
          </aside>

          <main className="flex-1 pt-6 px-6 pb-6 md:pt-8 md:px-8 md:pb-8 lg:pt-8 lg:px-10 lg:pb-10 min-w-0 order-1 lg:order-2 min-h-full bg-white">
            <div id="main-sections" className="space-y-6 min-h-full bg-white">
              <div style={{ background: data.colors?.experienceCard ?? '#F5F0E8' }} className="overflow-hidden">
                <header
                  id="section-header"
                  data-section="header"
                  className="relative pb-0 mb-0 -mb-24"
                >
                  <div className="flex items-center justify-center gap-2 flex-wrap w-full mt-2">
                    <p className="font-display text-2xl md:text-3xl font-bold text-espresso capitalize">
                      {data.header.jobTitle || 'Poste recherché'}
                    </p>
                    <button
                      onClick={editJobTitle}
                      className="no-print text-sm text-mocha hover:text-espresso underline transition-colors"
                    >
                      Modifier
                    </button>
                  </div>
                </header>

                <section
                  id="section-profile"
                  data-section="profile"
                  className="section-card group relative -mt-48"
                >
                  <div id="body-profile" className="section-body">
                    <p className="text-mocha leading-relaxed text-[14px]">{data.profile}</p>
                    <button
                      onClick={editProfile}
                      className="no-print mt-2 text-sm text-mocha hover:text-espresso underline transition-colors"
                    >
                      Modifier
                    </button>
                  </div>
                  <ResizeHandle sectionId="profile" onResize={setSectionHeight} />
                </section>
              </div>

              <section
                id="section-experience"
                data-section="experience"
                className="section-card group relative -mt-20"
              >
                <div className="flex items-center justify-between gap-2 mb-1 mt-2">
                  <h2 className="font-display text-xl font-extrabold text-black pt-2 pb-2 border-t-2 border-b-2 border-gray-300 flex-1">
                    Expériences professionnelles
                  </h2>
                  <div className="flex no-print opacity-60 hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => moveSectionUp('experience')}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
                      title="Monter"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => moveSectionDown('experience')}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
                      title="Descendre"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div id="body-experience" className="section-body">
                  <div id="experiences-container" className="space-y-0 -mt-4">
                    {data.experiences.map((exp) => (
                      <ExperienceCard
                        key={exp.id}
                        exp={exp}
                        onEdit={() => editExperience(exp.id)}
                        onDelete={() => {
                          if (confirm('Supprimer cette expérience ?')) {
                            deleteExperience(exp.id)
                          }
                        }}
                      />
                    ))}
                  </div>
                  <button
                    onClick={handleAddExperience}
                    className="no-print mt-4 w-full py-3 px-4 rounded-xl border-2 border-dashed border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400 transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Ajouter une expérience
                  </button>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>

      <div
        id="preview-banner"
        className={`preview-banner ${previewMode ? '' : 'hidden'}`}
      >
        Aperçu du CV —{' '}
        <button className="preview-close" onClick={togglePreview}>
          Quitter l&apos;aperçu
        </button>{' '}
        (ou touche Échap)
      </div>

      <iframe
        ref={iframeRef}
        id="preview-iframe"
        className={previewMode ? '' : 'hidden'}
        title="Aperçu du CV"
      />

      <ScrollIndicators previewMode={previewMode} />

      <div className="no-print fixed bottom-6 right-6 flex flex-col gap-3">
        <button
          onClick={togglePreview}
          className="bg-warm text-espresso px-6 py-3 rounded-full shadow-lg hover:bg-mocha hover:text-cream transition-all flex items-center gap-2 font-medium"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          Aperçu
        </button>
        <button
          onClick={exportPDF}
          className="bg-espresso text-cream px-6 py-3 rounded-full shadow-lg hover:bg-mocha transition-all flex items-center gap-2 font-medium"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Exporter en PDF
        </button>
        <button
          onClick={() => window.print()}
          className="bg-warm text-espresso px-6 py-3 rounded-full shadow-lg hover:bg-mocha hover:text-cream transition-all flex items-center gap-2 font-medium"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          Imprimer
        </button>
        <button
          onClick={editColors}
          className="bg-warm text-espresso px-6 py-3 rounded-full shadow-lg hover:bg-mocha hover:text-cream transition-all flex items-center gap-2 font-medium"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2V5a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
            />
          </svg>
          Couleurs
        </button>
      </div>

      {modal && (
        <Modal
          title={modal.title}
          onClose={closeModal}
          onSave={modal.onSave}
        >
          {modal.content}
        </Modal>
      )}
    </div>
  )
}

function ExperienceCard({
  exp,
  onEdit,
  onDelete,
}: {
  exp: Experience
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div
      className="rounded-xl pl-0 pr-2 pt-6 pb-0 card-hover transition-transform no-print-exp"
      data-id={exp.id}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline gap-4">
            <h3 className="font-display text-xl font-semibold text-mocha leading-tight">
              {(exp.title || '').trim()}
            </h3>
            <span className="text-base text-mocha font-medium shrink-0 mr-0">
              {(exp.startYear || '').trim()} - {(exp.endYear || '').trim()}
            </span>
          </div>
          <p className="text-espresso font-medium text-sm mt-0.5 mb-0">
            {(exp.company || '').trim()} · {(exp.location || '').trim()}
          </p>
          <p
            className="mt-1.5 text-espresso text-[12px] leading-relaxed whitespace-pre-line"
          >
            {(exp.description || '').trim()}
          </p>
        </div>
        <div className="flex gap-2 no-print -mr-1">
          <button
            onClick={onEdit}
            className="p-2 rounded-lg hover:bg-sand text-mocha transition-colors"
            title="Modifier"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg hover:bg-red-100 text-mocha hover:text-red-600 transition-colors"
            title="Supprimer"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

function ScrollIndicators({ previewMode }: { previewMode: boolean }) {
  const [scrollPct, setScrollPct] = useState(0)
  const [fillPct, setFillPct] = useState(0)

  useEffect(() => {
    const updateScroll = () => {
      if (previewMode) return
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const pct = maxScroll <= 0 ? 100 : Math.round((window.scrollY / maxScroll) * 100)
      setScrollPct(pct)
    }
    const updateFill = () => {
      if (previewMode) return
      const card = document.getElementById('cv-card')
      if (!card) return
      const h = card.offsetHeight
      const a4Px = 297 * (96 / 25.4)
      const pct = Math.round((h / a4Px) * 100)
      setFillPct(pct)
    }
    updateScroll()
    updateFill()
    window.addEventListener('scroll', updateScroll, { passive: true })
    window.addEventListener('resize', () => {
      updateScroll()
      updateFill()
    })
    const card = document.getElementById('cv-card')
    if (card && typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => {
        updateScroll()
        updateFill()
      })
      ro.observe(card)
      return () => ro.disconnect()
    }
  }, [previewMode])

  if (previewMode) return null

  return (
    <div className="no-print fixed bottom-6 left-6 flex flex-col gap-2 z-30">
      <div
        className="px-3 py-2 rounded-full bg-espresso/90 text-cream text-sm font-medium shadow-lg"
        aria-label="Position de défilement"
        title="Où vous regardez dans la page"
      >
        Scroll: {scrollPct}%
      </div>
      <div
        className="px-3 py-2 rounded-full bg-mocha/90 text-cream text-sm font-medium shadow-lg"
        aria-label="Page remplie"
        title="Contenu = % d'une page A4"
      >
        Rempli: {fillPct}%
      </div>
    </div>
  )
}

function JobTitleForm({
  value,
  onSave,
}: {
  value: string
  onSave: (val: string) => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-mocha mb-1">
        Titre du poste visé
      </label>
      <input
        type="text"
        id="input-job-title"
        defaultValue={value}
        placeholder="Ex: Développeur Full Stack"
        className="w-full px-4 py-2 rounded-xl border border-sand bg-white focus:ring-2 focus:ring-warm focus:border-transparent"
      />
    </div>
  )
}

function HeaderForm({ data }: { data: { header: { name: string; jobTitle: string; address: string; email: string; phone: string } } }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-mocha mb-1">Nom complet</label>
        <input
          type="text"
          id="input-name"
          defaultValue={data.header.name}
          className="w-full px-4 py-2 rounded-xl border border-sand bg-white focus:ring-2 focus:ring-warm focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-mocha mb-1">Poste recherché</label>
        <input
          type="text"
          id="input-job-title"
          defaultValue={data.header.jobTitle || ''}
          placeholder="Ex: Développeur Full Stack"
          className="w-full px-4 py-2 rounded-xl border border-sand bg-white focus:ring-2 focus:ring-warm focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-mocha mb-1">Adresse</label>
        <input
          type="text"
          id="input-address"
          defaultValue={data.header.address}
          className="w-full px-4 py-2 rounded-xl border border-sand bg-white focus:ring-2 focus:ring-warm focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-mocha mb-1">Email</label>
        <input
          type="email"
          id="input-email"
          defaultValue={data.header.email}
          className="w-full px-4 py-2 rounded-xl border border-sand bg-white focus:ring-2 focus:ring-warm focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-mocha mb-1">Téléphone</label>
        <input
          type="tel"
          id="input-phone"
          defaultValue={data.header.phone}
          className="w-full px-4 py-2 rounded-xl border border-sand bg-white focus:ring-2 focus:ring-warm focus:border-transparent"
        />
      </div>
    </div>
  )
}

function TextAreaForm({
  id,
  value,
  rows,
  label,
  asInput,
}: {
  id: string
  value: string
  rows: number
  label: string
  asInput?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-mocha mb-1">{label}</label>
      {asInput ? (
        <input
          type="text"
          id={id}
          defaultValue={value}
          placeholder="JavaScript, HTML, Gestion de projet"
          className="w-full px-4 py-2 rounded-xl border border-sand bg-white focus:ring-2 focus:ring-warm focus:border-transparent"
        />
      ) : (
        <textarea
          id={id}
          rows={rows}
          defaultValue={value}
          className="w-full px-4 py-2 rounded-xl border border-sand bg-white focus:ring-2 focus:ring-warm focus:border-transparent"
        />
      )}
    </div>
  )
}

function ExperienceForm({ exp }: { exp: Experience }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-mocha mb-1">Titre du poste</label>
        <input
          type="text"
          id="input-title"
          defaultValue={exp.title}
          className="w-full px-4 py-2 rounded-xl border border-sand bg-white focus:ring-2 focus:ring-warm focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-mocha mb-1">Entreprise</label>
        <input
          type="text"
          id="input-company"
          defaultValue={exp.company}
          className="w-full px-4 py-2 rounded-xl border border-sand bg-white focus:ring-2 focus:ring-warm focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-mocha mb-1">Lieu</label>
        <input
          type="text"
          id="input-location"
          defaultValue={exp.location}
          className="w-full px-4 py-2 rounded-xl border border-sand bg-white focus:ring-2 focus:ring-warm focus:border-transparent"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-mocha mb-1">Année de début</label>
          <input
            type="text"
            id="input-start"
            defaultValue={exp.startYear}
            placeholder="2020"
            className="w-full px-4 py-2 rounded-xl border border-sand bg-white focus:ring-2 focus:ring-warm focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-mocha mb-1">Année de fin</label>
          <input
            type="text"
            id="input-end"
            defaultValue={exp.endYear}
            placeholder="2024"
            className="w-full px-4 py-2 rounded-xl border border-sand bg-white focus:ring-2 focus:ring-warm focus:border-transparent"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-mocha mb-1">Description</label>
        <textarea
          id="input-description"
          rows={4}
          defaultValue={exp.description}
          className="w-full px-4 py-2 rounded-xl border border-sand bg-white focus:ring-2 focus:ring-warm focus:border-transparent"
        />
      </div>
    </div>
  )
}
