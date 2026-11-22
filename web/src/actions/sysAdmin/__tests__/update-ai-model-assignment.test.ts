import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";

let session: unknown = null;
mock.module("next/headers", () => ({ headers: async () => new Headers() }));
mock.module("@/lib/auth", () => ({
	auth: { api: { getSession: async () => session } },
}));
mock.module("@/lib/logger", () => ({
	default: { info() {}, error() {}, warn() {}, debug() {} },
}));
mock.module("@/app/i18n", () => ({
	getT: async () => ({ t: (k: string) => k }),
}));

let row: { id: string; settings: string | null } | null = null;
const writes: { settings: string }[] = [];
mock.module("@/lib/prismadb", () => ({
	sqlClient: {
		platformSettings: {
			findFirst: async () => row,
			update: async ({ data }: { data: { settings: string } }) => {
				writes.push(data);
				row = { id: "p1", settings: data.settings };
			},
			create: async ({ data }: { data: { settings: string } }) => {
				writes.push(data);
				row = { id: "p1", settings: data.settings };
			},
		},
	},
}));

const { updateAiModelAssignmentAction } = await import(
	"../update-ai-model-assignment"
);
const { loadAiModelsPageData } = await import(
	"@/lib/ai/load-ai-models-page-data.server"
);

const savedEnv = { ...process.env };
const admin = { user: { id: "a1", email: "a@example.com", role: "admin" } };

beforeEach(() => {
	session = admin;
	writes.length = 0;
	process.env.GEMINI_API_KEY = "unit-test-key";
	row = {
		id: "p1",
		settings: JSON.stringify([
			{ label: "Support.Email", value: "help@example.com" },
			{ label: "Other.Thing", value: "42" },
		]),
	};
});
afterEach(() => {
	process.env = { ...savedEnv };
});

const save = (model: string, fallback: string | null = null) =>
	updateAiModelAssignmentAction({ purpose: "avatar_chat", model, fallback });

describe("updateAiModelAssignmentAction", () => {
	test("case 26: saving keeps Support.Email and every other entry", async () => {
		const result = await save("gemini-pro-latest");
		expect(result?.data).toEqual({
			model: "gemini-pro-latest",
			fallback: null,
		});
		const pairs = JSON.parse(writes[0].settings);
		expect(pairs).toHaveLength(3);
		expect(pairs[0]).toEqual({
			label: "Support.Email",
			value: "help@example.com",
		});
		expect(pairs[1]).toEqual({ label: "Other.Thing", value: "42" });
		expect(JSON.parse(pairs[2].value).avatar_chat).toBe("gemini-pro-latest");
	});

	test("a second save replaces the entry instead of adding another", async () => {
		await save("gemini-pro-latest");
		await save("gemini-flash-latest");
		const pairs = JSON.parse(writes[1].settings);
		expect(pairs).toHaveLength(3);
	});

	test("creates the row when none exists", async () => {
		row = null;
		const result = await save("gemini-pro-latest");
		expect(result?.data).toBeDefined();
		expect(JSON.parse(writes[0].settings)).toHaveLength(1);
	});

	test("rejects an id outside the catalog", async () => {
		const result = await save("gpt-nonexistent");
		expect(result?.data).toBeUndefined();
		expect(writes).toHaveLength(0);
	});

	test("rejects a provider with no usable key", async () => {
		process.env.ANTHROPIC_API_KEY = "unit-test-key";
		const result = await save("claude-sonnet-5-5");
		expect(result?.serverError).toBeDefined();
		expect(writes).toHaveLength(0);
	});

	test("does not overwrite settings that are not a JSON array", async () => {
		row = { id: "p1", settings: '{"a":1}' };
		const result = await save("gemini-pro-latest");
		expect(result?.serverError).toBeDefined();
		expect(writes).toHaveLength(0);
	});

	test("a non admin cannot save", async () => {
		session = { user: { id: "u1", email: "u@example.com", role: "user" } };
		const result = await save("gemini-pro-latest");
		expect(result?.data).toBeUndefined();
		expect(writes).toHaveLength(0);
	});
});

describe("loadAiModelsPageData (case 8)", () => {
	test("a non admin gets null, with no provider status", async () => {
		session = { user: { id: "u1", email: "u@example.com", role: "user" } };
		expect(await loadAiModelsPageData()).toBeNull();
	});

	test("signed out gets null", async () => {
		session = null;
		expect(await loadAiModelsPageData()).toBeNull();
	});

	test("an admin gets one boolean per provider and no key value", async () => {
		const data = await loadAiModelsPageData();
		expect(data?.providerConfigured).toEqual({
			gemini: true,
			anthropic: false,
			xai: false,
		});
		expect(JSON.stringify(data)).not.toContain("unit-test-key");
		expect(data?.misconfigured).toBe(false);
	});

	test("the misconfigured note flag is set when the assigned provider is unusable", async () => {
		delete process.env.GEMINI_API_KEY;
		delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
		const data = await loadAiModelsPageData();
		expect(data?.misconfigured).toBe(true);
	});
});
