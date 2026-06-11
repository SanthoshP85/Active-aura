# ngrok Setup Guide - Step by Step

## Problem

The frontend was using hardcoded localhost. Now it's fixed to read from `.env.local` file.

## Solution

### Step 1: Get Your ngrok URL

Run ngrok on your backend (port 5000):

```bash
ngrok http 5000
```

You'll see output like:

```
Session Status                online
Version                       2.3.40
Region                        us (United States)
Connection buffered           False
Forwarding                    https://nondefining-unbombastically-marcel.ngrok-free.dev -> http://localhost:5000
Forwarding                    http://nondefining-unbombastically-marcel.ngrok-free.dev -> http://localhost:5000
```

**Copy your ngrok URL**: `https://nondefining-unbombastically-marcel.ngrok-free.dev`

### Step 2: Update `.env.local` File

Open `frontend/.env.local` and update the API URL:

```bash
# Before (localhost):
VITE_API_URL=http://localhost:5000/api

# After (ngrok):
VITE_API_URL=https://nondefining-unbombastically-marcel.ngrok-free.dev/api
```

**IMPORTANT**: Make sure you use HTTPS (not HTTP) for ngrok URLs!

### Step 3: Restart Frontend Development Server

```bash
# If npm run dev is running, stop it (Ctrl+C)
# Then restart it:
npm run dev
```

### Step 4: Verify in Browser Console

When the page loads, check the browser console (F12 → Console):

**You should see:**

```
🔗 API URL from env: https://nondefining-unbombastically-marcel.ngrok-free.dev/api
```

**NOT:**

```
🔗 Using default localhost API URL
```

### Step 5: Test API Call

1. Open DevTools (F12)
2. Go to Network tab
3. Try logging in or any API action
4. Check the request URL - it should be using your ngrok URL

**Should see something like:**

```
https://nondefining-unbombastically-marcel.ngrok-free.dev/api/auth/login
```

**NOT:**

```
http://localhost:5000/api/auth/login
```

## Troubleshooting

### Issue: Still using localhost

**Solution**:

- Make sure you edited the correct `.env.local` file in `frontend/` folder
- Restart `npm run dev` (hard refresh might not be enough)
- Check browser console log to confirm which URL is being used

### Issue: ngrok URL changed

**Symptom**: API calls fail after restarting ngrok

**Solution**:

- Each time you restart ngrok, it generates a new URL
- Update `.env.local` with the new URL
- Restart `npm run dev`

### Issue: HTTPS Certificate Error

**Symptom**: Network error even with ngrok URL

**Solution**:

- Make sure you're using `https://` (not `http://`)
- The URL from ngrok dashboard shows both - use the HTTPS one
- The backend ngrok tunnel should already have SSL

## Quick Reference

```bash
# Terminal 1: Start backend ngrok
ngrok http 5000
# Copy the HTTPS URL

# Terminal 2: Update .env.local
# Replace VITE_API_URL with your ngrok URL
# Example: https://your-unique-id.ngrok-free.dev/api

# Terminal 3: Start frontend
npm run dev

# Check console for: "🔗 API URL from env: https://..."
```

## File Locations

- **Frontend config**: `frontend/.env.local` ← Edit this file
- **Frontend env template**: `frontend/.env.example` ← Reference only
- **Backend**: Make sure ngrok tunnel is running on port 5000

## Common Ngrok URLs

- **Localhost**: `http://localhost:5000/api`
- **ngrok HTTPS**: `https://your-ngrok-id.ngrok-free.dev/api`
- **ngrok HTTP**: `http://your-ngrok-id.ngrok-free.dev/api` (avoid, use HTTPS)

## Switching Back to Localhost

Simply update `.env.local`:

```bash
VITE_API_URL=http://localhost:5000/api
```

Then restart `npm run dev`
