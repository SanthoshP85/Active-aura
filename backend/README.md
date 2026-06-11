# ActiveAura Backend API

**Production-Ready AI-Powered Fitness Application Backend**

An enterprise-grade fitness platform featuring AI-driven insights, RAG-enhanced chatbot, personalized calorie tracking, and workout management with Redis vector database integration.

---

## 🚀 Features

### 🔐 Authentication & Security

- **JWT-based authentication** with secure token generation
- **Bcrypt password hashing** with salt rounds
- **Rate limiting** on auth endpoints (5 attempts per 15 mins)
- **CORS enabled** with configurable origin
- **Helmet security headers** for production-grade protection

### 👤 User Management

- Comprehensive user profiles with health metrics
- Password change functionality
- Weight history tracking
- Personalized fitness goals management

### 🍽️ Calorie Tracking

- Daily calorie logging with meal categorization
- Food search integration (mock API - ready for USDA FoodData Central)
- Automatic macro calculation (protein, carbs, fats)
- Daily summaries with nutritional breakdown
- Historical data retrieval by date range

### 🏋️ Activity Tracking

- Comprehensive workout logging with intensity levels
- Multiple workout types (running, cycling, yoga, gym, etc.)
- Heart rate monitoring
- Weekly activity summaries
- Calorie burn calculations

### 🎯 Goals Management

- Intelligent goal creation with automatic calorie targets
- BMR & TDEE calculations
- Macro recommendations based on goal type
- Progress percentage tracking
- Goal completion and history

### 📊 AI-Powered Insights

- **Rule-based insights engine** grounded in user data
- Calorie surplus/deficit detection
- Weight plateau analysis
- Overtraining detection
- Goal progress tracking
- Macro distribution analysis

### 🤖 RAG-Enhanced Chatbot

- **Retrieval Augmented Generation** using Redis vector index
- Context-aware responses based on user data
- OpenAI / Gemini API integration
- Confidence scoring
- Never hallucinated responses - data-grounded only

### 🗄️ Redis Vector Database

- Vector embeddings for fitness data
- Cosine similarity search
- Context retrieval for RAG
- Time-based data expiration (30 days)

---

## 📋 Tech Stack

```
Frontend:        React.js (separate repo)
Backend:         Node.js + Express.js
Database:        MongoDB Atlas
Vector DB:       Redis Stack
Authentication:  JWT + Bcrypt
LLM:             OpenAI / Gemini
Validation:      Joi
API Security:    Helmet, CORS, Rate Limiting
```

---

## 📁 Project Structure

```
backend/
├── config/
│   ├── database.js        # MongoDB connection
│   └── redis.js           # Redis connection
├── models/
│   ├── User.js            # User schema
│   ├── Goals.js           # Goals schema
│   ├── CaloriesTracker.js # Daily calorie tracking
│   ├── FoodsLogged.js     # Food logging
│   └── Activities.js      # Workout tracking
├── modules/
│   ├── auth/              # Authentication (signup, login)
│   ├── users/             # User profile management
│   ├── goals/             # Goal management
│   ├── calories/          # Calorie tracking
│   ├── activities/        # Workout tracking
│   ├── insights/          # AI insights engine
│   ├── rag/               # RAG service
│   └── chatbot/           # Chatbot service
├── middleware/
│   ├── auth.js            # JWT authentication
│   ├── errorHandler.js    # Error handling
│   └── security.js        # CORS, Helmet, Rate limiting
├── utils/
│   ├── jwt.js             # JWT utilities
│   ├── password.js        # Password hashing
│   ├── validation.js      # Joi schemas
│   ├── response.js        # Response formatting
│   └── calorieCalculator.js # BMR, TDEE calculations
├── routes/
│   └── apiRoutes.js       # Route aggregation
├── index.js               # Entry point
├── package.json
└── .env                   # Environment variables
```

---

## 🔧 Setup & Installation

### Prerequisites

