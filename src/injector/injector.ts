import { BaseInjector, stringify_target } from './base-injector.js';
import type { Provide } from '../provider/provider.js';
import { ROOT_INJECTOR } from './root-injector.js';
import { DependencyInjectionError } from '../dependency-injection-error.js';
import { ValueProvider } from '../provider/value-provider.js';
import type { ResolveOptions } from '../type.js';

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

  private async resolve_internal<T>(
    target: Provide<T>,
    options: ResolveOptions,
    path: string[],
  ): Promise<void> {
    path ??= [];
    path.push(this.name);
    const providers = this.providers.get(target);
    if (!providers?.length) {
      await this.parent.resolve(target, options, path);
      return;
    }
    const instances = this.instances.get(target);
    if (providers.at(0)?.multi) {
      await this.parent.resolve(target, { optional: true }, path);
      if (providers.length === instances?.length) {
        return;
      }
    } else if (instances?.length) {
      return;
    }
    await this.resolve_providers(providers);
  }

  async resolve<T>(
    target: Provide<T>,
    options: { optional: true },
    path?: string[],
  ): Promise<T | undefined>;
  async resolve<T>(
    target: Provide<T>,
    options?: ResolveOptions,
    path?: string[],
  ): Promise<T>;
  async resolve<T>(
    target: Provide<T>,
    options?: ResolveOptions,
    path?: string[],
  ): Promise<T | undefined> {
    await this.resolve_internal(target, options ?? {}, path ?? []);
    return this.get(target, options);
  }

  async resolveAll<T>(
    target: Provide<T>,
    options?: ResolveOptions,
    path?: string[],
  ): Promise<T[]> {
    await this.resolve_internal(target, options ?? {}, path ?? []);
    return this.getAll(target);
  }

  get<T>(target: Provide<T>, options: { optional: true }): T | undefined;
  get<T>(target: Provide<T>, options?: ResolveOptions): T;
  get<T>(target: Provide<T>, options?: ResolveOptions): T | undefined {
    const instance =
      (this.instances.get(target) as T[] | undefined)?.at(0) ??
      this.parent.get(target, { optional: true });
    if (!instance) {
      if (options?.optional) {
        return undefined;
      }
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

  getAll<T>(target: Provide<T>): T[] {
    const instances = (this.instances.get(target) as T[] | undefined) ?? [];
    const parentInstances = this.parent.getAll(target);
    return instances.concat(parentInstances);
  }

  static create(name: string, parent?: BaseInjector): Injector {
    return new Injector(name, parent ?? ROOT_INJECTOR);
  }
}
