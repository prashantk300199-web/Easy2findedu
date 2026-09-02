# 🚀 WinSCP Deployment Guide - Step by Step

## 📋 Pre-Deployment Checklist

Before you start:
- [ ] WinSCP installed and open
- [ ] Server credentials ready (host, username, password)
- [ ] Backup current files (download them first!)

---

## 🔧 Step 1: Connect to Your Server

1. Open WinSCP
2. Create new connection:
   - **File Protocol**: SFTP or FTP (check with your hosting provider)
   - **Host name**: Your server IP or domain
   - **Port number**: 22 (for SFTP) or 21 (for FTP)
   - **User name**: Your server username
   - **Password**: Your server password
3. Click **Login**

---

## 📁 Step 2: Navigate to Project Directories

### For Backend:
Navigate to: `/path/to/EasyToFindEdu-Backend/`

### For Frontend:
Navigate to: `/path/to/easytofindedu-web/`

**⚠️ Important**: Find out the exact paths from your hosting provider or check your current deployment

---

## 🔄 Step 3: Backup Current Files

Before uploading anything, **backup these files**:

### Backend Backup:
1. Right-click on `src/models/Hostel.js` → Download (save as `Hostel.js.backup`)
2. Right-click on `src/validators/hostel.validator.js` → Download (save as `hostel.validator.js.backup`)

### Frontend Backup:
1. Right-click on `src/lib/types.ts` → Download (save as `types.ts.backup`)
2. Right-click on `src/pages/HostelDetailPage.tsx` → Download
3. Right-click on `src/pages/OwnerDashboard.tsx` → Download
4. Right-click on `src/App.tsx` → Download

---

## 📤 Step 4: Upload Backend Files

### Navigate to: `EasyToFindEdu-Backend/src/models/`
1. Find `Hostel.js` in your local directory:
   ```
   C:\Users\ayush\Downloads\Vidhyamarg\Vidhyamarg\EasyToFindEdu-Backend\src\models\Hostel.js
   ```
2. Drag and drop `Hostel.js` to WinSCP (or right-click → Upload)
3. Confirm overwrite when prompted

### Navigate to: `EasyToFindEdu-Backend/src/validators/`
1. Find `hostel.validator.js` in your local directory:
   ```
   C:\Users\ayush\Downloads\Vidhyamarg\Vidhyamarg\EasyToFindEdu-Backend\src\validators\hostel.validator.js
   ```
2. Drag and drop `hostel.validator.js` to WinSCP
3. Confirm overwrite when prompted

---

## 📤 Step 5: Upload Frontend Files

### A. Create New Folder (if not exists)
1. Navigate to: `easytofindedu-web/src/components/`
2. Right-click → New → Directory
3. Name it: `hostel`
4. Open the `hostel` folder

### B. Upload Step Components
Navigate to local directory:
```
C:\Users\ayush\Downloads\Vidhyamarg\Vidhyamarg\easytofindedu-web\src\components\hostel\
```

Upload these 5 files to `src/components/hostel/`:
1. `Step1BasicInfo.tsx`
2. `Step2AddressRent.tsx`
3. `Step3RoomsMeals.tsx`
4. `Step4NearbyRules.tsx`
5. `Step5AmenitiesPhotos.tsx`

**How**: Select all 5 files → Drag to WinSCP

---

### C. Upload Library Files
Navigate to: `easytofindedu-web/src/lib/`

From local directory:
```
C:\Users\ayush\Downloads\Vidhyamarg\Vidhyamarg\easytofindedu-web\src\lib\
```

Upload these files:
1. `hostelFormTypes.ts` (NEW file)
2. `types.ts` (REPLACE existing - confirm overwrite)

---

### D. Upload Page Files
Navigate to: `easytofindedu-web/src/pages/`

From local directory:
```
C:\Users\ayush\Downloads\Vidhyamarg\Vidhyamarg\easytofindedu-web\src\pages\
```

Upload these files:
1. `AddHostelPage.tsx` (NEW file)
2. `HostelDetailPage.tsx` (REPLACE existing - confirm overwrite)
3. `OwnerDashboard.tsx` (REPLACE existing - confirm overwrite)

---

### E. Upload Root Files
Navigate to: `easytofindedu-web/src/`

From local directory:
```
C:\Users\ayush\Downloads\Vidhyamarg\Vidhyamarg\easytofindedu-web\src\
```

Upload:
1. `App.tsx` (REPLACE existing - confirm overwrite)

---

## ✅ Step 6: Verify Upload

Check that all files are uploaded:

### Backend (2 files):
- [ ] `src/models/Hostel.js` (check file size and timestamp)
- [ ] `src/validators/hostel.validator.js` (check file size and timestamp)

### Frontend (12 files):
- [ ] `src/components/hostel/Step1BasicInfo.tsx`
- [ ] `src/components/hostel/Step2AddressRent.tsx`
- [ ] `src/components/hostel/Step3RoomsMeals.tsx`
- [ ] `src/components/hostel/Step4NearbyRules.tsx`
- [ ] `src/components/hostel/Step5AmenitiesPhotos.tsx`
- [ ] `src/lib/hostelFormTypes.ts`
- [ ] `src/lib/types.ts`
- [ ] `src/pages/AddHostelPage.tsx`
- [ ] `src/pages/HostelDetailPage.tsx`
- [ ] `src/pages/OwnerDashboard.tsx`
- [ ] `src/App.tsx`

---

## 🔄 Step 7: Restart Services

### Backend:
If using PM2 or similar:
```bash
pm2 restart backend-app-name
```

Or contact your hosting provider to restart the backend service.

### Frontend:
If using a build process:
```bash
npm run build
```

Or your hosting provider may auto-rebuild after file changes.

**⚠️ Important**: Some hosting providers need manual restart/rebuild!

---

## 🧪 Step 8: Test Deployment

1. **Test Backend API**:
   - Visit: `https://your-backend-url.com/api/health`
   - Should return status 200

2. **Test Frontend**:
   - Visit: `https://your-frontend-url.com/hostels/add`
   - New 5-step form should load
   - Try filling and submitting

3. **Test Hostel Detail**:
   - Visit any hostel detail page
   - Check if all amenity categories display
   - Verify contact information shows

---

## 🆘 Troubleshooting

### Issue: Files upload but changes don't appear
**Solution**: 
- Clear browser cache (Ctrl + Shift + Delete)
- Restart backend service
- Rebuild frontend if using build process

### Issue: "Permission denied" when uploading
**Solution**:
- Check file permissions on server
- Make sure you have write access
- Contact hosting provider

### Issue: Website shows errors after upload
**Solution**:
- Check browser console for errors (F12)
- Verify all files uploaded correctly
- Restore from backup and try again

### Issue: Import errors in console
**Solution**:
- Make sure `hostel` folder was created
- Verify all step files are in `src/components/hostel/`
- Check file names match exactly (case-sensitive)

---

## 📞 Need More Help?

If you encounter issues:
1. Take a screenshot of the error
2. Check browser console (F12)
3. Check server logs
4. I can help troubleshoot specific errors!

---

## 🎉 Success Checklist

- [ ] All backend files uploaded successfully
- [ ] All frontend files uploaded successfully
- [ ] Services restarted
- [ ] Website loads without errors
- [ ] New Add Hostel form works
- [ ] Hostel detail page shows all amenities
- [ ] Contact information displays correctly

**Once all checked, deployment is COMPLETE! 🚀**
