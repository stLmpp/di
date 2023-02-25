import { type Class } from 'type-fest';

import { coerce_array } from './coerce-array.js';
import { Inject } from './inject.js';
import { Injectable } from './injectable.js';
import { InjectionToken } from './injection-token.js';
import {
  ClassProvider,
  FactoryProvider,
  type Provide,
  type Provider,
  resolveProvider,
  ValueProvider,
} from './provider.js';
import { ReflectTypeEnum } from './reflect-type.enum.js';

/**
 * @internal
 * @param target
 */
function stringify_target(target: Provide): string {
  if (target instanceof InjectionToken) {
    return `InjectionToken(${target.description})`;
  }
  return typeof target === 'function' ? target.name : `${target}`;
}

export class Injector {
  /**
   * @internal
   * @param name
   * @param parent
   * @protected
   */
  protected constructor(public readonly name: string, parent: Injector | null) {
    this.parent = parent;
    this.instances.set(Injector, this);
  }

  /**
   * @internal
   * @private
   */
  private readonly parent: Injector | null;

  /**
   * @internal
   * @protected
   */
  protected readonly providers = new Map<unknown, Provider>();

  /**
   * @internal
   * @protected
   */
  protected readonly instances = new Map<unknown, unknown>();

  /**
   * @internal
   * @param provider
   * @private
   */
  private resolve_value_provider<T>(provider: ValueProvider<T>): T {
    this.instances.set(provider.provide, provider.useValue);
    return provider.useValue;
  }

  /**
   * @internal
   * @param provider
   * @private
   */
  private async resolve_class_provider<T>(provider: ClassProvider<T>): Promise<T> {
    const inject_params = Inject.get_all_for_target(provider.useClass);
    const reflect_params: Class<unknown>[] =
      Reflect.getMetadata(ReflectTypeEnum.paramTypes, provider.useClass) ?? [];
    const params = Array.from(
      { length: Math.max(inject_params.length, reflect_params.length) },
      (_, index) => inject_params[index]?.type_fn() ?? reflect_params[index]
    );
    if (!params.length) {
      const instance = new provider.useClass();
      this.instances.set(provider.provide, instance);
      return instance;
    }
    const injections: unknown[] = [];
    for (const param of params) {
      const injection_instance = await this.resolve(param);
      if (typeof injection_instance === 'undefined') {
        throw new Error(
          `Error trying to resolve ${stringify_target(
            provider.useClass
          )}. Param ${stringify_target(param)} undefined`
        );
      }
      injections.push(injection_instance);
    }
    const instance = new provider.useClass(...injections);
    this.instances.set(provider.provide, instance);
    return instance as T;
  }

  /**
   * @internal
   * @param provider
   * @private
   */
  private async resolve_factory_provider<T>(provider: FactoryProvider<T>): Promise<T> {
    const deps: unknown[] = [];
    for (const dep of provider.deps ?? []) {
      const dep_instance = await this.resolve(dep);
      if (typeof dep_instance === 'undefined') {
        throw new Error(
          `Error trying to resolve ${stringify_target(
            provider.provide
          )}. Dep ${stringify_target(dep)} undefined`
        );
      }
      deps.push(dep_instance);
    }
    const instance = await provider.useFactory(...deps);
    this.instances.set(provider.provide, instance);
    return instance;
  }

  /**
   * @internal
   * @param provider
   * @private
   */
  private async resolve_provider<T>(provider: Provider<T>): Promise<T> {
    if (provider instanceof ValueProvider) {
      return this.resolve_value_provider(provider);
    }
    if (provider instanceof ClassProvider) {
      return this.resolve_class_provider(provider);
    }
    return this.resolve_factory_provider(provider);
  }
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

  register(
    providerOrProviders: (Provider | Class<unknown>) | Array<Provider | Class<unknown>>
  ): this {
    const providers = coerce_array(providerOrProviders);
    for (let provider of providers) {
      provider = resolveProvider(provider);
      this.providers.set(provider.provide, provider);
    }
    return this;
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

  async resolveAll(): Promise<this> {
    const providers = [...this.providers.values()];
    for (const provider of providers) {
      await this.resolve(provider.provide);
    }
    return this;
  }

  static create(name: string, parent?: Injector): Injector {
    return new Injector(name, parent ?? root_injector);
  }
}

export class RootInjector extends Injector {
  /**
   * @internal
   */
  constructor() {
    super('Root', null);
    this.instances.set(RootInjector, this);
  }

  /**
   * @internal
   * @private
   */
  private has_loaded = false;

  /**
   * @internal
   * @private
   */
  private add_global_providers(): this {
    if (this.has_loaded) {
      return this;
    }
    const injectable_entries = Injectable.get_all().filter(
      ([target, options]) => options.root && !this.providers.has(target)
    );
    for (const [target, options] of injectable_entries) {
      const provider = options.useFactory
        ? new FactoryProvider(target, options.useFactory, options.deps)
        : new ClassProvider(target, target);
      this.providers.set(target, provider);
    }
    const injection_token_entries = InjectionToken.get_all().filter(
      ([target]) => !this.providers.has(target)
    );
    for (const [target, factory] of injection_token_entries) {
      this.providers.set(target, factory);
    }
    this.has_loaded = true;
    return this;
  }

  override async resolve<T>(target: InjectionToken<T>, path?: string[]): Promise<T>;
  override async resolve<T>(target: Class<T>, path?: string[]): Promise<T>;
  override async resolve<T>(target: Provide<T>, path?: string[]): Promise<T>;
  override async resolve<T>(target: Provide<T>, path?: string[]): Promise<T> {
    this.add_global_providers();
    return super.resolve(target, path);
  }

  static override create(): RootInjector {
    throw new Error('RootInjector cannot be created');
  }
}

const root_injector = new RootInjector();
