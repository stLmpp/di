import type { Class } from 'type-fest';
import type { Provide } from './provider/provider.js';

export type ClassDecorator = (target: Class<any>) => void;
export type ParameterDecorator = (
  target: Class<any>,
  propertyKey: string | symbol | undefined,
  parameterIndex: number,
) => void;
export type UnwrapProviders<T extends Provide[]> = {
  [K in keyof T]: T[K] extends Provide<infer P> ? P : never;
};
