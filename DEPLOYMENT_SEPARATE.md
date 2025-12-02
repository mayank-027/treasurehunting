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
3. **Important**: Set **Root Directory** to `server`
4. Import your Git repository
5. Vercel will auto-detect:
   - Framework: Other
   - Build Command: (leave empty or use `echo 'No build needed'`)
   - Output Directory: (leave empty)
6. Add environment variables (see below)
7. Click "Deploy"

### Step 3: Backend Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/treasure-hunt
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-secure-password
JWT_SECRET=your-very-secure-secret-key-min-32-chars
CLIENT_URL=https://your-frontend.vercel.app
NODE_ENV=production
```

**Important**: 
- `CLIENT_URL` should be your frontend URL (set this after frontend is deployed)
- For now, you can set it to `*` temporarily to allow all origins

### Step 4: Note Your Backend URL

After deployment, note your backend URL:
- Example: `https://treasure-hunt-api.vercel.app`
- This will be used in the frontend configuration

---

## Part 2: Frontend Deployment

### Step 1: Update Frontend API Configuration

Update `src/lib/api.ts` to point to your backend URL:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL ?? 
  (import.meta.env.PROD 
    ? "https://your-backend-url.vercel.app/api"  // Replace with your backend URL
    : "http://localhost:5000/api");
```

Or set it via environment variable (recommended):

Create `.env.production`:
```
VITE_API_URL=https://your-backend-url.vercel.app/api
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
4. **Important**: Set **Root Directory** to `.` (root)
5. Vercel will auto-detect:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Add environment variable (optional):
   - `VITE_API_URL`: Your backend API URL
7. Click "Deploy"

### Step 3: Update Backend CORS

After frontend is deployed, update backend's `CLIENT_URL` environment variable:
- Go to Backend Vercel Project → Settings → Environment Variables
- Update `CLIENT_URL` to your frontend URL
- Redeploy backend

---

## Configuration Files

### Backend (`server/vercel.json`)
```json
{
  "functions": {
    "api/[...path].js": {
      "maxDuration": 10
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/[...path]"
    }
  ]
}
```

### Frontend (`vercel-frontend.json` or use Vercel auto-detection)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

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

### Backend Project
- `MONGO_URI` - MongoDB connection string
- `ADMIN_EMAIL` - Admin login email
- `ADMIN_PASSWORD` - Admin password
- `JWT_SECRET` - JWT signing secret
- `CLIENT_URL` - Frontend URL (for CORS)
- `NODE_ENV` - Set to `production`

### Frontend Project (Optional)
- `VITE_API_URL` - Backend API URL (if not hardcoded)

---

## Testing

1. **Test Backend**: 
   - Visit: `https://your-backend.vercel.app/api/health`
   - Should return: `{"status":"ok",...}`

2. **Test Frontend**:
   - Visit: `https://your-frontend.vercel.app`
   - Should load the app

3. **Test API Connection**:
   - Try logging in at `/admin/login`
   - Check browser console for API errors

---

## Troubleshooting

### CORS Errors
- Ensure `CLIENT_URL` in backend matches frontend URL exactly
- Check backend CORS configuration in `server/src/server.js`

### API Not Found
- Verify `VITE_API_URL` is set correctly
- Check backend URL is accessible
- Ensure API routes are working: `https://backend.vercel.app/api/health`

### Build Failures
- **Backend**: Ensure `server/package.json` has all dependencies
- **Frontend**: Ensure root `package.json` has all dependencies

### Timeout Errors
- Backend functions have 10s timeout (free tier)
- Optimize database queries
- Check MongoDB connection speed

---

## Advantages of Separate Deployment

✅ Independent scaling  
✅ Separate domains/subdomains  
✅ Easier to manage  
✅ Can update one without affecting the other  
✅ Better for team collaboration  

---

## Notes

- Backend API will be at: `https://your-backend.vercel.app/api/*`
- Frontend will be at: `https://your-frontend.vercel.app`
- Make sure to update CORS settings after both are deployed
- Keep backend URL in frontend environment variables for easy updates

