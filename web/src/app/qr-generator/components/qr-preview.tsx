"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "@/components/loader";
import { generateQRCode } from "@/lib/qr/generator";
import type { QRCodeOptions } from "@/lib/qr/types";

interface QRPreviewProps {
  options: QRCodeOptions;
  onGenerated?: (dataURL: string, blob: Blob) => void;
}

export function QRPreview({ options, onGenerated }: QRPreviewProps) {
  const [dataURL, setDataURL] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const generate = async () => {
      // Don't generate if no content
      if (!options.content || options.content.trim() === "") {
        setDataURL("");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const result = await generateQRCode(options);
        setDataURL(result.dataURL);
        onGenerated?.(result.dataURL, result.blob);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to generate QR code");
        setDataURL("");
      } finally {
        setLoading(false);
      }
    };

    generate();
  }, [options, onGenerated]);

  return (
    <Card>
      <CardContent className="flex min-h-[400px] items-center justify-center p-6">
        {loading && <Loader />}
        
        {!loading && error && (
          <div className="text-center text-destructive">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && !dataURL && (
          <div className="text-center text-muted-foreground">
            <p className="text-sm">Enter a URL to generate QR code</p>
          </div>
        )}

        {!loading && !error && dataURL && (
          <div className="flex flex-col items-center gap-4">
            <Image
              src={dataURL}
              alt="Generated QR Code"
              width={options.size}
              height={options.size}
              className="max-w-full rounded-lg shadow-md"
              unoptimized
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

