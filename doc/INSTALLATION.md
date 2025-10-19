# Installation Guide

This guide covers setting up and initializing the mingster.com database.

## Prerequisites

1. **Database Setup**
   - PostgreSQL database configured
   - Environment variables set in `.env`:
     - `POSTGRES_PRISMA_URL` or `DATABASE_URL`
     - `PRISMA_DATABASE_URL` (for schema)

2. **Dependencies Installed**

   ```bash
   bun install
   ```

3. **Database Schema Applied**

   ```bash
   bun run sql:dbpush
   ```

## Database Initialization

### Step 1: Check Installation Status

```bash
bun run install:check
```

This will show:

- Number of countries in database
- Number of currencies in database
- Number of locales in database
- Platform settings status
- Stripe configuration status

### Step 2: Populate Default Data

```bash
bun run install:data
```

This will automatically populate:

- **Countries** (ISO 3166 country codes)
- **Currencies** (ISO 4217 currency codes)
- **Locales** (Supported languages)

The script is smart and will only populate missing data, so it's safe to run multiple times.

### Step 3: Verify Installation

```bash
bun run install:check
```

You should see:

```
✓ Countries:        249 records
✓ Currencies:       177 records
✓ Locales:          X records
✓ Platform Settings: Configured

✅ Installation is complete!
```

## Advanced Options

### Wipeout and Reinstall

⚠️ **WARNING:** This will delete all countries, currencies, and locales!

```bash
bun run install:wipeout
```

Use this when:

- You need to update the default data files
- Something went wrong during installation
- You want a clean slate

### Manual Installation

If you need more control, you can import the functions directly:

```typescript
import { populateCountryData } from "@/actions/admin/populate-country-data";
import { populateCurrencyData } from "@/actions/admin/populate-currency-data";
import { create_locales } from "@/actions/admin/populate-payship_defaults";

// Then call them as needed
await populateCountryData();
await populateCurrencyData();
await create_locales();
```

## Data Files

Default data is stored in `public/install/`:

- `country_iso.json` - Country data (ISO 3166)
- `currency_iso.json` - Currency data (ISO 4217)
- `locales.json` - Locale definitions
- `payment_methods.json` - Payment methods (future use)
- `shipping_methods.json` - Shipping methods (future use)

### Updating Default Data

1. Edit the JSON files in `public/install/`
2. Run wipeout and reinstall:

   ```bash
   bun run install:wipeout
   ```

## Platform Settings

Platform settings (Stripe configuration, etc.) are managed separately through:

- Admin panel (when implemented)
- Direct database access
- Environment variables

## Troubleshooting

### "Too many connections" Error

If you encounter database connection errors:

```bash
bun run db:close-connections
```

Then restart your development server.

### Installation Script Fails

1. Check database connection:

   ```bash
   bun x prisma db pull
   ```

2. Verify environment variables are set correctly

3. Check database user permissions

4. View detailed error messages in console

### Data Already Exists

The installation script will skip existing data. To force reinstall:

```bash
bun run install:wipeout
```

### Migration Issues

If Prisma migrations fail:

```bash
# Reset database (⚠️ destructive)
bun x prisma migrate reset

# Then reinstall data
bun run install:data
```

## Development Workflow

### Initial Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd web

# 2. Install dependencies
bun install

# 3. Setup environment
cp .env.example .env
# Edit .env with your database credentials

# 4. Apply database schema
bun run sql:dbpush

# 5. Populate default data
bun run install:data

# 6. Start development server
bun run dev
```

### After Schema Changes

```bash
# 1. Update Prisma schema
edit prisma/schema.prisma

# 2. Push changes to database
bun run sql:dbpush

# 3. Check if data needs updating
bun run install:check

# 4. Update data if needed
bun run install:data
```

## Production Deployment

### Database Setup

1. **Apply Migrations**

   ```bash
   bun x prisma migrate deploy
   ```

2. **Populate Default Data**

   ```bash
   bun run install:data
   ```

3. **Verify Installation**

   ```bash
   bun run install:check
   ```

### Environment Variables

Ensure these are set in production:

- `DATABASE_URL` - PostgreSQL connection string
- `POSTGRES_PRISMA_URL` - Prisma-specific URL (if different)
- `STRIPE_SECRET_KEY` - Stripe API key
- `STRIPE_PUBLISHABLE_KEY` - Stripe public key
- Other app-specific variables

## Script Reference

All utility scripts are in `/web/bin/`:

| Script | Command | Description |
|--------|---------|-------------|
| `install.ts` | `bun run install:data` | Populate default data |
| `install.ts --check` | `bun run install:check` | Check installation status |
| `install.ts --wipeout` | `bun run install:wipeout` | Wipeout and reinstall |
| `close-db-connections.ts` | `bun run db:close-connections` | Close stale DB connections |

## Support

For more information:

- See `bin/README.md` for script documentation
- Check Prisma documentation: <https://prisma.io/docs>
- Review database schema: `prisma/schema.prisma`
