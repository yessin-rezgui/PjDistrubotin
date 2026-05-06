# Test Guide - Comprehensive Test Scenarios

## 🎯 Test Execution Guide

### Prerequisites
- System running: `docker-compose up`
- All services healthy
- Terminal/Postman ready

---

## Test 1: Double Booking Prevention ✅ CRITICAL

**Objective**: Verify concurrency control prevents two users from buying the same seat

### Setup
```bash
# Create test concert
CONCERT_ID=$(curl -s -X POST http://localhost:3000/concerts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Concert",
    "artist": "Test Artist",
    "venue": "Test Venue",
    "startTime": "2024-12-15T20:00:00Z",
    "endTime": "2024-12-15T23:00:00Z",
    "totalSeats": 100,
    "rows": 10,
    "seatsPerRow": 10
  }' | jq -r '.data._id')

echo "Concert ID: $CONCERT_ID"
```

### Execute Concurrent Requests

**Terminal 1:**
```bash
CONCERT_ID="<your-id>"
curl -X POST http://localhost:3000/tickets/buy \
  -H "Content-Type: application/json" \
  -d "{
    \"concertId\": \"$CONCERT_ID\",
    \"seatLabel\": \"A1\",
    \"ownerName\": \"User1\"
  }"
```

**Terminal 2 (simultaneously or within 100ms):**
```bash
CONCERT_ID="<your-id>"
curl -X POST http://localhost:3000/tickets/buy \
  -H "Content-Type: application/json" \
  -d "{
    \"concertId\": \"$CONCERT_ID\",
    \"seatLabel\": \"A1\",
    \"ownerName\": \"User2\"
  }"
```

### Expected Results

**Terminal 1 (First Request):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "seatLabel": "A1",
    "state": "SOLD",
    "ownerName": "User1",
    ...
  },
  "message": "Ticket purchased successfully"
}
```

**Terminal 2 (Second Request - Should Fail):**
```json
{
  "error": "Seat not available or already sold"
}
```

### Verification
✅ Pass: Only one request succeeds
❌ Fail: Both succeed or error message differs

---

## Test 2: Real-Time Updates via WebSocket ✅

**Objective**: Verify all connected users see seat updates instantly

### Setup
1. Open http://localhost:4200 in **two browser windows** (side-by-side)
2. Both windows should show the same concert
3. Keep browser DevTools open (F12)

### Execute

**Window 1:**
1. Click on concert
2. Select seat A2
3. Enter name "Window1User"
4. Click "Buy Ticket"

**Observe Window 2:**
1. Seat A2 should turn RED instantly
2. Message should appear: "✨ Seat updated by another user"
3. No page refresh needed

### Verification
✅ Pass: Seat changes color instantly in Window 2
❌ Fail: Seat stays green or requires page refresh

### Diagnostic
- Check Browser DevTools → Network
- Should see `seatUpdated` event in WebSocket
- Timestamp should match button click time

---

## Test 3: Ticket Validation (Time-Based) ✅

**Objective**: Verify ticket can only be validated during concert time

### Create Concert (Within Next 10 Minutes)
```bash
NOW=$(date -u +%Y-%m-%dT%H:%M:%SZ)
START_TIME=$(date -u -d "+1 minute" +%Y-%m-%dT%H:%M:%SZ)
END_TIME=$(date -u -d "+10 minutes" +%Y-%m-%dT%H:%M:%SZ)

curl -X POST http://localhost:3000/concerts \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Validation Test\",
    \"artist\": \"Test\",
    \"venue\": \"Test\",
    \"startTime\": \"$START_TIME\",
    \"endTime\": \"$END_TIME\",
    \"totalSeats\": 100
  }"
```

### Test Case A: Before Concert Starts
```bash
curl -X POST http://localhost:3000/tickets/validate \
  -H "Content-Type: application/json" \
  -d "{
    \"concertId\": \"$CONCERT_ID\",
    \"seatLabel\": \"A1\"
  }"
```

**Expected:**
```json
{
  "error": "Concert has not started yet"
}
```

### Test Case B: During Concert (Wait 1+ Minute)
```bash
# Wait for concert to start
sleep 65

curl -X POST http://localhost:3000/tickets/validate \
  -H "Content-Type: application/json" \
  -d "{
    \"concertId\": \"$CONCERT_ID\",
    \"seatLabel\": \"A1\"
  }"
```

**Expected:**
```json
{
  "success": true,
  "data": {
    "state": "USED",
    "usedAt": "...",
    ...
  },
  "message": "Ticket validated successfully"
}
```

### Test Case C: After Concert Ends (Wait Until End Time)
```bash
# Wait for concert to end
sleep 540  # 9 minutes

