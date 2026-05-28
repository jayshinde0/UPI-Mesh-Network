# UPI Offline Mesh Network — Demo Guide

Use this script for a **project demo, viva, or presentation**. Each step includes **what to do** and **what it proves** in the system.

**Estimated time:** 15–20 minutes (full demo) · 8–10 minutes (short demo)

---

## Demo story (opening line)

> *"Alice is in a basement with no internet. She sends ₹500 to Bob using UPI. The payment is encrypted, hops across nearby phones like Bluetooth mesh, and when a bridge device gets signal, the bank settles the transaction."*

---

## Before the demo

| Check | URL / command |
|-------|----------------|
| Frontend running | http://localhost:3000 |
| Backend running | http://localhost:8080/api/actuator/health → `{"status":"UP"}` |
| PostgreSQL + Redis | See [setup.md](setup.md) |

**Demo accounts**

| Role | Username | Password | UPI ID | UPI PIN |
|------|----------|----------|--------|---------|
| Sender | `alice` | `Alice@123` | `![alt text](image.png)` | `1234` |
| Receiver | `bob` | `Bob@1234` | `bob@upimesh` | `1234` |
| Admin | `admin` | `Admin@123` | `admin@upimesh` | `1234` |

---

## Part 1 — Introduction (2 min)

### Step 1: Open the landing page

**Do:** Open http://localhost:3000/

**What it does:** Shows the project overview — offline UPI, mesh propagation, encryption, and settlement. This is the public entry point (no login required).

**Say:** *"This simulates offline UPI payments when there is no direct internet on the sender's phone."*

---

### Step 2: Briefly mention architecture (optional)

**Do:** Point to features on the landing page (Mesh, AES-256-GCM, Tamper detection, Idempotent settlement).

**What it does:** Sets expectations: React frontend → Spring Boot API → PostgreSQL + Redis, with WebSockets for live updates.

---

## Part 2 — Login & dashboard (3 min)

### Step 3: Sign in as Alice

**Do:**

1. Click **Sign In** → `/login`
2. Username: `alice` · Password: `Alice@123`
3. Click **Login**

**What it does:**

- Backend validates credentials (`AuthService`)
- Returns **JWT access + refresh tokens**
- Frontend stores tokens and loads Alice's profile (balance, UPI ID, role)

**Say:** *"Authentication uses JWT. The token is sent on every API call."*

---

### Step 4: Open the dashboard

**Do:** Go to **Dashboard** (`/dashboard`)

**What it does:**

- Fetches stats: balance, transactions, settled packets, mesh activity
- Shows charts and recent events
- WebSocket may show live updates if mesh is running

**Say:** *"Alice sees her balance and network activity before sending money."*

---

## Part 3 — Send payment (5 min) ⭐ Core demo

### Step 5: Start a payment

**Do:** Open **Payment** (`/payment`)

**What it does:** Opens the 3-step payment wizard: **Enter Details → Verify & Encrypt → Inject to Mesh**.

---

### Step 6: Enter payment details

**Do:**

| Field | Value |
|-------|--------|
| Receiver UPI ID | `bob@upimesh` |
| Amount | `500` |
| Note | `Demo payment` (optional) |

1. Click the **search** icon next to UPI ID
2. Confirm **Bob** appears with name and UPI ID
3. Click **Continue to Verify**

**What it does:**

- **Lookup:** Calls `/api/users/upi/{upiId}` to verify Bob exists
- Prevents sending to invalid UPI IDs
- Shows available balance so Alice cannot overdraw

**Say:** *"We resolve the receiver before sending, like real UPI."*

---

### Step 7: Verify and encrypt

**Do:**

1. Review summary (From → To → Amount)
2. Read the encryption steps shown on screen
3. Enter UPI PIN: **`1234`**
4. Click **Send & Inject**

**What it does (backend):**

1. Validates UPI PIN (BCrypt)
2. **EncryptionService** builds a mesh packet:
   - Random **AES-256** key encrypts payment JSON (AES-GCM)
   - **RSA-OAEP** wraps the AES key with server public key
   - **SHA-256** hash for tamper detection
3. Saves **MeshPacket** in PostgreSQL (status: injected / pending propagation)
4. Does **not** debit Bob yet — settlement happens after mesh + bridge

**Say:** *"Money is not settled yet. Only an encrypted packet is created — safe to carry offline through the mesh."*

---

### Step 8: Confirm packet injection

**Do:** On success screen, note **Packet Hash**, **TTL**, and **Status**. Click **View in Mesh**.

**What it does:**

- Shows the packet is ready for mesh simulation
- Packet hash is the unique idempotency key used later at settlement

**Say:** *"This packet can hop device-to-device without exposing the PIN or plain amount on the mesh."*

---

## Part 4 — Mesh propagation & settlement (5 min) ⭐ Core demo

### Step 9: Open Mesh Simulator

**Do:** Go to **Mesh Simulator** (`/mesh`)

**What it does:**

- Lists **mesh devices** (relay + bridge nodes)
- Lists **packets** and their status
- Shows **live propagation events** (WebSocket `/topic/propagation`)
- Provides controls to inject packets and manage the mesh network

**Say:** *"This simulates Bluetooth-style gossip — packets hop between nearby devices."*

---

### Step 10: Bring bridge nodes online

**Do:** Click **Flush Bridge Nodes**

**What it does:**

- Calls `/api/mesh/simulate/flush-bridges`
- Marks bridge devices as **online** with internet
- Without a bridge, packets cannot reach the server for settlement

**Say:** *"Bridge nodes are phones that finally get internet — like stepping out of the basement."*

