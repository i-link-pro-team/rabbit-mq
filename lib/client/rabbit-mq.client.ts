import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common'
import { RabbitMQConfigProvider } from './providers/rabbit-mq-config.provider'
import {
    AmqpConnectionManager,
    ChannelWrapper,
    connect,
} from 'amqp-connection-manager'
import { RabbitMQClientOptions } from './interfaces/rabbit-mq-client-options.interface'
import { SubscribeToExchangeProps } from './interfaces/subscribe-to-exchange-props.interface'
import { Channel } from 'amqplib'
import { RabbitMQMessageContent } from './interfaces/rabbit-mq-message-content.interface'
import { SubscribeToQueueProps } from './interfaces/subscribe-to-queue-props.interface'
import { PublishToQueueProps } from './interfaces/publish-to-queue-props.interface'
import { PublishToExchangeProps } from './interfaces/publish-to-exchange-props.interface'
import { QueueOptions } from './interfaces/queue-options.interface'
import { MessageSubscriber } from './interfaces/message-subscriber.interface'
import { ExchangeOptions } from './interfaces/exchange-options.interface'
import { DEFAULT_DELIVERY_MODE } from '../common/constants/default-delivery-mode.constant'

const RMQ_CONNECT_EVENT = 'connect'
const RMQ_DISCONNECT_EVENT = 'disconnect'

@Injectable()
export class RabbitMQClient implements OnModuleDestroy {
    private _logger: Logger
    private _config: RabbitMQClientOptions
    private _connectionManager: AmqpConnectionManager

    constructor(_configProvider: RabbitMQConfigProvider) {
        this._logger = new Logger(this.constructor.name)
        this._config = _configProvider.config
    }

    async connect(): Promise<void> {
        if (this._connectionManager?.isConnected) {
            return
        }

        const { urls } = this._config
        this._connectionManager = connect(urls)
        await this._waitForConnection()
    }

    disconnect(): void {
        this._logger.debug(`Disconnected`)
        this._connectionManager?.close()
    }

    async publishToQueue(props: PublishToQueueProps): Promise<void> {
        const { queue, queueOptions, data, pattern, messageProperties } = props

        const channelWrapper = this._connectionManager.createChannel()

        channelWrapper.addSetup((channel: Channel) => {
            this._initQueue(channel, queue, queueOptions)
        })

        const buffer = Buffer.from(JSON.stringify({ data, pattern }))

        await channelWrapper.sendToQueue(
            queue,
            buffer,
            {
                deliveryMode:
                    queueOptions?.deliveryMode || DEFAULT_DELIVERY_MODE,
                ...messageProperties,
                correlationId:
                    messageProperties?.correlationId ||
                    queueOptions?.correlationId,
            },
            (_err, ok) => {
                if (!ok) {
                    this._logger.error(
                        `Message wasn't sent, check that queue '${queue}' is exist`,
                    )
                } else {
                    this._logger.debug(`Message sent to queue '${queue}'`)
                }

                channelWrapper.close()
            },
        )
    }

    async publishToExchange(props: PublishToExchangeProps): Promise<void> {
        const {
            exchange,
            routingKey = '',
            data,
            pattern,
            exchangeOptions,
            queue,
            queueOptions,
            messageProperties,
        } = props

        const channelWrapper = this._connectionManager.createChannel()

        if (exchangeOptions != null) {
            channelWrapper.addSetup(async (channel: Channel) => {
                await this._initExchange(channel, exchange, exchangeOptions)

                if (queue != null && queueOptions != null) {
                    await this._initQueue(channel, queue, queueOptions)
                }

                const bindingRoutingKey =
                    queueOptions?.bindingRoutingKey ?? routingKey

                if (queue != null) {
                    await channel.bindQueue(queue, exchange, bindingRoutingKey)
                }
            })
        }

        await channelWrapper.waitForConnect()

        const buffer = Buffer.from(JSON.stringify({ data, pattern }))

        await channelWrapper.publish(
            exchange,
            routingKey,
            buffer,
            {
                deliveryMode:
                    exchangeOptions?.deliveryMode || DEFAULT_DELIVERY_MODE,
                ...messageProperties,
                correlationId:
                    messageProperties?.correlationId ||
                    queueOptions?.correlationId,
            },
            (_err, ok) => {
                if (!ok) {
                    this._logger.error(
                        `Message wasn't sent, check that exchange '${exchange}' is exist`,
                    )
                } else {
                    this._logger.debug(
                        `Message sent to exchange '${exchange}', routingKey: '${routingKey}'`,
                    )
                }

                channelWrapper.close()
            },
        )
    }

