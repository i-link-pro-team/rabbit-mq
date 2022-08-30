# Strategy:

Listening messages from queue or exchange from different Rabbit

## Preparing:

<details>
<summary>1. Connect strategy to your microservice</summary>

```typescript
// main.ts -> bootstrap
// ...
const rmqPort = configService.get('RMQ_PORT') || DEFAULT_RMQ_PORT
const rmqHost = configService.get('RMQ_HOST') || DEFAULT_RMQ_HOST
const rmqUser = configService.get('RMQ_USERNAME') || DEFAULT_RMQ_USERNAME
const rmqPassword = configService.get('RMQ_PASSWORD') || DEFAULT_RMQ_PASSWORD

app.connectMicroservice<MicroserviceOptions>({
    strategy: new RabbitMQMultiConnectionStrategy([
        {
            serviceName: 'SERVICE 1', // Batter create enum with names
            urls: [`amqp://${rmqUser}:${rmqPassword}@${rmqHost}:${rmqPort}`],
            autoAck: false, // If you need manual message aknowledgment
            forceExclusiveExchangeBinding: false // optional. Need for debug - every exchange subscription will use exlusive queue
        },
        {
            serviceName: 'SERVICE 2',
            urls: [`amqp://${rmqUser2}:${rmqPassword2}@${rmqHost2}:${rmqPort2}`],
            autoAck: false,
        },
    ]),
})

await app.startAllMicroservicesAsync()

// ...
```

</details>

<details>
<summary>2. Create controller in your module (be sure that it is imported as controller in module declaration)</summary>

```typescript
@Controller('users')
export class UsersController {}
```

</details>

## Receiving messages:

In your controller:

```typescript

// Subscribe on exchange

@ExchangeSubscription({         // subscribe on message from exchange
    queue: string,              // name of binded queue
    queueOptions: {             // nullable, if provided - queue will be auto created if not exist
        durable?: boolean,      // if queue must be saved between rmq restarts (default 'true')
        exclusive?: boolean     // if queue must be created only for one consumer (default 'false')
    },
    exchange: string,           // target exchange name
    exchangeOptions: {          // nullable, if provided - exchange will be auto created if not exist
        durable: boolean,       // if exchange must be saved between rmq restarts
        type: string,           // exchange type: 'topic', 'direct', 'fanout'
    },
    routingKey: string,         // nullable, by default: '#'. Description: https://www.rabbitmq.com/tutorials/tutorial-five-javascript.html
    serviceName: ? string       // If use multi connection should pass service name.
})
    async onUserEvents(
        @Payload()
        messageContent: RabbitMQMessageContent,
        @Ctx()
        { channel, originalMessage }: RabbitMQContext,
    ): Promise<void> {
        const { data, pattern } = messageContent

        switch (pattern) {
            case UserEvents.Created:
                await this._usersService.onUserCreated(data as OnUserCreatedPayload)
                break
            default:
                this._logger.error('Not expected event')

        channel.ack(originalMessage) // Message aknowledgment. Required if autoAck is false
}

// Subscribe on queue

@QueueSubscription({         // subscribe on message from exchange
    queue: string,              // name of binded queue
    queueOptions: {             // nullable, if provided - queue will be auto created if not exist
        durable?: boolean,      // if queue must be saved between rmq restarts (default 'true')
        exclusive?: boolean     // if queue must be created only for one consumer (default 'false')
    },
    serviceName: ? string       // If use multi connection should pass service name.
})
    async onUserEvents(
        @Payload()
        messageContent: RabbitMQMessageContent,
        @Ctx()
        { channel, originalMessage }: RabbitMQContext,
    ): Promise<void> {
        const { data, pattern } = messageContent

        switch (pattern) {
            case UserEvents.Created:
                await this._usersService.onUserCreated(data as OnUserCreatedPayload)
                break
            default:
                this._logger.error('Not expected event')

        channel.ack(originalMessage) // Message aknowledgment. Required if autoAck is false
}
```
