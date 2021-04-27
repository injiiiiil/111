import * as sdk from 'botpress/sdk'
import { TwilioContext } from '../backend/typings'

export class TwilioChoicesRenderer implements sdk.ChannelRenderer<TwilioContext> {
  get channel(): string {
    return 'twilio'
  }

  get priority(): number {
    return 1
  }

  get id() {
    return TwilioChoicesRenderer.name
  }

  handles(context: TwilioContext): boolean {
    return context.payload.choices?.length && context.messages.length >= 1
  }

  render(context: TwilioContext) {
    const message = context.messages[0]

    message.body = `${message.body}\n\n${context.payload.choices
      .map(({ title }, idx) => `${idx + 1}. ${title}`)
      .join('\n')}`

    context.prepareIndexResponse(context.event, context.payload.choices)
  }
}
