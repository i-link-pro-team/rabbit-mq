import { SubscribeToExchangeProps } from '../../client';
export declare type ExchangeSubscriptionsDecoratorProps = Omit<SubscribeToExchangeProps, 'subscriber'> & {
    subscriptionType: 'queue' | 'exchange';
};
