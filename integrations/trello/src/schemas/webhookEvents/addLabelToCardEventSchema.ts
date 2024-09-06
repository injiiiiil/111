import { z } from '@botpress/sdk'
import { TrelloIDSchema } from '../primitives/trelloId'
import { genericWebhookEventSchema } from './genericWebhookEventSchema'

export const addLabelToCardEventSchema = genericWebhookEventSchema.merge(
  z.object({
    action: genericWebhookEventSchema.shape.action.merge(
      z
        .object({
          type: z.literal('addLabelToCard').describe('Type of the action'),
          data: z.object({
            board: z
              .object({
                id: TrelloIDSchema.describe('Unique identifier of the board'),
                name: z.string().describe('Name of the board'),
              })
              .optional()
              .describe('Board where the card was modified'),
            card: z
              .object({
                id: TrelloIDSchema.describe('Unique identifier of the card'),
                name: z.string().describe('Name of the card'),
              })
              .describe('Card that was modified'),
            label: z
              .object({
                id: TrelloIDSchema.describe('Unique identifier of the label'),
                name: z.string().describe('Name of the label'),
                color: z.string().describe('Color of the label'),
              })
              .describe('Label that was added to the card'),
          }),
        })
        .describe('Action that is triggered when a label is added to a card')
    ),
  })
)


