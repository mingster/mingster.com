import { headers } from "next/headers";
import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import { auth } from "@/lib/auth";
import logger from "@/lib/logger";
import { sqlClient } from "@/lib/prismadb";
import { SafeError } from "@/utils/error";
import { isAdmin } from "@/utils/is-admin";

// TODO: take functionality from `withActionInstrumentation` and move it here (apps/web/utils/actions/middleware.ts)

function sanitizeForLog(value: unknown): string {
	const raw = value instanceof Error ? value.message : String(value ?? "");
	return raw.replace(/[A-Za-z0-9+/]{100,}={0,2}/g, "[base64]").slice(0, 400);
}

export const baseClient = createSafeActionClient({
	defineMetadataSchema() {
		return z.object({ name: z.string() });
	},
	handleServerError(error, { metadata, ctx, bindArgsClientInputs }) {
		const context = ctx as any;
		logger.error("Server action error", {
			metadata: {
				metadata,
				userId: context?.userId,
				userEmail: context?.userEmail,
				emailAccountId: context?.emailAccountId,
				bindArgsClientInputs,
				error: sanitizeForLog(error),
			},
		});
		if (error instanceof SafeError) return error.message;
		return "An unknown error occurred.";
	},
}).use(async ({ next, metadata }) => {
	if (process.env.NODE_ENV === "development") {
		logger.info("Calling action", { metadata: { name: metadata?.name } });
	}
	return next();
});

// doesn't bind to a specific email
export const userRequiredActionClient = baseClient.use(
	async ({ next, metadata }) => {
		const session = await auth.api.getSession({
			headers: await headers(), // you need to pass the headers object.
		});

		if (!session?.user) throw new SafeError("Unauthorized");

		const userId = session.user.id;

		return next({
			ctx: { userId },
		});
	},
);

export const emailRequiredActionClient = baseClient
	.bindArgsSchemas<[emailAccountId: z.ZodString]>([z.string()])
	.use(async ({ next, metadata, bindArgsClientInputs }) => {
		const session = await auth.api.getSession({
			headers: await headers(), // you need to pass the headers object.
		});

		if (!session?.user) throw new SafeError("Unauthorized");
		const userEmail = session.user.email;
		if (!userEmail) throw new SafeError("Unauthorized");

		const userId = session.user.id;
		const emailAccountId = bindArgsClientInputs[0] as string;

		// validate user owns this email
		const user = await sqlClient.user.findUnique({
			where: { id: userId },
		});

		if (!user) throw new SafeError("Unauthorized");

		//return withServerActionInstrumentation(metadata?.name, async () => {
		return next({
			ctx: {
				userId,
				userEmail,
				session,
				emailAccountId,
			},
		});
		//});
	});

export const adminActionClient = baseClient.use(async ({ next, metadata }) => {
	const session = await auth.api.getSession({
		headers: await headers(), // you need to pass the headers object.
	});
	if (!session?.user) throw new SafeError("Unauthorized");
	if (!(await isAdmin({ email: session.user.email })))
		throw new SafeError("Unauthorized");

	return next({ ctx: {} });
});