    async subscribeToExchange(
        props: SubscribeToExchangeProps,
    ): Promise<ChannelWrapper> {
        const {
            queue,
            exchange,
            exchangeOptions,
            queueOptions,
            prefetchCount,
            routingKey = '#',
            subscriber,
        } = props
        const channelWrapper = this._connectionManager.createChannel()

        channelWrapper.addSetup(async (channel: Channel) => {
            await this._initExchange(channel, exchange, exchangeOptions)
            await this._initQueue(channel, queue, queueOptions)

            await channel.prefetch(prefetchCount)
            await channel.bindQueue(queue, exchange, routingKey)

            await this._consumeMessage(channel, queue, subscriber)

            this._logger.debug(
                `Subscribed on exchange '${exchange}', routingKey: '${routingKey}', target queue: '${queue}'`,
            )
        })

        return channelWrapper
    }

    async subscribeToQueue(
        props: SubscribeToQueueProps,
        existingChannel?: ChannelWrapper,
    ): Promise<void> {
        const {
            queue,
            queueOptions,
            prefetchCount = 1,
            subscriber: handler,
        } = props

        const channelWrapper =
            existingChannel ?? this._connectionManager.createChannel()

        channelWrapper.addSetup(async (channel: Channel) => {
            await this._initQueue(channel, queue, queueOptions)

            await channel.prefetch(prefetchCount)

            await this._consumeMessage(channel, queue, handler)

            this._logger.debug(`Subscribed on queue: '${queue}'`)
        })
    }

    onModuleDestroy(): void {
        this.disconnect()
    }

    private async _waitForConnection(): Promise<void> {
        await new Promise<void>((resolve) => {
            this._connectionManager
                .on(RMQ_CONNECT_EVENT, ({ url }) => {
                    this._logger.log(`Connected to the RabbitMQ: ${url}`)
                    resolve()
                })
                .on(RMQ_DISCONNECT_EVENT, ({ err }) => {
                    this._logger.error(`Cannot connect to the RabbitMQ: ${err}`)
                })
        })
    }

    private async _initExchange(
        channel: Channel,
        exchange: string,
        exchangeOptions: ExchangeOptions,
    ): Promise<void> {
        if (exchangeOptions != null) {
            await channel.assertExchange(exchange, exchangeOptions.type, {
                durable: exchangeOptions.durable,
            })
            this._logger.debug(
                `Initialized exchange '${exchange}', options: '${JSON.stringify(
                    exchangeOptions,
                )}'`,
            )
        }
    }

    private async _initQueue(
        channel: Channel,
        queue: string,
        queueOptions?: QueueOptions,
    ): Promise<void> {
        if (queueOptions != null) {
            await channel.assertQueue(queue, {
                durable: queueOptions.durable ?? true,
                exclusive: queueOptions.exclusive ?? false,
            })

            this._logger.debug(
                `Initialized queue '${queue}', options: '${JSON.stringify(
                    queueOptions,
                )}'`,
            )
        }
    }

    private async _consumeMessage(
        channel: Channel,
        queue: string,
        subscriber: MessageSubscriber,
    ): Promise<void> {
        await channel.consume(
            queue,
            (msg) => {
                const messageContent: RabbitMQMessageContent = JSON.parse(
                    msg.content.toString(),
                )

                const acknowledgeMessage = (): void => channel.ack(msg)

                subscriber(messageContent, acknowledgeMessage, channel, msg)
            },
            { noAck: this._config.autoAck },
        )
    }
}
