# **Simplifying A/B Testing with the Midl Library**

A/B testing plays an essential role in the world of software development, helping to evaluate different versions of a
product to determine which one performs better. However, implementing A/B testing can sometimes add complexity to the
codebase, leading to unnecessary clutter. That's where the `midl` library comes in. As a middleware library, `midl`
simplifies tasks such as logging, validating inputs and outputs, and many others by isolating these tasks from the core
functionality of a function.

In this blog post, we'll dive into how you can leverage `midl` to implement a straightforward and effective A/B testing
setup.

## **The Magic of Midl**

Before we proceed, let's quickly remind ourselves about the power of `midl`. Midl provides
the `createFunctionWithMiddleware` function, which allows developers to apply middleware to a function for tasks like
logging, validation, and error handling, without complicating the function itself. For example, a simple addition
function with input validation and logging using `midl` might look like this:

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

With this, `midl` makes the function more readable and maintainable, allowing it to focus purely on its core
responsibility.

## **Implementing A/B Testing with Midl**

Now that we've established what `midl` can do, let's explore how we can use it for A/B testing. Suppose we are
experimenting with two different algorithms for a recommendation system: `algoA` and `algoB`.

First, we'll define these functions:

```javascript
function algoA(user) {
	// Algorithm A implementation
	return recommendationsA;
}

function algoB(user) {
	// Algorithm B implementation
	return recommendationsB;
}
```

Our goal is to expose different groups of users to these different algorithms and record the results. We could write a
function that randomly selects an algorithm for each user. However, doing so could complicate the function. Instead,
let's use `midl` to add this A/B testing layer:

```javascript
import {createFunctionWithMiddleware as midl} from 'midl';

const randomizeAlgo = (definition, user) => {
	const rand = Math.random();

	if (rand < 0.5) {
		return [algoA, user];
	} else {
		return [algoB, user];
	}
};

const logResult = (definition, output, user) => {
	console.log(`User ${user.id} received recommendations: ${output}`);
	return output;
};

let getRecommendations = (algo, user) => algo(user);

getRecommendations = midl(getRecommendations, {
	handleInput: randomizeAlgo,
	handleOutput: logResult,
});
```

The `randomizeAlgo` function is a middleware that randomly selects between `algoA` and `algoB` for each user. It doesn't
interfere with the `getRecommendations` function, which remains focused on getting recommendations based on the provided
algorithm.

The `logResult` middleware function logs the recommendations given to each user, providing valuable data for analyzing
the results of our A/B test.

## **Going the Extra Mile with Error Handling**

Additionally, you can use `midl` to handle potential errors in a smooth and centralized way. Let's say we want to catch
and log any errors that might occur during the execution of `algoA` or `algoB`:

```javascript
import {createFunctionWithMiddleware as midl} from 'midl';

const handleError = (definition, error, algo, user) => {
	console.log(`Error: ${error.message} occurred for user ${user.id} using ${algo.name}`);
	return null;
};

getRecommendations = midl(getRecommendations, {
	handleInput: randomizeAlgo,
	handleOutput: logResult,
	handleError: handleError,
});
```

With the `handleError` middleware, we catch any errors and log them, preventing the function from crashing and providing
valuable information for debugging.

## **Conclusion**

In this blog post, we've explored how the `midl` library can be used to facilitate A/B testing. By using middleware
functions, `midl` allows developers to add A/B testing capabilities without complicating the core function. In our
examples, we've demonstrated how to randomize the use of different algorithms and how to log the results. Additionally,
we've shown how `midl` can handle errors gracefully, adding an extra layer of reliability to your A/B tests.
Overall, `midl` provides a clean, clear, and concise approach to adding A/B testing (or indeed, any kind of middleware
functionality) to your code.
