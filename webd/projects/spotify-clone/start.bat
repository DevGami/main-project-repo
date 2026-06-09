@echo off
echo.
echo  ================================================
echo   Spotify Clone - Starting local server...
echo  ================================================
echo.
echo  Open your browser at: http://localhost:5500
echo  Press Ctrl+C to stop the server.
echo.
start "" http://localhost:5500
python -m http.server 5500
pause
