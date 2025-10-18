"use client";

import { useState, useCallback } from "react";
import { URLInput } from "./url-input";
import { QRPreview } from "./qr-preview";
import { QRSettings } from "./qr-settings";
import { DownloadButton } from "./download-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ErrorCorrectionLevel, QRCodeOptions } from "@/lib/qr/types";

export function QRGeneratorClient() {
  // Content state
  const [url, setUrl] = useState("");

  // QR settings state
  const [size, setSize] = useState(300);
  const [foregroundColor, setForegroundColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [transparentBackground, setTransparentBackground] = useState(false);
  const [errorCorrectionLevel, setErrorCorrectionLevel] =
    useState<ErrorCorrectionLevel>("M");
  const [margin, setMargin] = useState(4);

  // Generated QR code
  const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null);

  // Build options object
  const qrOptions: QRCodeOptions = {
    content: url,
    size,
    foregroundColor,
    backgroundColor,
    transparentBackground,
    errorCorrectionLevel,
    margin,
  };

  // Handle QR code generation
  const handleGenerated = useCallback((_dataURL: string, blob: Blob) => {
    setGeneratedBlob(blob);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">QR Code Generator</h1>
        <p className="text-muted-foreground">
          Create custom QR codes for URLs with advanced styling options
        </p>
      </div>

      <Separator />

      {/* Main Grid Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Input & Settings */}
        <div className="space-y-6">
          {/* URL Input */}
          <Card>
            <CardHeader>
              <CardTitle>QR Code Content</CardTitle>
            </CardHeader>
            <CardContent>
              <URLInput value={url} onChange={setUrl} />
            </CardContent>
          </Card>

          {/* Settings */}
          <QRSettings
            size={size}
            onSizeChange={setSize}
            foregroundColor={foregroundColor}
            onForegroundColorChange={setForegroundColor}
            backgroundColor={backgroundColor}
            onBackgroundColorChange={setBackgroundColor}
            transparentBackground={transparentBackground}
            onTransparentBackgroundChange={setTransparentBackground}
            errorCorrectionLevel={errorCorrectionLevel}
            onErrorCorrectionLevelChange={setErrorCorrectionLevel}
            margin={margin}
            onMarginChange={setMargin}
          />
        </div>

        {/* Right Column - Preview & Download */}
        <div className="space-y-6">
          {/* Preview */}
          <QRPreview options={qrOptions} onGenerated={handleGenerated} />

          {/* Download Button */}
          <DownloadButton blob={generatedBlob} disabled={!url} />
        </div>
      </div>

      {/* Info Section */}
      <Card className="border-muted bg-muted/50">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">About QR Codes</p>
            <p>
              QR Code (Quick Response Code) is a two-dimensional barcode that
              can store various types of information. The three corner squares
              help scanners quickly identify and read the code.
            </p>
            <p>
              Higher error correction levels allow the QR code to be readable
              even if partially damaged or obscured, which is useful for adding
              logos or styling.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

