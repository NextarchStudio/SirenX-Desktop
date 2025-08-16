@echo off
echo Starting SirenX Desktop Development Environment...
echo.

echo Installing dependencies if needed...
call npm install

echo.
echo Starting development server...
echo This will open both the Electron app and Vite dev server
echo.
echo Press Ctrl+C to stop the development server
echo.

call npm run dev

pause
