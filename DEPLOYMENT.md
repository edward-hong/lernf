# Deployment Guide: Encore Cloud + Vercel

## Prerequisites

- Node.js 18+ installed
- Encore CLI installed: `npm install -g encore`
- Vercel CLI installed: `npm install -g vercel`
- Accounts created:
  - Encore Cloud: https://encore.cloud
  - Vercel: https://vercel.com

## Initial Setup (One-Time)

### 1. Authenticate CLIs

```bash
# Encore
encore auth login

# Vercel
vercel login
```

### 2. Create Encore App

```bash
encore app create lernf
```

This creates your app in Encore Cloud. Note the app ID.

### 3. Set Backend Secrets

```bash
# DeepSeek API key (required for backend default provider)
encore secret set --env production DeepseekApiKey
# Paste your DeepSeek API key when prompted

# Optional: Set for preview environment too
encore secret set --env preview DeepseekApiKey
```

### 4. Deploy Backend (First Time)

```bash
npm run deploy:production
```

**Important:** Note the deployed URL from output:

```
Deployment successful!
  URL: https://production-lernf-xxxxx.encr.app
```

Copy this URL - you'll need it for frontend configuration.

### 5. Configure Frontend Environment

```bash
cd frontend

# Create production environment file
echo "VITE_API_URL=https://production-lernf-xxxxx.encr.app" > .env.production

# Replace xxxxx with your actual Encore Cloud URL from step 4
```

### 6. Deploy Frontend (First Time)

```bash
cd frontend
vercel --prod
```

Follow the prompts:

- Link to existing project? **No**
- Project name: **lernf** (or your preferred name)
- Framework: **Vite** (should auto-detect)

After deployment completes, note the URL:

```
Production: https://lernf.vercel.app
```

### 7. Update CORS Configuration

Now that you have the Vercel URL, update `encore.app` at the project root:

```json
{
  "id": "lernf-eau2",
  "lang": "typescript",
  "global_cors": {
    "allow_origins_without_credentials": [
      "https://lernf.vercel.app",
      "http://localhost:5173"
    ],
    "allow_origins_with_credentials": [
      "https://lernf.vercel.app",
      "http://localhost:5173"
    ]
  }
}
```

Redeploy backend:

```bash
npm run deploy:production
```

## Regular Deployment Workflow

### Deploy Backend Updates

```bash
npm run deploy:production
# or: encore cloud deploy --env production
```

### Deploy Frontend Updates

```bash
cd frontend
npm run deploy:production
# or: vercel --prod
```

## Preview Deployments

### Backend Preview

```bash
npm run deploy:preview
# or: encore cloud deploy --env preview
```

### Frontend Preview

```bash
cd frontend
npm run deploy:preview
# Creates preview deployment automatically
```

## Environment Variables

### Backend (Encore Cloud)

Managed via Encore CLI:

```bash
# View secrets
encore secret list --env production

# Set new secret
encore secret set --env production SECRET_NAME

# Update secret
encore secret set --env production DeepseekApiKey
```

### Frontend (Vercel)

Managed via Vercel CLI or dashboard:

```bash
# Set environment variable
vercel env add VITE_API_URL production
# Paste: https://production-lernf-xxxxx.encr.app

# Pull environment variables locally
vercel env pull .env.local
```

Or via Vercel Dashboard:

1. Go to project settings
2. Environment Variables
3. Add: `VITE_API_URL` = `https://production-lernf-xxxxx.encr.app`

## Monitoring

### Backend Logs (Encore)

```bash
# Tail production logs
encore logs --env production

# Filter by endpoint
encore logs --env production --endpoint chat
```

### Frontend (Vercel)

```bash
# View deployment logs
vercel logs [deployment-url]

# Or check Vercel dashboard
```

## Rollback

### Backend

Encore keeps deployment history:

```bash
# List deployments
encore cloud deployments --env production

# Rollback to previous
encore cloud rollback --env production --deployment [deployment-id]
```

### Frontend

Vercel keeps all deployments:

1. Go to Vercel dashboard
2. Select project
3. Deployments tab
4. Find previous successful deployment
5. Click "Promote to Production"

## Troubleshooting

### CORS Errors

**Symptom:** Frontend can't reach backend, CORS errors in console

**Solution:**

1. Verify `VITE_API_URL` is set correctly in Vercel
2. Check `encore.app` CORS config includes your Vercel URL
3. Redeploy backend after CORS changes

### Backend Not Responding

**Symptom:** 502/504 errors from backend

**Solution:**

1. Check Encore logs: `encore logs --env production`
2. Verify secrets are set: `encore secret list --env production`
3. Check health endpoint: `curl https://production-lernf-xxxxx.encr.app/api/health`

### Environment Variables Not Working

**Symptom:** Frontend shows `undefined` for env vars

**Solution:**

1. Vercel requires rebuild after env var changes
2. Redeploy: `vercel --prod`
3. Check build logs for env var values

### Custom Domain (Optional)

#### Backend (Encore)

Custom domains managed in Encore Cloud dashboard:

1. Go to app settings
2. Add custom domain (e.g., `api.lernf.com`)
3. Update DNS records as instructed

#### Frontend (Vercel)

```bash
vercel domains add lernf.com
# Follow DNS configuration instructions
```

Or via Vercel dashboard:

1. Project settings > Domains
2. Add domain
3. Configure DNS
