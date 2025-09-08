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
    local required_version="22"
    local node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    
    if [ "$node_version" -lt "$required_version" ]; then
        log_error "Node.js version $required_version or higher is required. Current version: $(node --version)"
        log_error "This project requires Node.js 22+ for Vite compatibility"
        return 1
    fi
    
    log_success "Node.js version $(node --version) is compatible"
    return 0
}

setup_environment() {
    log_info "Setting up environment files..."
    
    # Always check and create/update .env files
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
        log_success "backend/.env exists and ready"
    fi
    
    if [ ! -f "frontend/.env" ]; then
        if [ -f "frontend/.env.example" ]; then
            cp frontend/.env.example frontend/.env
            log_success "Created frontend/.env from example"
        else
            log_info "frontend/.env not needed for current setup"
        fi
    else
        log_success "frontend/.env exists and ready"
    fi
}

setup_backend() {
    log_info "Checking backend setup..."
    
    if [ ! -d "backend/node_modules" ] || [ ! -f "backend/package-lock.json" ]; then
        cd backend
        log_info "Installing/updating backend dependencies..."
        npm ci 2>/dev/null || npm install
        cd ..
        log_success "Backend dependencies ready"
    else
        log_success "Backend dependencies are up to date"
    fi
}

setup_frontend() {
    log_info "Checking frontend setup..."
    
    if [ -f "frontend/package.json" ]; then
        if [ ! -d "frontend/node_modules" ] || [ ! -f "frontend/package-lock.json" ]; then
            cd frontend
            log_info "Installing/updating frontend dependencies..."
            npm ci 2>/dev/null || npm install
            cd ..
            log_success "Frontend dependencies ready"
        else
            log_success "Frontend dependencies are up to date"
        fi
    else
        log_warning "Frontend package.json not found - frontend may not be initialized"
    fi
}

print_banner() {
    echo ""
    echo "==============================================================="
    echo "                    ATILIO PROJECT SETUP & RUNNER"
    echo "==============================================================="
    if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
        echo ""
        echo "Usage: ./run.sh [--rebuild]"
        echo ""
        echo "Options:"
        echo "  --rebuild   Force rebuild of Docker images"
        echo "  --help, -h  Show this help message"
        echo ""
        exit 0
    fi
    echo ""
}

print_section() {
    echo ""
    echo "+-------------------------------------------------------------+"
    echo "| $1"
    echo "+-------------------------------------------------------------+"
    echo ""
}

# Main script
clear
print_banner "$1"
print_section "STEP 1: ENVIRONMENT VALIDATION"

log_info "Checking system requirements..."

# Check prerequisites
log_info "Checking prerequisites..."

if ! check_command "node"; then
    log_error "Please install Node.js (version 22 or higher)"
    log_error "Visit: https://nodejs.org/"
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

print_section "STEP 2: ENVIRONMENT SETUP"
setup_environment

print_section "STEP 3: PROJECT DEPENDENCIES"
setup_backend
setup_frontend

print_section "STEP 4: DOCKER ENVIRONMENT SETUP"

if [ ! -f "docker-compose.yml" ]; then
    log_error "docker-compose.yml not found!"
    exit 1
fi

log_success "docker-compose.yml found"

# Smart Docker rebuild - only if needed
if [ "$1" = "--rebuild" ] || ! docker images | grep -q "atilio-test"; then
    log_info "Building/rebuilding Docker images..."
    docker-compose down --remove-orphans --volumes 2>/dev/null || true
    docker-compose build --no-cache --force-rm
    log_success "Docker images built successfully"
else
    log_info "Using existing Docker images (use --rebuild flag to force rebuild)"
    docker-compose down 2>/dev/null || true
fi

print_section "STEP 5: STARTING SERVICES"

log_info "Starting database service..."
docker-compose up -d db

log_info "Waiting for database to be ready..."
timeout=60
counter=0
echo -n "Checking database connectivity"
until docker-compose exec -T db pg_isready -U postgres &> /dev/null || [ $counter -eq $timeout ]; do
    counter=$((counter + 1))
    echo -n "."
    sleep 1
done

if [ $counter -eq $timeout ]; then
    echo ""
    log_error "Database failed to start within $timeout seconds"
    log_error "Please check Docker logs: docker-compose logs db"
    exit 1
fi

echo ""
log_success "Database is ready and accepting connections"

log_info "Starting backend service..."
docker-compose up -d backend

log_info "Waiting for backend to be ready..."
echo -n "Checking backend health"
for i in {1..15}; do
    sleep 2
    if curl -f http://localhost:3001/api/v1/health &> /dev/null; then
        echo ""
        log_success "Backend is running and healthy"
        break
    fi
    echo -n "."
    if [ $i -eq 15 ]; then
        echo ""
        log_warning "Backend health check timeout - service may still be starting"
        log_warning "Check logs with: docker-compose logs backend"
    fi
done

log_info "Starting frontend service..."
docker-compose up -d frontend
log_success "Frontend service started"

log_info "All services are now running!"

print_section "STEP 6: SERVICE STATUS & ACCESS INFORMATION"

log_info "Running services:"
docker-compose ps

echo ""
echo "APPLICATION ACCESS URLS"
echo "-------------------------------------------------------------"
echo "  Frontend:     http://localhost:3000"
echo "  Backend API:  http://localhost:3001"
echo "  Health Check: http://localhost:3001/api/v1/health"
echo "  API Docs:     http://localhost:3001/api/v1/docs"
echo "  Database:     localhost:5432 (user: postgres)"
echo "-------------------------------------------------------------"
echo ""

print_section "SETUP COMPLETE!"

log_success "All services are running successfully!"
echo ""
echo "USEFUL COMMANDS"
echo "-------------------------------------------------------------"
echo "  View logs:           docker-compose logs -f [service]"
echo "  Stop services:       docker-compose down"
echo "  Restart services:    docker-compose restart [service]"
echo "  Service status:      docker-compose ps"
echo "  Backend logs only:   docker-compose logs -f backend"
echo "  Frontend logs only:  docker-compose logs -f frontend"
echo "  Rebuild everything:  ./run.sh (run this script again)"
echo "-------------------------------------------------------------"
echo ""

# Always show current service status
log_info "Current service status:"
docker-compose ps
echo ""

log_info "Setup complete! Use 'docker-compose logs -f' to view live logs"