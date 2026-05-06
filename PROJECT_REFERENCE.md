# 📁 Project Structure & File Reference

## Complete Project Layout

```
concert-ticketing/
│
├── 📄 README.md                          [Main overview & getting started]
├── 📄 SETUP_GUIDE.md                     [Step-by-step setup instructions]
├── 📄 API_DOCUMENTATION.md               [All API endpoints with examples]
├── 📄 ARCHITECTURE.md                    [System design & diagrams]
├── 📄 TEST_GUIDE.md                      [Comprehensive test scenarios]
├── 📄 PROJECT_REFERENCE.md               [This file]
│
├── 🚀 start.sh                           [Linux/Mac quick start script]
├── 🚀 start.bat                          [Windows quick start script]
│
├── 📦 docker-compose.yml                 [Services orchestration]
├── .gitignore                             [Git ignore patterns]
│
│
├── 📁 backend/                           [Express.js Backend]
│   │
│   ├── 📁 src/
│   │   │
│   │   ├── 📁 models/                    [MongoDB Schemas]
│   │   │   ├── Concert.js                [Concert document schema]
│   │   │   └── Ticket.js                 [Ticket document schema]
│   │   │
│   │   ├── 📁 controllers/               [Request Handlers]
│   │   │   ├── ConcertController.js      [Concert CRUD endpoints]
│   │   │   ├── TicketController.js       [Ticket operations with blockchain]
│   │   │   └── BlockchainController.js   [Blockchain query endpoints]
│   │   │
│   │   ├── 📁 services/                  [Business Logic Layer]
│   │   │   ├── ConcertService.js         [Concert operations]
│   │   │   ├── TicketService.js          [🔥 Concurrency control here!]
│   │   │   └── BlockchainService.js      [Blockchain logging]
│   │   │
│   │   ├── 📁 blockchain/                [Custom Blockchain]
│   │   │   ├── Block.js                  [Single block with SHA256]
│   │   │   └── Blockchain.js             [Chain management & validation]
│   │   │
│   │   ├── 📁 routes/                    [API Route Definitions]
│   │   │   ├── concertRoutes.js          [GET/POST concerts]
│   │   │   ├── ticketRoutes.js           [Ticket endpoints]
│   │   │   └── blockchainRoutes.js       [Blockchain endpoints]
│   │   │
│   │   ├── 📁 socket/                    [WebSocket Real-time]
│   │   │   └── socketConfig.js           [Socket.io event handlers]
│   │   │
│   │   ├── 📁 middleware/                [Express Middleware]
│   │   │   ├── errorHandler.js           [Error handling]
│   │   │   ├── cors.js                   [CORS headers]
│   │   │   └── db.js                     [MongoDB connection]
│   │   │
│   │   ├── app.js                        [Express app setup]
│   │   └── server.js                     [🚀 Entry point]
│   │
│   ├── package.json                      [Dependencies]
│   ├── .env                              [Environment variables]
│   ├── Dockerfile                        [Container image]
│   └── .gitignore                        [Git ignore]
│
│
├── 📁 frontend/                          [Angular Frontend]
│   │
│   ├── 📁 src/
│   │   │
│   │   ├── 📁 app/
│   │   │   │
│   │   │   ├── 📁 components/            [UI Components]
│   │   │   │   ├── concert-list.component.ts      [Main component]
│   │   │   │   ├── concert-list.component.html    [Template]
│   │   │   │   └── concert-list.component.css     [Styling]
│   │   │   │
│   │   │   ├── 📁 services/              [HTTP & WebSocket]
│   │   │   │   ├── concert.service.ts    [Concert HTTP calls]
│   │   │   │   ├── ticket.service.ts     [Ticket HTTP calls]
│   │   │   │   └── websocket.service.ts  [Socket.io client]
│   │   │   │
│   │   │   └── app.component.ts          [Root component]
│   │   │
│   │   ├── 📁 assets/                    [Static files]
│   │   │
│   │   ├── main.ts                       [Bootstrap Angular]
│   │   ├── index.html                    [HTML page]
│   │   └── styles.css                    [Global styles]
│   │
│   ├── package.json                      [Dependencies]
│   ├── tsconfig.json                     [TypeScript config]
│   ├── tsconfig.app.json                 [App-specific config]
│   ├── tsconfig.spec.json                [Test config]
│   ├── Dockerfile                        [Container image]
│   ├── .gitignore                        [Git ignore]
│   └── angular.json                      [Angular config]
│
```

## File Descriptions

### 📚 Documentation Files

