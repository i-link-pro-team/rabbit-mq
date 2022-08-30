import { SubscribeToExchangeProps } from '../../client'

export type ExchangeSubscriptionsDecoratorProps = Omit<
    SubscribeToExchangeProps,
    'subscriber'
> & {
    subscriptionType: 'queue' | 'exchange'
}
