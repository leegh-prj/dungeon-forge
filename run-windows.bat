@echo off
cd /d "%~dp0"
where godot.exe >nul 2>nul
if %errorlevel%==0 (godot.exe --path "%~dp0" -e & exit /b)
where godot4.exe >nul 2>nul
if %errorlevel%==0 (godot4.exe --path "%~dp0" -e & exit /b)
echo Godot 4 not found in PATH. Download it at https://godotengine.org/download/
pause
