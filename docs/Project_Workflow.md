# Project Workflow & Setup Guide

## 🛠️ Prerequisites
- **Node.js** (v14 or higher)
- **MySQL Server**
- **Judge0 API Key** (RapidAPI)
- **Razorpay Keys** (Test Mode)

## 🏗️ Step-by-Step Setup

### 1. Environment Configuration
Create a `.env` file in the root based on the provided template:
```bash
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=coding_platform
JWT_SECRET=your_secret
JUDGE0_API_KEY=your_key
# ... fill in other variables from implementation plan
```

### 2. Database Migration
Run the following command to create the database and tables:
```bash
npm install
npm run migrate
```

### 3. Seed Data (Optional)
Insert sample problems to start testing:
```bash
npm run seed
```

### 4. Running the Server
Start the development server with hot-reload:
```bash
npm run dev
```

## 🚀 Core Platform Workflow

1. **User Auth**: User registers and receives a JWT.
2. **Browsing**: User fetches tournaments and problems.
3. **Payment**: User initiates payment for a paid tournament.
4. **Room Entry**: User joins a coding room (Socket.IO connection).
5. **Coding**: User writes code and submits.
6. **Execution**: Backend sends code to Judge0, receives result, updates DB.
7. **Real-time**: WebSocket broadcasts result to the user and leaderboard updates to the room.
8. **Finalizing**: Match ends, room status updates to `finished`, final rankings are locked.
