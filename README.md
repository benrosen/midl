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
- [Quick Start](#quick-start)
- [Reference Documentation](#reference-documentation)
- [Practical Usage Examples](#practical-usage-examples)
	- [Creating a Central Middleware Application Function](#creating-a-central-middleware-application-function)
	- [Making Assertions with `midl`](#making-assertions-with-midl)
	- [Adding Global Middleware in Class Methods](#adding-global-middleware-in-class-methods)
	- [Applying Middleware while Importing and Exporting](#applying-middleware-while-importing-and-exporting)
	- [Augmenting the Function.prototype](#augmenting-the-functionprototype)
	- [Overriding Function.prototype.call](#overriding-functionprototypecall)
	- [Using Middleware Configuration Files](#using-middleware-configuration-files)
	- [Using a Middleware Registry](#using-a-middleware-registry)
	- [Doing A/B Testing with `midl`](#doing-ab-testing-with-midl)
	- [Implementing the Circuit Breaker Pattern with `midl`](#implementing-the-circuit-breaker-pattern-with-midl)
	- [Using `midl` for Caching and Memoization](#using-midl-for-caching-and-memoization)
	- [Fine-grained Authentication and Authorization with `midl`](#fine-grained-authentication-and-authorization-with-midl)

## What is Middleware?

When building software, it's common to encounter a situation where simple tasks start to bear additional
responsibilities, turning straightforward operations into a web of complexity. To illustrate this, think of a mail
carrier whose role is to deliver letters from the post office to the recipients. Now, imagine if the mail carrier is
also tasked with sorting the letters by neighborhood, verifying the addresses for errors, and time-stamping each
delivery. Suddenly, a once unpretentious job becomes daunting.

This is similar to what happens in software development. Functions—our basic building blocks—get overloaded with
multiple responsibilities, which can lead to an increase in complexity and reduce manageability. Wouldn't it be better
if functions, like our mail carrier, could focus on their main tasks while the additional chores are taken care of
separately? This is where Middleware comes into the picture.

### The Middleware Magic

Let's revisit our mail carrier scenario. Suppose, instead of performing all those auxiliary tasks alone, there was a
team to sort the mail at the post office, a system to verify addresses, and a device to time-stamp the deliveries.
Suddenly, the job is straightforward again—the mail carrier just delivers the mail.

Middleware in software development works in a similar way—it acts as a helper, handling extra tasks and thereby freeing
up the main function to concentrate on its primary job. If we consider a function that adds two numbers, but also
validates the inputs and logs the result, middleware could allow us to extract the validation and logging tasks into
separate functions. This makes the main function—addition—more straightforward, and the code becomes more organized and
easier to maintain.

### Introducing midl

midl is a library designed to help you implement middleware in your applications. It allows you to manage auxiliary
tasks such as input validation, output handling, and error management, without complicating the core logic of your
functions.

For instance, suppose you have a function to divide two numbers. Ordinarily, you would need to include a code snippet to
check if the denominator is zero to avoid a division by zero error. With midl, you can create a middleware that checks
this condition before the function runs and handles the error, making your divide function simple and straightforward.

The concept is simple: let middleware handle the extra chores while your functions focus on their main tasks. Just like
the mail carrier with a helper, midl makes your programming tasks less complex and more enjoyable. Embrace the power of
middleware with midl and simplify your code!

Additional resources for understanding middleware:

- [Middleware on Wikipedia](https://en.wikipedia.org/wiki/Middleware)
- [Middleware in Node.js with express](https://expressjs.com/en/guide/writing-middleware.html)
- [Middleware in Python with Django](https://docs.djangoproject.com/en/3.0/topics/http/middleware/)

## Installation

Install `midl` via npm:

```bash
npm install midl
```

Or via yarn:

```bash
yarn add midl
```

## Quick Start

To quickly get started with `midl`, here's a simple example. Suppose you have a function `add` that adds two numbers:

```javascript
const add = (a, b) => a + b;
```

You can apply middleware to this function using `midl` like so:

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

add(1, 2); // Adding 1 and 2 yields 3
```

Now, the original `add` function solely performs addition, while input validation and logging are handled by middleware
functions, making the code more maintainable and readable.

## Reference Documentation

The primary function exported by `midl` is `createFunctionWithMiddleware`, which has the following signature:

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

Here's what each part means:

- `definition`: This is the original function to which the middleware should be applied.
- `config`: An optional configuration object, which can include:
	- `assertions`: An array of pairs of inputs and expected outputs for assertions after the function execution.
	- `handleError`: A function that is called when there is an error during the execution of the original function.
	- `handleInput`: A function that is called before the execution of the original function and can modify its inputs.
	- `handleOutput`: A function that is called after the execution of the original function and can modify its output.

The function returns a new version of the original function with the middleware applied to it.

## Practical Usage Examples

In this section, we provide several practical examples that demonstrate various ways you can use `midl` to handle
diverse application requirements. The examples here are designed to help you better understand how `midl` can integrate
into your codebase and bring value. They will guide you on using middleware to solve common problems in a simple and
elegant way.

We've covered a wide range of scenarios to demonstrate the versatility of `midl`. The examples include creating a
central middleware function, using global middleware in class methods, applying middleware during importing and
exporting, enhancing the `Function.prototype`, overriding `Function.prototype.call`, and using middleware configuration
files.

In addition, we have included a few advanced examples that show how you can use `midl` to facilitate A/B testing,
implement the circuit breaker pattern, enable caching and memoization, and provide fine-grained authentication and
authorization.

These examples are designed to be more than just a demonstration of `midl`'s capabilities; they also provide practical
code snippets that you can adapt to your specific needs. They are complete and ready to use, but they are also flexible
enough for you to modify and expand upon based on your unique project requirements.

Remember, while these examples cover a wide array of usage scenarios, they merely scratch the surface of what `midl` can
do. Middleware provides a powerful abstraction for encapsulating and modularizing behavior in a way that is easy to
understand, manage, and test. As you become more comfortable with `midl`, you'll discover new and creative ways to use
middleware to improve your code.

Let's dive in and explore these examples together.

### Creating a Central Middleware Application Function

When designing complex applications, it's essential to have a strategy that allows you to keep your codebase clean,
readable, and maintainable. Middleware shines in this area, and with `midl`, creating a central middleware application
function becomes a powerful method for managing cross-cutting concerns, such as logging, error handling, validation, and
more, across all of your functions.

A central middleware function helps in:

1. **Code Reusability**: If multiple functions need to use the same middleware, a central function would be a more
   efficient approach. Instead of applying the middleware to each function individually, you can apply it once in the
   central function.
2. **Maintainability**: As your project grows, maintaining middleware can become challenging. Having a central function
   makes it easier to add, remove, or update middleware, since it's all in one place.
3. **Ease of Testing**: It's easier to test a central middleware function because it encapsulates the middleware logic
   separately from the business logic.

Here's an example of how you can create a central middleware application function with `midl`:

```typescript
import {createFunctionWithMiddleware} from 'midl';

// This is your central middleware application function
function applyMiddleware(fn) {
	return createFunctionWithMiddleware(fn, {
		handleInput: (fn, ...inputs) => {
			console.log(`Inputs to ${fn.name}:`, inputs);
			return inputs; // return inputs unmodified
		},
		handleOutput: (fn, result) => {
			console.log(`Output from ${fn.name}:`, result);
			return result; // return result unmodified
		},
		handleError: (fn, error) => {
			console.error(`Error in ${fn.name}:`, error);
			throw error; // re-throw the error
		},
	});
}

// Now you can apply the middleware to any function you like:
const add = (a, b) => a + b;
const addWithMiddleware = applyMiddleware(add);

// When you call addWithMiddleware, the input and output will be logged, and any errors will be handled
console.log(addWithMiddleware(1, 2)); // Logs: "Inputs to add: [1, 2]", "Output from add: 3"
```

In this example, the `applyMiddleware` function takes a function as an argument and applies some generic middleware to
it using `createFunctionWithMiddleware`. The middleware logs the inputs and outputs of the function and handles any
errors that occur. This function can be used to apply the same middleware to multiple functions, reducing code
duplication and making the middleware easier to manage.

Remember, middleware functions can also modify the inputs and outputs of the function, or handle errors in a specific
way. You should adjust the middleware functions to suit your specific needs.

### Making Assertions with `midl`

Assertions are a powerful way to catch errors early in your code. They allow you to specify the conditions that must be
true at a certain point in your program, and if these conditions are not met, an error is thrown immediately.
With `midl`, you can seamlessly incorporate assertions into your functions to improve the robustness and reliability of
your code.

Here's a simple example to illustrate this. Let's consider a function `multiply`, which multiplies two numbers:

```typescript
function multiply(a: number, b: number): number {
	return a * b;
}
```

We can add assertions to this function using `midl` like so:

```typescript
import {createFunctionWithMiddleware} from 'midl';

const multiplyWithAssertions = createFunctionWithMiddleware(multiply, {
	assertions: [
		[[2, 3], 6],
		[[-2, 3], -6],
		[[0, 3], 0],
	],
});

console.log(multiplyWithAssertions(2, 3)); // Output: 6
```

In this example, we specify three assertions:

1. The function `multiply(2, 3)` should return `6`.
2. The function `multiply(-2, 3)` should return `-6`.
3. The function `multiply(0, 3)` should return `0`.

If any of these conditions are not met, an error will be thrown.

Here's another example with a more complex function. Let's say you have a function `sumArray` that sums the elements of
an array:

```typescript
function sumArray(arr: number[]): number {
	return arr.reduce((sum, num) => sum + num, 0);
}
```

We can add assertions to this function as follows:

```typescript
import {createFunctionWithMiddleware} from 'midl';

const sumArrayWithAssertions = createFunctionWithMiddleware(sumArray, {
	assertions: [
		[[[1, 2, 3, 4, 5]], 15],
		[[[0, 0, 0]], 0],
		[[[]], 0],
	],
});

console.log(sumArrayWithAssertions([1, 2, 3, 4, 5])); // Output: 15
```

In this case, we're checking:

1. The function `sumArray([1, 2, 3, 4, 5])` should return `15`.
2. The function `sumArray([0, 0, 0])` should return `0`.
3. The function `sumArray([])` should return `0`.

Note that for functions with multiple input parameters, you would add assertions as pairs of inputs and expected
outputs. For single-parameter functions like `sumArray`, the input array should be wrapped in another array (
e.g., `[[1, 2, 3, 4, 5]]`), as shown above.

Incorporating assertions using `midl` can greatly simplify the process of debugging and testing your functions. By
defining the expected outcomes for certain inputs directly in your function definitions, you can ensure that your code
behaves as expected, and catch any errors or deviations from the intended behavior early on.

## Adding Global Middleware in Class Methods

With `midl`, you can apply global middleware to class methods. This can be incredibly beneficial in several use cases.
Let's walk through the motivations behind this.

Imagine you have a class where several methods require similar preprocessing or post-processing. This could be for
logging, error handling, input validation, and so on. Without middleware, you'd need to implement this logic in each
method individually. This would not only lead to code duplication but could also become challenging to manage as your
class grows or requirements change.

However, with `midl`, you can define middleware for these operations and apply them to your class methods. This ensures
that all your methods will consistently follow the rules defined by the middleware. It also helps in keeping your code
DRY (Don't Repeat Yourself) and easy to maintain.

Let's illustrate this with an example. We'll create a simple `Calculator` class and apply middleware to log inputs and
outputs of the methods:

```typescript
import {createFunctionWithMiddleware} from 'midl';

class Calculator {
	constructor() {
		// Apply middleware to class methods
		this.add = this.applyMiddleware(this.add);
		this.subtract = this.applyMiddleware(this.subtract);
	}

	// Define the middleware
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

// Use the Calculator class
const calculator = new Calculator();
console.log(calculator.add(3, 2));  // Logs: "Calling add with arguments: [3,2]", "Result of add: 5"
console.log(calculator.subtract(7, 4));  // Logs: "Calling subtract with arguments: [7,4]", "Result of subtract: 3"
```

In the `Calculator` constructor, we apply middleware to the `add` and `subtract` methods. The middleware logs the inputs
and outputs of the method calls, providing us with valuable debugging information.

The above example demonstrates how global middleware can be added to class methods to promote consistency, code reuse,
and maintainability. The ability to define a common set of middleware functions for various class methods offers a
powerful approach to manage the shared logic across multiple methods.

### Applying Middleware while Importing and Exporting

In many modern JavaScript projects, you may have observed the usage of modules and the `import`/`export` syntax. This
section will focus on how middleware can be applied during this import and export process with `midl`.

This method can be especially useful in scenarios where we need to enforce certain behaviors or rules consistently
across all uses of a particular module.

For example, let's say we have a math utility library with a number of different functions. We could use `midl` to apply
logging middleware to all of these functions as they're exported.

```typescript
// mathUtils.ts
import {createFunctionWithMiddleware} from 'midl';

export const add = (a: number, b: number): number => a + b;
export const subtract = (a: number, b: number): number => a - b;
export const multiply = (a: number, b: number): number => a * b;
export const divide = (a: number, b: number): number => a / b;
```

```typescript
// midlifiedMathUtils.ts
import {createFunctionWithMiddleware} from 'midl';
import * as mathUtils from './mathUtils';

// Define a logger middleware
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

// Apply the logger middleware to all functions in the mathUtils module
const midlifiedMathUtils = Object.keys(mathUtils).reduce((acc, funcName) => {
	acc[funcName] = createFunctionWithMiddleware(mathUtils[funcName], logger);
	return acc;
}, {} as typeof mathUtils);

export = midlifiedMathUtils;
```

In this example, `midlifiedMathUtils.ts` imports all the functions from `mathUtils.ts` and applies the `logger`
middleware to them using `createFunctionWithMiddleware` from `midl`. Now, every time one of these functions is called,
it will log its inputs and outputs to the console.

This can be a powerful way to enforce certain behaviors (like logging or input validation) consistently across an entire
module. It also helps to keep your code DRY (Don't Repeat Yourself), as you only need to define your middleware once and
can then apply it to as many functions as you want.

Of course, care should be taken while designing middleware. Remember to ensure that your middleware does not
inadvertently change the behavior of your functions, and is designed to handle any edge cases that may arise.

## Augmenting the Function.prototype

Augmenting `Function.prototype` involves extending the JavaScript `Function` prototype to include additional methods or
properties. This can be a powerful feature for creating code that is highly reusable and tightly coupled. With `midl`,
you can use this approach to attach middleware functionality directly to all functions in your application.

For instance, you might want to log all function calls for debugging purposes. You could augment `Function.prototype`
with a `log` middleware as follows:

```typescript
import {createFunctionWithMiddleware} from 'midl';

Function.prototype.withLog = function () {
	return createFunctionWithMiddleware(this, {
		handleInput: (definition, ...inputs) => {
			console.log(`Calling ${definition.name} with inputs:`, inputs);
			return inputs;
		},
		handleOutput: (definition, output, ...inputs) => {
			console.log(`Function ${definition.name} returned:`, output);
			return output;
		}
	});
};

function add(a, b) {
	return a + b;
}

const loggedAdd = add.withLog();
console.log(loggedAdd(2, 3));  // Outputs: 5
```

In the above example, the `withLog` function is added to `Function.prototype`, making it available to all functions in
your application. It wraps the original function with logging middleware that logs the inputs and output.

❗️**Caution: Modifying Built-in Prototypes**

While augmenting `Function.prototype` can be powerful, it can also lead to unexpected behavior and hard-to-find bugs,
because it changes the behavior of all functions in your application, not just the ones you've explicitly modified. This
can break third-party libraries or other parts of your application that expect the original behavior.

It is therefore generally considered bad practice to modify built-in prototypes like `Function.prototype` unless you
have a very good reason and you're sure you know what you're doing. See the following articles for more information:

- [Extending Built-in Native Objects: Evil or Not?](https://www.nczonline.net/blog/2010/03/02/maintainable-javascript-dont-modify-objects-you-down-own/)
- [JavaScript best practices: avoid modifying objects prototypes](https://bytearcher.com/articles/why-is-it-bad-form-modify-javascript-object-prototype/)
- [Modifying the JavaScript Function prototype: Bad parts and suggestions](https://rainsoft.io/why-extend-the-javascript-native-objects-prototype/)

Please be aware of these risks and consider other options, like creating your own function classes or using higher-order
functions, before deciding to augment `Function.prototype`.

### Overriding Function.prototype.call

Modifying built-in JavaScript prototypes is generally discouraged, as it can lead to unpredictable behavior in your code
or conflicts with other libraries. However, there may be rare cases where it's useful to override a method
like `Function.prototype.call`. With `midl`, you can inject middleware into this method to add functionality like
logging, caching, or error handling. Before proceeding, you should be aware that this kind of modification should be
done very carefully and only when absolutely necessary.

In JavaScript, the `Function.prototype.call` method is used to call a function with a given `this` value and arguments
provided individually. Overriding it with `midl` can be done like this:

```typescript
import {createFunctionWithMiddleware} from 'midl';

// Save the original Function.prototype.call
const originalCall = Function.prototype.call;

// Override Function.prototype.call with middleware
Function.prototype.call = createFunctionWithMiddleware(originalCall, {
	handleInput: (originalCall, thisArg, ...args) => {
		console.log(`Calling a function with args: ${args}`);
		return [thisArg, ...args];
	},
	handleOutput: (originalCall, result) => {
		console.log(`Function returned: ${result}`);
		return result;
	}
});
```

In this example, `handleInput` logs the arguments with which the function is called and `handleOutput` logs the result.
This can be useful for debugging purposes.

While `midl` does allow you to override `Function.prototype.call` or other built-in methods, this is generally
considered an advanced and potentially risky use case. Before deciding to use this approach, you should carefully
consider the potential consequences and alternatives.

#### ⚠️ Warning

Modifying the `Function.prototype` or any other built-in object's prototype can lead to unexpected side effects,
particularly if you're using third-party libraries or other code that you did not write yourself. These modifications
are "global", affecting every function in your application. The general consensus in the JavaScript community is that
you should avoid modifying native prototypes. Before deciding to use this approach, make sure you fully understand the
potential consequences.

**For more information about the dangers of modifying native prototypes, check out these resources:**

- [Mozilla Developer Network: Prototype pollution](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain#prototype_pollution)
- [Stack Overflow: Extending native JavaScript objects](https://stackoverflow.com/questions/14034198/why-is-extending-native-objects-a-bad-practice)
- [Blog post: The dangers of JavaScript's prototype](https://www.javascripttutorial.net/javascript-prototype/)

**To learn more about Function.prototype.call, refer to these resources:**

- [Mozilla Developer Network: Function.prototype.call](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call)
- [JavaScript.info: call, apply and bind](https://javascript.info/call-apply-decorators)
- [You Don't Know JS: this & Object Prototypes - Chapter 2: this All Makes Sense Now!](https://github.com/getify/You-Dont-Know-JS/blob/1st-ed/this%20%26%20object%20prototypes/ch2.md)

## Using Middleware Configuration Files

As your application grows in complexity, managing middleware directly within your code can become unwieldy. Instead, you
may choose to define middleware configurations in separate files. This approach can enhance the modularity of your
application, making it easier to manage and test, and promoting better separation of concerns.

For instance, consider a middleware that logs input and output of a function. Instead of coding this directly into your
function, you can have it defined in a configuration file and import it when needed. Let's look at an example:

First, create a middleware configuration file called `loggingMiddleware.ts`:

```typescript
export default {
	handleInput: (func, ...inputs) => {
		console.log(`Inputs to function ${func.name}:`, inputs);
		return inputs; // return inputs unchanged
	},
	handleOutput: (func, result, ...inputs) => {
		console.log(`Output from function ${func.name} when called with inputs ${inputs}:`, result);
		return result; // return result unchanged
	},
};
```

Then, in your application code, you can import this middleware configuration and use it:

```typescript
import {createFunctionWithMiddleware} from 'midl';
import loggingMiddleware from './loggingMiddleware';

function add(a: number, b: number): number {
	return a + b;
}

const addWithLogging = createFunctionWithMiddleware(add, loggingMiddleware);

console.log(addWithLogging(1, 2)); // Outputs: 3, and logs the input and output
```

In this example, the middleware configuration file `loggingMiddleware.ts` exports a middleware configuration object.
This object is then imported into the main application file and used with `createFunctionWithMiddleware`.

This approach offers a few key benefits:

- **Reusability**: You can reuse the same middleware configuration across multiple functions or even multiple projects.
- **Isolation**: It keeps your middleware separate from your main application code, making both easier to read and
  manage.
- **Testability**: Having your middleware in separate files makes them easier to test independently of the rest of your
  application.

Remember, the goal is to improve the clarity and maintainability of your code. Always consider the complexity of your
application and choose an approach that best suits your needs.

## Using a Middleware Registry

While adding middleware directly to each function provides a lot of flexibility, it can also lead to scattered and
repetitive code. To mitigate this, you can make use of a middleware registry — a central location where all your
middleware is defined and maintained.

A middleware registry allows you to abstract and reuse middleware logic, ensuring a consistent middleware configuration
across your application. This approach not only results in cleaner code, but it also enhances traceability,
maintainability, and testability.

Here is how you might use `midl` to create and use a middleware registry:

First, let's define a middleware registry:

```typescript
import {createFunctionWithMiddleware} from 'midl';

// Create a registry for storing middleware configurations
const middlewareRegistry = new Map<string, any>();

// Add a logging middleware to the registry
middlewareRegistry.set('logging', {
	handleInput: (definition, ...inputs) => {
		console.log(`Calling ${definition.name} with inputs: ${JSON.stringify(inputs)}`);
		return inputs;
	},
	handleOutput: (definition, output, ...inputs) => {
		console.log(`Called ${definition.name} with inputs: ${JSON.stringify(inputs)}, output: ${JSON.stringify(output)}`);
		return output;
	},
});

// Add a simple error handling middleware to the registry
middlewareRegistry.set('errorHandling', {
	handleError: (definition, error, ...inputs) => {
		console.error(`Error in function ${definition.name} with inputs: ${JSON.stringify(inputs)}`, error);
		throw error;
	},
});
```

Next, you can create a utility function that applies middleware from the registry to a given function:

```typescript
// Utility function to apply middleware from the registry
function applyMiddlewareFromRegistry(func, ...middlewareNames) {
	let config = {};

	for (const name of middlewareNames) {
		const middleware = middlewareRegistry.get(name);
		if (!middleware) throw new Error(`Middleware "${name}" not found in the registry`);

		config = {...config, ...middleware};
	}

	return createFunctionWithMiddleware(func, config);
}
```

Now, you can use this utility function to apply middleware to your functions:

```typescript
// Original function
function add(a: number, b: number): number {
	return a + b;
}

// Function with logging and error handling middleware applied
const addWithMiddleware = applyMiddlewareFromRegistry(add, 'logging', 'errorHandling');

console.log(addWithMiddleware(1, 2)); // Output: 3
```

In this example, `applyMiddlewareFromRegistry` is a utility function that retrieves middleware configurations from the
registry and applies them to a given function using `createFunctionWithMiddleware`. This allows you to apply consistent
middleware configurations across your application by referring to the middleware by name.

Remember, when using a middleware registry, it's important to carefully manage the order of your middleware, as it can
significantly impact how your function behaves. The sequence of middleware should be considered based on what operations
you want to perform and in what order. For instance, in the above example, logging is performed before error handling.

### Doing A/B Testing with `midl`

A/B Testing is a method of comparing two versions of a webpage or other user experience to determine which one performs
better. It is a way to test changes to your page against the current design and determine which one produces better
results.

`midl` enables A/B testing in your application by providing middleware functions to separate the two different user
experiences (A and B) in your code. This allows you to deliver these experiences to different segments of users and
track their interactions separately.

Consider the example of a web server where we want to test two different algorithms for recommending products to the
user. We want to present some users with recommendations from algorithm A and others with recommendations from algorithm
B, and then compare the results. With `midl`, this can be done as follows:

```typescript
import {createFunctionWithMiddleware} from 'midl';

// Two recommendation algorithms
function recommendA(userId: string) {
	// Recommendation algorithm A
	// TODO: Implement this function
}

function recommendB(userId: string) {
	// Recommendation algorithm B
	// TODO: Implement this function
}

// User segmentation function
function segmentUser(userId: string) {
	// TODO: Implement a function to segment users
	// For instance, you can segment users based on their ID, e.g., odd vs even
	// This is a simple example and may not be suitable for your use case
	// Make sure to implement a user segmentation function that is appropriate for your application
	return userId % 2 === 0;
}

const recommendWithABTesting = createFunctionWithMiddleware(recommendA, {
	handleInput: (recommend, userId) => {
		if (segmentUser(userId)) {
			return recommendB(userId);
		}

		return recommendA(userId);
	},
});

// Now, when you call recommendWithABTesting, it will recommend products based on the user segmentation
recommendWithABTesting('userId');
```

In this example, `handleInput` checks the user segment and then uses either recommendation algorithm A or B. With this
approach, you can perform A/B testing in your application without changing the interface of the recommendation function.

This is just a simple example. In a real-world application, your user segmentation function could consider many factors,
such as the user's geographical location, language, device type, or previous interactions with your application.
Similarly, you could use `handleOutput` to log the results of each algorithm for later analysis.

By using `midl` for A/B testing, you can introduce variations in your application's behavior with minimal impact on the
rest of your code. This makes your A/B tests easy to implement, easy to understand, and easy to remove once you've
gathered enough data.

### Implementing the Circuit Breaker Pattern with `midl`

The Circuit Breaker pattern is a design pattern used in modern software development to detect failures and encapsulate
the logic of preventing a failure from constantly recurring, during maintenance, temporary external system failure or
unexpected system difficulties.

This pattern is named after the electrical circuit breaker that breaks the circuit when it detects an anomaly - like a
surge in current, protecting the appliance connected to it. Similarly, in software development, we use this pattern to
prevent a system from repeatedly trying to execute an operation that's likely to fail, allowing it to continue to
operate without the problematic function.

In the context of middleware, the Circuit Breaker pattern can be implemented with `midl` to protect parts of your system
from failures in other parts of the system. Let's see how we might implement such a pattern using `midl`.

Suppose we have a function `fetchData` that fetches data from an external API:

```typescript
import axios from 'axios';

async function fetchData(url: string): Promise<any> {
	const response = await axios.get(url);
	return response.data;
}
```

We can use `midl` to add a circuit breaker to this function:

```typescript
import {createFunctionWithMiddleware} from 'midl';

// Define states for our circuit breaker
enum CircuitState {
	Closed,
	Open,
	HalfOpen,
}

// Initialize circuit state
let circuitState = CircuitState.Closed;

// Initialize failure count
let failureCount = 0;

// Define the maximum failure count before opening the circuit
const MAX_FAILURE_COUNT = 5;

const fetchDataWithCircuitBreaker = createFunctionWithMiddleware(fetchData, {
	handleError: (fetchData, error, url) => {
		failureCount++;

		// If the maximum failure count has been reached, open the circuit
		if (failureCount >= MAX_FAILURE_COUNT) {
			circuitState = CircuitState.Open;
		}

		throw error;
	},
	handleInput: (fetchData, url) => {
		// If the circuit is open, throw an error
		if (circuitState === CircuitState.Open) {
			throw new Error('Circuit is open. Cannot perform operation.');
		}

		// If the circuit is half-open, check if it should be closed
		if (circuitState === CircuitState.HalfOpen && failureCount < MAX_FAILURE_COUNT) {
			circuitState = CircuitState.Closed;
		}

		return [url];
	},
	handleOutput: (fetchData, result, url) => {
		// If the operation was successful, reset the failure count and close the circuit
		failureCount = 0;
		circuitState = CircuitState.Closed;

		return result;
	},
});

fetchDataWithCircuitBreaker('https://api.example.com/data');
```

In this example, `handleError` increments the failure count each time an error occurs. If the failure count reaches a
certain threshold (`MAX_FAILURE_COUNT`), the circuit is opened, preventing further operations.

`handleInput` checks the state of the circuit before each operation. If the circuit is open, it throws an error to
prevent the operation. If the circuit is half-open, it checks whether it should be closed.

`handleOutput` is called when an operation is successful. It resets the failure count and closes the circuit.

This is a basic example of a circuit breaker. Depending on your needs, you may wish to add additional logic, such as a
timeout before trying to close the circuit, or using more complex rules to determine when to open and close the circuit.
Regardless, `midl` provides a convenient way to encapsulate this logic in middleware, promoting code reuse and
separation of concerns.

### Using `midl` for Caching and Memoization

Caching and memoization are powerful techniques for improving the performance of your functions by storing their results
and reusing them when the same inputs are encountered. `midl` allows you to easily add a caching layer to your functions
with middleware.

Consider a simple function that calculates Fibonacci numbers:

```typescript
function fibonacci(n: number): number {
	if (n <= 1) return n;
	return fibonacci(n - 1) + fibonacci(n - 2);
}
```

Calculating Fibonacci numbers is a classic example of a problem where memoization can provide a significant performance
boost. With `midl`, we can add memoization to this function like so:

```typescript
import {createFunctionWithMiddleware} from 'midl';

// Create a cache for storing previously calculated results
const cache = new Map<number, number>();

// Create a memoized version of the fibonacci function
const fibonacciWithMemoization = createFunctionWithMiddleware(fibonacci, {
	handleInput: (fibonacci, n) => {
		// If the result is in the cache, return it immediately
		if (cache.has(n)) {
			return [cache.get(n)];
		}

		// Otherwise, return the original inputs
		return [n];
	},
	handleOutput: (fibonacci, result, n) => {
		// Store the result in the cache
		cache.set(n, result);

		// Return the result
		return result;
	},
});

console.log(fibonacciWithMemoization(50)); // Outputs: 12586269025
```

In this example, `handleInput` checks if the result for the given input `n` is already in the cache. If it is, it
returns the cached result immediately. Otherwise, it lets the function execute normally. `handleOutput` then stores the
result in the cache before it is returned. This means that each result is calculated only once, greatly improving
performance for larger inputs.

This is a simple example, but you can extend this approach to more complex functions and even use more sophisticated
caching strategies, like Least Recently Used (LRU) caching. This can be particularly useful in scenarios where you're
dealing with expensive computations or slow I/O operations, like network requests.

Remember, caching can significantly speed up your applications, but it's not always the best solution. Always consider
the trade-offs, such as increased memory usage and potential stale data.

### Fine-grained Authentication and Authorization with `midl`

In modern applications, ensuring that users are who they claim to be (authentication) and that they have the necessary
permissions to perform a given action (authorization) is of paramount importance. With `midl`, we can encapsulate these
checks into middleware to provide a consistent and reusable approach for these security measures, while also decoupling
this logic from the core business rules.

Consider an API that allows users to update their profiles. For this operation, we need to ensure that:

1. The user is authenticated.
2. The user is authorized to update the specified profile.

Here's how you might use `midl` to add authentication and authorization checks to such an API:

```typescript
import {createFunctionWithMiddleware} from 'midl';

// This is a simple mock of a database of users
const usersDB = [
	{
		id: 1,
		name: 'Alice',
		password: 'password123', // Never store passwords in plaintext in a real application!
	},
	{
		id: 2,
		name: 'Bob',
		password: 'password456',
	},
];

// Mock authentication function
function authenticate(username: string, password: string): any {
	const user = usersDB.find((user) => user.name === username && user.password === password);

	if (!user) {
		throw new Error('Authentication failed');
	}

	return user;
}

// Mock authorization function
function authorize(user: any, userId: number): void {
	if (user.id !== userId) {
		throw new Error('Authorization failed');
	}
}

// Mock update function
function updateUser(userId: number, newName: string): any {
	const user = usersDB.find((user) => user.id === userId);

	if (!user) {
		throw new Error('User not found');
	}

	user.name = newName;
	return user;
}

// Function to apply middleware
const updateUserWithAuth = createFunctionWithMiddleware(updateUser, {
	handleInput: (updateUser, userId, newName) => {
		const user = authenticate('Alice', 'password123'); // this is just a mock
		authorize(user, userId);

		return [userId, newName];
	},
	handleError: (updateUser, error) => {
		console.error(`An error occurred: ${error.message}`);
	},
});

console.log(updateUserWithAuth(1, 'Alicia')); // Output: { id: 1, name: 'Alicia', password: 'password123' }
```

In the above example, the `authenticate` function checks whether the provided username and password match those of a
user in the mock database. If the credentials are not valid, it throws an error, and the middleware immediately halts
the execution of the request, preventing any unauthorized access.

The `authorize` function ensures that the authenticated user has the necessary permissions to update the specified
profile. In this case, it checks that the user is trying to update their own profile and not someone else's.

The `handleInput` middleware function encapsulates these checks, providing a centralized place to handle authentication
and authorization. This can significantly reduce complexity and repetition in your code, making it easier to manage and
understand.

Finally, we use the `handleError` middleware to log any errors that occur during the execution of the `updateUser`
function. This way, we can ensure that any issues are promptly logged for future investigation, whether they stem from
the core business logic or the authentication and authorization checks.

It's important to note that in a real-world application, you'd typically fetch the user's credentials from a secure
source like an HTTP header, a cookie, or a JWT token, not hardcode them as done in this illustrative example. Similarly,
your authorization checks might involve more complex rules and could leverage roles and permissions based on your
application's specific needs.

Remember, these examples are simplified for illustrative purposes. In your actual applications, be sure to follow best
practices for authentication and authorization, especially when handling sensitive data like user credentials.
