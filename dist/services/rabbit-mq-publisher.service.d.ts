import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitMQClient } from '..';
import { SendToExchangeDto } from './dtos/send-to-exchange.dto';
export declare class RabbitMQPublisherService implements OnModuleInit {
    private readonly _rmqClient;
    private readonly _configService;
    private _logger;
    private _exchange;
    constructor(_rmqClient: RabbitMQClient, _configService: ConfigService);
    onModuleInit(): Promise<void>;
    sendToExchange<T>(dto: SendToExchangeDto<T>): Promise<void>;
}
