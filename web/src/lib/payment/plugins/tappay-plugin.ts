import type { StoreOrder } from "@prisma/client";
import { getTapPayCredentialsByStore } from "@/lib/payment/tappay";
import type {
	AvailabilityResult,
	FeeStructure,
	PaymentConfirmation,
	PaymentData,
	PaymentMethodPlugin,
	PaymentResult,
	PaymentStatus,
	PluginConfig,
	ValidationResult,
} from "./types";

/** TapPay in-page card checkout (Pay-by-Prime). */
export class TapPayPlugin implements PaymentMethodPlugin {
	readonly identifier = "tappay";
	readonly name = "TapPay";
	readonly description = "TapPay in-page card checkout";
	readonly version = "1.0.0";

	async processPayment(
		_order: StoreOrder,
		_config: PluginConfig,
	): Promise<PaymentResult> {
		return { success: true };
	}

	async confirmPayment(
		_orderId: string,
		paymentData: PaymentData,
		_config: PluginConfig,
	): Promise<PaymentConfirmation> {
		const recTradeId = paymentData.recTradeId as string | undefined;
		if (!recTradeId) {
			return {
				success: false,
				paymentStatus: "failed",
				error: "recTradeId required",
			};
		}
		return {
			success: true,
			paymentStatus: "paid",
			paymentData: {
				recTradeId,
			},
		};
	}

	async verifyPaymentStatus(
		_orderId: string,
		paymentData: PaymentData,
		_config: PluginConfig,
	): Promise<PaymentStatus> {
		const recTradeId = paymentData.recTradeId as string | undefined;
		return recTradeId ? { status: "paid", paymentData } : { status: "failed" };
	}

	calculateFees(_amount: number, config: PluginConfig): FeeStructure {
		const feeRate =
			config.storeConfig?.feeRate ?? config.platformConfig?.feeRate ?? 0.028;
		const feeAdditional =
			config.storeConfig?.feeAdditional ??
			config.platformConfig?.feeAdditional ??
			0;
		return {
			feeRate,
			feeAdditional,
			calculateFee: (amt: number) => amt * feeRate + feeAdditional,
		};
	}

	validateConfiguration(_config: PluginConfig): ValidationResult {
		return { valid: true };
	}

	async checkAvailability(order: StoreOrder): Promise<AvailabilityResult> {
		const credentials = await getTapPayCredentialsByStore(order.storeId);
		return credentials
			? { available: true }
			: { available: false, reason: "TapPay credentials are not configured" };
	}
}

export const tappayPlugin = new TapPayPlugin();
