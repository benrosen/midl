# `midl`: A little middleware goes a long way

## Introduction

Software development often requires functions to perform more than their core tasks, such as logging, validating inputs,
or returning custom error messages. This leads to additional code within the function, complicating its definition and
execution.

Consider the following code:

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

This is where `midl` comes into play. `midl` allows the inclusion of middleware to handle these additional
responsibilities, enabling the function to focus on its primary purpose.

## Installation

To get started with `midl`, you can install it via npm using the following command:

```bash
npm install midl
```

## Importing `midl`

After installation, you can import `midl` into your project as follows:

```javascript
import {createFunctionWithMiddleware} from 'midl';
```

Or for a shorter alias, you can import it as:

```javascript
import {createFunctionWithMiddleware as midl} from 'midl';
```

## Using `midl`

To use `midl`, you'll need to create a function with middleware by calling `createFunctionWithMiddleware` or `midl` (if
you used the shorter alias). This function takes two arguments:

1. The original function you want to apply middleware to.
2. An optional configuration object.

The configuration object can have the following properties:

- `handleInput`: A function that takes the original function and its arguments and returns the arguments that should be
  passed to the original function.
- `handleOutput`: A function that takes the original function, its result, and its arguments and returns the result that
  should be returned by the middleware-enhanced function.

Here's an example of how you can use `midl`:

```javascript
import {createFunctionWithMiddleware as midl} from 'midl';

let add = (a, b) => a + b;

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

add = midl(add, {
	handleInput: validateInput,
	handleOutput: logOutput,
});
```

## Conclusion

`midl` is a useful tool to simplify your functions and make your code cleaner and easier to maintain. By taking
advantage of middleware, `midl` enables you to separate your core logic from side tasks such as input validation and
logging, resulting in functions that are easier to understand and modify.
