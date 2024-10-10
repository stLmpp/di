import type { Class } from 'type-fest';
import type { Provide } from './provider.js';
import { ProviderBase } from './provider-base.js';

export class ClassProvider<T = any> extends ProviderBase<T> {
  constructor(
    provide: Provide<T>,
    public readonly useClass: Class<T>,
    multi: boolean = false,
  ) {
    super(provide, multi);
  }
}