- Node.js 16+
- MongoDB Atlas account
- Redis Stack instance
- OpenAI / Gemini API key (optional for chatbot)

### Installation Steps

1. **Clone and navigate to backend**

   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables** (`.env`)

   ```env
   NODE_ENV=development
   PORT=5000

   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/activeaura

   REDIS_HOST=localhost
   REDIS_PORT=6379

   JWT_SECRET=your-super-secret-key
   JWT_EXPIRE=7d

   OPENAI_API_KEY=sk-...
   LLM_PROVIDER=openai

   FRONTEND_URL=http://localhost:3000
   ```

3. **Start the server**

   ```bash
   # Development (with nodemon)
   npm run dev

   # Production
   npm start
   ```

4. **Verify health**
   ```bash
   curl http://localhost:5000/api/health
   ```

---

## 📚 API Endpoints

### 🔐 Authentication

```
POST   /api/auth/signup           # Register new user
POST   /api/auth/login            # Login user
GET    /api/auth/me               # Get current user (protected)
```

**Signup Payload:**

```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "currentWeight": 85,
  "goalWeight": 75,
  "height": 180,
  "age": 30,
  "gender": "male",
  "activityLevel": "moderate"
}
```

### 👤 User Management

```
GET    /api/users/profile         # Get user profile
PUT    /api/users/profile         # Update profile
PUT    /api/users/change-password # Change password
GET    /api/users/weight-history  # Get weight history
```

### 🎯 Goals

```
POST   /api/goals                 # Create goal
GET    /api/goals                 # Get all goals
GET    /api/goals/active          # Get active goals
GET    /api/goals/:goalId         # Get single goal
PUT    /api/goals/:goalId/progress # Update progress
PUT    /api/goals/:goalId/complete # Complete goal
DELETE /api/goals/:goalId         # Delete goal
```

### 🍽️ Calories

```
POST   /api/calories/log          # Log food
GET    /api/calories/daily        # Get daily summary
GET    /api/calories/range        # Get date range
GET    /api/calories/search       # Search food
DELETE /api/calories/food/:foodId # Remove food
```

**Log Food Payload:**

```json
{
  "foodName": "Chicken Breast",
  "mealType": "lunch",
  "servingSize": "100g",
  "servingQuantity": 1,
  "calories": 165,
  "protein": 31,
  "carbs": 0,
  "fats": 3.6,
  "date": "2024-01-20"
}
```

### 🏋️ Activities

```
POST   /api/activities/log        # Log workout
GET    /api/activities/range      # Get date range
GET    /api/activities/date       # Get by date
GET    /api/activities/weekly     # Get weekly summary
PUT    /api/activities/:id        # Update activity
DELETE /api/activities/:id        # Delete activity
```

**Log Activity Payload:**

```json
{
  "date": "2024-01-20",
  "workoutType": "running",
  "duration": 45,
  "caloriesBurned": 450,
  "intensity": "high",
  "distance": 7.5,
  "heartRateAvg": 155,
  "heartRateMax": 175
}
```

### 📊 Insights

```
GET    /api/insights              # Get all insights
```

**Response:**

```json
{
  "userId": "...",
  "generatedAt": "2024-01-20T10:00:00Z",
  "insights": [
    {
      "type": "calorie_trend",
      "severity": "warning",
      "title": "⚠️ Calorie Surplus Detected",
      "data": { ... },
      "recommendation": "..."
    }
  ]
}
```

### 🤖 Chatbot

```
POST   /api/chatbot/message       # Send message to chatbot
```

**Request:**

```json
{
  "message": "How many calories should I eat?"
}
```

**Response:**

```json
{
  "userMessage": "How many calories should I eat?",
  "chatbotResponse": {
    "summary": "Based on your profile and activity level...",
    "recommendation": "I recommend 2000-2200 calories daily...",
    "confidenceScore": 0.87,
    "dataAvailable": { ... }
  }
}
```

---

## 🔒 Authentication

All protected endpoints require a JWT token in the Authorization header:

