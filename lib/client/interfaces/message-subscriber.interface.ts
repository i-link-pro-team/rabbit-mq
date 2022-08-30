import { Channel, ConsumeMessage } from 'amqplib'
import { RabbitMQMessageContent } from './rabbit-mq-message-content.interface'

export type MessageSubscriber = (
    message: RabbitMQMessageContent,
    acknowledgeMessage: () => void | Promise<void>,
    channel?: Channel,
    originalMessage?: ConsumeMessage,
) => void | Promise<void>
