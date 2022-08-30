import { MessagePattern, Transport } from '@nestjs/microservices'
import { SubscribeToExchangeProps } from '../../client'
import { ExchangeSubscriptionsDecoratorProps } from '../interfaces/exchange-subscription-decorator-props.interface'

export const ExchangeSubscription = (
    props: Omit<SubscribeToExchangeProps, 'subscriber'> & {
        serviceName?: string
    },
): MethodDecorator => {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
    return (
        // eslint-disable-next-line @typescript-eslint/ban-types
        target: object,
        key: string | symbol,
        descriptor: PropertyDescriptor,
    ) => {
        return MessagePattern<ExchangeSubscriptionsDecoratorProps>(
            { ...props, subscriptionType: 'exchange' },
            Transport.RMQ,
        )(target, key, descriptor)
    }
}
