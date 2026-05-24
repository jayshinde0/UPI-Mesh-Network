# UPI Mesh — Setup & Run Guide

This guide covers two ways to run the project:

1. **Docker** — recommended; starts everything with one command
2. **Manual** — run PostgreSQL, Redis, backend, and frontend separately on your machine

---

## Prerequisites

### For Docker

| Tool | Version |
|------|---------|
| Docker Desktop | Latest |
| Docker Compose | v2+ (included with Docker Desktop) |

### For Manual Setup

| Tool | Version |
|------|---------|
| Java | 17+ |
| Maven | 3.9+ |
| Node.js | 20+ |
| PostgreSQL | 15 |
| Redis | 7 |

---

## Option 1: Run with Docker (Recommended)

From the project root:

```bash
docker compose up --build
```

To run in the background:

```bash
docker compose up --build -d
```

### Access URLs

| Service | URL |
|---------|--------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080/api |
| Swagger UI | http://localhost:8080/api/swagger-ui.html |

### Useful Docker Commands

```bash
# View logs
docker compose logs -f

# Stop all services
docker compose down

# Stop and remove volumes (fresh database)
docker compose down -v

# Rebuild a single service
docker compose up --build backend
```

### Port Conflicts

If Docker fails with **"port is already allocated"**, another process is using that port:

| Port | Service | Fix |
|------|---------|-----|
| 5432 | PostgreSQL | Stop local PostgreSQL, or change the port mapping in `docker-compose.yml` |
| 6379 | Redis | Stop local Redis, or change the port mapping in `docker-compose.yml` |
| 8080 | Backend | Stop whatever is using 8080 |
| 3000 | Frontend | Stop whatever is using 3000 |

---

## Option 2: Manual Setup

### Step 1 — PostgreSQL

Create the database:

```sql
CREATE DATABASE upi_mesh_db;
```

Default connection settings (from `backend/src/main/resources/application.yml`):

| Setting | Value |
|---------|-------|
| Host | `localhost` |
| Port | `5432` |
| Database | `upi_mesh_db` |
| Username | `postgres` |
| Password | `postgres` |

You can override credentials with environment variables:

```bash
set DB_USERNAME=postgres
set DB_PASSWORD=postgres
```

### Step 2 — Redis

Start Redis on the default port:

```bash
redis-server
```

Default settings:

| Setting | Value |
|---------|-------|
| Host | `localhost` |
| Port | `6379` |

Override with environment variables if needed:

```bash
set REDIS_HOST=localhost
set REDIS_PORT=6379
```

### Step 3 — Backend

```bash
cd backend
mvn spring-boot:run
```

The API starts at:

- **API:** http://localhost:8080/api
- **Swagger:** http://localhost:8080/api/swagger-ui.html

On first startup, demo users and mesh devices are seeded automatically.

### Step 4 — Frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The app starts at:

- **Frontend:** http://localhost:3000

If port 3000 is busy, Vite will pick the next available port (e.g. 3001).

The Vite dev server proxies `/api` requests to `http://localhost:8080`, so the backend must be running first.

---

## Hybrid approach: Docker for DB + Manual for App

Useful when you want hot-reload on the frontend/backend but don't want to install PostgreSQL/Redis locally.

**Terminal 1 — start only database services:**

```bash
docker compose up postgres redis -d
```

**Terminal 2 — backend:**

```bash
cd backend
mvn spring-boot:run
```

**Terminal 3 — frontend:**

```bash
cd frontend
npm install
npm run dev
```

---

## Demo Accounts

| Username | Password | Role | UPI ID |
|----------|----------|------|--------|
| alice | Alice@123 | User | alice@upimesh |
| bob | Bob@1234 | User | bob@upimesh |
| charlie | Charlie@1 | User | charlie@upimesh |
| diana | Diana@123 | User | diana@upimesh |
| admin | Admin@123 | Admin | admin@upimesh |

**UPI PIN for all accounts:** `1234`

---

## Verify Everything Is Running

**Backend health check:**

```bash
curl http://localhost:8080/api/actuator/health
```

Expected response:

```json
{"status":"UP"}
```

**Login test:**

```bash
curl -X POST http://localhost:8080/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"alice\",\"password\":\"Alice@123\"}"
```

---

## Troubleshooting

### Redis container fails — `port 6379 is already allocated`

You already have Redis running locally (or another Docker container named `redis`). **This is fine** — skip the Docker Redis container and use your existing Redis on `localhost:6379`.

```bash
# Start only Postgres
docker compose up postgres -d
```

### Backend fails — `Port 8080 was already in use`

Another process is already using port 8080 (often the Docker backend from an earlier run). **Pick one backend — do not run both:**

**Option A — Use the Docker backend (recommended for hybrid setup):**

```bash
docker compose up postgres backend -d
# Do NOT run mvn spring-boot:run
```

**Option B — Run backend manually:**

```bash
docker stop upi-mesh-backend
cd backend
mvn spring-boot:run
```

Check what is using port 8080:

```powershell
netstat -ano | findstr :8080
```

### Frontend shows a blank white page

Usually caused by a `global is not defined` error from `sockjs-client`. This is fixed in `frontend/vite.config.js`. Restart the dev server after any config change:

```bash
cd frontend
npm run dev
```

Open the URL Vite prints (e.g. `http://localhost:3000`). If ports 3000–3001 are busy, it may use 3002+.

### Multiple Vite instances / wrong port

Stop old dev servers so Vite can use port 3000:

```powershell
netstat -ano | findstr :3000
taskkill /PID <pid> /F
```

### Backend won't start — database connection refused

- Ensure PostgreSQL is running
- Confirm `upi_mesh_db` exists
- Check username/password match `application.yml`

### Backend won't start — Redis connection refused

- Ensure Redis is running on port 6379
- Test with: `redis-cli ping` (should return `PONG`)

### Frontend shows network errors

- Confirm the backend is running on port 8080
- For manual setup, the Vite proxy in `frontend/vite.config.js` forwards `/api` to the backend

### `npm install` fails

- Use Node.js 20+
- Run `npm install` from the `frontend/` directory

### `mvn` not found

- Install Maven 3.9+ and add it to your PATH
- Or use Docker for the backend: `docker compose up postgres redis backend -d`

### Docker build is slow

- First build downloads dependencies and can take several minutes
- Later runs are much faster due to Docker layer caching

---

## Project Structure

```
UPI Mesh/
├── backend/          # Spring Boot API (Java 17)
├── frontend/         # React + Vite UI
├── docker-compose.yml
├── setup.md          # This file
└── README.md         # Project overview
```
