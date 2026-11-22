# Deployment Note

[mingster.com](https://mingster.com) is self hosted on **mx2.mingster.com**. There is no staging.
A commit to `main` goes live only when `web/bin/deploy.sh` runs on the box.

## Production

production site [mingster.com](https://mingster.com) is hosted at **mx2.mingster.com**, a
small (~4GB RAM) Debian box that **also runs [Mail-in-a-Box](https://mailinabox.email/)** and a
**local PostgreSQL 18**. Two facts drive the whole production setup:

1. **4GB RAM is tight for `next build`.** A default build OOMs (`spawn ENOMEM`, multi-GB `core.*`
   dumps), so the build runs on the box with a **capped Node heap** (`--max-old-space-size`) — no
   swap file needed. We build on the box (not ship a Mac-built `.next/`) to avoid Linux-vs-macOS
   native/bundle mismatches. See [Pull and build on the box](#pull-and-build-on-the-box).
2. **Mail-in-a-Box owns nginx and TLS.** It regenerates `/etc/nginx/conf.d/local.conf` and
   renews Let's Encrypt certs on its own. Do **not** hand-edit nginx here or run your own
   certbot — your changes get wiped on the next MiaB update. Add the app the MiaB-blessed way.
   See [Serving the app behind Mail-in-a-Box](#serving-the-app-behind-mail-in-a-box).

> The generic single-purpose-VPS instructions further down (own nginx vhost on port 3001, own
> certbot) are **legacy / non-MiaB** and are kept only for reference. On mx2.mingster.com follow
> the two sections above.

---

## Pull and build on the box

`web/bin/deploy.sh` runs **on the box**, not from your workstation. It pulls `main` with
`git pull --ff-only`, builds there with a capped Node heap (`--max-old-space-size`, so no swap file
is needed on 4GB), and reloads PM2.

> **Why build on the box instead of shipping a prebuilt `.next/`?** The workstation is
> macOS/arm64 and the server is Linux/x64. `node_modules` holds native binaries (the Prisma query
> engine most of all), and Turbopack names externalized `serverExternalPackages` with content
> hashes that only resolve against the exact `node_modules` from build time. A Mac build crashes
> at runtime on the box (`Failed to load external module stripe-<hash>`). Building on the box
> avoids that.

`.env` lives only on the box (`/var/www/mingster.com/web/.env`) and the script never touches it.

### First-time setup on the box

```bash
# runtimes (see full "Install Node.js…" and "PM2" sections below)
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo bash - && sudo apt-get install -y nodejs
curl -fsSL https://bun.com/install | bash
bun install -g pm2

# clone the repo, then put your production .env in place
sudo git clone https://github.com/mingster/mingster.com.git /var/www/mingster.com
# copy your production .env into /var/www/mingster.com/web/.env
```

You need SSH key access to the box (`ssh-copy-id`) to log in and run the script.

### Deploy

From your workstation:

```bash
ssh mx2.mingster.com 'cd /var/www/mingster.com && bash web/bin/deploy.sh'
```

Common variants (run on the box):

```bash
MAX_OLD_SPACE=3072 bash web/bin/deploy.sh   # raise or lower the build heap cap (MB)
DB_PUSH=1          bash web/bin/deploy.sh   # also run `prisma db push` (schema changed)
```

Config (override via env), with defaults:

| Var | Default | Purpose |
|-----|---------|---------|
| `PM2_NAME` | `mingster.com` | pm2 process name |
| `MAX_OLD_SPACE` | `2560` | Node heap cap (MB) for the build, the low memory lever |
| `BUILD_CMD` | `bun run build` | build command |
| `DB_PUSH` | `0` | `1` runs `bun run sql:dbpush` after the build |

What the script does, in order: `ulimit -c 0` (no core dumps), `git pull --ff-only` at the repo
root, remove `.next`, `node_modules`, `.swc` and `prisma/generated`, `bun install`,
`git restore .` (undo lockfile churn), `bun install --frozen-lockfile`,
`NEXT_BUILD_LOW_MEMORY=1 NODE_OPTIONS=--max-old-space-size=$MAX_OLD_SPACE bun run build`,
optionally `bun x prisma db push` (when `DB_PUSH=1`), then `pm2 reload mingster.com --update-env`
(or `pm2 start` on the first run) and `pm2 save`.

> **Before any production `DB_PUSH=1`:** the script takes no backup. On the box, first run
> `pg_dump -Fc` on the database named in `.env` into `/var/backups/mingster.com/<sha>.dump` and
> check it with `pg_restore --list`. Stop if the backup fails. `prisma db push` keeps no history,
> and the owner approves any push that drops or renames columns. Do not print or copy `.env`
> values: [Omitted/Configured via Env].

> If a build ever gets OOM-killed, raise `MAX_OLD_SPACE`, or add swap (see
> [`spawn ENOMEM` during `next build`](#spawn-enomem-during-next-build) below).

### Probe the box before/after

`web/bin/probe-server.sh` SSHes in and prints RAM/swap, listening ports, the MiaB nginx
`server_name` list, runtimes, postgres, and the app's PM2 status. Read-only — changes nothing.

```bash
web/bin/probe-server.sh
```

---

## Serving the app behind Mail-in-a-Box

Mail-in-a-Box already terminates TLS on 80/443 and issues the Let's Encrypt cert for
`mingster.com` (because it's a mail domain on the box). We just tell MiaB to **reverse-proxy the
domain root to the app** on `localhost:3002` (the port `bun start` / `next start -p 3002` uses).
Both files below live under `STORAGE_ROOT` (`/home/user-data`) and **survive MiaB updates** —
MiaB reads them when it regenerates nginx.

**1. Proxy the root** — edit `/home/user-data/www/custom.yaml`:

```yaml
mingster.com:
  proxies:
    "/": "http://localhost:3002#web-sockets,pass-http-host,no-proxy-redirect"
```

The flags make MiaB emit the right directives: `web-sockets` → HTTP/1.1 + `Upgrade` headers;
`pass-http-host` → `Host $http_host` (needed for Better Auth / OAuth callbacks);
`no-proxy-redirect` → `proxy_redirect off`. MiaB always adds `X-Forwarded-For/-Host/-Proto` and
`X-Real-IP`. A root (`/`) proxy also makes MiaB stop serving its static placeholder for the domain.

**2. Longer timeouts + upload size** — create `/home/user-data/www/mingster.com.conf`
(MiaB includes this file inside the `mingster.com` server block; server-context directives here
are inherited by the proxied `location /`):

```nginx
# app can take a while on some POST paths; allow bigger uploads
proxy_connect_timeout 300s;
proxy_send_timeout    300s;
proxy_read_timeout    300s;
client_max_body_size  25m;
```

**3. Apply** (regenerates nginx, keeps your two files, reloads):

```bash
cd /root/mailinabox
sudo tools/web_update      # or: Admin panel → System → reload; or `sudo mailinabox`
```

Verify:

```bash
grep -A3 'server_name mingster.com' /etc/nginx/conf.d/local.conf   # should show your proxy_pass
curl -I https://mingster.com                                       # 200 from Next.js, valid TLS
```

> If `mingster.com` is **not** yet a mail domain on the box, MiaB won't create a server block or
> cert for it. Add it in the MiaB admin (Mail → Users, or a domain alias) first, or point the
> domain's A record at the box so MiaB provisions the cert.

### deployment note

#### Change hostname if needed

```bash
sudo hostnamectl set-hostname mingster.com
```

Verify the new setting:

```bash
sudo hostnamectl status
```

```bash
sudo nano /etc/hosts

localhost    localhost
127.0.1.1    mingster.com
```

#### SSH

```bash
ssh-keygen -t ed25519

# also you need to setup authorized_keys
```

#### system update

```bash
sudo apt update && sudo apt upgrade -y
```

#### Essential Software

```bash
sudo apt install wget nano unzip ufw
```

#### postgres/psql (optional)

this is just so we can use psql client on the box.

```bash
# Import the repository signing key:
sudo apt install curl ca-certificates

sudo mkdir -p /usr/share/postgresql-common/pgdg
sudo install -d /usr/share/postgresql-common/pgdg
sudo curl -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc --fail https://www.postgresql.org/media/keys/ACCC4CF8.asc

# Create the repository configuration file:
. /etc/os-release
sudo sh -c "echo 'deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] https://apt.postgresql.org/pub/repos/apt $VERSION_CODENAME-pgdg main' > /etc/apt/sources.list.d/pgdg.list"

# Update the package lists:
sudo apt update

# install
sudo apt install postgresql-client-18
#sudo apt install postgresql-18
```

##### config db access

On the db box, edit `pg_hba.conf` to allow the web host (`scram-sha-256`, with `hostssl` for TLS). Then restart postgresql and open port 5432 in ufw for that host only.

```bash
sudo nano /etc/postgresql/18/main/pg_hba.conf
sudo systemctl restart postgresql
```

##### check db access

back to the web site:

```bash
psql -h <db host> -d <database> -U <user>   # values: [Omitted/Configured via Env]
```

#### Install Node.js and npm

For latest version, visit the Node.js official documentation page.

```bash
sudo apt install -y ca-certificates curl gnupg

curl -fsSL https://deb.nodesource.com/setup_24.x | sudo bash -
sudo apt-get install -y nodejs

# installs nvm (Node Version Manager)
#sudo curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
# download and install Node.js (you may need to restart the terminal)
#nvm install 24.12.0
# verifies the right Node.js version is in the environment
node -v # should print `v24.xxx`

# verifies the right npm version is in the environment
npm -v # should print `11.xxx`

# install bun
curl -fsSL https://bun.com/install | bash
```

#### git

```bash
sudo apt install git gh
```

```bash
gh auth login
```

#### lazygit

```bash
LAZYGIT_VERSION=$(curl -s "https://api.github.com/repos/jesseduffield/lazygit/releases/latest" | \grep -Po '"tag_name": *"v\K[^"]*')
curl -Lo lazygit.tar.gz "https://github.com/jesseduffield/lazygit/releases/download/v${LAZYGIT_VERSION}/lazygit_${LAZYGIT_VERSION}_Linux_x86_64.tar.gz"
tar xf lazygit.tar.gz lazygit
sudo install lazygit -D -t /usr/local/bin/
```

#### PM2

```bash
bun install -g pm2
```

#### ufw

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

sudo ufw enable
sudo ufw reload

sudo ufw status verbose
```

#### nginx

> **On mx2.mingster.com, skip this section** — Mail-in-a-Box owns nginx. Use
> [Serving the app behind Mail-in-a-Box](#serving-the-app-behind-mail-in-a-box) instead. The vhost
> below is for a **standalone (non-MiaB) VPS** only, and note the app listens on **3002** now, not
> 3001.

```bash
sudo apt install nginx -y

sudo nano /etc/nginx/sites-available/mingster.com
```

Add the following configuration:

```bash
server {
    listen 80;
    server_name mingster.com;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;

        # Critical for OAuth callbacks and better-auth: pass proxy headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;

        # critical: avoid caching dynamic responses
        add_header Cache-Control "no-store" always;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;

        # OAuth callbacks + Gemini replies (can run long)
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }

    # Static build assets can be cached aggressively (safe)
    #location ^~ /_next/static/ {
    #    proxy_pass http://localhost:3002;
    #    add_header Cache-Control "public, max-age=31536000, immutable" always;
    #}

    # If you use next/image
    #location ^~ /_next/image/ {
    #    proxy_pass http://localhost:3002;
    #    add_header Cache-Control "public, max-age=60" always;
    #}
}
```

link to sites-enabled

```bash
sudo ln -s /etc/nginx/sites-available/mingster.com /etc/nginx/sites-enabled/
```

test:

```bash
sudo nginx -t
```

If the test is successful, restart Nginx:

```bash
sudo systemctl restart nginx
```

**Existing production servers:** If a slow request (the VE chat) fails on `mingster.com` with 502/504 or a dropped connection after ~60 seconds, raise the three `proxy_*_timeout` values above (300s is enough for Gemini) and reload nginx.


#### SSL

> **On mx2.mingster.com, skip this** — Mail-in-a-Box issues and renews the Let's Encrypt cert for
> `mingster.com` automatically. Running your own certbot will fight with MiaB. The commands below
> are for a **standalone (non-MiaB) VPS** only.

```bash
sudo apt install certbot python3-certbot-nginx -y

sudo certbot --nginx -d mingster.com
```

## configure

### clone the source

> On mx2.mingster.com the clone at `/var/www/mingster.com` is required: `web/bin/deploy.sh`
> pulls `main` into it and builds on the box.

```bash
sudo mkdir -p /var/www
cd /var/www
sudo  git clone https://github.com/mingster/mingster.com.git
```

### .env

copy or edit .env over to production

**Server Action error after deploy:** If you see `Failed to find Server Action "x"` in PM2 logs, add a persistent encryption key so action IDs stay valid across deploys. Generate once and put in production `.env`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Then set in `.env`:

```bash
NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=<paste the output above>
```


### file permission

```bash
# Replace 'youruser' with your actual username

sudo usermod -aG www-data youruser
sudo chown -R youruser:www-data /var/www

# Apply 755 to all directories
sudo find /var/www -type d -exec chmod 755 {} \;

# Apply 644 to all files
cd
```

### build

Deploys are driven by `web/bin/deploy.sh` (pull `main` → build on the box with a capped heap →
reload PM2). See [Pull and build on the box](#pull-and-build-on-the-box). The box builds the
app itself; the notes below help when a build runs low on memory.

#### Core dumps (`core.*`) filling disk

If you see many **`core.<pid>`** files (often **~10GB** each) under `/var/www/...` or `/root` while deploying:

- **What they are:** The Linux kernel writing **full memory dumps** when a process **crashes or is killed** (e.g. **OOM killer** during `next build` / Prisma / native addons).
- **Free space now:** Remove them only after you are sure you do not need them for debugging:
  `sudo find /var/www/mingster.com -maxdepth 3 -name 'core.*' -type f -delete`
  (adjust path if cores landed elsewhere, e.g. `$HOME`).
- **Prevention:** `web/bin/deploy.sh` sets **`ulimit -c 0`** so new deploys should not create new core files from that pipeline. For **PM2** / login shells, you can also set system limits (e.g. `/etc/security/limits.conf`: `* soft core 0`).
- **Root cause:** Usually **not enough RAM or swap** for the build. Add swap or RAM, or lower `MAX_OLD_SPACE` on the server.

#### `spawn ENOMEM` during `next build`

The kernel could not create a child process (**errno -12**). Typical on **2–4 GB RAM** VPS when the build uses a **large Node heap** **plus** several parallel workers.

**`web/bin/deploy.sh`** already builds with `NEXT_BUILD_LOW_MEMORY=1` and
`--max-old-space-size=$MAX_OLD_SPACE` (default 2560 MB). On a smaller box, lower the cap on the box:

```bash
MAX_OLD_SPACE=2048 bash web/bin/deploy.sh
```

Add swap if the build is still OOM-killed.

#### `next build` failed (generic / `prerender-manifest.json` missing)

The deploy script only reports the **last** error; the **real cause is higher in the log** (TypeScript, prerender, missing `DATABASE_URL`, ESLint, OOM, etc.).

On the server, from `/var/www/mingster.com/web`:

```bash
# Low memory profile, as deploy.sh runs it
NEXT_BUILD_LOW_MEMORY=1 NODE_OPTIONS="--max-old-space-size=2560" bun run build
```

Ensure `.env` (`DATABASE_URL`) exists where Prisma or server code needs it at build time.

### pm2

```bash

#mkdir -p /var/www/mingster.com
cd /var/www/mingster.com/web

# `--cwd` is required: `bun start` must run in the repo (package.json "start" script).
#pm2 delete mingster.com   # if fixing a broken process
pm2 start bun --name "mingster.com" --cwd /var/www/mingster.com/web -- start

pm2 startup systemd
pm2 save
pm2 status

# 7. Check the logs
pm2 logs mingster.com --lines 50
```

## Cron jobs

This app has no application cron jobs. Certificates are managed by Mail-in-a-Box, see the SSL section above.
