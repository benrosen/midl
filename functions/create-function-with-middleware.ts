/**
 * Creates a new function with optional middleware for handling inputs, outputs, and errors.
 *
 * @param definition - The original function to which the middleware should be applied.
 * @param [config] - An optional configuration object.
 * @param [config.assertions] - An array of pairs of inputs and expected outputs for assertions after the function execution.
 * @param [config.handleError] - A function that is called when there is an error during the execution of the original function.
 * @param [config.handleInput] - A function that is called before the execution of the original function and can modify its inputs.
 * @param [config.handleOutput] - A function that is called after the execution of the original function and can modify its output.
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
