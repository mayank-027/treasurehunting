# Quick Deployment Checklist

## Backend Deployment

1. **Navigate to server directory**:
   ```bash
   cd server
   ```

2. **Deploy to Vercel**:
   ```bash
   vercel
   ```

3. **Set environment variables** (in Vercel Dashboard or CLI):
   - `MONGO_URI` - MongoDB connection string
   - `CLIENT_URL` - Frontend URL (set after frontend deployment)
   - `ADMIN_EMAIL` - Admin email
   - `ADMIN_PASSWORD` - Admin password
   - `JWT_SECRET` - Random secret (generate: `openssl rand -base64 32`)
   - `NODE_ENV` - `production`

4. **Redeploy**:
   ```bash
   vercel --prod
   ```

5. **Note backend URL**: `https://your-backend.vercel.app`

## Frontend Deployment

1. **Navigate to project root**:
   ```bash
   cd ..
   ```

2. **Deploy to Vercel**:
   ```bash
   vercel
   ```

3. **Set environment variable**:
   - `VITE_API_URL` - `https://your-backend.vercel.app/api`

4. **Redeploy**:
   ```bash
   vercel --prod
   ```

5. **Update backend CLIENT_URL** with frontend URL

## Testing

- Backend health: `https://your-backend.vercel.app/health`
- Frontend: Visit your frontend URL and test login

## Important URLs to Save

- Backend URL: `https://your-backend.vercel.app`
- Frontend URL: `https://your-frontend.vercel.app`
- MongoDB Atlas Dashboard: [atlas.mongodb.com](https://cloud.mongodb.com)

