import { ForwardRef, forwardRef, is_forward_ref } from './forward-ref.js';

class Service {}

describe('forward-ref', () => {
  it('should create instance', () => {
    const ref = forwardRef(() => Service);
    expect(ref).toBeInstanceOf(ForwardRef);
    expect(ref.providerFn()).toBe(Service);
  });

  it('should check if value is forwardRef', () => {
    const ref = forwardRef(() => Service);
    expect(is_forward_ref(ref)).toBe(true);
    const ref1: ForwardRef = { providerFn: () => Service };
    expect(is_forward_ref(ref1)).toBe(false);
  });
});
