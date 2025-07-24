//import type { Product } from "prisma/prisma-client";
import { Prisma } from "prisma/prisma-client";

/* #region next-auth */
/*
declare module "next-auth" {
	interface Session {
		id: string | null | unknown;
		user: User & DefaultSession["user"];
		error?: "RefreshAccessTokenError";

		user?: DefaultUser & {
			id: string;
			stripeCustomerId: string;
			isActive: boolean;
			role: string | null;
			notifications: Notification[];
		};
	}
	interface User extends DefaultUser {
		stripeCustomerId: string;
		isActive: boolean;
		role: string | null;
		notifications: Notification[];
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		access_token: string;
		expires_at: number;
		refresh_token: string;
		error?: "RefreshAccessTokenError";
	}
}
*/
/* #endregion */

const userObj = Prisma.validator<Prisma.UserDefaultArgs>()({
	include: {
		account: true,
		session: true,
		twoFactor: true,
		apikey: true,
		passkey: true,
	},
});
export type User = Prisma.UserGetPayload<typeof userObj>;

const subscriptionObj = Prisma.validator<Prisma.SubscriptionDefaultArgs>()({});
export type Subscription = Prisma.SubscriptionGetPayload<
	typeof subscriptionObj
>;

const platformSettingsObj =
	Prisma.validator<Prisma.PlatformSettingsDefaultArgs>()({});
export type PlatformSettings = Prisma.PlatformSettingsGetPayload<
	typeof platformSettingsObj
>;
