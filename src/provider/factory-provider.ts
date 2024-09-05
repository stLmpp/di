import type { UnwrapProviders } from '../type.js';
import type { Provide } from './provider.js';
import { ProviderBase } from './provider-base.js';

export class FactoryProvider<
  T = any,
  Providers extends Provide[] = any,
> extends ProviderBase<T> {
  constructor(
    provide: Provide<T>,
    public readonly useFactory: (
      ...args: [...UnwrapProviders<Providers>]
    ) => T | Promise<T>,
    public readonly deps?: [...Providers],
    multi: boolean = false,
  ) {
    super(provide, multi);
  }
}
