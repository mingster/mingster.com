/*
import {
	captureException as sentryCaptureException,
	setUser,
} from "@sentry/nextjs";
*/
import { APICallError, RetryError } from "ai";
import type { z } from "zod";

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
	const formattedError = error.errors
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
/*
export function captureException(
	error: unknown,
	additionalInfo?: { extra?: Record<string, any> },
	userEmail?: string,
) {
	if (isKnownApiError(error)) {
		console.warn(`Known API error. email: ${userEmail}`, error, additionalInfo);
		return;
	}

	if (userEmail) setUser({ email: userEmail });
	sentryCaptureException(error, additionalInfo);
}
*/

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

export function isIncorrectOpenAIAPIKeyError(error: APICallError): boolean {
	return error.message.includes("Incorrect API key provided");
}

export function isInvalidOpenAIModelError(error: APICallError): boolean {
	return error.message.includes(
		"does not exist or you do not have access to it",
	);
}

export function isOpenAIAPIKeyDeactivatedError(error: APICallError): boolean {
	return error.message.includes("this API key has been deactivated");
}

export function isAnthropicInsufficientBalanceError(
	error: APICallError,
): boolean {
	return error.message.includes(
		"Your credit balance is too low to access the Anthropic API",
	);
}

// Handling OpenAI retry errors on their own because this will be related to the user's own API quota,
// rather than an error on our side (as we default to Anthropic atm).
export function isOpenAIRetryError(error: RetryError): boolean {
	return error.message.includes("You exceeded your current quota");
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

// we don't want to capture these errors in Sentry
export function isKnownApiError(error: unknown): boolean {
	return (
		(APICallError.isInstance(error) &&
			(isIncorrectOpenAIAPIKeyError(error) ||
				isInvalidOpenAIModelError(error) ||
				isOpenAIAPIKeyDeactivatedError(error) ||
				isAnthropicInsufficientBalanceError(error))) ||
		(RetryError.isInstance(error) && isOpenAIRetryError(error))
	);
}

export function checkCommonErrors(
	error: unknown,
	url: string,
): ApiErrorType | null {
	if (RetryError.isInstance(error) && isOpenAIRetryError(error)) {
		console.warn(`OpenAI quota exceeded for url: ${url}`);
		return {
			type: "OpenAI Quota Exceeded",
			message: `OpenAI error: ${error.message}`,
			code: 429,
		};
	}

	return null;
}
