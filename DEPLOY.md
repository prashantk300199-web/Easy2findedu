# Deploys

All production deploys are automated via **GitHub Actions**. Manual upload
scripts (which used to live at the repo root as `deploy-to-vps.sh`,
`deploy-admin.sh`, `deploy-admin.ps1`, `deploy-admin.txt`) are gone from
git history — they contained plaintext credentials. Their filenames are
.gitignored so they can't be re-committed accidentally.

## What deploys where

| Domain | Source | Workflow |
|---|---|---|
| https://easytofindedu.com | `easytofindedu-web/` | `.github/workflows/deploy-frontend.yml` |
| https://admin.easytofindedu.com | `easytofindedu-web/` (admin route inside the same SPA) | `.github/workflows/deploy-admin.yml` |

Both workflows build the same SPA and ship to different Nginx vhosts on
the same Hostinger VPS (`72.60.201.201`).

## Triggers

Both workflows run on every push to `main` that touches the SPA (and on
manual dispatch from the Actions tab).

## How it works

1. GitHub Actions runner: `npm ci && npm run build`
2. `appleboy/scp-action` uploads `dist/*` to a staging dir on the VPS
3. `appleboy/ssh-action` does an atomic swap into the live web root
4. `curl` verifies the deployed URL returns 200

## Auth

Both workflows use `VPS_PASSWORD` (a GitHub Actions secret). The legacy
`VPS_SSH_KEY` secret exists but is **not used** by any active workflow —
it was disabled when SSH-key auth stopped matching the VPS.

## Manual fallback (rarely needed)

If GitHub Actions is broken, you can deploy manually from a local clone:

```bash
# 1. Build the SPA
cd easytofindedu-web && npm ci && npm run build && cd ..

# 2. (One-time setup, already done on VPS) bare repo with post-receive hook:
#    /var/repo/admin-easytofindedu.git
#    /var/repo/easytofindedu.git  (frontend — if you ever want one)

# 3. Push to the bare repo via SSH (uses ~/.ssh/easytofindedu_vps key)
git clone ssh://root@72.60.201.201/var/repo/admin-easytofindedu.git admin-deploy
cp -r easytofindedu-web/dist/. admin-deploy/
cd admin-deploy
git add -A && git commit -m "manual deploy" && git push origin main
```

## VPS layout

- Web root for main site: `/var/www/easytofindedu/`
- Web root for admin: `/var/www/admin-easytofindedu/`
- Staging dirs (atomic swap buffer): `/var/www/easytofindedu-temp/`, `/var/www/admin-easytofindedu-temp/`
- One-cycle rollback backup: `/var/www/<site>.bak/`
- Nginx config: `/etc/nginx/sites-enabled/{easytofindedu,admin.easytofindedu.com.conf}.conf`
- Old legacy admin files backed up at: `/root/backup-admin/`