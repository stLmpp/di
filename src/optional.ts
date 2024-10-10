export interface OptionalMetadata {
  optional: true;
}

interface Optional {
  (): ParameterDecorator;

  /**
   * @internal
   * @param target
   * @param index
   * @param metadata
   */
  set_metadata(target: any, index: number, metadata: OptionalMetadata): void;

  /**
   * @internal
   * @param target
   */
  get_all_for_target(target: any): (OptionalMetadata | undefined)[];
}

const MapParameter = Map<number, OptionalMetadata>;
const metadata_store = new Map<any, Map<number, OptionalMetadata>>();

const set_metadata: Optional['set_metadata'] = (target, index, metadata) => {
  let class_stored = metadata_store.get(target);
  if (!class_stored) {
    class_stored = new MapParameter();
    metadata_store.set(target, class_stored);
  }
  class_stored.set(index, metadata);
};
const get_all_for_target: Optional['get_all_for_target'] = (target) => {
  const class_stored = metadata_store.get(target) ?? new MapParameter();
  const array: (OptionalMetadata | undefined)[] = [];
  for (const [index, metadata] of class_stored) {
    array[index] = metadata;
  }
  return array;
};

function inject_internal(): ParameterDecorator {
  return (target, property_key, parameter_index) => {
    set_metadata(target, parameter_index, {
      optional: true,
    });
  };
}

export const Optional: Optional = Object.assign(inject_internal, {
  set_metadata,
  get_all_for_target,
});
