import { MessageProperties } from 'amqplib'
import { ExchangeOptions } from './exchange-options.interface'
import { QueueOptions } from './queue-options.interface'
export interface PublishToExchangeProps {
    exchange: string
    exchangeOptions?: ExchangeOptions
    queue?: string
    queueOptions?: QueueOptions & {
        bindingRoutingKey?: string
    }
    routingKey?: string
    pattern: string
    data: any
    messageProperties?: Partial<MessageProperties>
}
