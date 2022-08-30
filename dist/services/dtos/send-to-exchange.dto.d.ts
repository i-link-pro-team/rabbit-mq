export interface SendToExchangeDto<T> {
    data: T;
    pattern: string;
    routingKey?: string;
    exchange?: string;
}
