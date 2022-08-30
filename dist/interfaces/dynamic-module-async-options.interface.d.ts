import { FactoryProvider, ModuleMetadata } from '@nestjs/common';
export interface DynamicModuleAsyncOptions<T> {
    useFactory?: FactoryProvider<T | Promise<T>>['useFactory'];
    inject?: FactoryProvider['inject'];
    imports?: ModuleMetadata['imports'];
}
