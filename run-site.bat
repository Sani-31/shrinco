@echo off
setlocal
cd /d "%~dp0"

where py >nul 2>nul
if not errorlevel 1 (
  set "PYTHON=py"
) else (
  where python >nul 2>nul
  if errorlevel 1 (
    echo Python was not found. Install Python 3 and try again.
    pause
    exit /b 1
  )
  set "PYTHON=python"
)

curl.exe --silent --fail "http://127.0.0.1:8000/" | findstr /I /C:"Shrinco" >nul
if not errorlevel 1 goto open_site

start "Shrinco local server" /min "%ComSpec%" /k "cd /d ""%~dp0"" && %PYTHON% -m http.server 8000 --bind 127.0.0.1"

for /l %%i in (1,1,15) do (
  curl.exe --silent --fail "http://127.0.0.1:8000/" | findstr /I /C:"Shrinco" >nul
  if not errorlevel 1 goto open_site
  timeout /t 1 /nobreak >nul
)

echo Could not start the Shrinco site on port 8000.
echo Check whether another application is using that port.
pause
exit /b 1

:open_site
start "" "http://127.0.0.1:8000/"
exit /b 0
