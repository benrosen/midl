/**
 * Creates a new function with optional middleware for handling inputs, outputs, and errors.
 * It allows the addition of assertions for immediate testing of function behavior.
 *
 * @param definition - The original function to which the middleware should be applied.
 *
 * @param [config] - An optional configuration object.
 *
 * @param [config.assertions] - An array of pairs of inputs and expected outputs for assertions. Each pair consists of
 *                              the array of inputs and the expected output. These assertions are checked immediately
 *                              when the middleware-wrapped function is created, throwing an error if the actual output
 *                              does not match the expected one. This feature is designed to serve as a form of immediate
 *                              unit testing during the creation of the middleware-wrapped function. However, these assertions
 *                              are not re-evaluated on subsequent calls to the wrapped function.
 *
 * @param [config.handleError] - A function that is called when there is an error during the execution of the original function.
 *                               It takes as arguments the original function definition, the error object, and the input
 *                               arguments passed to the original function, and should return an output of the same type
 *                               as the original function.
 *
 * @param [config.handleInput] - A function that is called before the execution of the original function and can modify its inputs.
 *                               It takes as arguments the original function definition and the input arguments passed to
 *                               the original function, and should return a modified input array.
 *
 * @param [config.handleOutput] - A function that is called after the execution of the original function and can modify its output.
 *                                It takes as arguments the original function definition, the original function output,
 *                                and the input arguments passed to the original function, and should return a modified output.
 *
 * @returns - The new function with the middleware applied to it.
 */
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
  if (!config) {
    return definition;
  }

  const { assertions, handleError, handleInput, handleOutput } = config;

  const functionWithMiddleware = (...inputs: I): O => {
    try {
      if (handleInput) {
        inputs = handleInput(definition, ...inputs);
      }

      const output = definition(...inputs);

      if (handleOutput) {
        return handleOutput(definition, output, ...inputs);
      }

      return output;
    } catch (error) {
      if (handleError) {
        return handleError(definition, error, ...inputs);
      }

      throw error;
    }
  };

  (assertions ?? []).forEach(([inputs, output]) => {
    const actualOutput = functionWithMiddleware(...inputs);

    if (actualOutput !== output) {
      throw new Error(
        `Expected ${definition.name}(${inputs.join(
          ", ",
        )}) to return ${output}, but got ${actualOutput}.`,
      );
    }
  });

  return functionWithMiddleware as F;
};
