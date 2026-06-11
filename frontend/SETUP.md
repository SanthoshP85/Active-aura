# Frontend Setup Guide

Complete step-by-step guide to set up and run the ActiveAura React frontend.

## ✅ Prerequisites

Make sure you have the following installed on your system:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** (optional, for cloning)
- A code editor like **VS Code**

### Verify Installation

```bash
node --version  # Should be v16+
npm --version   # Should be 7+
```

---

## 🚀 Quick Start (5 minutes)

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

This installs all required packages from `package.json`.

### 3. Create Environment File

```bash
cp .env.example .env
```

Edit `.env` if you need to change the API endpoint:

```
VITE_API_URL=http://localhost:5000/api
```

### 4. Start Development Server

```bash
npm run dev
```

Open your browser and go to: **http://localhost:3000**

---

## 📦 Project Structure

```
frontend/
├── public/                    # Static files (favicon, etc.)
├── src/
│   ├── components/
│   │   ├── auth/             # Login/Signup forms
│   │   ├── common/           # Reusable UI components
│   │   ├── dashboard/        # Dashboard cards
│   │   ├── calories/         # Calorie tracking
│   │   ├── activities/       # Activity logging
│   │   ├── goals/            # Goal management
│   │   ├── insights/         # Insights display
│   │   └── chatbot/          # Chat interface
│   ├── pages/                # Full page components
│   ├── services/             # API service layer
│   ├── context/              # Zustand state stores
│   ├── hooks/                # Custom React hooks
│   ├── utils/                # Utility functions
│   ├── styles/               # CSS and styles
│   ├── assets/               # Images, icons, fonts
│   ├── App.jsx               # Main app component
│   └── index.jsx             # React entry point
├── .env.example              # Environment template
├── .gitignore                # Git ignore rules
├── package.json              # Dependencies
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # Tailwind CSS config
├── postcss.config.js         # PostCSS config
├── .eslintrc.json            # ESLint rules
└── README.md                 # Frontend documentation
```

---

## 💻 Available Scripts

### Development

```bash
npm run dev
```

- Starts Vite dev server on http://localhost:3000
- Hot Module Replacement (HMR) enabled
- Auto-refresh on file changes

### Production Build

```bash
npm run build
```

- Creates optimized build in `dist/` folder
- Minifies code and assets
- Ready for deployment

### Preview Build

```bash
npm run preview
```

- Preview production build locally
- Run after `npm run build`

### Linting

```bash
npm run lint          # Check for linting errors
npm run lint:fix      # Auto-fix linting errors
```

---

## 🔧 Configuration Files

### `vite.config.js`

Vite configuration including:

- Development server settings (port 3000)
- API proxy to backend (`/api` → `http://localhost:5000`)
- Build optimization settings

### `tailwind.config.js`

Tailwind CSS customization:

- Custom colors (primary, success, warning, danger)
- Extended theme
- Custom animations

### `postcss.config.js`

PostCSS plugins for Tailwind compilation

### `.env` and `.env.example`

Environment variables:

- `VITE_API_URL` - Backend API base URL
- `VITE_APP_NAME` - Application name
- `VITE_APP_VERSION` - Application version

---

## 🔐 Authentication Flow

1. **Signup** → Create account → JWT token issued
2. **Login** → Authenticate → JWT token stored
3. **Protected Routes** → AuthGuard checks token
4. **API Calls** → Token added to every request
5. **401 Response** → Logout + Redirect to login

### Token Storage

- Stored in `localStorage` with key: `auth_token`
- User data also stored with key: `user_data`
- Auto-cleared on logout or 401 response

---

## 🌐 API Endpoints (from Backend)

### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Calories

- `POST /api/calories/log` - Log food item
- `GET /api/calories/daily?date=...` - Get daily summary
- `GET /api/calories/history?startDate=...&endDate=...` - Get history
- `GET /api/calories/trends?days=7` - Get trends

### Activities

- `POST /api/activities/log` - Log activity
- `GET /api/activities/daily?date=...` - Get daily activities
- `GET /api/activities/history?...` - Get activity history
- `GET /api/activities/trends?days=7` - Get trends

