# Separate Frontend & Backend Deployment

This project can be deployed in two ways:

## Option 1: Single Deployment (Default)
- Frontend and backend in one Vercel project
- See main `README.md` for instructions

## Option 2: Separate Deployment (This Guide)
- Frontend: One Vercel project
- Backend: Another Vercel project
- See `DEPLOYMENT_SEPARATE.md` for detailed instructions

## Quick Start - Separate Deployment

### Backend (First)
1. Deploy `server/` directory as a Vercel project
2. Set Root Directory to `server` in Vercel
3. Add environment variables (see `DEPLOYMENT_SEPARATE.md`)
4. Note your backend URL

### Frontend (Second)
1. Update `src/lib/api.ts` with your backend URL
2. Or set `VITE_API_URL` environment variable
3. Deploy root directory as a Vercel project
4. Update backend's `CLIENT_URL` with frontend URL

See `DEPLOYMENT_SEPARATE.md` for complete instructions.

