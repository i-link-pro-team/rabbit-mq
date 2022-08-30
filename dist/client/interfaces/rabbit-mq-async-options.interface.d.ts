import { DynamicModuleAsyncOptions } from '../../interfaces/dynamic-module-async-options.interface';
import { RabbitMQClientOptions } from './rabbit-mq-client-options.interface';
export interface RabbitMQAsyncOptions extends DynamicModuleAsyncOptions<RabbitMQClientOptions> {
    usePublisherService?: boolean;
    name?: string | symbol;
    global?: boolean;
}
