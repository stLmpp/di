import type { Class } from 'type-fest';
import { ClassProvider } from './class-provider.js';
import { ValueProvider } from './value-provider.js';
import { FactoryProvider } from './factory-provider.js';
import { DependencyInjectionError } from '../dependency-injection-error.js';
import { isProvider, type Provide, type Provider } from './provider.js';

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
  if (
    !providerObject ||
    typeof providerObject !== 'object' ||
    typeof providerObject.provide === 'undefined'
  ) {
    throw new DependencyInjectionError(
      `Provider ${JSON.stringify(providerObject)} is not valid. Please use an instance of ValueProvider, ClassProvider or FactoryProvider`,
    );
  }
  if ('useValue' in providerObject) {
    return new ValueProvider(
      providerObject.provide,
      providerObject.useValue,
      providerObject.multi,
    );
  }
  if (typeof providerObject.useClass === 'function') {
    return new ClassProvider(
      providerObject.provide,
      providerObject.useClass,
      providerObject.multi,
    );
  }
  if (typeof providerObject.useFactory === 'function') {
    return new FactoryProvider(
      providerObject.provide,
      providerObject.useFactory,
      providerObject.deps,
      providerObject.multi,
    );
  }
  throw new DependencyInjectionError(
    `Provider ${JSON.stringify(providerObject)} is not valid. Please use an instance of ValueProvider, ClassProvider or FactoryProvider`,
  );
}
