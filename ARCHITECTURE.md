# System Architecture

## High-Level Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                     Web Browser (Client)                          │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              Angular Frontend (Port 4200)                  │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │ Concert List Component                              │ │  │
│  │  │ - Display concerts                                  │ │  │
│  │  │ - Seat grid visualization (10x10)                  │ │  │
│  │  │ - Real-time updates with color coding              │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │ Services                                            │ │  │
│  │  │ - ConcertService (HTTP GET)                        │ │  │
│  │  │ - TicketService (HTTP POST)                        │ │  │
│  │  │ - WebSocketService (Socket.io)                     │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
             │                              │
             │ HTTP REST API                │ WebSocket
             │ (JSON)                       │ (Socket.io)
             │                              │
┌────────────▼──────────────────────────────▼──────────────────────┐
│            Express.js Backend (Port 3000)                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Routes Layer                                              │  │
│  │  - POST /concerts                                         │  │
│  │  - GET /concerts                                          │  │
│  │  - GET /concerts/:id                                      │  │
│  │  - POST /tickets/buy        ← CRITICAL CONCURRENCY       │  │
│  │  - POST /tickets/validate                                 │  │
│  │  - POST /tickets/cancel                                   │  │
│  │  - POST /tickets/change-name                              │  │
│  │  - GET /blockchain                                        │  │
│  │  - GET /blockchain/validate                               │  │
│  │  - GET /blockchain/stats                                  │  │
│  └──────────────────────┬──────────────────────────────────┘  │
│                         │                                      │
│  ┌──────────────────────▼──────────────────────────────────┐  │
│  │ Controllers Layer                                         │  │
│  │  - ConcertController                                      │  │
│  │  - TicketController                                       │  │
│  │  - BlockchainController                                   │  │
│  └──────────────────────┬──────────────────────────────────┘  │
│                         │                                      │
│  ┌──────────────────────▼──────────────────────────────────┐  │
│  │ Services Layer (Business Logic)                           │  │
│  │                                                            │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │ TicketService                                       │ │  │
│  │  │  • getSeatsForConcert()                             │ │  │
│  │  │  • buyTicket() ← MONGODB TRANSACTION                │ │  │
│  │  │  • validateTicket()                                 │ │  │
│  │  │  • cancelTicket()                                   │ │  │
│  │  │  • changeTicketOwnerName()                          │ │  │
│  │  │  • initializeTickets()                              │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  │                                                            │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │ BlockchainService                                   │ │  │
│  │  │  • logTicketSold()     → Add Block                  │ │  │
│  │  │  • logTicketUsed()     → Add Block                  │ │  │
│  │  │  • logTicketCancelled()→ Add Block                  │ │  │
│  │  │  • logTicketOwnerChanged()→ Add Block               │ │  │
│  │  │  • validateBlockchain()                             │ │  │
│  │  │  • getBlockchainStats()                             │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  │                                                            │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │ ConcertService                                      │ │  │
│  │  │  • createConcert()                                  │ │  │
│  │  │  • getAllConcerts()                                 │ │  │
│  │  │  • getConcertById()                                 │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  └──────────────────────┬──────────────────────────────────┘  │
│                         │                                      │
│  ┌──────────────────────▼──────────────────────────────────┐  │
│  │ Blockchain Layer (Custom Implementation)                 │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │ Blockchain Class                                    │ │  │
│  │  │  • chain: Block[]                                   │ │  │
│  │  │  • addBlock(data)                                   │ │  │
│  │  │  • validateChain()                                  │ │  │
│  │  │  • getLatestBlock()                                 │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │ Block Class                                         │ │  │
│  │  │  • index: number                                    │ │  │
│  │  │  • timestamp: number                                │ │  │
│  │  │  • data: object                                     │ │  │
│  │  │  • previousHash: string                             │ │  │
│  │  │  • hash: string (SHA256)                            │ │  │
│  │  │  • calculateHash()                                  │ │  │
│  │  │  • isValid()                                        │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  └──────────────────────┬──────────────────────────────────┘  │
│                         │                                      │
│  ┌──────────────────────▼──────────────────────────────────┐  │
│  │ Socket.io Configuration                                 │  │
│  │  • configureSocket(io)                                  │  │
│  │  • broadcastSeatUpdate()                                │  │
│  │  • broadcastTicketStateChange()                         │  │
│  │  • Rooms: concert-{concertId}                           │  │
│  └──────────────────────┬──────────────────────────────────┘  │
│                         │                                      │
└─────────────────────────┼──────────────────────────────────────┘
                          │
             ┌────────────┴────────────┐
             │                         │
             ▼                         ▼
        ┌─────────────┐         ┌──────────────┐
        │  MongoDB    │         │  Socket.io   │
        │  Database   │         │  (In-Memory) │
        │  (Persisted)│         │  (Broadcast) │
        └─────────────┘         └──────────────┘