### Goals

- `POST /api/goals` - Create goal
- `GET /api/goals` - Get all goals
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

### Insights

- `GET /api/insights?days=7` - Get AI insights
- `GET /api/insights/calorie-trend?days=7` - Calorie analysis
- `GET /api/insights/weight-plateau?days=30` - Weight plateau

### Chatbot

- `POST /api/chatbot/message` - Send message to chatbot
- `GET /api/chatbot/history?limit=50` - Get chat history

---

## 🎨 Component Examples

### Using a Custom Hook

```javascript
import { useAuth } from "../hooks/useAuth";

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  return <div>{isAuthenticated && <p>Welcome, {user.fullName}!</p>}</div>;
}
```

### Using Zustand Store

```javascript
import { useData } from "../hooks/useData";

function Dashboard() {
  const { calories, fetchDailyCalories } = useData();

  useEffect(() => {
    fetchDailyCalories(new Date());
  }, []);

  return <p>{calories.daily?.totalCalories} kcal</p>;
}
```

### API Service Usage

```javascript
import { caloriesService } from "../services/caloriesService";

async function logFood() {
  try {
    const result = await caloriesService.logFood({
      foodName: "Chicken",
      mealType: "lunch",
      calories: 300,
    });
  } catch (error) {
    console.error("Error:", error);
  }
}
```

---

## 🐛 Troubleshooting

### Port 3000 Already in Use

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>
```

### API Requests Failing

1. Check backend is running on port 5000
2. Verify `VITE_API_URL` in `.env`
3. Check browser console for CORS errors
4. Ensure backend CORS settings are correct

### Styling Issues

1. Rebuild Tailwind: `npm run build`
2. Clear browser cache (Ctrl+Shift+Delete)
3. Restart dev server

### Node Modules Issues

```bash
rm -rf node_modules package-lock.json
npm install
```

### Port 3000 in Use

See "Port 3000 Already in Use" above

---

## 📱 Development Tips

### Hot Module Replacement (HMR)

- Changes auto-apply without full page reload
- State is preserved when possible
- Speeds up development workflow

### React DevTools Extension

- Install from Chrome Web Store
- Debug component hierarchy
- Inspect props and state

### Zustand DevTools

- Monitor state changes
- Time-travel debugging
- Add via browser extension

### Network Tab

- Monitor API requests
- Check response status and data
- Debug authentication issues

---

## 🏗️ Building for Production

```bash
# 1. Create optimized build
npm run build

# 2. Test the build locally
npm run preview

# 3. Deploy to hosting
# Copy contents of dist/ folder to your hosting service
```

### Deployment Checklist

- [ ] Environment variables set correctly
- [ ] Backend API URL points to production
- [ ] Build completes without errors
- [ ] Test all major features
- [ ] Check mobile responsiveness
- [ ] Verify authentication works
- [ ] Check all external API calls

---

## 📚 Useful Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Router](https://reactrouter.com)
- [Axios](https://axios-http.com)

---

## ❓ Common Issues

### "Cannot find module" errors

```bash
npm install
npm run build
```

### Blank page on load

1. Check browser console for errors
2. Verify backend is running
3. Check API URL in `.env`

### Styles not applying

1. Restart dev server
2. Clear browser cache
3. Check Tailwind class names are correct

### Authentication loop

1. Check token in localStorage
2. Verify backend JWT secret matches
3. Check token expiration time

---

## 🚀 Next Steps

1. **Start the dev server**: `npm run dev`
2. **Create an account**: Go to Signup page
3. **Log in**: Use credentials from signup
4. **Explore features**: Dashboard, Calories, Activities, etc.
5. **Build**: `npm run build` when ready for production

---

## 📞 Support

- Check the main [README.md](./README.md) for more info
- Review Backend [README](../backend/README.md) for API details
- Check [FRONTEND_STRUCTURE.md](../FRONTEND_STRUCTURE.md) for architecture

---

**Happy coding! 🚀**
