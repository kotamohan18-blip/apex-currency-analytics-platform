# ApexCurrency Analytics Platform

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/cloud/atlas)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)

A premium, production-ready Full-Stack Currency Analytics Platform. This application provides real-time conversions for over 150 currencies, historical trends (7-day and 30-day interactive graphs), exchange rate statistics, custom user watchlists, conversion history logs, and background rate alert triggers.

---

## ⚡ Quick Access

*   **Live Demo Website**: [https://currency-converter-f9pc.onrender.com](https://currency-converter-f9pc.onrender.com)
*   **GitHub Repository**: [https://github.com/kotamohan18-blip/currency-converter](https://github.com/kotamohan18-blip/currency-converter)

---

## 📋 Project Summary

The **ApexCurrency Analytics Platform** is a recruiter-ready, full-stack application built to solve real-time financial data tracking challenges. It features:
*   **Backend Engine**: Express.js REST API with robust security middleware, token session authorization (JWT), and background price alert workers.
*   **Frontend Interface**: Ultra-responsive, glassmorphic layout created with semantic HTML5, CSS3 variables, and vanilla ES6+ JavaScript.
*   **Database**: MongoDB Atlas cloud cluster for user account profiles and analytical history logs.
*   **Deployment**: Hosted as a single containerized service on Render linked to MongoDB Atlas.

---

## 1. Project Overview

This platform was built to demonstrate full-stack engineering proficiency—focusing on API performance, security, and UI design without relying on bulky frontend frameworks. 

The application enables public users to instantly calculate exchange rates for 150+ global currencies, while registered users gain access to a personal financial dashboard. In their dashboard, users track currencies on a live watchlist, save favorite conversion shortcuts, configure custom price-threshold alerts, view interactive historical charts (powered by Chart.js), and browse searchable historical logs.

---

## 2. Key Features

*   **Secure Authentication**: User signup, login, and profile editing using JSON Web Tokens (JWT) and `bcryptjs` password hashing.
*   **Real-time Conversion**: Instant rate calculations backed by a 1-hour memory caching layer to optimize API rate limits.
*   **Interactive Trend Charts**: Visualized 7-day and 30-day historical currency movements utilizing Chart.js with dynamic light/dark mode properties.
*   **Live Portfolios / Watchlists**: Track multiple currencies against USD concurrently on a single, compact panel.
*   **Favorite Conversion Shortcuts**: Pin custom currency pairs (e.g. `USD/INR`) to convert instantly from the landing dashboard.
*   **Background Rate Alerts**: Configure alert thresholds (e.g. "Notify if `EUR/USD` > 1.12") that trigger in the background and display toast alerts upon dashboard sign-in.
*   **Searchable History Logs**: View, search, and delete personal transaction histories.
*   **Responsive Theme System**: Fully polished slate-dark and clean-light layouts with animated transitions.

---

## 3. Technology Stack

| Layer | Technologies | Key Use Case |
| :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3 (CSS Variables, Flexbox, Grid), Vanilla JS (ES6+) | User Interface, theme toggling, modular Fetch API network calls |
| **Visualizations**| Chart.js, FlagCDN, FontAwesome | Historical trends plotting, national flag rendering, vector icons |
| **Backend** | Node.js, Express.js, Axios | RESTful routing, cache controls, background cron schedules |
| **Database** | MongoDB Atlas, Mongoose ODM | Cloud data persistence, validation schemas |
| **Security** | JWT, `bcryptjs`, CORS | Password encryption, token authorization, CORS protection |
| **APIs** | ExchangeRate-API, Frankfurter API | Real-time rates API, historical market analytics data |

---

## 4. Screenshots & UI Preview

*Below are visual previews of the application's responsive UI dashboard:*

#### 🖥️ Desktop Dashboard (Dark Mode)
```
┌──────────────────────────────────────────────────────────────────┐
│  ApexCurrency  [Home]  [Dashboard]  [Profile]       (Toggle Theme)│
├──────────────────────────────────────────────────────────────────┤
│  Convert Currency                    Live Watchlist Widget       │
│  [ 100 ] [USD] ➔ [EUR]               ┌────────────────────────┐  │
│  Rate: 0.9250 | Result: 92.50 EUR    │ EUR: 0.9250   | Remove │  │
│  [Save Favorite] [Add to Watchlist]  │ GBP: 0.7840   | Remove │  │
│                                      └────────────────────────┘  │
│  Historical Trends (Chart.js)        Active Rate Alerts          │
│  ┌────────────────────────┐          ┌────────────────────────┐  │
│  │ 📈  7-Day  |  30-Day   │          │ USD/INR > 84.5  (Active│  │
│  ├────────────────────────┤          │ EUR/USD < 1.08  (Trigg)│  │
│  │    /\__/\_             │          └────────────────────────┘  │
│  └────────────────────────┘                                      │
└──────────────────────────────────────────────────────────────────┘
```

*(Place actual screenshot paths here for submission if desired. Files: `/frontend/css/style.css`, `/frontend/index.html`)*

---

## 5. Installation & Local Setup

### Prerequisites
*   Node.js (v18.0.0 or higher recommended)
*   A MongoDB Atlas Account (or a local MongoDB instance)

### Setup Steps
1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/kotamohan18-blip/currency-converter.git
    cd currency-converter
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Configure Environment Variables**:
    Create a `.env` file in the project root:
    ```env
    PORT=5000
    MONGODB_URI=your_mongodb_atlas_connection_string
    JWT_SECRET=your_jwt_signing_secret_key
    NODE_ENV=development
    ```
4.  **Start the Server**:
    *   **Development** (auto-restart on file change): `npm run dev`
    *   **Production**: `npm start`
5.  **View the Application**:
    Open [http://localhost:5000](http://localhost:5000) in your web browser.

---

## 6. Project Structure

```
currency-converter/
├── backend/
│   ├── config/db.js              # MongoDB Mongoose database connection
│   ├── controllers/              # REST controllers (auth, rates, history, alerts, etc.)
│   ├── middleware/               # Route guards (authMiddleware, errorMiddleware)
│   ├── models/                   # Mongoose schemas (User, Favorite, Alert, Watchlist)
│   ├── routes/                   # Express route controllers (/api/*)
│   └── server.js                 # Entry point, static directory server & alerts cron
├── frontend/
│   ├── css/style.css             # Unified glassmorphic UI variables and stylesheets
│   ├── js/                       # Modular frontend scripts (api, auth, dashboard)
│   ├── index.html                # Landing page / public converter
│   └── dashboard.html            # Protected dashboard panel
├── .env.example                  # Environment file template
├── package.json                  # Script definitions and dependency trees
└── README.md                     # Portfolio documentation
```

---

## 7. Core API Endpoints

All endpoints are prefixed with `/api`. Protected routes require header: `Authorization: Bearer <your_jwt_token>`.

| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/auth/register` | `POST` | Public | Create user profile (returns token & user info) |
| `/auth/login` | `POST` | Public | Login credentials check (returns token & user info) |
| `/rates/latest` | `GET` | Public | Fetches latest exchange rates (caches results for 1 hour) |
| `/rates/history` | `GET` | Public | Fetches 7/30 day historical data for Chart.js plotting |
| `/history` | `POST` / `GET` | Protected | Record a conversion / list logged conversion history |
| `/favorites` | `POST` / `GET` | Protected | Save conversion pair shortcut / retrieve saved list |
| `/watchlist` | `POST` / `GET` | Protected | Add currency to watchlist widget / list tracked values |
| `/alerts` | `POST` / `GET` | Protected | Save new threshold alarm / list and dismiss alerts |

---

## 8. Deployment Information

The application is deployed as a single Web Service on **Render**, communicating with a free cloud cluster database on **MongoDB Atlas**.

### Quick Deployment Steps
1.  Push the project code to your GitHub account (excluding the `.env` file).
2.  Log in to [Render](https://render.com/) and link your repository.
3.  Set the environment to **Node**, Build Command to `npm install`, and Start Command to `npm start`.
4.  Add the environment variables (`MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`) under Render's Advanced Settings tab.
5.  Whitelist Render's IP addresses (`0.0.0.0/0`) under MongoDB Atlas Network Access configurations.

---

## 9. Future Enhancements

*   **Notification Integration**: Send email/SMS notices via Twilio or SendGrid when alerts are triggered.
*   **Cryptocurrency Feed**: Support BTC, ETH, and SOL conversions alongside standard fiat currencies.
*   **Data Exporting**: Enable users to download their conversion history logs as CSV or Excel sheets.

---

## 10. License

Licensed under the [MIT License](LICENSE). Feel free to modify and adapt this platform for portfolio showcases or educational evaluations.
