import { Inject } from './inject.js';
import { Injectable } from './injectable.js';
import { Injector } from './injector.js';

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

  it('should resolve dependecies with @Inject() decorator', async () => {
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
});
