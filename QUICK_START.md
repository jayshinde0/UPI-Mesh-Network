# UPI Mesh - Quick Start Guide

## 🚀 Application Status: RUNNING ✅

Your UPI Mesh application is now successfully running with all services up!

## 📍 Access URLs

### Frontend (React Application)
- **URL**: http://localhost:3000
- **Description**: Main UPI Mesh web interface with live mesh topology visualization

### Backend API (Spring Boot)
- **URL**: http://localhost:8080/api
- **Description**: REST API and WebSocket endpoints
- **Swagger UI**: http://localhost:8080/api/swagger-ui/index.html

### Database Services
- **PostgreSQL**: localhost:5432
  - Database: `upi_mesh_db`
  - Username: `postgres`
  - Password: `postgres`
- **Redis**: localhost:6379

## 🎯 New Features Available

### Live Mesh Topology Visualization
Navigate to **"Live Mesh Viz"** in the sidebar to access:

1. **D3.js Force Layout** - Physics-based network visualization
2. **React Flow Interactive** - Drag-and-drop network diagrams  
3. **Interactive Demo** - Animated mesh network tutorial

### Key Features
- ✨ Real-time device status monitoring
- 📡 Live packet propagation animation
- 🔗 Dynamic connection visualization
- 📊 Trust score indicators
- 🎛️ Interactive controls and analytics

## 🔧 Docker Services Status

```bash
# Check service status
docker compose ps

# View logs
docker compose logs -f

# Stop services
docker compose down

# Restart services
docker compose up -d
```

## 🎮 Getting Started

1. **Open the application**: http://localhost:3000
2. **Register/Login** with a new account
3. **Navigate to "Live Mesh Viz"** to see the new topology visualization
4. **Explore the mesh simulator** to see packet propagation in action
5. **Try the interactive demo** to learn mesh networking concepts

## 🛠️ Development Commands

### Frontend Development
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend Development
```bash
cd backend
mvn spring-boot:run  # Start development server
mvn clean package    # Build JAR file
mvn test            # Run tests
```

## 📊 Default Test Data

The application comes pre-seeded with:
- Sample user accounts
- Mock mesh devices
- Test transactions
- Bridge node configurations

## 🔍 Troubleshooting

### Common Issues
1. **Port conflicts**: Ensure ports 3000, 8080, 5432, 6379 are available
2. **Docker not running**: Start Docker Desktop before running compose
3. **Build failures**: Clear Docker cache with `docker system prune`

### Logs and Debugging
```bash
# View all logs
docker compose logs

# View specific service logs
docker compose logs backend
docker compose logs frontend
docker compose logs postgres
docker compose logs redis

# Follow logs in real-time
docker compose logs -f backend
```

## 🌟 What's New in This Version

### Live Mesh Topology Visualization
- **Interactive Network Graphs**: Real-time visualization of mesh network topology
- **Packet Animation**: Watch packets travel through the mesh network
- **Trust Scores**: Visual indicators of device trustworthiness
- **Bridge Node Highlighting**: Special visualization for bridge nodes
- **Connection Strength**: Visual representation of signal strength
- **Real-time Updates**: Live synchronization with backend events

### Enhanced UI/UX
- **Cyber-themed Design**: Modern dark theme with neon accents
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Smooth Animations**: Framer Motion powered transitions
- **Interactive Controls**: Play/pause, zoom, pan, and selection tools

### Technical Improvements
- **WebSocket Integration**: Real-time data streaming
- **Performance Optimization**: Efficient rendering for large networks
- **Modular Architecture**: Clean, maintainable component structure
- **TypeScript Support**: Enhanced type safety and development experience

---

## 🎉 Enjoy exploring your UPI Mesh network!

The application is now ready for use. Navigate to http://localhost:3000 and start exploring the live mesh topology visualization!