# 🎵 Distributed Concert Ticketing System (V2)

A full-stack distributed ticketing system built with Node.js, Angular, and PostgreSQL.

## 🚀 Key Features
- **Architecture**: Distributed system with real-time communication.
- **Database**: PostgreSQL with **Atomic Row Locking** (`SELECT FOR UPDATE`) to prevent double-booking.
- **Authentication**: JWT-based auth with `USER` and `ADMIN` roles.
- **QR Code System**: Automated QR generation for tickets and a validation scanner.
- **Real-time**: Instant seat status updates across all clients using Socket.io.
- **Blockchain**: Transaction logging for all ticket actions (SOLD, USED, etc.).
- **Cron Jobs**: Automatic ticket expiration after event end time.

## 🛠 Tech Stack
- **Backend**: Node.js, Express, PostgreSQL, Socket.io, JWT, Bcrypt, Node-cron.
- **Frontend**: Angular (Standalone Components), RxJS, Socket.io-client.
- **DevOps**: Docker, Docker Compose.

## 🏁 Quick Start

### 1. Start with Docker Compose
```bash
docker-compose up --build
```

### 2. Access the App
- **Frontend**: [http://localhost:4200](http://localhost:4200)
- **Backend API**: [http://localhost:3000/api](http://localhost:3000/api)

### 3. Default Credentials
- **Admin**: `admin` / `admin123`
- **User**: Register a new account on the website.

## 📖 API Reference

### Auth
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Get JWT token

### Events (Admin Only for POST/DELETE)
- `GET /api/concerts` - List all events
- `POST /api/concerts` - Create event & auto-generate seats
- `GET /api/concerts/:id/seats` - Get seat grid with status

### Tickets
- `POST /api/tickets/buy` - Purchase a ticket (Protected)
- `POST /api/tickets/validate` - Mark ticket as USED via Scanner

### Blockchain
- `GET /api/blockchain` - View transaction logs
- `GET /api/blockchain/validate` - Verify chain integrity

## 🧪 Concurrency Testing
The system uses PostgreSQL row-level locking. If two users attempt to buy the same seat at the exact same millisecond, the database will block the second transaction until the first one completes, then reject it because the seat status is no longer `AVAILABLE`.
