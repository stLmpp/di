import type { Provide } from './provider/provider.js';

export class ForwardRef {
  constructor(public readonly providerFn: () => Provide) {}
}

export function forwardRef(providerFn: () => Provide): ForwardRef {
  return new ForwardRef(providerFn);
}

export function is_forward_ref(value: unknown): value is ForwardRef {
  return value instanceof ForwardRef;
}
