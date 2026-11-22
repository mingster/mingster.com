/**
 * Better Auth account linking options.
 *
 * LINE is deliberately not a trusted provider. Better Auth hardcodes
 * `emailVerified: false` for LINE profiles and LINE's docs do not say the
 * email claim is verified, so trusting it would let a LINE sign-in carrying
 * someone else's email link to that person's account (issue #69).
 */
export const accountLinkingConfig = {
	enabled: true,
	allowDifferentEmails: true,
	trustedProviders: ["google", "phone", "apple"],
	updateUserInfoOnLink: true,
};
