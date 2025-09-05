@echo off
setlocal enabledelayedexpansion

REM Colors for output (Windows 10+ with ANSI support)
set RED=[31m
set GREEN=[32m
set YELLOW=[33m
set BLUE=[34m
set NC=[0m

REM Functions using goto labels
goto :main

:log_info
    echo %BLUE%[INFO]%NC% %~1
    goto :eof

:log_success
    echo %GREEN%[SUCCESS]%NC% %~1
    goto :eof

:log_warning
    echo %YELLOW%[WARNING]%NC% %~1
    goto :eof

:log_error
    echo %RED%[ERROR]%NC% %~1
    goto :eof

:promptyn
    set /p "choice=%~1 (y/n): "
    if /i "!choice!"=="y" exit /b 0
    if /i "!choice!"=="yes" exit /b 0
    if /i "!choice!"=="n" exit /b 1
    if /i "!choice!"=="no" exit /b 1
    echo Please answer yes or no.
    goto :promptyn

:check_command
    where %~1 >nul 2>&1
    if errorlevel 1 (
        call :log_error "%~1 is not installed or not in PATH"
        exit /b 1
    )
    exit /b 0

:check_node_version
    for /f "tokens=1 delims=v" %%a in ('node --version') do set node_version=%%a
    for /f "tokens=1 delims=." %%a in ("!node_version!") do set major_version=%%a
    
    if !major_version! LSS 18 (
        call :log_error "Node.js version 18 or higher is required. Current version: !node_version!"
        exit /b 1
    )
    
    call :log_success "Node.js version !node_version! is compatible"
    exit /b 0

:setup_environment
    call :log_info "Setting up environment files..."
    
    if not exist "backend\.env" (
        if exist "backend\.env.example" (
            copy "backend\.env.example" "backend\.env" >nul
            call :log_success "Created backend/.env from example"
        ) else (
            call :log_warning "backend/.env.example not found, creating basic .env"
            (
                echo PORT=3000
                echo NODE_ENV=development
                echo DATABASE_URL=postgresql://postgres:postgres@localhost:5432/atilio_db
                echo JWT_SECRET=your-secret-key-change-this-in-production
                echo CORS_ORIGIN=http://localhost:3000
            ) > "backend\.env"
        )
    ) else (
        call :log_info "backend/.env already exists"
    )
    
    if not exist "frontend\.env" (
        if exist "frontend\.env.example" (
            copy "frontend\.env.example" "frontend\.env" >nul
            call :log_success "Created frontend/.env from example"
        ) else (
            call :log_info "frontend/.env.example not found, will create when frontend is initialized"
        )
    ) else (
        call :log_info "frontend/.env already exists"
    )
    goto :eof

:setup_backend
    call :log_info "Setting up backend..."
    
    if not exist "backend\node_modules" (
        cd backend
        call :log_info "Installing backend dependencies..."
        call npm install
        if errorlevel 1 (
            call :log_error "Failed to install backend dependencies"
            cd ..
            exit /b 1
        )
        cd ..
        call :log_success "Backend dependencies installed"
    ) else (
        call :log_info "Backend dependencies already installed"
    )
    goto :eof

:setup_frontend
    call :log_info "Setting up frontend..."
    
    if not exist "frontend\node_modules" (
        if exist "frontend\package.json" (
            cd frontend
            call :log_info "Installing frontend dependencies..."
            call npm install
            if errorlevel 1 (
                call :log_error "Failed to install frontend dependencies"
                cd ..
                exit /b 1
            )
            cd ..
            call :log_success "Frontend dependencies installed"
        )
    ) else if not exist "frontend\package.json" (
        call :log_warning "Frontend not initialized yet"
        call :promptyn "Would you like to initialize the frontend with React + Vite?"
        if !errorlevel! EQU 0 (
            cd frontend
            call npx create-vite@latest . --template react-ts
            call npm install
            cd ..
            call :log_success "Frontend initialized with React + Vite + TypeScript"
        )
    ) else (
        call :log_info "Frontend dependencies already installed"
    )
    goto :eof

:wait_for_db
    call :log_info "Waiting for database to be ready..."
    set /a counter=0
    set /a timeout=60
    
    :db_wait_loop
    docker-compose exec -T db pg_isready -U postgres >nul 2>&1
    if !errorlevel! EQU 0 goto :db_ready
    
    set /a counter+=1
    if !counter! GEQ !timeout! (
        call :log_error "Database failed to start within !timeout! seconds"
        exit /b 1
    )
    
    echo|set /p="."
    timeout /t 1 /nobreak >nul
    goto :db_wait_loop
    
    :db_ready
    echo.
    call :log_success "Database is ready"
    goto :eof

:main
cls
echo ======================================
echo   Atilio Project Setup ^& Runner
echo ======================================
echo.

call :log_info "Starting environment validation..."

REM Check prerequisites
call :log_info "Checking prerequisites..."

call :check_command "node"
if errorlevel 1 (
    call :log_error "Please install Node.js (version 18 or higher)"
    pause
    exit /b 1
)

call :check_command "npm"
if errorlevel 1 (
    call :log_error "Please install npm"
    pause
    exit /b 1
)

call :check_command "docker"
if errorlevel 1 (
    call :log_error "Please install Docker Desktop"
    pause
    exit /b 1
)

docker compose version >nul 2>&1
if errorlevel 1 (
    docker-compose --version >nul 2>&1
    if errorlevel 1 (
        call :log_error "Please install Docker Compose"
        pause
        exit /b 1
    )
    set DOCKER_COMPOSE_CMD=docker-compose
) else (
    set DOCKER_COMPOSE_CMD=docker compose
)

REM Check Node.js version
call :check_node_version
if errorlevel 1 (
    pause
    exit /b 1
)

call :log_success "All prerequisites are installed"

REM Setup environment
call :setup_environment

REM Setup projects
call :setup_backend
if errorlevel 1 (
    pause
    exit /b 1
)

call :setup_frontend
if errorlevel 1 (
    pause
    exit /b 1
)

REM Docker setup
call :log_info "Setting up Docker environment..."

if not exist "docker-compose.yml" (
    call :log_error "docker-compose.yml not found!"
    pause
    exit /b 1
)

call :log_info "Building and starting services..."
echo.

REM Start database first
call :log_info "Starting database..."
%DOCKER_COMPOSE_CMD% up -d db

REM Wait for database to be ready
call :wait_for_db
if errorlevel 1 (
    pause
    exit /b 1
)

REM Start backend
call :promptyn "Start backend service?"
if !errorlevel! EQU 0 (
    call :log_info "Starting backend..."
    %DOCKER_COMPOSE_CMD% up -d backend
    
    REM Wait a moment for backend to start
    timeout /t 3 /nobreak >nul
    
    REM Check if backend is healthy
    call :log_info "Checking backend health..."
    curl -f http://localhost:3001/api/v1/health >nul 2>&1
    if !errorlevel! EQU 0 (
        call :log_success "Backend is running and healthy"
    ) else (
        call :log_warning "Backend may still be starting up"
    )
)

REM Start frontend
call :promptyn "Start frontend service?"
if !errorlevel! EQU 0 (
    call :log_info "Starting frontend..."
    %DOCKER_COMPOSE_CMD% up -d frontend
    timeout /t 2 /nobreak >nul
    call :log_success "Frontend service started"
)

REM Show running services
echo.
call :log_info "Running services:"
%DOCKER_COMPOSE_CMD% ps

REM Show access URLs
echo.
call :log_success "Application URLs:"
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:3001
echo   Health:   http://localhost:3001/api/v1/health
echo   Database: localhost:5432
echo.

REM Option to view logs
call :promptyn "View logs?"
if !errorlevel! EQU 0 (
    echo.
    call :log_info "Showing logs (Press Ctrl+C to exit)..."
    %DOCKER_COMPOSE_CMD% logs -f
)

call :log_success "Setup complete!"
echo.
echo Useful commands:
echo   View logs:           %DOCKER_COMPOSE_CMD% logs -f
echo   Stop services:       %DOCKER_COMPOSE_CMD% down
echo   Restart services:    %DOCKER_COMPOSE_CMD% restart
echo   View service status: %DOCKER_COMPOSE_CMD% ps
echo.
pause