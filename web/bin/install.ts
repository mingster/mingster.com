#!/usr/bin/env bun
/**
 * Installation Script
 *
 * Seeds the database with the data the three retained features need:
 * - Locales (drives i18n locale selector + auth email localisation)
 * - Platform settings (+ optional Stripe product/price for subscriptions)
 * - Auth message templates (magic link, password reset, welcome)
 *
 * Usage:
 *   bun run bin/install.ts               # Run full installation
 *   bun run bin/install.ts --check       # Check installation status
 *   bun run bin/install.ts --wipeout     # Wipeout locales and reinstall
 *   bun run bin/install.ts --skip-stripe # Skip Stripe product/price setup
 *
 * Stripe subscription env vars:
 *   INSTALL_SUBSCRIPTION_CURRENCY       # default "usd"
 *   INSTALL_SUBSCRIPTION_UNIT_AMOUNT    # monthly price in Stripe smallest unit
 *   INSTALL_SUBSCRIPTION_PRODUCT_NAME   # default "mingster.com subscription"
 *   INSTALL_STRIPE_PRICE_ID             # pin an existing Stripe price instead of creating
 */

import { promises as fs } from "node:fs";
import { importMessageTemplateBackup } from "@/lib/notification/import-message-template-backup";
import { sqlClient } from "@/lib/prismadb";
import { stripe } from "@/lib/stripe/config";

const args = process.argv.slice(2);
const isWipeout = args.includes("--wipeout");
const isCheck = args.includes("--check");
const isSkipStripe = args.includes("--skip-stripe");

function isStripePriceId(value: string): boolean {
	return /^price_[a-zA-Z0-9]+$/.test(value.trim());
}

// ---------------------------------------------------------------------------
// Locale
// ---------------------------------------------------------------------------
async function populateLocaleData() {
	console.log("\n🌐 Populating locale data...");

	const filePath = `${process.cwd()}/public/install/locales.json`;
	const file = await fs.readFile(filePath, "utf8");
	const data = JSON.parse(file);

	let upserted = 0;
	for (const item of data) {
		try {
			await sqlClient.locale.upsert({
				where: { id: item.id },
				update: {
					name: item.name,
					lng: item.lng,
					defaultCurrencyId: item.defaultCurrencyId,
				},
				create: {
					id: item.id,
					name: item.name,
					lng: item.lng,
					defaultCurrencyId: item.defaultCurrencyId,
				},
			});
			upserted++;
		} catch (error) {
			console.error(`  ⚠️  Failed to upsert locale: ${item.id}`, error);
		}
	}

	console.log(`  ✓ Upserted ${upserted} locales`);
	return upserted;
}

