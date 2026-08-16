#!/bin/bash
# EasyToFindEdu Deployment Script
# Run this on your VPS via Web Console

set -e

echo "=== Step 1: Installing Nginx ==="
apt update
apt install -y nginx

echo "=== Step 2: Creating directories ==="
mkdir -p /var/www/easytofindedu
mkdir -p /var/www/admin-easytofindedu

echo "=== Step 3: Configuring Nginx for main site ==="
cat > /etc/nginx/sites-available/easytofindedu << 'EOF'
server {
    listen 80;
    server_name easytofindedu.com www.easytofindedu.com;
    root /var/www/easytofindedu;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

echo "=== Step 4: Configuring Nginx for admin ==="
cat > /etc/nginx/sites-available/admin-easytofindedu << 'EOF'
server {
    listen 80;
    server_name admin.easytofindedu.com;
    root /var/www/admin-easytofindedu;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

echo "=== Step 5: Enabling sites ==="
ln -sf /etc/nginx/sites-available/easytofindedu /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/admin-easytofindedu /etc/nginx/sites-enabled/

# Remove default site if exists
rm -f /etc/nginx/sites-enabled/default

echo "=== Step 6: Testing Nginx config ==="
nginx -t

echo "=== Step 7: Reloading Nginx ==="
systemctl reload nginx

echo "=== Step 8: Installing Certbot for SSL ==="
apt install -y certbot python3-certbot-nginx

echo ""
echo "=== DEPLOYMENT SCRIPT COMPLETE ==="
echo "Next steps:"
echo "1. Upload website files to /var/www/easytofindedu"
echo "2. Upload admin files to /var/www/admin-easytofindedu"
echo "3. Run: certbot --nginx -d easytofindedu.com -d www.easytofindedu.com -d admin.easytofindedu.com"
