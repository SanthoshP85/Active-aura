# Environment Configuration Guide

## Overview

The ActiveAura frontend supports both local development and remote access via ngrok tunneling.

## Quick Start

### Local Development (Default)

1. Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

2. Keep the default configuration:

```bash
VITE_API_URL=http://localhost:5000/api
```

3. Run the development server:

```bash
npm run dev
```

### Remote Access with ngrok

#### Step 1: Start ngrok

```bash
# Terminal 1: Backend ngrok tunnel
ngrok http 5000

# Terminal 2: Frontend ngrok tunnel (optional)
ngrok http 3000
```

You'll see output like:

```
Forwarding                    https://nondefining-unbombastically-marcel.ngrok-free.dev -> http://localhost:5000
```

#### Step 2: Update Environment Variable

Create or update `.env.local`:

```bash
# For ngrok backend access
VITE_API_URL=https://your-ngrok-url.ngrok-free.dev/api

# Example:
VITE_API_URL=https://nondefining-unbombastically-marcel.ngrok-free.dev/api
```

#### Step 3: Run Frontend

```bash
npm run dev
```

## Configuration Files

### `.env.example`

- Template file for environment variables
- Contains comments explaining each option
- Safe to commit to version control

### `.env.local` (or `.env`)

- Actual environment configuration used by the app
- Created by copying from `.env.example`
- **DO NOT commit** to version control (add to `.gitignore`)

## Environment Variables

| Variable           | Purpose              | Example                                                                    |
| ------------------ | -------------------- | -------------------------------------------------------------------------- |
| `VITE_API_URL`     | Backend API endpoint | `http://localhost:5000/api` or `https://your-ngrok-url.ngrok-free.dev/api` |
| `VITE_APP_NAME`    | App display name     | `ActiveAura`                                                               |
| `VITE_APP_VERSION` | App version          | `1.0.0`                                                                    |

## How It Works

1. **Development** (`npm run dev`):
   - Frontend runs on `http://localhost:3000`
   - Backend API at `http://localhost:5000/api`
   - All local, no ngrok needed

2. **With ngrok** (remote testing):
   - Frontend can be at `http://localhost:3000` or accessed via ngrok
   - Backend ngrok URL: `https://your-ngrok-url.ngrok-free.dev`
   - Frontend API calls to: `https://your-ngrok-url.ngrok-free.dev/api`

## Troubleshooting

### CORS Issues with ngrok

If you get CORS errors, ensure the backend allows your ngrok URL:

```javascript
// Backend cors.js
const allowedOrigins = [
  "http://localhost:3000",
  "https://your-ngrok-url.ngrok-free.dev",
];
```

### API Not Responding

1. Check `VITE_API_URL` is correctly set
2. Verify ngrok tunnel is still active (URLs refresh on restart)
3. Ensure backend server is running
4. Check network tab in DevTools for the actual API URL being called

### Switching Between Local and ngrok

Simply update `.env.local` and restart the dev server:

```bash
# Switch back to local
VITE_API_URL=http://localhost:5000/api

# Or switch to ngrok
VITE_API_URL=https://your-ngrok-url.ngrok-free.dev/api
```

## Tips

- **ngrok URLs are temporary**: They change when you restart ngrok. Update `.env.local` with the new URL.
- **Keep ngrok running**: Leave the ngrok terminal open while developing
- **Test both modes**: Ensure your app works both locally and with ngrok
- **DevTools**: Check Network tab to see which API URL is being used

## Files Modified

- `.env.example` - Template with ngrok example
- `.env.local.example` - Sample local configuration
- `frontend/src/utils/constants.js` - Intelligent API URL selection