```

## Data Flow Diagram

### Ticket Purchase Flow (Critical Concurrency Control)

```
┌─────────────────────────────────────────────────────────────────┐
│  User 1 & User 2 Attempt to Buy Seat A1 Simultaneously         │
└────────────────────────┬────────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
        ▼                                 ▼
    User 1                            User 2
    Request                           Request
        │                                 │
        └────────────────┬────────────────┘
                         │
         ┌───────────────▼───────────────┐
         │  Express Router               │
         │  POST /tickets/buy            │
         └───────────────┬───────────────┘
                         │
         ┌───────────────▼───────────────┐
         │  TicketController             │
         │  .buyTicket()                 │
         └───────────────┬───────────────┘
                         │
         ┌───────────────▼───────────────────────────┐
         │  TicketService.buyTicket()                │
         │  1. Start MongoDB Session                 │
         │  2. Start Transaction                     │
         │  3. findOneAndUpdate():                   │
         │     {                                     │
         │       concertId: X,                       │
         │       seatLabel: "A1",                    │
         │       state: "AVAILABLE" ← KEY CONDITION  │
         │     }                                     │
         └───────────────┬───────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
        ▼                                 ▼
    Query Matches                   Query Doesn't Match
    (First User)                    (Second User)
        │                                 │
        ▼                                 ▼
    Update to SOLD              Transaction Fails
    Commit Transaction          Throw Error
    Return Success              Return "Seat not
                                available..."
        │
        ├─────────────────────────┐
        │                         │
        ▼                         ▼
    Blockchain:              Socket.io:
    addBlock()               broadcastSeatUpdate()
        │                         │
        ├─────────────────────────┤
        │                         │
        ▼                         ▼
    Immutable Record        All Connected Clients
    on Blockchain          See A1 as SOLD
```

### Real-Time Update Flow

```
User 1 Purchases Ticket                User 2 (Viewing Same Concert)
        │                                      │
        ├──POST /tickets/buy──────────────────┤
        │                                      │
        ├─ Transaction Succeeds                │
        │                                      │
        ├─ blockchainService.logTicketSold()  │
        │                                      │
        ├─ io.to('concert-X').emit()          │
        │     'seatUpdated'                    │
        │                                      │
        └─────────────────────────────────────►│
                                        Receive seatUpdated
                                        event via WebSocket
                                               │
                                        Refresh seat grid
                                        A1 turns RED
                                        instantly
```

## Concurrency Control: Technical Deep Dive

### Problem Statement
Two users buy ticket for seat A1 simultaneously:
```
User 1: BUY A1 ─────┐
                    ├─► Only ONE should succeed
User 2: BUY A1 ─────┘
```

### Solution: MongoDB Atomic Update

**Code:**
```javascript
const ticket = await Ticket.findOneAndUpdate(
  {
    concertId,
    seatLabel,
    state: TICKET_STATES.AVAILABLE,  // ← CRITICAL
  },
  {
    state: TICKET_STATES.SOLD,
    ownerName,
    purchasedAt: new Date(),
  },
  { new: true, session }  // ← Transaction
);
```

**Why it works:**
1. MongoDB query-update is atomic (all-or-nothing)
2. Only ONE document can match the filter conditions
3. Once matched and updated, document no longer has state=AVAILABLE
4. Second request's query fails to find matching document
5. Returns null instead of throwing error
6. Code throws error: "Seat not available or already sold"

**Database level guarantee:**
- No race condition possible
- Both concurrent requests hit database
- Only one succeeds atomically
- No transaction overhead after first write

### Why NOT to use...

❌ Check then Update (Race Condition)
```javascript
// BAD - Race condition window
const ticket = await Ticket.findOne({...});
if (ticket.state === 'AVAILABLE') {  // ← Race here!
  await Ticket.updateOne(...);
}
// Thread 1 checks, Thread 2 checks, both see AVAILABLE, both update!
```

✅ Atomic Update-with-Condition (Used)
```javascript
// GOOD - Atomic guarantee
const ticket = await Ticket.findOneAndUpdate({
  ...conditions..., 
  state: AVAILABLE  // ← Part of query filter
}, {...update...});

if (!ticket) throw Error; // Handles race gracefully
```

## Blockchain Implementation

### Block Structure
```typescript
{
  index: 0,
  timestamp: 1704096123456,
  data: {
    type: "TICKET_SOLD",
    ticketId: "...",
    concertId: "...",
    seatLabel: "A1",
    ownerName: "John Doe",
    purchasedAt: "2024-01-01T..."
  },
  previousHash: "0", // First block
  hash: SHA256(JSON.stringify(block))
}
```

### Hash Calculation
```javascript
const blockString = JSON.stringify({
  index,
  timestamp,
  data,
  previousHash,
});

const hash = crypto
  .createHash('sha256')
  .update(blockString)
  .digest('hex');
