# ApexCurrency Analytics Platform

A professional, production-ready Full-Stack Currency Analytics Platform. This application provides real-time conversions for over 150 currencies, historical trends (7-day and 30-day graphs), exchange rate statistics, user portfolio custom watchlists, conversion history log searchability, and automated rate alert triggers.

Suitable for resume portfolios, internship applications, or university projects.

---

## 🚀 Key Features

1. **JWT User Authentication**: Registration, login, profile updates, password changes, and route guards.
2. **Real-time Conversion**: Uses a reliable, public currency exchange rate API to dynamically calculate rates.
3. **Interactive Visualizations**: Beautiful Chart.js graphs showing 7-day and 30-day historical trends, complete with customized dark/light mode properties.
4. **Historical Insights**: Daily analytics cards displaying current rate, yesterday's rate, difference, percentage change, and statistical indicators.
5. **Saved Currency Favorites**: Grid for quick-access conversions.
6. **Live Watchlists**: Watch tracked currencies and view live rates against USD.
7. **Rate Alerts**: Threshold alerts (e.g. notify when `USD/INR > 90` or `EUR/INR < 80`) checking rates in the background and serving toast notifications.
8. **Responsive Glassmorphic Design**: Tailored deep-slate dark theme and crisp light theme using CSS variables and Outfit typography.
9. **Searchable Custom Selectors**: Clean, scrollable dropdown selectors with keyboard-friendly inputs and national flags loaded from FlagCDN.

---

## 🛠️ Technology Stack

* **Frontend**: Vanilla HTML5, CSS3 (CSS Variables, Flexbox, CSS Grid, custom keyframes), Vanilla JavaScript (ES6+ Modules, Fetch API, Event Handling).
* **Backend**: Node.js, Express.js (RESTful API architecture, clean routing, error handlers).
* **Database**: MongoDB Atlas via Mongoose ODM.
* **Authentication**: JSON Web Tokens (JWT) & `bcryptjs` password hashing.
* **Charts**: Chart.js.
* **Icons & Fonts**: FontAwesome Icons & Google Font Outfit.

---

## 📂 Project Architecture

```
currency-converter/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB Mongoose connection
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, profile edit
│   │   ├── ratesController.js    # Live rates, caching, alert checker
│   │   ├── historyController.js  # 7-day & 30-day chart trend generator
│   │   ├── conversionHistoryController.js # User conversion history CRUD
│   │   ├── favoritesController.js# User favorites list CRUD
│   │   ├── watchlistController.js# Tracked currencies list CRUD
│   │   └── alertsController.js   # Rate threshold alert CRUD
│   ├── middleware/
│   │   ├── authMiddleware.js     # Token verification
│   │   └── errorMiddleware.js    # Centralized JSON error parser
│   ├── models/
│   │   ├── User.js               # User credentials model
│   │   ├── ConversionHistory.js  # Conversion transaction schema
│   │   ├── Favorite.js           # Favorite currency pairs schema
│   │   ├── Watchlist.js          # Tracked currencies schema
│   │   ├── Alert.js              # Rate alerts schema
│   │   └── DailyRate.js          # Daily cached rate schema
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth endpoints
│   │   ├── ratesRoutes.js        # /api/rates endpoints
│   │   ├── historyRoutes.js      # /api/history endpoints
│   │   ├── favoritesRoutes.js    # /api/favorites endpoints
│   │   ├── watchlistRoutes.js    # /api/watchlist endpoints
│   │   └── alertsRoutes.js       # /api/alerts endpoints
│   └── server.js                 # Node/Express Entry, static serving, background cron
├── frontend/
│   ├── css/
│   │   └── style.css             # Main styling, themes, animations, variables
│   ├── js/
│   │   ├── api.js                # Shared fetch helper, custom toasts, theme toggles
│   │   ├── auth.js               # Form validation for login and register
│   │   ├── converter.js          # Chart.js graphs, ticker marquee, live conversion
│   │   ├── dashboard.js          # Watchlist widget, favorites panel, alerts config, history log
│   │   └── profile.js            # User profile data populator & form submission
│   ├── index.html                # Landing page / Public Conversion workspace
│   ├── dashboard.html            # Protected user dashboard area
│   ├── login.html                # User login screen
│   ├── register.html             # User registration screen
│   └── profile.html              # Account settings screen
├── .env.example                  # Environment variables template
├── package.json                  # Dependencies list & scripts
└── README.md                     # Platform documentation
```

---

## ⚙️ Local Development Setup

Follow these steps to run the application on your computer:

### 1. Prerequisites
* [Node.js](https://nodejs.org/) installed (v18 or higher recommended).
* [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally, or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account.

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Open `.env` and configure your credentials:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/currency_platform
JWT_SECRET=your_jwt_signing_secret_key
```

### 3. Install Dependencies
Run the install command in the root project folder:
```bash
npm install
```

### 4. Start the Application
* **Development Mode** (auto-restarts when files change using `nodemon`):
  ```bash
  npm run dev
  ```
* **Production Mode**:
  ```bash
  npm start
  ```

### 5. Visit in Browser
Open [http://localhost:5000](http://localhost:5000) in your web browser.

---

## 🧪 Testing Verification Plan

To verify that all platform elements function correctly:

1. **Latest Rates & Conversion**:
   * Navigate to the home page. Enter an amount and change the currency inputs. Verify the converted total matches current market figures.
2. **Chart rendering**:
   * Click between the **7 Days** and **30 Days** tabs. Verify the line graph refreshes smoothly.
   * Hover over the line to confirm rate values are displayed in tooltips.
3. **Responsive Themes**:
   * Click the theme toggle icon in the header. Verify the design switches between Dark and Light mode. Ensure theme settings persist on page reload.
4. **User Registration & JWT Session**:
   * Register a new user profile at `/register`. Confirm you are redirected to the user dashboard.
   * Log out, reload, and verify that navigating to `/dashboard` redirects you back to `/login`.
5. **Watchlist & Favorites**:
   * In `/dashboard`, add currencies to your watchlist. Confirm they show up with live rates.
   * Save a favorite pair (e.g., `USD/CAD`). Confirm a card is added, then click the card and check if you are redirected to the homepage with the converter pre-filled.
6. **Rate Alerts checking**:
   * Set up a rate alert for a pair. If the threshold triggers, verify that a toast notification pop-up is shown on screen and that the alert's status is updated to `Triggered`.

---

## 🌐 Production Deployment (Render)

Deploying to Render takes only a few minutes:

### 1. Upload to GitHub
Create a GitHub repository, commit your code, and push it:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_REPOSITORY_URL
git branch -M main
git push -u origin main
```

### 2. Configure Render Web Service
1. Log in to [Render](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. Set the following options:
   * **Name**: `currency-analytics-platform`
   * **Environment**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `npm start`
5. Click **Advanced** and add the following Environment Variables:
   * `MONGODB_URI` (your MongoDB Atlas connection string)
   * `JWT_SECRET` (a strong, unique secret phrase)
   * `NODE_ENV` = `production`
6. Click **Create Web Service**. Once built, your platform is online!
