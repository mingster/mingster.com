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

/* #region prisma type mod */

const systemLogObj = Prisma.validator<Prisma.system_logDefaultArgs>()({});
export type SystemLog = Prisma.SystemLogGetPayload<typeof systemLogObj>;

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
// EmailQueue type definition
export type EmailQueue = Prisma.EmailQueueGetPayload<{}>;

const userObj = Prisma.validator<Prisma.UserDefaultArgs>()({
	include: {
		accounts: true,
		twofactors: true,
		passkeys: true,
		apikeys: true,
		sessions: true,
		members: true,
		invitations: true,
		//Orders: true,
		//Addresses: true,
		//NotificationTo: true,
	},
});
export type User = Prisma.UserGetPayload<typeof userObj>;

const sysmsgObj = Prisma.validator<Prisma.SystemMessageDefaultArgs>()({});
export type SystemMessage = Prisma.SystemMessageGetPayload<typeof sysmsgObj>;
