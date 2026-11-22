import { convertLegacyPercentSyntaxToMustache } from "@/lib/notification/template-migration-compat";
import { resolveSupportEmailFromPlatformSettingsJson } from "@/lib/platform-settings/resolve-support-email-from-platform-settings-json";
import { sqlClient } from "@/lib/prismadb";
import type { User } from "@/types";
import type { StringNVType } from "@/types/enum";
import type { AuthEmailStoreContext } from "./resolve-store-for-auth-email";

/**
 * Replaces `{{...}}` placeholders in message templates. Legacy `%Token.Path%` in the
 * input is normalized to mustache first (same rules as `convertLegacyPercentSyntaxToMustache`).
 */
export async function PhaseTags(
	messageToBePhased: string,
	_customer?: User | null,
	user?: User | null,
	storeContext?: AuthEmailStoreContext | null,
): Promise<string> {
	let result = convertLegacyPercentSyntaxToMustache(messageToBePhased);

	const platformSettings = await sqlClient.platformSettings.findFirst();
	let settingsKV: StringNVType[] = [];
	if (platformSettings?.settings != null) {
		try {
			settingsKV = JSON.parse(
				String(platformSettings.settings),
			) as StringNVType[];
		} catch {
			settingsKV = [];
		}
	}

	const supportEmailResolved = resolveSupportEmailFromPlatformSettingsJson(
		platformSettings?.settings != null
			? String(platformSettings.settings)
			: undefined,
	);
	result = result.replace(/\{\{support\.email\}\}/gi, supportEmailResolved);

	const appName = settingsKV.find((item) => item.label === "App.Name");
	const appNameValue = appName?.value ?? "riben.life";
	result = result.replace(/\{\{app\.name\}\}/gi, appNameValue);

	const trimmedStoreName = storeContext?.name?.trim();
	const storeDisplayName =
		trimmedStoreName && trimmedStoreName.length > 0
			? trimmedStoreName
			: appNameValue;
	const storeIdForTags = storeContext?.id?.trim() ?? "";

	result = result.replace(/\{\{store\.name\}\}/gi, storeDisplayName);
	result = result.replace(/\{\{store\.id\}\}/gi, storeIdForTags);

	const userEmail = user?.email ?? "";
	const userName = user?.name ?? "";
	const userId = user?.id ?? "";
	result = result.replace(/\{\{customer\.email\}\}/gi, userEmail);
	result = result.replace(/\{\{customer\.fullName\}\}/gi, userName);
	result = result.replace(/\{\{customer\.username\}\}/gi, userEmail);
	result = result.replace(/\{\{customer\.customerId\}\}/gi, userId);

	return result;
}
