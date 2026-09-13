# Server-Side Code Moved Back to Project

## Overview

To keep `mingster.backbone` as a **pure client-side package**, the following server-side utilities have been moved back to the `mingster.com/web` project:

---

## ❌ Removed from mingster.backbone

### 1. **`lib/logger.ts`** (Pino Logger)
**Why**: Uses `pino` which requires Node.js streams

**Moved to**: `mingster.com/web/src/lib/logger.ts`

**Usage**:
```typescript
import logger from "@/lib/logger"

export async function myServerAction() {
  "use server"
  logger.info("Processing request")
  // ...
}
```

---

### 2. **`utils/datetime-utils.ts`** (Date/Time Utilities)
**Why**: Depends on server-side logger

**Status**: Removed from `mingster.backbone` (was using logger)

**Recommendation**: Copy to your project's `utils/` folder and update imports

---

### 3. **`utils/geo-ip.ts`** (Geo IP Utilities)
**Why**: Depends on server-side logger and server-utils

**Status**: Removed from `mingster.backbone` (was using logger)

**Recommendation**: Copy to your project's `utils/` folder and update imports

---

### 4. **`hooks/use-geo-ip.tsx`** (Geo IP React Hook)
**Why**: Depends on `utils/geo-ip.ts`

**Status**: Removed from `mingster.backbone`

**Recommendation**: Copy to your project's `hooks/` folder if needed

---

## ✅ What Remains in mingster.backbone

**Client-Side Only Code**:
- ✅ All UI components (Button, Card, DataTable, etc.)
- ✅ All analytics components (PageViewTracker, TrackedButton, etc.)
- ✅ `clientLogger` - Browser-safe logging
- ✅ `analytics` - Google Analytics tracking
- ✅ All client-side hooks (useTheme, useIsMobile, etc.)
- ✅ Client-safe utilities (chinese-utils, guid-utils, etc.)
- ✅ All providers (ThemeProvider, etc.)

**Server-Side Code (Import Directly)**:
- 📝 `verifyRecaptcha` - reCAPTCHA verification (import directly if needed)
  ```typescript
  import { verifyRecaptcha } from "mingster.backbone/lib/recaptcha-verify"
  ```

---

## 📋 Migration Steps

### Step 1: Update Imports in Your Project

**Before** (using mingster.backbone):
```typescript
import { getGeoLocation } from "mingster.backbone"
import { formatDateTime } from "mingster.backbone"
```

**After** (using local utils):
```typescript
import { getGeoLocation } from "@/utils/geo-ip"
import { formatDateTime } from "@/utils/datetime-utils"
```

---

### Step 2: Copy Files if Needed

If your project used these utilities, copy them from `mingster.backbone` git history:

```bash
# From mingster.backbone git history
git show HEAD~1:src/utils/datetime-utils.ts > mingster.com/web/src/utils/datetime-utils.ts
git show HEAD~1:src/utils/geo-ip.ts > mingster.com/web/src/utils/geo-ip.ts
git show HEAD~1:src/hooks/use-geo-ip.tsx > mingster.com/web/src/hooks/use-geo-ip.tsx
```

---

### Step 3: Update Logger Imports

**Old logger** (in `mingster.com/web/src/utils/logger.ts`):
```typescript
import pino, { type Logger } from "pino"

const logger: Logger = isProduction
  ? pino({ level: "warn" })
  : pino({ transport: { target: "pino-pretty" }, level: "debug" })
```

**New logger** (moved from mingster.backbone):
```typescript
import logger from "@/lib/logger"

// Full-featured logger with:
// - BigInt/Decimal transformation
// - Database logging support
// - Child logger functionality
// - Structured logging
```

---

## 🎯 Why This Change?

### Problem
- **Server-side code** (`logger`, `datetime-utils`, `geo-ip`) was causing build errors when bundled for client
- Webpack couldn't handle Node.js-only modules (`pino`, `fs`, etc.)
- Made the shared package less portable and harder to maintain

### Solution
- **Moved server-only code back to project**
- **Kept shared package purely client-side**
- **Clear separation** between client and server code

### Benefits
- ✅ Clean client bundles (smaller, faster)
- ✅ No build errors
- ✅ Shared package works in any Next.js/React project
- ✅ Proper separation of concerns
- ✅ Type safety for both client and server

---

## 🔧 Build Status

**Before Move**:
- ❌ Build errors: `Can't resolve 'fs'`, `node:crypto not handled`
- ❌ Server-side code mixed with client-side

**After Move**:
- ✅ TypeScript: 0 errors
- ✅ Build: Success
- ✅ Client/Server properly separated
- ✅ Package is portable and reusable

---

## 📚 Related Documentation

- **`SERVER_SIDE_CODE_SEPARATION.md`** - Complete guide on server-side code handling
- **`COMPONENT_MIGRATION_SUMMARY.md`** - Component migration history
- **`ANALYTICS_MIGRATION_SUMMARY.md`** - Analytics migration guide

