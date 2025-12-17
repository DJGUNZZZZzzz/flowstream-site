@echo off
echo ========================================
echo Git Configuration Setup
echo ========================================
echo.

echo Please enter your information:
echo.

set /p git_name="Your Name (e.g., John Doe): "
set /p git_email="Your Email (e.g., john@example.com): "

echo.
echo Setting up Git configuration...
git config --global user.name "%git_name%"
git config --global user.email "%git_email%"

echo.
echo ========================================
echo Configuration Complete!
echo ========================================
echo.
echo Name: %git_name%
echo Email: %git_email%
echo.
echo You can now run deploy-to-github.bat
echo.
pause
