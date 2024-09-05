import { type Class } from 'type-fest';

import { coerce_array } from './coerce-array.js';
import { Inject } from './inject.js';
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
import { type UnwrapProviders } from './unwrap-providers.type.js';
import { DependencyInjectionError } from './dependency-injection-error.js';

/**
 * @internal
 * @param target
 */
export function stringify_target(target: Provide): string {
  if (target instanceof InjectionToken) {
    return `InjectionToken(${target.description})`;
  }
  return typeof target === 'function' ? target.name : `${target}`;
}

export abstract class BaseInjector {
  protected constructor(public readonly name: string) {}

  /**
   * @internal
   * @protected
   */
  protected readonly providers = new Map<any, Provider[]>();

  /**
   * @internal
   * @protected
   */
  protected readonly instances = new Map<any, any[]>();

  protected add_provider_value<T>(provider: Provider<T>, value: T): T {
    let instances = (this.instances.get(provider.provide) as T[] | undefined) ?? [];
    if (provider.multi) {
      instances.push(value);
    } else {
      instances = [value];
    }
    this.instances.set(provider.provide, instances);
    return value;
  }

  /**
   * @internal
   * @param provider
   * @private
   */
  protected resolve_value_provider<T>(provider: ValueProvider<T>): T {
    return this.add_provider_value(provider, provider.useValue);
  }

  /**
   * @internal
   * @param provider
   * @private
   */
  protected async resolve_class_provider<T>(provider: ClassProvider<T>): Promise<T> {
    const inject_params = Inject.get_all_for_target(provider.useClass);
    const reflect_params: Class<any>[] =
      Reflect.getMetadata(ReflectTypeEnum.paramTypes, provider.useClass) ?? [];
    const params = Array.from(
      { length: Math.max(inject_params.length, reflect_params.length) },
      (_, index) => inject_params[index]?.type_fn() ?? reflect_params[index],
    );
    if (!params.length) {
      const instance = new provider.useClass();
      this.add_provider_value(provider, instance);
      return instance;
    }
    const injections: any[] = [];
    for (const param of params) {
      const injection_instance = await this.resolve(param);
      injections.push(injection_instance);
    }
    const instance = new provider.useClass(...injections);
    return this.add_provider_value(provider, instance);
  }

  /**
   * @internal
   * @param provider
   * @private
   */
  protected async resolve_factory_provider<T>(provider: FactoryProvider<T>): Promise<T> {
    const deps: any[] = [];
    for (const dep of provider.deps ?? []) {
      const dep_instance = await this.resolve(dep);
      deps.push(dep_instance);
    }
    const instance = await provider.useFactory(...deps);
    return this.add_provider_value(provider, instance);
  }

  /**
   * @internal
   * @param providers
   * @private
   */
  protected async resolve_providers<T>(providers: Provider<T>[]): Promise<void> {
    for (const provider of providers) {
      if (provider instanceof ValueProvider) {
        await this.resolve_value_provider(provider);
      }
      if (provider instanceof ClassProvider) {
        await this.resolve_class_provider(provider);
      }
      if (provider instanceof FactoryProvider) {
        await this.resolve_factory_provider(provider);
      }
    }
  }

  register(
    providerOrProviders: (Provider | Class<any>) | Array<Provider | Class<any>>,
  ): this {
    const providers = coerce_array(providerOrProviders);
    for (let provider of providers) {
      provider = resolveProvider(provider);
      const storedProviders = this.providers.get(provider.provide) ?? [];
      storedProviders.push(provider);
      this.providers.set(provider.provide, storedProviders);
    }
    return this;
  }

  async resolveMany<Providers extends Provide[]>(
    targets: [...Providers],
  ): Promise<UnwrapProviders<Providers>> {
    const services = [] as UnwrapProviders<Providers>;
    for (const target of targets) {
      services.push(await this.resolve(target));
    }
    return services;
  }

  abstract resolve<T>(target: Provide<T>, path?: string[]): Promise<T>;
  abstract get<T>(target: Provide<T>): T;
  abstract getAll<T>(target: Provide<T>): T[];
}
