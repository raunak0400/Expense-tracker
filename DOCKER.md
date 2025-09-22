# 🐳 FinanceFlow Pro - Docker Containerization Guide

## 📋 Overview

FinanceFlow Pro is now fully containerized with Docker, supporting both development and production environments. This setup includes:

- **Multi-stage Docker builds** for optimized production images
- **Docker Compose** for orchestrating multiple services
- **MongoDB** database with initialization scripts
- **Redis** for caching and sessions
- **Nginx** reverse proxy for production
- **Health checks** and monitoring
- **Automated backup/restore** scripts

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed and running
- Git (for cloning the repository)
- 4GB+ RAM available for containers

### 1. Clone and Setup
```bash
git clone https://github.com/raunak0400/Expense-tracker.git
cd Expense-tracker
```

### 2. Configure Environment
```bash
# Copy environment template
cp docker/.env.example docker/.env

# Edit the environment file with your settings
# Windows: notepad docker/.env
# Mac/Linux: nano docker/.env
```

### 3. Start Development Environment
```bash
# Windows
docker-scripts.bat dev-start

# Mac/Linux
chmod +x docker-scripts.sh
./docker-scripts.sh dev-start
```

### 4. Access Your Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React)       │    │   (Node.js)     │    │   (MongoDB)     │
│   Port: 3000    │◄──►│   Port: 5000    │◄──►│   Port: 27017   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │     Redis       │
                    │   (Caching)     │
                    │   Port: 6379    │
                    └─────────────────┘
```

## 🛠️ Available Commands

### Windows (docker-scripts.bat)
```cmd
docker-scripts.bat dev-start     # Start development environment
docker-scripts.bat prod-start    # Start production environment
docker-scripts.bat stop          # Stop all services
docker-scripts.bat cleanup       # Clean up containers and volumes
docker-scripts.bat logs          # View all logs
docker-scripts.bat logs backend  # View specific service logs
docker-scripts.bat backup        # Backup database
docker-scripts.bat health        # Check application health
docker-scripts.bat help          # Show help
```

### Mac/Linux (docker-scripts.sh)
```bash
./docker-scripts.sh dev-start     # Start development environment
./docker-scripts.sh prod-start    # Start production environment
./docker-scripts.sh stop          # Stop all services
./docker-scripts.sh cleanup       # Clean up containers and volumes
./docker-scripts.sh logs          # View all logs
./docker-scripts.sh logs backend  # View specific service logs
./docker-scripts.sh backup        # Backup database
./docker-scripts.sh health        # Check application health
./docker-scripts.sh help          # Show help
```

## 🔧 Environment Configuration

### Required Environment Variables (docker/.env)
```env
# Database Configuration
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your-secure-password
MONGO_DATABASE=financeflow-pro

# Application Security
JWT_SECRET=your-super-secret-jwt-key-make-it-very-long-and-random
JWT_EXPIRE=7d

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

# Redis
REDIS_PASSWORD=your-redis-password
```

## 🏭 Production Deployment

### 1. Production Environment
```bash
# Start production stack
docker-scripts.bat prod-start  # Windows
./docker-scripts.sh prod-start # Mac/Linux
```

### 2. Production Features
- **Nginx reverse proxy** with SSL support
- **Multi-stage builds** for smaller images
- **Health checks** for all services
- **Security hardening** with non-root users
- **Logging and monitoring** ready
- **Automatic restarts** on failure

### 3. Production URLs
- **Application**: http://localhost:5000
- **Nginx Proxy**: http://localhost:80
- **Health Check**: http://localhost:5000/api/health

## 📊 Monitoring & Health Checks

### Built-in Health Checks
```bash
# Check application health
docker-scripts.bat health

# View container status
docker ps

# View logs
docker-scripts.bat logs
docker-scripts.bat logs backend
docker-scripts.bat logs frontend
```

### Health Endpoints
- **Backend**: `GET /api/health`
- **Database**: Automatic MongoDB ping
- **Redis**: Automatic Redis ping

## 💾 Database Management

### Backup Database
```bash
# Create backup
docker-scripts.bat backup

# Backups are stored in ./backups/ directory
```

### Restore Database
```bash
# Restore from backup
docker-scripts.bat restore ./backups/backup-folder-name
```

### Direct Database Access
```bash
# Connect to MongoDB
docker exec -it financeflow-mongodb mongosh

# Connect to Redis
docker exec -it financeflow-redis redis-cli
```

## 🔒 Security Features

### Container Security
- **Non-root users** in all containers
- **Read-only filesystems** where possible
- **Security headers** via Nginx
- **Network isolation** between services
- **Secrets management** via environment variables

### Network Security
- **Internal Docker networks** for service communication
- **Rate limiting** via Nginx
- **CORS protection** configured
- **SSL/TLS ready** for production

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Stop conflicting services
   docker-scripts.bat stop
   # Or change ports in docker-compose.yml
   ```

2. **Database Connection Failed**
   ```bash
   # Check MongoDB container
   docker logs financeflow-mongodb
   # Verify environment variables in docker/.env
   ```

3. **Frontend Not Loading**
   ```bash
   # Check frontend container
   docker logs financeflow-frontend
   # Verify REACT_APP_API_URL in environment
   ```

4. **Permission Denied (Linux/Mac)**
   ```bash
   # Make scripts executable
   chmod +x docker-scripts.sh
   ```

### Debug Commands
```bash
# View all containers
docker ps -a

# View container logs
docker logs <container-name>

# Execute commands in container
docker exec -it <container-name> /bin/sh

# View Docker networks
docker network ls

# View Docker volumes
docker volume ls
```

## 📈 Performance Optimization

### Production Optimizations
- **Multi-stage builds** reduce image size by 60%
- **Alpine Linux** base images for minimal footprint
- **Nginx caching** for static assets
- **Gzip compression** enabled
- **Connection pooling** for database
- **Redis caching** for sessions

### Resource Limits
```yaml
# Add to docker-compose.yml for resource limits
deploy:
  resources:
    limits:
      cpus: '0.5'
      memory: 512M
    reservations:
      cpus: '0.25'
      memory: 256M
```

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Deploy FinanceFlow Pro
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build and Deploy
        run: |
          docker build -t financeflow-pro .
          docker run -d -p 5000:5000 financeflow-pro
```

## 📚 Additional Resources

- **Docker Documentation**: https://docs.docker.com/
- **Docker Compose**: https://docs.docker.com/compose/
- **MongoDB Docker**: https://hub.docker.com/_/mongo
- **Redis Docker**: https://hub.docker.com/_/redis
- **Nginx Docker**: https://hub.docker.com/_/nginx

---

🎉 **Your FinanceFlow Pro is now fully containerized and ready for any environment!**

For support or questions, check the logs first:
```bash
docker-scripts.bat logs  # View all logs
docker-scripts.bat health # Check system health
```
