import { MessageProperties } from 'amqplib'
import { QueueOptions } from './queue-options.interface'
export interface PublishToQueueProps {
    queue: string
    queueOptions?: QueueOptions
    pattern: string
    data: any
    messageProperties?: Partial<MessageProperties>
}
