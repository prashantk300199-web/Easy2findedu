# 📋 GitHub Secrets - Exact Values to Add

## Secrets to Add (5 total)

### 1. FTP_SERVER
**Name**: `FTP_SERVER`  
**Value**: Use the same value as your existing `VPS_HOST` secret
- If you don't know it, it's usually: `ftp.yourdomain.com` or the IP address of your Hostinger server

---

### 2. FTP_USERNAME
**Name**: `FTP_USERNAME`  
**Value**: Use the same value as your existing `VPS_USERNAME` secret
- This is your Hostinger FTP/SSH username

---

### 3. FTP_PASSWORD
**Name**: `FTP_PASSWORD`  
**Value**: Use the same value as your existing `VPS_PASSWORD` secret
- This is your Hostinger FTP/SSH password

---

### 4. FTP_SERVER_DIR
**Name**: `FTP_SERVER_DIR`  
**Value**: `/public_html/`
- This is the directory where your website files should go
- Common alternatives: `/htdocs/` or `/domains/yourdomain.com/public_html/`
- **Important**: Include the trailing slash `/`

---

### 5. VITE_API_BASE_URL
**Name**: `VITE_API_BASE_URL`  
**Value**: `https://easytofindedu.onrender.com/api/v1`
- This is your backend API URL
- This tells the frontend where to send API requests

---

## 📝 Summary Table

| Secret Name | Value | Notes |
|-------------|-------|-------|
| `FTP_SERVER` | Same as `VPS_HOST` | Your Hostinger server address |
| `FTP_USERNAME` | Same as `VPS_USERNAME` | Your FTP/SSH username |
| `FTP_PASSWORD` | Same as `VPS_PASSWORD` | Your FTP/SSH password |
| `FTP_SERVER_DIR` | `/public_html/` | Target directory (with trailing slash) |
| `VITE_API_BASE_URL` | `https://easytofindedu.onrender.com/api/v1` | Backend API URL |

---

## 🎯 Copy-Paste Ready

**Since I can't see your actual VPS credentials (they're hidden), you need to:**

1. **For FTP_SERVER, FTP_USERNAME, FTP_PASSWORD**: 
   - Use the exact same values as your existing VPS secrets
   - OR find them in Hostinger control panel

2. **For FTP_SERVER_DIR**:
   ```
   /public_html/
   ```

3. **For VITE_API_BASE_URL**:
   ```
   https://easytofindedu.onrender.com/api/v1
   ```

---

## 🔍 How to Find Your VPS Credentials (if needed)

### Option 1: Hostinger Control Panel
1. Go to: https://hpanel.hostinger.com
2. Login with your account
3. Go to **"Files"** → **"FTP Accounts"**
4. You'll see your FTP credentials there

### Option 2: Check Your Email
- Search your email for "Hostinger" + "FTP credentials"
- Hostinger usually sends these when you first create hosting

### Option 3: Use Existing Values
- Since you already have `VPS_HOST`, `VPS_USERNAME`, `VPS_PASSWORD` secrets working
- Just copy those same values for the FTP secrets

---

## ✅ After Adding All 5 Secrets

Your secrets list should have:
- ✅ VITE_GOOGLE_CLIENT_ID (already exists)
- ✅ VPS_HOST (already exists)
- ✅ VPS_PASSWORD (already exists)
- ✅ VPS_SSH_KEY (already exists)
- ✅ VPS_USERNAME (already exists)
- 🆕 FTP_SERVER (NEW - add this)
- 🆕 FTP_USERNAME (NEW - add this)
- 🆕 FTP_PASSWORD (NEW - add this)
- 🆕 FTP_SERVER_DIR (NEW - add this)
- 🆕 VITE_API_BASE_URL (NEW - add this)

**Total: 10 secrets**

---

## 🚀 Ready to Add?

1. Go to: https://github.com/prashantk300199-web/Easy2findedu/settings/secrets/actions
2. Click **"New repository secret"** for each one
3. Copy the values from the table above
4. After adding all 5, we can trigger the deployment!

**Need help? Let me know which step you're on!**
