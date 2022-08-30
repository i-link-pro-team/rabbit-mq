"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMQMultiConnectionStrategy = void 0;
/* eslint-disable brace-style */
const microservices_1 = require("@nestjs/microservices");
const client_1 = require("../client");
class RabbitMQMultiConnectionStrategy extends microservices_1.Server {
    constructor(_configs) {
        super();
        this._configs = _configs;
        this.transportId = microservices_1.Transport.RMQ;
        this._rmqClients = {};
        for (const config of _configs) {
            this._rmqClients[config.serviceName] = new client_1.RabbitMQClient(new client_1.RabbitMQConfigProvider(config));
        }
    }
    async listen(callback) {
        await this.start(callback);
    }
    async close() {
        for (const [key, client] of Object.entries(this._rmqClients)) {
            client.disconnect();
        }
    }
    async start(callback) {
        for (const [key, client] of Object.entries(this._rmqClients)) {
            client.connect();
        }
        await this.initializeHandlers();
        callback();
    }
    async initializeHandlers() {
        const messageHandlers = [...this.messageHandlers];
        await Promise.all(
        // eslint-disable-next-line
        messageHandlers.map(([stringifiedMeta, handler]) => {
            let handlerMetadata;
            try {
                handlerMetadata = JSON.parse(stringifiedMeta);
            }
            catch (error) {
                // TODO: fixme
                console.error({ error, stringifiedMeta });
                return undefined;
            }
            if (handlerMetadata.serviceName) {
                switch (handlerMetadata.subscriptionType) {
                    case 'queue':
                        return this.subscribeToQueue(handlerMetadata, handler);
                    case 'exchange':
                        return this.subscribeToExchange(handlerMetadata, handler);
                    default:
                        console.log(`Not expected type '${handlerMetadata.subscriptionType}'`);
                }
            }
            else {
                console.error(`Queue: ${handlerMetadata.queue} hasn't service name in subscription.`);
            }
        }));
    }
    async subscribeToQueue(props, handler) {
        this._rmqClients[props.serviceName].subscribeToQueue(Object.assign(Object.assign({}, props), { subscriber: (message, acknowledgeMessage, channel, originalMessage) => {
                const rmqContext = { originalMessage, channel };
                handler(message, rmqContext);
            } }));
    }
    async subscribeToExchange(props, handler) {
        const { forceExclusiveExchangeBinding: forceExclusiveExchangeBind } = this._configs[props.serviceName];
        const subscribeToExchangeProps = Object.assign(Object.assign({}, props), { subscriber: (message, acknowledgeMessage, channel, originalMessage) => {
                const rmqContext = { originalMessage, channel };
                handler(message, rmqContext);
            } });
        if (forceExclusiveExchangeBind) {
            subscribeToExchangeProps.queue = '';
            subscribeToExchangeProps.queueOptions = {
                durable: false,
                exclusive: true,
            };
        }
        this._rmqClients[props.serviceName].subscribeToExchange(subscribeToExchangeProps);
    }
}
exports.RabbitMQMultiConnectionStrategy = RabbitMQMultiConnectionStrategy;
//# sourceMappingURL=rabbit-mq-multi-connection.strategy.js.map