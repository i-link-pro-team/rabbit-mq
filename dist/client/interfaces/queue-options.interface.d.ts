import { DeliveryModeType } from '../../common/types/delivery-mode.type';
export interface QueueOptions {
    durable?: boolean;
    exclusive?: boolean;
    deliveryMode?: DeliveryModeType;
    /**
     * @deprecated use {@link PublishToQueueProps.messageProperties} instead
     */
    correlationId?: string;
}
