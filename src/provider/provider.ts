import type { AbstractClass, Class } from 'type-fest';

import type { InjectionToken } from '../injection-token.js';
import { ClassProvider } from './class-provider.js';
import { FactoryProvider } from './factory-provider.js';
import { ValueProvider } from './value-provider.js';

export type Provide<T = any> = AbstractClass<T> | Class<T> | InjectionToken<T>;

export type Provider<T = any> = ClassProvider<T> | FactoryProvider<T> | ValueProvider<T>;

export function isProvider(value: unknown): value is Provider {
  return (
    value instanceof ValueProvider ||
    value instanceof ClassProvider ||
    value instanceof FactoryProvider
  );
}
