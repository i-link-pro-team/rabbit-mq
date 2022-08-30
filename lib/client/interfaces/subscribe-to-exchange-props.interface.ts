import { ExchangeOptions } from './exchange-options.interface'
import { SubscribeToQueueProps } from './subscribe-to-queue-props.interface'

export interface SubscribeToExchangeProps extends SubscribeToQueueProps {
    exchange: string
    routingKey?: string
    exchangeOptions?: ExchangeOptions
}
