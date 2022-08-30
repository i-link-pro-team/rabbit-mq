import { DynamicModule } from '@nestjs/common';
import { RabbitMQAsyncOptions } from '../client/interfaces/rabbit-mq-async-options.interface';
export declare class RabbitMQModule {
    static registerClientAsync(options: RabbitMQAsyncOptions): DynamicModule;
}
