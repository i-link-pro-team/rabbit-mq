import { MessagePattern, Transport } from '@nestjs/microservices'
import { SubscribeToQueueProps } from '../../client'
import { QueueSubscriptionDecoratorProps } from '../interfaces/queue-subscription-decorator-props.interface'

export const QueueSubscription = (
    props: Omit<SubscribeToQueueProps, 'subscriber'> & { serviceName?: string },
): MethodDecorator => {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
    return (
        // eslint-disable-next-line @typescript-eslint/ban-types
        target: object,
        key: string | symbol,
        descriptor: PropertyDescriptor,
    ) => {
        return MessagePattern<QueueSubscriptionDecoratorProps>(
            { ...props, subscriptionType: 'queue' },
            Transport.RMQ,
        )(target, key, descriptor)
    }
}
