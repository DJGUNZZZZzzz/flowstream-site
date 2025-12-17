@echo off
echo ========================================
echo Fix GitHub Repository URL
echo ========================================
echo.
echo The old repository URL has been removed.
echo.
echo Please enter your CORRECT GitHub repository URL:
echo Example: https://github.com/YOUR-USERNAME/flowstream-site.git
echo.
set /p correct_url="Repository URL: "

echo.
echo Adding correct repository...
git remote add origin %correct_url%

echo.
echo Verifying...
git remote -v

echo.
echo ========================================
echo Repository URL Updated!
echo ========================================
echo.
echo You can now run deploy-to-github.bat again
echo.
pause
