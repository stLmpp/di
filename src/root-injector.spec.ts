import { Injectable } from './injectable.js';
import { ROOT_INJECTOR } from './root-injector.js';

@Injectable({ root: true })
export class ServiceA {}

@Injectable({ root: true })
export class ServiceB {
  constructor(public readonly serviceA: ServiceA) {}
}

const serviceCValue = {};

@Injectable({ root: true, useFactory: () => serviceCValue })
export class ServiceC {}

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
});

// TODO test abstract classes
