import { describe, expect, test } from "bun:test";
import { AvatarReplyParseError, parseAvatarReply } from "../parse-avatar-reply";

const good = {
	parts: [{ text: "Hello", facialExpression: "happy", animation: "Excited" }],
	grounding: "grounded",
	off_topic: false,
};

describe("parseAvatarReply (case 17)", () => {
	test("keeps valid values", () => {
		const r = parseAvatarReply(JSON.stringify(good));
		expect(r.parts).toEqual([
			{ text: "Hello", facialExpression: "happy", animation: "Excited" },
		]);
		expect(r.grounding).toBe("grounded");
		expect(r.offTopic).toBe(false);
	});

	test("invalid expression maps to neutral and invalid animation to Talking", () => {
		const r = parseAvatarReply(
			JSON.stringify({
				...good,
				parts: [
					{ text: "a", facialExpression: "furious", animation: "Moonwalk" },
					{ text: "b" },
					{ text: "c", facialExpression: 5, animation: null },
				],
			}),
		);
		for (const p of r.parts) {
			expect(p.facialExpression).toBe("neutral");
			expect(p.animation).toBe("Talking");
		}
		expect(r.parts).toHaveLength(3);
	});

	test("strips code fences and surrounding prose", () => {
		const r = parseAvatarReply(
			`Here you go:\n\`\`\`json\n${JSON.stringify(good)}\n\`\`\`\n`,
		);
		expect(r.parts[0].text).toBe("Hello");
	});

	test("unknown grounding is ungrounded and off_topic must be true", () => {
		const r = parseAvatarReply(
			JSON.stringify({ ...good, grounding: "maybe", off_topic: "yes" }),
		);
		expect(r.grounding).toBe("ungrounded");
		expect(r.offTopic).toBe(false);
		expect(
			parseAvatarReply(JSON.stringify({ ...good, off_topic: true })).offTopic,
		).toBe(true);
	});

	test("drops empty parts", () => {
		const r = parseAvatarReply(
			JSON.stringify({ ...good, parts: [{ text: "  " }, ...good.parts] }),
		);
		expect(r.parts).toHaveLength(1);
	});

	test("rejects truncated, empty and non object output", () => {
		const truncated = JSON.stringify(good).slice(0, 40);
		for (const bad of [
			truncated,
			"",
			"[]",
			'{"parts":[]}',
			'{"parts":"x"}',
			"no json",
		]) {
			expect(() => parseAvatarReply(bad)).toThrow(AvatarReplyParseError);
		}
	});
});
