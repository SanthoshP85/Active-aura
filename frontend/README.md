# ActiveAura Frontend

Production-ready React.js frontend for the AI-powered fitness application.

## 🚀 Features

- **User Authentication**: Signup, login, and profile management
- **Dashboard**: Overview of fitness metrics and insights
- **Calorie Tracking**: Log and track daily food intake
- **Activity Logging**: Record workouts and exercises
- **Goal Management**: Create and track fitness goals
- **Insights**: AI-powered fitness recommendations
- **Chatbot**: Interactive AI fitness coach
- **Responsive Design**: Mobile-first design with Tailwind CSS

## 📦 Tech Stack

- **React 18**: UI framework
- **Vite**: Build tool and development server
- **React Router**: Client-side routing
- **Zustand**: State management
- **Axios**: HTTP client
- **Tailwind CSS**: Styling
- **Lucide React**: Icons

## 🛠️ Setup & Installation

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation Steps

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Create .env file from example
cp .env.example .env

# 4. Configure API endpoint (optional, default is http://localhost:5000/api)
# Edit .env and set VITE_API_URL if needed
```

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

The app will start on `http://localhost:3000`

### Production Build

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
frontend/
├── public/              # Static files
├── src/
│   ├── components/      # Reusable components
│   │   ├── auth/       # Authentication components
│   │   ├── common/     # Shared components
│   │   ├── dashboard/  # Dashboard components
│   │   ├── calories/   # Calorie tracking
│   │   ├── activities/ # Activity components
│   │   ├── goals/      # Goal components
│   │   ├── insights/   # Insights components
│   │   └── chatbot/    # Chatbot components
│   ├── pages/          # Page components
│   ├── services/       # API service layer
│   ├── context/        # Zustand stores
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   ├── styles/         # Global styles
│   ├── assets/         # Images and fonts
│   ├── App.jsx         # Main app component
│   └── index.jsx       # Entry point
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🔑 Key Files

### Services Layer (`src/services/`)

- `api.js` - Axios instance with interceptors
- `authService.js` - Authentication API calls
- `userService.js` - User profile API calls
- `caloriesService.js` - Calorie tracking API calls
- `activitiesService.js` - Activity logging API calls
- `goalsService.js` - Fitness goals API calls
- `insightsService.js` - Insights API calls
- `chatbotService.js` - Chatbot API calls

### State Management (`src/context/`)

- `authStore.js` - Authentication state (Zustand)
- `userStore.js` - User data state
- `dataStore.js` - App data state
- `uiStore.js` - UI state (modals, toasts)

### Custom Hooks (`src/hooks/`)

- `useAuth()` - Authentication hook
- `useUser()` - User data hook
- `useData()` - App data hook
- `useFetch()` - Data fetching hook
- `useDebounce()` - Debounce values
- `useLocalStorage()` - Local storage hook

### Utils (`src/utils/`)

- `constants.js` - App constants
- `formatters.js` - Data formatting functions
- `validators.js` - Form validation
- `helpers.js` - Utility functions
- `storage.js` - Local storage helpers

## 🔐 Authentication

The app uses JWT tokens for authentication:

- Token is stored in localStorage
- Automatically added to all API requests via Axios interceptor
- Redirects to login on 401 Unauthorized response
- Protected routes via AuthGuard component

## 🎨 Styling

- **Tailwind CSS**: Utility-first CSS framework
- **CSS Variables**: Custom theme colors and spacing
- **Responsive Design**: Mobile, tablet, desktop support
- **Dark Mode**: Can be added via Tailwind config

### Theme Colors

- Primary: `#0ea5e9` (Sky Blue)
- Success: `#10b981` (Green)
- Warning: `#f59e0b` (Amber)
- Danger: `#ef4444` (Red)

## 🔄 API Integration

All API calls go through the services layer:

```javascript
// Example: Login
import { authService } from "../services/authService";

const result = await authService.login(email, password);
```

Backend API base URL is configured in `vite.config.js`:

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true,
  }
}
```

## 📊 Data Flow

1. **Components** → Call hooks/stores
2. **Hooks** → Update Zustand stores
3. **Stores** → Call services
4. **Services** → Make API requests via Axios
5. **API** → Backend processes and responds
6. **Components** → Re-render with new state

## 🚨 Error Handling

- Global error handling via Axios interceptors
- Component-level error states
- User-friendly error messages
- Automatic logout on authentication errors

## 🧪 Debugging

- React DevTools browser extension recommended
- Zustand DevTools for state debugging
- Network tab for API debugging
- Console logs for development

## 📱 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🔒 Security

- Token stored in localStorage (consider httpOnly cookie for production)
- CSRF protection via backend
- Input validation on client side
- XSS protection via React escaping
- Rate limiting on backend

## 🌐 Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari 12+, Chrome Mobile 88+

## 📝 Environment Variables

Create a `.env` file:

```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=ActiveAura
VITE_APP_VERSION=1.0.0
```

## 🤝 Contributing

1. Follow the established folder structure
2. Use functional components with hooks
3. Keep components small and focused
4. Add PropTypes or JSDoc comments
5. Follow naming conventions

## 📄 License

ISC

## 🆘 Support

For issues and feature requests, please open an issue on the project repository.

---

**Happy Fitness Tracking! 💪**
