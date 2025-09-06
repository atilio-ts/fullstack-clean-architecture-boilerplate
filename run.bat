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
    
    if !major_version! LSS 22 (
        call :log_error "Node.js version 22 or higher is required. Current version: !node_version!"
        call :log_error "This project requires Node.js 22+ for Vite compatibility"
        exit /b 1
    )
    
    call :log_success "Node.js version !node_version! is compatible"
    exit /b 0

:setup_environment
    call :log_info "Setting up environment files..."
    
    REM Always check and create/update .env files
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
        call :log_success "backend/.env exists and ready"
    )
    
    if not exist "frontend\.env" (
        if exist "frontend\.env.example" (
            copy "frontend\.env.example" "frontend\.env" >nul
            call :log_success "Created frontend/.env from example"
        ) else (
            call :log_info "frontend/.env not needed for current setup"
        )
    ) else (
        call :log_success "frontend/.env exists and ready"
    )
    goto :eof

:setup_backend
    call :log_info "Checking backend setup..."
    
    if not exist "backend\node_modules" (
        call :promptyn "Backend dependencies not found. Install now?"
        if !errorlevel! EQU 0 (
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
            call :log_warning "Skipping backend dependency installation"
        )
    ) else (
        call :log_success "Backend dependencies are installed"
        call :promptyn "Reinstall backend dependencies?"
        if !errorlevel! EQU 0 (
            cd backend
            call :log_info "Reinstalling backend dependencies..."
            if exist "node_modules" rmdir /s /q "node_modules"
            if exist "package-lock.json" del "package-lock.json"
            call npm install
            if errorlevel 1 (
                call :log_error "Failed to reinstall backend dependencies"
                cd ..
                exit /b 1
            )
            cd ..
            call :log_success "Backend dependencies reinstalled"
        )
    )
    goto :eof

