# EASY TO FIND EDU - PROJECT STRUCTURE & DEPLOYMENT MAP

## 📁 LOCAL PROJECT STRUCTURE

### Root Directory
**Location:** `C:\Users\ayush\Downloads\Vidhyamarg\Vidhyamarg\`

This directory contains all project folders:

---

## 🔧 BACKEND

### Backend Location
**Path:** `C:\Users\ayush\Downloads\Vidhyamarg\Vidhyamarg\EasyToFindEdu-Backend\`

### Backend Repository
- **GitHub Repo:** https://github.com/prashantk300199-web/EasytofindEdu.git
- **Branch:** `main`
- **Git Remote:** `origin`

### Backend Deployment
- **Platform:** Render (Web Service)
- **Service Name:** EasytofindEdu
- **URL:** https://easytofinddedu.onrender.com
- **Deploy Method:** Auto-deploy from GitHub main branch
- **Dashboard:** https://dashboard.render.com/web/srv-d9vm6jfmal7c7380428g

### Backend Structure
```
EasyToFindEdu-Backend/
├── src/
│   ├── models/              # Mongoose models
│   │   ├── Institute.js
│   │   ├── InstituteDraft.js      # NEW - Phase 4
│   │   ├── InstituteOwner.js
│   │   ├── Hostel.js
│   │   ├── User.js
│   │   └── ... (other models)
│   │
│   ├── controllers/         # Business logic
│   │   ├── instituteDraft.controller.js  # NEW - Phase 4
│   │   └── ... (other controllers)
│   │
│   ├── routes/              # API routes
│   │   ├── instituteDraft.routes.js      # NEW - Phase 4
│   │   ├── auth.routes.js
│   │   ├── owner.routes.js
│   │   └── ... (other routes)
│   │
│   ├── middlewares/         # Authentication, upload, etc.
│   │   ├── auth.middleware.js
│   │   ├── upload.middleware.js
│   │   └── ... (other middlewares)
│   │
│   ├── config/              # Configuration files
│   │   └── env.js
│   │
│   ├── utils/               # Utility functions
│   │   ├── cloudinary.js
│   │   └── ApiResponse.js
│   │
│   └── app.js               # Main Express app (MODIFIED - Phase 4)
│
├── package.json
└── .env                     # Environment variables (not in git)
```

### Key Backend Files Modified/Created in Phase 4
1. `src/models/InstituteDraft.js` - NEW
2. `src/controllers/instituteDraft.controller.js` - NEW
3. `src/routes/instituteDraft.routes.js` - NEW
4. `src/app.js` - MODIFIED (added draft routes)

### Backend Environment Variables (on Render)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key
- `CLOUDINARY_CLOUD_NAME` - Cloudinary config
- `CLOUDINARY_API_KEY` - Cloudinary config
- `CLOUDINARY_API_SECRET` - Cloudinary config
- `NODE_ENV` - production
- `PORT` - 5000 (default)

### Backend API Base URL
- **Production:** https://easytofinddedu.onrender.com/api/v1
- **Local:** http://localhost:5000/api/v1

---

## 🎨 FRONTEND

### Frontend Location
**Path:** `C:\Users\ayush\Downloads\Vidhyamarg\Vidhyamarg\easytofindedu-web\`

### Frontend Repository
- **GitHub Repo:** https://github.com/prashantk300199-web/Easy2findedu.git
- **Branch:** `main`
- **Git Remote:** `origin`
- **Same repo as backend** (monorepo structure)

### Frontend Deployment
- **Platform:** Vercel
- **Project Name:** Easy2findEdu (or similar)
- **URL:** (Check Vercel dashboard)
- **Deploy Method:** Auto-deploy from GitHub main branch
- **Dashboard:** https://vercel.com/dashboard

### Frontend Structure
```
easytofindedu-web/
├── src/
│   ├── components/
│   │   ├── institute-registration/    # Registration steps
│   │   │   ├── Step1InstituteInfo.tsx
│   │   │   ├── Step2Category.tsx
│   │   │   ├── Step3LocationContact.tsx
│   │   │   ├── Step4Courses.tsx
│   │   │   ├── Step5Facilities.tsx
│   │   │   ├── Step6Faculty.tsx
│   │   │   ├── Step7FeesScholarships.tsx
│   │   │   ├── Step8Admission.tsx
│   │   │   ├── Step9Career.tsx
│   │   │   ├── Step10Gallery.tsx
│   │   │   └── Step11Verification.tsx
│   │   └── ... (other components)
│   │
│   ├── pages/               # Page components
│   │   ├── InstituteRegistration.tsx        # OLD version
│   │   ├── InstituteRegistrationNew.tsx     # NEW - Phase 4 with auto-save
│   │   ├── InstituteOwnerDashboard.tsx      # NEW - Phase 4
│   │   └── ... (other pages)
│   │
│   ├── services/            # API services
│   │   ├── instituteDraft.service.js        # NEW - Phase 4
│   │   └── ... (other services)
│   │
│   ├── contexts/            # React contexts
│   │   ├── AuthContext.tsx
│   │   └── ... (other contexts)
│   │
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
│
├── public/                  # Static assets
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

### Key Frontend Files Modified/Created in Phase 4
1. `src/services/instituteDraft.service.js` - NEW
2. `src/pages/InstituteRegistrationNew.tsx` - NEW (with auto-save)
3. `src/pages/InstituteOwnerDashboard.tsx` - NEW
4. `src/components/institute-registration/Step1-11.tsx` - ALL MODIFIED (dark theme)

