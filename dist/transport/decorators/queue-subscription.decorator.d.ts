import { SubscribeToQueueProps } from '../../client';
export declare const QueueSubscription: (props: Omit<SubscribeToQueueProps, 'subscriber'> & {
    serviceName?: string;
}) => MethodDecorator;
