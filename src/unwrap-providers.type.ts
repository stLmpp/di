import { type Provide } from './provider.js';

export type UnwrapProviders<T extends Provide<any>[]> = {
  [K in keyof T]: T[K] extends Provide<infer P> ? P : never;
};
