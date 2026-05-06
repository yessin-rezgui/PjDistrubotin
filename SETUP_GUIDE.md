# 🚀 Complete Setup Guide

## Prerequisites

- **Docker** 20.10+
- **Docker Compose** 2.0+
- **Git**
- (Optional) Node.js 18+ for local development

## ⚡ Quick Start (Docker Compose - Recommended)

### 1. Clone Repository
```bash
git clone <repository-url>
cd concert-ticketing
```

### 2. Start All Services
```bash
docker-compose up --build
```

This will:
- ✅ Build backend Docker image
- ✅ Build frontend Docker image
- ✅ Start MongoDB container
- ✅ Start Express backend on port 3000
- ✅ Start Angular frontend on port 4200

### 3. Access the Application

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:4200 | User interface |
| Backend API | http://localhost:3000 | REST API |
| Health Check | http://localhost:3000/health | Service status |
| MongoDB | localhost:27017 | Database |

### 4. Verify Everything is Running
```bash
# Check container status
docker-compose ps

# Check backend logs
docker-compose logs backend

# Check frontend logs
docker-compose logs frontend
```

---

## 📚 Test the System

### Step 1: Create a Concert
Open Postman or Terminal and run:

```bash
curl -X POST http://localhost:3000/concerts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Drake World Tour",
    "artist": "Drake",
    "venue": "Crypto.com Arena, Los Angeles",
    "startTime": "2024-12-15T19:00:00Z",
    "endTime": "2024-12-15T22:00:00Z",
    "totalSeats": 100,
    "rows": 10,
    "seatsPerRow": 10
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "655f1234abcd5678...",
    "name": "Drake World Tour",
    "artist": "Drake",
    ...
  }
}
```

**Save the `_id` for next steps** ← IMPORTANT

### Step 2: Open Frontend
1. Open browser: http://localhost:4200
2. You should see "Drake World Tour" in the concert list
3. Click on the concert to view seats

### Step 3: Purchase a Ticket
1. In frontend: Click on concert
2. Select seat A1 (green circle)
3. Enter your name
4. Click "Buy Ticket"

### Step 4: Verify Real-time Updates
1. Open frontend in **two browser windows**
2. In window 1: Purchase ticket
3. In window 2: Observe seat A1 changes to red instantly
4. **This demonstrates Socket.io real-time updates!**

### Step 5: Check Blockchain
```bash
curl http://localhost:3000/blockchain
```

Response will show all ticket transactions recorded on blockchain.

---

## 🔧 Local Development Setup

### Backend Only

#### Prerequisites
- Node.js 18+
- MongoDB running locally

#### Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=3000
MONGODB_URI=mongodb://localhost:27017/concert-ticketing
NODE_ENV=development
EOF

# Start backend
npm run dev
# Server runs on http://localhost:3000
```

### Frontend Only

#### Prerequisites
- Node.js 18+
- Backend running (see above)

#### Setup
```bash
cd frontend

# Install dependencies
npm install

# Start frontend dev server
ng serve
# Frontend runs on http://localhost:4200
```

---

## 📖 API Endpoints

### Concerts

#### Create Concert
```bash
POST /concerts
Content-Type: application/json

{
  "name": "Concert Name",
  "artist": "Artist Name",
  "venue": "Venue Name",
  "startTime": "2024-12-15T19:00:00Z",
  "endTime": "2024-12-15T22:00:00Z",
  "totalSeats": 100,
  "rows": 10,
  "seatsPerRow": 10
}
```

#### Get All Concerts
```bash
GET /concerts
```

#### Get Concert by ID
```bash
GET /concerts/{concertId}
```

### Tickets

#### Get Seats for Concert
```bash
GET /concerts/{concertId}/seats
```

Response shows seat grid with colors:
- 🟢 AVAILABLE
- 🔴 SOLD
- 🟣 USED
- ⚪ CANCELLED
- ⚫ EXPIRED

#### Buy Ticket ⭐ CRITICAL
```bash
POST /tickets/buy
Content-Type: application/json

{
  "concertId": "{concertId}",
  "seatLabel": "A1",
  "ownerName": "John Doe"
}
```

**Concurrency Control**: If two requests try to buy A1 simultaneously, only ONE succeeds.

#### Validate Ticket (At Event Entrance)
```bash
POST /tickets/validate
Content-Type: application/json

{
  "concertId": "{concertId}",
  "seatLabel": "A1"
}
```

**Requirements:**
- Current time must be within concert start/end time
- Ticket must be in SOLD state
- After validation: ticket becomes USED and cannot be reused

#### Cancel Ticket
```bash
POST /tickets/cancel
Content-Type: application/json

{
  "concertId": "{concertId}",
  "seatLabel": "A1"
}
```

#### Change Ticket Owner Name
```bash
POST /tickets/change-name
Content-Type: application/json

