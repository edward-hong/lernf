# Pre-Deployment Checklist

## Backend (Encore Cloud)

- [ ] All tests passing (`encore test`)
- [ ] Secrets set in production environment
- [ ] CORS configured with production frontend URL
- [ ] Health endpoint returns 200 OK
- [ ] No hardcoded secrets in code
- [ ] Error logging configured
- [ ] Rate limiting configured (if needed)

## Frontend (Vercel)

- [ ] Build succeeds locally (`npm run build`)
- [ ] Environment variables set in Vercel
- [ ] `VITE_API_URL` points to production backend
- [ ] No console errors in production build
- [ ] All routes working (check routing config)
- [ ] Mobile responsive tested

## Integration

- [ ] Backend health check accessible from frontend
- [ ] CORS working (no errors in browser console)
- [ ] API calls succeed from production frontend
- [ ] AI provider settings work
- [ ] Scenario library loads
- [ ] Live chat works
- [ ] Intent analysis works

## Post-Deployment

- [ ] Production URL loads
- [ ] Backend responds to health checks
- [ ] Monitor logs for errors (first 30 minutes)
- [ ] Test critical user flows
- [ ] Verify analytics tracking (if configured)
- [ ] Update documentation with new URLs
