# RabbitMQ Client:

Publishing messages to exchange or queue

# Preparing:

<details>
<summary>Sample of rabbitMQConfig:</summary>

```typescript
const DEFAULT_RMQ_HOST = 'localhost'
const DEFAULT_RMQ_PORT = 5672
const DEFAULT_RMQ_USERNAME = 'guest'
const DEFAULT_RMQ_PASSWORD = 'guest'

export const rabbitMQConfig: RabbitMQAsyncOptions = {
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
        const rmqPort = configService.get('RMQ_PORT') || DEFAULT_RMQ_PORT
        const rmqHost = configService.get('RMQ_HOST') || DEFAULT_RMQ_HOST
        const rmqUser =
            configService.get('RMQ_USERNAME') || DEFAULT_RMQ_USERNAME
        const rmqPassword =
            configService.get('RMQ_PASSWORD') || DEFAULT_RMQ_PASSWORD

        return {
            urls: [`amqp://${rmqUser}:${rmqPassword}@${rmqHost}:${rmqPort}`],
            autoAck: false,
        }
    },
}
```

</details>

<details>
<summary>1. Add RabbitMQModule into *Imports* of your module:</summary>

```typescript
@Module({
    imports: [
        // ...
        RabbitMQModule.registerClientAsync(rabbitMQConfig),
        // ...
    ],
})
export class UsersModule
```

</details>

<details>
<summary>2. Inject client into provider and call connect in onModuleInit:</summary>

```typescript
@Injectable()
export class UsersService implements OnModuleInit {
    constructor(
        // ...
        private _rmqClient: RabbitMQClient, // ...
    ) {}

    async onModuleInit(): Promise<void> {
        // ...
        await this._rmqClient.connect()
        // ...
    }
}
```

</details>

# Sending messages:

```typescript
const routingKey = TemenosEventsRoutingKeys[eventType]

// Into existing exchange:
await this._rmqClient.publishToExchange({
    exchange,               // Existing exchange name
    pattern,                // See 'Obligatory Message structure'
    routingKey,             // Routing key (in case if exchange type is 'topic')
    data,                   // JSON-compatible data
})

// Into exchange which will be autocreated if it isn't exist (makes no sense without binded queues but anyway):
await this._rmqClient.publishToExchange({
    exchange,                       // Exchange name
    exchangeOptions: {              // Exchange options
        durable: boolean,           // If it must be saved between rmq restarts
        type: string                // Exchange type: 'fanout', 'topic' or 'direct'
        deliveryMode?: 1 | 2        // Delivery method message. Default 1
        correlationId?: string      // Exchange id
    },
    pattern,                        // See 'Obligatory Message structure'
    routingKey,                     // Routing key (in case if exchange type is 'topic')
    data,                           // JSON-compatible data
    queue?: string                  // queue name which will be binded to exchange with current routing key
    queueOptions?: {                // nullable, if provided - queue will be auto created if not exist (works only if 'queue' is provided)
        durable?: boolean,          // if queue must be saved between rmq restarts (default 'true')
        exclusive?: boolean         // if queue must be created only for one consumer, probably makes no sense here (default 'false')
        bindingRoutingKey?: string  // sets which
        deliveryMode?: 1 | 2        // Delivery method message. Default 1
        correlationId?: string      // Queue id
    },
})

// Directly into existing queue:
await this._rmqClient.publishToQueue({
    queue,                  // Existing queue name
    pattern,                // See 'Obligatory Message structure'
    data,                   // JSON-compatible data
})

// Directly into queue which will be autocreated if it isn't exist:
await this._rmqClient.publishToQueue({
    queue,                   // Existing queue name
    queueOptions?: {         // nullable, if provided - queue will be auto created if not exist
        durable?: boolean,   // if queue must be saved between rmq restarts (default 'true')
        exclusive?: boolean  // if queue must be created only for one consumer, probably makes no sense here (default 'false')
        deliveryMode?: 1 | 2 // Delivery method message. Default 1
        correlationId?: string // Queue id
    },
    pattern,                 // See 'Obligatory Message structure'
    data,                    // JSON-compatible data
})
```
