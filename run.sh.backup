#!/usr/bin/env bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

promptyn() {
    while true; do
        read -p "$1 (y/n): " yn
        case $yn in
            [Yy]* ) return 0;;
            [Nn]* ) return 1;;
            * ) echo "Please answer yes or no.";;
        esac
    done
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 is not installed or not in PATH"
        return 1
    fi
    return 0
}

check_node_version() {
    local required_version="18"
    local node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    
    if [ "$node_version" -lt "$required_version" ]; then
        log_error "Node.js version $required_version or higher is required. Current version: $(node --version)"
        return 1
    fi
    
    log_success "Node.js version $(node --version) is compatible"
    return 0
}

setup_environment() {
    log_info "Setting up environment files..."
    
    if [ ! -f "backend/.env" ]; then
        if [ -f "backend/.env.example" ]; then
            cp backend/.env.example backend/.env
            log_success "Created backend/.env from example"
        else
            log_warning "backend/.env.example not found, creating basic .env"
            cat > backend/.env << EOF
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/atilio_db
JWT_SECRET=your-secret-key-change-this-in-production
CORS_ORIGIN=http://localhost:3000
EOF
        fi
    else
        log_info "backend/.env already exists"
    fi
    
    if [ ! -f "frontend/.env" ]; then
        if [ -f "frontend/.env.example" ]; then
            cp frontend/.env.example frontend/.env
            log_success "Created frontend/.env from example"
        else
            log_info "frontend/.env.example not found, will create when frontend is initialized"
        fi
    else
        log_info "frontend/.env already exists"
    fi
}

setup_backend() {
    log_info "Setting up backend..."
    
    if [ ! -d "backend/node_modules" ]; then
        cd backend
        log_info "Installing backend dependencies..."
        npm install
        cd ..
        log_success "Backend dependencies installed"
    else
        log_info "Backend dependencies already installed"
    fi
}

setup_frontend() {
    log_info "Setting up frontend..."
    
    if [ ! -d "frontend/node_modules" ] && [ -f "frontend/package.json" ]; then
        cd frontend
        log_info "Installing frontend dependencies..."
        npm install
        cd ..
        log_success "Frontend dependencies installed"
    elif [ ! -f "frontend/package.json" ]; then
        log_warning "Frontend not initialized yet"
        if promptyn "Would you like to initialize the frontend with React + Vite?"; then
            cd frontend
            npx create-vite@latest . --template react-ts
            npm install
            cd ..
            log_success "Frontend initialized with React + Vite + TypeScript"
        fi
    else
        log_info "Frontend dependencies already installed"
    fi
}

# Main script
clear
echo "======================================"
echo "  Atilio Project Setup & Runner"
echo "======================================"
echo ""

log_info "Starting environment validation..."

# Check prerequisites
log_info "Checking prerequisites..."

if ! check_command "node"; then
    log_error "Please install Node.js (version 18 or higher)"
    exit 1
fi

if ! check_command "npm"; then
    log_error "Please install npm"
    exit 1
fi

if ! check_command "docker"; then
    log_error "Please install Docker"
    exit 1
fi

if ! check_command "docker-compose" && ! docker compose version &> /dev/null; then
    log_error "Please install Docker Compose"
    exit 1
fi

# Check Node.js version
if ! check_node_version; then
    exit 1
fi

log_success "All prerequisites are installed"

# Setup environment
setup_environment

# Setup projects
setup_backend
setup_frontend

# Docker setup
log_info "Setting up Docker environment..."

if [ ! -f "docker-compose.yml" ]; then
    log_error "docker-compose.yml not found!"
    exit 1
fi

log_info "Building and starting services..."
echo ""

# Start database first
log_info "Starting database..."
docker-compose up -d db

# Wait for database to be ready
log_info "Waiting for database to be ready..."
timeout=60
counter=0
until docker-compose exec -T db pg_isready -U postgres &> /dev/null || [ $counter -eq $timeout ]; do
    counter=$((counter + 1))
    echo -n "."
    sleep 1
done

if [ $counter -eq $timeout ]; then
    log_error "Database failed to start within $timeout seconds"
    exit 1
fi

echo ""
log_success "Database is ready"

# Start backend
if promptyn "Start backend service?"; then
    log_info "Starting backend..."
    docker-compose up -d backend
    
    # Wait a moment for backend to start
    sleep 3
    
    # Check if backend is healthy
    log_info "Checking backend health..."
    if curl -f http://localhost:3001/api/v1/health &> /dev/null; then
        log_success "Backend is running and healthy"
    else
        log_warning "Backend may still be starting up"
    fi
fi

# Start frontend
if promptyn "Start frontend service?"; then
    log_info "Starting frontend..."
    docker-compose up -d frontend
    sleep 2
    log_success "Frontend service started"
fi

# Show running services
echo ""
log_info "Running services:"
docker-compose ps

# Show access URLs
echo ""
log_success "Application URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"
echo "  Health:   http://localhost:3001/api/v1/health"
echo "  Database: localhost:5432"
echo ""

# Option to view logs
if promptyn "View logs?"; then
    echo ""
    log_info "Showing logs (Press Ctrl+C to exit)..."
    docker-compose logs -f
fi

log_success "Setup complete!"
echo ""
echo "Useful commands:"
echo "  View logs:           docker-compose logs -f"
echo "  Stop services:       docker-compose down"
echo "  Restart services:    docker-compose restart"
echo "  View service status: docker-compose ps"