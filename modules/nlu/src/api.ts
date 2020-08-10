import { AxiosInstance } from 'axios'
import axios from 'axios'
import { NLU } from 'botpress/sdk'
import * as sdk from 'botpress/sdk'

export interface NLUApi {
  fetchContexts: () => Promise<string[]> // TODO: remove this
  fetchIntentsWithQNAs: () => Promise<NLU.IntentDefinition[]>
  fetchIntents: () => Promise<NLU.IntentDefinition[]>
  fetchIntent: (x: string) => Promise<NLU.IntentDefinition> // TODO: remove this
  createIntent: (x: Partial<NLU.IntentDefinition>) => Promise<any> // TODO: remove this
  updateIntent: (targetIntent: string, intent: Partial<NLU.IntentDefinition>, updateTopics?: boolean) => Promise<any> // TODO: remove this
  syncIntentTopics: (intentNames?: string[]) => Promise<void> // TODO: remove this
  deleteIntent: (x: string) => Promise<any> // TODO: remove this
  fetchEntities: () => Promise<NLU.EntityDefinition[]>
  fetchEntity: (x: string) => Promise<NLU.EntityDefinition>
  createEntity: (x: NLU.EntityDefinition) => Promise<any>
  updateEntity: (targetEntityId: string, x: NLU.EntityDefinition) => Promise<any>
  deleteEntity: (x: string) => Promise<any>
  isAutoTrainOn: () => Promise<boolean>
  setAutoTrain: (autoTrain: boolean) => Promise<void>
  isTraining: () => Promise<boolean>
  train: () => Promise<void>
  cancelTraining: () => Promise<void>
}

export const makeApi = (bp: { axios: AxiosInstance }): NLUApi => ({
  fetchContexts: () => bp.axios.get('/nlu/contexts').then(res => res.data),
  fetchIntentsWithQNAs: () => bp.axios.get('/nlu/intents').then(res => res.data),
  fetchIntents: async () => {
    const { data } = await bp.axios.get('/nlu/intents')
    return data.filter(x => !x.name.startsWith('__qna__'))
  },
  fetchIntent: (intentName: string) => bp.axios.get(`/nlu/intents/${intentName}`).then(res => res.data),
  createIntent: (intent: Partial<NLU.IntentDefinition>) => bp.axios.post('/nlu/intents', intent),
  updateIntent: (targetIntent: string, intent: Partial<NLU.IntentDefinition>) =>
    bp.axios.post(`/nlu/intents/${targetIntent}`, intent),
  deleteIntent: (name: string) => bp.axios.post(`/nlu/intents/${name}/delete`),
  syncIntentTopics: (intentNames?: string[]) => bp.axios.post('/nlu/sync/intents/topics', { intentNames }),
  fetchEntities: () => bp.axios.get('/nlu/entities').then(res => res.data),
  fetchEntity: (entityName: string) => bp.axios.get(`/nlu/entities/${entityName}`).then(res => res.data),
  createEntity: (entity: NLU.EntityDefinition) => bp.axios.post('/nlu/entities/', entity),
  updateEntity: (targetEntityId: string, entity: NLU.EntityDefinition) =>
    bp.axios.post(`/nlu/entities/${targetEntityId}`, entity),
  deleteEntity: (entityId: string) => bp.axios.post(`/nlu/entities/${entityId}/delete`),
  isAutoTrainOn: () => bp.axios.get('/mod/nlu/autoTrain').then(res => res.data.isOn),
  setAutoTrain: (autoTrain: boolean) => bp.axios.post('/mod/nlu/autoTrain', { autoTrain: autoTrain }),
  isTraining: () => bp.axios.get('/mod/nlu/train').then(res => res.data.isTraining),
  train: () => bp.axios.post('/mod/nlu/train'),
  cancelTraining: () => bp.axios.post('/mod/nlu/train/delete')
})

export const createApi = async (bp: typeof sdk, botId: string) => {
  const axiosForBot = axios.create(await bp.http.getAxiosConfigForBot(botId, { localUrl: true }))
  const api = makeApi({ axios: axiosForBot })
  return api
}
