import { AxiosInstance } from 'axios'
import sdk from 'botpress/sdk'
import LRUCache from 'lru-cache'

export const BIO = {
  INSIDE: 'I',
  BEGINNING: 'B',
  OUT: 'o'
} as _.Dictionary<Tag>

export type Tag = 'o' | 'B' | 'I'

export type Token2Vec = { [token: string]: number[] }

export interface Gateway {
  source: LanguageSource
  client: AxiosInstance
  errors: number
  disabledUntil?: Date
}

export interface LangsGateway {
  [lang: string]: Gateway[]
}

export interface LanguageProvider {
  languages: string[]
  langServerInfo: LangServerInfo
  vectorize(tokens: string[], lang: string): Promise<Float32Array[]>
  tokenize(utterances: string[], lang: string, vocab?: Token2Vec): Promise<string[][]>
  generateSimilarJunkWords(subsetVocab: string[], lang: string): Promise<string[]>
  getHealth(): Partial<NLUHealth>
}

export interface LanguageSource {
  /** The endpoint URL of the source */
  endpoint: string
  /** The authentication token, if required by the source */
  authToken?: string
}

export interface NLUHealth {
  isEnabled: boolean
  validProvidersCount: number
  validLanguages: string[]
}

export interface NluMlRecommendations {
  minUtterancesForML: number
  goodUtterancesForML: number
}

export interface NLUEngine {
  loadModel: (m: any) => Promise<void>
  train: (
    intentDefs: sdk.NLU.IntentDefinition[],
    entityDefs: sdk.NLU.EntityDefinition[],
    languageCode: string,
    trainingSession?: TrainingSession,
    options?: any
  ) => Promise<any>
  predict: (t: string, ctx: string[]) => Promise<sdk.IO.EventUnderstanding>
}

export type NLUState = {
  nluByBot: _.Dictionary<BotState>
  languageProvider?: LanguageProvider
  health?: NLUHealth
  broadcastLoadModel?: (botId: string, hash: string, language: string) => Promise<void>
  broadcastCancelTraining?: (botId: string, language: string) => Promise<void>
} & NLUVersionInfo

export interface NLUVersionInfo {
  nluVersion: string
  langServerInfo: LangServerInfo
}

export interface LangServerInfo {
  version: string
  domain: string
  dim: number
}

export interface BotState {
  botId: string
  engine: NLUEngine
  trainWatcher: sdk.ListenHandle
  trainOrLoad: (forceTrain: boolean) => Promise<void>
  trainSessions: _.Dictionary<TrainingSession>
  cancelTraining: () => Promise<void>
  isTraining: () => Promise<boolean>
}

export type TFIDF = _.Dictionary<number>

export type PatternEntity = Readonly<{
  name: string
  pattern: string
  examples: string[]
  matchCase: boolean
  sensitive: boolean
}>

export type ListEntity = Readonly<{
  name: string
  synonyms: { [canonical: string]: string[] }
  fuzzyTolerance: number
  sensitive: boolean
}>

export type EntityCache = LRUCache<string, EntityExtractionResult[]>
export type EntityCacheDump = LRUCache.Entry<string, EntityExtractionResult[]>[]

export type ListEntityModel = {
  type: 'custom.list'
  id: string
  languageCode: string
  entityName: string
  fuzzyTolerance: number
  sensitive: boolean
  /** @example { 'Air Canada': [ ['Air', '_Canada'], ['air', 'can'] ] } */
  mappingsTokens: _.Dictionary<string[][]>
  cache?: EntityCache | EntityCacheDump
}

export type ExtractedSlot = {
  confidence: number
  name: string
  source: string
  value: any
  entity?: EntityExtractionResult
}

export type SlotExtractionResult = { slot: ExtractedSlot; start: number; end: number }
export type EntityExtractor = 'system' | 'list' | 'pattern'
export interface ExtractedEntity {
  confidence: number
  type: string
  metadata: {
    source: string
    entityId: string
    extractor: EntityExtractor
    unit?: string
    occurrence?: string
  }
  sensitive?: boolean
  value: string
}
export type EntityExtractionResult = ExtractedEntity & { start: number; end: number }

export interface TrainingSession {
  status: 'training' | 'canceled' | 'done' | 'idle'
  language: string
  progress: number
  lock?: sdk.RedisLock
}

export interface Tools {
  tokenize_utterances(utterances: string[], languageCode: string, vocab?: Token2Vec): Promise<string[][]>
  vectorize_tokens(tokens: string[], languageCode: string): Promise<number[][]>
  partOfSpeechUtterances(utterances: string[][], languageCode: string): string[][]
  generateSimilarJunkWords(vocabulary: string[], languageCode: string): Promise<string[]>
  reportTrainingProgress(botId: string, message: string, trainSession: TrainingSession): void
  duckling: SystemEntityExtractor
  mlToolkit: typeof sdk.MLToolkit
}

export interface NLUProgressEvent {
  type: 'nlu'
  working: boolean
  botId: string
  message: string
  trainSession: TrainingSession
}

export interface SystemEntityExtractor {
  extractMultiple(input: string[], lang: string, useCache?: Boolean): Promise<EntityExtractionResult[][]>
  extract(input: string, lang: string): Promise<EntityExtractionResult[]>
}

export type Intent<T> = Readonly<{
  name: string
  contexts: string[]
  slot_definitions: SlotDefinition[]
  utterances: T[]
  vocab?: _.Dictionary<boolean>
  slot_entities?: string[]
}>

type SlotDefinition = Readonly<{
  name: string
  entities: string[]
}>
