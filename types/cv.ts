export interface CvHeader {
  name: string
  jobTitle: string
  address: string
  email: string
  phone: string
}

export interface Experience {
  id: string
  title: string
  company: string
  location: string
  startYear: string
  endYear: string
  description: string
}

export interface CvColors {
  sidebar: string
  main: string
  experienceCard: string
}

export interface CvData {
  header: CvHeader
  profile: string
  experiences: Experience[]
  education: string
  skills: string[]
  interests: string
  sectionOrder: string[]
  sectionHeights: Record<string, number | null>
  colors: CvColors
  /** Couleurs d'arrière-plan par bloc (contact, skills, formation, interests, headerProfile, experience) */
  blockBackgrounds?: Record<string, string>
}

export const BLOCK_IDS = ['contact', 'skills', 'formation', 'interests', 'headerProfile', 'experience'] as const

export const DEFAULT_DATA: CvData = {
  header: {
    name: 'Prénom Nom',
    jobTitle: 'Poste recherché',
    address: 'Paris, France',
    email: 'email@exemple.com',
    phone: '+33 6 00 00 00 00',
  },
  profile:
    "Rédigez une brève présentation professionnelle mettant en avant vos compétences clés et objectifs de carrière...",
  experiences: [
    {
      id: 'exp-1',
      title: "Titre du poste",
      company: "Nom de l'entreprise",
      location: 'Paris',
      startYear: '2022',
      endYear: '2024',
      description: 'Description des responsabilités et réalisations...',
    },
  ],
  education:
    'Master en... - Université - 2022\nLicence en... - Université - 2020',
  skills: ['JavaScript', 'HTML/CSS', 'Gestion de projet', 'Communication'],
  interests: 'Lecture, Voyages, Photographie, Musique...',
  sectionOrder: ['header', 'profile', 'experience'],
  sectionHeights: {},
  colors: {
    sidebar: '#E8E2D8',
    main: '#FAF8F5',
    experienceCard: '#F5F0E8',
  },
}

export const PALETTES: Array<{ name: string } & CvColors> = [
  {
    name: 'Blanc pur',
    sidebar: '#F5F5F5',
    main: '#FFFFFF',
    experienceCard: '#FAFAFA',
  },
  {
    name: 'Classique',
    sidebar: '#E8E2D8',
    main: '#FAF8F5',
    experienceCard: '#F5F0E8',
  },
  {
    name: 'Bleu nuit',
    sidebar: '#E8EDF5',
    main: '#F5F8FC',
    experienceCard: '#EBF0F7',
  },
  {
    name: 'Vert forêt',
    sidebar: '#E5EDE8',
    main: '#F5FAF7',
    experienceCard: '#EBF3EF',
  },
  {
    name: 'Lavande',
    sidebar: '#EDE8F5',
    main: '#F8F5FC',
    experienceCard: '#F0EBF7',
  },
  {
    name: 'Pierre',
    sidebar: '#E5E5E0',
    main: '#F5F5F2',
    experienceCard: '#EBEBE8',
  },
  {
    name: 'Crème chaud',
    sidebar: '#F0E8D8',
    main: '#FAF5ED',
    experienceCard: '#F5EDE0',
  },
  {
    name: 'Gris élégant',
    sidebar: '#E0E0E0',
    main: '#F0F0F0',
    experienceCard: '#E8E8E8',
  },
]
