"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ERROR_CORRECTION_LEVELS } from "@/lib/qr/types";
import type { ErrorCorrectionLevel } from "@/lib/qr/types";

interface QRSettingsProps {
  size: number;
  onSizeChange: (value: number) => void;
  foregroundColor: string;
  onForegroundColorChange: (value: string) => void;
  backgroundColor: string;
  onBackgroundColorChange: (value: string) => void;
  transparentBackground: boolean;
  onTransparentBackgroundChange: (value: boolean) => void;
  errorCorrectionLevel: ErrorCorrectionLevel;
  onErrorCorrectionLevelChange: (value: ErrorCorrectionLevel) => void;
  margin: number;
  onMarginChange: (value: number) => void;
}

export function QRSettings({
  size,
  onSizeChange,
  foregroundColor,
  onForegroundColorChange,
  backgroundColor,
  onBackgroundColorChange,
  transparentBackground,
  onTransparentBackgroundChange,
  errorCorrectionLevel,
  onErrorCorrectionLevelChange,
  margin,
  onMarginChange,
}: QRSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>QR Code Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Size */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="size-slider">QR Code Size</Label>
            <span className="text-sm text-muted-foreground">{size}px</span>
          </div>
          <Slider
            id="size-slider"
            min={100}
            max={800}
            step={50}
            value={[size]}
            onValueChange={(value) => onSizeChange(value[0])}
          />
        </div>

        {/* Foreground Color */}
        <div className="space-y-2">
          <Label htmlFor="fg-color">QR Code Color</Label>
          <div className="flex gap-2">
            <input
              id="fg-color"
              type="color"
              value={foregroundColor}
              onChange={(e) => onForegroundColorChange(e.target.value)}
              className="size-10 cursor-pointer rounded border"
            />
            <input
              type="text"
              value={foregroundColor}
              onChange={(e) => onForegroundColorChange(e.target.value)}
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="#000000"
            />
          </div>
        </div>

        {/* Background Color */}
        <div className="space-y-2">
          <Label htmlFor="bg-color">Background Color</Label>
          <div className="flex gap-2">
            <input
              id="bg-color"
              type="color"
              value={backgroundColor}
              onChange={(e) => onBackgroundColorChange(e.target.value)}
              className="size-10 cursor-pointer rounded border"
              disabled={transparentBackground}
            />
            <input
              type="text"
              value={backgroundColor}
              onChange={(e) => onBackgroundColorChange(e.target.value)}
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="#ffffff"
              disabled={transparentBackground}
            />
          </div>
        </div>

        {/* Transparent Background */}
        <div className="flex items-center justify-between rounded-lg border p-3">
          <Label htmlFor="transparent-bg" className="cursor-pointer">
            Transparent Background
          </Label>
          <Switch
            id="transparent-bg"
            checked={transparentBackground}
            onCheckedChange={onTransparentBackgroundChange}
          />
        </div>

        {/* Error Correction Level */}
        <div className="space-y-2">
          <Label htmlFor="error-correction">Error Correction Level</Label>
          <Select
            value={errorCorrectionLevel}
            onValueChange={(value) =>
              onErrorCorrectionLevelChange(value as ErrorCorrectionLevel)
            }
          >
            <SelectTrigger id="error-correction">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ERROR_CORRECTION_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{level.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {level.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Margin */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="margin-slider">Border Width</Label>
            <span className="text-sm text-muted-foreground">
              {margin} {margin === 1 ? "module" : "modules"}
            </span>
          </div>
          <Slider
            id="margin-slider"
            min={0}
            max={10}
            step={1}
            value={[margin]}
            onValueChange={(value) => onMarginChange(value[0])}
          />
        </div>
      </CardContent>
    </Card>
  );
}

