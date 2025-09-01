#!/bin/bash

# Start the development environment for sBTCPay

echo "Starting sBTCPay development environment..."

# Start Docker containers
echo "Starting Docker containers..."
cd docker
"C:\Program Files\Docker\Docker\resources\bin\docker-compose.exe" up -d
cd ..

# Wait for containers to be ready
echo "Waiting for containers to be ready..."
sleep 10

# Initialize database
echo "Initializing database..."
cd backend
npm run init-db

# Start development server
echo "Starting development server..."
npm run dev