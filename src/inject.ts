import { type Class } from 'type-fest';

import { type ForwardRef, is_forward_ref } from './forward-ref.js';
import { type Provide } from './provider.js';
import { type ParameterDecorator } from './type.js';

export interface InjectMetadata {
  type_fn: () => Provide;
}

interface Inject {
  (value: Provide | ForwardRef): ParameterDecorator;

  /**
   * @internal
   * @param target
   * @param index
   * @param metadata
   */
  set_metadata(target: Class<any>, index: number, metadata: InjectMetadata): void;

  /**
   * @internal
   * @param target
   */
  get_all_for_target(target: Class<any>): (InjectMetadata | undefined)[];
}

const MapParameter = Map<number, InjectMetadata>;
const metadata_store = new Map<Class<any>, Map<number, InjectMetadata>>();

const set_metadata: Inject['set_metadata'] = (target, index, metadata) => {
  let class_stored = metadata_store.get(target);
  if (!class_stored) {
    class_stored = new MapParameter();
    metadata_store.set(target, class_stored);
  }
  class_stored.set(index, metadata);
};
const get_all_for_target: Inject['get_all_for_target'] = (target) => {
  const class_stored = metadata_store.get(target) ?? new MapParameter();
  const array: (InjectMetadata | undefined)[] = [];
  for (const [index, metadata] of class_stored) {
    array[index] = metadata;
  }
  return array;
};

function inject_internal(
  provider_or_forward_ref: Provide | ForwardRef,
): ParameterDecorator {
  return (target, property_key, parameter_index) => {
    set_metadata(target, parameter_index, {
      type_fn: is_forward_ref(provider_or_forward_ref)
        ? provider_or_forward_ref.providerFn
        : () => provider_or_forward_ref,
    });
  };
}

export const Inject: Inject = Object.assign(inject_internal, {
  set_metadata,
  get_all_for_target,
});
