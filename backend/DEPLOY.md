Deployment notes for Render (backend) + Vercel (frontend)

1. Environment variables (Render service settings)

- `MONGO_URI` - production MongoDB connection string
- `SESSION_SECRET` - long random string used to sign session cookies
- `FRONTEND_URL` - your Vercel front-end origin, e.g. `https://your-app.vercel.app`
- `SESSION_COOKIE_DOMAIN` - optional, use if you need a specific cookie domain (e.g. `.yourdomain.com`)
- `CLIENT_ID`, `CLIENT_SECRET`, `REDIRECT_URI`, `REFRESH_TOKEN` - Google OAuth credentials if used

2. Important server settings

- `app.set('trust proxy', 1)` is configured in `server.js` when `NODE_ENV=production` to ensure secure cookies are set properly behind Render's proxy.
- CORS is configured to allow `FRONTEND_URL` and `credentials: true` so session cookies work across sites. Do NOT set `Access-Control-Allow-Origin: *` when using cookies.
- Session cookie settings when `NODE_ENV=production`:
  - `secure: true` (requires HTTPS)
  - `sameSite: 'none'` (to allow cross-site cookies)

3. Vercel environment variables

- Set `VITE_API_URL` or `BASE_URL` (depending on your frontend config) to your Render backend URL, e.g. `https://api-yourapp.onrender.com` so frontend requests go to the correct API.

4. Google OAuth redirect URIs

- If you use Google OAuth, update authorized redirect URIs in Google Cloud Console to include the deployed backend redirect (e.g., `https://api-yourapp.onrender.com/auth/google/callback`) or frontend callback depending on your flow.

5. Testing checklist after deploy

- Confirm `Set-Cookie` header is present on login responses and cookie attributes include `Secure` and `SameSite=None` in production.
- Confirm subsequent requests include the cookie and server recognizes the session.
- Verify Google OAuth flow completes and tokens are exchanged properly.

6. Security recommendations

- Use a strong `SESSION_SECRET` and keep it secret in Render's environment settings.
- Consider adding `helmet` and rate-limiting for additional protection.
- Use HTTPS for both frontend and backend (Vercel/Render provide TLS by default).
