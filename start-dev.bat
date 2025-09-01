@echo off
REM Start the development environment for sBTCPay

echo Starting sBTCPay development environment...

REM Start Docker containers
echo Starting Docker containers...
cd docker
"C:\Program Files\Docker\Docker\resources\bin\docker-compose.exe" up -d
cd ..

REM Wait for containers to be ready
echo Waiting for containers to be ready...
timeout /t 10 /nobreak >nul

REM Initialize database
echo Initializing database...
cd backend
npm run init-db

REM Start development server
echo Starting development server...
npm run dev