import { describe, expect, mock, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import en from "@/app/i18n/locales/en/translation.json";
import jp from "@/app/i18n/locales/jp/translation.json";
import tw from "@/app/i18n/locales/tw/translation.json";
import type { ChatAccessState } from "../chat-access";

const dicts: Record<string, Record<string, string>> = { tw, en, jp } as never;
let lng = "en";
let access: ChatAccessState = "ok";
let sessionUser: { id: string; email: string } | null = null;

mock.module("next/navigation", () => ({ useRouter: () => ({ push() {} }) }));
mock.module("@/app/i18n/client", () => ({
	useTranslation: () => ({ t: (k: string) => dicts[lng][k] ?? k }),
}));
mock.module("@/lib/auth-client", () => ({
	authClient: {
		useSession: () => ({
			data: sessionUser ? { user: sessionUser } : null,
			isPending: false,
		}),
	},
}));
mock.module("@/hooks/useChat", () => ({
	useChat: () => ({
		chat: async () => {},
		loading: false,
		pushAnimationMessage() {},
		clearMessages() {},
		soundEnabled: true,
		setSoundEnabled() {},
	}),
}));
mock.module("../AvatarGLB", () => ({ ANIMATION_KEYS: [] }));
mock.module("../use-chat-access", () => ({ useChatAccess: () => access }));

const { ChatUI } = await import("../ChatUI");

function render(state: ChatAccessState, language: string, email?: string) {
	access = state;
	lng = language;
	sessionUser = email ? { id: "u1", email } : null;
	return renderToStaticMarkup(<ChatUI />);
}

describe("ChatUI access states", () => {
	test("case 3: paid user sees no notice, has the input and the sound toggle", () => {
		const html = render("ok", "en", "paid@example.com");
		expect(html).not.toContain(en.avatar_chat_paid_only);
		expect(html).not.toContain(en.avatar_chat_sign_in_prompt);
		expect(html).toContain(en.avatar_chat_placeholder);
		expect(html).toContain('title="Mute"');
	});

	test("owner is treated like paid: the UI never compares emails", () => {
		const html = render("ok", "en", "someone-else@example.com");
		expect(html).not.toContain(en.avatar_chat_paid_only);
		expect(html).toContain(en.avatar_chat_placeholder);
	});

	test("unpaid sees the notice with no button or link, in every language", () => {
		for (const l of ["tw", "en", "jp"]) {
			const html = render("paid_only", l, "free@example.com");
			expect(html).toContain(dicts[l].avatar_chat_paid_only);
			expect(html).not.toContain("href=");
			expect(html).not.toContain("<a ");
			expect(html).not.toContain(dicts[l].avatar_chat_sign_in_button);
		}
	});

	test("signed out sees the prompt and the sign in button, in every language", () => {
		for (const l of ["tw", "en", "jp"]) {
			const html = render("sign_in", l);
			expect(html).toContain(dicts[l].avatar_chat_sign_in_prompt);
			expect(html).toContain(dicts[l].avatar_chat_sign_in_button);
			expect(html).not.toContain("<input");
		}
	});

	test("failed access check shows the error copy", () => {
		const html = render("error", "jp", "paid@example.com");
		expect(html).toContain(jp.avatar_chat_access_error);
		expect(html).not.toContain("<input");
	});

	test("loading shows the loading copy", () => {
		expect(render("loading", "tw")).toContain(tw.avatar_chat_loading);
	});
});
