# `midl`

A little middleware goes a long way.

- [Introduction](#introduction)
- [Installation](#installation)
- [Importing `midl`](#importing-midl)
- [Technical Reference](#technical-reference)
- [Examples](#examples)
- [Conclusion](#conclusion)

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

`midl` offers a solution by allowing the inclusion of middleware to handle these additional responsibilities. The same
function with `midl` can be simplified:

```javascript
import {createFunctionWithMiddleware} from 'midl';

const add = createFunctionWithMiddleware(
	(a, b) => a + b,
	{
		handleInput: (definition, a, b) => {
			if (typeof a !== 'number' || typeof b !== 'number') {
				throw new Error('Inputs must be numbers');
			}
			return [a, b];
		},
		handleOutput: (definition, output, a, b) => {
			console.log(`Adding ${a} and ${b} yields ${output}`);
			return output;
		},
	}
);
```

If you'd like to take it a step further, you can
refactor the middleware into separate functions and use the `midl` alias instead of the full name:

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
```

Now, the original `add` function solely performs addition, while input validation and logging are handled by middleware
functions, making the code more maintainable and readable.

## Installation

To install `midl`, use the following command with npm:

```bash
npm install midl
```

## Importing midl

You can import `midl` into your project using the `import` statement:

```javascript
import {createFunctionWithMiddleware} from 'midl';
```

For a shorter alias, you can import it as follows:

```javascript
import {createFunctionWithMiddleware as midl} from 'midl';
```

## Technical Reference

The primary function provided by `midl` is `createFunctionWithMiddleware`, defined as follows in TypeScript:

```typescript
function createFunctionWithMiddleware<I extends any[], O, F extends (...args: I) => O>(
	definition: F,
	config?: {
		assertions?: [I, O][];
		handleError?: (definition: F, error: Error, ...inputs: I) => O;
		handleInput?: (definition: F, ...inputs: I) => I;
		handleOutput?: (definition: F, output: O, ...inputs: I) => O;
	}
): F;
```

- `definition` is the original function you want to apply middleware to.
- `config` is an optional object containing the middleware functions:
	- `assertions` is an array of pairs of inputs and expected outputs for assertions after the function execution.
	- `handleError` is a function called when there is an error during the execution of the original function.
	- `handleInput` is a function called before the execution of the original function that can modify its inputs.
	- `handleOutput` is a function called after the execution of the original function that can modify its output.

## Examples

Here are more examples showing how to use `midl` and its various configuration options:

**Example 1: Function with HandleError**

Here we illustrate a function that throws an error under specific conditions. The `handleError` middleware intercepts
the error and logs it, providing an alternative to a crash.

```javascript
import {createFunctionWithMiddleware as midl} from 'midl';

const handleError = (definition, error, a, b) => {
	console.log(`Error: ${error.message}`);
	return null;
};

const divide = midl(
	(a, b) => {
		if (b === 0) throw new Error('Cannot divide by zero');
		return a / b;
	},
	{handleError}
);

console.log(divide(4, 0)); // Logs: Error: Cannot divide by zero
```

**Example 2: Function with Assertions**

In this example, we create a function with predefined inputs and expected outputs, known as assertions. This can help
validate the correctness of a function.

```javascript
import {createFunctionWithMiddleware as midl} from 'midl';

const subtract = midl(
	(a, b) => a - b,
	{
		assertions: [
			[[5, 3], 2],
			[[10, 4], 6],
		]
	}
);

console.log(subtract(5, 3)); // Logs: 2
```

**Example 3: Function with HandleInput and Assertions**

Here we combine input validation with assertions. The `handleInput` middleware ensures inputs are numbers before
execution, reducing the possibility of unexpected results or errors.

```javascript
import {createFunctionWithMiddleware as midl} from 'midl';

const handleInput = (definition, a, b) => {
	if (typeof a !== 'number' || typeof b !== 'number') {
		throw new Error('Inputs must be numbers');
	}
	return [a, b];
};

const add = midl(
	(a, b) => a + b,
	{
		handleInput,
		assertions: [
			[[1, 2], 3],
			[[2, 3], 5],
		]
	}
);

console.log(add(1, 2)); // Logs: 3
```

**Example 4: Function with HandleOutput and HandleError**

This example demonstrates a function that multiplies two numbers. If the inputs are not numbers, an error is thrown.
The `handleError` middleware logs the error, while `handleOutput` logs the result of the multiplication.

```javascript
import {createFunctionWithMiddleware as midl} from 'midl';

const handleOutput = (definition, output, a, b) => {
	console.log(`The multiplication of ${a} and ${b} is ${output}`);
	return output;
};

const handleError = (definition, error, a, b) => {
	console.log(`Error: ${error.message}`);
	return null;
};

const multiply = midl(
	(a, b) => {
		if (typeof a !== 'number' || typeof b !== 'number') {
			throw new Error('Inputs must be numbers');
		}
		return a * b;
	},
	{handleOutput, handleError}
);

console.log(multiply(3, 4)); // Logs: The multiplication of 3 and 4 is 12
```

**Example 5: Function with HandleInput, HandleOutput and HandleError**

In this case, we are implementing all three middleware functions: `handleInput`, `handleOutput`, and `handleError`. This
illustrates a comprehensive usage of `midl` for both input validation and output handling, resulting in more
maintainable code.

```javascript
import {createFunctionWithMiddleware as midl} from 'midl';

const handleInput = (definition, a, b) => {
	if (typeof a !== 'number' || typeof b !== 'number') {
		throw new Error('Inputs must be numbers');
	}
	return [a, b];
};

const handleOutput = (definition, output, a, b) => {
	console.log(`The subtraction of ${b} from ${a} is ${output}`);
	return output;
};

const handleError = (definition, error, a, b) => {
	console.log(`Error: ${error.message}`);
	return null;
};

const subtract = midl(
	(a, b) => a - b,
	{handleInput, handleOutput, handleError}
);

console.log(subtract(7, 2)); // Logs: The subtraction of 2 from 7 is 5
```

**Example 6: Function with Assertions and HandleError**

This example shows a function with assertions to validate its correctness and `handleError` middleware for error
handling. Combining these features enhances the function's reliability and maintainability.

```javascript
import {createFunctionWithMiddleware as midl} from 'midl';

const handleError = (definition, error, a, b) => {
	console.log(`Error: ${error.message}`);
	return null;
};

const divide = midl(
	(a, b) => {
		if (b === 0) throw new Error('Cannot divide by zero');
		return a / b;
	},
	{
		handleError,
		assertions: [
			[[6, 2], 3],
			[[10, 5], 2],
		]
	}
);

console.log(divide(10, 0)); // Logs: Error: Cannot divide by zero
```

**Example 7: Function with HandleInput, HandleOutput, Assertions, and HandleError**

This example showcases a function that takes full advantage of `midl`: `handleInput` for input
validation, `handleOutput` for output processing, `assertions` for validating function execution, and `handleError` for
error handling. This comprehensive setup ensures maximum reliability, robustness, and maintainability for your
functions.

```javascript
import {createFunctionWithMiddleware as midl} from 'midl';

const handleInput = (definition, a, b) => {
	if (typeof a !== 'number' || typeof b !== 'number') {
		throw new Error('Inputs must be numbers');
	}
	return [a, b];
};

const handleOutput = (definition, output, a, b) => {
	console.log(`The multiplication of ${a} and ${b} is ${output}`);
	return output;
};

const handleError = (definition, error, a, b) => {
	console.log(`Error: ${error.message}`);
	return null;
};

const multiply = midl(
	(a, b) => a * b,
	{
		handleInput,
		handleOutput,
		handleError,
		assertions: [
			[[1, 2], 2],
			[[2, 3], 6],
		]
	}
);

console.log(multiply(2, 3)); // Logs: The multiplication of 2 and 3 is 6
```

## Conclusion

By using `midl`, you can create functions that are more reliable, robust, and maintainable. This is especially useful
for functions that are used in multiple places, as it allows you to centralize input validation and output handling.
This can help you avoid bugs and reduce the amount of code you need to write and maintain.
