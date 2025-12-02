# CORS Configuration Fixes

## Issues Fixed

### 1. **Frontend Missing Credentials**
**Problem**: Frontend fetch requests didn't include `credentials: 'include'`, which is required when backend has `credentials: true` in CORS config.

**Fix**: Added `credentials: 'include'` to all fetch requests in `src/lib/api.ts`

### 2. **Limited CORS Headers**
**Problem**: Backend only allowed `Content-Type` and `Authorization` headers, which might be too restrictive for some browsers.

**Fix**: Expanded `allowedHeaders` to include:
- `Content-Type`
- `Authorization`
- `X-Requested-With`
- `Accept`
- `Origin`
- `Access-Control-Request-Method`
- `Access-Control-Request-Headers`

### 3. **Missing CORS Response Headers**
**Problem**: Backend didn't expose necessary headers or cache preflight requests.

**Fix**: Added:
- `exposedHeaders: ['Authorization']` - Allows frontend to read Authorization header
- `maxAge: 86400` - Caches preflight requests for 24 hours
- `optionsSuccessStatus: 204` - Proper status for OPTIONS requests

### 4. **Vercel Preview Deployments**
**Problem**: CORS only matched exact `.vercel.app` URLs, but preview deployments have different subdomains.

**Fix**: 
- Added regex pattern `/^https:\/\/.*\.vercel\.app$/` to match all Vercel deployments
- Added dynamic regex for preview deployments based on CLIENT_URL

### 5. **Better Error Logging**
**Problem**: CORS rejections weren't logged, making debugging difficult.

**Fix**: Added console warning when origin is rejected (in production) to help debug CORS issues.

## Configuration Summary

### Backend CORS (`server/src/server.js`)
```javascript
{
  origin: Dynamic function that checks against allowed origins
  credentials: true
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  allowedHeaders: [expanded list]
  exposedHeaders: ['Authorization']
  maxAge: 86400
  optionsSuccessStatus: 204
}
```

### Frontend Fetch (`src/lib/api.ts`)
```typescript
{
  credentials: 'include'  // Required for CORS with credentials
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <token>'  // When token exists
  }
}
```

## Testing CORS

### Local Development
1. Backend: `http://localhost:5000`
2. Frontend: `http://localhost:5173`
3. Both should work without CORS errors

### Production (Vercel)
1. Set `CLIENT_URL` environment variable to your frontend URL
2. Set `VITE_API_URL` in frontend to your backend URL + `/api`
3. Both should work without CORS errors

### Common CORS Errors and Solutions

**Error**: `Access-Control-Allow-Origin header missing`
- **Solution**: Check that `CLIENT_URL` matches your frontend URL exactly (including protocol and trailing slash)

**Error**: `Credentials flag is true, but Access-Control-Allow-Credentials is not 'true'`
- **Solution**: Already fixed - backend has `credentials: true` and frontend has `credentials: 'include'`

**Error**: `Request header field Authorization is not allowed`
- **Solution**: Already fixed - `Authorization` is in `allowedHeaders`

**Error**: `CORS policy violation` in production
- **Solution**: Check Vercel logs for rejected origin, then add it to `allowedOrigins` array

## Environment Variables Required

### Backend
- `CLIENT_URL` - Your frontend URL (e.g., `https://your-app.vercel.app`)

### Frontend
- `VITE_API_URL` - Your backend API URL (e.g., `https://your-api.vercel.app/api`)

## Notes

- In development mode, all origins are allowed for easier debugging
- In production, only explicitly allowed origins are permitted
- Vercel preview deployments are automatically allowed via regex pattern
- Preflight requests are cached for 24 hours to improve performance

