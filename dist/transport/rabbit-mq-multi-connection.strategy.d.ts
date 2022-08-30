import {
    CustomTransportStrategy,
    MessageHandler,
    Server,
    Transport,
} from '@nestjs/microservices'
import {
    RabbitMQClientOptions,
    SubscribeToQueueProps,
    RabbitMQMessageContent,
    SubscribeToExchangeProps,
} from '../client'
import { RabbitMQContext } from './interfaces/rabbit-mq-context.interface'
export declare class RabbitMQMultiConnectionStrategy
    extends Server
    implements CustomTransportStrategy
{
    private _configs
    readonly transportId = Transport.RMQ
    private _rmqClients
    constructor(
        _configs: (RabbitMQClientOptions & {
            forceExclusiveExchangeBinding?: boolean
        })[],
    )
    listen(callback?: () => void): Promise<void>
    close(): Promise<void>
    start(callback?: () => void): Promise<void>
    initializeHandlers(): Promise<void>
    subscribeToQueue(
        props: Omit<SubscribeToQueueProps, 'subscriber'> & {
            serviceName: string
        },
        handler: MessageHandler<RabbitMQMessageContent, RabbitMQContext>,
    ): Promise<void>
    subscribeToExchange(
        props: Omit<SubscribeToExchangeProps, 'subscriber'> & {
            serviceName: string
        },
        handler: MessageHandler<RabbitMQMessageContent, RabbitMQContext>,
    ): Promise<void>
}
