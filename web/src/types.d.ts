//import type { Product } from "@prisma/client";
import { Prisma, type User as PrismaClientUser } from "@prisma/client";

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

/* #region prisma type mod */

const platformSettingsObj =
	Prisma.validator<Prisma.PlatformSettingsDefaultArgs>()({});
export type PlatformSettings = Prisma.PlatformSettingsGetPayload<
	typeof platformSettingsObj
>;

const systemLogObj = Prisma.validator<Prisma.system_logsDefaultArgs>()({});
export type SystemLog = Prisma.system_logsGetPayload<typeof systemLogObj>;

const localeObj = Prisma.validator<Prisma.LocaleDefaultArgs>()({});
export type Locale = Prisma.LocaleGetPayload<typeof localeObj>;

const messageTemplateObj =
	Prisma.validator<Prisma.MessageTemplateDefaultArgs>()({
		include: {
			MessageTemplateLocalized: true,
		},
	});
export type MessageTemplate = Prisma.MessageTemplateGetPayload<
	typeof messageTemplateObj
>;

const messageTemplateLocalizedObj =
	Prisma.validator<Prisma.MessageTemplateLocalizedDefaultArgs>()({});
export type MessageTemplateLocalized =
	Prisma.MessageTemplateLocalizedGetPayload<typeof messageTemplateLocalizedObj>;

const emailQueueObj = Prisma.validator<Prisma.EmailQueueDefaultArgs>()({});
export type EmailQueue = Prisma.EmailQueueGetPayload<typeof emailQueueObj>;

/** Prisma 7: prefer `satisfies` over removed `Prisma.validator` for correct `GetPayload` inference. */
const userObj = {
	include: {
		accounts: true,
		twofactors: true,
		passkeys: true,
		apikeys: true,
		sessions: true,
		members: true,
		invitations: true,
	},
} satisfies Prisma.UserDefaultArgs;

/** Scalar `User` from Prisma + optional relations from `userObj`. */
export type User = PrismaClientUser &
	Partial<Prisma.UserGetPayload<typeof userObj>>;
