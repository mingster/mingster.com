# Migration Guide: mingster.com/web → mingster.backbone

This guide helps migrate mingster.com/web to use the shared `mingster.backbone` package.

## ✅ Setup Complete

- [x] Package added to `package.json`
- [x] TypeScript paths configured
- [x] Dependencies installed

## 📦 Installation

The package is installed at:
```
file:../../packages/mingster.backbone
```

## 🔄 Files to Migrate

### DataTable Components (Can be removed)

| Current File | Replace With | Action |
|-------------|-------------|--------|
| `src/components/dataTable.tsx` | `import { DataTable } from "mingster.backbone"` | ✅ Delete |
| `src/components/dataTable-checkbox.tsx` | `import { DataTableCheckbox } from "mingster.backbone"` | ✅ Delete |
| `src/components/datatable-draggable.tsx` | `import { DataTableDraggable } from "mingster.backbone"` | ✅ Delete |
| `src/components/dataTable-column-header.tsx` | `import { DataTableColumnHeader } from "mingster.backbone"` | ✅ Delete |
| `src/components/dataTable-view-options.tsx` | `import { DataTableViewOptions } from "mingster.backbone"` | ✅ Delete |
| `src/components/dataTable-pagination.tsx` | `import { DataTablePagination } from "mingster.backbone"` | ✅ Delete |

### Utility Components (Can be removed)

| Current File | Replace With | Action |
|-------------|-------------|--------|
| `src/components/loader.tsx` | `import { Loader } from "mingster.backbone"` | ✅ Delete |
| `src/components/not-mount-skeleton.tsx` | `import { NotMountSkeleton } from "mingster.backbone"` | ✅ Delete |
| `src/components/scheduled.tsx` | `import { default as Scheduled } from "mingster.backbone"` | ✅ Delete |
| `src/components/sidebar-toggle.tsx` | `import { SidebarToggle } from "mingster.backbone"` | ✅ Delete |
| `src/components/theme-toggler.tsx` | `import { default as ThemeToggler } from "mingster.backbone"` | ✅ Delete |
| `src/components/Toaster.tsx` | `import { toaster, toastSuccess, toastError } from "mingster.backbone"` | ✅ Delete |
| `src/components/tw-bankcode-combobox.tsx` | `import { TwBankCodeCombobox } from "mingster.backbone"` | ✅ Delete |

### Hooks (Can be removed)

| Current File | Replace With | Action |
|-------------|-------------|--------|
| `src/hooks/use-captcha.tsx` | `import { useCaptcha } from "mingster.backbone"` | ✅ Delete |
| `src/hooks/use-cart.tsx` | `import { useCart } from "mingster.backbone"` | ✅ Delete |
| `src/hooks/use-geo-ip.tsx` | `import { useGeoIP } from "mingster.backbone"` | ✅ Delete |
| `src/hooks/use-hydrated.ts` | `import { useIsHydrated } from "mingster.backbone"` | ✅ Delete |
| `src/hooks/use-lang.ts` | `import { useLang } from "mingster.backbone"` | ✅ Delete |
| `src/hooks/use-mobile.ts` | `import { useIsMobile } from "mingster.backbone"` | ✅ Delete |
| `src/hooks/use-origin.tsx` | `import { default as useOrigin } from "mingster.backbone"` | ✅ Delete |
| `src/hooks/use-store.ts` | `import { useStore } from "mingster.backbone"` | ✅ Delete |
| `src/hooks/use-theme.ts` | `import { useTheme } from "mingster.backbone"` | ✅ Delete |
| `src/hooks/useColorMode.tsx` | `import { default as useColorMode } from "mingster.backbone"` | ✅ Delete |
| `src/hooks/useLocalStorage.tsx` | `import { default as useLocalStorage } from "mingster.backbone"` | ✅ Delete |

### Utils (Can be removed)

