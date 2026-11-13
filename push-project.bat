@echo off
setlocal
cd /d "%~dp0"

where git >nul 2>nul
if errorlevel 1 (
  echo Git was not found. Install Git for Windows and try again.
  goto failed
)

if not exist ".git" (
  echo Initializing a Git repository...
  git init
  if errorlevel 1 goto failed
  git branch -M main
  if errorlevel 1 goto failed
)

git rev-parse --is-inside-work-tree >nul 2>nul
if errorlevel 1 (
  echo This folder is not inside a Git repository.
  goto failed
)

git remote get-url origin >nul 2>nul
if errorlevel 1 (
  set "REMOTE_URL="
  set /p "REMOTE_URL=Enter your Git remote URL: "
  if not defined REMOTE_URL (
    echo A remote URL is required to push.
    goto failed
  )
  git remote add origin "%REMOTE_URL%"
  if errorlevel 1 goto failed
)

set "BRANCH="
for /f "delims=" %%B in ('git branch --show-current 2^>nul') do set "BRANCH=%%B"
if not defined BRANCH (
  git rev-parse --verify HEAD >nul 2>nul
  if not errorlevel 1 (
    echo Git is in detached HEAD state. Check out a branch before pushing.
    goto failed
  )
  git checkout -B main
  if errorlevel 1 goto failed
  set "BRANCH=main"
)

git add -A
if errorlevel 1 goto failed

git diff --cached --quiet
if errorlevel 1 goto commit_changes
echo No new changes to commit.
goto push_changes

:commit_changes
set "COMMIT_MESSAGE="
set /p "COMMIT_MESSAGE=Commit message (leave blank for 'Update project'): "
if not defined COMMIT_MESSAGE set "COMMIT_MESSAGE=Update project"
git commit -m "%COMMIT_MESSAGE%"
if errorlevel 1 goto failed

:push_changes
git rev-parse --verify HEAD >nul 2>nul
if errorlevel 1 (
  echo There is no commit to push.
  goto failed
)

echo Pushing branch %BRANCH% to origin...
git push -u origin "%BRANCH%"
if errorlevel 1 goto failed

echo.
echo Push completed successfully.
goto finish

:failed
echo.
echo Push did not complete. Review the message above and try again.

:finish
pause
exit /b
