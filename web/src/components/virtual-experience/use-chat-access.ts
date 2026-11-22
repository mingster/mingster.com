"use client";

import { useEffect, useState } from "react";
import { type ChatAccessState, fetchChatAccess } from "./chat-access";

/**
 * Reads GET /api/chat/access. Asks again whenever `key` changes (the signed in
 * user id), so signing in or out updates the state. Returns "loading" while
 * `key` is undefined or its answer is pending, and "error" when the call fails.
 */
export function useChatAccess(key: string | null | undefined): ChatAccessState {
	const [result, setResult] = useState<{
		key: string;
		state: ChatAccessState;
	} | null>(null);
	const requestKey = key === undefined ? undefined : (key ?? "anonymous");

	useEffect(() => {
		if (requestKey === undefined) return;
		let cancelled = false;
		fetchChatAccess()
			.then((access) => {
				if (!cancelled) setResult({ key: requestKey, state: access });
			})
			.catch(() => {
				if (!cancelled) setResult({ key: requestKey, state: "error" });
			});
		return () => {
			cancelled = true;
		};
	}, [requestKey]);

	return result && result.key === requestKey ? result.state : "loading";
}