#### `README.md` (1000+ lines)
- **Purpose**: Main project overview
- **Content**:
  - Project summary
  - Tech stack
  - Key features
  - Quick start instructions
  - API endpoints overview
  - Test scenarios
  - Deployment notes
- **Read this first** ✅

#### `SETUP_GUIDE.md` (500+ lines)
- **Purpose**: Detailed setup instructions
- **Content**:
  - Prerequisites
  - Docker Compose quick start
  - Local development setup
  - API endpoint examples
  - Troubleshooting guide
- **Follow for initial setup** ✅

#### `API_DOCUMENTATION.md` (600+ lines)
- **Purpose**: Complete API reference
- **Content**:
  - All endpoints with curl examples
  - Request/response formats
  - Error codes
  - WebSocket events
  - Example workflows
- **Consult for API calls** ✅

#### `ARCHITECTURE.md` (800+ lines)
- **Purpose**: System design documentation
- **Content**:
  - High-level architecture diagrams
  - Data flow diagrams
  - Concurrency control deep dive
  - Blockchain implementation
  - Performance considerations
  - Security notes
- **Study for understanding design** ✅

#### `TEST_GUIDE.md` (400+ lines)
- **Purpose**: Comprehensive test procedures
- **Content**:
  - 9 different test scenarios
  - Step-by-step execution
  - Expected results
  - Verification methods
  - Troubleshooting
- **Follow for quality assurance** ✅

---

### 🚀 Quick Start Scripts

#### `start.sh`
- **Purpose**: Linux/Mac quick start
- **Usage**: `bash start.sh`
- **Does**:
  - Checks Docker installation
  - Cleans up old containers
  - Builds images
  - Starts services
  - Waits for health check
  - Displays URLs

#### `start.bat`
- **Purpose**: Windows quick start
- **Usage**: Double-click or `start.bat`
- **Does**: Same as start.sh but for Windows

---

### 🐳 Container Configuration

#### `docker-compose.yml`
- **Purpose**: Orchestrate all services
- **Services**:
  - **mongo** (MongoDB database)
  - **backend** (Express.js)
  - **frontend** (Angular)
- **Features**:
  - Health checks
  - Volume management
  - Network bridging
  - Environment variables

---

### 🔙 Backend Files

#### `backend/src/server.js` ⭐ ENTRY POINT
- **Purpose**: Main server startup
- **Does**:
  - Connects MongoDB
  - Creates Express app
  - Initializes Socket.io
  - Starts HTTP server
  - Handles graceful shutdown
- **Key Code**: `startServer()` function

#### `backend/src/app.js`
- **Purpose**: Express app configuration
- **Does**:
  - Sets up middleware (JSON, CORS)
  - Mounts routes
  - Configures error handlers
  - Health check endpoint
- **Routes Mounted**:
  - `/concerts`
  - `/tickets`
  - `/blockchain`

#### `backend/src/models/Concert.js`
- **Purpose**: MongoDB Concert schema
- **Fields**:
  - name, artist, venue
  - startTime, endTime
  - totalSeats, rows, seatsPerRow
- **Validations**:
  - endTime > startTime

#### `backend/src/models/Ticket.js`
- **Purpose**: MongoDB Ticket schema
- **Fields**:
  - concertId, seatLabel, ownerName
  - state (AVAILABLE|SOLD|USED|CANCELLED|EXPIRED)
  - purchasedAt, usedAt, cancelledAt
  - blockchainHash
- **Indexes**:
  - Compound index on concertId + seatRow + seatNumber (unique)

#### `backend/src/services/TicketService.js` 🔥 CRITICAL
- **Purpose**: Ticket business logic with concurrency control
- **Key Method**: `buyTicket()`
  ```javascript
  // ATOMIC - Prevents double-booking
  await Ticket.findOneAndUpdate({
    concertId,
    seatLabel,
    state: TICKET_STATES.AVAILABLE,  // Only matches available
  }, {...}, { session })  // Transaction
  ```
- **Other Methods**:
  - `validateTicket()` - Time-based validation
  - `cancelTicket()` - Cancellation
  - `changeTicketOwnerName()` - Update owner
  - `getSeatsForConcert()` - Grid display
  - `initializeTickets()` - Setup for concert

#### `backend/src/services/BlockchainService.js`
- **Purpose**: Log all ticket transactions to blockchain
- **Methods**:
  - `logTicketSold()` - Add purchase to blockchain
  - `logTicketUsed()` - Add validation to blockchain
  - `logTicketCancelled()` - Add cancellation
  - `logTicketOwnerChanged()` - Add name change
  - `validateBlockchain()` - Verify chain
  - `getBlockchainStats()` - Statistics

