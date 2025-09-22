#!/bin/bash

# FinanceFlow Pro Docker Management Scripts

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Development environment
dev_start() {
    print_status "Starting FinanceFlow Pro in development mode..."
    check_docker
    
    # Copy environment file if it doesn't exist
    if [ ! -f "docker/.env" ]; then
        print_warning "Creating docker/.env from example..."
        cp docker/.env.example docker/.env
        print_warning "Please update docker/.env with your configuration"
    fi
    
    docker-compose --env-file docker/.env up --build -d
    print_success "Development environment started!"
    print_status "Frontend: http://localhost:3000"
    print_status "Backend: http://localhost:5000"
    print_status "MongoDB: localhost:27017"
    print_status "Redis: localhost:6379"
}

# Production environment
prod_start() {
    print_status "Starting FinanceFlow Pro in production mode..."
    check_docker
    
    # Check if production env file exists
    if [ ! -f "docker/.env" ]; then
        print_error "docker/.env file not found. Please create it from docker/.env.example"
        exit 1
    fi
    
    docker-compose -f docker-compose.prod.yml --env-file docker/.env up --build -d
    print_success "Production environment started!"
    print_status "Application: http://localhost:5000"
    print_status "Nginx: http://localhost:80"
}

# Stop all services
stop_all() {
    print_status "Stopping all FinanceFlow Pro services..."
    docker-compose down
    docker-compose -f docker-compose.prod.yml down
    print_success "All services stopped"
}

# Clean up everything
cleanup() {
    print_status "Cleaning up FinanceFlow Pro containers and volumes..."
    docker-compose down -v --remove-orphans
    docker-compose -f docker-compose.prod.yml down -v --remove-orphans
    docker system prune -f
    print_success "Cleanup completed"
}

# View logs
logs() {
    local service=${1:-}
    if [ -z "$service" ]; then
        print_status "Showing logs for all services..."
        docker-compose logs -f
    else
        print_status "Showing logs for $service..."
        docker-compose logs -f "$service"
    fi
}

# Database backup
backup_db() {
    local backup_name="financeflow-backup-$(date +%Y%m%d_%H%M%S)"
    print_status "Creating database backup: $backup_name"
    
    docker exec financeflow-mongodb mongodump --db financeflow-pro --out /tmp/$backup_name
    docker cp financeflow-mongodb:/tmp/$backup_name ./backups/
    
    print_success "Database backup created: ./backups/$backup_name"
}

# Database restore
restore_db() {
    local backup_path=${1:-}
    if [ -z "$backup_path" ]; then
        print_error "Please provide backup path: ./docker-scripts.sh restore <backup-path>"
        exit 1
    fi
    
    print_status "Restoring database from: $backup_path"
    docker cp "$backup_path" financeflow-mongodb:/tmp/restore
    docker exec financeflow-mongodb mongorestore --db financeflow-pro --drop /tmp/restore/financeflow-pro
    
    print_success "Database restored successfully"
}

# Health check
health_check() {
    print_status "Checking FinanceFlow Pro health..."
    
    # Check backend health
    if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
        print_success "Backend is healthy"
    else
        print_error "Backend is not responding"
    fi
    
    # Check frontend (development)
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        print_success "Frontend is healthy"
    else
        print_warning "Frontend is not responding (may be in production mode)"
    fi
    
    # Check database
    if docker exec financeflow-mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        print_success "Database is healthy"
    else
        print_error "Database is not responding"
    fi
}

# Show help
show_help() {
    echo "FinanceFlow Pro Docker Management Script"
    echo ""
    echo "Usage: ./docker-scripts.sh [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  dev-start     Start development environment"
    echo "  prod-start    Start production environment"
    echo "  stop          Stop all services"
    echo "  cleanup       Stop and remove all containers, volumes"
    echo "  logs [service] Show logs for all services or specific service"
    echo "  backup        Create database backup"
    echo "  restore <path> Restore database from backup"
    echo "  health        Check application health"
    echo "  help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./docker-scripts.sh dev-start"
    echo "  ./docker-scripts.sh logs backend"
    echo "  ./docker-scripts.sh backup"
    echo "  ./docker-scripts.sh restore ./backups/backup-folder"
}

# Main script logic
case "${1:-}" in
    "dev-start"|"dev")
        dev_start
        ;;
    "prod-start"|"prod")
        prod_start
        ;;
    "stop")
        stop_all
        ;;
    "cleanup"|"clean")
        cleanup
        ;;
    "logs")
        logs "${2:-}"
        ;;
    "backup")
        backup_db
        ;;
    "restore")
        restore_db "${2:-}"
        ;;
    "health"|"status")
        health_check
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        print_error "Unknown command: ${1:-}"
        echo ""
        show_help
        exit 1
        ;;
esac
