import { Prisma } from "prisma/prisma-client";

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
