import { Injectable } from './injectable.js';
import { Optional } from './optional.js';
import { Injector } from './injector/injector.js';

export class ServiceA {}

@Injectable()
export class ServiceB {
  constructor(@Optional() public readonly serviceA?: ServiceA) {}
}

describe('Optional', () => {
  let injector: Injector;

  beforeEach(() => {
    injector = Injector.create('Optional');
  });

  it('should create instance', () => {
    expect(injector).toBeDefined();
  });

  it('should resolve class without parameter', async () => {
    injector.register(ServiceB);
    const instance = await injector.resolve(ServiceB);
    expect(instance).toBeInstanceOf(ServiceB);
    expect(instance.serviceA).toBeUndefined();
  });
});
