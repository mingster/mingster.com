#!/usr/bin/env bun
/**
 * Installation Script
 *
 * This script initializes the database with default data:
 * - Countries (ISO 3166)
 * - Currencies (ISO 4217)
 * - Locales
 * - Payment methods (from public/install/payment_methods.json)
 * - Shipping methods (from public/install/shipping_methods.json)
 * - Platform settings (+ optional Stripe product/price for subscriptions)
 *
 * Usage:
 *   bun run bin/install.ts              # Run full installation
 *   bun run bin/install.ts --wipeout    # Wipeout and reinstall
 *   bun run bin/install.ts --check      # Check installation status
 *   bun run bin/install.ts --skip-stripe  # Skip Stripe product/price setup
 *
 * Stripe subscription env vars:
 *   INSTALL_SUBSCRIPTION_CURRENCY       # default "usd"
 *   INSTALL_SUBSCRIPTION_UNIT_AMOUNT    # monthly price in Stripe smallest unit (e.g. 1000 = $10.00 for USD)
 *   INSTALL_SUBSCRIPTION_PRODUCT_NAME   # default "mingster.com subscription"
 *   INSTALL_STRIPE_PRICE_ID             # pin an existing Stripe price instead of creating
 */

import { promises as fs } from "node:fs";
import { Prisma } from "@prisma/client";
import { sqlClient } from "@/lib/prismadb";
import { stripe } from "@/lib/stripe/config";
import { getUtcNowEpoch } from "@/utils/datetime-utils";

const args = process.argv.slice(2);
const isWipeout = args.includes("--wipeout");
const isCheck = args.includes("--check");
const isSkipStripe = args.includes("--skip-stripe");

function isStripePriceId(value: string): boolean {
	return /^price_[a-zA-Z0-9]+$/.test(value.trim());
}

// ---------------------------------------------------------------------------
// Country
// ---------------------------------------------------------------------------
async function populateCountryData() {
	console.log("\n📍 Populating country data...");

	const filePath = `${process.cwd()}/public/install/country_iso.json`;
	const file = await fs.readFile(filePath, "utf8");
	const data = JSON.parse(file);

	let upserted = 0;
	for (const item of data) {
		try {
			await sqlClient.country.upsert({
				where: { alpha3: item.alpha3 },
				update: { name: item.name, unCode: item.unCode },
				create: { alpha3: item.alpha3, name: item.name, unCode: item.unCode },
			});
			upserted++;
		} catch (error) {
			console.error(`  ⚠️  Failed to upsert country: ${item.name}`, error);
		}
	}

	console.log(`  ✓ Upserted ${upserted} countries`);
	return upserted;
}