| Current File | Replace With | Action |
|-------------|-------------|--------|
| `src/utils/chinese-utils.ts` | `import { ... } from "mingster.backbone"` | ✅ Delete |
| `src/utils/datetime-utils.ts` | `import { formatDateTime, ... } from "mingster.backbone"` | ✅ Delete |
| `src/utils/edge-utils.ts` | `import { ... } from "mingster.backbone"` | ✅ Delete |
| `src/utils/geo-ip.ts` | `import { ... } from "mingster.backbone"` | ✅ Delete |
| `src/utils/guid-utils.ts` | `import { generateGuid, ... } from "mingster.backbone"` | ✅ Delete |
| `src/utils/image-utils.ts` | `import { resizeAndCropImage, ... } from "mingster.backbone"` | ✅ Delete |
| `src/utils/server-utils.ts` | `import { ... } from "mingster.backbone"` | ✅ Delete |

### Libraries (Can be removed)

| Current File | Replace With | Action |
|-------------|-------------|--------|
| `src/lib/analytics.ts` | `import { sendGAEvent, ... } from "mingster.backbone"` | ✅ Delete |
| `src/lib/businessHours/` | `import { ... } from "mingster.backbone/lib/businessHours"` | ✅ Delete |
| `src/lib/client-logger.ts` | `import { clientLogger } from "mingster.backbone"` | ✅ Delete |
| `src/lib/logger.ts` | `import { default as logger } from "mingster.backbone"` | ✅ Delete |
| `src/lib/motion.ts` | `import { ... } from "mingster.backbone"` | ✅ Delete |
| `src/lib/recaptcha-verify.ts` | `import { verifyRecaptcha } from "mingster.backbone"` | ✅ Delete |
| `src/lib/use-scroll-direction.ts` | `import { useScrollDirection } from "mingster.backbone"` | ✅ Delete |
| `src/lib/useTwZipCode2/` | `import { ... } from "mingster.backbone/lib/useTwZipCode2"` | ✅ Delete |
| `src/lib/utils.ts` | `import { cn } from "mingster.backbone"` | ✅ Delete |

### Providers (Can be removed)

| Current File | Replace With | Action |
|-------------|-------------|--------|
| `src/providers/theme-provider.tsx` | `import { default as ThemeProvider } from "mingster.backbone"` | ✅ Delete |

### Types (Can be removed)

| Current File | Replace With | Action |
|-------------|-------------|--------|
| `src/types/bank3.ts` | `import { type TwBankCode, TwBankCodes } from "mingster.backbone"` | ✅ Delete |

### UI Components (All shadcn/ui - Can be removed)

All files in `src/components/ui/` can be deleted and imported from mingster.backbone instead.

Example:
```tsx
// Before
import { Button } from "@/components/ui/button"

// After  
import { Button } from "mingster.backbone"
```

## 🚫 Files to Keep (Project-Specific)

These files are specific to mingster.com and should NOT be deleted:

- `src/lib/auth.ts`, `src/lib/auth-client.ts` - Better Auth configuration
- `src/lib/prismadb.ts` - Prisma client
- `src/lib/stripe/` - Stripe integration
- `src/lib/crypto_util.ts` - Project-specific crypto
- `src/app/i18n/` - Project-specific i18n with locale files
- `src/providers/i18n-provider.tsx` - Project-specific i18n provider
- `src/providers/auth-provider.tsx` - Better Auth provider
- `src/providers/session-provider.tsx` - Session provider
- `src/providers/socket-provider.tsx` - Socket.io provider
- `src/components/auth/` - Auth components
- `src/components/editor/` - MD Editor
- `src/utils/actions/` - Server actions utilities
- `src/utils/error.ts` - Error handling
- `src/utils/isAdmin.ts` - Admin checks
- `src/utils/logger.ts` - Logger wrapper (if customized)
- `src/types/enum.ts` - Project enums
- All files in `src/actions/` - Server actions

## 📝 Migration Steps

### Step 1: Update a Single Component (Test)

Pick one simple component to test:

```tsx
// src/components/test-backbone.tsx
import { Button, Loader } from "mingster.backbone";

export function TestBackbone() {
  return (
    <div>
      <Button>Test Button from Backbone</Button>
      <Loader />
    </div>
  );
}
```

