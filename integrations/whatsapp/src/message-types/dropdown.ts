import { Types } from 'whatsapp-api-js'
import * as body from '../interactive/body'
import { chunkArray } from '../util'
import type { channels } from '.botpress'

const { Text } = Types
const { Interactive, ActionList, ListSection, Row } = Types.Interactive

type Dropdown = channels.channel.dropdown.Dropdown

const INTERACTIVE_MAX_ACTIONS_COUNT = 10
const defaultDescription = ' ' //https://github.com/Secreto31126/whatsapp-api-js/pull/53

export function* generateOutgoingMessages({ text, options }: Dropdown) {
  if (options.length === 0) {
    yield new Text(text)
  } else {
    const chunks = chunkArray(options, INTERACTIVE_MAX_ACTIONS_COUNT)

    for (const chunk of chunks) {
      const section = new ListSection(
        text.substring(0, 24),
        ...chunk.map((o) => new Row(o.value.substring(0, 200), o.label.substring(0, 24), defaultDescription))
      )
      const actionList = new ActionList(text.substring(0, 20), section)
      yield new Interactive(actionList, body.create(text))
    }
  }
}
