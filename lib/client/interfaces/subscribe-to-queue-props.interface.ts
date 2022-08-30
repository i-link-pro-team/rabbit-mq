import { MessageSubscriber } from './message-subscriber.interface'
import { QueueOptions } from './queue-options.interface'

export interface SubscribeToQueueProps {
    queue: string
    queueOptions?: QueueOptions
    prefetchCount?: number
    subscriber: MessageSubscriber
}
