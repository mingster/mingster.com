# Migration Status: mingster.com/web → mingster.backbone

## 📊 Current State

### Integration Complete ✅

- [x] Package installed: `mingster.backbone@file:../../packages/mingster.backbone`
- [x] TypeScript paths configured
- [x] Test component created
- [x] Documentation created

### Migration Statistics

Found **139 total import statements** that can be migrated to mingster.backbone:

| Category | Count | Examples |
|----------|-------|----------|
| UI Components | 92 | `@/components/ui/button`, `@/components/ui/dialog` |
| Utils (`cn`) | 40 | `@/lib/utils` |
| Hooks | 7 | `@/hooks/use-theme`, `@/hooks/use-mobile` |

### Files Status

#### ✅ Can Delete After Migration (80+ files)

These files are duplicates of mingster.backbone and can be safely deleted:

**Components:**
- `src/components/dataTable*.tsx` (6 files)
- `src/components/loader.tsx`
- `src/components/not-mount-skeleton.tsx`
- `src/components/scheduled.tsx`
- `src/components/sidebar-toggle.tsx`
- `src/components/theme-toggler.tsx`
- `src/components/Toaster.tsx`
- `src/components/tw-bankcode-combobox.tsx`
- `src/components/ui/*` (50+ files - all shadcn/ui components)

**Hooks:**
- `src/hooks/use-*.{ts,tsx}` (11 files)
- `src/hooks/useColorMode.tsx`
- `src/hooks/useLocalStorage.tsx`

**Utils:**
- `src/utils/chinese-utils.ts`
- `src/utils/datetime-utils.ts`
- `src/utils/edge-utils.ts`
- `src/utils/geo-ip.ts`
- `src/utils/guid-utils.ts`
- `src/utils/image-utils.ts`
- `src/utils/server-utils.ts`

**Libraries:**
- `src/lib/analytics.ts`
- `src/lib/businessHours/`
- `src/lib/client-logger.ts`
- `src/lib/logger.ts`
- `src/lib/motion.ts`
- `src/lib/recaptcha-verify.ts`
- `src/lib/use-scroll-direction.ts`
- `src/lib/useTwZipCode2/`
- `src/lib/utils.ts`

**Providers:**
- `src/providers/theme-provider.tsx`

**Types:**
- `src/types/bank3.ts`

#### ⚠️ Keep - Project Specific

These files are specific to mingster.com and should NOT be deleted:

**Auth:**
- `src/lib/auth.ts`
- `src/lib/auth-client.ts`
- `src/components/auth/*`
- `src/providers/auth-provider.tsx`
- `src/providers/session-provider.tsx`

**Database:**
- `src/lib/prismadb.ts`
- All files in `src/actions/`

**Integrations:**
- `src/lib/stripe/`
- `src/lib/crypto_util.ts` (if different from backbone)
- `src/providers/socket-provider.tsx`

**i18n:**
- `src/app/i18n/` (entire directory)
- `src/providers/i18n-provider.tsx`

**UI Components:**
- `src/components/editor/` (MD Editor)
- `src/components/auth/` (Auth forms)
- `src/components/analytics/` (Analytics components)
- `src/components/modals/` (Custom modals)
- `src/components/global-navbar.tsx`
- `src/components/logo.tsx`
- And other project-specific components

**Utils:**
- `src/utils/actions/` (Server actions)
- `src/utils/error.ts`
- `src/utils/isAdmin.ts`
- `src/utils/logger.ts` (if customized)

**Types:**
- `src/types/enum.ts`

## 🎯 Recommended Migration Approach

### Phase 1: Non-Breaking Changes (Safe)

**Goal**: Migrate imports without deleting files

1. **Create a migration script** (recommended):
   ```bash
   # Create a backup first
   git checkout -b migrate-to-backbone
   
   # Update all UI component imports
   find ./src -type f \( -name "*.tsx" -o -name "*.ts" \) \
     -exec sed -i '' 's|from "@/components/ui/\([^"]*\)"|from "mingster.backbone"|g' {} +
   
   # Update utils imports
   find ./src -type f \( -name "*.tsx" -o -name "*.ts" \) \
     -exec sed -i '' 's|from "@/lib/utils"|from "mingster.backbone"|g' {} +
   
   # Test build
   bun run build
   ```

2. **Manual import updates** (safer):
   - Start with one file at a time
   - Update imports
   - Test the page
   - Commit changes

### Phase 2: File Cleanup (After Phase 1 works)

1. **Delete duplicated files**:
   ```bash
   # Only after Phase 1 is tested and working!
   rm src/components/dataTable*.tsx
   rm src/components/loader.tsx
   rm src/components/not-mount-skeleton.tsx
   # ... etc (see list above)
   ```

