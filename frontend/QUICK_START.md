# Quick Command Reference

## For Localhost (Default)

```bash
# .env.local should have:
VITE_API_URL=http://localhost:5000/api

# Start frontend:
npm run dev

# API will call: http://localhost:5000/api/*
```

## For ngrok Remote Access

### Step 1: Start ngrok

```bash
cd ~/ngrok  # or wherever ngrok is installed
ngrok http 5000
# Copy the HTTPS URL from output
```

### Step 2: Update frontend config

```bash
# In frontend/.env.local, replace:
VITE_API_URL=https://YOUR-NGROK-ID.ngrok-free.dev/api
# Example: VITE_API_URL=https://nondefining-unbombastically-marcel.ngrok-free.dev/api
```

### Step 3: Restart frontend

```bash
# In frontend directory:
npm run dev

# Check console for: 🔗 API URL from env: https://...
```

## Verify It's Working

```bash
# Check browser console (F12):
# Should show: 🔗 API URL from env: https://your-ngrok-url.ngrok-free.dev/api

# Check Network tab in DevTools:
# Requests should go to: https://your-ngrok-url.ngrok-free.dev/api/...
# NOT to: http://localhost:5000/api/...
```

## Environment File Locations

- `frontend/.env.local` ← **EDIT THIS** (your actual config)
- `frontend/.env.example` ← Reference template
- `frontend/.env.local.example` ← Reference template

## All Environment Variables

| Variable         | Value                                                           | Purpose              |
| ---------------- | --------------------------------------------------------------- | -------------------- |
| VITE_API_URL     | `http://localhost:5000/api` or `https://xxx.ngrok-free.dev/api` | Backend API endpoint |
| VITE_APP_NAME    | `ActiveAura`                                                    | App name             |
| VITE_APP_VERSION | `1.0.0`                                                         | App version          |

## Troubleshooting

| Problem               | Solution                                |
| --------------------- | --------------------------------------- |
| Still using localhost | Restart `npm run dev` and check console |
| API calls failing     | Check that ngrok tunnel is running      |
| ngrok URL changed     | Update `.env.local` with new URL        |
| Wrong URL in requests | Check browser DevTools Network tab      |
