"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangeSubscription = void 0;
const microservices_1 = require("@nestjs/microservices");
const ExchangeSubscription = (props) => {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
    return (
    // eslint-disable-next-line @typescript-eslint/ban-types
    target, key, descriptor) => {
        return microservices_1.MessagePattern(Object.assign(Object.assign({}, props), { subscriptionType: 'exchange' }), microservices_1.Transport.RMQ)(target, key, descriptor);
    };
};
exports.ExchangeSubscription = ExchangeSubscription;
//# sourceMappingURL=exchange-subscription.decorator.js.map