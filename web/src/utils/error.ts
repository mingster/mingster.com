import { APICallError } from "ai";
import type { z } from "zod";
import logger from "@/lib/logger";

export type ErrorMessage = { error: string; data?: any };
export type ZodError = {
	error: { issues: { code: string; message: string }[] };
};
export type ApiErrorType = {
	type: string;
	message?: string;
	code: number;
};

export function isError(value: any): value is ErrorMessage | ZodError {
	return value?.error;
}

export function isErrorMessage(value: any): value is ErrorMessage {
	return typeof value?.error === "string";
}

export function formatZodError(error: z.ZodError): string {
	const formattedError = error.issues
		.map((err) => `${err.path.join(".")}: ${err.message}`)
		.join(", ");
	return `Invalid data: ${formattedError}`;
}

export function formatError(error: unknown): string {
	if (error instanceof Error) {
		// Use the standard message for Error instances
		return error.message;
	}

	// Fallback for other types
	return String(error);
}

export function captureException(
	error: unknown,
	additionalInfo?: { extra?: Record<string, any> },
	userEmail?: string,
) {
	if (isKnownApiError(error)) {
		logger.warn("Operation log", {
			metadata: {
				error: error instanceof Error ? error.message : String(error),
			},
		});
		return;
	}

	// Log error to console
	logger.error("Operation log", {
		metadata: {
			error: error instanceof Error ? error.message : String(error),
		},
		tags: ["error"],
	});
}

export type ActionError<E extends object = Record<string, unknown>> = {
	error: string;
} & E;
export type ServerActionResponse<
	T,
	E extends object = Record<string, unknown>,
> = ActionError<E> | T;

// This class is used to throw error messages that are safe to expose to the client.
export class SafeError extends Error {
	constructor(
		public safeMessage?: string,
		public statusCode?: number,
	) {
		super(safeMessage);
		this.name = "SafeError";
	}
}

export function isAnthropicInsufficientBalanceError(
	error: APICallError,
): boolean {
	return error.message.includes(
		"Your credit balance is too low to access the Anthropic API",
	);
}

export function isAWSThrottlingError(error: unknown): error is Error {
	return (
		error instanceof Error &&
		error.name === "ThrottlingException" &&
		(error.message?.includes("Too many requests") ||
			error.message?.includes("please wait before trying again"))
	);
}

export function isAICallError(error: unknown): error is APICallError {
	return APICallError.isInstance(error);
}

export function isServiceUnavailableError(error: unknown): error is Error {
	return error instanceof Error && error.name === "ServiceUnavailableException";
}

// we don't want to capture these errors
export function isKnownApiError(error: unknown): boolean {
	return (
		APICallError.isInstance(error) && isAnthropicInsufficientBalanceError(error)
	);
}
