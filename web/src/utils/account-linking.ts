import logger from "@/lib/logger";
import { sqlClient } from "@/lib/prismadb";

/**
 * Links an anonymous user account to a newly registered/authenticated user account.
 *
 * Called by Better Auth's anonymous plugin when an anonymous user signs up or
 * signs in. Carries over the profile details the anonymous session accumulated
 * and moves any organization memberships onto the real account.
 *
 * Historically this also migrated reservations, orders, credit ledgers,
 * addresses and the message queue. Those domains no longer exist in
 * mingster.com, so the migration is limited to profile + membership.
 *
 * @param anonymousUserId - The ID of the anonymous/guest user account
 * @param newUserId - The ID of the newly registered/authenticated user account
 */
export async function linkAnonymousAccount(
	anonymousUserId: string,
	newUserId: string,
): Promise<void> {
	try {
		await sqlClient.$transaction(async (tx) => {
			const [anonymousUser, newUser] = await Promise.all([
				tx.user.findUnique({
					where: { id: anonymousUserId },
					select: {
						name: true,
						phoneNumber: true,
						phoneNumberVerified: true,
						locale: true,
						timezone: true,
					},
				}),
				tx.user.findUnique({
					where: { id: newUserId },
					select: {
						name: true,
						phoneNumber: true,
						locale: true,
						timezone: true,
					},
				}),
			]);

			// Carry over only fields the new account does not already have.
			const carriedOver: Record<string, string | boolean> = {};
			if (anonymousUser) {
				if (!newUser?.name && anonymousUser.name) {
					carriedOver.name = anonymousUser.name;
				}
				if (!newUser?.phoneNumber && anonymousUser.phoneNumber) {
					carriedOver.phoneNumber = anonymousUser.phoneNumber;
					carriedOver.phoneNumberVerified =
						anonymousUser.phoneNumberVerified ?? false;
				}
				if (!newUser?.locale && anonymousUser.locale) {
					carriedOver.locale = anonymousUser.locale;
				}
				if (!newUser?.timezone && anonymousUser.timezone) {
					carriedOver.timezone = anonymousUser.timezone;
				}
			}

			if (Object.keys(carriedOver).length > 0) {
				await tx.user.update({
					where: { id: newUserId },
					data: carriedOver,
				});
			}

			// Move organization memberships, skipping any the new user already holds.
			const anonymousMemberships = await tx.member.findMany({
				where: { userId: anonymousUserId },
				select: { id: true, organizationId: true },
			});

			let membershipsMoved = 0;
			for (const membership of anonymousMemberships) {
				const alreadyMember = await tx.member.findFirst({
					where: {
						userId: newUserId,
						organizationId: membership.organizationId,
					},
					select: { id: true },
				});

				if (alreadyMember) {
					await tx.member.delete({ where: { id: membership.id } });
					continue;
				}

				await tx.member.update({
					where: { id: membership.id },
					data: { userId: newUserId },
				});
				membershipsMoved++;
			}

			logger.info("Account linking completed", {
				metadata: {
					anonymousUserId,
					newUserId,
					fieldsCarriedOver: Object.keys(carriedOver),
					membershipsMoved,
				},
				tags: ["auth", "anonymous", "account-linking"],
			});
		});
	} catch (error) {
		logger.error("Account linking failed", {
			metadata: {
				anonymousUserId,
				newUserId,
				error: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined,
			},
			tags: ["auth", "anonymous", "account-linking", "error"],
		});
		// Re-throw so linking fails loudly rather than silently losing data.
		throw error;
	}
}
