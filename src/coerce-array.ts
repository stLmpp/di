export function is_array(array: unknown): array is readonly unknown[] {
  return Array.isArray(array);
}

export function coerce_array<T>(possibleArray: T | T[] | readonly T[]): T[] {
  return is_array(possibleArray) ? [...possibleArray] : [possibleArray];
}
