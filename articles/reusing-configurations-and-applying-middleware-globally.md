# `midl`: Reusing Configurations and Applying Middleware Globally

When developing software, it is often crucial to ensure that certain functions, known as middleware, run before, after,
or during the execution of your primary functions. Middleware can handle tasks like input validation, output formatting,
error logging, and more. With `midl`, a package designed to simplify the inclusion of middleware, developers can create
cleaner, more maintainable code. This blog post will build on the introductory `README` file provided with `midl` and
provide a variety of options on how to reuse configurations and apply middleware globally.

## Introduction

`midl` provides a simple yet powerful mechanism for separating
concerns and keeping the code clean. Middleware can be added to any function, ensuring that extra functionalities such
as logging or error handling can be maintained separately from the core logic.

Yet, as we delve deeper into more complex scenarios, we might find ourselves needing to reuse certain middleware
configurations across multiple functions, or even apply middleware globally. Here's where the true flexibility of `midl`
shines. Let's explore some strategies for achieving this.

## Central Middleware Application Function

One way to reuse middleware is to define a central function that applies common middleware to any function passed to it.
Consider this:

```javascript
import {createFunctionWithMiddleware as midl} from 'midl';

const applyCommonMiddleware = (func) => {
	return midl(func, {
		handleInput: validateInput,
		handleOutput: logOutput,
	});
};

const add = applyCommonMiddleware((a, b) => a + b);
const subtract = applyCommonMiddleware((a, b) => a - b);
```

In this example, `applyCommonMiddleware` applies the common `validateInput` and `logOutput` middleware to any function
passed to it.

## Global Middleware in Class Methods

If you're working within a class and want to apply certain middleware to all methods, a possible solution is to use the
JavaScript Proxy object in your class constructor. Here's a way you could do it:

```javascript
import {createFunctionWithMiddleware as midl} from 'midl';

class Calculator {
	constructor() {
		return new Proxy(this, {
			get: function (target, propKey, receiver) {
				const origMethod = target[propKey];
				if (typeof origMethod === 'function') {
					return function (...args) {
						const func = midl(origMethod.bind(target), {
							handleInput: validateInput,
							handleOutput: logOutput,
						});
						return func(...args);
					};
				} else {
					return origMethod;
				}
			}
		});
	}

	add(a, b) {
		return a + b;
	}

	subtract(a, b) {
		return a - b;
	}
}
```

This will apply the middleware to all class methods when they're invoked.

## Applying Middleware in Function Exports

If you're exporting functions from a module and want to apply middleware to all of them, you can do this right before
the export:

```javascript
import {createFunctionWithMiddleware as midl} from 'midl';

let add = (a, b) => a + b;
let subtract = (a, b) => a - b;

const applyCommonMiddleware = (func) => {
	return midl(func, {
		handleInput: validateInput,
		handleOutput: logOutput,
	});
};

add = applyCommonMiddleware(add);
subtract = applyCommonMiddleware(subtract);

export {
	add,
	subtract,
};
```

This will ensure that the exported functions have the middleware applied to them.

## Augmenting the Function.prototype

For a more universal approach, you could augment the Function prototype itself. This can be done by adding a method to
the prototype, which will apply the middleware to the function:

```javascript
import {createFunctionWithMiddleware as midl} from 'midl';

Function.prototype.withMiddleware = function () {
	return midl(this, {
		handleInput: validateInput,
		handleOutput: logOutput,
	});
};

const add = function (a, b) {
	return a + b;
}.withMiddleware();

const subtract = function (a, b) {
	return a - b;
}.withMiddleware();
```

This way, every function in your codebase can have middleware applied to it by calling the `withMiddleware` method.

## Modifying the Function.prototype.call Method

Similar to augmenting the Function prototype, you could override the `Function.prototype.call` method to apply
middleware whenever a function is invoked:

```javascript
import {createFunctionWithMiddleware as midl} from 'midl';

const originalCall = Function.prototype.call;

Function.prototype.call = function (...args) {
	const func = midl(this, {
		handleInput: validateInput,
		handleOutput: logOutput,
	});
	return originalCall.apply(func, args);
};
```

Be cautious when using this method, as it affects every function invocation in your codebase.

## Using Middleware Configuration Files

Another option is to create middleware configuration files that can be imported where needed:

```javascript
// middleware.js
import {createFunctionWithMiddleware as midl} from 'midl';

export const applyCommonMiddleware = (func) => {
	return midl(func, {
		handleInput: validateInput,
		handleOutput: logOutput,
	});
};
```

Then, import the configuration in another file:

```javascript
// calculator.js
import {applyCommonMiddleware} from './middleware';

const add = applyCommonMiddleware((a, b) => a + b);
```

This keeps the middleware definitions centralized and reusable.

## Using a Middleware Registry

A middleware registry is a more sophisticated solution, storing middleware configurations for various scenarios. Here's
a simple example of a middleware registry:

```javascript
// middlewareRegistry.js
import {createFunctionWithMiddleware as midl} from 'midl';

export default {
	'logging': func => midl(func, {handleInput: logInput, handleOutput: logOutput}),
	'validating': func => midl(func, {handleInput: validateInput, handleError: logError}),
};
```

Then, import the registry and use the middleware configurations as needed:

```javascript
// calculator.js
import middlewareRegistry from './middlewareRegistry';

const add = middlewareRegistry.logging((a, b) => a + b);
```

This method keeps all middleware configurations neatly organized and accessible.

## Conclusion

By reusing configurations and applying middleware globally, `midl` allows us to build more modular, reusable, and
maintainable codebases. It opens the door for many interesting use-cases and solutions, making our lives as developers
easier. The key to using `midl` effectively is understanding the needs of your project and applying the appropriate
strategies for middleware implementation. Happy coding!
