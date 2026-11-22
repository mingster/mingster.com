import { describe, expect, test } from "bun:test";
import { updateUserSettingsSchema } from "@/actions/user/update-user-settings.validation";

describe("updateUserSettingsSchema", () => {
	test("drops a caller supplied phone, phone changes need OTP", () => {
		const parsed = updateUserSettingsSchema.parse({
			id: "u1",
			name: "A",
			locale: "en",
			timezone: "UTC",
			phone: "+886912345678",
		});
		expect("phone" in parsed).toBe(false);
		expect(Object.keys(updateUserSettingsSchema.shape)).not.toContain("phone");
	});
});
