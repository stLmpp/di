# Dependency injection

A very simple Dependecy Injection library inspired by [Angular DI](https://angular.dev/guide/di) and [NestJS DI](https://docs.nestjs.com/fundamentals/custom-providers) for Typescript.

## Instalation

```shell
npm install @stlmpp/di
```
or
```shell
pnpm add @stlmpp/di
```

Optionally you can use the `reflect-metadata` library and change your tsconfig.json to include the following settings, so the container can resolve your dependencies without using an explicit @Inject() decorator in the constructors of your classes

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

Add the import to the `reflect-metadata` library in your main TS file

```typescript
import 'reflect-metadata';
```

## API

### Decorators

#### @Injectable()

Class decorator used to annotate an class to be able to be registered in a container

```typescript
// Annotate the class
@Injectable()
export class MyService {}

// Register the class in the container
const injector = Injector.create('Main');
injector.register({ provide: MyService, useClass: MyService });
// or
injector.register(MyService); // This is short for { provide: MyService, useClass: MyService }

// Resolve the instance
const myServiceInstance = await injector.resolve(MyService);
```

##### Options for @Injectable()

| Property | Type | Description | Required |
| - | - | - | - |
| root | boolean | Automatically register the provider to the root injector (Similar to providedIn: 'root' from Angular Injectable | false |
| useFactory | (...args: any[]) => any | Function used to create a instance of this token (class) | false |
| deps | Array<Provider> | Array of dependencies for the useFactory function | false |
| multi | boolean | When using the use factory define if the token has multiple values | false |

#### @Inject()

Parameter decorator used to inject a token in the constructor, it accepts a class or a InjectionToken as a parameter.

```typescript
const token  = new InjectionToken<string>('my string token');

@Injectable()
export class MyService {
  constructor(
    @Inject(token) private readonly myToken: string
  ) {}
}

const injector = Injector.create('Main');
injector.register([
  { provide: token, useValue: 'my string token value' },
  MyService,
]);
```

### Injector class

An container used to store, register and resolve providers
