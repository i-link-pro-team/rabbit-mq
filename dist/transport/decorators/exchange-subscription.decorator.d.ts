import { SubscribeToExchangeProps } from '../../client';
export declare const ExchangeSubscription: (props: Omit<SubscribeToExchangeProps, 'subscriber'> & {
    serviceName?: string;
}) => MethodDecorator;