### Step 2: Gradually Replace Imports

Use find-and-replace to update imports:

```bash
# Example: Replace Button imports
find ./src -type f -name "*.tsx" -exec sed -i '' 's|from "@/components/ui/button"|from "mingster.backbone"|g' {} +
```

### Step 3: Delete Local Files

After verifying imports work, delete the local copies:

```bash
# Delete DataTable components
rm src/components/dataTable*.tsx

# Delete utility components  
rm src/components/loader.tsx
rm src/components/not-mount-skeleton.tsx
rm src/components/scheduled.tsx
rm src/components/sidebar-toggle.tsx
rm src/components/theme-toggler.tsx
rm src/components/Toaster.tsx
rm src/components/tw-bankcode-combobox.tsx

# Delete hooks
rm -rf src/hooks/use-*.{ts,tsx}
rm -rf src/hooks/useColorMode.tsx
rm -rf src/hooks/useLocalStorage.tsx

# Delete UI components (careful - check for customizations first!)
# rm -rf src/components/ui/

# Delete utils (except project-specific ones)
rm src/utils/chinese-utils.ts
rm src/utils/datetime-utils.ts
rm src/utils/edge-utils.ts
rm src/utils/geo-ip.ts
rm src/utils/guid-utils.ts
rm src/utils/image-utils.ts
rm src/utils/server-utils.ts

# Delete lib files (except project-specific ones)
rm src/lib/analytics.ts
rm src/lib/client-logger.ts
rm src/lib/logger.ts
rm src/lib/motion.ts
rm src/lib/recaptcha-verify.ts
rm src/lib/use-scroll-direction.ts
rm src/lib/utils.ts
rm -rf src/lib/businessHours
rm -rf src/lib/useTwZipCode2

# Delete providers (except project-specific ones)
rm src/providers/theme-provider.tsx

# Delete types
rm src/types/bank3.ts
```

### Step 4: Test Build

```bash
cd /Users/mtsai/projects/mingster.com/web
bun run build
```

### Step 5: Update package.json (Optional Dependencies Cleanup)

After migration, you may be able to remove some peer dependencies that are now provided by mingster.backbone.

## 🎯 Import Patterns

### Main Package Import
```tsx
import { 
  Button, 
  DataTable, 
  useTheme, 
  cn,
  formatDateTime 
} from "mingster.backbone";
```

### Specific Imports
```tsx
import { DataTable } from "mingster.backbone/datatable";
import { Button } from "mingster.backbone/ui/button";
import { cn } from "mingster.backbone/lib/utils";
```

## ⚠️ Important Notes

1. **i18n Not Exported**: The mingster.backbone package does NOT export i18n functionality. Keep your project's `src/app/i18n/` directory.

2. **Check for Customizations**: Before deleting files, check if you've made project-specific customizations.

3. **Test Thoroughly**: Test each page after migration to ensure all imports work correctly.

4. **Type Safety**: The package is fully typed, so TypeScript will catch most import issues.

## 🐛 Troubleshooting

### "Cannot find module 'mingster.backbone'"

Check `tsconfig.json` paths configuration:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "mingster.backbone": ["../../packages/mingster.backbone/src"]
    }
  }
}
```

### "Module has no exported member"

Make sure you're using the correct export name. Check the backbone package's `src/index.ts` for available exports.

### Build fails after deleting files

Restore the deleted files temporarily and check for:
1. Custom modifications
2. Project-specific functionality
3. Missing imports

## 📊 Estimated Impact

- **Files to Delete**: ~80 files
- **Lines of Code Reduced**: ~15,000 LOC
- **Dependencies Consolidated**: Shared with riben.life
- **Maintenance**: Centralized in mingster.backbone

## ✅ Verification Checklist

- [ ] Package installed successfully
- [ ] TypeScript paths configured
- [ ] Test component works
- [ ] All imports updated
- [ ] Build succeeds
- [ ] Tests pass
- [ ] Development server works
- [ ] Production build works

---

**Ready to migrate!** Start with Step 1 and gradually migrate components.

