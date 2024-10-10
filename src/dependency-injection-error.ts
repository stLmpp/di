export class DependencyInjectionError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'DependencyInjectionError';
  }
}
