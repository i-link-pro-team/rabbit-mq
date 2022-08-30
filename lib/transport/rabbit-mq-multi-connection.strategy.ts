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

export class RabbitMQMultiConnectionStrategy
    extends Server
    implements CustomTransportStrategy
{
    readonly transportId = Transport.RMQ

    private _rmqClients: Record<string, RabbitMQClient> = {}

    constructor(
        private _configs: (RabbitMQClientOptions & {
                forceExclusiveExchangeBinding?: boolean
            })[],
    ) {
        super()

        for (const config of _configs)
            {this._rmqClients[config.serviceName] = new RabbitMQClient(
                new RabbitMQConfigProvider(config),
            )}
    }

    async listen(callback?: () => void): Promise<void> {
        await this.start(callback)
    }

    async close(): Promise<void> {
        for (const [key, client] of Object.entries(this._rmqClients))
            {client.disconnect()}
    }

    async start(callback?: () => void): Promise<void> {
        for (const [key, client] of Object.entries(this._rmqClients))
            {client.connect()}

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
                        ExchangeSubscriptionsDecoratorProps & {
                            serviceName: string
                        }
                } catch (error) {
                    // TODO: fixme
                    console.error({ error, stringifiedMeta })
                    return undefined
                }
                if (handlerMetadata.serviceName) {
                    switch (handlerMetadata.subscriptionType) {
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
                    }
                } else {
                    console.error(
                        `Queue: ${handlerMetadata.queue} hasn't service name in subscription.`,
                    )
                }
            }),
        )
    }

    async subscribeToQueue(
        props: Omit<SubscribeToQueueProps, 'subscriber'> & {
            serviceName: string
        },
        handler: MessageHandler<RabbitMQMessageContent, RabbitMQContext>,
    ): Promise<void> {
        this._rmqClients[props.serviceName].subscribeToQueue({
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
        props: Omit<SubscribeToExchangeProps, 'subscriber'> & {
            serviceName: string
        },
        handler: MessageHandler<RabbitMQMessageContent, RabbitMQContext>,
    ): Promise<void> {
        const { forceExclusiveExchangeBinding: forceExclusiveExchangeBind } =
            this._configs[props.serviceName]
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

        this._rmqClients[props.serviceName].subscribeToExchange(
            subscribeToExchangeProps,
        )
    }
}
