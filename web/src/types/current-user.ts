import type { Prisma } from "@prisma/client";

/**
 * Relations loaded for the signed-in user on the account page.
 * Scoped to the auth surface: sessions, linked providers, and the
 * second-factor / passkey / api-key records the account tabs render.
 */
export const currentUserArgs = {
	include: {
		sessions: true,
		accounts: true,
		twofactors: true,
		passkeys: true,
		apikeys: true,
		members: true,
		invitations: true,
	},
} satisfies Prisma.UserDefaultArgs;

export type CurrentUser = Prisma.UserGetPayload<typeof currentUserArgs>;
