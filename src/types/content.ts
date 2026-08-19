import type {
  IncarnationContent,
  MapClickContent,
  MatchContent,
  QcmContent,
  RiviereContent,
  SortContent,
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

export type GameTypeId = 'qcm' | 'match' | 'timeline' | 'mapclick' | 'riviere' | 'incarnation'

export interface NotionGames {
  qcm?: QcmContent
  match?: MatchContent
  timeline?: TimelineContent
  sort?: SortContent
  mapclick?: MapClickContent
  riviere?: RiviereContent
  incarnation?: IncarnationContent
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
