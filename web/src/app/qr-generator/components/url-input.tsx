"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";
import { isValidURL } from "@/lib/qr/generator";

interface URLInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function URLInput({ value, onChange }: URLInputProps) {
  const isValid = value === "" || isValidURL(value);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="url-input">URL Address</Label>
        <Input
          id="url-input"
          type="url"
          placeholder="https://example.com"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={!isValid ? "border-destructive" : ""}
        />
      </div>

      {value && (
        <Alert variant={isValid ? "default" : "destructive"}>
          <div className="flex items-start gap-2">
            {isValid ? (
              <IconCheck className="size-4 text-green-600" />
            ) : (
              <IconAlertCircle className="size-4" />
            )}
            <AlertDescription>
              {isValid
                ? "Valid URL format"
                : "Please enter a valid URL (must start with http:// or https://)"}
            </AlertDescription>
          </div>
        </Alert>
      )}
    </div>
  );
}

