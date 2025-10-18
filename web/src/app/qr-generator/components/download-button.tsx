"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IconDownload } from "@tabler/icons-react";
import { downloadQRCode } from "@/lib/qr/generator";

interface DownloadButtonProps {
  blob: Blob | null;
  disabled?: boolean;
}

export function DownloadButton({ blob, disabled }: DownloadButtonProps) {
  const [open, setOpen] = useState(false);
  const [filename, setFilename] = useState("qrcode");

  const handleDownload = () => {
    if (!blob) return;

    const finalFilename = filename.endsWith(".png")
      ? filename
      : `${filename}.png`;

    downloadQRCode(blob, finalFilename);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          disabled={disabled || !blob}
          className="w-full"
        >
          <IconDownload className="mr-2 size-5" />
          Download QR Code
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Download QR Code</DialogTitle>
          <DialogDescription>
            Enter a filename for your QR code image.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="filename">Filename</Label>
            <div className="flex gap-2">
              <Input
                id="filename"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="qrcode"
              />
              <span className="flex items-center text-sm text-muted-foreground">
                .png
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleDownload} className="flex-1">
              Download
            </Button>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

