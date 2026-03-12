'use client'

import { useEffect, useState, useCallback } from 'react'
import type { CvData, Experience } from '@/types/cv'
import { DEFAULT_DATA } from '@/types/cv'

const STORAGE_KEY = 'cv-data'

function loadFromStorage(): CvData {
  if (typeof window === 'undefined') return JSON.parse(JSON.stringify(DEFAULT_DATA))
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) return JSON.parse(JSON.stringify(DEFAULT_DATA))
  try {
    const parsed = JSON.parse(saved) as CvData
    parsed.sectionOrder = ['header', 'profile', 'experience']
    return parsed
  } catch {
    return JSON.parse(JSON.stringify(DEFAULT_DATA))
  }
}

export function useCvData() {
  const [data, setData] = useState<CvData>(() => loadFromStorage())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setData(loadFromStorage())
  }, [])

  const saveData = useCallback((next: CvData | ((prev: CvData) => CvData)) => {
    setData((prev) => {
      const nextData = typeof next === 'function' ? next(prev) : next
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData))
      }
      return nextData
    })
  }, [])

  const updateHeader = useCallback(
    (header: Partial<CvData['header']>) => {
      saveData((d) => ({ ...d, header: { ...d.header, ...header } }))
    },
    [saveData]
  )

  const updateProfile = useCallback(
    (profile: string) => saveData((d) => ({ ...d, profile })),
    [saveData]
  )

  const addExperience = useCallback(() => {
    const id = 'exp-' + Date.now()
    const newExp: Experience = {
      id,
      title: '',
      company: '',
      location: '',
      startYear: '',
      endYear: '',
      description: '',
    }
    saveData((d) => ({
      ...d,
      experiences: [newExp, ...d.experiences],
    }))
    return id
  }, [saveData])

  const updateExperience = useCallback(
    (id: string, exp: Partial<Experience>) => {
      saveData((d) => ({
        ...d,
        experiences: d.experiences.map((e) =>
          e.id === id ? { ...e, ...exp } : e
        ),
      }))
    },
    [saveData]
  )

  const deleteExperience = useCallback(
    (id: string) => {
      saveData((d) => ({
        ...d,
        experiences: d.experiences.filter((e) => e.id !== id),
      }))
    },
    [saveData]
  )

  const updateEducation = useCallback(
    (education: string) => saveData((d) => ({ ...d, education })),
    [saveData]
  )

  const updateSkills = useCallback(
    (skills: string[]) => saveData((d) => ({ ...d, skills })),
    [saveData]
  )

  const updateInterests = useCallback(
    (interests: string) => saveData((d) => ({ ...d, interests })),
    [saveData]
  )

  const updateColors = useCallback(
    (colors: CvData['colors']) => saveData((d) => ({ ...d, colors })),
    [saveData]
  )

  const updateBlockBackground = useCallback(
    (blockId: string, color: string | null) => {
      saveData((d) => {
        const next = { ...(d.blockBackgrounds || {}) }
        if (color) next[blockId] = color
        else delete next[blockId]
        const blockBackgrounds = Object.keys(next).length ? next : undefined
        return { ...d, blockBackgrounds }
      })
    },
    [saveData]
  )

  const moveSectionUp = useCallback(
    (sectionId: string) => {
      const order = [...(data.sectionOrder || ['header', 'profile', 'experience'])]
      const idx = order.indexOf(sectionId)
      if (idx <= 0 || sectionId === 'header' || order[idx - 1] === 'header') return
      ;[order[idx - 1], order[idx]] = [order[idx], order[idx - 1]]
      saveData((d) => ({ ...d, sectionOrder: order }))
    },
    [data.sectionOrder, saveData]
  )

  const moveSectionDown = useCallback(
    (sectionId: string) => {
      const order = [...(data.sectionOrder || ['header', 'profile', 'experience'])]
      const idx = order.indexOf(sectionId)
      if (idx < 0 || idx >= order.length - 1 || sectionId === 'header') return
      ;[order[idx], order[idx + 1]] = [order[idx + 1], order[idx]]
      saveData((d) => ({ ...d, sectionOrder: order }))
    },
    [data.sectionOrder, saveData]
  )

  const setSectionHeight = useCallback(
    (sectionId: string, height: number | null) => {
      saveData((d) => ({
        ...d,
        sectionHeights: {
          ...d.sectionHeights,
          [sectionId]: height,
        },
      }))
    },
    [saveData]
  )

  const resetToDefault = useCallback(() => {
    const fresh = JSON.parse(JSON.stringify(DEFAULT_DATA))
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh))
    }
    setData(fresh)
  }, [])

  return {
    data,
    mounted,
    saveData,
    resetToDefault,
    updateBlockBackground,
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
  }
}
