import { FactoryProvider } from './provider.js';

export class InjectionToken<T> {
  constructor(
    public readonly description: string,
    public readonly provider?: Omit<FactoryProvider<T>, 'provide'>,
  ) {
    if (provider) {
      InjectionToken.add(
        this,
        new FactoryProvider(this, provider.useFactory, provider.deps, provider.multi),
      );
    }
  }

  /**
   * @internal
   */
  static readonly store = new Map<InjectionToken<any>, FactoryProvider>();

  /**
   * @internal
   * @param token
   * @param factory
   */
  private static add(token: InjectionToken<any>, factory: FactoryProvider) {
    this.store.set(token, factory);
  }

  /**
   * @internal
   */
  static get_all(): [InjectionToken<any>, FactoryProvider][] {
    return [...this.store];
  }
}
