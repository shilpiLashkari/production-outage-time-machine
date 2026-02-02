@echo off
echo Starting Production Outage Time-Machine Services...

start "API Gateway" cmd /k "cd backend\api-gateway-node && npm start"
start "Ingestion Service" cmd /k "cd backend\ingestion-node && npm start"
start "Auth Service" cmd /k "cd backend\auth-node && npm start"
start "Replay Engine" cmd /k "cd backend\replay-engine-node && npm start"

start "Realtime Server" cmd /k "cd backend\realtime-server && npm start"

echo Starting Frontends...
start "Angular Admin" cmd /k "cd frontend\angular-admin && npm start"
start "React Analytics" cmd /k "cd frontend\react-analytics && npm start"

echo All services started!
echo - Admin: http://localhost:4200
echo - Analytics: http://localhost:3000
echo - Realtime Server: http://localhost:3001