#### `backend/src/blockchain/Block.js`
- **Purpose**: Individual blockchain block
- **Fields**:
  - index, timestamp, data
  - previousHash, hash (SHA256)
- **Methods**:
  - `calculateHash()` - SHA256 hashing
  - `isValid()` - Hash verification
  - `toJSON()` - Serialization

#### `backend/src/blockchain/Blockchain.js`
- **Purpose**: Blockchain chain management
- **Chain**: Array of Block objects
- **Methods**:
  - `addBlock(data)` - Append block
  - `validateChain()` - Verify integrity
  - `getLatestBlock()` - Latest block
  - `toJSON()` - Serialize chain

#### `backend/src/controllers/TicketController.js`
- **Purpose**: Handle ticket HTTP requests
- **Endpoints**:
  - `buyTicket()` - POST /tickets/buy
  - `validateTicket()` - POST /tickets/validate
  - `cancelTicket()` - POST /tickets/cancel
  - `changeTicketOwnerName()` - POST /tickets/change-name
  - `getSeats()` - GET /concerts/:id/seats
- **Features**:
  - Calls TicketService
  - Logs to blockchain
  - Broadcasts via Socket.io
  - Handles errors gracefully

#### `backend/src/socket/socketConfig.js`
- **Purpose**: WebSocket real-time updates
- **Events Server Sends**:
  - `seatUpdated` - When seat is purchased
  - `ticketStateChanged` - State changes
- **Events Server Receives**:
  - `joinConcert` - User joins concert room
  - `leaveConcert` - User leaves concert room
- **Rooms**: `concert-{concertId}` for isolation

---

### 🎨 Frontend Files

#### `frontend/src/main.ts`
- **Purpose**: Angular bootstrap
- **Does**:
  - Bootstraps AppComponent
  - Provides HttpClient
  - Mounts to #app-root

#### `frontend/src/app/app.component.ts`
- **Purpose**: Root component
- **Contains**: ConcertListComponent

#### `frontend/src/app/components/concert-list.component.ts`
- **Purpose**: Main UI component
- **Features**:
  - Concert list display
  - Seat grid (10x10)
  - Real-time updates
  - Ticket purchase form
- **Styling**:
  - 🟢 Green = AVAILABLE
  - 🔴 Red = SOLD
  - 🟣 Purple = USED
  - ⚪ White = CANCELLED
  - ⚫ Black = EXPIRED

#### `frontend/src/app/components/concert-list.component.html`
- **Purpose**: Component template
- **Sections**:
  - Concert list view
  - Seat selection view
  - Booking form
  - Status messages

#### `frontend/src/app/components/concert-list.component.css`
- **Purpose**: Styling
- **Features**:
  - Responsive grid layout
  - Dark theme with cyan accent
  - Smooth animations
  - Mobile support

#### `frontend/src/app/services/concert.service.ts`
- **Purpose**: HTTP calls for concerts
- **Methods**:
  - `getAllConcerts()` - GET /concerts
  - `getConcertById(id)` - GET /concerts/:id
  - `createConcert(data)` - POST /concerts

#### `frontend/src/app/services/ticket.service.ts`
- **Purpose**: HTTP calls for tickets
- **Methods**:
  - `getSeats(concertId)` - GET /concerts/:id/seats
  - `buyTicket()` - POST /tickets/buy
  - `validateTicket()` - POST /tickets/validate
  - `cancelTicket()` - POST /tickets/cancel
  - `changeTicketOwnerName()` - POST /tickets/change-name

#### `frontend/src/app/services/websocket.service.ts`
- **Purpose**: WebSocket client
- **Features**:
  - Socket.io connection
  - Join/leave concert rooms
  - Listener registration
- **Events**:
  - `onSeatUpdated()` - Listen for seat changes
  - `onTicketStateChanged()` - Listen for state changes

#### `frontend/src/index.html`
- **Purpose**: HTML page shell
- **Contains**:
  - Meta tags
  - `<app-root>` placeholder
  - Global styles

#### `frontend/package.json`
- **Dependencies**:
  - Angular 18
  - Socket.io-client
  - RxJS
- **Scripts**:
  - `start` - Dev server (port 4200)
  - `build` - Production build

---

### 📦 Configuration Files

