import { MessagingClient } from '@botpress/messaging-client'
import { IO, MessagingConfig } from 'botpress/sdk'
import { formatUrl, isBpUrl } from 'common/url'
import { ConfigProvider } from 'core/config'
import { EventEngine, Event } from 'core/events'
import { TYPES } from 'core/types'
import { inject, injectable, postConstruct } from 'inversify'
import { createOauthClient } from './messaging-oauth-client'

@injectable()
export class MessagingService {
  private clientsSync: { [botId: string]: MessagingClient } = {}
  private clientsByBotId: { [botId: string]: MessagingClient } = {}
  private botsByClientId: { [clientId: string]: string } = {}
  private webhookTokenByClientId: { [botId: string]: string } = {}

  public isExternal: boolean
  public internalPassword: string | undefined

  constructor(
    @inject(TYPES.EventEngine) private eventEngine: EventEngine,
    @inject(TYPES.ConfigProvider) private configProvider: ConfigProvider
  ) {
    this.isExternal = Boolean(process.core_env.MESSAGING_ENDPOINT)
  }

  @postConstruct()
  async init() {
    this.eventEngine.register({
      name: 'messaging.sendOut',
      description: 'Sends outgoing messages to external messaging',
      order: 20000,
      direction: 'outgoing',
      handler: this.handleOutgoingEvent.bind(this)
    })

    this.internalPassword = this.isExternal ? undefined : process.INTERNAL_PASSWORD
  }

  async loadMessagingForBot(botId: string) {
    const config = await this.configProvider.getBotConfig(botId)
    let messaging = (config.messaging || {}) as MessagingConfig

    const webhookUrl = `${process.EXTERNAL_URL}/api/v1/chat/receive`
    const setupConfig = {
      name: botId,
      ...messaging,
      // We use the SPINNED_URL env var to force the messaging server to make its webhook
      // requests to the process that started it when using a local Messaging server
      webhooks: this.isExternal ? [{ url: webhookUrl }] : []
    }

    this.clientsSync[botId] = new MessagingClient({
      url: this.getMessagingUrl(),
      client: createOauthClient({ ...config.cloud!, endpoint: this.getMessagingUrl() })
    })
    const { id, token, webhooks } = await this.clientsSync[botId].syncs.sync(setupConfig)

    if (webhooks?.length) {
      for (const webhook of webhooks) {
        if (webhook.url === webhookUrl) {
          this.webhookTokenByClientId[id] = webhook.token!
        }
      }
    }

    if (id && id !== messaging.id) {
      messaging = {
        ...messaging,
        id,
        token
      }

      await this.configProvider.mergeBotConfig(botId, { messaging })
    }

    const botClient = new MessagingClient({
      url: this.getMessagingUrl(),
      auth: { clientId: messaging.id, clientToken: messaging.token },
      client: createOauthClient({ ...config.cloud!, endpoint: this.getMessagingUrl() })
    })
    this.clientsByBotId[botId] = botClient
    this.botsByClientId[id] = botId
  }

  async unloadMessagingForBot(botId: string) {
    const config = await this.configProvider.getBotConfig(botId)
    if (!config.messaging?.id) {
      return
    }

    await this.clientsSync[botId].syncs.sync({
      id: config.messaging.id,
      token: config.messaging.token,
      name: botId,
      channels: {},
      webhooks: []
    })
  }

  async receive(clientId: string, channel: string, userId: string, conversationId: string, payload: any) {
    return this.eventEngine.sendEvent(
      Event({
        direction: 'incoming',
        type: payload.type,
        payload,
        channel,
        threadId: conversationId,
        target: userId,
        botId: this.botsByClientId[clientId]
      })
    )
  }

  private async handleOutgoingEvent(event: IO.OutgoingEvent, next: IO.MiddlewareNextCallback) {
    const payloadAbsoluteUrl = this.convertToAbsoluteUrls(event.payload)
    await this.clientsByBotId[event.botId].chat.reply(event.threadId!, event.channel, payloadAbsoluteUrl)

    return next(undefined, true, false)
  }

  private convertToAbsoluteUrls(payload: any) {
    if (typeof payload !== 'object' || payload === null) {
      if (typeof payload === 'string') {
        payload = payload.replace('BOT_URL', process.EXTERNAL_URL)
      }

      if (isBpUrl(payload)) {
        return formatUrl(process.EXTERNAL_URL, payload)
      }
      return payload
    }

    for (const [key, value] of Object.entries(payload)) {
      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          value[i] = this.convertToAbsoluteUrls(value[i])
        }
      } else {
        payload[key] = this.convertToAbsoluteUrls(value)
      }
    }

    return payload
  }

  public getMessagingUrl() {
    return process.core_env.MESSAGING_ENDPOINT
      ? process.core_env.MESSAGING_ENDPOINT
      : `http://localhost:${process.MESSAGING_PORT}`
  }

  public getWebhookToken(clientId: string) {
    return this.webhookTokenByClientId[clientId]
  }
}
