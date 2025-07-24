import { stripe } from "@better-auth/stripe";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import {
	admin,
	apiKey,
	bearer,
	captcha,
	//emailOTP,
	magicLink,
	oneTap,
	organization,
	twoFactor,
} from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
import { emailHarmony } from "better-auth-harmony";
import { sqlClient } from "@/lib/prismadb";
//import { sendAuthMagicLink } from "@/actions/mail/send-auth-magic-link";
import { stripe as stripeClient } from "@/lib/stripe/config";

export const auth = betterAuth({
	database: prismaAdapter(sqlClient, {
		provider: "postgresql",
	}),

	session: {
		expiresIn: 60 * 60 * 24 * 365, // 365 days
		updateAge: 60 * 60 * 24, // 1 day (every 1 day the session expiration is updated)
	},
	/* 
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: false,
			account: {
				accountLinking: {
					enabled: true,
				},
			},
			sendResetPassword: async ({ user, url, token }, request) => {
				await sendAuthPasswordReset(user.email, url);
			},
		},
		emailVerification: {
			sendOnSignUp: true,
			sendVerificationEmail: async ({ user, url, token }, request) => {
				await sendAuthEmailValidation(user.email, url);
			},
		},	
	*/
	socialProviders: {
		/*
		github: {
			clientId: process.env.GITHUB_CLIENT_ID as string,
			clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
		},
		line: {
			clientId: process.env.AUTH_LINE_ID as string,
			clientSecret: process.env.AUTH_LINE_SECRET as string,
		},
		discord: {
			clientId: process.env.AUTH_DISCORD_ID as string,
			clientSecret: process.env.AUTH_DISCORD_SECRET as string,
		},
		facebook: {
			clientId: process.env.AUTH_FACEBOOK_ID as string,
			clientSecret: process.env.AUTH_FACEBOOK_SECRET as string,
		},
		*/
		google: {
			clientId: process.env.AUTH_GOOGLE_ID as string,
			clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
			accessType: "offline",
			prompt: "select_account+consent",
		},
	},
	plugins: [
		//haveIBeenPwned(),
		twoFactor(),
		magicLink({
			sendMagicLink: async ({ email, url, token }, request) => {
				//await sendAuthMagicLink(email, url);
			},
		}),
		bearer(),
		passkey(),
		oneTap(),
		apiKey(),
		emailHarmony(),
		captcha({
			provider: "google-recaptcha", // or cloudflare-turnstile, hcaptcha
			secretKey: process.env.NEXT_PUBLIC_RECAPTCHA as string,
		}),
		organization(),
		admin({
			adminRoles: ["admin"],
			//sysAdminUserIds: ["Nz6WKKKMKvadXXmgZgaHiqIYOuXr31w1"],
			//impersonationSessionDuration: 60 * 60 * 24, // 1 day
		}),

		/*	
		nextCookies(),
		emailOTP({
			//https://www.better-auth.com/docs/plugins/email-otp#reset-password
			async sendVerificationOTP({ email, otp, type }) {
				if (type === "sign-in") {
					// Send the OTP for sign-in
					await sendAuthEmailValidation(email, otp);
				} else if (type === "email-verification") {
					// Send the OTP for email verification
					await sendAuthEmailValidation(email, otp);
				} else {
					// Send the OTP for password reset
					await sendAuthPasswordReset(email, otp);
				}
			},
		}),
		*/
	],
	user: {
		additionalFields: {
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
				defaultValue: "",
			},
		},
	},
});
export type Session = typeof auth.$Infer.Session;
