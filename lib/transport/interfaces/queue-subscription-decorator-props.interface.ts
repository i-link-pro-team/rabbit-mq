import { SubscribeToQueueProps } from '../../client'

export type QueueSubscriptionDecoratorProps = Omit<
    SubscribeToQueueProps,
    'subscriber'
> & {
    subscriptionType: 'queue' | 'exchange'
}
