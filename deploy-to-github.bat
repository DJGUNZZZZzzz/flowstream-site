@echo off
echo ========================================
echo FlowStream - Simple GitHub Deployment
echo ========================================
echo.

REM Step 1: Initialize Git (if needed)
if not exist .git (
    echo [1/6] Initializing Git repository...
    git init
    echo Done!
    echo.
) else (
    echo [1/6] Git already initialized
    echo.
)

REM Step 2: Add all files
echo [2/6] Adding all files...
git add .
echo Done!
echo.

REM Step 3: Commit
echo [3/6] Creating commit...
git commit -m "Deploy FlowStream to GitHub Pages"
echo Done!
echo.

REM Step 4: Check for remote
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo [4/6] Setting up GitHub connection...
    echo.
    echo IMPORTANT: Before continuing, you need to:
    echo 1. Go to https://github.com
    echo 2. Create a new repository called "flowstream-site"
    echo 3. Make it PUBLIC
    echo 4. Copy the repository URL
    echo.
    echo Example URL: https://github.com/YOUR-USERNAME/flowstream-site.git
    echo.
    set /p repo_url="Paste your repository URL here: "
    
    git remote add origin %repo_url%
    echo Done!
    echo.
) else (
    echo [4/6] GitHub connection already set up
    echo.
)

REM Step 5: Rename branch to main
echo [5/6] Preparing branch...
git branch -M main
echo Done!
echo.

REM Step 6: Push to GitHub
echo [6/6] Uploading to GitHub...
echo (You may be asked to log in)
echo.
git push -u origin main

if errorlevel 1 (
    echo.
    echo ========================================
    echo ERROR: Push failed
    echo ========================================
    echo.
    echo This might be because:
    echo 1. You haven't created the GitHub repository yet
    echo 2. The repository URL is incorrect
    echo 3. You need to log in to GitHub
    echo.
    echo Please:
    echo 1. Create repository at https://github.com/new
    echo 2. Run this script again
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS! Deployment Complete!
echo ========================================
echo.
echo Next steps:
echo.
echo 1. Go to your GitHub repository
echo 2. Click "Settings"
echo 3. Click "Pages" in the left sidebar
echo 4. Under "Source", select "main" branch
echo 5. Click "Save"
echo 6. Wait 2-5 minutes
echo.
echo Your site will be live at:
echo https://YOUR-USERNAME.github.io/flowstream-site/
echo.
echo Use this URL for Ready Player Me registration!
echo.
pause
