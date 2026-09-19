# Personal Finance Manager

A full-stack web application for tracking personal income and expenses. Users can manage transactions, set monthly or yearly budgets, track savings goals, configure recurring transactions, and view spending breakdowns — all scoped to their own account.

The backend is a REST API built with Node.js and Express. The frontend is a single-page application built with React and Vite. Authentication is handled via JWT access tokens plus an HttpOnly refresh token cookie.

---

## Tech Stack

**Backend**
- Node.js, Express
- MySQL (mysql2)
- JWT authentication (access token + refresh cookie)
- bcrypt for password hashing
- Joi for request validation
- Nodemailer / Resend for OTP emails
- Winston for logging
- Helmet, CORS, express-rate-limit

**Frontend**
- React 18, Vite
- React Router v6
- Axios with interceptor-based token refresh
- Tailwind CSS
- Lucide React icons

---

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── config/         # Database connection, env config, logger
│   │   ├── controllers/    # Route handler functions
│   │   ├── middlewares/    # Auth, validation, error handling
│   │   ├── models/         # Raw SQL queries
│   │   ├── routes/         # Express routers
│   │   ├── services/       # Business logic
│   │   ├── validations/    # Joi schemas
│   │   ├── jobs/           # Cron jobs (recurring transactions)
│   │   └── app.js          # Express app setup
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios API functions per resource
│   │   ├── components/     # Shared layout and UI components
│   │   ├── context/        # Auth and theme context
│   │   ├── pages/          # One file per page/route
│   │   └── main.jsx
│   └── index.html
└── database/
    └── schema.sql          # Full MySQL schema — run this first
```

---

## Database Setup

Create a MySQL database and run the schema file:

```sql
CREATE DATABASE your_db_name;
USE your_db_name;
SOURCE database/schema.sql;
```

---

## Getting Started

**1. Clone the repository**

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

**2. Configure the backend**

```bash
cd backend
cp .env.example .env
```

Open `.env` and fill in the values:

```
PORT=5000

DB_NAME=your_db_name
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_CONNECTION_LIMIT=10

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
JWT_ALGORITHM=HS256

bcryptSaltRounds=12

RESEND_API_KEY=your_resend_key

NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**3. Install dependencies and start the backend**

```bash
npm install
npm run dev
```

**4. Install dependencies and start the frontend**

```bash
cd ../frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## API Endpoints

All protected routes require a valid `Authorization: Bearer <accessToken>` header.

### Auth — `/auth`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register a new account (sends OTP) |
| POST | `/auth/verify-registration-otp` | Verify registration OTP |
| POST | `/auth/login` | Login with email/phone and password |
| POST | `/auth/logout` | Logout and clear refresh cookie |
| GET | `/auth/me` | Get current user (protected) |
| POST | `/auth/refresh-token` | Issue new access token from refresh cookie |
| POST | `/auth/forgot-password` | Send password reset OTP |
| POST | `/auth/reset-password` | Reset password with OTP |

### Users — `/users`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/users/me` | Get profile |
| PATCH | `/users/me` | Update profile |

### User Settings — `/user-settings`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/user-settings` | Get budget mode and onboarding status |
| PATCH | `/user-settings` | Update budget mode or mark onboarding complete |

### Categories — `/catagories`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/catagories` | List all categories |
| POST | `/catagories` | Create a category |
| PATCH | `/catagories/:id` | Update a category |
| DELETE | `/catagories/:id` | Delete a category (fails if in use) |
| GET | `/catagories/:id/usage` | Get usage counts across transactions/budgets |
| POST | `/catagories/:id/reassign` | Reassign all linked records to another category, then delete |

### Payment Modes — `/api/payment-modes`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/payment-modes` | List all payment modes |

### Transactions — `/transactions`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/transactions` | List transactions (supports date/category filters and pagination) |
| POST | `/transactions` | Create a transaction |
| GET | `/transactions/export` | Export transactions as CSV |
| GET | `/transactions/:id` | Get a single transaction |
| PATCH | `/transactions/:id` | Update a transaction |
| DELETE | `/transactions/:id` | Delete a transaction |

### Recurring Transactions — `/recurring-transactions`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/recurring-transactions` | List recurring transactions |
| POST | `/recurring-transactions` | Create a recurring transaction |
| GET | `/recurring-transactions/:id` | Get a single recurring transaction |
| PATCH | `/recurring-transactions/:id` | Update a recurring transaction |
| DELETE | `/recurring-transactions/:id` | Delete a recurring transaction |
| PATCH | `/recurring-transactions/:id/activate` | Activate |
| PATCH | `/recurring-transactions/:id/deactivate` | Deactivate |

### Statistics — `/statistics`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/statistics` | Income vs expense summary for a date range |
| GET | `/statistics/breakdown` | Spending breakdown by category |

### Monthly Budgets — `/budgets`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/budgets` | Create a budget |
| GET | `/budgets` | List budgets with spending usage |
| GET | `/budgets/usage` | Overall usage summary |
| POST | `/budgets/clone` | Clone budgets from a previous month |
| GET | `/budgets/:id` | Get a single budget |
| PATCH | `/budgets/:id` | Update a budget |
| DELETE | `/budgets/:id` | Delete a budget |

### Yearly Budgets — `/yearly-budgets`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/yearly-budgets` | Create a yearly budget |
| GET | `/yearly-budgets` | List yearly budgets with spending usage |
| GET | `/yearly-budgets/usage` | Overall yearly usage summary |
| GET | `/yearly-budgets/:id` | Get a single yearly budget |
| PATCH | `/yearly-budgets/:id` | Update a yearly budget |
| DELETE | `/yearly-budgets/:id` | Delete a yearly budget |

### Monthly Savings — `/monthly-savings`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/monthly-savings` | Set a savings goal for a month |
| GET | `/monthly-savings` | List all savings records |
| PATCH | `/monthly-savings/:id` | Update a savings goal |
| DELETE | `/monthly-savings/:id` | Delete a savings record |

### Notifications — `/notifications`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/notifications` | List notifications |
| GET | `/notifications/unread-count` | Get count of unread notifications |
| PATCH | `/notifications/read-all` | Mark all notifications as read |
| PATCH | `/notifications/:id/read` | Mark a notification as read |
| DELETE | `/notifications/:id` | Delete a notification |