2. **Test thoroughly**:
   ```bash
   bun run build
   bun run dev
   # Test all pages manually
   ```

### Phase 3: Optimize (Optional)

1. **Use granular imports** for better tree-shaking:
   ```tsx
   // Before
   import { Button, Dialog } from "mingster.backbone";
   
   // After (optional optimization)
   import { Button } from "mingster.backbone/ui/button";
   import { Dialog } from "mingster.backbone/ui/dialog";
   ```

## 📝 Import Replacement Guide

### UI Components

```tsx
// Before
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";

// After
import { Button, Dialog, DialogContent, Card } from "mingster.backbone";
```

### Utilities

```tsx
// Before
import { cn } from "@/lib/utils";

// After
import { cn } from "mingster.backbone";
```

### Hooks

```tsx
// Before
import { useTheme } from "@/hooks/use-theme";
import { useIsMobile } from "@/hooks/use-mobile";

// After
import { useTheme, useIsMobile } from "mingster.backbone";
```

### DataTable

```tsx
// Before
import { DataTable } from "@/components/dataTable";
import { DataTableColumnHeader } from "@/components/dataTable-column-header";

// After
import { DataTable, DataTableColumnHeader } from "mingster.backbone";
```

## 🧪 Testing Checklist

Before deploying to production:

- [ ] All pages load without errors
- [ ] All forms work correctly
- [ ] Theme switching works
- [ ] Responsive design works (mobile/desktop)
- [ ] DataTables render and function
- [ ] Dialogs/modals open and close
- [ ] Authentication flows work
- [ ] Admin pages accessible
- [ ] No console errors
- [ ] Build completes successfully
- [ ] No TypeScript errors

## 🚨 Rollback Plan

If something goes wrong:

```bash
# Restore from git
git checkout main
git branch -D migrate-to-backbone

# Or restore specific files
git restore src/components/ui/
git restore src/lib/utils.ts
git restore src/hooks/
```

## 📊 Migration Progress

### Phase 1: Import Updates
- [ ] Update all `@/components/ui/*` imports → `mingster.backbone`
- [ ] Update all `@/lib/utils` imports → `mingster.backbone`
- [ ] Update all `@/hooks/use-*` imports → `mingster.backbone`
- [ ] Test build
- [ ] Test dev server
- [ ] Manual testing of key pages

### Phase 2: File Cleanup
- [ ] Delete `src/components/ui/` directory
- [ ] Delete `src/components/dataTable*.tsx` files
- [ ] Delete utility component files
- [ ] Delete `src/hooks/use-*.tsx` files
- [ ] Delete `src/utils/` utility files (keep project-specific)
- [ ] Delete `src/lib/` library files (keep project-specific)
- [ ] Delete `src/providers/theme-provider.tsx`
- [ ] Delete `src/types/bank3.ts`
- [ ] Test build again
- [ ] Full regression testing

### Phase 3: Optimization (Optional)
- [ ] Consider using granular imports
- [ ] Review and remove unused peer dependencies
- [ ] Update documentation
- [ ] Update team

## 📈 Expected Benefits

After migration:
- **~15,000 lines of code** removed
- **~80 files** deleted
- **Shared maintenance** with mingster.com
- **Consistent UI/UX** across projects
- **Faster development** (reuse components)
- **Better type safety** (centralized types)

## ⏱️ Estimated Time

- **Phase 1** (Import updates): 30-60 minutes (can be automated)
- **Testing Phase 1**: 1-2 hours (manual testing)
- **Phase 2** (File cleanup): 15 minutes
- **Testing Phase 2**: 1-2 hours (full regression)
- **Total**: 3-5 hours

## 🎯 Quick Start

To start migration immediately:

```bash
# 1. Create migration branch
git checkout -b migrate-to-backbone

# 2. Test current state
bun run build

# 3. Update a single file manually first (test)
# Edit any component file, change imports to mingster.backbone

# 4. If test works, use automated script for bulk updates
# (See Phase 1 commands above)

# 5. Test thoroughly
bun run dev
# Visit all major pages and test functionality

# 6. If all works, proceed to Phase 2 (delete files)
# If issues, rollback and debug
```

## 📞 Support

- **Documentation**: See `BACKBONE_INTEGRATION.md` and `MIGRATION_TO_BACKBONE.md`
- **Package README**: `../../packages/mingster.backbone/README.md`
- **Export Reference**: `../../packages/mingster.backbone/src/index.ts`

---

**Status**: Ready for migration  
**Risk Level**: Low (imports can be easily reverted)  
**Recommended**: Start with Phase 1, test thoroughly before Phase 2

