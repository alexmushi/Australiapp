# Australiapp



https://github.com/user-attachments/assets/f203c045-af94-4f3f-b432-3fc8f648c6ab



I made Australiapp as a simple way to track my expenses while I'm studying abroad.
It provides a Node.js/Express REST API and a React frontend.

## Features
- User authentication and authorization
- Manage categories, currencies, budgets, and expenses
- Generate reports and visualizations
- Updated currency exchange rates using cron jobs with exchangerate API

## Deployment

The application is currently deployed at [australiapp.xyz](https://australiapp.xyz). Only my personal account is active, so resource usage is intentionally low.

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


NOTE: I added the functionality to add more users but commented it all because the website is only used by myself.