```bash
Authorization: Bearer <token>
```

**Example:**

```bash
curl -H "Authorization: Bearer eyJhbGc..." http://localhost:5000/api/users/profile
```

---

## 📊 Database Schemas

### User

```javascript
{
  fullName: String,
  email: String (unique),
  phone: String (unique),
  passwordHash: String,
  currentWeight: Number,
  goalWeight: Number,
  height: Number,
  age: Number,
  gender: String,
  activityLevel: String,
  fitnessGoals: [String],
  isVerified: Boolean,
  lastLogin: Date,
  timestamps: true
}
```

### Goals

```javascript
{
  userId: ObjectId (ref: User),
  goalType: String,
  goalWeight: Number,
  targetCalories: Number,
  timeline: Number (weeks),
  proteinTarget: Number,
  carbsTarget: Number,
  fatsTarget: Number,
  progressPercentage: Number,
  isActive: Boolean,
  timestamps: true
}
```

### CaloriesTracker (Daily)

```javascript
{
  userId: ObjectId (ref: User),
  date: Date (unique per user),
  totalCalories: Number,
  totalProtein: Number,
  totalCarbs: Number,
  totalFats: Number,
  breakfast: { calories, items: [FoodId] },
  lunch: { calories, items: [FoodId] },
  dinner: { calories, items: [FoodId] },
  snacks: { calories, items: [FoodId] },
  timestamps: true
}
```

### FoodsLogged

```javascript
{
  userId: ObjectId (ref: User),
  caloriesTrackerId: ObjectId (ref: CaloriesTracker),
  foodName: String,
  mealType: String,
  calories: Number,
  protein: Number,
  carbs: Number,
  fats: Number,
  source: String (manual | api | custom),
  timestamps: true
}
```

### Activities

```javascript
{
  userId: ObjectId (ref: User),
  date: Date,
  workoutType: String,
  duration: Number (minutes),
  caloriesBurned: Number,
  intensity: String,
  distance: Number,
  heartRateAvg: Number,
  heartRateMax: Number,
  timestamps: true
}
```

---

## 🧠 AI/RAG Implementation

### RAG Service (`modules/rag/ragService.js`)

- Generates embeddings using OpenAI or mock embeddings
- Stores user fitness summaries in Redis with vector index
- Retrieves top 3 similar contexts using cosine similarity
- Supports context-aware chatbot responses

### Insights Engine (`modules/insights/insightsService.js`)

- **Rule-based analysis** grounded in user data
- Detects patterns: calorie surplus/deficit, plateaus, overtraining
- Calculates goal progress percentage
- Analyzes macro distribution
- Never uses external data - only user-provided metrics

### Chatbot (`modules/chatbot/chatbotService.js`)

- Prepares context from user data + RAG retrieval
- Builds system prompt with user-specific data
- Calls OpenAI or Gemini API
- Calculates confidence score (0-1)
- Extracts actionable recommendations
- Fallback to mock responses

---

## 🧮 Calorie Calculations

### BMR (Basal Metabolic Rate)

**Mifflin-St Jeor Formula:**

- Male: `10W + 6.25H - 5A + 5`
- Female: `10W + 6.25H - 5A - 161`
- W = weight (kg), H = height (cm), A = age

### TDEE (Total Daily Energy Expenditure)

`TDEE = BMR × Activity Factor`

- Sedentary: 1.2
- Light: 1.375
- Moderate: 1.55
- Active: 1.725
- Very Active: 1.9

### Macro Targets

Adjusted based on fitness goal:

- **Weight Loss**: 30% protein, 40% carbs, 30% fats
- **Muscle Gain**: 30% protein, 45% carbs, 25% fats
- **Endurance**: 20% protein, 55% carbs, 25% fats
- **General Health**: 25% protein, 45% carbs, 30% fats

---

## 🔄 Data Flow

