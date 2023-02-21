import { type Class } from 'type-fest';

import { type InjectionToken } from './injection-token.js';

export type Provide<T = unknown> = Class<T> | InjectionToken<T>;

class ProviderBase<T = unknown> {
  constructor(public readonly provide: Provide<T>) {}
}

export class ClassProvider<T = unknown> extends ProviderBase<T> {
  constructor(provide: Provide<T>, public readonly useClass: Class<T>) {
    super(provide);
  }
}

export class FactoryProvider<T = unknown> extends ProviderBase<T> {
  constructor(
    provide: Provide<T>,
    public readonly useFactory: (...args: unknown[]) => T | Promise<T>,
    public readonly deps?: Provide[]
  ) {
    super(provide);
  }
}

export class ValueProvider<T = unknown> extends ProviderBase<T> {
  constructor(provide: Provide<T>, public readonly useValue: T) {
    super(provide);
  }
}

export type Provider<T = unknown> =
  | ClassProvider<T>
  | FactoryProvider<T>
  | ValueProvider<T>;

export function isProvider(value: unknown): value is Provider {
  return (
    value instanceof ValueProvider ||
    value instanceof ClassProvider ||
    value instanceof FactoryProvider
  );
}

export function resolveProvider(possibleProvider: Provider | Class<unknown>): Provider {
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
    return new ValueProvider(providerObject.provide, providerObject.useValue);
  }
  if (providerObject.useClass) {
    return new ClassProvider(providerObject.provide, providerObject.useClass);
  }
  if (providerObject.useFactory) {
    return new FactoryProvider(
      providerObject.provide,
      providerObject.useFactory,
      providerObject.deps
    );
  }
  throw new Error(`Provider ${JSON.stringify(providerObject)} is not correct`);
}
