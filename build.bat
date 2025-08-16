@echo off
echo Building SirenX Desktop Application...
echo.

echo Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Building application...
call npm run build
if %errorlevel% neq 0 (
    echo Error: Build failed
    pause
    exit /b 1
)

echo.
echo Creating Windows executable...
call npm run dist:win
if %errorlevel% neq 0 (
    echo Error: Failed to create executable
    pause
    exit /b 1
)

echo.
echo Build completed successfully!
echo Executable can be found in the 'release' folder
pause