curl -X POST http://localhost:3000/tickets/validate \
  -H "Content-Type: application/json" \
  -d "{
    \"concertId\": \"$CONCERT_ID\",
    \"seatLabel\": \"B1\"
  }"
```

**Expected:**
```json
{
  "error": "Concert has already ended"
}
```

### Verification
✅ Pass: All three cases return expected responses
❌ Fail: Time validation bypassed

---

## Test 4: Blockchain Integrity ✅

**Objective**: Verify blockchain records all transactions and is tamper-proof

### Step 1: Get Initial Blockchain
```bash
curl http://localhost:3000/blockchain | jq '.data | length'
```

Note the length (should be 1 for genesis block only)

### Step 2: Purchase Multiple Tickets
```bash
for i in {1..5}; do
  curl -X POST http://localhost:3000/tickets/buy \
    -H "Content-Type: application/json" \
    -d "{
      \"concertId\": \"$CONCERT_ID\",
      \"seatLabel\": \"A$i\",
      \"ownerName\": \"User$i\"
    }" > /dev/null
done
```

### Step 3: Check Blockchain
```bash
curl http://localhost:3000/blockchain | jq '.'
```

**Expected:**
```json
{
  "success": true,
  "data": [
    {
      "index": 0,
      "data": {"type": "GENESIS"},
      "hash": "..."
    },
    {
      "index": 1,
      "data": {
        "type": "TICKET_SOLD",
        "seatLabel": "A1",
        "ownerName": "User1"
      },
      "hash": "..."
    },
    ...
  ]
}
```

### Step 4: Validate Chain Integrity
```bash
curl http://localhost:3000/blockchain/validate
```

**Expected:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "chainLength": 6,
    "blocks": [...]
  }
}
```

### Step 5: Check Statistics
```bash
curl http://localhost:3000/blockchain/stats | jq '.'
```

**Expected:**
```json
{
  "success": true,
  "data": {
    "totalBlocks": 6,
    "transactions": {
      "sold": 5,
      "used": 0,
      "cancelled": 0,
      "ownerChanged": 0
    }
  }
}
```

### Verification
✅ Pass: 
- Blockchain grows with each purchase
- All hashes correct
- Chain validation returns `valid: true`
- Statistics match actions

❌ Fail: Any check returns false or doesn't match

---

## Test 5: Ticket Cancellation ✅

**Objective**: Verify ticket can be cancelled and is logged to blockchain

### Step 1: Buy Ticket
```bash
curl -X POST http://localhost:3000/tickets/buy \
  -H "Content-Type: application/json" \
  -d "{
    \"concertId\": \"$CONCERT_ID\",
    \"seatLabel\": \"C1\",
    \"ownerName\": \"CancelTest\"
  }" | jq '.'
```

### Step 2: Cancel Ticket
```bash
curl -X POST http://localhost:3000/tickets/cancel \
  -H "Content-Type: application/json" \
  -d "{
    \"concertId\": \"$CONCERT_ID\",
    \"seatLabel\": \"C1\"
  }" | jq '.'
```

**Expected:**
```json
{
  "success": true,
  "data": {
    "seatLabel": "C1",
    "state": "CANCELLED",
    "cancelledAt": "...",
    ...
  },
  "message": "Ticket cancelled successfully"
}
```

### Step 3: Verify Blockchain
```bash
curl http://localhost:3000/blockchain | jq '.data | map(select(.data.type == "TICKET_CANCELLED"))'
```

**Expected:** Should include the cancellation transaction

### Verification
✅ Pass: Ticket state is CANCELLED, logged to blockchain
❌ Fail: Ticket not cancelled or not on blockchain

---

## Test 6: Change Ticket Owner Name ✅

**Objective**: Verify owner name can be changed and is logged

### Step 1: Buy Ticket
```bash
curl -X POST http://localhost:3000/tickets/buy \
  -H "Content-Type: application/json" \
  -d "{
    \"concertId\": \"$CONCERT_ID\",
    \"seatLabel\": \"D1\",
    \"ownerName\": \"OriginalName\"
  }" | jq '.data | {seatLabel, ownerName, state}'
```

### Step 2: Change Name
```bash
curl -X POST http://localhost:3000/tickets/change-name \
  -H "Content-Type: application/json" \
  -d "{
    \"concertId\": \"$CONCERT_ID\",
    \"seatLabel\": \"D1\",
    \"newOwnerName\": \"ChangedName\"
  }" | jq '.data | {seatLabel, ownerName, state}'
```

**Expected:**
```json
{
  "seatLabel": "D1",
  "ownerName": "ChangedName",
  "state": "SOLD"
}
```

### Step 3: Verify Blockchain
```bash
curl http://localhost:3000/blockchain | jq '.data | map(select(.data.type == "TICKET_OWNER_CHANGED"))'
```

