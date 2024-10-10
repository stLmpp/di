import type { Provide } from './provider.js';

export class ProviderBase<T = any> {
  constructor(
    public readonly provide: Provide<T>,
    multi: boolean = false,
  ) {
    this.multi = multi;
  }

  public readonly multi?: boolean;
}
