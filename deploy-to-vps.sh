#!/bin/bash

# Deploy script for EasyToFindEdu
# This will upload the built website to the VPS

VPS_HOST="72.60.201.201"
VPS_USER="root"
VPS_PASS='P9f;wyF)74?;?;81'
VPS_PATH="/var/www/easytofindedu"
LOCAL_DIST="easytofindedu-web/dist"

echo "Starting deployment to VPS..."

# Create SFTP batch commands
cat > /tmp/sftp-batch.txt << 'EOF'
cd /var/www/easytofindedu
lcd easytofindedu-web/dist
put -r *
bye
EOF

# Execute SFTP upload
echo "Uploading files..."
sftp -b /tmp/sftp-batch.txt "$VPS_USER@$VPS_HOST" << SFTPEOF
$VPS_PASS
SFTPEOF

# Clean up
rm -f /tmp/sftp-batch.txt

echo "Deployment complete!"
echo "Visit: https://www.easytofindedu.com"
