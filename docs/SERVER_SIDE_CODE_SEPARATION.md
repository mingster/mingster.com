# Server-Side Code Separation

## Overview

During the migration to `mingster.backbone`, we encountered build errors related to **Node.js-only modules** being bundled into client-side JavaScript. These have been properly separated.

---

## ❌ Server-Only Code (Not Exported from Main Package)

The following utilities are **NOT exported** from the main `mingster.backbone` entry point because they use Node.js-only APIs:

### 1. `logger` (Pino Logger)
**Why**: Uses `pino` which requires Node.js streams

**Import directly for server-side use:**
```typescript
import logger from "mingster.backbone/lib/logger"

// Server action example:
export async function myServerAction() {
  "use server"
  logger.info("Processing request")
  // ...
}
```

**Client-side alternative:**
```typescript
import { clientLogger } from "mingster.backbone"

function MyComponent() {
  clientLogger.info("User action")
}
```

---

### 2. `verifyRecaptcha` (Google reCAPTCHA Verification)
**Why**: Uses `@google-cloud/recaptcha-enterprise` which requires gRPC and Node.js `fs` module

**Import directly for server-side use:**
```typescript
import { verifyRecaptcha } from "mingster.backbone/lib/recaptcha-verify"

// Server action example:
export async function submitForm(formData: FormData) {
  "use server"
  
  const token = formData.get("recaptcha-token") as string
  const result = await verifyRecaptcha({ token })
  
  if (!result.success) {
    return { error: "Verification failed" }
  }
  
  return { success: true }
}
```

---

### 3. `image-utils` (Cloudinary Integration)
**Why**: Uses `node:crypto` for generating Cloudinary upload signatures

**Import directly for server-side use:**
```typescript
import { uploadToCloudinary, deleteFromCloudinary } from "mingster.backbone/utils/image-utils"

// Server action example:
export async function uploadImage(formData: FormData) {
  "use server"
  
  const file = formData.get("image") as File
  const result = await uploadToCloudinary(file, "profile-images")
  
  return result
}
```

**Note**: `resizeAndCropImage` can work client-side, but the file also contains server-only functions, so the entire module is excluded.

---

## ✅ Client-Side Alternatives

Use these instead for client-side code:

### Logging
```typescript
import { clientLogger } from "mingster.backbone"

// Works in client components:
clientLogger.info("User action", { userId: "123" })
clientLogger.error("Something went wrong", { error: err })
```

### Analytics (Client-Side Tracking)
```typescript
import { analytics } from "mingster.backbone"

// All analytics functions work client-side:
analytics.trackVideoPlay("Video Title", "video-123")
analytics.trackCustomEvent("my_event", { param: "value" })
```

---

## 📋 Import Patterns

### ✅ Correct: Client Components
```typescript
// client-component.tsx
"use client"

import { Button, analytics, clientLogger } from "mingster.backbone"

export function MyButton() {
  const handleClick = () => {
    analytics.trackCustomEvent("button_click")
    clientLogger.info("Button clicked")
  }
  
  return <Button onClick={handleClick}>Click Me</Button>
}
```

### ✅ Correct: Server Components/Actions
```typescript
// server-action.ts
"use server"

import logger from "mingster.backbone/lib/logger"
import { verifyRecaptcha } from "mingster.backbone/lib/recaptcha-verify"
import { uploadToCloudinary } from "mingster.backbone/utils/image-utils"

export async function submitContactForm(formData: FormData) {
  logger.info("Form submission started")
  
  const token = formData.get("recaptcha") as string
  const result = await verifyRecaptcha({ token })
  
  if (!result.success) {
    logger.warn("reCAPTCHA failed", { score: result.score })
    return { error: "Verification failed" }
  }
  
  logger.info("Form submitted successfully")
  return { success: true }
}
```

### ❌ Incorrect: Don't Do This
```typescript
// ❌ Don't import server-only code in client components
"use client"

import logger from "mingster.backbone/lib/logger" // ERROR!
import { verifyRecaptcha } from "mingster.backbone/lib/recaptcha-verify" // ERROR!
```

---

## 🎯 Summary

**Excluded from Main Export (use direct imports)**:
1. ❌ `logger` - Server-side Pino logger (uses Node.js streams)
2. ❌ `verifyRecaptcha` - reCAPTCHA verification (uses gRPC)
3. ❌ `image-utils` - Cloudinary utilities (uses `node:crypto`)

**Available in Main Export**:
- ✅ All UI components (Button, Card, etc.)
- ✅ All analytics components (PageViewTracker, TrackedButton, etc.)
- ✅ `clientLogger` - Browser-safe logging
- ✅ `analytics` - Google Analytics tracking
- ✅ All hooks, utilities, and providers

---

## 🔧 Why This Matters

Next.js 15 App Router uses **webpack for client bundles** and **Node.js for server**. When server-only code (like `pino`, `@google-cloud/recaptcha-enterprise`, or `node:crypto`) is imported in client components:

1. Webpack tries to bundle it for the browser
2. It fails because these Node.js APIs don't exist in browsers
3. Build fails with errors like:
   - `Module not found: Can't resolve 'fs'`
   - `UnhandledSchemeError: Reading from "node:crypto" is not handled`

By **separating server-only code**, we ensure:
- ✅ Clean client bundles (smaller, faster)
- ✅ No build errors
- ✅ Proper separation of concerns
- ✅ Type safety for both client and server code

