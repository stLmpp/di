import type { Class } from 'type-fest';

import { BaseInjector, stringify_target } from './base-injector.js';
import { Injectable } from '../injectable.js';
import { InjectionToken } from '../injection-token.js';
import type { Provide } from '../provider/provider.js';
import { DependencyInjectionError } from '../dependency-injection-error.js';
import { ClassProvider } from '../provider/class-provider.js';
import { FactoryProvider } from '../provider/factory-provider.js';
import { ValueProvider } from '../provider/value-provider.js';

export class RootInjector extends BaseInjector {
  /**
   * @internal
   */
  constructor() {
    super('Root');
    this.add_provider_value(new ValueProvider(RootInjector, this), this);
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
    const injectable_entries = Injectable.get_all();
    for (const [target, options] of injectable_entries) {
      if (!options.root) {
        continue;
      }
      const provider = options.useFactory
        ? new FactoryProvider(target, options.useFactory, options.deps)
        : new ClassProvider(target, target);
      this.register(provider);
    }
    const injection_token_entries = InjectionToken.get_all();
    for (const [, factory] of injection_token_entries) {
      this.register(factory);
    }
    this.has_loaded = true;
    return this;
  }

  private async resolve_internal<T>(target: Provide<T>, path?: string[]): Promise<void> {
    this.add_global_providers();
    path ??= [];
    path.push(this.name);
    const providers = this.providers.get(target);
    if (!providers?.length) {
      throw new DependencyInjectionError(
        `"${stringify_target(
          target,
        )}" is not provided globally nor is registered in any of the following injectors: ${path.join(
          ' -> ',
        )}`,
      );
    }
    const instances = this.instances.get(target);
    if (providers.at(0)?.multi) {
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
  async resolve<T>(target: Provide<T>, path?: string[]): Promise<T>;
  async resolve<T>(target: Provide<T>, path?: string[]): Promise<T> {
    await this.resolve_internal(target, path);
    return this.get(target);
  }

  async resolveAll<T>(target: InjectionToken<T>, path?: string[]): Promise<T[]>;
  async resolveAll<T>(target: Class<T>, path?: string[]): Promise<T[]>;
  async resolveAll<T>(target: Provide<T>, path?: string[]): Promise<T[]>;
  async resolveAll<T>(target: Provide<T>, path?: string[]): Promise<T[]> {
    await this.resolve_internal(target, path);
    return this.getAll(target);
  }

  get<T>(target: InjectionToken<T>): T;
  get<T>(target: Class<T>): T;
  get<T>(target: Provide<T>): T;
  get<T>(target: Provide<T>): T {
    const instance = (this.instances.get(target) as T[] | undefined)?.at(0);
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
  getAll<T>(target: Provide<T>): T[];
  getAll<T>(target: Provide<T>): T[] {
    const instances = this.instances.get(target) as T[] | undefined;
    return instances ?? [];
  }
}

export const ROOT_INJECTOR = new RootInjector();
