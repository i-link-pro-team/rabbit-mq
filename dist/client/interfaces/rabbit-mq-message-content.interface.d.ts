export interface RabbitMQMessageContent<T = unknown> {
    pattern: string;
    data: T;
}
