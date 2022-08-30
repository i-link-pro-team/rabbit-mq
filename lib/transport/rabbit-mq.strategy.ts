/* eslint-disable brace-style */
import {
    CustomTransportStrategy,
    MessageHandler,
    Server,
    Transport,
} from '@nestjs/microservices'
import {
    RabbitMQClient,
    RabbitMQClientOptions,
    RabbitMQConfigProvider,
    SubscribeToQueueProps,
    RabbitMQMessageContent,
    SubscribeToExchangeProps,
} from '../client'
import { ExchangeSubscriptionsDecoratorProps } from './interfaces/exchange-subscription-decorator-props.interface'
import { QueueSubscriptionDecoratorProps } from './interfaces/queue-subscription-decorator-props.interface'
import { RabbitMQContext } from './interfaces/rabbit-mq-context.interface'

export class RabbitMQStrategy
    extends Server
    implements CustomTransportStrategy
{
    readonly transportId = Transport.RMQ

    private _rmqClient: RabbitMQClient

    constructor(
        private _config: RabbitMQClientOptions & {
            forceExclusiveExchangeBinding?: boolean
        },
    ) {
        super()

        this._rmqClient = new RabbitMQClient(
            new RabbitMQConfigProvider(_config),
        )
    }

    async listen(callback?: () => void): Promise<void> {
        await this.start(callback)
    }

    async close(): Promise<void> {
        this._rmqClient?.disconnect()
    }

    async start(callback?: () => void): Promise<void> {
        await this._rmqClient.connect()

        await this.initializeHandlers()

        callback()
    }

    async initializeHandlers(): Promise<void> {
        const messageHandlers = [...this.messageHandlers]
        await Promise.all(
            // eslint-disable-next-line
            messageHandlers.map(([stringifiedMeta, handler]) => {
                let handlerMetadata
                try {
                    handlerMetadata = JSON.parse(
                        stringifiedMeta,
                    ) as QueueSubscriptionDecoratorProps &
                        ExchangeSubscriptionsDecoratorProps
                } catch (error) {
                    // TODO: fixme
                    console.error({ error, stringifiedMeta })
                    return undefined
                }
                if (!handlerMetadata.serviceName)
                    {switch (handlerMetadata.subscriptionType) {
                        case 'queue':
                            return this.subscribeToQueue(
                                handlerMetadata,
                                handler,
                            )
                        case 'exchange':
                            return this.subscribeToExchange(
                                handlerMetadata,
                                handler,
                            )
                        default:
                            console.log(
                                `Not expected type '${handlerMetadata.subscriptionType}'`,
                            )
                    }}
            }),
        )
    }

    async subscribeToQueue(
        props: Omit<SubscribeToQueueProps, 'subscriber'>,
        handler: MessageHandler<RabbitMQMessageContent, RabbitMQContext>,
    ): Promise<void> {
        this._rmqClient.subscribeToQueue({
            ...props,
            subscriber: (
                message,
                acknowledgeMessage,
                channel,
                originalMessage,
            ) => {
                const rmqContext: RabbitMQContext = { originalMessage, channel }

                handler(message, rmqContext)
            },
        })
    }

    async subscribeToExchange(
        props: Omit<SubscribeToExchangeProps, 'subscriber'>,
        handler: MessageHandler<RabbitMQMessageContent, RabbitMQContext>,
    ): Promise<void> {
        const { forceExclusiveExchangeBinding: forceExclusiveExchangeBind } =
            this._config
        const subscribeToExchangeProps: SubscribeToExchangeProps = {
            ...props,
            subscriber: (
                message,
                acknowledgeMessage,
                channel,
                originalMessage,
            ) => {
                const rmqContext: RabbitMQContext = { originalMessage, channel }

                handler(message, rmqContext)
            },
        }

        if (forceExclusiveExchangeBind) {
            subscribeToExchangeProps.queue = ''
            subscribeToExchangeProps.queueOptions = {
                durable: false,
                exclusive: true,
            }
        }

        this._rmqClient.subscribeToExchange(subscribeToExchangeProps)
    }
}
