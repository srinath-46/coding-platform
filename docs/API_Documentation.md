# Coding Battle Platform API Documentation

## Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Get JWT token
- `GET /api/auth/me` [Auth] - Get personal profile

## Tournaments
- `GET /api/tournaments` - List all tournaments
- `GET /api/tournaments/:id` - Detailed tournament info + problems
- `POST /api/tournaments` [Admin] - Create new tournament
- `PUT /api/tournaments/:id/status` [Admin] - Update status (upcoming/active/completed)

## Rooms & Multiplayer
- `POST /api/rooms` [Auth] - Create new coding room
- `GET /api/rooms/:id` [Auth] - Get room participants and status
- `POST /api/rooms/:id/join` [Auth] - Join existing room
- `POST /api/rooms/:id/start` [Auth] - Start coding match (broadcasts to all)

## Submissions
- `POST /api/submissions` [Auth] - Submit code for evaluation
- `GET /api/submissions/:id` [Auth] - Get submission result
- `GET /api/submissions/user` [Auth] - History of submissions

## Leaderboard
- `GET /api/leaderboard/room/:id` - Dynamic room-specific ranking
- `GET /api/leaderboard/global` - Global ranking by rating

## Payments
- `POST /api/payments/create-order` [Auth] - Start Razorpay checkout
- `POST /api/payments/verify` [Auth] - Verify payment signature
