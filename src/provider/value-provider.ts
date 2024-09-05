import type { Provide } from './provider.js';
import { ProviderBase } from './provider-base.js';

export class ValueProvider<T = any> extends ProviderBase<T> {
  constructor(
    provide: Provide<T>,
    public readonly useValue: T,
    multi: boolean = false,
  ) {
    super(provide, multi);
  }
}
