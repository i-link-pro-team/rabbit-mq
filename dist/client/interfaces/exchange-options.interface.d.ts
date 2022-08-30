import { DeliveryModeType } from '../../common/types/delivery-mode.type';
export interface ExchangeOptions {
    durable: boolean;
    type: 'fanout' | 'direct' | 'topic';
    /**
     * @deprecated use {@link PublishToExchangeProps.messageProperties} instead
     */
    correlationId?: string;
    deliveryMode?: DeliveryModeType;
}
