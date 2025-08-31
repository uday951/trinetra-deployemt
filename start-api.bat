@echo off
echo Starting Trinetra Security API Server...
cd trinetra-backend
echo.
echo Installing dependencies...
npm install
echo.
echo API Server will start on http://localhost:5000
echo Mobile access: http://192.168.1.5:5000
echo.
echo Available endpoints:
echo   GET  /api/apps/installed - Get installed apps
echo   POST /api/apps/threat-analysis - Analyze app threats
echo   GET  /api/apps/health - Health check
echo.
node server.js