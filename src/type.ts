import { type Class } from 'type-fest';

export type ClassDecorator = (target: Class<any>) => void;
export type PropertyDecorator = (
  target: Class<any>,
  propertyKey: string | symbol,
) => void;
export type MethodDecorator = <T>(
  target: Class<any>,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>,
) => TypedPropertyDescriptor<T> | void;
export type ParameterDecorator = (
  target: Class<any>,
  propertyKey: string | symbol | undefined,
  parameterIndex: number,
) => void;

export interface ResolveOptions {
  multi?: boolean;
}
