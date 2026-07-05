import type { StoreOrder } from "@prisma/client";
import { getEcpayCredentialsByStore } from "@/lib/payment/ecpay";
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

/** ECPay AIO redirect checkout (also serves ecpay-jkopay / ecpay-pxpay sub-methods). */
export class EcpayPlugin implements PaymentMethodPlugin {
	readonly identifier = "ecpay";
	readonly name = "ECPay";
	readonly description = "ECPay AIO redirect checkout";
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
		const tradeNo = paymentData.tradeNo as string | undefined;
		if (!tradeNo) {
			return {
				success: false,
				paymentStatus: "failed",
				error: "tradeNo required",
			};
		}
		return {
			success: true,
			paymentStatus: "paid",
			paymentData: {
				tradeNo,
				merchantTradeNo: paymentData.merchantTradeNo,
				paymentType: paymentData.paymentType,
			},
		};
	}

	async verifyPaymentStatus(
		_orderId: string,
		paymentData: PaymentData,
		_config: PluginConfig,
	): Promise<PaymentStatus> {
		const tradeNo = paymentData.tradeNo as string | undefined;
		return tradeNo ? { status: "paid", paymentData } : { status: "failed" };
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
		const credentials = await getEcpayCredentialsByStore(order.storeId);
		return credentials
			? { available: true }
			: { available: false, reason: "ECPay credentials are not configured" };
	}
}

export const ecpayPlugin = new EcpayPlugin();
