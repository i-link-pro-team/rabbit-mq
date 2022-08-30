export interface RabbitMQClientOptions {
    urls: string[];
    autoAck: boolean;
    serviceName?: string;
}
