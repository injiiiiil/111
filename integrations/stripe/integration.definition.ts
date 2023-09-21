import { IntegrationDefinition } from '@botpress/sdk'
import { name } from './package.json'

import {
  configuration,
  states,
  user,
  channels,
  events,
  actions,
} from './src/definitions'

export default new IntegrationDefinition({
  name,
  version: '0.2.0',
  title: 'Stripe',
  readme: 'readme.md',
  icon: 'icon.svg',
  configuration,
  channels,
  user,
  actions,
  events,
  states,
})
