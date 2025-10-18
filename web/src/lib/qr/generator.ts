/**
 * QR Code Generation Logic
 */

import QRCode from "qrcode";
import type { QRCodeOptions, QRCodeGenerationResult } from "./types";

/**
 * Generates a QR code with custom styling
 */
export async function generateQRCode(
  options: QRCodeOptions,
): Promise<QRCodeGenerationResult> {
  const {
    content,
    size,
    foregroundColor,
    backgroundColor,
    transparentBackground,
    errorCorrectionLevel,
    margin,
  } = options;

  // Create canvas
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  // Generate QR code on canvas
  await QRCode.toCanvas(canvas, content, {
    width: size,
    margin: margin,
    errorCorrectionLevel: errorCorrectionLevel,
    color: {
      dark: foregroundColor,
      light: transparentBackground ? "#00000000" : backgroundColor,
    },
  });

  // Convert to data URL
  const dataURL = canvas.toDataURL("image/png");

  // Convert to blob
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Failed to create blob"));
      }
    }, "image/png");
  });

  return {
    dataURL,
    blob,
  };
}

/**
 * Download QR code as a file
 */
export function downloadQRCode(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validates URL format
 */
export function isValidURL(url: string): boolean {
  if (!url || url.trim() === "") return false;

  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Ensures URL has protocol
 */
export function normalizeURL(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";

  // Check if it already has a protocol
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // Add https:// by default
  return `https://${trimmed}`;
}

