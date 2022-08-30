import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RabbitMQClient } from '..'
import { SendToExchangeDto } from './dtos/send-to-exchange.dto'

@Injectable()
export class RabbitMQPublisherService implements OnModuleInit {
    private _logger = new Logger(RabbitMQPublisherService.name)
    private _exchange: string | undefined

    constructor(
        private readonly _rmqClient: RabbitMQClient,
        private readonly _configService: ConfigService,
    ) {
        const exchange = this._configService.get<string | undefined>(
            `RMQ_PUBLISHER_EXCHANGE`,
        )

        this._exchange = exchange
    }

    async onModuleInit(): Promise<void> {
        await this._rmqClient.connect()
    }

    async sendToExchange<T>(dto: SendToExchangeDto<T>): Promise<void> {
        try {
            const { data, pattern, routingKey, exchange } = dto

            if (!exchange && !this._exchange) {
                throw new Error('RMQ_PUBLISHER_EXCHANGE is not provided')
            }

            await this._rmqClient.publishToExchange({
                exchange: exchange || this._exchange,
                exchangeOptions: {
                    durable: true,
                    type: 'topic',
                    deliveryMode: 2,
                },
                queueOptions: {
                    durable: true,
                    exclusive: true,
                },
                routingKey: routingKey || pattern,
                pattern,
                data,
            })
        } catch (error) {
            this._logger.error(error, 'sendToExchange method error')
            throw Error(error)
        }
    }
}