```
User Signup
    ↓
Create User (password hashed)
    ↓
Generate JWT Token
    ↓
Client stores token

User Logs Food
    ↓
Validate via Joi schema
    ↓
Create FoodsLogged entry
    ↓
Update CaloriesTracker (daily)
    ↓
Return updated totals

User Requests Insights
    ↓
Fetch user data + goals + activities
    ↓
Run rule-based analysis
    ↓
Generate insights
    ↓
Store summary in Redis (for RAG)
    ↓
Return insights array

User Messages Chatbot
    ↓
Prepare context (user data + insights)
    ↓
Retrieve similar context from Redis (RAG)
    ↓
Build system prompt
    ↓
Call LLM (OpenAI/Gemini)
    ↓
Return response + confidence score
```

---

## 🧪 Testing Endpoints

### 1. Signup

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Fitness",
    "email": "john@example.com",
    "phone": "+1234567890",
    "password": "TestPass123",
    "confirmPassword": "TestPass123",
    "currentWeight": 85,
    "goalWeight": 75,
    "height": 180,
    "age": 30,
    "gender": "male",
    "activityLevel": "moderate"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "TestPass123"
  }'
```

### 3. Log Food (with token)

```bash
TOKEN="eyJhbGc..." # from login response

curl -X POST http://localhost:5000/api/calories/log \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "foodName": "Chicken Breast",
    "mealType": "lunch",
    "calories": 165,
    "protein": 31,
    "carbs": 0,
    "fats": 3.6
  }'
```

### 4. Get Insights

```bash
curl http://localhost:5000/api/insights \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Chatbot Query

```bash
curl -X POST http://localhost:5000/api/chatbot/message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "message": "How many calories should I eat today?"
  }'
```

---

## 📈 Performance Considerations

- **Database Indexing**: Proper indexes on userId, date, and foreign keys
- **Pagination**: Implement for large data queries (future enhancement)
- **Caching**: Use Redis for frequently accessed user data
- **Rate Limiting**: Protects auth endpoints and general API
- **Connection Pooling**: MongoDB and Redis connections managed efficiently

---

## 🔐 Security Best Practices

✅ Environment variables for sensitive data
✅ JWT token-based authentication
✅ Bcrypt password hashing (10 salt rounds)
✅ CORS configuration
✅ Helmet security headers
✅ Rate limiting
✅ Input validation (Joi schemas)
✅ Error handling (no stack traces in production)
✅ MongoDB injection prevention (via Mongoose)
✅ Never log sensitive data

---

## 🚀 Deployment Checklist

- [ ] Set NODE_ENV=production
- [ ] Use strong JWT_SECRET
- [ ] Configure MongoDB Atlas IP whitelist
- [ ] Redis Stack with password authentication
- [ ] HTTPS enabled on frontend/backend
- [ ] API keys secured in environment variables
- [ ] Rate limiting tuned for production load
- [ ] Error logging setup (e.g., Sentry)
- [ ] Database backups configured
- [ ] Monitor API performance

---

## 📝 Future Enhancements

- [ ] Email verification for signup
- [ ] Password reset functionality
- [ ] Two-factor authentication
- [ ] Social login (Google, Apple)
- [ ] Real weight history tracking (separate collection)
- [ ] Integration with fitness trackers (Fitbit, Apple Health)
- [ ] Advanced analytics dashboard
- [ ] AI meal plan generation
- [ ] Workout routine generation
- [ ] Pagination for large datasets
- [ ] Webhook integrations
- [ ] WebSocket for real-time chatbot

---

## 📧 Support & Documentation

For detailed module documentation, see:

- `/modules/auth/authService.js` - Authentication logic
- `/modules/rag/ragService.js` - RAG implementation
- `/modules/chatbot/chatbotService.js` - Chatbot logic
- `/modules/insights/insightsService.js` - Insights engine
- `/utils/calorieCalculator.js` - Calorie algorithms

---

## 📄 License

ISC License - See LICENSE file

---

**Happy Fitness Journey! 💪🏋️**
