@echo off
REM FinanceFlow Pro Docker Management Scripts for Windows

setlocal enabledelayedexpansion

REM Colors (limited in Windows CMD)
set "INFO=[INFO]"
set "SUCCESS=[SUCCESS]"
set "WARNING=[WARNING]"
set "ERROR=[ERROR]"

REM Function to check if Docker is running
:check_docker
docker info >nul 2>&1
if errorlevel 1 (
    echo %ERROR% Docker is not running. Please start Docker Desktop and try again.
    exit /b 1
)
echo %SUCCESS% Docker is running
goto :eof

REM Development environment
:dev_start
echo %INFO% Starting FinanceFlow Pro in development mode...
call :check_docker
if errorlevel 1 exit /b 1

REM Copy environment file if it doesn't exist
if not exist "docker\.env" (
    echo %WARNING% Creating docker\.env from example...
    copy "docker\.env.example" "docker\.env" >nul
    echo %WARNING% Please update docker\.env with your configuration
)

docker-compose --env-file docker\.env up --build -d
if errorlevel 1 (
    echo %ERROR% Failed to start development environment
    exit /b 1
)

echo %SUCCESS% Development environment started!
echo %INFO% Frontend: http://localhost:3000
echo %INFO% Backend: http://localhost:5000
echo %INFO% MongoDB: localhost:27017
echo %INFO% Redis: localhost:6379
goto :eof

REM Production environment
:prod_start
echo %INFO% Starting FinanceFlow Pro in production mode...
call :check_docker
if errorlevel 1 exit /b 1

REM Check if production env file exists
if not exist "docker\.env" (
    echo %ERROR% docker\.env file not found. Please create it from docker\.env.example
    exit /b 1
)

docker-compose -f docker-compose.prod.yml --env-file docker\.env up --build -d
if errorlevel 1 (
    echo %ERROR% Failed to start production environment
    exit /b 1
)

echo %SUCCESS% Production environment started!
echo %INFO% Application: http://localhost:5000
echo %INFO% Nginx: http://localhost:80
goto :eof

REM Stop all services
:stop_all
echo %INFO% Stopping all FinanceFlow Pro services...
docker-compose down
docker-compose -f docker-compose.prod.yml down
echo %SUCCESS% All services stopped
goto :eof

REM Clean up everything
:cleanup
echo %INFO% Cleaning up FinanceFlow Pro containers and volumes...
docker-compose down -v --remove-orphans
docker-compose -f docker-compose.prod.yml down -v --remove-orphans
docker system prune -f
echo %SUCCESS% Cleanup completed
goto :eof

REM View logs
:logs
if "%~2"=="" (
    echo %INFO% Showing logs for all services...
    docker-compose logs -f
) else (
    echo %INFO% Showing logs for %~2...
    docker-compose logs -f %~2
)
goto :eof

REM Database backup
:backup_db
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "backup_name=financeflow-backup-%dt:~0,8%_%dt:~8,6%"
echo %INFO% Creating database backup: %backup_name%

docker exec financeflow-mongodb mongodump --db financeflow-pro --out /tmp/%backup_name%
if not exist "backups" mkdir backups
docker cp financeflow-mongodb:/tmp/%backup_name% ./backups/

echo %SUCCESS% Database backup created: ./backups/%backup_name%
goto :eof

REM Database restore
:restore_db
if "%~2"=="" (
    echo %ERROR% Please provide backup path: docker-scripts.bat restore ^<backup-path^>
    exit /b 1
)

echo %INFO% Restoring database from: %~2
docker cp "%~2" financeflow-mongodb:/tmp/restore
docker exec financeflow-mongodb mongorestore --db financeflow-pro --drop /tmp/restore/financeflow-pro

echo %SUCCESS% Database restored successfully
goto :eof

REM Health check
:health_check
echo %INFO% Checking FinanceFlow Pro health...

REM Check backend health
curl -f http://localhost:5000/api/health >nul 2>&1
if errorlevel 1 (
    echo %ERROR% Backend is not responding
) else (
    echo %SUCCESS% Backend is healthy
)

REM Check frontend (development)
curl -f http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo %WARNING% Frontend is not responding (may be in production mode)
) else (
    echo %SUCCESS% Frontend is healthy
)

REM Check database
docker exec financeflow-mongodb mongosh --eval "db.adminCommand('ping')" >nul 2>&1
if errorlevel 1 (
    echo %ERROR% Database is not responding
) else (
    echo %SUCCESS% Database is healthy
)
goto :eof

REM Show help
:show_help
echo FinanceFlow Pro Docker Management Script for Windows
echo.
echo Usage: docker-scripts.bat [COMMAND]
echo.
echo Commands:
echo   dev-start     Start development environment
echo   prod-start    Start production environment
echo   stop          Stop all services
echo   cleanup       Stop and remove all containers, volumes
echo   logs [service] Show logs for all services or specific service
echo   backup        Create database backup
echo   restore ^<path^> Restore database from backup
echo   health        Check application health
echo   help          Show this help message
echo.
echo Examples:
echo   docker-scripts.bat dev-start
echo   docker-scripts.bat logs backend
echo   docker-scripts.bat backup
echo   docker-scripts.bat restore ./backups/backup-folder
goto :eof

REM Main script logic
if "%~1"=="dev-start" goto dev_start
if "%~1"=="dev" goto dev_start
if "%~1"=="prod-start" goto prod_start
if "%~1"=="prod" goto prod_start
if "%~1"=="stop" goto stop_all
if "%~1"=="cleanup" goto cleanup
if "%~1"=="clean" goto cleanup
if "%~1"=="logs" goto logs
if "%~1"=="backup" goto backup_db
if "%~1"=="restore" goto restore_db
if "%~1"=="health" goto health_check
if "%~1"=="status" goto health_check
if "%~1"=="help" goto show_help
if "%~1"=="-h" goto show_help
if "%~1"=="--help" goto show_help

echo %ERROR% Unknown command: %~1
echo.
call :show_help
exit /b 1
