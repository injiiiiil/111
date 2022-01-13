import * as sdk from 'botpress/sdk'
import { Migration, MigrationOpts } from 'core/migration'

const migration: Migration = {
  info: {
    description: 'Removes the id prefix of messaging tokens',
    target: 'bot',
    type: 'config'
  },
  up: async () => {
    return { success: true, hasChanges: false, message: 'Migration skipped' }
  },
  down: async ({ bp, metadata, configProvider }: MigrationOpts): Promise<sdk.MigrationResult> => {
    const fixBotToken = async (botId: string, botConfig: sdk.BotConfig) => {
      if (!botConfig.messaging?.id) {
        return
      }

      // new to format is : idOfToken.secretOfToken
      // so here we want to check that the token is the new format by doing a split with "."
      // the id and token are not allowed to have "." so this works
      const parts = botConfig.messaging.id.split('.')

      if (parts.length !== 2) {
        // then the token is still the old format so we don't need to change it
        return
      }

      await configProvider.mergeBotConfig(botId, { messaging: { id: parts[1] } })
    }

    if (metadata.botId) {
      const botConfig = await bp.bots.getBotById(metadata.botId)
      await fixBotToken(metadata.botId, botConfig!)
    } else {
      const bots = await bp.bots.getAllBots()
      for (const [botId, botConfig] of bots) {
        await fixBotToken(botId, botConfig)
      }
    }

    return { success: true, message: 'Configurations updated successfully' }
  }
}

export default migration
