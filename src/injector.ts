import { type AbstractClass, type Class } from 'type-fest';

import { BaseInjector, stringify_target } from './base-injector.js';
import { type InjectionToken } from './injection-token.js';
import { type Provide, ValueProvider } from './provider.js';
import { ROOT_INJECTOR } from './root-injector.js';
import { safe, safeAsync } from './safe.js';
import { DependencyInjectionError } from './dependency-injection-error.js';

export class Injector extends BaseInjector {
  /**
   * @internal
   * @param name
   * @param parent
   */
  constructor(name: string, parent: BaseInjector) {
    super(name);
    this.parent = parent;
    this.add_provider_value(new ValueProvider(Injector, this), this);
  }

  /**
   * @internal
   * @private
   */
  public readonly parent: BaseInjector;

  private async resolve_internal<T>(target: Provide<T>, path: string[]): Promise<void> {
    path ??= [];
    path.push(this.name);
    const providers = this.providers.get(target);
    if (!providers?.length) {
      await this.parent.resolve(target, path);
      return;
    }
    const instances = this.instances.get(target);
    if (providers.at(0)?.multi) {
      await safeAsync(async () => this.parent.resolve(target, path));
      if (providers.length === instances?.length) {
        return;
      }
    } else if (instances?.length) {
      return;
    }
    await this.resolve_providers(providers);
  }

  async resolve<T>(target: InjectionToken<T>, path?: string[]): Promise<T>;
  async resolve<T>(target: Class<T>, path?: string[]): Promise<T>;
  async resolve<T>(target: AbstractClass<T>, path?: string[]): Promise<T>;
  async resolve<T>(target: Provide<T>, path?: string[]): Promise<T>;
  async resolve<T>(target: Provide<T>, path?: string[]): Promise<T> {
    await this.resolve_internal(target, path ?? []);
    return this.get(target);
  }

  async resolveAll<T>(target: InjectionToken<T>, path?: string[]): Promise<T[]>;
  async resolveAll<T>(target: Class<T>, path?: string[]): Promise<T[]>;
  async resolveAll<T>(target: AbstractClass<T>, path?: string[]): Promise<T[]>;
  async resolveAll<T>(target: Provide<T>, path?: string[]): Promise<T[]>;
  async resolveAll<T>(target: Provide<T>, path?: string[]): Promise<T[]> {
    await this.resolve_internal(target, path ?? []);
    return this.getAll(target);
  }

  get<T>(target: InjectionToken<T>): T;
  get<T>(target: Class<T>): T;
  get<T>(target: AbstractClass<T>): T;
  get<T>(target: Provide<T>): T;
  get<T>(target: Provide<T>): T {
    let instance = (this.instances.get(target) as T[] | undefined)?.at(0);
    if (!instance) {
      [, instance] = safe(() => this.parent.get(target));
    }
    if (!instance) {
      throw new DependencyInjectionError(
        `Instance "${stringify_target(
          target,
        )}" not found. Ensure it's a global Injectable or it's registered in the Injector you're using (${
          this.name
        })`,
      );
    }
    return instance;
  }

  getAll<T>(target: InjectionToken<T>): T[];
  getAll<T>(target: Class<T>): T[];
  getAll<T>(target: AbstractClass<T>): T;
  getAll<T>(target: Provide<T>): T[];
  getAll<T>(target: Provide<T>): T[] {
    const instances = (this.instances.get(target) as T[] | undefined) ?? [];
    const parentInstances = this.parent.getAll(target);
    return instances.concat(parentInstances);
  }

  static create(name: string, parent?: BaseInjector): Injector {
    return new Injector(name, parent ?? ROOT_INJECTOR);
  }
}