**Expected:** Should include owner change transaction with oldName and newName

### Verification
✅ Pass: Name changed in database and logged
❌ Fail: Name not updated or transaction missing

---

## Test 7: Seat Grid Display ✅

**Objective**: Verify seat grid shows correct states

### Get Seats
```bash
curl http://localhost:3000/concerts/$CONCERT_ID/seats | jq '.data | .[0:10]'
```

**Expected:**
```json
[
  {
    "row": "A",
    "number": 1,
    "label": "A1",
    "state": "SOLD",
    "ownerName": "User1"
  },
  {
    "row": "A",
    "number": 2,
    "label": "A2",
    "state": "AVAILABLE",
    "ownerName": null
  },
  ...
]
```

### Verification in Frontend
1. Open http://localhost:4200
2. Click on concert
3. Verify:
   - 🟢 Green for AVAILABLE
   - 🔴 Red for SOLD
   - 🟣 Purple for USED
   - ⚪ White for CANCELLED
   - ⚫ Black for EXPIRED

✅ Pass: Colors match states
❌ Fail: Colors don't match or seat data missing

---

## Test 8: Stress Test (10 Concurrent Purchases) ⚠️

**Objective**: Verify system handles multiple purchases without errors

### Execute
```bash
# Create test concert with 100 seats
CONCERT_ID=$(curl -s -X POST http://localhost:3000/concerts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Stress Test",
    "artist": "Test",
    "venue": "Test",
    "startTime": "2024-12-15T20:00:00Z",
    "endTime": "2024-12-15T23:00:00Z",
    "totalSeats": 100,
    "rows": 10,
    "seatsPerRow": 10
  }' | jq -r '.data._id')

# Send 10 concurrent requests
for i in {1..10}; do
  (curl -X POST http://localhost:3000/tickets/buy \
    -H "Content-Type: application/json" \
    -d "{
      \"concertId\": \"$CONCERT_ID\",
      \"seatLabel\": \"E$i\",
      \"ownerName\": \"User$i\"
    }" > /tmp/result_$i.json) &
done

wait

# Check results
echo "Results:"
for i in {1..10}; do
  cat /tmp/result_$i.json | jq '.success'
done
```

### Verification
✅ Pass: All 10 show `"success": true`
❌ Fail: Any show false or errors

---

## Test 9: Edge Cases ⚠️

### Invalid Concert ID
```bash
curl http://localhost:3000/concerts/invalid_id | jq '.error'
```

Expected: "Concert not found"

### Invalid Seat Label
```bash
curl -X POST http://localhost:3000/tickets/buy \
  -H "Content-Type: application/json" \
  -d "{
    \"concertId\": \"$CONCERT_ID\",
    \"seatLabel\": \"Z99\",
    \"ownerName\": \"Test\"
  }" | jq '.error'
```

Expected: Error (seat doesn't exist)

### Missing Required Fields
```bash
curl -X POST http://localhost:3000/tickets/buy \
  -H "Content-Type: application/json" \
  -d '{"concertId": "'$CONCERT_ID'"}'
```

Expected: "Missing required fields"

---

## Summary Checklist

- [ ] Test 1: Double Booking Prevention ✅
- [ ] Test 2: Real-Time Updates ✅
- [ ] Test 3: Ticket Validation ✅
- [ ] Test 4: Blockchain Integrity ✅
- [ ] Test 5: Ticket Cancellation ✅
- [ ] Test 6: Change Owner Name ✅
- [ ] Test 7: Seat Grid Display ✅
- [ ] Test 8: Stress Test ✅
- [ ] Test 9: Edge Cases ✅

**Result:** ✅ All tests pass = System is production-ready

---

## Troubleshooting Test Failures

### Test 1 Fails (Both Requests Succeed)
- Issue: Concurrency control not working
- Check: MongoDB transaction session usage
- Fix: Restart backend

### Test 2 Fails (No Real-time Update)
- Issue: WebSocket not connected
- Check: Browser DevTools → Console for socket errors
- Fix: Verify Socket.io port 3000 is accessible

### Test 3 Fails (Wrong Time Check)
- Issue: System time wrong
- Check: `date` command
- Fix: Sync system time

### Test 4 Fails (Chain Validation Fails)
- Issue: Blockchain tampering (shouldn't happen)
- Check: Application logs
- Fix: Restart backend (resets blockchain)

---

## Performance Metrics

### Ticket Purchase
- Expected: < 100ms
- Measurement: `time curl -X POST .../tickets/buy ...`

### Real-time Broadcast
- Expected: < 50ms from purchase to update
- Measurement: Check browser timestamps

### Blockchain Validation
- Expected: < 10ms for 1000 blocks
- Measurement: `curl /blockchain/validate` timing
