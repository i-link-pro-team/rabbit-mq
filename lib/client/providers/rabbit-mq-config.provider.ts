import { Injectable } from '@nestjs/common'
import { RabbitMQClientOptions } from '../interfaces/rabbit-mq-client-options.interface'

@Injectable()
export class RabbitMQConfigProvider {
    constructor(public config: RabbitMQClientOptions) {}
}
