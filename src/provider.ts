import { type AbstractClass, type Class } from 'type-fest';

import { type InjectionToken } from './injection-token.js';
import { type UnwrapProviders } from './unwrap-providers.type.js';
import { DependencyInjectionError } from './dependency-injection-error.js';

export type Provide<T = any> = AbstractClass<T> | Class<T> | InjectionToken<T>;

class ProviderBase<T = any> {
  constructor(
    public readonly provide: Provide<T>,
    multi: boolean = false,
  ) {
    this.multi = multi;
  }

  public readonly multi?: boolean;
}

export class ClassProvider<T = any> extends ProviderBase<T> {
  constructor(
    provide: Provide<T>,
    public readonly useClass: Class<T>,
    multi: boolean = false,
  ) {
    super(provide, multi);
  }
}

export class FactoryProvider<
  T = any,
  Providers extends Provide[] = any,
> extends ProviderBase<T> {
  constructor(
    provide: Provide<T>,
    public readonly useFactory: (
      ...args: [...UnwrapProviders<Providers>]
    ) => T | Promise<T>,
    public readonly deps?: [...Providers],
    multi: boolean = false,
  ) {
    super(provide, multi);
  }
}

export class ValueProvider<T = any> extends ProviderBase<T> {
  constructor(
    provide: Provide<T>,
    public readonly useValue: T,
    multi: boolean = false,
  ) {
    super(provide, multi);
  }
}

export type Provider<T = any> = ClassProvider<T> | FactoryProvider<T> | ValueProvider<T>;

export function isProvider(value: unknown): value is Provider {
  return (
    value instanceof ValueProvider ||
    value instanceof ClassProvider ||
    value instanceof FactoryProvider
  );
}

export function resolveProvider(possibleProvider: Provider | Class<any>): Provider {
  if (isProvider(possibleProvider)) {
    return possibleProvider;
  }
  if (typeof possibleProvider === 'function') {
    return new ClassProvider(possibleProvider, possibleProvider);
  }
  const providerObject: Partial<ValueProvider & ClassProvider & FactoryProvider> & {
    provide: Provide;
  } = possibleProvider;
  if (providerObject.useValue) {
    return new ValueProvider(
      providerObject.provide,
      providerObject.useValue,
      providerObject.multi,
    );
  }
  if (providerObject.useClass) {
    return new ClassProvider(
      providerObject.provide,
      providerObject.useClass,
      providerObject.multi,
    );
  }
  if (providerObject.useFactory) {
    return new FactoryProvider(
      providerObject.provide,
      providerObject.useFactory,
      providerObject.deps,
      providerObject.multi,
    );
  }
  throw new DependencyInjectionError(
    `Provider ${JSON.stringify(providerObject)} is not correct`,
  );
}
