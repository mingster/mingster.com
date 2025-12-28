# mingster.backbone Integration Complete ✅

Successfully integrated the `mingster.backbone` shared package into `mingster.com/web`.

## 📦 What Was Done

### 1. Package Installation

Added `mingster.backbone` to `package.json`:

```json
{
  "dependencies": {
    "mingster.backbone": "file:../../packages/mingster.backbone"
  }
}
```

The package is installed as a **symlink** to the source directory, enabling:

- ✅ Real-time updates when backbone package changes
- ✅ No build step needed for development
- ✅ Full TypeScript type checking
- ✅ Direct source code access for debugging

### 2. TypeScript Configuration

Updated `tsconfig.json` with path mapping:

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

This enables:

- ✅ Autocomplete in IDEs
- ✅ Type checking
- ✅ Go-to-definition functionality
- ✅ Import resolution

### 3. Test Component

Created `src/components/test-backbone.tsx` demonstrating:

- ✅ Component imports (Button, Loader, DataTable, ThemeToggler)
- ✅ Hook imports (useTheme)
- ✅ Utility imports (cn, formatDateTime)
- ✅ Full type safety

### 4. Migration Documentation

Created comprehensive migration guide: `MIGRATION_TO_BACKBONE.md`

## 🎯 How to Use

### Import Components

```tsx
import { Button, DataTable, Loader } from "mingster.backbone";

export function MyComponent() {
  return (
    <div>
      <Button>Click me</Button>
      <Loader />
    </div>
  );
}
```

### Import Hooks

```tsx
import { useTheme, useIsMobile, useCart } from "mingster.backbone";

export function MyComponent() {
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();
  const { items, addItem } = useCart();
  
  return <div>Current theme: {theme}</div>;
}
```

### Import Utilities

```tsx
import { cn, formatDateTime, generateGuid } from "mingster.backbone";

const now = new Date();
const formatted = formatDateTime(now);
const id = generateGuid();
const classes = cn("text-lg", "font-bold", isActive && "text-red-500");
```

### Import UI Components

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  Card,
  CardContent,
  Table,
  Badge,
} from "mingster.backbone";
```

### Import Types

```tsx
import { type TwBankCode, TwBankCodes } from "mingster.backbone";

const banks: TwBankCode[] = TwBankCodes.filter(bank => 
  bank.Short.includes("銀行")
);
```

## 📊 Available Exports

### Components (100+)

- **DataTable Suite**: DataTable, DataTableCheckbox, DataTableDraggable, etc.
- **UI Components**: All shadcn/ui components (Button, Dialog, Card, etc.)
- **Utility Components**: Loader, NotMountSkeleton, Scheduled, ThemeToggler, etc.

### Hooks (11)

- useCaptcha, useCart, useGeoIP, useIsHydrated, useLang
- useIsMobile, useOrigin, useStore, useTheme
- useColorMode, useLocalStorage

### Utilities

- **DateTime**: formatDateTime, getNowTimeInTz, getUtcNow
- **Images**: resizeAndCropImage, imageToBase64
- **GUID**: generateGuid, isValidGuid
- **Chinese**: chineseUtils (various functions)
- **Geo IP**: geoIP utilities
- **Edge**: Edge runtime utilities
- **Server**: Server-side utilities

### Libraries

- **Analytics**: sendGAEvent, trackPageView, trackEvent
- **Business Hours**: Business hours management
- **Logging**: logger (Pino), clientLogger
- **Motion**: Framer Motion utilities
- **reCAPTCHA**: verifyRecaptcha
- **Taiwan Zip**: useTwZipCode2
- **Utils**: cn (class names merger)

### Providers

- ThemeProvider

### Types

- TwBankCode, TwBankCodes

## 🚀 Next Steps

See `MIGRATION_TO_BACKBONE.md` for detailed migration steps:

1. **Test Integration**: Use the test component to verify everything works
2. **Gradual Migration**: Start replacing local imports with backbone imports
3. **Delete Local Files**: Remove duplicated files after migration
4. **Verify Build**: Run `bun run build` to ensure everything compiles

## 📝 Import Patterns

### Main Package Import (Recommended)

```tsx
import { Button, useTheme, cn } from "mingster.backbone";
```

### Specific Module Import (For optimization)

```tsx
import { DataTable } from "mingster.backbone/datatable";
import { Button } from "mingster.backbone/ui/button";
import { cn } from "mingster.backbone/lib/utils";
```

## ⚠️ Important Notes

1. **i18n Not Included**: The package does NOT export i18n. Keep your `src/app/i18n/` directory.

2. **Source Symlink**: The package is symlinked to source, so changes in the backbone package are immediately available.

3. **Project-Specific Files**: Keep auth, Prisma, Stripe, and other project-specific files.

4. **Type Safety**: Full TypeScript support with all types exported.

## 🧪 Testing the Integration

To test the integration:

1. **Add test component to a page**:

   ```tsx
   // src/app/page.tsx or any page
   import { TestBackbone } from "@/components/test-backbone";
   
   export default function Page() {
     return <TestBackbone />;
   }
   ```

2. **Run development server**:

   ```bash
   bun run dev
   ```

3. **Visit the page**: Check that all components render correctly

4. **Check console**: Look for any import or type errors

## 📈 Benefits

- ✅ **Code Reuse**: Share components between mingster.com and mingster.com
- ✅ **Consistency**: Same UI/UX across projects
- ✅ **Maintainability**: Update once, benefit everywhere
- ✅ **Type Safety**: Full TypeScript support
- ✅ **Performance**: Tree-shakable exports
- ✅ **Developer Experience**: Autocomplete, go-to-definition, etc.

## 🔍 Verification

Run these commands to verify the integration:

```bash
# Check if package is installed
ls -la node_modules/mingster.backbone

# Check TypeScript paths
grep -A 3 "paths" tsconfig.json

# Test imports (will show compilation errors if any)
bun run build

# Run development server
bun run dev
```

## 📚 Resources

- **Package README**: `../../packages/mingster.backbone/README.md`
- **Migration Guide**: `./MIGRATION_TO_BACKBONE.md`
- **Build Documentation**: `../../packages/mingster.backbone/BUILD.md`
- **Export Reference**: Check `../../packages/mingster.backbone/src/index.ts`

---

**Integration completed on**: October 10, 2025  
**Package version**: 1.0.0  
**Status**: ✅ Ready for gradual migration
