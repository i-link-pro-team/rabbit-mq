import { MessageProperties } from 'amqplib'
import { QueueOptions } from './queue-options.interface'

export interface PublishToQueueProps {
    queue: string
    queueOptions?: QueueOptions
    pattern: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any
    messageProperties?: Partial<MessageProperties>
}
