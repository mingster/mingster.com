import { headers } from "next/headers";
import { isAdminSessionUser } from "@/lib/admin/access";
import { auth, type CustomSessionUser } from "@/lib/auth";
import { sqlClient } from "@/lib/prismadb";

export type ChatAccess = "ok" | "sign_in" | "paid_only";

export interface ChatAccessResult {
	access: ChatAccess;
	/** Internal user id when signed in, for the request log line. Never the email. */
	userId?: string;
}

/**
 * The one chat access rule, shared by POST /api/chat (the gate) and
 * GET /api/chat/access (advisory, for the UI). Signed out is `sign_in`. The
 * owner (checkAdminAccess rule) and active or trialing subscribers are `ok`.
 * Anonymous, unpaid, canceled and past_due users are `paid_only`.
 */
export async function getChatAccess(): Promise<ChatAccessResult> {
	const session = await auth.api.getSession({ headers: await headers() });
	const user = session?.user;
	if (!user) return { access: "sign_in" };

	if (isAdminSessionUser(user as CustomSessionUser)) {
		return { access: "ok", userId: user.id };
	}
	if ((user as { isAnonymous?: boolean | null }).isAnonymous === true) {
		return { access: "paid_only", userId: user.id };
	}
	const subscription = await sqlClient.subscription.findFirst({
		where: { referenceId: user.id, status: { in: ["active", "trialing"] } },
		select: { id: true },
	});
	return { access: subscription ? "ok" : "paid_only", userId: user.id };
}
