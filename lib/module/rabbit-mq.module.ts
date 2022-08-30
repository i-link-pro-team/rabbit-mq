import {
    DynamicModule,
    FactoryProvider,
    Module,
    ModuleMetadata,
    Provider,
} from '@nestjs/common'
import { RabbitMQAsyncOptions } from '../client/interfaces/rabbit-mq-async-options.interface'
import { RabbitMQConfigProvider } from '../client/providers/rabbit-mq-config.provider'
import { RabbitMQClient } from '../client/rabbit-mq.client'
import { RabbitMQPublisherService } from '../services'

@Module({})
export class RabbitMQModule {
    static registerClientAsync(options: RabbitMQAsyncOptions): DynamicModule {
        const imports: ModuleMetadata['imports'] = [...(options.imports ?? [])]

        const rabbitMQConfigFactoryProvider: FactoryProvider<
            Promise<RabbitMQConfigProvider>
        > = {
            provide: RabbitMQConfigProvider,
            useFactory: async (...args) =>
                new RabbitMQConfigProvider(await options.useFactory(...args)),
            inject: [...options.inject],
        }

        const tokenProviderName = options.name ? options.name : RabbitMQClient

        const clientProvider: Provider<RabbitMQClient> = options.name
            ? { provide: options.name, useClass: RabbitMQClient }
            : RabbitMQClient

        const providers: Provider[] = [
            rabbitMQConfigFactoryProvider,
            clientProvider,
        ]
        const exports: ModuleMetadata['exports'] = [tokenProviderName]

        if (options.usePublisherService) {
            providers.push(RabbitMQPublisherService)
            exports.push(RabbitMQPublisherService)
        }

        return {
            global: options.global,
            module: RabbitMQModule,
            imports,
            providers: [...providers],
            exports: [...exports],
        }
    }
}
