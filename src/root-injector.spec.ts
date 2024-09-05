import { Injectable } from './injectable.js';
import { ROOT_INJECTOR } from './root-injector.js';
import { InjectionToken } from './injection-token.js';
import { DependencyInjectionError } from './dependency-injection-error.js';
import { stringify_target } from './base-injector.js';
import { FactoryProvider, ValueProvider } from './provider.js';

@Injectable({ root: true })
export class ServiceA {}

@Injectable({ root: true })
export class ServiceB {
  constructor(public readonly serviceA: ServiceA) {}
}

const serviceCValue = {};

@Injectable({ root: true, useFactory: () => serviceCValue })
export class ServiceC {}

export abstract class ServiceDAbstract {
  abstract t(): void;
}

export class ServiceDImpl extends ServiceDAbstract {
  t() {
    return;
  }
}

const token = new InjectionToken('multi global');

const token2 = new InjectionToken('multi global 2');

export class ServiceNotRegistered {}

@Injectable({ root: true })
export class ServiceE {
  constructor(private readonly service: ServiceNotRegistered) {}
}

@Injectable({ root: true })
export class ServiceF {}

@Injectable()
export class ServiceG {
  constructor(
    public readonly serviceF: ServiceF,
    public readonly value: string,
  ) {}
}

export const token3 = new InjectionToken('global', {
  useFactory: () => 'global',
});

describe('RootInjector', () => {
  it('should resolve a root service', async () => {
    const instance = await ROOT_INJECTOR.resolve(ServiceA);
    expect(instance).toBeInstanceOf(ServiceA);
  });

  it('should resolve the same instance', async () => {
    const instance = await ROOT_INJECTOR.resolve(ServiceA);
    expect(instance).toBeInstanceOf(ServiceA);
    expect(await ROOT_INJECTOR.resolve(ServiceA)).toBe(instance);
  });

  it('should resolve class with dependencies', async () => {
    const instance = await ROOT_INJECTOR.resolve(ServiceB);
    expect(instance).toBeInstanceOf(ServiceB);
    expect(instance.serviceA).toBeInstanceOf(ServiceA);
  });

  it('should resolve class with dependencies with the same instances', async () => {
    const instance = await ROOT_INJECTOR.resolve(ServiceB);
    expect(instance).toBeInstanceOf(ServiceB);
    expect(instance.serviceA).toBeInstanceOf(ServiceA);
    expect(await ROOT_INJECTOR.resolve(ServiceA)).toBe(instance.serviceA);
    expect(await ROOT_INJECTOR.resolve(ServiceB)).toBe(instance);
  });

  it('should resolve from root with factory', async () => {
    const instance = await ROOT_INJECTOR.resolve(ServiceC);
    expect(instance).toBe(serviceCValue);
  });

  it('should accept Abstract class', async () => {
    ROOT_INJECTOR.register([
      {
        provide: ServiceDAbstract,
        useClass: ServiceDImpl,
      },
    ]);
    const instance = await ROOT_INJECTOR.resolve(ServiceDAbstract);
    expect(instance).toBeInstanceOf(ServiceDImpl);
    expect(instance.t).toBeDefined();
  });

  it('should resolve multi', async () => {
    ROOT_INJECTOR.register([
      {
        provide: token,
        useValue: 'value1',
        multi: true,
      },
      {
        provide: token,
        useValue: 'value2',
        multi: true,
      },
    ]);
    const values = await ROOT_INJECTOR.resolveAll(token);
    expect(values).toEqual(['value1', 'value2']);
  });

  it('should resolve multi with same value (ref)', async () => {
    const value1 = { value: 1 };
    const value2 = { value: 2 };
    ROOT_INJECTOR.register([
      {
        provide: token2,
        useValue: value1,
        multi: true,
      },
      {
        provide: token2,
        useValue: value2,
        multi: true,
      },
    ]);
    const values = await ROOT_INJECTOR.resolveAll(token2);
    expect(values).toEqual([value1, value2]);
    expect(values[0]).toBe(value1);
    expect(values[1]).toBe(value2);
    const valuesAgain = await ROOT_INJECTOR.resolveAll(token2);
    expect(valuesAgain).toEqual([value1, value2]);
    expect(valuesAgain[0]).toBe(value1);
    expect(valuesAgain[1]).toBe(value2);
  });

  it('should work with useFactory deps', async () => {
    ROOT_INJECTOR.register(
      new FactoryProvider(ServiceG, (serviceF, value) => new ServiceG(serviceF, value), [
        ServiceF,
        token3,
      ]),
    );
    const instance = await ROOT_INJECTOR.resolve(ServiceG);
    expect(instance).toBeInstanceOf(ServiceG);
    expect(instance.serviceF).toBeInstanceOf(ServiceF);
    expect(instance.value).toBe('global');
    expect(await ROOT_INJECTOR.resolve(ServiceF)).toBe(instance.serviceF);
  });
});
