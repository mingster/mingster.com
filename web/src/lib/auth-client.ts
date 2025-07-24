import { stripeClient } from "@better-auth/stripe/client";
import {
	adminClient,
	//anonymousClient,
	apiKeyClient,
	//emailOTPClient,
	genericOAuthClient,
	inferAdditionalFields,
	magicLinkClient,
	//multiSessionClient,
	//oneTapClient,
	organizationClient,
	passkeyClient,
	twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "./auth";

export const authClient = createAuthClient({
	/** The base URL of the server (optional if you're using the same domain) */
	//baseURL: "http://localhost:3000"
	plugins: [
		inferAdditionalFields<typeof auth>(),
		stripeClient({
			subscription: true, //if you want to enable subscription management
		}),
		organizationClient(),
		adminClient(),
		twoFactorClient(),
		magicLinkClient(),
		passkeyClient(),
		genericOAuthClient(),
		apiKeyClient(),
		/*
		emailOTPClient(),
		usernameClient(),
		oneTapClient({
			clientId: "YOUR_CLIENT_ID",
			// Optional client configuration:
			autoSelect: false,
			cancelOnTapOutside: true,
			context: "signin",
			additionalOptions: {
				// Any extra options for the Google initialize method
			},
			// Configure prompt behavior and exponential backoff:
			promptOptions: {
				baseDelay: 1000, // Base delay in ms (default: 1000)
				maxAttempts: 5, // Maximum number of attempts before triggering onPromptNotification (default: 5)
			},
		}),
		
		*/
	],
});

export const {
	signIn,
	signUp,
	signOut,
	useSession,
	forgetPassword,
	resetPassword,
} = createAuthClient();
/*
export type AuthClient = typeof authClient;
export type Session = AuthClient["$Infer"]["Session"]["session"];
export type User = AuthClient["$Infer"]["Session"]["user"];
*/
