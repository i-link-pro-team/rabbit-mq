"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RabbitMQModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMQModule = void 0;
const common_1 = require("@nestjs/common");
const rabbit_mq_config_provider_1 = require("../client/providers/rabbit-mq-config.provider");
const rabbit_mq_client_1 = require("../client/rabbit-mq.client");
const services_1 = require("../services");
let RabbitMQModule = RabbitMQModule_1 = class RabbitMQModule {
    static registerClientAsync(options) {
        var _a;
        const imports = [...((_a = options.imports) !== null && _a !== void 0 ? _a : [])];
        const rabbitMQConfigFactoryProvider = {
            provide: rabbit_mq_config_provider_1.RabbitMQConfigProvider,
            useFactory: async (...args) => new rabbit_mq_config_provider_1.RabbitMQConfigProvider(await options.useFactory(...args)),
            inject: [...options.inject],
        };
        const tokenProviderName = options.name ? options.name : rabbit_mq_client_1.RabbitMQClient;
        const clientProvider = options.name
            ? { provide: options.name, useClass: rabbit_mq_client_1.RabbitMQClient }
            : rabbit_mq_client_1.RabbitMQClient;
        const providers = [
            rabbitMQConfigFactoryProvider,
            clientProvider,
        ];
        const exports = [tokenProviderName];
        if (options.usePublisherService) {
            providers.push(services_1.RabbitMQPublisherService);
            exports.push(services_1.RabbitMQPublisherService);
        }
        return {
            global: options.global,
            module: RabbitMQModule_1,
            imports,
            providers: [...providers],
            exports: [...exports],
        };
    }
};
RabbitMQModule = RabbitMQModule_1 = __decorate([
    common_1.Module({})
], RabbitMQModule);
exports.RabbitMQModule = RabbitMQModule;
//# sourceMappingURL=rabbit-mq.module.js.map