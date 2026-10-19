# Australiapp

I made Australiapp as a simple way to track my expenses while I'm studying abroad.
It provides a Node.js/Express REST API and a React frontend.

## Features
- User authentication and authorization
- Monthly budget from income: enter what you earned last month and it is split into
  30% to invest, 20% to save and 50% for spending
- Every expense, whatever its category, is subtracted from that same 50%
- Categories to classify expenses, multiple currencies
- Reports: available vs. spent, breakdown by category and a monthly history table
- Updated currency exchange rates using cron jobs with exchangerate API

## Deployment

The application is currently deployed at [australiapp.xyz](https://australiapp.xyz). Only my personal account is active, so resource usage is intentionally low. Want a quick demo? Reach out and I’ll show you around.

## Local Installation

### 1. Prerequisites
- [Node.js](https://nodejs.org/) and npm
- A running MySQL database

### 2. Clone the repository
```bash
git clone https://github.com/<your-username>/Australiapp.git
cd Australiapp
```

### 3. Install dependencies
**Backend**
```bash
cd back
npm install
```

**Frontend**
```bash
cd front
npm install
```

### 4. Environment variables
Create a `.env` file inside the `back` directory:
```ini
DB_HOST=localhost
DB_PORT=3306
DB_USER=myuser
DB_PASS=mypassword
DB_NAME=mydatabase
```

The `ingresos` table is created automatically the first time the backend starts.
Old per-category budgets (`presupuestos`) are no longer used but are left untouched.

### 5. Run the app
Start the backend in one terminal:
```bash
cd back
npm start
```

Start the frontend in another terminal:
```bash
cd front
npm run dev
```

The backend runs on http://localhost:3000 and the frontend on http://localhost:5173 by default.

### 6. Run the tests
From the repository root (after installing dependencies in `back` and `front`):
```bash
npm test
```
This runs the backend suite (income split, reports, month boundaries, validation) and the frontend suite
(money/date utilities, API contract, forms, login and dashboard) with Vitest. Run them after
every change. Individual suites: `npm test --prefix back` / `npm test --prefix front`.


NOTE: I added the functionality to add more users but commented it all because the website is only used by myself.