// ---------------------------------------------------------------------------
// Currency
// ---------------------------------------------------------------------------
async function populateCurrencyData() {
	console.log("\n💰 Populating currency data...");

	const filePath = `${process.cwd()}/public/install/currency_iso.json`;
	const file = await fs.readFile(filePath, "utf8");
	const data = JSON.parse(file);

	let upserted = 0;
	for (const item of data) {
		try {
			const fields = {
				name: item.name,
				demonym: item.demonym,
				majorSingle: item.majorSingle,
				majorPlural: item.majorPlural,
				ISOnum: item.ISOnum,
				symbol: item.symbol,
				symbolNative: item.symbolNative,
				minorSingle: item.minorSingle,
				minorPlural: item.minorPlural,
				ISOdigits: item.ISOdigits,
				decimals: item.decimals,
				numToBasic: item.numToBasic,
			};
			await sqlClient.currency.upsert({
				where: { id: item.currency },
				update: fields,
				create: { id: item.currency, ...fields },
			});
			upserted++;
		} catch (error) {
			console.error(`  ⚠️  Failed to upsert currency: ${item.currency}`, error);
		}
	}

	console.log(`  ✓ Upserted ${upserted} currencies`);
	return upserted;
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
// Payment Methods
// ---------------------------------------------------------------------------
type InstallPaymentMethodJson = {
	name: string;
	payUrl?: string;
	priceDescr?: string;
	fee?: number;
	feeAdditional?: number;
	clearDays?: number;
	isDeleted?: boolean;
	isDefault?: boolean;
	canDelete?: boolean;
	visibleToCustomer?: boolean;
};

async function populatePaymentMethods() {
	console.log("\n💳 Populating payment methods...");

	const filePath = `${process.cwd()}/public/install/payment_methods.json`;
	const file = await fs.readFile(filePath, "utf8");
	const data = JSON.parse(file) as InstallPaymentMethodJson[];

	let upserted = 0;
	for (const item of data) {
		const now = getUtcNowEpoch();
		const fields = {
			payUrl: item.payUrl ?? "",
			priceDescr: item.priceDescr ?? "",
			fee: new Prisma.Decimal(item.fee ?? 0),
			feeAdditional: new Prisma.Decimal(item.feeAdditional ?? 0),
			clearDays: item.clearDays ?? 3,
			isDeleted: item.isDeleted ?? false,
			isDefault: item.isDefault ?? false,
			canDelete: item.canDelete ?? false,
			visibleToCustomer: item.visibleToCustomer ?? false,
		};
		try {
			await sqlClient.paymentMethod.upsert({
				where: { name: item.name },
				update: { ...fields, updatedAt: now },
				create: { name: item.name, ...fields, createdAt: now, updatedAt: now },
			});
			upserted++;
		} catch (error) {
			console.error(
				`  ⚠️  Failed to upsert payment method: ${item.name}`,
				error,
			);
		}
	}

	console.log(`  ✓ Upserted ${upserted} payment methods`);
	return upserted;
}

// ---------------------------------------------------------------------------
// Shipping Methods
// ---------------------------------------------------------------------------
type InstallShippingMethodJson = {
	name: string;
	identifier?: string;
	description?: string | null;
	basic_price?: number;
	currencyId: string;
	shipRequired?: boolean;
	isDeleted?: boolean;
	isDefault?: boolean;
	canDelete?: boolean;
};

async function populateShippingMethods() {
	console.log("\n📦 Populating shipping methods...");

	const filePath = `${process.cwd()}/public/install/shipping_methods.json`;
	const file = await fs.readFile(filePath, "utf8");
	const data = JSON.parse(file) as InstallShippingMethodJson[];

	let upserted = 0;
	let skipped = 0;

	for (const item of data) {
		const currencyId = item.currencyId.toUpperCase();
		const exists = await sqlClient.currency.findUnique({
			where: { id: currencyId },
		});
		if (!exists) {
			console.error(
				`  ⚠️  Skipping shipping method "${item.name}": currency "${item.currencyId}" not found`,
			);
			skipped++;
			continue;
		}

		const now = getUtcNowEpoch();
		const fields = {
			identifier: item.identifier ?? "",
			description: item.description || null,
			basic_price: new Prisma.Decimal(item.basic_price ?? 0),
			currencyId,
			shipRequired: item.shipRequired ?? true,
			isDeleted: item.isDeleted ?? false,
			isDefault: item.isDefault ?? false,
			canDelete: item.canDelete ?? false,
		};
		try {
			await sqlClient.shippingMethod.upsert({
				where: { name: item.name },
				update: { ...fields, updatedAt: now },
				create: { name: item.name, ...fields, createdAt: now, updatedAt: now },
			});
			upserted++;
		} catch (error) {
			console.error(
				`  ⚠️  Failed to upsert shipping method: ${item.name}`,
				error,
			);
		}
	}

	console.log(
		`  ✓ Upserted ${upserted} shipping methods` +
			(skipped > 0 ? `, ${skipped} skipped (missing currency)` : ""),
	);
	return upserted;
}

// ---------------------------------------------------------------------------
// Stripe Subscription Product/Price
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

async function checkInstallationStatus() {
	console.log("📊 Checking installation status...\n");

	try {
		const countryCount = await sqlClient.country.count();
		const currencyCount = await sqlClient.currency.count();
		const localeCount = await sqlClient.locale.count();
		const paymentMethodCount = await sqlClient.paymentMethod.count();
		const shippingMethodCount = await sqlClient.shippingMethod.count();
		const platformSettings = await sqlClient.platformSettings.findFirst();

		console.log(`✓ Countries:        ${countryCount} records`);
		console.log(`✓ Currencies:       ${currencyCount} records`);
		console.log(`✓ Locales:          ${localeCount} records`);
		console.log(`✓ Payment methods:  ${paymentMethodCount} records`);
		console.log(`✓ Shipping methods: ${shippingMethodCount} records`);
		console.log(
			`✓ Platform Settings: ${platformSettings ? "Configured" : "Not configured"}`,
		);

		if (platformSettings) {
			console.log(
				`\n  Stripe Product ID: ${platformSettings.stripeProductId || "Not set"}`,
			);
			console.log(
				`  Stripe Price ID:   ${platformSettings.stripePriceId || "Not set"}`,
			);
		}

		const isInstalled =
			countryCount > 0 && currencyCount > 0 && localeCount > 0;

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

		await sqlClient.currency.deleteMany();
		console.log("  ✓ Deleted all currencies");

		await sqlClient.country.deleteMany();
		console.log("  ✓ Deleted all countries");

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
		const countryCount = await sqlClient.country.count();
		const currencyCount = await sqlClient.currency.count();
		const localeCount = await sqlClient.locale.count();
		const paymentMethodCount = await sqlClient.paymentMethod.count();
		const shippingMethodCount = await sqlClient.shippingMethod.count();

		console.log("\n📊 Current Status:");
		console.log(`  Countries:        ${countryCount}`);
		console.log(`  Currencies:       ${currencyCount}`);
		console.log(`  Locales:          ${localeCount}`);
		console.log(`  Payment methods:  ${paymentMethodCount}`);
		console.log(`  Shipping methods: ${shippingMethodCount}`);

		await populateCountryData();
		await populateCurrencyData();
		await populateLocaleData();
		await populatePaymentMethods();
		await populateShippingMethods();
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
			console.log(
				"⚠️  WARNING: This will delete all countries, currencies, and locales!",
			);
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
