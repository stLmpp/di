import { type Class } from 'type-fest';

import { BaseInjector, stringify_target } from './base-injector.js';
import { type InjectionToken } from './injection-token.js';
import { type Provide, type Provider } from './provider.js';
import { ROOT_INJECTOR } from './root-injector.js';

export class Injector extends BaseInjector {
  /**
   * @internal
   * @param name
   * @param parent
   * @protected
   */
  protected constructor(name: string, parent: BaseInjector | null) {
    super(name);
    this.parent = parent;
    this.instances.set(Injector, this);
  }

  /**
   * @internal
   * @private
   */
  public readonly parent: BaseInjector | null;

  async resolve<T>(target: InjectionToken<T>, path?: string[]): Promise<T>;
  async resolve<T>(target: Class<T>, path?: string[]): Promise<T>;
  async resolve<T>(target: Provide<T>, path?: string[]): Promise<T>;
  async resolve<T>(target: Provide<T>, path?: string[]): Promise<T> {
    if (this.instances.has(target)) {
      return this.instances.get(target) as T;
    }
    path ??= [];
    path.push(this.name);
    const provider = this.providers.get(target) as Provider<T> | undefined;
    if (!provider) {
      if (this.parent) {
        return this.parent.resolve(target, path);
      }
      throw new Error(
        `"${stringify_target(
          target
        )}" is not provided globally nor is registered in any of the following injectors: ${path.join(
          ' -> '
        )}`
      );
    }
    return this.resolve_provider(provider);
  }

  get<T>(target: InjectionToken<T>): T;
  get<T>(target: Class<T>): T;
  get<T>(target: Provide<T>): T;
  get<T>(target: Provide<T>): T {
    const instance = this.instances.get(target) as T | undefined;
    if (!instance) {
      if (this.parent) {
        return this.parent.get(target);
      }
      throw new Error(
        `Instance "${stringify_target(
          target
        )}" not found. Ensure it's a global Injectable or it's registered in the Injector you're using (${
          this.name
        })`
      );
    }
    return instance;
  }

  static create(name: string, parent?: BaseInjector): Injector {
    return new Injector(name, parent ?? ROOT_INJECTOR);
  }
}
