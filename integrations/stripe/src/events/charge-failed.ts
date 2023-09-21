import { Events } from '.botpress/implementation/events'
import { Client } from '.botpress'
import Stripe from 'stripe'

export const fireChargeFailed = async ({
  stripeEvent,
  client,
}: {
  stripeEvent: Stripe.Event
  client: Client
}) => {
  const { user } = await client.getOrCreateUser({
    tags: {
      id: (stripeEvent.data.object as { customer: string })?.customer || '',
    },
  })

  const payload = {
    origin: 'stripe',
    userId: user?.id || '',
    data: { type: stripeEvent.type, object: { ...stripeEvent.data.object } },
  } satisfies Events['chargeFailed']

  await client.createEvent({
    type: 'chargeFailed',
    payload,
  })
}
