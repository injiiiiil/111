import type { IntegrationDefinitionProps } from '@botpress/sdk'
import { z } from 'zod'
import { FreshchatConfigurationSchema } from './schemas'

export { actions } from './actions'
export { events } from './events'
export { channels } from './channels'

export const configuration = {
  schema: FreshchatConfigurationSchema,
} satisfies IntegrationDefinitionProps['configuration']

export const user = {
  tags: {
    freshchatUserId: z.string(),
  }
} satisfies IntegrationDefinitionProps['user']
