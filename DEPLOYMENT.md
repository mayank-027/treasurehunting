# Vercel Deployment Guide

This guide will help you deploy your Treasure Hunt application to Vercel with separate backend and frontend deployments.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Atlas**: Set up a MongoDB database (free tier available)
3. **GitHub/GitLab/Bitbucket**: Your code should be in a Git repository

## Architecture

- **Backend**: Deployed as Vercel Serverless Functions (Express.js API)
- **Frontend**: Deployed as a static site (React/Vite)

## Step 1: Prepare MongoDB Database

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist IP addresses (for Vercel, use `0.0.0.0/0` to allow all)
5. Get your connection string (MONGO_URI)

## Step 2: Deploy Backend

### Option A: Using Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Navigate to backend directory**:
   ```bash
   cd server
   ```

3. **Login to Vercel**:
   ```bash
   vercel login
   ```

4. **Deploy**:
   ```bash
   vercel
   ```
   - Follow the prompts
   - When asked for project settings, use defaults
   - **Important**: Set the root directory as `server` (or deploy from within server folder)

5. **Set Environment Variables**:
   ```bash
   vercel env add MONGO_URI
   vercel env add CLIENT_URL
   vercel env add ADMIN_EMAIL
   vercel env add ADMIN_PASSWORD
   vercel env add JWT_SECRET
   vercel env add NODE_ENV
   ```
   
   Or set them in Vercel Dashboard:
   - Go to your project → Settings → Environment Variables
   - Add the following:
     - `MONGO_URI`: Your MongoDB connection string
     - `CLIENT_URL`: Your frontend URL (will be set after frontend deployment)
     - `ADMIN_EMAIL`: Admin email for login
     - `ADMIN_PASSWORD`: Admin password (use a strong password)
     - `JWT_SECRET`: A random secret string (generate with `openssl rand -base64 32`)
     - `NODE_ENV`: `production`

6. **Redeploy** to apply environment variables:
   ```bash
   vercel --prod
   ```

7. **Note your backend URL**: After deployment, Vercel will provide a URL like `https://your-backend.vercel.app`

### Option B: Using Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your Git repository
4. **Configure Project**:
   - **Root Directory**: `server`
   - **Framework Preset**: Other
   - **Build Command**: Leave empty (not needed for serverless)
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

5. **Add Environment Variables** (same as above)

6. Click "Deploy"

## Step 3: Deploy Frontend

### Option A: Using Vercel CLI

1. **Navigate to frontend directory** (root of project):
   ```bash
   cd ..  # Go back to treasure-hunt-js root
   ```

2. **Create `.env.production` file** (optional, or use Vercel env vars):
   ```env
   VITE_API_URL=https://your-backend.vercel.app/api
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   - Follow the prompts
   - Set root directory as `.` (current directory)

4. **Set Environment Variables**:
   ```bash
   vercel env add VITE_API_URL production
   ```
   - Value: `https://your-backend.vercel.app/api` (use your actual backend URL)

5. **Redeploy**:
   ```bash
   vercel --prod
   ```

### Option B: Using Vercel Dashboard

1. Go to Vercel Dashboard
2. Click "Add New Project"
3. Import the same Git repository (or create a separate repo for frontend)
4. **Configure Project**:
   - **Root Directory**: `.` (or leave empty if frontend is root)
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Add Environment Variable**:
   - `VITE_API_URL`: `https://your-backend.vercel.app/api`

6. Click "Deploy"

## Step 4: Update Backend CORS

After deploying the frontend, update the backend's `CLIENT_URL` environment variable:

1. Go to your backend project in Vercel Dashboard
2. Settings → Environment Variables
3. Update `CLIENT_URL` to your frontend URL (e.g., `https://your-frontend.vercel.app`)
4. Redeploy the backend

## Step 5: Verify Deployment

1. **Test Backend**:
   - Visit `https://your-backend.vercel.app/health`
   - Should return: `{"status":"ok",...}`

2. **Test Frontend**:
   - Visit your frontend URL
   - Try logging in as admin
   - Verify API calls work

## Environment Variables Summary

### Backend (server/.env or Vercel Environment Variables)
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
CLIENT_URL=https://your-frontend.vercel.app
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-secure-password
JWT_SECRET=your-random-secret-key
NODE_ENV=production
```

### Frontend (Vercel Environment Variables)
```
VITE_API_URL=https://your-backend.vercel.app/api
```

## Troubleshooting

### Backend Issues

1. **Database Connection Fails**:
   - Check MongoDB Atlas IP whitelist includes `0.0.0.0/0`
   - Verify MONGO_URI is correct
   - Check MongoDB user permissions

2. **CORS Errors**:
   - Ensure `CLIENT_URL` matches your frontend URL exactly
   - Check backend logs in Vercel Dashboard

3. **Environment Variables Not Working**:
   - Redeploy after adding env vars
   - Check variable names match exactly (case-sensitive)

### Frontend Issues

1. **API Calls Fail**:
   - Verify `VITE_API_URL` is set correctly
   - Check browser console for errors
   - Ensure backend is deployed and accessible

2. **Build Fails**:
   - Check build logs in Vercel Dashboard
   - Ensure all dependencies are in package.json
   - Verify Node.js version compatibility

## Custom Domains

### Backend Custom Domain
1. Go to backend project → Settings → Domains
2. Add your custom domain
3. Update `CLIENT_URL` if needed

### Frontend Custom Domain
1. Go to frontend project → Settings → Domains
2. Add your custom domain
3. Update `VITE_API_URL` to use custom backend domain

## Continuous Deployment

Both projects will automatically redeploy when you push to your Git repository's main branch (if connected via Vercel Dashboard).

## Notes

- Vercel serverless functions have a 10-second timeout for Hobby plan
- MongoDB connections are cached between function invocations
- Environment variables are encrypted and secure in Vercel
- Preview deployments are created for each pull request

## Support

For issues specific to:
- **Vercel**: Check [Vercel Documentation](https://vercel.com/docs)
- **MongoDB Atlas**: Check [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)

