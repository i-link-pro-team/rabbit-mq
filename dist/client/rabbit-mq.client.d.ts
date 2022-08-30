import { OnModuleDestroy } from '@nestjs/common';
import { RabbitMQConfigProvider } from './providers/rabbit-mq-config.provider';
import { ChannelWrapper } from 'amqp-connection-manager';
import { SubscribeToExchangeProps } from './interfaces/subscribe-to-exchange-props.interface';
import { SubscribeToQueueProps } from './interfaces/subscribe-to-queue-props.interface';
import { PublishToQueueProps } from './interfaces/publish-to-queue-props.interface';
import { PublishToExchangeProps } from './interfaces/publish-to-exchange-props.interface';
export declare class RabbitMQClient implements OnModuleDestroy {
    private _logger;
    private _config;
    private _connectionManager;
    constructor(_configProvider: RabbitMQConfigProvider);
    connect(): Promise<void>;
    disconnect(): void;
    publishToQueue(props: PublishToQueueProps): Promise<void>;
    publishToExchange(props: PublishToExchangeProps): Promise<void>;
    subscribeToExchange(props: SubscribeToExchangeProps): Promise<ChannelWrapper>;
    subscribeToQueue(props: SubscribeToQueueProps, existingChannel?: ChannelWrapper): Promise<void>;
    onModuleDestroy(): void;
    private _waitForConnection;
    private _initExchange;
    private _initQueue;
    private _consumeMessage;
}
