cd c:\Users\yassine\Desktop\pj\concert-ticketing# API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication
None (public API for demo purposes)

## Content-Type
All requests and responses use `application/json`

---

# 🎵 Concerts

## Create Concert

Creates a new concert and initializes seat inventory.

### Request
```
POST /concerts
Content-Type: application/json

{
  "name": "string",
  "artist": "string",
  "venue": "string",
  "startTime": "ISO 8601 datetime",
  "endTime": "ISO 8601 datetime",
  "totalSeats": "number",
  "rows": "number (optional, default: 10)",
  "seatsPerRow": "number (optional, default: 10)"
}
```

### Example
```bash
curl -X POST http://localhost:3000/concerts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Travis Scott World Tour",
    "artist": "Travis Scott",
    "venue": "Madison Square Garden, New York",
    "startTime": "2024-12-15T20:00:00Z",
    "endTime": "2024-12-15T23:00:00Z",
    "totalSeats": 100,
    "rows": 10,
    "seatsPerRow": 10
  }'
```

### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "_id": "655f1234abcd5678",
    "name": "Travis Scott World Tour",
    "artist": "Travis Scott",
    "venue": "Madison Square Garden, New York",
    "startTime": "2024-12-15T20:00:00Z",
    "endTime": "2024-12-15T23:00:00Z",
    "totalSeats": 100,
    "rows": 10,
    "seatsPerRow": 10,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### Error Response (400)
```json
{
  "error": "End time must be after start time"
}
```

---

## Get All Concerts

Retrieves all concerts in the system.

### Request
```
GET /concerts
```

### Example
```bash
curl http://localhost:3000/concerts
```

### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "_id": "655f1234abcd5678",
      "name": "Travis Scott World Tour",
      "artist": "Travis Scott",
      "venue": "Madison Square Garden",
      "startTime": "2024-12-15T20:00:00Z",
      "endTime": "2024-12-15T23:00:00Z",
      "totalSeats": 100,
      "rows": 10,
      "seatsPerRow": 10
    },
    {
      "_id": "655f5678abcd1234",
      "name": "Drake Tour",
      "artist": "Drake",
      "venue": "Crypto.com Arena",
      "startTime": "2024-12-20T19:00:00Z",
      "endTime": "2024-12-20T22:00:00Z",
      "totalSeats": 120,
      "rows": 12,
      "seatsPerRow": 10
    }
  ]
}
```

---

## Get Concert by ID

Retrieves a specific concert.

### Request
```
GET /concerts/:id
```

### Example
```bash
curl http://localhost:3000/concerts/655f1234abcd5678
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "_id": "655f1234abcd5678",
    "name": "Travis Scott World Tour",
    "artist": "Travis Scott",
    "venue": "Madison Square Garden",
    "startTime": "2024-12-15T20:00:00Z",
    "endTime": "2024-12-15T23:00:00Z",
    "totalSeats": 100,
    "rows": 10,
    "seatsPerRow": 10
  }
}
```

### Error Response (404)
```json
{
  "error": "Concert not found"
}
```

---

# 🎟️ Tickets

## Get Seats for Concert

Retrieves the seat grid for a concert with current state.

### Request
```
GET /concerts/:concertId/seats
```

### Example
```bash
curl http://localhost:3000/concerts/655f1234abcd5678/seats
```

### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "row": "A",
      "number": 1,
      "label": "A1",
      "state": "AVAILABLE",
      "ownerName": null
    },
    {
      "row": "A",
      "number": 2,
      "label": "A2",
      "state": "SOLD",
      "ownerName": "John Doe"
    },
    {
      "row": "A",
      "number": 3,
      "label": "A3",
      "state": "USED",
      "ownerName": "Jane Smith"
    },
    ...
  ]
}
```

### Seat States
- `AVAILABLE` - Can be purchased
- `SOLD` - Purchased, not yet used
- `USED` - Validated at entrance
- `CANCELLED` - Cancelled by owner
- `EXPIRED` - Concert has ended

---

## Buy Ticket ⭐ CRITICAL

Purchases a ticket for a specific seat. **This endpoint implements concurrency control.**

### Request
```
POST /tickets/buy
Content-Type: application/json

{
  "concertId": "string",
  "seatLabel": "string (e.g., A1)",
  "ownerName": "string"
}
```

### Example
```bash
curl -X POST http://localhost:3000/tickets/buy \
  -H "Content-Type: application/json" \
  -d '{
    "concertId": "655f1234abcd5678",
    "seatLabel": "A1",
    "ownerName": "John Doe"
  }'
```

### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "_id": "655f1235xyz",
    "concertId": "655f1234abcd5678",
    "seatRow": "A",
    "seatNumber": 1,
    "seatLabel": "A1",
    "ownerName": "John Doe",
    "state": "SOLD",
    "purchasedAt": "2024-01-01T10:30:00Z",
    "blockchainHash": "5a7c3e4d9f2b1c8e...",
    "createdAt": "2024-01-01T10:30:00Z"
  },
  "message": "Ticket purchased successfully"
}
```

### Error Response (400) - Seat Already Sold
```json
{
  "error": "Seat not available or already sold"
}
```

**This error occurs when:**
- Seat is already purchased
- Another user purchased it first (race condition prevented!)
- Seat label is invalid

### Concurrency Control Guarantee
If two users attempt to purchase the same seat simultaneously:
- Both requests hit the database
- MongoDB's atomic transaction ensures only ONE succeeds
- The other receives: `"Seat not available or already sold"`
- Database consistency is guaranteed

---

## Validate Ticket

Validates a ticket at event entrance. **Ticket can only be validated during concert time.**

### Request
```
POST /tickets/validate
Content-Type: application/json

{
  "concertId": "string",
  "seatLabel": "string"
}
```

### Example
```bash
curl -X POST http://localhost:3000/tickets/validate \
  -H "Content-Type: application/json" \
  -d '{
    "concertId": "655f1234abcd5678",
    "seatLabel": "A1"
  }'
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "_id": "655f1235xyz",
    "concertId": "655f1234abcd5678",
    "seatLabel": "A1",
    "ownerName": "John Doe",
    "state": "USED",
    "usedAt": "2024-01-01T20:45:00Z",
    "blockchainHash": "7b9d4e5f3c2a1b0d...",
    "createdAt": "2024-01-01T10:30:00Z"
  },
  "message": "Ticket validated successfully"
}
```

### Error Responses

#### Before Concert Starts (400)
```json
{
  "error": "Concert has not started yet"
}
```

#### After Concert Ends (400)
```json
{
  "error": "Concert has already ended"
}
```

#### Ticket Not Found or Already Used (400)
```json
{
  "error": "Ticket not found or already used"
}
```

**Important:** Once a ticket is validated (USED), it cannot be reused.

---

## Cancel Ticket

Cancels a ticket before or after purchase.

### Request
```
POST /tickets/cancel
Content-Type: application/json

{
  "concertId": "string",
  "seatLabel": "string"
}
```

### Example
```bash
curl -X POST http://localhost:3000/tickets/cancel \
  -H "Content-Type: application/json" \
  -d '{
    "concertId": "655f1234abcd5678",
    "seatLabel": "A1"
  }'
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "_id": "655f1235xyz",
    "concertId": "655f1234abcd5678",
    "seatLabel": "A1",
    "ownerName": "John Doe",
    "state": "CANCELLED",
    "cancelledAt": "2024-01-01T10:35:00Z",
    "blockchainHash": "8c0e6f7d4b3a2c1e...",
    "createdAt": "2024-01-01T10:30:00Z"
  },
  "message": "Ticket cancelled successfully"
}
```

### Error Response (400)
```json
{
  "error": "Ticket cannot be cancelled"
}
```

---

## Change Ticket Owner Name

Changes the owner name of a ticket (before validation).

### Request
```
POST /tickets/change-name
Content-Type: application/json

{
  "concertId": "string",
  "seatLabel": "string",
  "newOwnerName": "string"
}
```

### Example
```bash
curl -X POST http://localhost:3000/tickets/change-name \
  -H "Content-Type: application/json" \
  -d '{
    "concertId": "655f1234abcd5678",
    "seatLabel": "A1",
    "newOwnerName": "Jane Doe"
  }'
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "_id": "655f1235xyz",
    "concertId": "655f1234abcd5678",
    "seatLabel": "A1",
    "ownerName": "Jane Doe",
    "state": "SOLD",
    "blockchainHash": "9d1f7g8e5c4b3a2d...",
    "createdAt": "2024-01-01T10:30:00Z"
  },
  "message": "Ticket owner name changed successfully"
}
```

### Error Response (400)
```json
{
  "error": "Ticket not found or cannot be updated"
}
```

---

# ⛓️ Blockchain

## Get Blockchain

Returns all blocks in the blockchain.

### Request
```
GET /blockchain
```

### Example
```bash
curl http://localhost:3000/blockchain
```

### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "index": 0,
      "timestamp": 1704096000000,
      "data": {
        "type": "GENESIS",
        "message": "Genesis Block - Concert Ticketing System"
      },
      "previousHash": "0",
      "hash": "4f3a2b1c0d9e8f7c6b5a4d3e2f1c0b9a..."
    },
    {
      "index": 1,
      "timestamp": 1704096123456,
      "data": {
        "type": "TICKET_SOLD",
        "ticketId": "655f1235xyz",
        "concertId": "655f1234abcd5678",
        "seatLabel": "A1",
        "ownerName": "John Doe",
        "purchasedAt": "2024-01-01T10:30:00Z"
      },
      "previousHash": "4f3a2b1c0d9e8f7c6b5a4d3e2f1c0b9a...",
      "hash": "5a7c3e4d9f2b1c8e7d6c5b4a3f2e1d0c..."
    },
    {
      "index": 2,
      "timestamp": 1704096234567,
      "data": {
        "type": "TICKET_USED",
        "ticketId": "655f1235xyz",
        "concertId": "655f1234abcd5678",
        "seatLabel": "A1",
        "ownerName": "John Doe",
        "usedAt": "2024-01-01T20:45:00Z"
      },
      "previousHash": "5a7c3e4d9f2b1c8e7d6c5b4a3f2e1d0c...",
      "hash": "6b8d4f5e0a3c2d1f9e8d7c6b5a4f3e2d..."
    }
  ]
}
```

