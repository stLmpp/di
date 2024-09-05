import { ClassProvider } from './class-provider.js';
import { resolveProvider } from './resolve-provider.js';
import { FactoryProvider } from './factory-provider.js';
import { ValueProvider } from './value-provider.js';
import { DependencyInjectionError } from '../dependency-injection-error.js';

class Service {}

describe('resolve-provider', () => {
  it('should work with ClassProvider instance', () => {
    const classProvider = new ClassProvider(Service, Service);
    const provider = resolveProvider(classProvider);
    expect(provider).toBeInstanceOf(ClassProvider);
    expect(provider).toBe(classProvider);
  });

  it('should work with FactoryProvider instance', () => {
    const factoryProvider = new FactoryProvider(Service, () => new Service());
    const provider = resolveProvider(factoryProvider);
    expect(provider).toBeInstanceOf(FactoryProvider);
    expect(provider).toBe(factoryProvider);
  });

  it('should work with ValueProvider instance', () => {
    const valueProvider = new ValueProvider(Service, new Service());
    const provider = resolveProvider(valueProvider);
    expect(provider).toBeInstanceOf(ValueProvider);
    expect(provider).toBe(valueProvider);
  });

  it('should work with class', () => {
    const provider = resolveProvider(Service);
    expect(provider).toBeInstanceOf(ClassProvider);
    expect(provider.provide).toBe(Service);
    expect((provider as ClassProvider).useClass).toBe(Service);
  });

  it('should work with pojo (ClassProvider)', () => {
    const provider = resolveProvider({
      provide: Service,
      useClass: Service,
    });
    expect(provider).toBeInstanceOf(ClassProvider);
    expect(provider.provide).toBe(Service);
    expect((provider as ClassProvider).useClass).toBe(Service);
  });

  it('should work with pojo (FactoryProvider)', () => {
    const provider = resolveProvider({
      provide: Service,
      useFactory: () => Service,
    });
    expect(provider).toBeInstanceOf(FactoryProvider);
    expect(provider.provide).toBe(Service);
    expect((provider as FactoryProvider).useFactory).toBeDefined();
  });

  it('should work with pojo (ValueProvider)', () => {
    const provider = resolveProvider({
      provide: Service,
      useValue: new Service(),
    });
    expect(provider).toBeInstanceOf(ValueProvider);
    expect(provider.provide).toBe(Service);
    expect((provider as ValueProvider).useValue).toBeInstanceOf(Service);
  });

  it.each([
    {},
    [],
    true,
    false,
    new Date(),
    1,
    'STRING',
    Symbol(),
    /a/,
    undefined,
    null,
    { useValue: 1 },
    { useClass: Service },
    { useFactory: () => 1 },
    { provide: 1, useFactory: {} },
    { provide: 1, useClass: {} },
  ])('should throw if pojo is not valid (%s)', (value) => {
    expect(() => resolveProvider(value as never)).toThrow(DependencyInjectionError);
  });
});
