# Implementing Circuit Breaker Pattern Using `midl`

- [Introduction](#introduction)
- [What is the Circuit Breaker Pattern?](#what-is-the-circuit-breaker-pattern)
- [Installation](#installation)
- [Importing `midl`](#importing-midl)
- [Implementing Circuit Breaker Pattern](#implementing-circuit-breaker-pattern)
- [Conclusion](#conclusion)

## Introduction

In a world of microservices and distributed systems, achieving fault tolerance is a non-negotiable requirement. This is
where the Circuit Breaker pattern comes in handy. By coupling it with `midl`, a powerful middleware function, you can
easily implement it in JavaScript.

## What is the Circuit Breaker Pattern?

The Circuit Breaker pattern is a design pattern used in software development to detect failures and encapsulates the
logic of preventing a failure from constantly recurring, during maintenance, temporary external system failure or
unexpected system difficulties. It's like an electrical circuit breaker in your home that "trips" or "opens" when
there's an excess of electrical current to prevent damage to the electrical system.

Here's how it works in a software system:

1. **Closed State**: The request from the application is routed to the system.
2. **Open State**: After a specified number of failures, the circuit breaker moves to the open state and all further
   requests are automatically denied for a certain time (timeout period).
3. **Half-Open State**: After the timeout period, the circuit breaker allows a limited number of test requests to pass
   through. If those requests succeed, the circuit breaker goes back to the closed state. If they fail, it reverts to
   the open state.

The pattern is particularly useful for applications that access remote services or resources. If the remote resource
becomes unavailable or starts to fail, it can slow down the entire system. A circuit breaker can prevent an application
from trying to invoke a remote service that's likely to fail, thus ensuring the failure doesn't cascade to other parts
of the system.

## Installation

Before diving into how to use `midl` to implement the Circuit Breaker pattern, ensure you have `midl` installed. You can
install it using npm:

```bash
npm install midl
```

## Importing midl

You can import `midl` into your project using the `import` statement:

```javascript
import {createFunctionWithMiddleware} from 'midl';
```

Or you can create a shorter alias:

```javascript
import {createFunctionWithMiddleware as midl} from 'midl';
```

## Implementing Circuit Breaker Pattern

Now, let's take a look at how you can implement the Circuit Breaker pattern using `midl`.

We'll create a simple function that calls a remote service and implement a circuit breaker for it:

```javascript
import {createFunctionWithMiddleware as midl} from 'midl';

let failureCount = 0;
const failureThreshold = 3;
const timeoutPeriod = 10000; // in milliseconds
let circuitOpenTime;

const callRemoteService = async () => {
	// simulate the remote service
	return Math.random() > 0.5 ? 'success' : Promise.reject('failure');
};

const circuitBreakerMiddleware = async (definition, ...inputs) => {
	if (failureCount >= failureThreshold) {
		if (Date.now() - circuitOpenTime < timeoutPeriod) {
			// If the timeout period hasn't elapsed, stop execution
			throw new Error('Circuit Breaker is in open state, stopping execution to prevent failure.');
		} else {
			// If the timeout period has elapsed, try the next call and reset failure count
			failureCount = 0;
		}
	}

	try {
		const result = await definition(...inputs);
		return result; // if the call was successful, return the result
	} catch (error) {
		failureCount++;
		if (failureCount >= failureThreshold) {
			circuitOpenTime = Date.now();
		}
		throw error; // rethrow the error
	}
};

const callRemoteServiceWithCircuitBreaker = midl(callRemoteService, {
	handleInput: circuitBreakerMiddleware
});

(async () => {
	for (let i = 0; i < 10; i++) {
		try {
			console.log(await callRemoteServiceWithCircuitBreaker());
		} catch (error) {
			console.log(`Call ${i + 1} failed: ${error.message}`);
		}
	}
})();
```

In this example, the `circuitBreakerMiddleware` acts as the circuit breaker. If the failure count reaches the threshold,
it throws an error and prevents further execution. If the timeout period has elapsed, it resets the failure count and
tries the next call. If the call to the remote service fails, it increments the failure count. When the failure count
reaches the threshold, it opens the circuit and records the time.

The middleware function uses the `handleInput` option in `midl` to intercept the call before the execution of the actual
function, allowing it to prevent execution if the circuit is open.

## Conclusion

By using `midl` and the Circuit Breaker pattern, you can create more robust applications that gracefully handle failures
in external services or resources. The Circuit Breaker pattern is an essential tool in a developer's toolkit for
building reliable, resilient software systems. Remember, a good application not only does its job well but also fails
well.