---

### Step 11: Inject packet into the mesh

**Do:** Click **Inject Packet**

**What it does:**

- Calls `/api/mesh/simulate/inject/{packetId}`
- **MeshSimulatorService** starts gossip propagation:
  - Packet hops to random online devices
  - **TTL** decreases each hop (prevents infinite loops)
  - Events broadcast on WebSocket (`/topic/propagation`)
- When a **bridge** receives the packet, it triggers settlement

**Say:** *"Watch TTL drop and status change — that's hop-by-hop mesh routing."*

---

### Step 12: Watch live logs (optional but impressive)

**Do:** Open **Live Logs** (`/logs`) in another tab or after mesh step

**What it does:**

- Streams real-time events: new packets, hops, bridge contact, settlements, tamper alerts
- Powered by **STOMP over SockJS**

**Say:** *"Evaluators can see the same events the backend publishes — good for debugging and demos."*

---

### Step 13: Verify settlement

**Do:** Wait 10–30 seconds, then check:

1. **Mesh** — packet status → `SETTLED`
2. **Dashboard** — settled count increased
3. **Transactions** — ₹500 debit for Alice

**What it does (backend settlement):**

1. Bridge calls **SettlementService**
2. **Redis SETNX** on packet hash → prevents duplicate settlement
3. Decrypt AES key (RSA) → decrypt payload (AES-GCM)
4. Verify SHA-256 hash → reject if tampered
5. **Debit Alice, credit Bob** with optimistic locking on accounts
6. Log entry in settlement logs

**Say:** *"Settlement is idempotent — the same packet cannot pay twice even if two bridges try."*

---

### Step 14: Confirm Bob received money

**Do:**

1. **Logout**
2. Login as **bob** / `Bob@1234`
3. Open **Dashboard** or **Transactions**

**What it does:** Proves end-to-end flow — sender debited, receiver credited after mesh + bridge.

**Say:** *"Bob's balance updated only after secure settlement at the bridge, not when Alice tapped Send."*

---

## Part 5 — Extra features (5 min, optional)

### Step 15: Network topology

**Do:** Open **Topology** (`/mesh-topology`)

**What it does:** Interactive visualization and simulation of the mesh network with animated packet flow.

**Say:** *"Visual simulation of how packets propagate through the mesh network."*

---

### Step 16: Encryption lab

**Do:** Open **Encryption** (`/encryption`)

**What it does:** Demonstrates encrypt/decrypt API — AES-GCM + RSA-OAEP + hash verification (same as real payments).

**Say:** *"Same crypto pipeline as payments, exposed for teaching and testing."*

---

### Step 17: Tamper detection (failure demo)

**Do:**

1. Login as **alice** again
2. Send another small payment (e.g. ₹100 to `bob@upimesh`)
3. **Mesh** → **Inject Packet**
4. While status is **PROPAGATING**, click **Simulate Tampering**

**What it does:**

- Corrupts packet data in simulation
- Settlement fails hash check
- Alert on **Live Logs** (`/topic/tamper`)

**Say:** *"Tampered packets are rejected — integrity is enforced by SHA-256."*

---

### Step 18: Analytics

**Do:** Open **Analytics** (`/analytics`)

**What it does:** Charts for packet status, device types, settlement rate, top senders.

**Say:** *"Operational view of mesh health and payment volume."*

---

### Step 19: Admin panel

**Do:**

1. Logout → login as **admin** / `Admin@123`
2. Open **Admin** (`/admin`)

**What it does:**

- Lists all users, devices, settlements (ADMIN role only)
- Shows RBAC — normal users cannot access this route

**Say:** *"Role-based access control separates users from administrators."*

---

## Short demo checklist (8 min)

Use this if time is limited:

```
□ Landing page — explain scenario
□ Login as alice
□ Payment → bob@upimesh → ₹500 → PIN 1234 → Send & Inject
□ Mesh → Flush Bridge Nodes → Inject Packet
□ Transactions — show debit
□ Login as bob — show credit
```

---

## Troubleshooting during demo

| Problem | Quick fix |
|---------|-----------|
| Receiver not found | Use exact `bob@upimesh` + click search |
| Payment failed | PIN must be `1234`; amount ≤ balance |
| Inject Packet disabled | Complete payment first |
| Packet never settles | Click **Flush Bridge Nodes**, then **Inject Packet** |
| Blank frontend page | Restart `npm run dev`; see [setup.md](setup.md) |
| API errors | Ensure backend on port 8080 |

---

## What to highlight for evaluators

| Topic | Where to show |
|-------|----------------|
| Offline-first design | Payment + Mesh flow |
| Hybrid encryption | Payment step 2 + Encryption page |
| Gossip / TTL mesh | Mesh Simulator + Live Logs |
| Idempotent settlement | Explain Redis SETNX at settlement |
| Real-time system | Live Logs WebSocket |
| Security | JWT login, tamper demo, Admin RBAC |
| Full stack | Mention Spring Boot + React + PostgreSQL + Redis |

---

## API reference (if asked technical questions)

| Action | API |
|--------|-----|
| Login | `POST /api/auth/login` |
| Send payment | `POST /api/payments/send` |
| Inject packet | `POST /api/mesh/simulate/inject/{id}` |
| Flush bridges | `POST /api/mesh/simulate/flush-bridges` |
| Settle (automatic via sim) | `POST /api/bridge/settle/{id}` |
| Swagger UI | http://localhost:8080/api/swagger-ui.html |

---

## Related docs

- [setup.md](setup.md) — How to install and run the project
- [README.md](README.md) — Architecture and API overview
