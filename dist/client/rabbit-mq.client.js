"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMQClient = void 0;
const common_1 = require("@nestjs/common");
const rabbit_mq_config_provider_1 = require("./providers/rabbit-mq-config.provider");
const amqp_connection_manager_1 = require("amqp-connection-manager");
const default_delivery_mode_constant_1 = require("../common/constants/default-delivery-mode.constant");
const RMQ_CONNECT_EVENT = 'connect';
const RMQ_DISCONNECT_EVENT = 'disconnect';
let RabbitMQClient = class RabbitMQClient {
    constructor(_configProvider) {
        this._logger = new common_1.Logger(this.constructor.name);
        this._config = _configProvider.config;
    }
    async connect() {
        var _a;
        if ((_a = this._connectionManager) === null || _a === void 0 ? void 0 : _a.isConnected) {
            return;
        }
        const { urls } = this._config;
        this._connectionManager = amqp_connection_manager_1.connect(urls);
        await this._waitForConnection();
    }
    disconnect() {
        var _a;
        this._logger.debug(`Disconnected`);
        (_a = this._connectionManager) === null || _a === void 0 ? void 0 : _a.close();
    }
    async publishToQueue(props) {
        const { queue, queueOptions, data, pattern, messageProperties } = props;
        const channelWrapper = this._connectionManager.createChannel();
        channelWrapper.addSetup((channel) => {
            this._initQueue(channel, queue, queueOptions);
        });
        const buffer = Buffer.from(JSON.stringify({ data, pattern }));
        await channelWrapper.sendToQueue(queue, buffer, Object.assign(Object.assign({ deliveryMode: (queueOptions === null || queueOptions === void 0 ? void 0 : queueOptions.deliveryMode) || default_delivery_mode_constant_1.DEFAULT_DELIVERY_MODE }, messageProperties), { correlationId: (messageProperties === null || messageProperties === void 0 ? void 0 : messageProperties.correlationId) ||
                (queueOptions === null || queueOptions === void 0 ? void 0 : queueOptions.correlationId) }), (_err, ok) => {
            if (!ok) {
                this._logger.error(`Message wasn't sent, check that queue '${queue}' is exist`);
            }
            else {
                this._logger.debug(`Message sent to queue '${queue}'`);
            }
            channelWrapper.close();
        });
    }
    async publishToExchange(props) {
        const { exchange, routingKey = '', data, pattern, exchangeOptions, queue, queueOptions, messageProperties, } = props;
        const channelWrapper = this._connectionManager.createChannel();
        if (exchangeOptions != null) {
            channelWrapper.addSetup(async (channel) => {
                var _a;
                await this._initExchange(channel, exchange, exchangeOptions);
                if (queue != null && queueOptions != null) {
                    await this._initQueue(channel, queue, queueOptions);
                }
                const bindingRoutingKey = (_a = queueOptions === null || queueOptions === void 0 ? void 0 : queueOptions.bindingRoutingKey) !== null && _a !== void 0 ? _a : routingKey;
                if (queue != null) {
                    await channel.bindQueue(queue, exchange, bindingRoutingKey);
                }
            });
        }
        await channelWrapper.waitForConnect();
        const buffer = Buffer.from(JSON.stringify({ data, pattern }));
        await channelWrapper.publish(exchange, routingKey, buffer, Object.assign(Object.assign({ deliveryMode: (exchangeOptions === null || exchangeOptions === void 0 ? void 0 : exchangeOptions.deliveryMode) || default_delivery_mode_constant_1.DEFAULT_DELIVERY_MODE }, messageProperties), { correlationId: (messageProperties === null || messageProperties === void 0 ? void 0 : messageProperties.correlationId) ||
                (queueOptions === null || queueOptions === void 0 ? void 0 : queueOptions.correlationId) }), (_err, ok) => {
            if (!ok) {
                this._logger.error(`Message wasn't sent, check that exchange '${exchange}' is exist`);
            }
            else {
                this._logger.debug(`Message sent to exchange '${exchange}', routingKey: '${routingKey}'`);
            }
            channelWrapper.close();
        });
    }
    async subscribeToExchange(props) {
        const { queue, exchange, exchangeOptions, queueOptions, prefetchCount, routingKey = '#', subscriber, } = props;
        const channelWrapper = this._connectionManager.createChannel();
        channelWrapper.addSetup(async (channel) => {
            await this._initExchange(channel, exchange, exchangeOptions);
            await this._initQueue(channel, queue, queueOptions);
            await channel.prefetch(prefetchCount);
            await channel.bindQueue(queue, exchange, routingKey);
            await this._consumeMessage(channel, queue, subscriber);
            this._logger.debug(`Subscribed on exchange '${exchange}', routingKey: '${routingKey}', target queue: '${queue}'`);
        });
        return channelWrapper;
    }
    async subscribeToQueue(props, existingChannel) {
        const { queue, queueOptions, prefetchCount = 1, subscriber: handler, } = props;
        const channelWrapper = existingChannel !== null && existingChannel !== void 0 ? existingChannel : this._connectionManager.createChannel();
        channelWrapper.addSetup(async (channel) => {
            await this._initQueue(channel, queue, queueOptions);
            await channel.prefetch(prefetchCount);
            await this._consumeMessage(channel, queue, handler);
            this._logger.debug(`Subscribed on queue: '${queue}'`);
        });
    }
    onModuleDestroy() {
        this.disconnect();
    }
    async _waitForConnection() {
        await new Promise((resolve) => {
            this._connectionManager
                .on(RMQ_CONNECT_EVENT, ({ url }) => {
                this._logger.log(`Connected to the RabbitMQ: ${url}`);
                resolve();
            })
                .on(RMQ_DISCONNECT_EVENT, ({ err }) => {
                this._logger.error(`Cannot connect to the RabbitMQ: ${err}`);
            });
        });
    }
    async _initExchange(channel, exchange, exchangeOptions) {
        if (exchangeOptions != null) {
            await channel.assertExchange(exchange, exchangeOptions.type, {
                durable: exchangeOptions.durable,
            });
            this._logger.debug(`Initialized exchange '${exchange}', options: '${JSON.stringify(exchangeOptions)}'`);
        }
    }
    async _initQueue(channel, queue, queueOptions) {
        var _a, _b;
        if (queueOptions != null) {
            await channel.assertQueue(queue, {
                durable: (_a = queueOptions.durable) !== null && _a !== void 0 ? _a : true,
                exclusive: (_b = queueOptions.exclusive) !== null && _b !== void 0 ? _b : false,
            });
            this._logger.debug(`Initialized queue '${queue}', options: '${JSON.stringify(queueOptions)}'`);
        }
    }
    async _consumeMessage(channel, queue, subscriber) {
        await channel.consume(queue, (msg) => {
            const messageContent = JSON.parse(msg.content.toString());
            const acknowledgeMessage = () => channel.ack(msg);
            subscriber(messageContent, acknowledgeMessage, channel, msg);
        }, { noAck: this._config.autoAck });
    }
};
RabbitMQClient = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [rabbit_mq_config_provider_1.RabbitMQConfigProvider])
], RabbitMQClient);
exports.RabbitMQClient = RabbitMQClient;
//# sourceMappingURL=rabbit-mq.client.js.map