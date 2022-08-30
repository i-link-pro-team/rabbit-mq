"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueSubscription = void 0;
const microservices_1 = require("@nestjs/microservices");
const QueueSubscription = (props) => {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
    return (
    // eslint-disable-next-line @typescript-eslint/ban-types
    target, key, descriptor) => {
        return microservices_1.MessagePattern(Object.assign(Object.assign({}, props), { subscriptionType: 'queue' }), microservices_1.Transport.RMQ)(target, key, descriptor);
    };
};
exports.QueueSubscription = QueueSubscription;
//# sourceMappingURL=queue-subscription.decorator.js.map