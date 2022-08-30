import { ConsumeMessage, Channel } from 'amqplib';
export interface RabbitMQContext {
    originalMessage: ConsumeMessage;
    channel: Channel;
}
