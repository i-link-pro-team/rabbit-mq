"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMQStrategy = void 0;
/* eslint-disable brace-style */
const microservices_1 = require("@nestjs/microservices");
const client_1 = require("../client");
class RabbitMQStrategy extends microservices_1.Server {
    constructor(_config) {
        super();
        this._config = _config;
        this.transportId = microservices_1.Transport.RMQ;
        this._rmqClient = new client_1.RabbitMQClient(new client_1.RabbitMQConfigProvider(_config));
    }
    async listen(callback) {
        await this.start(callback);
    }
    async close() {
        var _a;
        (_a = this._rmqClient) === null || _a === void 0 ? void 0 : _a.disconnect();
    }
    async start(callback) {
        await this._rmqClient.connect();
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
            if (!handlerMetadata.serviceName) {
                switch (handlerMetadata.subscriptionType) {
                    case 'queue':
                        return this.subscribeToQueue(handlerMetadata, handler);
                    case 'exchange':
                        return this.subscribeToExchange(handlerMetadata, handler);
                    default:
                        console.log(`Not expected type '${handlerMetadata.subscriptionType}'`);
                }
            }
        }));
    }
    async subscribeToQueue(props, handler) {
        this._rmqClient.subscribeToQueue(Object.assign(Object.assign({}, props), { subscriber: (message, acknowledgeMessage, channel, originalMessage) => {
                const rmqContext = { originalMessage, channel };
                handler(message, rmqContext);
            } }));
    }
    async subscribeToExchange(props, handler) {
        const { forceExclusiveExchangeBinding: forceExclusiveExchangeBind } = this._config;
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
        this._rmqClient.subscribeToExchange(subscribeToExchangeProps);
    }
}
exports.RabbitMQStrategy = RabbitMQStrategy;
//# sourceMappingURL=rabbit-mq.strategy.js.map