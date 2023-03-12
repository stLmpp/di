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

export class FactoryProvider<
  T = unknown,
  P1 = unknown,
  P2 = unknown,
  P3 = unknown,
  P4 = unknown,
  P5 = unknown,
  P6 = unknown,
  P7 = unknown,
  P8 = unknown
> extends ProviderBase<T> {
  constructor(provide: Provide<T>, useFactory: () => T | Promise<T>, deps?: Provide[]);
  constructor(
    provide: Provide<T>,
    useFactory: (p1: P1) => T | Promise<T>,
    deps: [Provide<P1>]
  );
  constructor(
    provide: Provide<T>,
    useFactory: (p1: P1, p2: P2) => T | Promise<T>,
    deps: [Provide<P1>, Provide<P2>]
  );
  constructor(
    provide: Provide<T>,
    useFactory: (p1: P1, p2: P2, p3: P3) => T | Promise<T>,
    deps: [Provide<P1>, Provide<P2>, Provide<P3>]
  );
  constructor(
    provide: Provide<T>,
    useFactory: (p1: P1, p2: P2, p3: P3, p4: P4) => T | Promise<T>,
    deps: [Provide<P1>, Provide<P2>, Provide<P3>, Provide<P4>]
  );
  constructor(
    provide: Provide<T>,
    useFactory: (p1: P1, p2: P2, p3: P3, p4: P4, p5: P5) => T | Promise<T>,
    deps: [Provide<P1>, Provide<P2>, Provide<P3>, Provide<P4>, Provide<P5>]
  );
  constructor(
    provide: Provide<T>,
    useFactory: (p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6) => T | Promise<T>,
    deps: [Provide<P1>, Provide<P2>, Provide<P3>, Provide<P4>, Provide<P5>, Provide<P6>]
  );
  constructor(
    provide: Provide<T>,
    useFactory: (
      p1: P1,
      p2: P2,
      p3: P3,
      p4: P4,
      p5: P5,
      p6: P6,
      p7: P7
    ) => T | Promise<T>,
    deps: [
      Provide<P1>,
      Provide<P2>,
      Provide<P3>,
      Provide<P4>,
      Provide<P5>,
      Provide<P6>,
      Provide<P7>
    ]
  );
  constructor(
    provide: Provide<T>,
    useFactory: (
      p1: P1,
      p2: P2,
      p3: P3,
      p4: P4,
      p5: P5,
      p6: P6,
      p7: P7,
      p8: P8
    ) => T | Promise<T>,
    deps: [
      Provide<P1>,
      Provide<P2>,
      Provide<P3>,
      Provide<P4>,
      Provide<P5>,
      Provide<P6>,
      Provide<P7>,
      Provide<P8>
    ]
  );
  constructor(
    provide: Provide<T>,
    public readonly useFactory: (...args: any[]) => T | Promise<T>,
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
