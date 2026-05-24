# UPI Offline Mesh Network

> A production-quality simulation of offline UPI payments via Bluetooth-style mesh propagation with AES-256-GCM + RSA-OAEP hybrid encryption.

![Tech Stack](https://img.shields.io/badge/Spring_Boot-3.2-green) ![React](https://img.shields.io/badge/React-18-blue) ![Java](https://img.shields.io/badge/Java-17-orange) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue) ![Redis](https://img.shields.io/badge/Redis-7-red)

---

## The Scenario

A user in a basement without internet sends ₹500 to another user. The encrypted payment packet travels through nearby devices using simulated Bluetooth-style mesh propagation. Eventually, a bridge node reaches internet connectivity and uploads the packet to the backend where it gets settled.

---

## Architecture

```
Frontend (React + Vite)
    │
    ├── Zustand Store (auth, mesh state)
    ├── Axios API Layer (/api/*)
    └── WebSocket (STOMP over SockJS)
            │
            ▼
Backend (Spring Boot 3)
    │
    ├── REST Controllers (/auth, /payments, /mesh, /bridge, /analytics, /admin)
    ├── WebSocket (STOMP broker)
    ├── Service Layer
    │   ├── AuthService (JWT + refresh tokens)
    │   ├── PaymentService (packet creation)
    │   ├── EncryptionService (AES-256-GCM + RSA-OAEP)
    │   ├── MeshSimulatorService (gossip protocol)
    │   └── SettlementService (idempotent, optimistic locking)
    ├── Repository Layer (Spring Data JPA)
    │
    ├── PostgreSQL (entities, transactions, packets)
    └── Redis (idempotency keys, SETNX)
```

---

## Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Backend    | Spring Boot 3.2, Java 17, Spring Security       |
| Database   | PostgreSQL 15, Spring Data JPA, Hibernate       |
| Cache      | Redis 7 (idempotency, rate limiting)            |
| Auth       | JWT (access + refresh tokens), BCrypt           |
| Encryption | AES-256-GCM + RSA-OAEP + SHA-256               |
| WebSocket  | STOMP over SockJS                               |
| Frontend   | React 18, Vite, Tailwind CSS, Framer Motion     |
| Charts     | Recharts                                        |
| State      | Zustand                                         |
| Container  | Docker, Docker Compose                          |
| API Docs   | Springdoc OpenAPI / Swagger UI                  |

---

## Quick Start

### Prerequisites
- Java 17+
- Node.js 20+
- PostgreSQL 15
- Redis 7
- Maven 3.9+

### 1. Database Setup
```sql
CREATE DATABASE upi_mesh_db;
```

### 2. Backend
```bash
cd backend
mvn spring-boot:run
# API available at http://localhost:8080/api
# Swagger UI at http://localhost:8080/api/swagger-ui.html
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
# App available at http://localhost:3000
```

### Docker (All-in-one)
```bash
docker-compose up --build
# Frontend: http://localhost:3000
# Backend:  http://localhost:8080/api
# Swagger:  http://localhost:8080/api/swagger-ui.html
```

---

## Demo Accounts

| Username | Password    | Role  | UPI ID            |
|----------|-------------|-------|-------------------|
| alice    | Alice@123   | User  | alice@upimesh     |
| bob      | Bob@1234    | User  | bob@upimesh       |
| charlie  | Charlie@1   | User  | charlie@upimesh   |
| diana    | Diana@123   | User  | diana@upimesh     |
| admin    | Admin@123   | Admin | admin@upimesh     |

**UPI PIN for all accounts: `1234`**  
**Starting balance: ₹10,000 – ₹1,00,000 (random)**

---

## API Documentation

### Auth
| Method | Endpoint           | Description          |
|--------|--------------------|----------------------|
| POST   | /auth/register     | Register new user    |
| POST   | /auth/login        | Login, get JWT       |
| POST   | /auth/refresh      | Refresh access token |

### Payments
| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| POST   | /payments/send            | Send payment via mesh    |
| GET    | /payments/transactions    | Get transaction history  |
| GET    | /payments/balance         | Get current balance      |

### Mesh
| Method | Endpoint                          | Description              |
|--------|-----------------------------------|--------------------------|
| GET    | /mesh/devices                     | All mesh devices         |
| POST   | /mesh/simulate/inject/{id}        | Inject packet into mesh  |
| POST   | /mesh/simulate/tamper/{id}        | Simulate tampering       |
| POST   | /mesh/simulate/reset              | Reset simulation         |
| POST   | /mesh/simulate/flush-bridges      | Bring all bridges online |

### Bridge
| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| POST   | /bridge/settle/{id}   | Settle packet at bridge  |
| GET    | /bridge/logs          | Settlement logs          |

### Analytics
| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| GET    | /analytics/dashboard  | Dashboard stats          |
| GET    | /analytics/network    | Network analytics        |
| GET    | /analytics/top-senders| Top senders              |

---

## Encryption Flow

```
Payment JSON
    │
    ▼
Generate random AES-256 key + 12-byte IV
    │
    ▼
AES-256-GCM encrypt(payload, key, IV) → ciphertext
    │
    ▼
RSA-OAEP encrypt(AES key, server public key) → encryptedKey
    │
    ▼
SHA-256 hash(ciphertext + IV) → packetHash
    │
    ▼
MeshPacket { encryptedPayload, encryptedAesKey, iv, packetHash }
    │
    ▼
Gossip propagation through mesh nodes (TTL decrement)
    │
    ▼
Bridge node receives → POST /bridge/settle
    │
    ▼
Redis SETNX(packetHash) → idempotency check
    │
    ▼
RSA decrypt(encryptedKey) → AES key
AES-GCM decrypt(ciphertext, key, IV) → payload
Verify SHA-256 hash → tamper detection
    │
    ▼
Optimistic lock debit sender, credit receiver
```

---

## WebSocket Topics

| Topic                  | Description                    |
|------------------------|--------------------------------|
| /topic/packets         | New packet events              |
| /topic/propagation     | Hop-by-hop propagation events  |
| /topic/settlements     | Settlement results             |
| /topic/bridge          | Bridge node events             |
| /topic/tamper          | Tamper detection alerts        |
| /topic/mesh-reset      | Mesh reset events              |

---

## Pages

| Route        | Description                          |
|--------------|--------------------------------------|
| /            | Landing page with mesh animation     |
| /login       | JWT login                            |
| /register    | User registration                    |
| /dashboard   | Live stats, charts, balance          |
| /payment     | Send payment (3-step wizard)         |
| /transactions| Transaction history with filters     |
| /mesh        | Mesh simulator with controls         |
| /topology    | Live SVG network topology            |
| /encryption  | Encryption lab / visualization       |
| /analytics   | Charts: pie, radar, bar              |
| /logs        | Real-time WebSocket event stream     |
| /admin       | Admin panel (ADMIN role only)        |

---

## Security Features

- JWT access tokens (24h) + refresh tokens (7d)
- BCrypt password hashing (strength 12)
- AES-256-GCM payload encryption
- RSA-2048-OAEP key wrapping
- SHA-256 packet integrity hashing
- Redis SETNX idempotency (prevents duplicate settlements)
- Optimistic locking on account balances
- Role-based access control (USER / ADMIN)
- Global exception handling
- Input validation (Jakarta Validation)

---

## Project Structure

```
UPI Mesh/
├── backend/
│   ├── src/main/java/com/upi/mesh/
│   │   ├── config/          # Security, Redis, WebSocket, OpenAPI, DataSeeder
│   │   ├── controller/      # Auth, Payment, Mesh, Bridge, Analytics, Admin, Encryption
│   │   ├── dto/             # Request/Response DTOs
│   │   ├── entity/          # JPA entities
│   │   ├── exception/       # Global exception handler
│   │   ├── repository/      # Spring Data JPA repositories
│   │   ├── security/        # JWT filter, UserDetailsService
│   │   └── service/         # Business logic services
│   └── src/main/resources/
│       └── application.yml
├── frontend/
│   └── src/
│       ├── components/      # UI components, layout, effects
│       ├── hooks/           # useToast
│       ├── lib/             # api.js, websocket.js, utils.js
│       ├── pages/           # All 11 pages
│       └── store/           # Zustand stores
├── docker-compose.yml
└── README.md
```

---

## License

MIT — Educational / Portfolio use
