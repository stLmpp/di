import { type Class } from 'type-fest';

import { BaseInjector, stringify_target } from './base-injector.js';
import { Injectable } from './injectable.js';
import { InjectionToken } from './injection-token.js';
import {
  ClassProvider,
  FactoryProvider,
  type Provide,
  type Provider,
} from './provider.js';

export class RootInjector extends BaseInjector {
  /**
   * @internal
   */
  constructor() {
    super('Root');
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

  async resolve<T>(target: InjectionToken<T>, path?: string[]): Promise<T>;
  async resolve<T>(target: Class<T>, path?: string[]): Promise<T>;
  async resolve<T>(target: Provide<T>, path?: string[]): Promise<T>;
  async resolve<T>(target: Provide<T>, path?: string[]): Promise<T> {
    this.add_global_providers();
    if (this.instances.has(target)) {
      return this.instances.get(target) as T;
    }
    path ??= [];
    path.push(this.name);
    const provider = this.providers.get(target) as Provider<T> | undefined;
    if (!provider) {
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
}

export const ROOT_INJECTOR = new RootInjector();
