import { FactoryProvider } from './provider.js';

export class InjectionToken<T> {
  constructor(
    public readonly description: string,
    public readonly provider?: Omit<FactoryProvider<T>, 'provide'>
  ) {
    if (provider) {
      InjectionToken.add(
        this,
        new FactoryProvider(this, provider.useFactory, provider.deps)
      );
    }
  }

  /**
   * @internal
   */
  static readonly store = new Map<InjectionToken<unknown>, FactoryProvider>();

  /**
   * @internal
   * @param token
   * @param factory
   */
  static add(token: InjectionToken<unknown>, factory: FactoryProvider) {
    this.store.set(token, factory);
  }

  /**
   * @internal
   */
  static get_all(): [InjectionToken<unknown>, FactoryProvider][] {
    return [...this.store];
  }
}
