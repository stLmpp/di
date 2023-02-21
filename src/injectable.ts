import { type Class } from 'type-fest';

import { type FactoryProvider } from './provider.js';
import { type ClassDecorator } from './type.js';

export type InjectableOptions = { global?: boolean } & Partial<
  Omit<FactoryProvider, 'provide'>
>;

interface Injectable {
  (options?: InjectableOptions): ClassDecorator;

  /**
   * @internal
   * @param target
   */
  get_metadata(target: Class<unknown>): InjectableOptions | null;

  /**
   * @internal
   * @param target
   * @param metadata
   */
  set_metadata(target: Class<unknown>, metadata: InjectableOptions): void;

  /**
   * @internal
   */
  get_all(): [Class<unknown>, InjectableOptions][];
}

const metadata_store = new Map<Class<unknown>, InjectableOptions>();

const get_metadata: Injectable['get_metadata'] = (target) =>
  metadata_store.get(target) ?? null;
const set_metadata: Injectable['set_metadata'] = (target, metadata) =>
  metadata_store.set(target, metadata);
const get_all: Injectable['get_all'] = () => [...metadata_store];

function injectable_internal(options?: InjectableOptions): ClassDecorator {
  return (target) => {
    set_metadata(target, options ?? {});
  };
}

export const Injectable: Injectable = Object.assign(injectable_internal, {
  get_metadata,
  set_metadata,
  get_all,
});
