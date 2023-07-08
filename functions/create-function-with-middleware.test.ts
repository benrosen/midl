import { createFunctionWithMiddleware } from "./create-function-with-middleware";

describe("createFunctionWithMiddleware", () => {
	const testFunction = (a: number, b: number): number => a + b;

	it("should return the original function when no config is provided", () => {
		const resultFunc = createFunctionWithMiddleware(testFunction);

		expect(resultFunc(1, 2)).toBe(3);
	});

	it("should apply handleInput middleware", () => {
		const handleInput = jest.fn<
			[number, number],
			[definition: any, a: any, b: any],
			any
		>((definition, a, b) => [a * 2, b * 2]);

		const resultFunc = createFunctionWithMiddleware(testFunction, {
			handleInput,
		});

		expect(resultFunc(2, 3)).toBe(10);

		expect(handleInput).toBeCalled();
	});

	it("should apply handleOutput middleware", () => {
		const handleOutput = jest.fn((definition, output, a, b) => output * 2);

		const resultFunc = createFunctionWithMiddleware(testFunction, {
			handleOutput,
		});

		expect(resultFunc(2, 3)).toBe(10);

		expect(handleOutput).toBeCalled();
	});

	it("should handle error correctly", () => {
		const faultyFunc = () => {
			throw new Error("test error");
		};

		const handleError = jest.fn((definition, error, a, b) => "error handled");

		const resultFunc = createFunctionWithMiddleware(faultyFunc, {
			handleError,
		});

		expect(resultFunc()).toBe("error handled");

		expect(handleError).toBeCalled();
	});

	it("should assert correctly", () => {
		const assertions: [[number, number], number][] = [
			[[1, 2], 3],
			[[3, 4], 7],
		];

		expect(() =>
			createFunctionWithMiddleware(testFunction, { assertions }),
		).not.toThrow();

		assertions[1][1] = 8;

		expect(() =>
			createFunctionWithMiddleware(testFunction, { assertions }),
		).toThrow();
	});
});
