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
var RabbitMQPublisherService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMQPublisherService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const __1 = require("..");
let RabbitMQPublisherService = RabbitMQPublisherService_1 = class RabbitMQPublisherService {
    constructor(_rmqClient, _configService) {
        this._rmqClient = _rmqClient;
        this._configService = _configService;
        this._logger = new common_1.Logger(RabbitMQPublisherService_1.name);
        const exchange = this._configService.get(`RMQ_PUBLISHER_EXCHANGE`);
        this._exchange = exchange;
    }
    async onModuleInit() {
        await this._rmqClient.connect();
    }
    async sendToExchange(dto) {
        try {
            const { data, pattern, routingKey, exchange } = dto;
            if (!exchange && !this._exchange) {
                throw new Error('RMQ_PUBLISHER_EXCHANGE is not provided');
            }
            await this._rmqClient.publishToExchange({
                exchange: exchange || this._exchange,
                exchangeOptions: {
                    durable: true,
                    type: 'topic',
                    deliveryMode: 2,
                },
                queueOptions: {
                    durable: true,
                    exclusive: true,
                },
                routingKey: routingKey || pattern,
                pattern,
                data,
            });
        }
        catch (error) {
            this._logger.error(error, 'sendToExchange method error');
            throw Error(error);
        }
    }
};
RabbitMQPublisherService = RabbitMQPublisherService_1 = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [__1.RabbitMQClient,
        config_1.ConfigService])
], RabbitMQPublisherService);
exports.RabbitMQPublisherService = RabbitMQPublisherService;
//# sourceMappingURL=rabbit-mq-publisher.service.js.map