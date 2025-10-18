/**
 * QR Code Generator Types
 */

export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

export interface QRCodeOptions {
  // Content
  content: string;

  // Visual Settings
  size: number;
  foregroundColor: string;
  backgroundColor: string;
  transparentBackground: boolean;

  // QR Settings
  errorCorrectionLevel: ErrorCorrectionLevel;
  margin: number; // Border width in modules
}

export interface QRCodeGenerationResult {
  dataURL: string;
  blob: Blob;
}

export const ERROR_CORRECTION_LEVELS: {
  value: ErrorCorrectionLevel;
  label: string;
  description: string;
}[] = [
  {
    value: "L",
    label: "L - Low",
    description: "7% recovery capacity",
  },
  {
    value: "M",
    label: "M - Medium",
    description: "15% recovery capacity",
  },
  {
    value: "Q",
    label: "Q - Quartile",
    description: "25% recovery capacity",
  },
  {
    value: "H",
    label: "H - High",
    description: "30% recovery capacity",
  },
];