#### `backend/package.json`
- **Dependencies**:
  - express 4.18.2
  - mongoose 7.5.0
  - socket.io 4.7.1
  - dotenv 16.3.1
- **Scripts**:
  - `start` - Production
  - `dev` - Development with nodemon

#### `backend/.env`
```
PORT=3000
MONGODB_URI=mongodb://mongo:27017/concert-ticketing
NODE_ENV=development
```

#### `backend/Dockerfile`
- **Base**: node:18-alpine
- **Steps**:
  - Install dependencies
  - Copy code
  - Expose port 3000
  - Run npm start

#### `frontend/Dockerfile`
- **Base**: node:18-alpine (builder)
- **Final**: node:18-alpine
- **Steps**:
  - Build Angular app
  - Serve static files
  - Expose port 4200
  - Run http-server

---

## Data Flow Summary

### Purchase Flow
```
User → Frontend → REST API → TicketService → MongoDB
  ↓
TicketService.buyTicket() (MongoDB Transaction)
  ↓
✅ Success / ❌ Failure
  ↓
BlockchainService.logTicketSold() → Add Block
  ↓
Socket.io broadcast seatUpdated → All Users
  ↓
Frontend receives WebSocket event → Update grid
```

### Concurrency Control Flow
```
User 1: POST /tickets/buy A1
User 2: POST /tickets/buy A1 (simultaneous)
  ↓
MongoDB findOneAndUpdate (atomic)
  ├─ Query: {state: AVAILABLE}
  ├─ Only matches ONE document
  └─ Second query fails
  ↓
User 1: Success ✅
User 2: Error "Seat already sold" ❌
```

### Real-time Update Flow
```
Purchase Successful → Blockchain Log
  ↓
Controller calls broadcastSeatUpdate()
  ↓
io.to('concert-X').emit('seatUpdated', data)
  ↓
All users in room receive event
  ↓
Frontend Component.seats updated
  ↓
Template re-renders with color change
```

---

## Key Statistics

| Metric | Value |
|--------|-------|
| Total Files | 45+ |
| Total Lines of Code | 5000+ |
| Backend Files | 25+ |
| Frontend Files | 10+ |
| Test Scenarios | 9 |
| API Endpoints | 13 |
| Blockchain Features | 5 |
| Docker Services | 3 |

---

## How to Navigate

### I want to understand the system
1. Read `README.md`
2. Study `ARCHITECTURE.md`
3. Review data models in `backend/src/models/`

### I want to run the system
1. Follow `SETUP_GUIDE.md`
2. Run `start.sh` or `start.bat`
3. Open http://localhost:4200

### I want to test the system
1. Refer to `TEST_GUIDE.md`
2. Follow test scenarios step-by-step
3. Use provided curl commands

### I want to call an API
1. Check `API_DOCUMENTATION.md`
2. Find endpoint
3. Copy curl example
4. Modify parameters

### I want to understand concurrency control
1. Read `ARCHITECTURE.md` section "Concurrency Control"
2. Review `backend/src/services/TicketService.js` line `buyTicket()`
3. Study MongoDB transaction usage

### I want to understand blockchain
1. Review `backend/src/blockchain/Block.js`
2. Review `backend/src/blockchain/Blockchain.js`
3. Check `backend/src/services/BlockchainService.js` logging calls
4. Run `/blockchain/validate` endpoint

### I want to understand real-time updates
1. Check `backend/src/socket/socketConfig.js`
2. Review `frontend/src/app/services/websocket.service.ts`
3. Check `concert-list.component.ts` subscription
4. Test with two browser windows

---

## Common Questions

**Q: Where is concurrency control implemented?**
A: `backend/src/services/TicketService.js` - `buyTicket()` method uses MongoDB transactions

**Q: How does real-time updates work?**
A: `backend/src/socket/socketConfig.js` broadcasts `seatUpdated` events

**Q: Where are blockchain transactions logged?**
A: `backend/src/services/BlockchainService.js` - logs every ticket action

**Q: How do I run locally without Docker?**
A: See `SETUP_GUIDE.md` → "Local Development Setup"

**Q: Where are the test scenarios?**
A: `TEST_GUIDE.md` - 9 comprehensive test cases

**Q: What's the database schema?**
A: `backend/src/models/Concert.js` and `Ticket.js`

**Q: How are seats initialized?**
A: `TicketService.initializeTickets()` creates seats when concert is created

**Q: Can I modify seat grid dimensions?**
A: Yes - when creating concert, set `rows` and `seatsPerRow`

---

This file serves as a comprehensive reference to all 45+ files in the project!
