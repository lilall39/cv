'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

function capitalizeFirstOnly(str: string): string {
  if (!str || !str.length) return str
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}
import { useCvData } from '@/lib/useCvData'
import { Modal } from './Modal'
import type { Experience } from '@/types/cv'
import { DEFAULT_DATA, PALETTES } from '@/types/cv'

export default function CvPage() {
  const {
    data,
    updateHeader,
    updateProfile,
    addExperience,
    updateExperience,
    deleteExperience,
    updateEducation,
    updateSkills,
    updateInterests,
    updateColors,
    updateBlockBackground,
    updateHideProfileTitle,
    moveSectionUp,
    moveSectionDown,
    resetToDefault,
    saveData,
  } = useCvData()

  const [modal, setModal] = useState<{
    title: string
    content: React.ReactNode
    onSave: () => void
  } | null>(null)
  const [showNewCvConfirm, setShowNewCvConfirm] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const cvContentRef = useRef<HTMLDivElement>(null)
  const importInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const remove = () => {
      const el = document.getElementById('section-header')
      if (el) el.remove()
    }
    remove()
    const t = setTimeout(remove, 100)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const container = document.getElementById('main-sections')
    if (!container) return
    const order = (data.sectionOrder || ['header', 'profile', 'experience'])
      .filter((id) => id === 'header' || id === 'experience')
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

  const downloadCvJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cv-${new Date().toISOString().slice(0, 10)}.json`
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 100)
  }, [data])

  const exportPDF = useCallback(() => {
    if (typeof window === 'undefined') return
    const cleanup = () => {
      document.body.classList.remove('export-pdf')
      document.documentElement.classList.remove('export-pdf')
    }
    window.addEventListener('afterprint', cleanup, { once: true })
    window.scrollTo(0, 0)
    document.body.classList.add('export-pdf')
    document.documentElement.classList.add('export-pdf')
    requestAnimationFrame(() => {
      requestAnimationFrame(() => window.print())
    })
  }, [])

  const handleNewCvYes = useCallback(() => {
    setShowNewCvConfirm(false)
    const onAfterPrint = () => {
      resetToDefault()
      window.removeEventListener('afterprint', onAfterPrint)
    }
    window.addEventListener('afterprint', onAfterPrint)
    exportPDF()
  }, [exportPDF, resetToDefault])

  const handleNewCvNo = useCallback(() => {
    resetToDefault()
    setShowNewCvConfirm(false)
  }, [resetToDefault])

  const handleNewCvDownloadData = useCallback(() => {
    downloadCvJson()
    resetToDefault()
    setShowNewCvConfirm(false)
  }, [downloadCvJson, resetToDefault])

  const handleImportClick = useCallback(() => {
    importInputRef.current?.click()
  }, [])

  const handleImportFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      if (!file.name.toLowerCase().endsWith('.json')) {
        alert('Sélectionnez un fichier .json (obtenu via "Télécharger (.json)"), pas un PDF.')
        e.target.value = ''
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        try {
          let text = (reader.result as string) || ''
          if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1)
          const parsed = JSON.parse(text)
          if (!parsed || typeof parsed !== 'object') throw new Error('Format invalide')
          const p = parsed as Record<string, unknown>
          const safeExperiences = Array.isArray(p.experiences)
            ? p.experiences.map((exp: unknown, i: number) => {
                const e = (exp && typeof exp === 'object' ? exp : {}) as Record<string, unknown>
                return {
                  id: typeof e.id === 'string' ? e.id : `exp-${Date.now()}-${i}`,
                  title: String(e.title ?? ''),
                  company: String(e.company ?? ''),
                  location: String(e.location ?? ''),
                  startYear: String(e.startYear ?? ''),
                  endYear: String(e.endYear ?? ''),
                  description: String(e.description ?? ''),
                }
              })
            : DEFAULT_DATA.experiences
          const h = (p.header && typeof p.header === 'object') ? (p.header as Record<string, unknown>) : {}
          const merged = {
            ...DEFAULT_DATA,
            header: {
              name: String(h.name ?? DEFAULT_DATA.header.name),
              jobTitle: String(h.jobTitle ?? DEFAULT_DATA.header.jobTitle),
              address: String(h.address ?? DEFAULT_DATA.header.address),
              email: String(h.email ?? DEFAULT_DATA.header.email),
              phone: String(h.phone ?? DEFAULT_DATA.header.phone),
            },
            profile: String(p.profile ?? DEFAULT_DATA.profile),
            experiences: safeExperiences,
            education: String(p.education ?? DEFAULT_DATA.education),
            skills: Array.isArray(p.skills) ? p.skills.map((s: unknown) => String(s ?? '')) : DEFAULT_DATA.skills,
            interests: String(p.interests ?? DEFAULT_DATA.interests),
            sectionOrder: Array.isArray(p.sectionOrder) ? p.sectionOrder : DEFAULT_DATA.sectionOrder,
            sectionHeights: (p.sectionHeights && typeof p.sectionHeights === 'object' && !Array.isArray(p.sectionHeights))
              ? (p.sectionHeights as Record<string, number | null>)
              : {},
            colors: (() => {
              const col = (p.colors && typeof p.colors === 'object') ? (p.colors as Record<string, unknown>) : {}
              return {
                sidebar: String(col.sidebar ?? DEFAULT_DATA.colors.sidebar),
                main: String(col.main ?? DEFAULT_DATA.colors.main),
                experienceCard: String(col.experienceCard ?? DEFAULT_DATA.colors.experienceCard),
              }
            })(),
            blockBackgrounds: (p.blockBackgrounds && typeof p.blockBackgrounds === 'object' && !Array.isArray(p.blockBackgrounds))
              ? Object.fromEntries(
                  Object.entries(p.blockBackgrounds).filter(
                    ([_, v]) => typeof v === 'string' && /^#[0-9A-Fa-f]{3,8}$/.test(v)
                  )
                )
              : undefined,
            hideProfileTitle: p.hideProfileTitle === true,
          }
          saveData(merged)
        } catch (err) {
          alert('Fichier invalide. Assurez-vous de sélectionner un fichier .json téléchargé via "Télécharger (.json)".')
        }
      }
      reader.readAsText(file, 'UTF-8')
      e.target.value = ''
    },
    [saveData]
  )

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
        label="Présentation (Entrée pour aller à la ligne)"
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
        value={data.skills.join('\n\n')}
        rows={6}
        label="Compétences (une par ligne ; ligne vide = nouvelle compétence ; Entrée à l'intérieur d'une ligne)"
      />,
      () => {
        const val = (document.getElementById('input-skills') as HTMLTextAreaElement)?.value || ''
        const skills = val.split(/\n\s*\n/).map((s) => s.replace(/\r\n/g, '\n').trim()).filter(Boolean)
        updateSkills(skills)
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
        label="Centres d'intérêt (Entrée pour retour à la ligne)"
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
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[50vh] overflow-y-auto">
        {PALETTES.map((p) => {
          const i = PALETTES.indexOf(p)
          const selected = c.sidebar === p.sidebar && c.main === p.main && c.experienceCard === p.experienceCard
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
                {[p.sidebar, p.main, p.experienceCard].map((color) => {
                  const isLight = ['#fff', '#ffffff', '#f5f5f5', '#fafafa', '#faf8f5', '#f5f8fc', '#f8f5fc'].includes(color.toLowerCase())
                  return (
                    <span
                      key={color}
                      className="w-8 h-8 rounded-lg shrink-0 border"
                      style={{
                        background: color,
                        boxShadow: isLight ? 'inset 0 0 0 1px rgba(0,0,0,0.25)' : 'inset 0 0 0 1px rgba(0,0,0,0.08)',
                        borderColor: isLight ? 'rgba(0,0,0,0.15)' : 'transparent',
                      }}
                    />
                  )
                })}
              </div>
              <span className="text-sm font-medium text-espresso">{p.name}</span>
            </button>
          )
        })}
        </div>
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
<style>body{font-family:Outfit,sans-serif;background:white;color:#3D2C29;margin:0;padding:0;min-height:100vh;display:flex;justify-content:center;align-items:center}.section-body{overflow:visible!important}#body-skills{overflow:visible!important;max-height:none!important}#body-skills span{display:block!important;white-space:pre-line!important}#cv-content{border:none!important;box-shadow:none!important;width:200mm!important}#cv-sidebar{border-right:2px solid #8B7B6F!important;box-shadow:none!important}#cv-sidebar{display:flex!important;flex-direction:column!important;overflow-x:hidden!important;overflow-wrap:break-word!important;min-width:0!important;max-width:240px!important}#cv-sidebar *{overflow-wrap:break-word!important;word-break:break-word!important}#cv-sidebar > *{min-width:0!important;max-width:100%!important}#cv-sidebar>*{flex:0 0 auto!important;min-height:auto!important}#cv-card{border:2px solid #8B7B6F!important;box-shadow:none!important;width:200mm!important;height:287mm!important;background:white!important}.hide-in-preview-export{display:none!important}#section-experience{padding-top:0.25rem!important}#section-experience>div:first-child{padding-top:2.25rem!important}#section-experience>div:first-child h2{padding-top:0!important}#body-profile p{margin-top:-1rem!important}</style></head>
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

  const c = data.colors || { sidebar: '#E8E2D8', main: '#FAF8F5', experienceCard: '#F5F0E8' }
  const bgPage = '#E8E4E0'
  const getBlockBg = (blockId: string): string => {
    const custom = data.blockBackgrounds?.[blockId]
    if (custom) return custom
    switch (blockId) {
      case 'contact':
      case 'skills':
      case 'formation':
      case 'interests':
      case 'headerProfile':
        return c.sidebar
      case 'experience':
        return c.main
      default:
        return c.main
    }
  }
  const darkenHex = (hex: string, factor: number): string => {
    let h = hex
    if (/^#?([a-f\d])([a-f\d])([a-f\d])$/i.test(h)) {
      h = `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`
    }
    const m = h.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
    if (!m) return hex
    const r = Math.max(0, Math.round(parseInt(m[1], 16) * (1 - factor)))
    const g = Math.max(0, Math.round(parseInt(m[2], 16) * (1 - factor)))
    const b = Math.max(0, Math.round(parseInt(m[3], 16) * (1 - factor)))
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }
  /** Couleur de bordure = 2 tons plus foncé que la couleur du bloc */
  const borderColorFromBlock = (blockId: string): string =>
    darkenHex(darkenHex(getBlockBg(blockId), 0.4), 0.4)
  const getBlockColorFromPalette = (bid: string, p: (typeof PALETTES)[0]): string => {
    switch (bid) {
      case 'contact':
      case 'skills':
      case 'formation':
      case 'interests':
      case 'headerProfile':
        return p.sidebar
      case 'experience':
        return p.main
      default:
        return p.sidebar
    }
  }
  const BlockColorButton = ({ blockId, label }: { blockId: string; label: string }) => {
    const current = getBlockBg(blockId)
    return (
      <span className="no-print inline-flex flex-wrap items-center gap-1 ml-1">
        {PALETTES.map((p) => {
          const color = getBlockColorFromPalette(blockId, p)
          const selected = current === color
          return (
            <button
              key={p.name}
              type="button"
              onClick={() => updateBlockBackground(blockId, color)}
              className={`no-print w-6 h-6 rounded border-2 shrink-0 hover:ring-2 hover:ring-mocha/50 transition-all ${
                selected ? 'ring-2 ring-mocha border-mocha' : 'border-gray-400'
              }`}
              style={{ background: color }}
              title={p.name}
            />
          )
        })}
        <span className="no-print relative w-6 h-6 shrink-0">
          <span
            className="absolute inset-0 w-6 h-6 rounded border-2 border-mocha/30 cursor-pointer bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400 hover:ring-2 hover:ring-mocha/50 pointer-events-none"
            aria-hidden
          />
          <input
            type="color"
            value={current}
            onChange={(e) => updateBlockBackground(blockId, e.target.value)}
            onDoubleClick={() => updateBlockBackground(blockId, null)}
            className="absolute inset-0 w-full h-full rounded opacity-0 cursor-pointer"
            title={`Couleur : ${label}. Double-clic = réinitialiser.`}
          />
        </span>
      </span>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-4 md:py-6" style={{ background: bgPage }}>
      <div
        id="cv-content"
        ref={cvContentRef}
        className="w-full max-w-[900px] pl-4 pr-0 shadow-none"
        style={{ background: bgPage }}
      >
        <div id="cv-card" className="flex flex-col lg:flex-row gap-0 overflow-hidden shadow-none">
          <aside
            id="cv-sidebar"
            className="lg:w-60 shrink-0 flex-1 lg:flex-initial text-espresso pt-0 px-0 order-2 lg:order-1 flex flex-col w-full overflow-hidden self-stretch min-h-0"
            style={{ background: c.sidebar }}
          >
            <div className="relative w-full min-w-0 flex-1 min-h-[80px] p-4 pt-4 rounded-none flex flex-col" style={{ background: getBlockBg('contact') }}>
              <div id="body-contact" className="section-body">
                <div className="mb-4 mt-8">
                  <div className="flex items-center justify-center gap-2 mb-1 flex-wrap">
                    <h1 className="font-display font-bold text-espresso text-xl md:text-2xl">
                      {data.header.name}
                    </h1>
                    <button
                      onClick={editHeader}
                      className="no-print text-sm font-bold text-green-700 hover:text-green-800 underline transition-colors"
                    >
                      Modifier
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1 mb-4">
                  <h2 className="font-display text-sm font-bold uppercase tracking-wider text-black">
                    Contact
                  </h2>
                  <BlockColorButton blockId="contact" label="Contact" />
                </div>
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
                  className="no-print mt-4 text-xs font-bold text-green-700 hover:text-green-800 underline transition-colors"
                >
                  Modifier
                </button>
              </div>
            </div>

            <div className="relative w-full flex-1 min-h-[60px] p-4 pt-0 rounded-none flex flex-col border-b-2" style={{ background: getBlockBg('skills'), borderColor: borderColorFromBlock('skills') }}>
              <div className="flex items-center justify-center gap-1 mb-4 mt-4">
                <h2 className="font-display text-sm font-bold uppercase tracking-wider text-black">
                  Compétences
                </h2>
                <BlockColorButton blockId="skills" label="Compétences" />
              </div>
              <div id="body-skills" className="section-body">
                <div className="flex flex-col gap-1">
                  {data.skills.map((skill, i) => (
                    <span
                      key={`skill-${i}`}
                      className="text-espresso text-xs font-medium block [&>br]:block"
                      dangerouslySetInnerHTML={{
                        __html: skill.replace(/\n/g, '<br />'),
                      }}
                    />
                  ))}
                </div>
                <button
                  onClick={editSkills}
                  className="no-print mt-3 text-xs font-bold text-green-700 hover:text-green-800 underline transition-colors"
                >
                  Modifier
                </button>
              </div>
            </div>

            <div className="relative w-full flex-1 min-h-[60px] p-4 pt-0 rounded-none flex flex-col border-b-2" style={{ background: getBlockBg('formation'), borderColor: borderColorFromBlock('formation') }}>
              <div className="flex items-center justify-center gap-1 mb-4 mt-4">
                <h2 className="font-display text-sm font-bold uppercase tracking-wider text-black">
                  Formation
                </h2>
                <BlockColorButton blockId="formation" label="Formation" />
              </div>
              <div id="body-formation" className="section-body">
                <p
                  className="text-[12px] text-espresso leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: data.education.replace(/\n/g, '<br>'),
                  }}
                />
                <button
                  onClick={editEducation}
                  className="no-print mt-3 text-xs font-bold text-green-700 hover:text-green-800 underline transition-colors"
                >
                  Modifier
                </button>
              </div>
            </div>

            <div className="relative w-full flex-1 min-h-[60px] p-4 pt-0 rounded-none flex flex-col border-b-2" style={{ background: getBlockBg('interests'), borderColor: borderColorFromBlock('interests') }}>
              <div className="flex items-center justify-center gap-1 mb-4 mt-4">
                <h2 className="font-display text-sm font-bold uppercase tracking-wider text-black">
                  Centres d&apos;intérêt
                </h2>
                <BlockColorButton blockId="interests" label="Centres d'intérêt (Entrée pour retour à la ligne)" />
              </div>
              <div id="body-interests" className="section-body">
                <p
                  className="text-[12px] text-espresso leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: data.interests.replace(/\n/g, '<br>'),
                  }}
                />
                <button
                  onClick={editInterests}
                  className="no-print mt-3 text-xs font-bold text-green-700 hover:text-green-800 underline transition-colors"
                >
                  Modifier
                </button>
              </div>
            </div>
          </aside>

          <main id="cv-main-column" className="flex-1 pt-0 pb-6 md:pb-8 px-0 min-w-0 order-1 lg:order-2 min-h-full w-full overflow-hidden" style={{ background: getBlockBg('experience') }}>
            <div id="main-sections" className="w-full space-y-0 min-h-full">
              <div
                id="section-profile"
                data-section="profile"
                style={{ backgroundColor: getBlockBg('headerProfile'), borderColor: '#8B7B6F' }}
                className="w-full rounded-2xl border-2 py-4 px-4"
              >
                <div
                  className={`flex items-center gap-1 mb-2 flex-wrap ${data.hideProfileTitle ? 'hide-in-preview-export' : ''}`}
                >
                  <h2 className="font-display text-sm font-bold uppercase tracking-wider text-black">
                    Profil
                  </h2>
                  <BlockColorButton blockId="headerProfile" label="Profil" />
                  <label className="no-print inline-flex items-center gap-1.5 ml-2 text-xs font-bold text-green-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!data.hideProfileTitle}
                      onChange={(e) => updateHideProfileTitle(e.target.checked)}
                      className="rounded border-green-700/50"
                    />
                    Masquer le titre en aperçu et téléchargement
                  </label>
                </div>
                <div id="body-profile" className="section-body mt-10">
                  <p className="text-mocha leading-relaxed text-[14px] whitespace-pre-line -mt-4">{data.profile}</p>
                  <button
                    onClick={editProfile}
                    className="no-print mt-2 text-sm font-bold text-green-700 hover:text-green-800 underline transition-colors"
                  >
                    Modifier
                  </button>
                </div>
              </div>
              <section
                id="section-experience"
                data-section="experience"
                className="section-card group relative w-full pt-0 px-4 pb-4 rounded-none"
                style={{ background: getBlockBg('experience') }}
              >
                <div className="flex items-center justify-between gap-2 mb-1 pt-28">
                  <h2
                    className="font-display text-xl font-extrabold text-black flex-1 rounded-full border-2 px-4 py-2 w-fit"
                    style={{ borderColor: borderColorFromBlock('experience') }}
                  >
                    Expériences professionnelles
                  </h2>
                  <div className="flex no-print items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                    <BlockColorButton blockId="experience" label="Expériences" />
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

      <ScrollIndicators previewMode={previewMode} onTogglePreview={togglePreview} />

      <div className="no-print fixed left-1 sm:left-6 sm:top-1/2 top-20 flex flex-col gap-3 z-30">
        <button
          onClick={exportPDF}
          className="bg-gray-500 text-white px-3 py-2 sm:px-6 sm:py-3 rounded-full shadow-lg hover:bg-gray-600 transition-all flex items-center gap-2 font-medium"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
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
          <span className="text-xs sm:text-base">PDF</span>
        </button>
        <button
          onClick={exportPDF}
          className="bg-gray-500 text-white px-3 py-2 sm:px-6 sm:py-3 rounded-full shadow-lg hover:bg-gray-600 transition-all flex items-center gap-2 font-medium"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
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
          <span className="text-xs sm:text-base">Imprimer</span>
        </button>
      </div>

      <div className="no-print fixed right-1 sm:right-6 sm:top-1/2 top-20 flex flex-col gap-3 z-40">
        <button
          type="button"
          onClick={downloadCvJson}
          className="bg-gray-600 text-white px-3 py-2 sm:px-6 sm:py-3 rounded-full shadow-lg hover:bg-gray-700 transition-all flex items-center justify-center gap-2 font-medium sm:w-[210px] w-fit"
          title="Sauvegarde un fichier .json pour importer plus tard"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 shrink-0"
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
          <span className="text-left leading-tight block text-[10px] sm:text-sm">Données</span>
        </button>
        <button
          onClick={handleImportClick}
          className="bg-gray-600 text-white px-3 py-2 sm:px-6 sm:py-3 rounded-full shadow-lg hover:bg-gray-700 transition-all flex items-center justify-center gap-2 font-medium sm:w-[210px] w-fit text-center"
          title="Charger un CV depuis un fichier .json"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          <span className="leading-tight block text-[10px] sm:text-sm">Importer</span>
        </button>
        <input
          ref={importInputRef}
          type="file"
          className="hidden"
          onChange={handleImportFile}
        />
      </div>

      <div className="no-print fixed sm:top-4 sm:bottom-6 bottom-4 top-auto right-1 sm:right-6 flex flex-col justify-between items-end z-30 pointer-events-none">
        <div className="flex flex-col gap-2 pointer-events-auto sm:mt-8 mt-0">
          <div className="relative group">
          <button
            onClick={() => setShowNewCvConfirm(true)}
            className="bg-green-200 text-green-900 px-6 py-3 rounded-full shadow-lg hover:bg-green-300 transition-all flex items-center justify-center gap-2 font-medium shrink-0 sm:w-[210px] w-fit"
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
            Nouveau CV
          </button>
          <div className="absolute left-0 top-full mt-2 hidden group-hover:block z-40 w-56 p-3 rounded-xl bg-espresso text-cream text-sm shadow-lg">
            Créez un nouveau CV. Vous pourrez sauvegarder le CV actuel au format PDF avant de continuer.
          </div>
        </div>
        </div>
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
      {showNewCvConfirm && (
        <div
          className="fixed inset-0 bg-espresso/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowNewCvConfirm(false)}
        >
          <div className="bg-oat rounded-2xl shadow-2xl max-w-md w-full p-6">
            <p className="text-espresso mb-6">
              Sauvegarder le CV actuel avant de continuer ?
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleNewCvYes}
                className="w-full py-2.5 rounded-xl bg-espresso text-cream hover:bg-mocha transition-colors"
              >
                Oui, télécharger en PDF
              </button>
              <button
                onClick={handleNewCvDownloadData}
                className="w-full py-2.5 rounded-xl border border-espresso text-espresso hover:bg-sand transition-colors"
              >
                Oui, télécharger vos données (pour réutilisation sur l&apos;appli)
              </button>
              <button
                onClick={handleNewCvNo}
                className="w-full py-2.5 rounded-xl border border-mocha text-mocha hover:bg-sand transition-colors"
              >
                Non, continuer
              </button>
              <button
                onClick={() => setShowNewCvConfirm(false)}
                className="w-full py-2.5 rounded-xl text-mocha hover:bg-sand transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
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
            className="p-2 rounded-lg hover:bg-sand text-green-700 font-bold hover:text-green-800 transition-colors"
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

function ScrollIndicators({ previewMode, onTogglePreview }: { previewMode: boolean; onTogglePreview: () => void }) {
  if (previewMode) return null

  return (
    <>
      <div
        className="no-print fixed top-4 z-30 flex flex-col items-start gap-2 left-1 sm:left-auto"
        style={{ right: 'calc(50% + 450px + 1.5rem)' }}
      >
        <Link
          href="/"
          className="text-[calc(1rem+1pt)] text-green-700 hover:text-green-800 transition-colors w-fit whitespace-nowrap"
        >
          ← Accueil
        </Link>
      </div>
      <div className="no-print fixed sm:top-4 sm:bottom-auto bottom-4 left-1 sm:left-6 z-30">
        <button
          onClick={onTogglePreview}
          className="bg-green-200 text-green-900 px-6 py-3 rounded-full shadow-lg hover:bg-green-300 transition-all flex items-center gap-2 font-medium w-fit sm:mt-8 mt-0"
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
      </div>
    </>
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
