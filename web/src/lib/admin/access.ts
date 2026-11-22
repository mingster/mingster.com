import { Role } from "@prisma/client";
import { headers } from "next/headers";
import { auth, type CustomSessionUser } from "@/lib/auth";

/**
 * Comma-separated emails in ADMINS or ADMIN (e.g. `ADMINS=you@x.com,other@y.com`).
 */
function parseAdminEmailsFromEnv(): string[] {
	const raw = process.env.ADMINS?.trim() || process.env.ADMIN?.trim() || "";
	if (!raw) {
		return [];
	}
	return raw
		.split(",")
		.map((entry) => entry.trim().toLowerCase())
		.filter((entry) => entry.length > 0);
}

function isAllowlistedAdminEmail(email: string): boolean {
	const normalized = email.trim().toLowerCase();
	if (!normalized) {
		return false;
	}
	return parseAdminEmailsFromEnv().includes(normalized);
}

/**
 * True for the admin role, or for an email in ADMINS that is verified. The
 * verified check stops anyone claiming an ADMINS address by signing up with it.
 */
export function isAdminSessionUser(user: CustomSessionUser): boolean {
	const role = user.role;
	if (role === Role.admin || role === "admin") {
		return true;
	}
	const email = user.email;
	return (
		typeof email === "string" &&
		isAllowlistedAdminEmail(email) &&
		user.emailVerified === true
	);
}

/** True if the current session may access sysAdmin routes and adminActionClient. */
export async function checkAdminAccess(): Promise<boolean> {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return false;
	}

	return isAdminSessionUser(session.user as CustomSessionUser);
}

export { isAllowlistedAdminEmail, parseAdminEmailsFromEnv };
