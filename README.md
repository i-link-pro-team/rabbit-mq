# NestJS RabbitMQ Client and strategy

NestJS implementation of client and strategy hasn't enough features for work with RabbitMQ so i developed this one (basically, just a wrapper for [amqp-connection-manager](https://github.com/jwalton/node-amqp-connection-manager))

Features:

-   Subscribe on queues/exchanges with routing-key and stuff
-   Seingnding:
-   Message acknowledgment

## Installation

```bash
npm install --save git@github.com:i-link-pro-team/rabbit-mq.git
```

## Obligatory message structure

// Into existing exchange:

```json
{
    pattern?: string, // allow to define type of the message in queue
    data: any // only json compatible
}
```

## Dependencies

-   amqp-connection-manager
-   amqplib

## How to use

### If you need a client (sending messages)

See **[CLIENT.md](CLIENT.md)**

### If you need a strategy (receiving messages)

See **[STRATEGY.md](STRATEGY.md)**

### Warning

If you want to use strategy please provide transport-type into all of your 'MessagePattern'-decorators like this:

```typescript
@MessagePattern(
    {cmd: MessagePatternName},
    Transport.TCP       // <------- this line
)
someMethod() {}

```

I've no idea how to fix it yet
