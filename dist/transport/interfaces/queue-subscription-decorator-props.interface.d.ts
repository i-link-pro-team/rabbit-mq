import { SubscribeToQueueProps } from '../../client';
export declare type QueueSubscriptionDecoratorProps = Omit<SubscribeToQueueProps, 'subscriber'> & {
    subscriptionType: 'queue' | 'exchange';
};
