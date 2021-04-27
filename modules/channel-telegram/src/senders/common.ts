import { ChannelSender } from 'common/channel'
import { TelegramContext } from 'src/backend/typings'

export class TelegramCommonSender implements ChannelSender<TelegramContext> {
  get channel(): string {
    return 'telegram'
  }

  get priority(): number {
    return 0
  }

  get id() {
    return TelegramCommonSender.name
  }

  handles(context: TelegramContext): boolean {
    return context.handlers?.length > 0
  }

  async send(context: TelegramContext) {
    const { client, chatId } = context

    for (const message of context.messages) {
      if (message.action) {
        await client.telegram.sendChatAction(chatId, message.action)
      }
      if (message.text) {
        await client.telegram.sendMessage(chatId, message.text, message.extra)
      }
      if (message.photo) {
        await client.telegram.sendPhoto(chatId, message.photo, message.extra)
      }
      if (message.animation) {
        await client.telegram.sendAnimation(chatId, message.animation, message.extra)
      }
    }
  }
}
