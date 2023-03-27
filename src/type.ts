import { type Class } from 'type-fest';

export type ClassDecorator = (target: Class<unknown>) => void;
export type PropertyDecorator = (
  target: Class<unknown>,
  propertyKey: string | symbol
) => void;
export type MethodDecorator = <T>(
  target: Class<unknown>,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>
) => TypedPropertyDescriptor<T> | void;
export type ParameterDecorator = (
  target: Class<unknown>,
  propertyKey: string | symbol | undefined,
  parameterIndex: number
) => void;
