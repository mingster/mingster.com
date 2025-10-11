# Dependency Cleanup Analysis

## Context

After migrating to `mingster.backbone`, we need to identify dependencies that:

1. Are no longer directly used in mingster.com code
2. Are NOT peer dependencies of mingster.backbone (those must stay)
3. Were only used by deleted components

## Analysis Results

### ⚠️ Important: Peer Dependencies Must Stay

**ALL peer dependencies of mingster.backbone MUST remain in mingster.com's package.json.**

Peer dependencies are intentionally NOT bundled with the package - they're expected to be provided by the consuming project. These include:

- All `@radix-ui/*` packages
- `@tanstack/react-table`
- `@dnd-kit/*` packages  
- `react-spinners`
- `next-themes`
- `lucide-react`
- And ~70+ more packages

### ✅ Dependencies That Can Be Safely Removed

These dependencies are:

1. NOT directly imported in remaining mingster.com code
2. NOT peer dependencies of mingster.backbone
3. Only used by code that was moved to backbone

#### 1. `clsx` (^2.1.1)

- **Status in backbone**: devDependency (bundled)
- **Used in mingster.com**: 0 direct imports
- **Used for**: Class name utilities (now in backbone's `cn` function)
- **Action**: ✅ Can remove

#### 2. `tailwind-merge` (^3.3.1)

- **Status in backbone**: devDependency (bundled)
- **Used in mingster.com**: 0 direct imports  
- **Used for**: Tailwind class merging (now in backbone's `cn` function)
- **Action**: ✅ Can remove

#### 3. `class-variance-authority` (^0.7.1)

- **Status in backbone**: devDependency (bundled)
- **Used in mingster.com**: 0 direct imports
- **Used for**: Component variants (now in UI components in backbone)
- **Action**: ✅ Can remove

### ❌ Dependencies That CANNOT Be Removed

All other dependencies fall into these categories:

1. **Peer Dependencies of backbone** (~70+ packages)
   - Required by mingster.backbone
   - Must be installed in consuming project
   - Examples: All @radix-ui/*, @tanstack/react-table, next-themes, lucide-react, etc.

2. **Project-Specific Dependencies**
   - Used directly in mingster.com code
   - Examples: better-auth, stripe, prisma, nodemailer, etc.

3. **Build & Dev Dependencies**
   - Required for development and building
   - Examples: TypeScript, ESLint, Biome, etc.

## Recommendation

Remove these 3 dependencies that are confirmed unused:

```bash
bun remove clsx tailwind-merge class-variance-authority
```

This will:

- Remove 3 unused dependencies
- Reduce package.json size
- Slightly reduce node_modules size
- No impact on functionality (these are bundled in backbone)

## Verification

After removal:

1. TypeScript should still compile (0 errors)
2. Build should still work
3. No runtime errors (these utilities are provided by backbone)

---

**Summary**: 3 dependencies can be safely removed, all others must stay.
