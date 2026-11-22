import logger from "@/lib/logger";
import { getChatAccess } from "../get-chat-access";

/**
 * GET /api/chat/access
 * Returns { access: "ok" | "sign_in" | "paid_only" }. Advisory, for the UI.
 * POST /api/chat runs the same getChatAccess() as its gate.
 */
export async function GET() {
	try {
		const { access } = await getChatAccess();
		return Response.json(
			{ access },
			{ headers: { "Cache-Control": "no-store" } },
		);
	} catch (err) {
		logger.error("avatar chat access endpoint failed", {
			metadata: { errorName: err instanceof Error ? err.name : "unknown" },
			tags: ["avatar-chat"],
		});
		return Response.json({ error: "access_check_failed" }, { status: 500 });
	}
}