{
  "concertId": "{concertId}",
  "seatLabel": "A1",
  "newOwnerName": "Jane Doe"
}
```

### Blockchain

#### Get Entire Blockchain
```bash
GET /blockchain
```

Returns array of all blocks with transactions.

#### Validate Blockchain Integrity
```bash
GET /blockchain/validate
```

Response:
```json
{
  "success": true,
  "data": {
    "valid": true,
    "chainLength": 42,
    "blocks": [...]
  }
}
```

#### Get Blockchain Statistics
```bash
GET /blockchain/stats
```

Response:
```json
{
  "success": true,
  "data": {
    "totalBlocks": 42,
    "transactions": {
      "sold": 35,
      "used": 5,
      "cancelled": 2,
      "ownerChanged": 0
    }
  }
}
```

---

## 🧪 Test Scenarios

### Test 1: Prevent Double Booking ✅

**What it tests**: Concurrency control

```bash
# Terminal 1
curl -X POST http://localhost:3000/tickets/buy \
  -H "Content-Type: application/json" \
  -d '{
    "concertId": "655f1234abcd5678",
    "seatLabel": "A1",
    "ownerName": "User1"
  }'

# Terminal 2 (simultaneously or immediately after)
curl -X POST http://localhost:3000/tickets/buy \
  -H "Content-Type: application/json" \
  -d '{
    "concertId": "655f1234abcd5678",
    "seatLabel": "A1",
    "ownerName": "User2"
  }'
```

**Expected**: First request succeeds, second fails with "Seat not available or already sold"

### Test 2: Real-time Updates ✅

**What it tests**: WebSocket broadcasting

1. Open http://localhost:4200 in two windows side-by-side
2. In window 1: Buy seat A2
3. Observe in window 2: Seat A2 instantly turns red
4. Message shows "Seat updated by another user"

### Test 3: Ticket Validation ✅

**What it tests**: Time-based validation

```bash
# Buy ticket
curl -X POST http://localhost:3000/tickets/buy \
  -H "Content-Type: application/json" \
  -d '{
    "concertId": "{id}",
    "seatLabel": "A1",
    "ownerName": "John"
  }'

# Try to validate (might fail if current time is not within concert time)
curl -X POST http://localhost:3000/tickets/validate \
  -H "Content-Type: application/json" \
  -d '{
    "concertId": "{id}",
    "seatLabel": "A1"
  }'

# Expected: Success if current time is between startTime and endTime
# Expected: Error "Concert has not started yet" or "Concert has already ended"
```

### Test 4: Blockchain Immutability ✅

**What it tests**: Blockchain integrity

```bash
# Get blockchain
curl http://localhost:3000/blockchain | jq

# Validate chain
curl http://localhost:3000/blockchain/validate

# Should return: "valid": true

# Get statistics
curl http://localhost:3000/blockchain/stats
```

---

## 🐛 Troubleshooting

### Issue: Containers won't start

**Solution:**
```bash
# Clean up old containers
docker-compose down

# Rebuild
docker-compose up --build

# Check logs
docker-compose logs backend
docker-compose logs frontend
```

### Issue: MongoDB connection refused

**Solution:**
```bash
# Check if mongo container is healthy
docker-compose ps

# View mongo logs
docker-compose logs mongo

# Restart mongo
docker-compose restart mongo

# Wait 10 seconds and check again
docker-compose ps
```

### Issue: Frontend shows "Cannot GET /"

**Solution:**
```bash
# Check if frontend built successfully
docker-compose logs frontend

# Rebuild frontend
docker-compose build frontend

# Restart
docker-compose up frontend
```

### Issue: Backend returns CORS errors

**Solution:**
- This is normal in development
- Backend has CORS enabled for all origins
- Frontend is on 4200, backend on 3000 (different origins)
- CORS middleware handles this in `src/middleware/cors.js`

---

## 📊 Project Architecture

```
┌─────────────────────────────────────────────────────┐
│               Browser (Angular Frontend)            │
│  - Concert List Component                          │
│  - Seat Grid Display                               │
│  - Real-time Updates via Socket.io                 │
└────────────────┬──────────────────────────────────┘
                 │ HTTP + WebSocket
                 │
┌────────────────▼──────────────────────────────────┐
│     Express Backend (Node.js)                      │
│  ┌─────────────────────────────────────────────┐  │
│  │ Routes & Controllers                        │  │
│  └───────────┬──────────────────────┬──────────┘  │
│              │                      │             │
│     ┌────────▼───────┐    ┌────────▼──────┐      │
│     │   Services     │    │   Blockchain   │      │
│     │ (Business)     │    │   (SHA256)     │      │
│     └────────┬───────┘    └────────┬──────┘      │
│              │                      │             │
│     ┌────────▼───────────────────────┴──────┐    │
│     │      MongoDB Database                  │    │
│     │  - Concerts                            │    │
│     │  - Tickets (with atomic transactions)  │    │
│     └──────────────────────────────────────┘    │
│     ┌──────────────────────────────────────────┐ │
│     │  Socket.io (Real-time updates)          │ │
│     └──────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
```

---

## 🛑 Shutdown

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (careful - deletes data!)
docker-compose down -v
```

---

## 📝 Next Steps

1. ✅ System is running
2. ✅ Test all scenarios
3. ✅ Review blockchain
4. ✅ Check concurrency control
5. ✅ Verify real-time updates
6. 🎓 Study the code architecture
7. 🚀 Deploy to production

---

## 📞 Support

- Check logs: `docker-compose logs -f [service]`
- Review README.md for architecture
- Check API_DOCUMENTATION.md for endpoints
- Review source code comments for implementation details