// ---------------------------------------------------------------------------
// Platform settings / Stripe
// ---------------------------------------------------------------------------
async function ensurePlatformStripeSubscription(): Promise<void> {
	if (isSkipStripe) {
		console.log("\n💳 Stripe setup skipped (--skip-stripe)");
		return;
	}

	const secret = process.env.STRIPE_SECRET_KEY?.trim();
	if (!secret) {
		console.log(
			"\n💳 STRIPE_SECRET_KEY not set — skipping Stripe subscription setup",
		);
		return;
	}

	console.log("\n💳 Ensuring Stripe subscription product & price...");

	const settings = await sqlClient.platformSettings.findFirst();

	const pinnedPriceId = process.env.INSTALL_STRIPE_PRICE_ID?.trim();
	if (pinnedPriceId) {
		if (!isStripePriceId(pinnedPriceId)) {
			console.error(
				`  ⚠️  INSTALL_STRIPE_PRICE_ID must look like price_xxx, got: ${pinnedPriceId}`,
			);
			return;
		}
		try {
			const price = await stripe.prices.retrieve(pinnedPriceId);
			const productId =
				typeof price.product === "string" ? price.product : price.product.id;
			await upsertPlatformStripeIds(productId, pinnedPriceId);
			console.log(`  ✓ Pinned existing price: ${pinnedPriceId}`);
			return;
		} catch (err) {
			console.error(
				"  ⚠️  INSTALL_STRIPE_PRICE_ID not found in Stripe:",
				err instanceof Error ? err.message : err,
			);
			return;
		}
	}

	// Check if we already have valid IDs
	if (settings?.stripeProductId && settings?.stripePriceId) {
		if (isStripePriceId(settings.stripePriceId)) {
			try {
				await stripe.prices.retrieve(settings.stripePriceId);
				console.log(
					`  ✓ Existing Stripe price valid: ${settings.stripePriceId}`,
				);
				return;
			} catch {
				console.log(
					`  ⚠️  Stored stripePriceId invalid — will create new product/price`,
				);
			}
		}
	}

	// Create new product + price
	const currency = (
		process.env.INSTALL_SUBSCRIPTION_CURRENCY?.trim() || "usd"
	).toLowerCase();
	const unitAmountRaw = process.env.INSTALL_SUBSCRIPTION_UNIT_AMOUNT?.trim();
	const unitAmount = unitAmountRaw ? Number.parseInt(unitAmountRaw, 10) : 1000;
	const productName =
		process.env.INSTALL_SUBSCRIPTION_PRODUCT_NAME?.trim() ||
		"mingster.com subscription";

	if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
		console.error(
			`  ⚠️  Invalid INSTALL_SUBSCRIPTION_UNIT_AMOUNT: ${unitAmountRaw}`,
		);
		return;
	}

	try {
		// Create or reuse product
		let productId = settings?.stripeProductId?.trim();
		if (productId) {
			try {
				await stripe.products.retrieve(productId);
				console.log(`  ✓ Reusing existing product: ${productId}`);
			} catch {
				productId = undefined;
			}
		}
		if (!productId) {
			const product = await stripe.products.create({ name: productName });
			productId = product.id;
			console.log(`  ✓ Created Stripe product: ${productId}`);
		}

		// Create monthly price
		const monthlyPrice = await stripe.prices.create({
			product: productId,
			currency,
			unit_amount: unitAmount,
			recurring: { interval: "month" },
			nickname: `${productName} (monthly)`,
		});
		console.log(
			`  ✓ Created monthly price: ${monthlyPrice.id} (${currency.toUpperCase()} ${unitAmount})`,
		);

		// Create yearly price (with ~17% discount)
		const yearlyAmount = Math.round(unitAmount * 10);
		const yearlyPrice = await stripe.prices.create({
			product: productId,
			currency,
			unit_amount: yearlyAmount,
			recurring: { interval: "year" },
			nickname: `${productName} (yearly)`,
		});
		console.log(
			`  ✓ Created yearly price: ${yearlyPrice.id} (${currency.toUpperCase()} ${yearlyAmount})`,
		);

		await upsertPlatformStripeIds(productId, monthlyPrice.id);
		console.log(`  ✓ Platform settings updated`);
	} catch (err) {
		console.error(
			"  ❌ Failed to create Stripe subscription product/prices:",
			err instanceof Error ? err.message : err,
		);
	}
}

async function upsertPlatformStripeIds(
	stripeProductId: string,
	stripePriceId: string,
): Promise<void> {
	const existing = await sqlClient.platformSettings.findFirst();
	if (!existing) {
		await sqlClient.platformSettings.create({
			data: { stripeProductId, stripePriceId, settings: null },
		});
		return;
	}
	await sqlClient.platformSettings.update({
		where: { id: existing.id },
		data: { stripeProductId, stripePriceId },
	});
}

// ---------------------------------------------------------------------------
// Check / Status
// ---------------------------------------------------------------------------
async function checkPlatformSettings() {
	console.log("\n⚙️  Checking platform settings...");

	const settings = await sqlClient.platformSettings.findFirst();
	if (!settings) {
		console.log("  ⚠️  No platform settings found");
		return null;
	}

	if (settings.stripeProductId) {
		try {
			const product = await stripe.products.retrieve(settings.stripeProductId);
			console.log(`  ✓ Stripe product verified: ${product.name}`);
		} catch {
			console.error("  ⚠️  Invalid Stripe product ID");
		}
	} else {
		console.log("  ℹ️  Stripe product not configured");
	}

	if (settings.stripePriceId) {
		if (isStripePriceId(settings.stripePriceId)) {
			try {
				const price = await stripe.prices.retrieve(settings.stripePriceId);
				console.log(
					`  ✓ Stripe price verified: ${price.id} (${price.currency} ${price.unit_amount ?? "?"})`,
				);
			} catch {
				console.error(`  ⚠️  Invalid Stripe price ID: ${settings.stripePriceId}`);
			}
		} else {
			console.error(
				`  ⚠️  stripePriceId is not a valid Stripe ID: ${settings.stripePriceId}`,
			);
		}
	} else {
		console.log("  ℹ️  Stripe price not configured");
	}

	return settings;
}

