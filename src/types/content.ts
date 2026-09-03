import type {
  ChaineContent,
  PonctuationContent,
  VersContent,
  FilDesJoursContent,
  CapSurContent,
  MatchContent,
  QcmContent,
  RiviereContent,
  TimelineContent,
} from './game'

export type DomainId = 'histoire' | 'geographie' | 'sciences' | 'francais'

export interface Domain {
  id: DomainId
  label: string
  color: string
  icon: string
}

export type GradeId = 'cp' | 'ce1' | 'ce2' | 'cm1' | 'cm2' | '6e' | '5e' | '4e' | '3e'

export interface GradeLevel {
  id: GradeId
  label: string
  order: number
  enabled: boolean
}

export type Difficulty = 1 | 2 | 3

export type GameTypeId = 'qcm' | 'match' | 'timeline' | 'capsur' | 'riviere' | 'fildesjours' | 'chaine' | 'ponctuation' | 'vers'

export interface NotionGames {
  qcm?: QcmContent
  chaine?: ChaineContent
  ponctuation?: PonctuationContent
  vers?: VersContent
  match?: MatchContent
  timeline?: TimelineContent
  capsur?: CapSurContent
  riviere?: RiviereContent
  fildesjours?: FilDesJoursContent
}

export interface Notion {
  id: string
  gradeId: GradeId
  domainId: DomainId
  difficulty: Difficulty
  title: string
  summary: string
  funFact?: string
  media?: { image?: string }
  games: NotionGames
}

export interface LevelDef {
  id: string
  gradeId: GradeId
  order: number
  title: string
  notionIds: { notionId: string; gameType?: GameTypeId }[]
}
