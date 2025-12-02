# Vercel Deployment Guide

This guide explains how to deploy the Treasure Hunt platform on Vercel.

## Project Structure

- **Frontend**: Main directory (React + Vite)
- **Backend**: `server/` directory (Express.js)
- **API Routes**: `api/[...path].js` (Serverless handler)

## Deployment Steps

### 1. Prerequisites

- Vercel account
- MongoDB Atlas account (or MongoDB instance)
- Git repository

### 2. Environment Variables

Set the following environment variables in Vercel Dashboard:

**Go to: Project Settings → Environment Variables**

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/treasure-hunt
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-secure-password
JWT_SECRET=your-very-secure-secret-key-min-32-chars
CLIENT_URL=https://your-project.vercel.app
NODE_ENV=production
```

**Important Notes:**
- `MONGO_URI`: Your MongoDB connection string (use MongoDB Atlas for cloud)
- `JWT_SECRET`: Use a strong, random secret (at least 32 characters)
- `CLIENT_URL`: Will be automatically set by Vercel, but you can override it
- `ADMIN_EMAIL` and `ADMIN_PASSWORD`: Your admin credentials

### 3. Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# For production
vercel --prod
```

#### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (root)
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `dist`
5. Add environment variables (see step 2)
6. Click "Deploy"

### 4. Build Configuration

The project uses:
- **Build Command**: `npm run vercel-build`
  - Installs server dependencies
  - Builds frontend with Vite
- **Output Directory**: `dist` (frontend build)
- **API Routes**: Handled by `api/[...path].js`

### 5. API Routes

All API requests to `/api/*` are handled by the serverless function:
- `api/[...path].js` wraps the Express app
- Uses `serverless-http` for compatibility
- Database connection is cached globally

### 6. Post-Deployment

1. **Test the API**: Visit `https://your-project.vercel.app/api/health`
2. **Test Frontend**: Visit `https://your-project.vercel.app`
3. **Admin Login**: Go to `/admin/login` and test admin access
4. **Team Signup**: Test team registration at `/team/signup`

### 7. Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update `CLIENT_URL` environment variable if needed
4. Update CORS settings in `server/src/server.js` if needed

## Troubleshooting

### Database Connection Issues

- Verify `MONGO_URI` is correct
- Check MongoDB Atlas IP whitelist (allow all IPs: `0.0.0.0/0`)
- Ensure MongoDB user has proper permissions

### API Routes Not Working

- Check `vercel.json` configuration
- Verify `api/[...path].js` exists
- Check Vercel function logs in dashboard

### Build Failures

- Ensure all dependencies are in `package.json`
- Check Node.js version (should be 20.x)
- Review build logs in Vercel dashboard

### CORS Issues

- Verify `CLIENT_URL` matches your Vercel deployment URL
- Check CORS configuration in `server/src/server.js`
- Vercel preview URLs are automatically allowed

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `MONGO_URI` | Yes | MongoDB connection string | `mongodb+srv://...` |
| `ADMIN_EMAIL` | Yes | Admin login email | `admin@example.com` |
| `ADMIN_PASSWORD` | Yes | Admin login password | `secure-password` |
| `JWT_SECRET` | Yes | Secret for JWT tokens | `random-secret-32-chars` |
| `CLIENT_URL` | No | Frontend URL (auto-set by Vercel) | `https://app.vercel.app` |
| `NODE_ENV` | No | Environment (auto-set) | `production` |

## Notes

- Serverless functions have a 10s timeout on free tier, 60s on Pro
- Database connections are cached to improve performance
- Frontend is served as static files
- Backend runs as serverless functions
- All `/api/*` routes are handled by the serverless handler

## Support

For issues:
1. Check Vercel function logs
2. Check MongoDB connection
3. Verify environment variables
4. Review `vercel.json` configuration