### Frontend Environment Variables (on Vercel)
- `VITE_API_URL` - Backend API URL (https://easytofinddedu.onrender.com/api/v1)

---

## 👨‍💼 ADMIN DASHBOARD

### Admin Dashboard Location
**Path:** `C:\Users\ayush\Downloads\Vidhyamarg\Vidhyamarg\easytofindedu-web\`
**Same as frontend** - Admin routes are part of the main web app

### Admin Routes (in frontend)
- `/admin/login` - Admin login
- `/admin/dashboard` - Admin dashboard
- `/admin/institutes` - Manage institutes
- `/admin/hostels` - Manage hostels
- `/admin/users` - Manage users
- etc.

### Admin Components Location
```
easytofindedu-web/src/
├── pages/
│   └── admin/               # Admin pages
│       ├── AdminDashboard.tsx
│       ├── AdminLogin.tsx
│       └── ... (other admin pages)
```

---

## 🔄 GIT WORKFLOW

### Current Branch
- **Backend & Frontend:** `main` branch

### Commit & Push Commands
```bash
# Backend
cd C:\Users\ayush\Downloads\Vidhyamarg\Vidhyamarg\EasyToFindEdu-Backend
git add .
git commit -m "your message"
git push origin main

# Frontend
cd C:\Users\ayush\Downloads\Vidhyamarg\Vidhyamarg\easytofindedu-web
git add .
git commit -m "your message"
git push origin main
```

### Trigger Render Deployment
```bash
cd C:\Users\ayush\Downloads\Vidhyamarg\Vidhyamarg\EasyToFindEdu-Backend
git commit --allow-empty -m "trigger render deployment"
git push origin main
```

---

## 📊 DATABASE

### MongoDB
- **Platform:** MongoDB Atlas (cloud)
- **Connection:** Stored in backend `.env` as `MONGODB_URI`
- **Database Name:** (check MongoDB Atlas)

### Collections
- `institutes` - Institute data
- `institutedrafts` - Institute registration drafts (NEW - Phase 4)
- `instituteowners` - Institute owners
- `hostels` - Hostel data
- `users` - General users
- `admins` - Admin users
- ... (other collections)

---

## 🗂️ FILE STORAGE

### Cloudinary
- **Platform:** Cloudinary (cloud storage)
- **Usage:** All image and document uploads
- **Config:** In backend `.env`
- **Folders:**
  - `/institute-drafts/{ownerId}/` - Draft uploads
  - `/institutes/` - Institute images
  - `/hostels/` - Hostel images
  - etc.

---

## 🚀 DEPLOYMENT PLATFORMS

### Backend Deployment
- **Platform:** Render
- **Dashboard:** https://dashboard.render.com
- **Service:** Web Service
- **URL:** https://easytofinddedu.onrender.com
- **Auto-deploy:** Yes (from GitHub main branch)

### Frontend Deployment  
- **Platform:** Vercel
- **Dashboard:** https://vercel.com/dashboard
- **Project:** Easy2findEdu
- **Auto-deploy:** Yes (from GitHub main branch)

---

## 📝 PHASE 4 IMPLEMENTATION SUMMARY

### What Was Changed

**Backend:**
1. Created `InstituteDraft` model for saving registration drafts
2. Created draft controller with save/load/submit/delete operations
3. Created API routes for draft operations
4. Integrated with existing authentication middleware

**Frontend:**
1. Created draft API service
2. Created new registration component with auto-save
3. Created owner dashboard with "Continue Editing"
4. Redesigned all 11 registration steps with dark theme

### New API Endpoints (Phase 4)
- `GET /api/v1/institute/draft` - Load draft
- `GET /api/v1/institute/draft/status` - Dashboard status
- `POST /api/v1/institute/draft/save` - Save/update draft
- `POST /api/v1/institute/draft/upload` - Upload files
- `POST /api/v1/institute/draft/submit` - Submit for verification
- `DELETE /api/v1/institute/draft` - Delete draft

---

## 🔍 QUICK REFERENCE

### Start Local Development

**Backend:**
```bash
cd C:\Users\ayush\Downloads\Vidhyamarg\Vidhyamarg\EasyToFindEdu-Backend
npm install
npm run dev
```

**Frontend:**
```bash
cd C:\Users\ayush\Downloads\Vidhyamarg\Vidhyamarg\easytofindedu-web
npm install
npm run dev
```

### Check Deployment Status
- **Backend:** https://dashboard.render.com/web/srv-d9vm6jfmal7c7380428g
- **Frontend:** https://vercel.com/dashboard

### Test API Endpoints
```bash
# Backend health check
curl https://easytofinddedu.onrender.com/api/v1/health

# Frontend
# Open browser to Vercel URL
```

---

## 📋 IMPORTANT NOTES

1. **Same GitHub Repository:** Both backend and frontend are in the same repo but in different folders
2. **Monorepo Structure:** `EasyToFindEdu-Backend/` and `easytofindedu-web/` are siblings
3. **Auto-deploy:** Both Render and Vercel watch the main branch for changes
4. **Environment Variables:** Set separately in Render and Vercel dashboards
5. **Phase 4 Files:** All draft-related files are clearly marked with "NEW - Phase 4" comments

---

## 🆘 TROUBLESHOOTING

### Backend not deploying on Render
```bash
# Force push to trigger deployment
cd C:\Users\ayush\Downloads\Vidhyamarg\Vidhyamarg\EasyToFindEdu-Backend
git commit --allow-empty -m "trigger deploy"
git push origin main
```

### Frontend not deploying on Vercel
- Check Vercel dashboard for build errors
- Verify environment variables are set
- Check build logs

### Cannot access API
- Verify backend is live on Render
- Check CORS settings in backend
- Verify API URL in frontend environment variables

---

**Last Updated:** May 9, 2026
**Phase:** Phase 4 - Save Draft, Auto-save & Resume
**Status:** Completed and Deployed
