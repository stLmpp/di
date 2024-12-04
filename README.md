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

### Optional Setup
To enable automatic resolution of dependencies using reflect-metadata:

Add the following to your tsconfig.json:
```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

Import reflect-metadata in your main TypeScript file:

```typescript
import 'reflect-metadata';
```

## Quick Start
Here's a quick example to demonstrate the core features of the library:

```typescript
import { Injectable, Injector, InjectionToken, Inject } from '@stlmpp/di';
import 'reflect-metadata';

const MY_TOKEN = new InjectionToken<string>('my token');
const MY_OTHER_TOKEN = new InjectionToken<string>('my other token');

@Injectable()
class AuthService {

  constructor(
    @Inject(MY_TOKEN) private readonly myToken: string,
    @Inject(MY_OTHER_TOKEN) private readonly myOtherToken: string,
  ) {

  }

  login(user: string, password: string): boolean {
    console.log(`Logging in user: ${user}`);
    return true;
  }
}

@Injectable()
class AppController {
  constructor(private readonly authService: AuthService) {}

  start() {
    this.authService.login('user', 'password');
  }
}

// Create an injector and register providers
const injector = Injector.create('App');
// Register one at a time
injector.register(AppController);
injector.register(AuthService);
// Register multiple
injector.register([
  { provide: MY_TOKEN, useValue: 'my token value' },
  // Using the class here for the typescript support in the factory function
  new FactoryProvider(
    MY_OTHER_TOKEN,
    (myToken: string) => `my other token + ${myToken}`,
    [MY_TOKEN],
  ),
]);

// Resolve and use the AppController
const appController = await injector.resolve(AppController);
appController.start();

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

WIP