:setup_frontend
    call :log_info "Checking frontend setup..."
    
    if not exist "frontend\node_modules" (
        if exist "frontend\package.json" (
            call :promptyn "Frontend dependencies not found. Install now?"
            if !errorlevel! EQU 0 (
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
            ) else (
                call :log_warning "Skipping frontend dependency installation"
            )
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
        call :log_success "Frontend dependencies are installed"
        call :promptyn "Reinstall frontend dependencies?"
        if !errorlevel! EQU 0 (
            cd frontend
            call :log_info "Reinstalling frontend dependencies..."
            if exist "node_modules" rmdir /s /q "node_modules"
            if exist "package-lock.json" del "package-lock.json"
            call npm install
            if errorlevel 1 (
                call :log_error "Failed to reinstall frontend dependencies"
                cd ..
                exit /b 1
            )
            cd ..
            call :log_success "Frontend dependencies reinstalled"
        )
    )
    goto :eof


:print_banner
    echo.
    echo ================================================================
    echo                  ATILIO PROJECT SETUP ^& RUNNER
    echo ================================================================
    echo.
    goto :eof

:print_section
    echo.
    echo +----------------------------------------------------------+
    echo ^| %~1
    echo +----------------------------------------------------------+
    echo.
    goto :eof

:main
cls
call :print_banner
call :print_section "STEP 1: ENVIRONMENT VALIDATION"

call :log_info "Checking system requirements..."

REM Check prerequisites
call :log_info "Checking prerequisites..."

call :check_command "node"
if errorlevel 1 (
    call :log_error "Please install Node.js (version 22 or higher)"
    call :log_error "Visit: https://nodejs.org/"
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

call :print_section "STEP 2: ENVIRONMENT SETUP"
call :setup_environment

call :print_section "STEP 3: PROJECT DEPENDENCIES"
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

call :print_section "STEP 4: DOCKER ENVIRONMENT SETUP"

if not exist "docker-compose.yml" (
    call :log_error "docker-compose.yml not found!"
    pause
    exit /b 1
)

call :log_success "docker-compose.yml found"

REM Always ask about Docker operations
call :promptyn "Clean up and rebuild Docker containers?"
if !errorlevel! EQU 0 (
    call :log_info "Stopping and removing existing containers..."
    %DOCKER_COMPOSE_CMD% down --remove-orphans --volumes >nul 2>&1
    
    call :log_info "Building Docker images (this may take a few minutes)..."
    %DOCKER_COMPOSE_CMD% build --no-cache --force-rm
    call :log_success "Docker images built successfully"
) else (
    call :log_info "Skipping Docker rebuild - using existing images"
    REM Still stop containers to restart fresh
    call :log_info "Stopping existing containers for fresh start..."
    %DOCKER_COMPOSE_CMD% down >nul 2>&1
)

call :print_section "STEP 5: STARTING SERVICES"

call :promptyn "Start all services now?"
if !errorlevel! EQU 0 (
    call :log_info "Starting database service..."
) else (
    call :log_info "Service startup cancelled by user"
    pause
    exit /b 0
)
%DOCKER_COMPOSE_CMD% up -d db

call :log_info "Waiting for database to be ready..."
echo|set /p="Checking database connectivity"
set /a counter=0
set /a timeout=60

:db_wait_loop_main
docker-compose exec -T db pg_isready -U postgres >nul 2>&1
if !errorlevel! EQU 0 goto :db_ready_main

set /a counter+=1
if !counter! GEQ !timeout! (
    echo.
    call :log_error "Database failed to start within !timeout! seconds"
    call :log_error "Please check Docker logs: %DOCKER_COMPOSE_CMD% logs db"
    pause
    exit /b 1
)

echo|set /p="."
timeout /t 1 /nobreak >nul
goto :db_wait_loop_main

:db_ready_main
echo.
call :log_success "Database is ready and accepting connections"

call :log_info "Starting backend service..."
%DOCKER_COMPOSE_CMD% up -d backend

call :log_info "Waiting for backend to be ready..."
timeout /t 5 /nobreak >nul
echo|set /p="Checking backend health"
set /a health_counter=0
:backend_health_loop
curl -f http://localhost:3001/api/v1/health >nul 2>&1
if !errorlevel! EQU 0 (
    echo.
    call :log_success "Backend is running and healthy"
    goto :backend_ready
)
echo|set /p="."
timeout /t 2 /nobreak >nul
set /a health_counter+=1
if !health_counter! LSS 12 goto :backend_health_loop
echo.
call :log_warning "Backend health check failed - service may still be starting"
call :log_warning "Check logs with: %DOCKER_COMPOSE_CMD% logs backend"

:backend_ready
call :log_info "Starting frontend service..."
%DOCKER_COMPOSE_CMD% up -d frontend
timeout /t 3 /nobreak >nul
call :log_success "Frontend service started"

call :log_info "All services are now running!"

call :print_section "STEP 6: SERVICE STATUS ^& ACCESS INFORMATION"

call :log_info "Running services:"
%DOCKER_COMPOSE_CMD% ps

echo.
echo APPLICATION ACCESS URLS
echo -----------------------------------------------------------
echo   Frontend:     http://localhost:3000
echo   Backend API:  http://localhost:3001
echo   Health Check: http://localhost:3001/api/v1/health
echo   API Docs:     http://localhost:3001/api/v1/docs
echo   Database:     localhost:5432 (user: postgres)
echo -----------------------------------------------------------
echo.

call :print_section "SETUP COMPLETE!"

call :log_success "All services are running successfully!"
echo.
echo USEFUL COMMANDS
echo -----------------------------------------------------------
echo   View logs:           %DOCKER_COMPOSE_CMD% logs -f [service]
echo   Stop services:       %DOCKER_COMPOSE_CMD% down
echo   Restart services:    %DOCKER_COMPOSE_CMD% restart [service]
echo   Service status:      %DOCKER_COMPOSE_CMD% ps
echo   Backend logs only:   %DOCKER_COMPOSE_CMD% logs -f backend
echo   Frontend logs only:  %DOCKER_COMPOSE_CMD% logs -f frontend
echo   Rebuild everything:  run.bat (run this script again)
echo -----------------------------------------------------------
echo.

REM Always show current service status
call :log_info "Current service status:"
%DOCKER_COMPOSE_CMD% ps
echo.

call :promptyn "View live logs now?"
if !errorlevel! EQU 0 (
    echo.
    call :log_info "Showing live logs (Press Ctrl+C to exit)..."
    %DOCKER_COMPOSE_CMD% logs -f
)

echo.
pause