### Transaction Types
- `GENESIS` - Initial block
- `TICKET_SOLD` - Ticket purchased
- `TICKET_USED` - Ticket validated at entrance
- `TICKET_CANCELLED` - Ticket cancelled
- `TICKET_OWNER_CHANGED` - Owner name changed

---

## Validate Blockchain

Verifies the integrity of the blockchain.

### Request
```
GET /blockchain/validate
```

### Example
```bash
curl http://localhost:3000/blockchain/validate
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "valid": true,
    "chainLength": 42,
    "blocks": [
      {
        "index": 0,
        "hash": "4f3a2b1c...",
        "data": {"type": "GENESIS"}
      },
      ...
    ]
  }
}
```

### What It Checks
1. ✅ Each block's hash is correctly calculated
2. ✅ Each block's previousHash matches the prior block's hash
3. ✅ Chain is unbroken and tamper-proof

### Possible Results
- `"valid": true` - Chain is intact
- `"valid": false` - Chain has been tampered with (not possible in normal operation)

---

## Get Blockchain Statistics

Returns statistics about blockchain transactions.

### Request
```
GET /blockchain/stats
```

### Example
```bash
curl http://localhost:3000/blockchain/stats
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "totalBlocks": 42,
    "genesisBlock": {
      "index": 0,
      "timestamp": 1704096000000,
      "data": {"type": "GENESIS"},
      "hash": "4f3a2b1c..."
    },
    "latestBlock": {
      "index": 41,
      "timestamp": 1704098765432,
      "data": {"type": "TICKET_SOLD"},
      "hash": "9d1f7g8e..."
    },
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

# 🏥 Health Check

## Get Server Status

### Request
```
GET /health
```

### Response (200 OK)
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T10:30:00Z"
}
```

---

# Error Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input or concurrency issue |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server issue |

---

# Rate Limiting

None implemented (demo system)

---

# WebSocket Events (Socket.io)

## Client → Server

### Join Concert Room
```javascript
socket.emit('joinConcert', concertId);
```

### Leave Concert Room
```javascript
socket.emit('leaveConcert', concertId);
```

## Server → Client

### Seat Updated (Real-time)
```javascript
socket.on('seatUpdated', (data) => {
  console.log(data);
  // {
  //   concertId: "655f1234abcd5678",
  //   seat: {
  //     seatLabel: "A1",
  //     state: "SOLD",
  //     ownerName: "John Doe"
  //   },
  //   timestamp: "2024-01-01T10:30:00Z"
  // }
});
```

### Ticket State Changed
```javascript
socket.on('ticketStateChanged', (data) => {
  console.log(data);
  // {
  //   concertId: "655f1234abcd5678",
  //   ticket: {
  //     seatLabel: "A1",
  //     state: "USED",
  //     ownerName: "John Doe"
  //   },
  //   timestamp: "2024-01-01T20:45:00Z"
  // }
});
```

---

# Example Workflow

```bash
# 1. Create concert
CONCERT_ID=$(curl -s -X POST http://localhost:3000/concerts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Concert",
    "artist": "Artist",
    "venue": "Venue",
    "startTime": "2024-12-15T20:00:00Z",
    "endTime": "2024-12-15T23:00:00Z",
    "totalSeats": 100
  }' | jq -r '.data._id')

# 2. Get seats
curl http://localhost:3000/concerts/$CONCERT_ID/seats

# 3. Buy ticket
curl -X POST http://localhost:3000/tickets/buy \
  -H "Content-Type: application/json" \
  -d "{
    \"concertId\": \"$CONCERT_ID\",
    \"seatLabel\": \"A1\",
    \"ownerName\": \"John\"
  }"

# 4. Check blockchain
curl http://localhost:3000/blockchain

# 5. Validate blockchain
curl http://localhost:3000/blockchain/validate
```
