import { passkey } from "@better-auth/passkey";
import { stripe } from "@better-auth/stripe";
import { PrismaClient } from "@prisma/client";
import { type BetterAuthOptions, betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import {
	admin,
	apiKey,
	bearer,
	customSession,
	magicLink,
	organization,
	phoneNumber,
	twoFactor,
} from "better-auth/plugins";
import { emailHarmony } from "better-auth-harmony";
import { sendAuthMagicLink } from "@/actions/mail/send-auth-magic-link";
import { sendAuthPasswordReset } from "@/actions/mail/send-auth-password-reset";
import { stripe as stripeClient } from "@/lib/stripe/config";
import { sqlClient } from "./prismadb";

const prisma = new PrismaClient();

const options = {
	//...config options
	plugins: [],
} satisfies BetterAuthOptions;

export const auth = betterAuth({
	baseURL:
		process.env.NEXT_PUBLIC_BASE_URL ||
		process.env.NEXT_PUBLIC_API_URL ||
		(process.env.NODE_ENV === "production"
			? "https://mingster.com"
			: "http://localhost:3002"),
	database: prismaAdapter(prisma, {
		provider: "postgresql", // or "mysql", "postgresql", ...etc
	}),
	roles: [
		{ name: "user" },
		{ name: "owner" },
		{ name: "staff" },
		{ name: "storeAdmin" },
		{ name: "admin" },
	],
	advanced: {
		cookies: {
			state: {
				attributes: {
					sameSite: "none",
					secure: true,
				},
			},
		},
	},
	session: {
		expiresIn: 60 * 60 * 24 * 365, // 365 days
		updateAge: 60 * 60 * 24, // 1 day (every 1 day the session expiration is updated)
	},
	account: {
		accountLinking: {
			enabled: true,
			allowDifferentEmails: true,
			trustedProviders: ["google", "line", "apple"],
		},
	},
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false,
		account: {
			accountLinking: {
				enabled: true,
			},
		},
		sendResetPassword: async ({ user, url, token }, _request) => {
			await sendAuthPasswordReset(user.email, url);
		},
	},
	/* 
	emailVerification: {
		sendOnSignUp: true,
		sendVerificationEmail: async ({ user, url, token }, request) => {
			await sendAuthEmailValidation(user.email, url);
		},
	},
  */
	socialProviders: {
		google: {
			clientId: process.env.AUTH_GOOGLE_ID as string,
			clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
			accessType: "offline",
			prompt: "select_account consent",
		},
		line: {
			clientId: process.env.AUTH_LINE_ID as string,
			clientSecret: process.env.AUTH_LINE_SECRET as string,
			scopes: ["openid", "profile", "email"],
		},
		apple: {
			clientId: process.env.AUTH_APPLE_ID as string,
			clientSecret: process.env.AUTH_APPLE_SECRET as string,
			// Optional
			appBundleIdentifier: process.env.APPLE_APP_BUNDLE_IDENTIFIER as string,
		},
	},
	trustedOrigins: [
		"https://appleid.apple.com",
		"https://mingster.com",
		"http://localhost:3002",
	],
	plugins: [
		...(options.plugins ?? []),
		customSession(async ({ user, session }, _ctx) => {
			// Include role and other user fields in the session
			const typedUser = user as any;
			const typedSession = session as any;

			return {
				user: {
					...typedUser,
					role: typedUser?.role || "user", // Ensure role is always present
				},
				session: {
					...typedSession,
					user: {
						...typedSession?.user,
						role: typedUser?.role || "user", // Include role in session.user
					},
				},
			};
		}, options),
		stripe({
			stripeClient,
			stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET as string,
			createCustomerOnSignUp: false,
			enabled: true,
			plans: async () => {
				const setting = await sqlClient.platformSettings.findFirst();
				if (!setting) {
					return [];
				}

				const _pricesResponse = await stripeClient.prices
					.list({
						product: setting.stripeProductId as string,
					})
					.then((obj) => {
						return obj.data.map((price) => ({
							name: price.nickname,
							priceId: price.id,
							//limits: JSON.parse(price.metadata.limits),
							freeTrial: {
								days: price.metadata.freeTrial,
							},
							active: price.active,
							lookup_key: price.lookup_key,
							group: price.metadata.group,
						}));
					});
			},
		}),
		phoneNumber({
			sendOTP: ({ phoneNumber, code }, _ctx) => {
				// TODO: Implement sending OTP code via SMS
			},
			verifyOTP: async ({ phoneNumber, code }, _ctx) => {
				// TODO: Verify OTP with your desired logic (e.g., Twilio Verify)
				// This is just an example, not a real implementation.
				/*
				  const isValid = await twilioClient.verify 
					  .services('YOUR_SERVICE_SID') 
					  .verificationChecks 
					  .create({ to: phoneNumber, code }); 
				  return isValid.status === 'approved'; 
				  */
				return true;
			},
		}),
		twoFactor(),
		magicLink({
			sendMagicLink: async ({ email, url, token }, _request) => {
				await sendAuthMagicLink(email, url);
			},
			expiresIn: 60 * 60 * 24, // 24 hours
		}),
		bearer(),
		passkey(),
		apiKey(),
		emailHarmony(),
		/*
		captcha({
			provider: "google-recaptcha", // or cloudflare-turnstile, hcaptcha
			secretKey: process.env.RECAPTCHA_SECRET_KEY as string,
		}),
		*/
		organization(),
		admin({
			adminRoles: ["admin"],
			//adminUserIds: ["Nz6WKKKMKvadXXmgZgaHiqIYOuXr31w1"],
			//impersonationSessionDuration: 60 * 60 * 24, // 1 day
		}),
	],
	user: {
		additionalFields: {
			phoneNumber: {
				type: "string",
				required: false,
				defaultValue: "",
			},
			phoneNumberVerified: {
				type: "boolean",
				required: false,
				defaultValue: false,
			},
			role: {
				type: "string",
				required: false,
				defaultValue: "user",
				input: false, // don't allow user to set role
			},
			locale: {
				type: "string",
				required: false,
				defaultValue: "tw",
			},
			timezone: {
				type: "string",
				required: false,
				defaultValue: "",
			},
			stripeCustomerId: {
				type: "string",
				required: false,
				input: false, // don't allow user to set role
			},
		},
	},
});
export type Session = typeof auth.$Infer.Session;