// ---------------------------------------------------------------------------
// Auth message templates
// ---------------------------------------------------------------------------
// Resolved by the importer relative to public/backup/
const AUTH_TEMPLATE_BACKUP = "message-template-backup-auth.json";

async function populateAuthMessageTemplates() {
	console.log("\n✉️  Importing auth message templates...");

	try {
		const { templates, localizations } =
			await importMessageTemplateBackup(AUTH_TEMPLATE_BACKUP);
		console.log(
			`  ✓ Imported ${templates} template(s), ${localizations} localization(s)`,
		);
	} catch (error) {
		console.error(
			"  ⚠️  Auth template import failed — magic link and password reset emails will not render.",
		);
		console.error(`     ${error instanceof Error ? error.message : error}`);
	}
}


// ---------------------------------------------------------------------------
// Status
// ---------------------------------------------------------------------------
async function checkInstallationStatus() {
	console.log("📊 Checking installation status...\n");

	try {
		const localeCount = await sqlClient.locale.count();
		const templateCount = await sqlClient.messageTemplate.count();
		const localizedCount = await sqlClient.messageTemplateLocalized.count();
		const queuedEmails = await sqlClient.emailQueue.count();
		const platformSettings = await sqlClient.platformSettings.findFirst();

		console.log(`✓ Locales:             ${localeCount} records`);
		console.log(`✓ Message templates:   ${templateCount} records`);
		console.log(`✓ Template locales:    ${localizedCount} records`);
		console.log(`✓ Emails in queue:     ${queuedEmails} records`);
		console.log(
			`✓ Platform Settings:   ${platformSettings ? "Configured" : "Not configured"}`,
		);

		if (platformSettings) {
			console.log(
				`\n  Stripe Product ID: ${platformSettings.stripeProductId || "Not set"}`,
			);
			console.log(
				`  Stripe Price ID:   ${platformSettings.stripePriceId || "Not set"}`,
			);
		}

		if (queuedEmails > 0) {
			console.log(
				`\n⚠️  ${queuedEmails} email(s) sitting in emailQueue. Nothing drains this table yet —` +
					" add a sendmail cron before relying on magic link or password reset.",
			);
		}

		const isInstalled = localeCount > 0 && localizedCount > 0;

		if (isInstalled) {
			console.log("\n✅ Installation is complete!");
		} else {
			console.log(
				"\n⚠️  Installation is incomplete. Run: bun run bin/install.ts",
			);
		}

		return isInstalled;
	} catch (error) {
		console.error("❌ Error checking installation:", error);
		return false;
	}
}

// ---------------------------------------------------------------------------
// Wipeout
// ---------------------------------------------------------------------------
async function wipeoutData() {
	console.log("\n🗑️  Wiping out existing data...");

	try {
		await sqlClient.locale.deleteMany();
		console.log("  ✓ Deleted all locales");

		console.log("\n✅ Wipeout complete");
	} catch (error) {
		console.error("❌ Error during wipeout:", error);
		throw error;
	}
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function runInstallation() {
	console.log("🚀 Starting installation...\n");
	console.log("=".repeat(50));

	try {
		console.log("\n📊 Current Status:");
		console.log(`  Locales:           ${await sqlClient.locale.count()}`);
		console.log(
			`  Message templates: ${await sqlClient.messageTemplate.count()}`,
		);

		await populateLocaleData();
		await populateAuthMessageTemplates();
		await ensurePlatformStripeSubscription();
		await checkPlatformSettings();

		console.log(`\n${"=".repeat(50)}`);
		console.log("✅ Installation complete!\n");

		await checkInstallationStatus();
	} catch (error) {
		console.error("\n❌ Installation failed:", error);
		throw error;
	}
}

async function main() {
	try {
		if (isCheck) {
			await checkInstallationStatus();
		} else if (isWipeout) {
			console.log("⚠️  WARNING: This will delete all locales!");
			console.log(
				"Press Ctrl+C to cancel, or wait 3 seconds to continue...\n",
			);
			await new Promise((resolve) => setTimeout(resolve, 3000));
			await wipeoutData();
			await runInstallation();
		} else {
			await runInstallation();
		}

		console.log("\n🎉 Done!");
	} catch (error) {
		console.error("\n💥 Fatal error:", error);
		process.exit(1);
	} finally {
		await sqlClient.$disconnect();
	}
}

main();
