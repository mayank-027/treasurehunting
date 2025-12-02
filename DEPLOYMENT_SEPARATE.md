# Separate Frontend & Backend Deployment Guide

This guide explains how to deploy the frontend and backend as separate Vercel projects.

## Architecture

- **Frontend Project**: React app deployed as static files
- **Backend Project**: Express API deployed as serverless functions
- **Communication**: Frontend calls backend via API URL

---

## Part 1: Backend Deployment

### Step 1: Prepare Backend

The backend is in the `server/` directory. It already has:
- `server/api/[...path].js` - Serverless handler
- `server/vercel.json` - Vercel configuration
- `server/package.json` - Dependencies

### Step 2: Deploy Backend to Vercel

**Option A: Using Vercel CLI**

```bash
cd treasure-hunt-js/server
vercel
```

**Option B: Using Vercel Dashboard**

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. **CRITICAL**: Set **Root Directory** to `server`
5. Vercel Settings:
   - **Framework Preset**: Other
   - **Build Command**: Leave EMPTY (no build needed)
   - **Output Directory**: Leave EMPTY (no output directory)
   - **Install Command**: `npm install`
6. Add environment variables (see below)
7. Click "Deploy"

**Important Notes:**
- Root Directory MUST be set to `server`
- Build Command MUST be empty
- Output Directory MUST be empty
- Vercel will auto-detect serverless functions from `api/` folder

### Step 3: Backend Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/treasure-hunt
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-secure-password
JWT_SECRET=your-very-secure-secret-key-min-32-chars
CLIENT_URL=*
NODE_ENV=production
```

**Important**: 
- `CLIENT_URL` set to `*` temporarily (allows all origins)
- Update this to your frontend URL after frontend is deployed

### Step 4: Note Your Backend URL

After deployment, note your backend URL:
- Example: `https://treasure-hunt-api.vercel.app`
- Test it: `https://your-backend.vercel.app/api/health`
- This will be used in the frontend configuration

---

## Part 2: Frontend Deployment

### Step 1: Update Frontend API Configuration

**Option A: Using Environment Variable (Recommended)**

In Vercel Dashboard → Frontend Project → Settings → Environment Variables:
```
VITE_API_URL=https://your-backend-url.vercel.app/api
```

**Option B: Update Code Directly**

Update `src/lib/api.ts`:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL ?? 
  (import.meta.env.PROD 
    ? "https://your-backend-url.vercel.app/api"  // Replace with your backend URL
    : "http://localhost:5000/api");
```

### Step 2: Deploy Frontend to Vercel

**Option A: Using Vercel CLI**

```bash
cd treasure-hunt-js
vercel
```

**Option B: Using Vercel Dashboard**

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. **Root Directory**: `.` (root - leave default)
5. Vercel will auto-detect:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Add environment variable:
   - `VITE_API_URL`: Your backend API URL (e.g., `https://your-backend.vercel.app/api`)
7. Click "Deploy"

### Step 3: Update Backend CORS

After frontend is deployed:
1. Go to Backend Vercel Project → Settings → Environment Variables
2. Update `CLIENT_URL` to your frontend URL (e.g., `https://your-frontend.vercel.app`)
3. Redeploy backend

---

## Configuration Files

### Backend (`server/vercel.json`)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/[...path].js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/[...path].js"
    }
  ]
}
```

### Frontend (Auto-detected by Vercel)
- Framework: Vite
- Build: `npm run build`
- Output: `dist`

---

## Quick Start Commands

### Backend Deployment
```bash
cd server
vercel --prod
```

### Frontend Deployment
```bash
cd treasure-hunt-js
vercel --prod
```

---

## Environment Variables Summary

### Backend Project (Required)
- `MONGO_URI` - MongoDB connection string
- `ADMIN_EMAIL` - Admin login email
- `ADMIN_PASSWORD` - Admin password
- `JWT_SECRET` - JWT signing secret (min 32 chars)
- `CLIENT_URL` - Frontend URL (for CORS) - set to `*` initially
- `NODE_ENV` - Set to `production`

### Frontend Project (Optional but Recommended)
- `VITE_API_URL` - Backend API URL (e.g., `https://your-backend.vercel.app/api`)

---

## Testing

1. **Test Backend**: 
   - Visit: `https://your-backend.vercel.app/api/health`
   - Should return: `{"status":"ok","database":"connected",...}`

2. **Test Frontend**:
   - Visit: `https://your-frontend.vercel.app`
   - Should load the app

3. **Test API Connection**:
   - Try logging in at `/admin/login`
   - Check browser console for API errors
   - Verify network tab shows requests to backend URL

---

## Troubleshooting

### Backend: "No entrypoint found in output directory"
- **Solution**: Make sure Root Directory is set to `server`
- **Solution**: Leave Build Command EMPTY
- **Solution**: Leave Output Directory EMPTY
- Vercel should auto-detect serverless functions from `api/` folder

### CORS Errors
- Ensure `CLIENT_URL` in backend matches frontend URL exactly
- Or temporarily set `CLIENT_URL=*` to allow all origins
- Check backend CORS configuration in `server/src/server.js`

### API Not Found (404)
- Verify `VITE_API_URL` is set correctly in frontend
- Check backend URL is accessible: `https://backend.vercel.app/api/health`
- Ensure API routes are working
- Check browser network tab for actual request URL

### Build Failures
- **Backend**: Ensure `server/package.json` has all dependencies
- **Frontend**: Ensure root `package.json` has all dependencies
- Check Vercel build logs for specific errors

### Timeout Errors (504)
- Backend functions have 10s timeout (free tier)
- Optimize database queries
- Check MongoDB connection speed
- Consider upgrading to Vercel Pro for 60s timeout

### Module Not Found Errors
- Ensure all dependencies are in `server/package.json`
- Check that `serverless-http` is installed
- Verify imports are correct

---

## Advantages of Separate Deployment

✅ Independent scaling  
✅ Separate domains/subdomains  
✅ Easier to manage  
✅ Can update one without affecting the other  
✅ Better for team collaboration  
✅ Different deployment schedules  

---

## Notes

- Backend API will be at: `https://your-backend.vercel.app/api/*`
- Frontend will be at: `https://your-frontend.vercel.app`
- Make sure to update CORS settings after both are deployed
- Keep backend URL in frontend environment variables for easy updates
- Backend doesn't need a build step - it's pure serverless functions

---

## Step-by-Step Checklist

### Backend Deployment
- [ ] Create new Vercel project
- [ ] Set Root Directory to `server`
- [ ] Leave Build Command empty
- [ ] Leave Output Directory empty
- [ ] Add all environment variables
- [ ] Deploy
- [ ] Test: `https://your-backend.vercel.app/api/health`
- [ ] Note backend URL

### Frontend Deployment
- [ ] Create new Vercel project
- [ ] Root Directory: `.` (root)
- [ ] Add `VITE_API_URL` environment variable
- [ ] Deploy
- [ ] Test frontend loads
- [ ] Update backend `CLIENT_URL` with frontend URL
- [ ] Redeploy backend
- [ ] Test full integration
