# ApexCurrency Analytics Platform

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/) [![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/) [![MongoDB Atlas](https://img.shields.io/badge/MongoDB%20Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/cloud/atlas) [![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript) [![Render](https://img.shields.io/badge/Render-46E3B7?style=flat-square&logo=render&logoColor=white)](https://currency-converter-f9pc.onrender.com) [![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/kotamohan18-blip/currency-converter)

A full-stack Currency Analytics Platform that provides real-time currency conversion, historical analytics, watchlists, favorites, and rate alerts.

---

## ⚡ Quick Access

*   **Live Demo Website**: [https://currency-converter-f9pc.onrender.com](https://currency-converter-f9pc.onrender.com)
*   **GitHub Repository**: [https://github.com/kotamohan18-blip/currency-converter](https://github.com/kotamohan18-blip/currency-converter)

---

## 📋 Project Summary

*   **Backend**: Node.js and Express.js REST API with JWT authentication and rate alert processing.
*   **Frontend**: HTML, CSS, and JavaScript user interface.
*   **Database**: MongoDB Atlas for storing users, watchlists, alerts, and conversion history.
*   **Deployment**: Render.

---

## 1. Project Overview

The ApexCurrency Analytics Platform is a full-stack project built using HTML, CSS, JavaScript, Node.js, Express, and MongoDB.

The application allows users to convert between 150+ currencies using real-time rates. Registered users can log in to access a personal dashboard to build a USD watchlist, save favorite conversion shortcuts, configure active exchange rate threshold alerts, view interactive historical rate charts (powered by Chart.js), and browse searchable historical logs.

---

## 2. Key Features

*   **User Authentication**: User signup, login, and profile updates using JSON Web Tokens (JWT) and `bcryptjs` password hashing.
*   **Real-time Conversion**: Instant rate calculations with a 1-hour local caching layer to optimize API requests.
*   **Interactive Trend Charts**: Visualized 7-day and 30-day historical currency movements using Chart.js.
*   **Live Watchlists**: Track multiple currencies against USD in a single dashboard panel.
*   **Favorite Shortcuts**: Pin common currency pairs (e.g., `USD/INR`) for instant access on the main page.
*   **Rate Alerts**: Configure threshold alerts (e.g., notify if `EUR/USD` > 1.12) that run checks in the background and trigger notifications on user login.
*   **Searchable History Logs**: View, search, and delete personal transaction histories.
*   **Responsive Theme System**: Slate-dark and clean-light UI layouts built with native CSS custom properties.

---

## 3. Technology Stack

| Layer | Technologies | Use Case |
| :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3, Vanilla JS (ES6+) | User Interface, theme toggling, network Fetch API requests |
| **Visualizations**| Chart.js, FlagCDN, FontAwesome | Historical trend graphs, country flags, UI icons |
| **Backend** | Node.js, Express.js, Axios | RESTful routing, backend caching, background rate alert scheduling |
| **Database** | MongoDB Atlas, Mongoose ODM | Cloud data persistence and schema definition |
| **Security** | JWT, `bcryptjs`, CORS | Password hashing, token authorization, CORS configuration |
| **APIs** | ExchangeRate-API, Frankfurter API | Live currency rates, historical analytics data |

---

## 4. Installation & Local Setup

### Prerequisites
*   Node.js (v18.0.0 or higher recommended)
*   A MongoDB Atlas Account

### Setup Steps
1.  **Clone the Repository & Install Dependencies**:
    ```bash
    git clone https://github.com/kotamohan18-blip/currency-converter.git
    cd currency-converter
    npm install
    ```

2.  **Configure Environment Variables**:
    Create a `.env` file in the project root:
    ```env
    PORT=5000
    MONGODB_URI=your_mongodb_atlas_connection_string
    JWT_SECRET=your_jwt_signing_secret_key
    NODE_ENV=development
    ```

3.  **Start the Server**:
    *   **Development Mode** (auto-restart):
        ```bash
        npm run dev
        ```
    *   **Production Mode**:
        ```bash
        npm start
        ```

4.  **Access App**:
    Open [http://localhost:5000](http://localhost:5000) in your browser.

---

## 5. Project Structure

```
currency-converter/
├── backend/
│   ├── config/db.js              # MongoDB Mongoose database connection
│   ├── controllers/              # REST controllers (auth, rates, history, alerts, etc.)
│   ├── middleware/               # Route guards (authMiddleware, errorMiddleware)
│   ├── models/                   # Mongoose database schemas (User, Favorite, Alert, Watchlist)
│   ├── routes/                   # Express route controllers (/api/*)
│   └── server.js                 # Entry point, static file server, and background alerts scheduler
├── frontend/
│   ├── css/style.css             # Glassmorphic styles and custom theme variables
│   ├── js/                       # Modular frontend scripts (api, auth, dashboard)
│   ├── index.html                # Landing page / public converter
│   ├── dashboard.html            # Protected user dashboard panel
│   ├── login.html                # User login screen
│   ├── register.html             # User registration screen
│   └── profile.html              # Account settings screen
├── .env.example                  # Environment file template
├── package.json                  # Script definitions and project dependencies
└── README.md                     # Documentation
```

---

## 6. Core API Endpoints

All endpoints are prefixed with `/api`. Protected routes require the header: `Authorization: Bearer <your_jwt_token>`.

| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/auth/register` | `POST` | Public | Create user profile (returns token & user info) |
| `/auth/login` | `POST` | Public | Login credentials check (returns token & user info) |
| `/rates/latest` | `GET` | Public | Fetches latest exchange rates (cached for 1 hour) |
| `/rates/history` | `GET` | Public | Fetches 7/30 day historical data for Chart.js plotting |
| `/history` | `POST` / `GET` | Protected | Record a conversion / list logged conversion history |
| `/favorites` | `POST` / `GET` | Protected | Save conversion pair shortcut / retrieve saved list |
| `/watchlist` | `POST` / `GET` | Protected | Add currency to watchlist widget / list tracked values |
| `/alerts` | `POST` / `GET` | Protected | Save new threshold alert / list and dismiss alerts |

---

## 7. Deployment Information

The application is deployed as a single Web Service on **Render**, communicating with a cloud database on **MongoDB Atlas**.

### Quick Deployment Steps
1.  Push the project code to your GitHub account (excluding the `.env` file).
2.  Log in to [Render](https://render.com/) and link your repository.
3.  Set the environment to **Node**, Build Command to `npm install`, and Start Command to `npm start`.
4.  Add the environment variables (`MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`) under Render's **Environment** Settings.
5.  Whitelist Render's IP addresses (`0.0.0.0/0`) under MongoDB Atlas Network Access configurations.

---

## 8. Future Enhancements

*   **Notification Integration**: Send email or SMS notifications when rate alerts are triggered.
*   **Cryptocurrency Feed**: Support BTC, ETH, and SOL conversions alongside fiat currencies.
*   **Data Export**: Allow users to download their conversion history logs as CSV files.

---

## 9. License

This project is licensed under the [MIT License](LICENSE). You are free to modify and utilize this project for personal portfolios or educational evaluations.
