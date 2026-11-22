/** Client side of GET /api/chat/access. The server decides; the UI only shows the result. */

export type ChatAccess = "ok" | "sign_in" | "paid_only";

/** "loading" until the endpoint answers, "error" when it fails. */
export type ChatAccessState = ChatAccess | "loading" | "error";

/** i18n keys the chat UI reads. The i18n test checks each exists in tw, en and jp. */
export const CHAT_UI_COPY_KEYS = [
	"avatar_chat_sign_in_prompt",
	"avatar_chat_sign_in_button",
	"avatar_chat_paid_only",
	"avatar_chat_placeholder",
	"avatar_chat_thinking",
	"avatar_chat_loading",
	"avatar_chat_access_error",
] as const;

export type ChatUiCopyKey = (typeof CHAT_UI_COPY_KEYS)[number];

export interface ChatAccessView {
	/** Notice text key, or null when no notice is shown (paid and owner). */
	notice: ChatUiCopyKey | null;
	/** Only a signed out user gets a button. Unpaid users get no button and no link. */
	showSignInButton: boolean;
	/** Unpaid users keep the input: the server answers them with a spoken reply. */
	showInput: boolean;
}

export function getChatAccessView(state: ChatAccessState): ChatAccessView {
	switch (state) {
		case "ok":
			return { notice: null, showSignInButton: false, showInput: true };
		case "paid_only":
			return {
				notice: "avatar_chat_paid_only",
				showSignInButton: false,
				showInput: true,
			};
		case "sign_in":
			return {
				notice: "avatar_chat_sign_in_prompt",
				showSignInButton: true,
				showInput: false,
			};
		case "error":
			return {
				notice: "avatar_chat_access_error",
				showSignInButton: false,
				showInput: false,
			};
		default:
			return {
				notice: "avatar_chat_loading",
				showSignInButton: false,
				showInput: false,
			};
	}
}

/** Throws when the call fails or the body is not a known access value. */
export async function fetchChatAccess(
	fetchImpl: typeof fetch = fetch,
): Promise<ChatAccess> {
	const res = await fetchImpl("/api/chat/access", { cache: "no-store" });
	if (!res.ok) throw new Error("chat access check failed");
	const body = (await res.json()) as { access?: unknown };
	if (
		body.access === "ok" ||
		body.access === "sign_in" ||
		body.access === "paid_only"
	) {
		return body.access;
	}
	throw new Error("chat access check returned an unknown value");
}
