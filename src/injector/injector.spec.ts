import { Inject } from '../inject.js';
import { Injectable } from '../injectable.js';
import { Injector } from './injector.js';
import { InjectionToken } from '../injection-token.js';
import { DependencyInjectionError } from '../dependency-injection-error.js';
import { ValueProvider } from '../provider/value-provider.js';

@Injectable()
class Service1 {}

@Injectable()
class Service2 {}

@Injectable()
class Service3 {
  constructor(@Inject(Service2) public readonly service2: Service2) {}
}

@Injectable()
class Service4 {}

@Injectable()
class Service5 {
  constructor(public readonly service4: Service4) {}
}

@Injectable({ root: true })
class Service6 {}

@Injectable({ root: true })
class Service7 {
  constructor(public readonly service6: Service6) {}
}

const rootToken = new InjectionToken('this is multi - root', {
  multi: true,
  useFactory: () => 'value1',
});

const token = new InjectionToken('this is multi - local');

describe('Injector', () => {
  let injector: Injector;

  beforeEach(() => {
    injector = Injector.create('Main');
  });

  it('should create instance of injector', () => {
    expect(injector).toBeDefined();
  });

  it('should create singleton of service', async () => {
    injector.register(Service1);
    const service = await injector.resolve(Service1);
    expect(service).toBeInstanceOf(Service1);
    const service1 = await injector.resolve(Service1);
    expect(service1).toBe(service);
  });

  it('should resolve dependencies with @Inject() decorator', async () => {
    injector.register([Service2, Service3]);
    const service3 = await injector.resolve(Service3);
    expect(service3).toBeInstanceOf(Service3);
    const service2 = await injector.resolve(Service2);
    expect(service2).toBeInstanceOf(Service2);
    expect(service3.service2).toBeInstanceOf(Service2);
    expect(service3.service2).toBe(service2);
  });

  it('should resolve class dependencies without @Inject() decorator', async () => {
    injector.register([Service4, Service5]);
    const service5 = await injector.resolve(Service5);
    expect(service5).toBeInstanceOf(Service5);
    const service4 = await injector.resolve(Service4);
    expect(service4).toBeInstanceOf(Service4);
    expect(service5.service4).toBeInstanceOf(Service4);
    expect(service5.service4).toBe(service4);
  });

  it('should resolve global providers', async () => {
    const service6 = await injector.resolve(Service6);
    expect(service6).toBeInstanceOf(Service6);
    const service7 = await injector.resolve(Service7);
    expect(service7).toBeInstanceOf(Service7);
    expect(service7.service6).toBe(service6);
  });

  it('should resolve dependency with multi', async () => {
    injector.register(new ValueProvider(token, 'value1', true));
    injector.register(new ValueProvider(token, 'value2', true));
    injector.register(new ValueProvider(token, 'value3', true));
    const values = await injector.resolveAll(token);
    expect(values).toEqual(['value1', 'value2', 'value3']);
  });

  it('should resolve dependency with multi (multiple times)', async () => {
    const value1 = { value1: true };
    const value2 = { value2: true };
    const value3 = { value3: true };
    injector.register(new ValueProvider(token, value1, true));
    injector.register(new ValueProvider(token, value2, true));
    injector.register(new ValueProvider(token, value3, true));
    expect(await injector.resolveAll(token)).toEqual([value1, value2, value3]);
    expect(await injector.resolveAll(token)).toEqual([value1, value2, value3]);
  });

  it('should resolve dependency with multi from global', async () => {
    injector.register(new ValueProvider(rootToken, 'value2', true));
    injector.register(new ValueProvider(rootToken, 'value3', true));
    const values = await injector.resolveAll(rootToken);
    expect(values).toEqual(['value2', 'value3', 'value1']);
  });

  it('should throw error if provider is not found (resolve)', async () => {
    await expect(() => injector.resolve(token)).rejects.toThrow(DependencyInjectionError);
  });

  it('should throw error if provider is not found (get)', async () => {
    expect(() => injector.get(token)).toThrow(DependencyInjectionError);
  });

  it('should not throw when using getAll', () => {
    const result = injector.getAll(token);
    expect(result).toEqual([]);
  });
});
