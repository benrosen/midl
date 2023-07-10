# midl

A little middleware goes a long way.

## Introduction

Software development often requires functions to perform more than their core tasks, such as logging, validating inputs
and outputs, among others. This often leads to additional code within the function, complicating its definition and
execution.

For example, consider the following code:

```javascript
function add(a, b) {
	if (typeof a !== 'number' || typeof b !== 'number') {
		throw new Error('Inputs must be numbers');
	}

	const result = a + b;

	console.log(`Adding ${a} and ${b} yields ${result}`);

	return result;
}
```

The `add` function's responsibility should ideally be limited to adding two numbers. However, it is also handling input
validation and logging, making it complex and less manageable.

`midl` offers a solution by allowing the inclusion of middleware to handle these additional responsibilities.

## Table of Contents

- [What is Middleware?](#what-is-middleware)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Reference Documentation](#reference-documentation)
- [Practical Usage Examples](#practical-usage-examples)
	- [Creating a Central Middleware Application Function](#creating-a-central-middleware-application-function)
	- [Making Assertions with `midl`](#making-assertions-with-midl)
	- [Adding Global Middleware in Class Methods](#adding-global-middleware-in-class-methods)
	- [Applying Middleware while Importing and Exporting](#applying-middleware-while-importing-and-exporting)
	- [Using Middleware Configuration Files](#using-middleware-configuration-files)
	- [Implementing the Circuit Breaker Pattern with `midl`](#implementing-the-circuit-breaker-pattern-with-midl)
	- [Using `midl` for Caching and Memoization](#using-midl-for-caching-and-memoization)
	- [Fine-grained Authentication and Authorization with `midl`](#fine-grained-authentication-and-authorization-with-midl)

## What is Middleware?

In software development, we often find our simple tasks becoming complicated due to added responsibilities. It's like a
postman, who besides delivering letters, now has to sort mail, verify addresses, and time-stamp deliveries. This added
complexity reduces manageability and increases errors. Middleware can help here, just as a sorting team, an address
verifier, and a time-stamping machine can help our postman.

## Installation

To incorporate `midl` into your project, you can install it through npm:

```bash
npm install midl
```

Alternatively, you can use yarn:

```bash
yarn add midl
```

## Basic Usage

`midl` is a simple tool that allows you to add middleware to your functions for improved management of inputs, outputs,
and errors. Consider this scenario: You have a function named `add` for summing two numbers:

```javascript
const add = (a, b) => a + b;
```

With `midl`, you can easily enhance this function with middleware like this:

```javascript
import {createFunctionWithMiddleware as midl} from 'midl';

const validateInput = (definition, a, b) => {
	if (typeof a !== 'number' || typeof b !== 'number') {
		throw new Error('Inputs must be numbers');
	}
	return [a, b];
};

const logOutput = (definition, output, a, b) => {
	console.log(`Adding ${a} and ${b} yields ${output}`);
	return output;
};

let add = (a, b) => a + b;

add = midl(add, {
	handleInput: validateInput,
	handleOutput: logOutput,
});

add(1, 2); // prints: Adding 1 and 2 yields 3
```

Here, the core `add` function remains focused on its primary task, i.e., adding numbers. Meanwhile, middleware
functions `validateInput` and `logOutput` manage input validation and output logging, resulting in better organized and
more comprehensible code.

## Reference Documentation

### Function Signature

```typescript
export const createFunctionWithMiddleware = <
	I extends any[],
	O extends any,
	F extends (...inputs: I) => O,
>(
	definition: F,
	config?: {
		assertions?: [I, O][];
		handleError?: (definition: F, error: Error, ...inputs: I) => O;
		handleInput?: (definition: F, ...inputs: I) => I;
		handleOutput?: (definition: F, output: O, ...inputs: I) => O;
	},
): F => {
	// ...
};
```

### Parameters

- `definition`: The original function to which the middleware should be applied.

- `config` (optional): An object containing optional parameters for handling assertions, errors, inputs, and outputs. It
  includes:

	- `assertions` (optional): An array of pairs of inputs and expected outputs for assertions. Each pair consists of an
	  array of inputs and the expected output. The assertions are checked immediately when the middleware-wrapped
	  function is created, throwing an error if the actual output does not match the expected one.

	- `handleError` (optional): A function that is called when there is an error during the execution of the original
	  function. It takes as arguments the original function definition, the error object, and the input arguments passed
	  to the original function. It should return an output of the same type as the original function.

	- `handleInput` (optional): A function that is called before the execution of the original function and can modify
	  its inputs. It takes as arguments the original function definition and the input arguments passed to the original
	  function. It should return a modified input array.

	- `handleOutput` (optional): A function that is called after the execution of the original function and can modify
	  its output. It takes as arguments the original function definition, the original function output, and the input
	  arguments passed to the original function. It should return a modified output.

### Return Value

Returns a new function with the middleware applied to it.

## Practical Usage Examples

This section shows practical ways to use `midl` for various coding needs. Examples cover basic to advanced uses, such as
creating a central middleware function, A/B testing, and implementing the circuit breaker pattern.

### Creating a Central Middleware Application Function

You can use `midl` to create a central middleware application function, enhancing code reusability, maintainability, and
ease of testing. The central function applies the middleware to all other functions, and the middleware can be easily
modified in one place.

Here's an example:

```typescript
import {createFunctionWithMiddleware} from 'midl';

// Central middleware application function
function applyMiddleware(fn) {
	return createFunctionWithMiddleware(fn, {
		handleInput: (fn, ...inputs) => {
			console.log(`Inputs to ${fn.name}:`, inputs);
			return inputs;
		},
		handleOutput: (fn, result) => {
			console.log(`Output from ${fn.name}:`, result);
			return result;
		},
		handleError: (fn, error) => {
			console.error(`Error in ${fn.name}:`, error);
			throw error;
		},
	});
}

const add = (a, b) => a + b;
const addWithMiddleware = applyMiddleware(add);
console.log(addWithMiddleware(1, 2));
```

In this, `applyMiddleware` applies middleware that logs input and output to any function. This approach reduces code
duplication and improves maintainability. Custom middleware can be developed as per requirements to modify inputs,
outputs, or handle errors.

### Making Assertions with `midl`

Assertions using `midl` allow you to check if conditions in your functions are met. In the function `multiply`, we
specify the expected outputs. If they're not met, an error is thrown.

```typescript
import {createFunctionWithMiddleware} from 'midl';

function multiply(a: number, b: number): number {
	return a * b;
}

const multiplyWithAssertions = createFunctionWithMiddleware(multiply, {
	assertions: [[[2, 3], 6], [[-2, 3], -6], [[0, 3], 0]],
});

console.log(multiplyWithAssertions(2, 3)); // Output: 6
```

Similarly, in `sumArray`, we check for expected sum of array elements.

```typescript
function sumArray(arr: number[]): number {
	return arr.reduce((sum, num) => sum + num, 0);
}

const sumArrayWithAssertions = createFunctionWithMiddleware(sumArray, {
	assertions: [
		[[1, 2, 3, 4, 5], 15],
		[[0, 0, 0], 0],
		[[], 0]
	],
});


console.log(sumArrayWithAssertions([1, 2, 3, 4, 5])); // Output: 15
```

In functions with multiple inputs, use input and output pairs; for single-parameter, wrap the input array in another
array. Assertions using `midl` help with debugging and testing your functions, ensuring your code behaves as expected.

### Adding Global Middleware in Class Methods

Let's consider a `Calculator` class where the methods `add` and `subtract` require middleware. By defining and applying
middleware in the constructor using `createFunctionWithMiddleware`, we can log inputs and outputs of these methods,
keeping our code DRY and easy to debug.

```typescript
import {createFunctionWithMiddleware} from 'midl';

class Calculator {
	constructor() {
		this.add = this.applyMiddleware(this.add);
		this.subtract = this.applyMiddleware(this.subtract);
	}

	applyMiddleware(fn) {
		return createFunctionWithMiddleware(fn, {
			handleInput: (fn, ...args) => {
				console.log(`Calling ${fn.name} with arguments: `, args);
				return args;
			},
			handleOutput: (fn, result) => {
				console.log(`Result of ${fn.name}: ${result}`);
				return result;
			},
		});
	}

	add(a, b) {
		return a + b;
	}

	subtract(a, b) {
		return a - b;
	}
}

const calculator = new Calculator();
console.log(calculator.add(3, 2));  // Logs: "Calling add with arguments: [3,2]", "Result of add: 5"
console.log(calculator.subtract(7, 4));  // Logs: "Calling subtract with arguments: [7,4]", "Result of subtract: 3"
```

By applying middleware to class methods, we ensure consistent and maintainable code handling across our project.

### Applying Middleware while Importing and Exporting

Middleware in JavaScript, when used with module imports and exports, provides a powerful way to enforce consistent
behaviors, like logging or input validation, across your modules. For instance, using the `midl` library, you can apply
a
logging middleware to a math utility library:

```javascript
// mathUtils.ts
export const add = (a, b) => a + b;
// ...

// midlifiedMathUtils.ts
import {createFunctionWithMiddleware} from 'midl';
import * as mathUtils from './mathUtils';

const logger = {
	handleInput: (func, ...inputs) => {
		console.log(`Calling ${func.name} with inputs: ${inputs.join(', ')}`);
		return inputs;
	},
	handleOutput: (func, output, ...inputs) => {
		console.log(`Function ${func.name} returned: ${output}`);
		return output;
	}
};

export default Object.keys(mathUtils).reduce((acc, funcName) => {
	acc[funcName] = createFunctionWithMiddleware(mathUtils[funcName], logger);
	return acc;
}, {});
```

In this way, you only need to define your middleware once and apply it across multiple functions, promoting code
efficiency. However, it's essential to ensure your middleware doesn't inadvertently alter your function behaviors and
can handle potential edge cases.

### Using Middleware Configuration Files

Separating middleware configurations into individual files enhances your application's modularity and manageability. For
example, consider a middleware that logs function inputs and outputs. You can define this in a separate
file, `loggingMiddleware.ts`, like this:

```typescript
export default {
	handleInput: (func, ...inputs) => {
		console.log(`Inputs to function ${func.name}:`, inputs);
		return inputs;
	},
	handleOutput: (func, result, ...inputs) => {
		console.log(`Output from function ${func.name} when called with inputs ${inputs}:`, result);
		return result;
	},
};
```

In your main application, import this middleware using `import loggingMiddleware from './loggingMiddleware';` and apply
it to a function:

```typescript
import {createFunctionWithMiddleware} from 'midl';
import loggingMiddleware from './loggingMiddleware';

function add(a: number, b: number): number {
	return a + b;
}

const addWithLogging = createFunctionWithMiddleware(add, loggingMiddleware);

console.log(addWithLogging(1, 2)); // Logs input and output, outputs: 3
```

This separation enhances reusability, isolation, and testability, promoting cleaner, more maintainable code. The choice
to use this approach should be based on your application's complexity and your specific needs.

### Implementing the Circuit Breaker Pattern with `midl`

The Circuit Breaker design pattern, akin to an electrical circuit breaker that interrupts a circuit upon anomaly
detection, safeguards software systems from continuous failures. When a system operation likely to fail is repeatedly
executed, this pattern prevents it, allowing smooth operation despite the faulty function. We can use middleware,
like `midl`, to execute this pattern, protecting various system segments from potential failure in other parts.

Consider a `fetchData` function that retrieves data from an external API:

```typescript
import axios from 'axios';

async function fetchData(url: string): Promise<any> {
	const response = await axios.get(url);
	return response.data;
}
```

We can utilize `midl` to implement a circuit breaker:

```typescript
import {createFunctionWithMiddleware} from 'midl';

enum CircuitState {
	Closed,
	Open,
	HalfOpen,
}

let circuitState = CircuitState.Closed;
let failureCount = 0;
const MAX_FAILURE_COUNT = 5;

const fetchDataWithCircuitBreaker = createFunctionWithMiddleware(fetchData, {
	handleError: (fetchData, error, url) => {
		if (++failureCount >= MAX_FAILURE_COUNT) {
			circuitState = CircuitState.Open;
		}
		throw error;
	},
	handleInput: (fetchData, url) => {
		if (circuitState === CircuitState.Open) {
			throw new Error('Circuit is open. Cannot perform operation.');
		}
		if (circuitState === CircuitState.HalfOpen && failureCount < MAX_FAILURE_COUNT) {
			circuitState = CircuitState.Closed;
		}
		return [url];
	},
	handleOutput: (fetchData, result, url) => {
		failureCount = 0;
		circuitState = CircuitState.Closed;
		return result;
	},
});

fetchDataWithCircuitBreaker('https://api.example.com/data');
```

In this case, `handleError` increases the failure count with every error. If the count surpasses
the `MAX_FAILURE_COUNT`, the circuit breaks, blocking further operations. `handleInput` inspects the circuit state
before each operation, stopping operations if open, and checking if it should close if half-open. `handleOutput` resets
the failure count and closes the circuit upon successful operation.

### Using `midl` for Caching and Memoization

Caching and memoization enhance function performance by storing and reusing results for recurring inputs. Using `midl`,
you can seamlessly incorporate caching into your functions with middleware. Let's take a Fibonacci numbers function as
an example:

```typescript
function fibonacci(n: number): number {
	if (n <= 1) return n;
	return fibonacci(n - 1) + fibonacci(n - 2);
}
```

You can integrate memoization into this function with `midl`:

```typescript
import {createFunctionWithMiddleware} from 'midl';

const cache = new Map<number, number>(); // cache to store results

const fibonacciWithMemoization = createFunctionWithMiddleware(fibonacci, {
	handleInput: (fibonacci, n) => cache.has(n) ? [cache.get(n)] : [n],
	handleOutput: (fibonacci, result, n) => {
		cache.set(n, result); // store result in cache
		return result; // return result
	},
});

console.log(fibonacciWithMemoization(50)); // Outputs: 12586269025
```

`handleInput` checks if the result for `n` exists in the cache and returns it; if not, the function runs
normally. `handleOutput` saves the result in the cache before returning it, ensuring each result is calculated once,
optimizing performance. This approach can be extended to more complex functions and advanced caching strategies.

### Fine-grained Authentication and Authorization with `midl`

Consider an API that allows users to update their profiles. Here, you might use `midl` for user
authentication and authorization:

```typescript
import {createFunctionWithMiddleware} from 'midl';

const usersDB = [{id: 1, name: 'Alice', password: 'password123'}];

function authenticate(username: string, password: string): any {
	const user = usersDB.find((user) => user.name === username && user.password === password);
	if (!user) throw new Error('Authentication failed');
	return user;
}

function authorize(user: any, userId: number): void {
	if (user.id !== userId) throw new Error('Authorization failed');
}

function updateUser(userId: number, newName: string): any {
	const user = usersDB.find((user) => user.id === userId);
	if (!user) throw new Error('User not found');
	user.name = newName;
	return user;
}

const updateUserWithAuth = createFunctionWithMiddleware(updateUser, {
	handleInput: (updateUser, userId, newName) => {
		const user = authenticate('Alice', 'password123'); // mock
		authorize(user, userId);
		return [userId, newName];
	},
	handleError: (updateUser, error) => {
		console.error(`An error occurred: ${error.message}`);
	},
});

console.log(updateUserWithAuth(1, 'Alicia'));
```

This script validates users' credentials (`authenticate`), verifies permissions (`authorize`), and manages
errors (`handleError`). Real-world applications should fetch user credentials securely, and authorization checks may
include role-based permissions. Always follow best practices in handling sensitive data.