```

### Chain Validation Algorithm
```javascript
validateChain() {
  for (let i = 1; i < chain.length; i++) {
    const current = chain[i];
    const previous = chain[i - 1];

    // Check 1: Current block's hash is correct
    if (current.hash !== current.calculateHash()) {
      return false; // TAMPERED
    }

    // Check 2: Chain link intact
    if (current.previousHash !== previous.hash) {
      return false; // BROKEN LINK
    }
  }
  return true; // VALID
}
```

### Why It's Immutable
1. Changing ANY field in block changes hash
2. New hash breaks chain link to next block
3. Validation fails immediately
4. Tampering detected

### Transaction Types
| Type | Event | Data |
|------|-------|------|
| TICKET_SOLD | User purchases | ticketId, seatLabel, ownerName |
| TICKET_USED | Validation at entrance | ticketId, seatLabel, usedAt |
| TICKET_CANCELLED | Cancellation | ticketId, seatLabel, cancelledAt |
| TICKET_OWNER_CHANGED | Name change | ticketId, oldName, newName |

## Models & Data Schema

### Concert
```json
{
  "_id": "ObjectId",
  "name": "string",
  "artist": "string",
  "venue": "string",
  "startTime": "Date",
  "endTime": "Date",
  "totalSeats": "number",
  "rows": "number",
  "seatsPerRow": "number",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Ticket
```json
{
  "_id": "ObjectId",
  "concertId": "ObjectId (ref: Concert)",
  "seatRow": "string (A-Z)",
  "seatNumber": "number (1-N)",
  "seatLabel": "string (A1, A2, ...)",
  "ownerName": "string",
  "state": "enum (AVAILABLE|SOLD|USED|CANCELLED|EXPIRED)",
  "purchasedAt": "Date",
  "usedAt": "Date",
  "cancelledAt": "Date",
  "blockchainHash": "string (SHA256)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Block (Blockchain)
```json
{
  "index": "number",
  "timestamp": "number (ms)",
  "data": "object (transaction)",
  "previousHash": "string",
  "hash": "string (SHA256)"
}
```

## Middleware & Middleware Chain

```
HTTP Request
    │
    ▼
┌─────────────────────────┐
│ Express.json()          │ Parse JSON body
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Express.urlencoded()    │ Parse form data
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ CORS Middleware         │ Add CORS headers
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Route Handler           │ Execute endpoint
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Error Handler           │ Catch errors
└────────┬────────────────┘
         │
         ▼
HTTP Response
```

## Socket.io Architecture

### Room Management
```
Client connects
    │
    ├─ socket.id = "abc123"
    │
    ├─ Receives: joinConcert(concertId)
    │
    ├─ socket.join('concert-X')
    │
    └─ Now in room 'concert-X'

When ticket purchased:
    │
    ├─ io.to('concert-X').emit('seatUpdated')
    │
    └─ ALL clients in room get update
```

### Events

**Client → Server:**
- `joinConcert(concertId)` - Enter concert room
- `leaveConcert(concertId)` - Exit concert room

**Server → Client:**
- `seatUpdated` - Seat state changed
- `ticketStateChanged` - Ticket state changed

## Deployment Architecture

### Docker Compose Stack

```yaml
Services:
  mongo:
    - MongoDB database
    - Volume: mongo_data
    - Port: 27017
    - Health check enabled

  backend:
    - Express + Node.js
    - Depends on: mongo (healthy)
    - Port: 3000
    - Environment: MONGODB_URI, NODE_ENV

  frontend:
    - Angular app
    - Depends on: backend
    - Port: 4200
    - Built static assets

Network:
  concert-network: (bridge driver)
    - Connects all services
    - Internal DNS resolution
    - Service discovery

Volumes:
  mongo_data: (named)
    - Persists MongoDB data
    - Survives container restarts
```

## Performance Considerations

### Scalability
- **Ticket Purchasing**: O(1) - Atomic database operation
- **Seat Grid Loading**: O(N) where N = total seats (typically 100-1000)
- **Blockchain Validation**: O(N) where N = block count (log with time)

### Concurrency
- MongoDB transactions ensure ACID compliance
- Each purchase is atomic (all-or-nothing)
- No application-level locking needed
- Database-level concurrency control

### Real-time Limits
- Socket.io broadcasts: Limited by server memory
- In-memory room management
- Scales to ~1000 concurrent connections (single node)
- For more: Use Redis adapter for Socket.io

## Security Notes (Demo System)

⚠️ **Not Production-Ready:**
- No authentication/authorization
- No input validation (should add)
- No rate limiting
- No HTTPS
- All CORS allowed
- No data encryption

✅ **For Production:**
- Add JWT authentication
- Implement role-based access control (RBAC)
- Add request validation with Joi/Yup
- Rate limiting with express-rate-limit
- HTTPS with TLS certificates
- CORS whitelist specific origins
- Add helmet for security headers

## Testing Strategy

### Unit Tests
- Block.js: `calculateHash()`, `isValid()`
- Blockchain.js: `addBlock()`, `validateChain()`
- Services: Business logic

### Integration Tests
- Concert creation and ticket initialization
- Concurrent ticket purchases
- Blockchain recording
- Socket.io broadcasts

### End-to-End Tests
- Full user workflow
- Multi-user concurrency
- Real-time updates
- Blockchain integrity

## Monitoring & Observability

### Logs
- Express access logs
- MongoDB connection logs
- Socket.io connection events
- Error stack traces

### Metrics
- Active connections
- Tickets purchased per minute
- Blockchain blocks added
- API response times

### Health Checks
- `/health` endpoint
- MongoDB connection test
- Blockchain validation periodic check
